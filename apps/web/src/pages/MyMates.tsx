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
            <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
                <Loader2 className="animate-spin" style={{ color: "#ff385c", width: 32, height: 32 }} />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl px-6 md:px-10" style={{ paddingTop: 48, paddingBottom: 64 }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#222222" }}>My Mates</h1>
                    {mates.length > 0 && (
                        <p style={{ fontSize: 14, color: "#6a6a6a", marginTop: 4 }}>
                            {mates.length} mate{mates.length === 1 ? "" : "s"}
                        </p>
                    )}
                </div>
                <Link
                    to="/invite"
                    className="flex items-center gap-2 transition-colors"
                    style={{
                        backgroundColor: "#ff385c",
                        color: "#ffffff",
                        borderRadius: 8,
                        padding: "14px 20px",
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e00b41")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff385c")}
                >
                    Invite a Mate
                </Link>
            </div>

            {mates.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center text-center"
                    style={{
                        border: "1.5px dashed #dddddd",
                        borderRadius: 14,
                        padding: "64px 24px",
                    }}
                >
                    <Users className="h-10 w-10 mb-4" style={{ color: "#dddddd" }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#222222", marginBottom: 6 }}>
                        No mates yet
                    </p>
                    <p style={{ fontSize: 14, color: "#6a6a6a", marginBottom: 24 }}>
                        Invite your friends to get started.
                    </p>
                    <Link
                        to="/invite"
                        style={{
                            backgroundColor: "#ff385c",
                            color: "#ffffff",
                            borderRadius: 8,
                            padding: "14px 24px",
                            fontSize: 16,
                            fontWeight: 500,
                            textDecoration: "none",
                        }}
                    >
                        Invite Friends
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mates.map((mate) => (
                        <MateCard key={mate.id} mate={mate} />
                    ))}
                </div>
            )}
        </div>
    )
}
