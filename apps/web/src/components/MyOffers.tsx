import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentModal } from "@/components/PaymentModal"

type Offer = {
    id: number
    amount: number
    status: 'pending' | 'accepted' | 'declined' | 'paid'
    listingTitle: string
    listingId: number
    sellerName: string
}

export function MyOffers() {
    const { session } = useAuth()
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.access_token) {
            fetchOffers()
        }
    }, [session])

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/outgoing`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            const data = await res.json()
            setOffers(data.offers || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading || offers.length === 0) return null

    return (
        <Card className="mb-8 border-green-200 bg-green-50/30">
            <CardHeader>
                <CardTitle className="text-xl text-green-900">My Offers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                            <div>
                                <p className="font-semibold text-lg">Offered £{(offer.amount / 100).toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">for {offer.listingTitle} (Seller: {offer.sellerName})</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        offer.status === 'declined' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {offer.status.toUpperCase()}
                                </span>

                                {offer.status === 'accepted' && (
                                    <PaymentModal
                                        offerId={offer.id}
                                        amount={offer.amount}
                                        listingTitle={offer.listingTitle}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
