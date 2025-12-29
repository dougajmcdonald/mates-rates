import 'dotenv/config'
import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'
import { HTTPException } from 'hono/http-exception'

type Env = {
    Variables: {
        user: any
    }
}

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
        throw new HTTPException(401, { message: 'Missing Authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        throw new HTTPException(401, { message: 'Invalid token' })
    }

    c.set('user', user)
    await next()
})
