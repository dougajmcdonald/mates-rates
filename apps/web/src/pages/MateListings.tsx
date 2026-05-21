import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

function ListingCard({ item }: { item: any }) {
    const [current, setCurrent] = useState(0)
    const images: string[] = item.images || []

    return (
        <Link to={`/listings/${item.id}`} className="group block">
            <div
                className="overflow-hidden transition-all duration-200 group-hover:shadow-card-hover"
                style={{ borderRadius: 14 }}
            >
                {/* Photo */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#f2f2f2]" style={{ borderRadius: 14 }}>
                    {images.length > 0 ? (
                        <>
                            <img
                                src={images[current]}
                                alt={`${item.title} ${current + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setCurrent((c) => (c - 1 + images.length) % images.length) }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            backgroundColor: "#ffffff",
                                            border: "none", cursor: "pointer",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                                        }}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" style={{ color: "#222222" }} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setCurrent((c) => (c + 1) % images.length) }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            backgroundColor: "#ffffff",
                                            border: "none", cursor: "pointer",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                                        }}
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" style={{ color: "#222222" }} />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center" style={{ color: "#929292", fontSize: 13 }}>
                            No image
                        </div>
                    )}

                    {/* Price badge */}
                    <div
                        className="absolute top-3 right-3 px-2 py-1"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.92)",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#222222",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        £{(item.price / 100).toFixed(2)}
                    </div>
                </div>

                {/* Meta */}
                <div className="pt-3 pb-1 px-0.5">
                    <div
                        className="truncate"
                        style={{ fontSize: 14, fontWeight: 600, color: "#222222", lineHeight: 1.25 }}
                    >
                        {item.title}
                    </div>
                    <div
                        className="capitalize mt-0.5"
                        style={{ fontSize: 14, color: "#6a6a6a", lineHeight: 1.43 }}
                    >
                        {item.category}
                    </div>
                    {item.description && (
                        <div
                            className="mt-1 line-clamp-2"
                            style={{ fontSize: 13, color: "#929292", lineHeight: 1.4 }}
                        >
                            {item.description}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default function MateListings() {
    const { id } = useParams()
    const { session } = useAuth()
    const navigate = useNavigate()
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchListings = async () => {
            if (!session?.access_token || !id) return
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/listings`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                })
                const data = await res.json()
                setListings(data.listings || [])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchListings()
    }, [session, id])

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
                <Loader2 className="animate-spin" style={{ color: "#ff385c", width: 32, height: 32 }} />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-5xl px-6 md:px-10" style={{ paddingTop: 40, paddingBottom: 64 }}>
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 14, color: "#222222", fontWeight: 400, padding: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#6a6a6a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#222222")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#222222" }}>Mate's Listings</h1>
                {listings.length > 0 && (
                    <span
                        className="px-2.5 py-0.5"
                        style={{
                            fontSize: 12, fontWeight: 600, color: "#6a6a6a",
                            backgroundColor: "#f2f2f2", borderRadius: 9999,
                        }}
                    >
                        {listings.length}
                    </span>
                )}
            </div>

            {listings.length === 0 ? (
                <div
                    className="text-center"
                    style={{
                        border: "1.5px dashed #dddddd",
                        borderRadius: 14,
                        padding: "64px 24px",
                    }}
                >
                    <p style={{ fontSize: 16, color: "#6a6a6a" }}>This mate hasn't listed anything yet.</p>
                    <Link
                        to="/mates"
                        style={{ fontSize: 14, color: "#ff385c", marginTop: 16, display: "inline-block" }}
                    >
                        Back to Mates
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: 16 }}>
                    {listings.map((item) => (
                        <ListingCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}
