import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

interface MateCardProps {
    mate: {
        id: string
        name: string
        avatarUrl?: string
        listingCount: number
    }
}

export function MateCard({ mate }: MateCardProps) {
    const navigate = useNavigate()

    return (
        <div
            className="flex items-center gap-4 p-5 bg-white cursor-pointer transition-all duration-200 hover:shadow-card-hover"
            style={{ borderRadius: 14, border: "1px solid #dddddd" }}
            onClick={() => navigate(`/mates/${mate.id}`)}
        >
            <Avatar className="h-14 w-14 shrink-0" style={{ border: "2px solid #ebebeb" }}>
                <AvatarImage src={mate.avatarUrl} alt={mate.name} />
                <AvatarFallback
                    style={{ backgroundColor: "#f2f2f2", color: "#222222", fontSize: 16, fontWeight: 600 }}
                >
                    {mate.name?.[0]?.toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <p style={{ fontSize: 16, fontWeight: 600, color: "#222222", lineHeight: 1.25 }} className="truncate">
                    {mate.name}
                </p>
                <p style={{ fontSize: 14, color: "#6a6a6a", marginTop: 2, lineHeight: 1.43 }}>
                    {mate.listingCount === 0
                        ? "No active listings"
                        : `${mate.listingCount} active listing${mate.listingCount === 1 ? "" : "s"}`}
                </p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); navigate(`/mates/${mate.id}`) }}
                className="shrink-0 transition-colors"
                style={{
                    backgroundColor: "#ff385c",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    lineHeight: 1.29,
                    whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e00b41")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff385c")}
            >
                View Listings
            </button>
        </div>
    )
}
