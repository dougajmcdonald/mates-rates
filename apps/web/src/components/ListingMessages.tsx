import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send } from "lucide-react"

type Message = {
    id: number
    content: string
    createdAt: string
    senderId: string
    senderName: string | null
    senderAvatar: string | null
}

export function ListingMessages({ listingId }: { listingId: number }) {
    const { session } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (listingId && session?.access_token) {
            fetchMessages()
        }
    }, [listingId, session])

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${listingId}/messages`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            const data = await res.json()
            setMessages(data.messages || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async () => {
        if (!newMessage.trim()) return
        setSending(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${listingId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ content: newMessage })
            })
            const data = await res.json()
            if (data.message) {
                // Optimistically add message or refresh
                // Since the return type of create doesn't include the joined user info, 
                // we might need to construct it or refresh. Refetching is safer for MVP.
                fetchMessages()
                setNewMessage("")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSending(false)
        }
    }

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6 mt-8 p-4 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold">Q&A</h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {messages.length === 0 && <p className="text-muted-foreground text-sm">No questions yet. Ask away!</p>}

                {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 items-start">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.senderAvatar || undefined} />
                            <AvatarFallback>{msg.senderName?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted p-3 rounded-lg text-sm flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold">{msg.senderName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 items-end pt-4 border-t">
                <Textarea
                    placeholder="Ask a question about this item..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px]"
                />
                <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
