import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { MateCard } from "@/components/MateCard"
import { Link } from "react-router-dom"
import { Loader2, Users } from "lucide-react"

export default function MyMates() {
    const { session } = useAuth()
    const [mates, setMates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMates = async () => {
            if (!session?.access_token) return
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mates`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                })
                const data = await res.json()
                if (data.mates) setMates(data.mates)
            } catch (error) {
                console.error("Failed to fetch mates", error)
            } finally {
                setLoading(false)
            }
        }
        if (session) fetchMates()
    }, [session])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl px-6 md:px-10 pt-12 pb-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-bold text-foreground">My Mates</h1>
                    {mates.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {mates.length} mate{mates.length === 1 ? "" : "s"}
                        </p>
                    )}
                </div>
                <Link
                    to="/invite"
                    className="flex items-center gap-2 bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-5 h-12 text-base font-medium no-underline whitespace-nowrap transition-colors"
                >
                    Invite a Mate
                </Link>
            </div>

            {mates.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center border-[1.5px] border-dashed border-border rounded-card py-16 px-6">
                    <Users className="h-10 w-10 mb-4 text-border" />
                    <p className="text-base font-semibold text-foreground mb-1.5">
                        No mates yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Invite your friends to get started.
                    </p>
                    <Link
                        to="/invite"
                        className="bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-6 h-12 text-base font-medium no-underline inline-flex items-center transition-colors"
                    >
                        Invite Friends
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {mates.map((mate) => (
                        <MateCard key={mate.id} mate={mate} />
                    ))}
                </div>
            )}
        </div>
    )
}
