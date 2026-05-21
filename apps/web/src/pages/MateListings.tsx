import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

function ListingCard({ item }: { item: any }) {
    const [current, setCurrent] = useState(0)
    const images: string[] = item.images || []

    return (
        <Link to={`/listings/${item.id}`} className="group block">
            <div className="overflow-hidden rounded-card transition-all duration-200 group-hover:shadow-card-hover">
                <div className="relative aspect-square w-full overflow-hidden bg-accent rounded-card">
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
                                        className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-full bg-white shadow border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setCurrent((c) => (c + 1) % images.length) }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-full bg-white shadow border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5 text-foreground" />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-soft text-[13px]">
                            No image
                        </div>
                    )}

                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-button text-[13px] font-semibold text-foreground">
                        £{(item.price / 100).toFixed(2)}
                    </div>
                </div>

                <div className="pt-3 pb-1 px-0.5">
                    <div className="truncate text-sm font-semibold text-foreground leading-tight">
                        {item.title}
                    </div>
                    <div className="capitalize mt-0.5 text-sm text-muted-foreground leading-normal">
                        {item.category}
                    </div>
                    {item.description && (
                        <div className="mt-1 line-clamp-2 text-[13px] text-muted-soft leading-snug">
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
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-10 pb-16">
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer text-sm text-foreground hover:text-muted-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-[28px] font-bold text-foreground">Mate's Listings</h1>
                {listings.length > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-accent rounded-full">
                        {listings.length}
                    </span>
                )}
            </div>

            {listings.length === 0 ? (
                <div className="text-center border-[1.5px] border-dashed border-border rounded-card py-16 px-6">
                    <p className="text-base text-muted-foreground">This mate hasn't listed anything yet.</p>
                    <Link
                        to="/mates"
                        className="text-sm text-primary mt-4 inline-block no-underline hover:underline"
                    >
                        Back to Mates
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listings.map((item) => (
                        <ListingCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}
