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
      <div
        className="overflow-hidden transition-all duration-200 group-hover:shadow-card-hover"
        style={{ borderRadius: 14 }}
      >
        {/* Photo */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#f2f2f2]" style={{ borderRadius: 14 }}>
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
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
          {showSeller && item.seller?.name && (
            <div className="flex items-center gap-1.5 mt-2">
              {item.seller.avatarUrl ? (
                <img
                  src={item.seller.avatarUrl}
                  className="h-5 w-5 rounded-full object-cover"
                  alt={item.seller.name}
                />
              ) : (
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#f2f2f2", fontSize: 10, color: "#6a6a6a" }}
                >
                  {item.seller.name[0]?.toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 13, color: "#6a6a6a" }}>{item.seller.name}</span>
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
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#222222", lineHeight: 1.2 }}>{title}</h2>
        {count != null && count > 0 && (
          <span
            className="px-2.5 py-0.5"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6a6a6a",
              backgroundColor: "#f2f2f2",
              borderRadius: 9999,
            }}
          >
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
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "50vh", color: "#6a6a6a", fontSize: 16 }}
      >
        Loading…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10" style={{ paddingTop: 48, paddingBottom: 64 }}>

      {/* Page header */}
      <div
        className="flex justify-between items-start pb-8 mb-2"
        style={{ borderBottom: "1px solid #ebebeb" }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#222222", lineHeight: 1.43 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 16, color: "#6a6a6a", marginTop: 4, lineHeight: 1.5 }}>
            Manage your listings, offers, and find deals from mates.
          </p>
        </div>
        <Link
          to="/listings/new"
          className="flex items-center gap-2 transition-colors"
          style={{
            backgroundColor: "#ff385c",
            color: "#ffffff",
            borderRadius: 8,
            padding: "14px 24px",
            height: 48,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.25,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e00b41")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff385c")}
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {/* My Listings */}
      <section style={{ marginTop: 48 }}>
        <SectionHeader
          title="My Listings"
          count={myListings.length}
          action={
            <Link
              to="/listings/new"
              style={{ fontSize: 14, color: "#ff385c", fontWeight: 400, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              + Add listing
            </Link>
          }
        />
        {myListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gap: 16 }}>
            {myListings.map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              border: "1.5px dashed #dddddd",
              borderRadius: 14,
              padding: "48px 24px",
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 600, color: "#222222" }}>No listings yet</p>
            <p style={{ fontSize: 14, color: "#6a6a6a", marginTop: 6, marginBottom: 20 }}>
              Create your first listing to start selling to your mates.
            </p>
            <Link
              to="/listings/new"
              style={{
                backgroundColor: "#ffffff",
                color: "#222222",
                border: "1px solid #222222",
                borderRadius: 8,
                padding: "13px 23px",
                fontSize: 16,
                fontWeight: 500,
                textDecoration: "none",
                lineHeight: 1.25,
              }}
            >
              Create Listing
            </Link>
          </div>
        )}
      </section>

      {/* New from Mates */}
      <section style={{ marginTop: 64 }}>
        <SectionHeader
          title="New from Mates"
          count={friendListings.length}
          action={
            <Link
              to="/mates"
              style={{ fontSize: 14, color: "#6a6a6a", fontWeight: 400, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              View all mates
            </Link>
          }
        />
        {friendListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 24 }}>
            {friendListings.map((item) => (
              <PropertyCard key={item.id} item={item} showSeller />
            ))}
          </div>
        ) : (
          <div
            className="text-center"
            style={{
              border: "1.5px dashed #dddddd",
              borderRadius: 14,
              padding: "48px 24px",
            }}
          >
            <p style={{ fontSize: 14, color: "#6a6a6a" }}>No active listings from your mates right now.</p>
          </div>
        )}
      </section>

      {/* Offers */}
      <section style={{ marginTop: 64 }}>
        <OffersTable
          incoming={incomingOffers}
          outgoing={outgoingOffers}
          onStatusUpdate={handleStatusUpdate}
        />
      </section>
    </div>
  )
}
