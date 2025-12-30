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
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [generatedLink, setGeneratedLink] = useState('')

    // Mode: "accept" if token exists, "create" if not
    const mode = token ? 'accept' : 'create'

    useEffect(() => {
        if (mode === 'create' || !session) return

        const acceptInvite = async () => {
            setStatus('loading')
            setMessage('Processing invite...')
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
                    setMessage('You are now mates! Redirecting to dashboard...')
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

        if (token) acceptInvite()
    }, [token, session, navigate, mode])

    const handleCreateInvite = async () => {
        if (!session) return
        setStatus('loading')
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            const data = await res.json()
            if (data.token) {
                const link = `${window.location.origin}/invite?token=${data.token}`
                await navigator.clipboard.writeText(link)
                setGeneratedLink(link)
                setStatus('success')
                setMessage('Invite link copied to clipboard!')
            }
        } catch (e) {
            console.error(e)
            setStatus('error')
            setMessage('Failed to generate invite')
        }
    }

    if (mode === 'create') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Invite a Mate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <p className="text-muted-foreground">
                            Generate a unique link to invite your friends to Mates Rates.
                        </p>

                        {status === 'success' && (
                            <div className="bg-muted p-3 rounded-md w-full break-all text-sm font-mono border">
                                {generatedLink}
                            </div>
                        )}

                        <Button onClick={handleCreateInvite} disabled={status === 'loading'} className="w-full">
                            {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {status === 'success' ? 'Copy Link Again' : 'Generate Invite Link'}
                        </Button>

                        {message && (
                            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                {message}
                            </p>
                        )}

                        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

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
