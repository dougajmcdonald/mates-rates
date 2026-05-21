import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Link } from "react-router-dom"
import { OffersTable, type IncomingOffer, type OutgoingOffer } from "@/components/OffersTable"
import { Plus } from "lucide-react"

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

function PropertyCard({ item, showSeller = false }: { item: Listing; showSeller?: boolean }) {
  return (
    <Link to={`/listings/${item.id}`} className="group block">
      <div className="overflow-hidden rounded-card transition-all duration-200 group-hover:shadow-card-hover">
        <div className="relative aspect-square w-full overflow-hidden bg-accent rounded-card">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
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
          {showSeller && item.seller?.name && (
            <div className="flex items-center gap-1.5 mt-2">
              {item.seller.avatarUrl ? (
                <img
                  src={item.seller.avatarUrl}
                  className="h-5 w-5 rounded-full object-cover"
                  alt={item.seller.name}
                />
              ) : (
                <div className="h-5 w-5 rounded-full flex items-center justify-center bg-accent text-[10px] text-muted-foreground">
                  {item.seller.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-[13px] text-muted-foreground">{item.seller.name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function SectionHeader({
  title,
  count,
  action,
}: {
  title: string
  count?: number
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="text-[22px] font-semibold text-foreground leading-tight">{title}</h2>
        {count != null && count > 0 && (
          <span className="px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-accent rounded-full">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  )
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
      const headers = { Authorization: `Bearer ${session.access_token}` }
      const [listingsRes, incomingRes, outgoingRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/listings`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/offers/incoming`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/offers/outgoing`, { headers }),
      ])
      const [listingsData, incomingData, outgoingData] = await Promise.all([
        listingsRes.json(),
        incomingRes.json(),
        outgoingRes.json(),
      ])
      setListings(listingsData.listings || [])
      setIncomingOffers(incomingData.offers || [])
      setOutgoingOffers(outgoingData.offers || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [session])

  const handleStatusUpdate = async (id: number, status: "accepted" | "declined") => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const myListings = listings.filter((l) => l.userId === session?.user.id)
  const friendListings = listings.filter((l) => l.userId !== session?.user.id)

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-base">
        Loading…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 pt-12 pb-16">

      <div className="flex justify-between items-start pb-8 mb-2 border-b border-hairline-soft">
        <div>
          <h1 className="text-[28px] font-bold text-foreground leading-[1.43]">
            Dashboard
          </h1>
          <p className="text-base text-muted-foreground mt-1 leading-normal">
            Manage your listings, offers, and find deals from mates.
          </p>
        </div>
        <Link
          to="/listings/new"
          className="flex items-center gap-2 bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-6 h-12 text-base font-medium transition-colors no-underline whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      <section className="mt-12">
        <SectionHeader
          title="My Listings"
          count={myListings.length}
          action={
            <Link
              to="/listings/new"
              className="text-sm text-primary hover:underline font-normal no-underline"
            >
              + Add listing
            </Link>
          }
        />
        {myListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {myListings.map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center border-[1.5px] border-dashed border-border rounded-card py-12 px-6">
            <p className="text-base font-semibold text-foreground">No listings yet</p>
            <p className="text-sm text-muted-foreground mt-1.5 mb-5">
              Create your first listing to start selling to your mates.
            </p>
            <Link
              to="/listings/new"
              className="bg-background hover:bg-muted text-foreground border border-foreground rounded-button py-3 px-6 text-base font-medium no-underline inline-flex items-center transition-colors"
            >
              Create Listing
            </Link>
          </div>
        )}
      </section>

      <section className="mt-16">
        <SectionHeader
          title="New from Mates"
          count={friendListings.length}
          action={
            <Link
              to="/mates"
              className="text-sm text-muted-foreground hover:underline font-normal no-underline"
            >
              View all mates
            </Link>
          }
        />
        {friendListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {friendListings.map((item) => (
              <PropertyCard key={item.id} item={item} showSeller />
            ))}
          </div>
        ) : (
          <div className="text-center border-[1.5px] border-dashed border-border rounded-card py-12 px-6">
            <p className="text-sm text-muted-foreground">No active listings from your mates right now.</p>
          </div>
        )}
      </section>

      <section className="mt-16">
        <OffersTable
          incoming={incomingOffers}
          outgoing={outgoingOffers}
          onStatusUpdate={handleStatusUpdate}
        />
      </section>
    </div>
  )
}
