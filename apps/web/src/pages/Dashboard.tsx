import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { PlusCircle, Loader2, DollarSign } from "lucide-react"
import { IncomingOffers } from "@/components/IncomingOffers"
import { MyOffers } from "@/components/MyOffers"

type Listing = {
  id: number
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
  const { user, session, signOut } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      if (!session?.access_token) return
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
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
  }, [session])

  const [inviteLoading, setInviteLoading] = useState(false)

  const handleInvite = async () => {
    if (!session) return
    setInviteLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await res.json()
      if (data.token) {
        const link = `${window.location.origin}/invite?token=${data.token}`
        await navigator.clipboard.writeText(link)
        alert('Invite link copied to clipboard!')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to generate invite')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/onboard`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to get onboarding link')
      }
    } catch (e) {
      console.error(e)
      alert('Error connecting to Stripe')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mates Rates</h1>
        <div className="flex gap-4">
          <span className="flex items-center text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleConnectStripe}>
            <DollarSign className="mr-2 h-4 w-4" />
            Connect Payouts
          </Button>
          <Button variant="outline" onClick={handleInvite} disabled={inviteLoading}>
            {inviteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Invite Mate
          </Button>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
          <Link to="/listings/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Sell Item
            </Button>
          </Link>
        </div>
      </div>

      <MyOffers />
      <IncomingOffers />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <Link key={item.id} to={`/listings/${item.id}`} className="block">
            <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
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
                  <CardTitle>{item.title}</CardTitle>
                  <span className="font-bold text-lg">
                    £{(item.price / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">{item.description}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-3 border-t bg-muted/50 p-4">
                {item.seller.avatarUrl ? (
                  <img src={item.seller.avatarUrl} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-300" />
                )}
                <div className="text-sm">
                  <p className="font-medium">{item.seller.name || 'Friend'}</p>
                  <p className="text-xs text-muted-foreground">Selling for mates</p>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {listings.length === 0 && !loading && (
        <div className="text-center py-20 text-muted-foreground">
          No listings yet. Be the first to add one!
        </div>
      )}
    </div>
  )
}
