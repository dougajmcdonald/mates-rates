import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
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

export default function ListingDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { session, user } = useAuth()
    const [listing, setListing] = useState<Listing | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.access_token && id) {
            fetch(`${import.meta.env.VITE_API_URL}/api/listings`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
                .then(res => res.json())
                .then(data => {
                    const found = data.listings?.find((l: any) => l.id === Number(id))
                    setListing(found || null)
                })
                .finally(() => setLoading(false))
        }
    }, [id, session])

    const handleDelete = async () => {
        if (!listing || !confirm('Are you sure you want to delete this listing?')) return
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${listing.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            if (res.ok) {
                navigate('/dashboard')
            } else {
                alert('Failed to delete listing')
            }
        } catch (e) {
            console.error(e)
            alert('Error deleting listing')
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!listing) return <div className="p-8">Listing not found</div>

    const isOwner = user?.id === listing.userId

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    {listing.images && listing.images[0] ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full rounded-lg object-cover shadow-sm aspect-square"
                        />
                    ) : (
                        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{listing.title}</h1>
                        <p className="text-2xl font-semibold mt-2 text-primary">£{(listing.price / 100).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                            <span>Seller: {listing.seller?.name || 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="whitespace-pre-wrap">{listing.description}</p>
                    </div>

                    {isOwner ? (
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                                Edit Listing
                            </Button>
                            <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    ) : (
                        <OfferModal listingId={listing.id} ListingTitle={listing.title} />
                    )}
                </div>
            </div>

            <ListingMessages listingId={listing.id} />
        </div>
    )
}
