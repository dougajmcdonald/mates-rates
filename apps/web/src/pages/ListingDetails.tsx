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
            <div className="w-full aspect-square flex items-center justify-center bg-accent rounded-card text-muted-soft text-sm">
                No image
            </div>
        )
    }

    return (
        <div className="relative w-full aspect-square overflow-hidden rounded-card">
            <img
                src={images[current]}
                alt={`${title} ${current + 1}`}
                className="h-full w-full object-cover"
            />
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-white shadow border-none cursor-pointer transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 text-foreground" />
                    </button>
                    <button
                        onClick={() => setCurrent((c) => (c + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-white shadow border-none cursor-pointer transition-colors"
                    >
                        <ChevronRight className="h-4 w-4 text-foreground" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 w-1.5 rounded-full border-none cursor-pointer p-0 transition-all ${i === current ? "bg-foreground" : "bg-white/70"}`}
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        )
    }
    if (!listing) {
        return <div className="p-8 text-muted-foreground">Listing not found</div>
    }

    const isOwner = user?.id === listing.userId

    return (
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-8 pb-16">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 mb-6 bg-transparent border-none p-0 cursor-pointer text-sm text-foreground hover:text-muted-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <ImageGallery images={listing.images} title={listing.title} />
                </div>

                <div className="flex flex-col gap-6">
                    <div>
                        <p className="capitalize mb-1 text-[13px] text-muted-foreground">
                            {listing.category}
                        </p>
                        <h1 className="text-[22px] font-medium text-foreground leading-[1.18]">
                            {listing.title}
                        </h1>
                    </div>

                    {listing.seller?.name && (
                        <div className="flex items-center gap-3 pb-5 border-b border-hairline-soft">
                            {listing.seller.avatarUrl ? (
                                <img
                                    src={listing.seller.avatarUrl}
                                    className="h-10 w-10 rounded-full object-cover border border-border"
                                    alt={listing.seller.name}
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-accent text-sm font-semibold text-foreground">
                                    {listing.seller.name[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {listing.seller.name}
                                </p>
                                <p className="text-[13px] text-muted-foreground">Selling for mates</p>
                            </div>
                        </div>
                    )}

                    <div className="border-b border-hairline-soft pb-5">
                        <h3 className="text-base font-semibold text-foreground mb-2.5">
                            About this item
                        </h3>
                        <p className="whitespace-pre-wrap text-base text-body leading-normal">
                            {listing.description}
                        </p>
                    </div>

                    <div className="bg-background border border-border rounded-card p-6 shadow-card-hover">
                        <div className="flex items-baseline justify-between mb-5">
                            <span className="text-[21px] font-bold text-foreground">
                                £{(listing.price / 100).toFixed(2)}
                            </span>
                            <span className="capitalize text-[13px] text-muted-foreground">
                                {listing.status || "available"}
                            </span>
                        </div>

                        {isOwner ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/listings/${listing.id}/edit`)}
                                    className="flex-1 bg-background hover:bg-muted text-foreground border border-foreground rounded-button py-3 text-base font-medium cursor-pointer leading-tight transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-background hover:bg-[#fff5f3] text-destructive border border-destructive rounded-button py-3 text-base font-medium cursor-pointer leading-tight transition-colors"
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

            <div className="mt-12 border-t border-hairline-soft pt-10">
                <ListingMessages listingId={listing.id} />
            </div>
        </div>
    )
}
