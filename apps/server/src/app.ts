import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import dotenv from 'dotenv'
import { UserRepository } from './repositories/UserRepository'
import { sign, verify } from 'hono/jwt'
import { SocialRepository } from './repositories/SocialRepository'
import { ListingRepository } from './repositories/ListingRepository'
import { MessageRepository } from './repositories/MessageRepository'
import { OfferRepository } from './repositories/OfferRepository'
import { PaymentService } from './services/PaymentService'

dotenv.config()

const app = new Hono<{ Variables: { user: any } }>()

app.use('/*', cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
}))

app.get('/', (c) => {
    return c.text('Hello Mates Rates!')
})

app.get('/api/protected', authMiddleware, (c) => {
    const user = c.get('user')
    return c.json({ message: 'You are authenticated!', user })
})

app.post('/api/users/sync', authMiddleware, async (c) => {
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

app.post('/api/listings', authMiddleware, async (c) => {
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

app.get('/api/listings', authMiddleware, async (c) => {
    const user = c.get('user')
    try {
        const items = await ListingRepository.findAll(user.id)
        return c.json({ listings: items })
    } catch (error) {
        console.error('Failed to fetch listings:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.get('/api/listings/:id/messages', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'))
    try {
        const messages = await MessageRepository.findByListingId(id)
        return c.json({ messages })
    } catch (error) {
        console.error('Failed to fetch messages:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.post('/api/listings/:id/messages', authMiddleware, async (c) => {
    const user = c.get('user')
    const id = Number(c.req.param('id'))
    const { content } = await c.req.json()

    if (!content) {
        return c.json({ error: 'Content is required' }, 400)
    }

    try {
        const message = await MessageRepository.create({
            listingId: id,
            senderId: user.id,
            content,
        })
        return c.json({ message: message[0] }, 201)
    } catch (error) {
        console.error('Failed to post message:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

// Offers Routes
app.post('/api/listings/:id/offers', authMiddleware, async (c) => {
    const user = c.get('user')
    const id = Number(c.req.param('id'))
    const { amount } = await c.req.json()

    if (!amount) {
        return c.json({ error: 'Amount is required' }, 400)
    }

    try {
        const offer = await OfferRepository.create({
            listingId: id,
            buyerId: user.id,
            amount: Number(amount),
        })
        return c.json({ offer: offer[0] }, 201)
    } catch (error) {
        console.error('Failed to make offer:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.get('/api/offers/incoming', authMiddleware, async (c) => {
    const user = c.get('user')
    try {
        const offers = await OfferRepository.findIncomingOffers(user.id)
        return c.json({ offers })
    } catch (error) {
        console.error('Failed to fetch offers:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.get('/api/offers/outgoing', authMiddleware, async (c) => {
    const user = c.get('user')
    try {
        const offers = await OfferRepository.findOutgoingOffers(user.id)
        return c.json({ offers })
    } catch (error) {
        console.error('Failed to fetch outgoing offers:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

app.patch('/api/offers/:id/status', authMiddleware, async (c) => {
    // Ideally verify user owns the listing associated with this offer
    const id = Number(c.req.param('id'))
    const { status } = await c.req.json()

    if (status !== 'accepted' && status !== 'declined') {
        return c.json({ error: 'Invalid status' }, 400)
    }

    try {
        const offer = await OfferRepository.updateStatus(id, status)
        return c.json({ offer: offer[0] })
    } catch (e) {
        return c.json({ error: 'Failed to update offer' }, 500)
    }
})

// Payment Routes
app.post('/api/payments/onboard', authMiddleware, async (c) => {
    const user = c.get('user')
    // 1. Check if user already has an account
    const dbUser = (await UserRepository.findById(user.id))[0]
    let accountId = dbUser?.stripeAccountId

    if (!accountId) {
        // 2. Create Express Account if none exists
        try {
            accountId = await PaymentService.createConnectedAccount()
            await UserRepository.updateStripeAccountId(user.id, accountId)
        } catch (e: any) {
            console.error('Stripe Create Account Error:', e)
            return c.json({ error: 'Failed to create payment account' }, 500)
        }
    }

    // 3. Create Account Link
    const refreshUrl = `${process.env.FRONTEND_URL}/dashboard`
    const returnUrl = `${process.env.FRONTEND_URL}/dashboard?onboarding=complete`

    try {
        const accountLink = await PaymentService.createAccountLink(accountId, refreshUrl, returnUrl)
        return c.json({ url: accountLink.url })
    } catch (e: any) {
        console.error('Stripe Link Create Error:', e)
        return c.json({ error: 'Failed to create onboarding link' }, 500)
    }
})

app.post('/api/payments/create-intent', authMiddleware, async (c) => {
    // const user = c.get('user') // Could verify buyer
    const { offerId } = await c.req.json()

    if (!offerId) return c.json({ error: 'Offer ID required' }, 400)

    try {
        const offerData = await OfferRepository.findByIdWithSeller(Number(offerId))
        const offer = offerData[0]

        if (!offer) return c.json({ error: 'Offer not found' }, 404)
        if (!offer.sellerStripeId) return c.json({ error: 'Seller not set up for payments' }, 400)

        // Ensure status is accepted
        if (offer.status !== 'accepted') return c.json({ error: 'Offer not accepted' }, 400)

        const clientSecret = await PaymentService.createPaymentIntent({
            amount: offer.amount,
            currency: 'gbp',
            destinationAccountId: offer.sellerStripeId
        })

        return c.json({ clientSecret })
    } catch (e) {
        console.error('Payment Intent Error:', e)
        return c.json({ error: 'Failed to initialize payment' }, 500)
    }
})

app.post('/api/share', authMiddleware, async (c) => {
    const user = c.get('user')
    // Generate a token valid for 7 days
    const token = await sign({
        inviterId: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    }, JWT_SECRET)

    return c.json({ token })
})

app.post('/api/accept-invite', authMiddleware, async (c) => {
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
app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))



export default app
