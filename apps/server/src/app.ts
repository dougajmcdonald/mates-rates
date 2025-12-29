import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import dotenv from 'dotenv'
import { UserRepository } from './repositories/UserRepository'
import { sign, verify } from 'hono/jwt'
import { SocialRepository } from './repositories/SocialRepository'
import { ListingRepository } from './repositories/ListingRepository'

dotenv.config()

const app = new Hono<{ Variables: { user: any } }>()

app.use('/*', cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
}))

app.get('/', (c) => {
    return c.text('Hello Mates Rates!')
})

app.get('/protected', authMiddleware, (c) => {
    const user = c.get('user')
    return c.json({ message: 'You are authenticated!', user })
})

app.post('/users/sync', authMiddleware, async (c) => {
    const user = c.get('user')
    const { email, user_metadata } = user

    // Upsert user into our DB using Supabase ID
    const dbUser = await UserRepository.upsert({
        id: user.id,
        email: email || '',
        name: user_metadata.full_name || user_metadata.name,
        avatarUrl: user_metadata.avatar_url,
    })

    return c.json({ user: dbUser[0] })
})

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY! // Reuse key for simplicity

app.post('/listings', authMiddleware, async (c) => {
    const user = c.get('user')
    const body = await c.req.json()

    // Simple validation (can be improved with Zod validator middleware)
    if (!body.title || !body.price || !body.category) {
        return c.json({ error: 'Missing required fields' }, 400)
    }

    try {
        const listing = await ListingRepository.create({
            userId: user.id,
            title: body.title,
            description: body.description || '',
            price: Number(body.price), // Ensure it's a number (cents)
            category: body.category,
            images: body.images || [],
        })
        return c.json({ listing: listing[0] }, 201)
    } catch (error) {
        console.error('Failed to create listing:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.get('/listings', authMiddleware, async (c) => {
    const user = c.get('user')
    try {
        const items = await ListingRepository.findAll(user.id)
        return c.json({ listings: items })
    } catch (error) {
        console.error('Failed to fetch listings:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.post('/share', authMiddleware, async (c) => {
    const user = c.get('user')
    // Generate a token valid for 7 days
    const token = await sign({
        inviterId: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    }, JWT_SECRET)

    return c.json({ token })
})

app.post('/accept-invite', authMiddleware, async (c) => {
    const user = c.get('user')
    const { token } = await c.req.json()

    try {
        const payload = await verify(token, JWT_SECRET)
        const inviterId = payload.inviterId as string

        if (inviterId === user.id) {
            return c.json({ message: "You can't invite yourself!" }, 400)
        }

        await SocialRepository.createFriendship(user.id, inviterId)
        return c.json({ message: "Friendship created!" })
    } catch (e) {
        return c.json({ error: "Invalid or expired token" }, 400)
    }
})

// Health check (no auth, no db)
app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))



export default app
