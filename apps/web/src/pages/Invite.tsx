import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function Invite() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const { session } = useAuth()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Processing invite...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('No invite token found.')
            return
        }

        if (!session) {
            // Wait for auth to load or redirect to login? 
            // ProtectedRoute handles the redirect generally, 
            // but if we are here, we might be authenticated.
            return
        }

        const acceptInvite = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/accept-invite`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                })

                const data = await res.json()

                if (res.ok) {
                    setStatus('success')
                    setMessage('You are now mates! Redirecting to feed...')
                    setTimeout(() => navigate('/dashboard'), 2000)
                } else {
                    setStatus('error')
                    setMessage(data.error || data.message || 'Failed to accept invite.')
                }
            } catch (e) {
                setStatus('error')
                setMessage('Something went wrong.')
            }
        }

        acceptInvite()
    }, [token, session, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Mates Rates Invite</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                    {status === 'success' && <CheckCircle className="h-10 w-10 text-green-500" />}
                    {status === 'error' && <XCircle className="h-10 w-10 text-red-500" />}

                    <p className="text-lg">{message}</p>

                    {status === 'error' && (
                        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
