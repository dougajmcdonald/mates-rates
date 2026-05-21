import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { ListingMessages } from "@/components/ListingMessages"
import { OfferModal } from "@/components/OfferModal"

type Listing = {
    id: number
    userId: string
    title: string
    description: string
    price: number
    category: string
    images: string[]
    status: string
    seller: {
        name: string | null
        avatarUrl: string | null
    }
}

function ImageGallery({ images, title }: { images: string[]; title: string }) {
    const [current, setCurrent] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div
                className="w-full aspect-square flex items-center justify-center"
                style={{ backgroundColor: "#f2f2f2", borderRadius: 14, color: "#929292", fontSize: 14 }}
            >
                No image
            </div>
        )
    }

    return (
        <div className="relative w-full aspect-square overflow-hidden" style={{ borderRadius: 14 }}>
            <img
                src={images[current]}
                alt={`${title} ${current + 1}`}
                className="h-full w-full object-cover"
            />
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors"
                        style={{
                            width: 32, height: 32, borderRadius: "50%",
                            backgroundColor: "#ffffff",
                            border: "none", cursor: "pointer",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                        }}
                    >
                        <ChevronLeft className="h-4 w-4" style={{ color: "#222222" }} />
                    </button>
                    <button
                        onClick={() => setCurrent((c) => (c + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors"
                        style={{
                            width: 32, height: 32, borderRadius: "50%",
                            backgroundColor: "#ffffff",
                            border: "none", cursor: "pointer",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                        }}
                    >
                        <ChevronRight className="h-4 w-4" style={{ color: "#222222" }} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className="transition-all"
                                style={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    backgroundColor: i === current ? "#222222" : "rgba(255,255,255,0.7)",
                                    border: "none", cursor: "pointer", padding: 0,
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default function ListingDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { session, user } = useAuth()
    const [listing, setListing] = useState<Listing | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.access_token && id) {
            fetch(`${import.meta.env.VITE_API_URL}/api/listings`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    const found = data.listings?.find((l: any) => l.id === Number(id))
                    setListing(found || null)
                })
                .finally(() => setLoading(false))
        }
    }, [id, session])

    const handleDelete = async () => {
        if (!listing || !confirm("Are you sure you want to delete this listing?")) return
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${listing.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.access_token}` },
            })
            if (res.ok) {
                navigate("/dashboard")
            } else {
                alert("Failed to delete listing")
            }
        } catch (e) {
            console.error(e)
            alert("Error deleting listing")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
                <Loader2 className="animate-spin" style={{ color: "#ff385c", width: 32, height: 32 }} />
            </div>
        )
    }
    if (!listing) {
        return <div className="p-8" style={{ color: "#6a6a6a" }}>Listing not found</div>
    }

    const isOwner = user?.id === listing.userId

    return (
        <div className="mx-auto max-w-5xl px-6 md:px-10" style={{ paddingTop: 32, paddingBottom: 64 }}>
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 mb-6 transition-colors"
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, color: "#222222", fontWeight: 400, padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6a6a6a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#222222")}
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Left — images */}
                <div>
                    <ImageGallery images={listing.images} title={listing.title} />
                </div>

                {/* Right — details + reservation card */}
                <div className="flex flex-col gap-6">
                    {/* Title & category */}
                    <div>
                        <p
                            className="capitalize mb-1"
                            style={{ fontSize: 13, color: "#6a6a6a", fontWeight: 400 }}
                        >
                            {listing.category}
                        </p>
                        <h1 style={{ fontSize: 22, fontWeight: 500, color: "#222222", lineHeight: 1.18 }}>
                            {listing.title}
                        </h1>
                    </div>

                    {/* Seller */}
                    {listing.seller?.name && (
                        <div
                            className="flex items-center gap-3 pb-5"
                            style={{ borderBottom: "1px solid #ebebeb" }}
                        >
                            {listing.seller.avatarUrl ? (
                                <img
                                    src={listing.seller.avatarUrl}
                                    className="h-10 w-10 rounded-full object-cover"
                                    style={{ border: "1px solid #dddddd" }}
                                    alt={listing.seller.name}
                                />
                            ) : (
                                <div
                                    className="h-10 w-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "#f2f2f2", fontSize: 14, fontWeight: 600, color: "#222222" }}
                                >
                                    {listing.seller.name[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#222222" }}>
                                    {listing.seller.name}
                                </p>
                                <p style={{ fontSize: 13, color: "#6a6a6a" }}>Selling for mates</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div style={{ borderBottom: "1px solid #ebebeb", paddingBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#222222", marginBottom: 10 }}>
                            About this item
                        </h3>
                        <p
                            className="whitespace-pre-wrap"
                            style={{ fontSize: 16, color: "#3f3f3f", lineHeight: 1.5 }}
                        >
                            {listing.description}
                        </p>
                    </div>

                    {/* Reservation card */}
                    <div
                        className="bg-white"
                        style={{
                            border: "1px solid #dddddd",
                            borderRadius: 14,
                            padding: 24,
                            boxShadow: "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0",
                        }}
                    >
                        <div className="flex items-baseline justify-between mb-5">
                            <span style={{ fontSize: 21, fontWeight: 700, color: "#222222" }}>
                                £{(listing.price / 100).toFixed(2)}
                            </span>
                            <span
                                className="capitalize"
                                style={{ fontSize: 13, color: "#6a6a6a" }}
                            >
                                {listing.status || "available"}
                            </span>
                        </div>

                        {isOwner ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/listings/${listing.id}/edit`)}
                                    className="flex-1 transition-colors"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        color: "#222222",
                                        border: "1px solid #222222",
                                        borderRadius: 8,
                                        padding: "13px 0",
                                        fontSize: 16,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        lineHeight: 1.25,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 transition-colors"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        color: "#c13515",
                                        border: "1px solid #c13515",
                                        borderRadius: 8,
                                        padding: "13px 0",
                                        fontSize: 16,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        lineHeight: 1.25,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff5f3")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                                >
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <OfferModal listingId={listing.id} ListingTitle={listing.title} />
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{ marginTop: 48, borderTop: "1px solid #ebebeb", paddingTop: 40 }}>
                <ListingMessages listingId={listing.id} />
            </div>
        </div>
    )
}
