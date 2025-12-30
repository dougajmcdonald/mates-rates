import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { MateCard } from "@/components/MateCard"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function MyMates() {
    const { session } = useAuth()
    const [mates, setMates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMates = async () => {
            if (!session?.access_token) return
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mates`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                })
                const data = await res.json()
                if (data.mates) {
                    setMates(data.mates)
                }
            } catch (error) {
                console.error("Failed to fetch mates", error)
            } finally {
                setLoading(false)
            }
        }

        if (session) fetchMates()
    }, [session])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">My Mates</h1>
            </div>

            {mates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>You haven't added any mates yet.</p>
                    <Link to="/invite">
                        <Button className="mt-4">Invite Friends</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mates.map(mate => (
                        <MateCard key={mate.id} mate={mate} />
                    ))}
                </div>
            )}
        </div>
    )
}
