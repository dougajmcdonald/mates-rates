import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { OffersTable, type IncomingOffer, type OutgoingOffer } from "@/components/OffersTable"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type Listing = {
  id: number
  userId: string
  title: string
  description: string
  price: number
  category: string
  images: string[]
  seller: {
    name: string | null
    avatarUrl: string | null
  }
}

export default function Dashboard() {
  const { session } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [incomingOffers, setIncomingOffers] = useState<IncomingOffer[]>([])
  const [outgoingOffers, setOutgoingOffers] = useState<OutgoingOffer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!session?.access_token) return
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${session.access_token}` }

      const [listingsRes, incomingRes, outgoingRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/listings`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/offers/incoming`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/offers/outgoing`, { headers })
      ])

      const listingsData = await listingsRes.json()
      const incomingData = await incomingRes.json()
      const outgoingData = await outgoingRes.json()

      setListings(listingsData.listings || [])
      setIncomingOffers(incomingData.offers || [])
      setOutgoingOffers(outgoingData.offers || [])

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [session])

  const handleStatusUpdate = async (id: number, status: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchData() // Refresh everything to update statuses
      }
    } catch (e) {
      console.error(e)
    }
  }

  const myListings = listings.filter(l => l.userId === session?.user.id)
  const friendListings = listings.filter(l => l.userId !== session?.user.id)

  if (loading && listings.length === 0) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12">

      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your listings, offers, and find deals from mates.</p>
        </div>
        <Button asChild className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link to="/listings/new">
            <Plus className="mr-2 h-4 w-4" /> New Listing
          </Link>
        </Button>
      </div>

      {/* Section 1: My Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">My Listings</h2>
          {myListings.length > 0 && (
            <span className="text-sm font-medium text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
              {myListings.length}
            </span>
          )}
        </div>

        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {myListings.map((item) => (
              <Link key={item.id} to={`/listings/${item.id}`} className="group block h-full">
                <Card className="overflow-hidden h-full border-2 border-transparent transition-all hover:border-blue-500/20 hover:shadow-lg">
                  <div className="aspect-4/3 w-full overflow-hidden bg-slate-100 relative">
                    {item.images && item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                      £{(item.price / 100).toFixed(2)}
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base truncate" title={item.title}>{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900">No listings yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">Create your first listing to start selling to your mates.</p>
            <Button variant="outline" asChild>
              <Link to="/listings/new">Create Listing</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Section 2: New Listings (Mates) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">New from Mates</h2>
          <Link to="/mates" className="text-sm text-blue-600 hover:underline">View all mates</Link>
        </div>

        {friendListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friendListings.map((item) => (
              <Link key={item.id} to={`/listings/${item.id}`} className="block h-full">
                <Card className="overflow-hidden h-full transition-all hover:shadow-md hover:-translate-y-1 border-slate-200">
                  {item.images && item.images[0] && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1 text-lg">{item.title}</CardTitle>
                      <span className="font-bold text-lg text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        £{(item.price / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                  </CardContent>
                  <CardFooter className="flex items-center gap-3 border-t bg-slate-50/50 p-4 mt-auto">
                    {item.seller.avatarUrl ? (
                      <img src={item.seller.avatarUrl} className="h-8 w-8 rounded-full border border-slate-200" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">?</div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{item.seller.name || 'Friend'}</p>
                      <p className="text-xs text-slate-500">Selling for mates</p>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No active listings from your mates right now.</p>
          </div>
        )}
      </section>

      {/* Section 3: Offers Table */}
      <section className="space-y-4">
        <OffersTable
          incoming={incomingOffers}
          outgoing={outgoingOffers}
          onStatusUpdate={handleStatusUpdate}
        />
      </section>

    </div>
  )
}
