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
            className="flex items-center gap-4 p-5 bg-background cursor-pointer transition-all duration-200 hover:shadow-card-hover rounded-card border border-border"
            onClick={() => navigate(`/mates/${mate.id}`)}
        >
            <Avatar className="h-14 w-14 shrink-0 border-2 border-hairline-soft">
                <AvatarImage src={mate.avatarUrl} alt={mate.name} />
                <AvatarFallback className="bg-accent text-foreground text-base font-semibold">
                    {mate.name?.[0]?.toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground leading-tight">
                    {mate.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-normal">
                    {mate.listingCount === 0
                        ? "No active listings"
                        : `${mate.listingCount} active listing${mate.listingCount === 1 ? "" : "s"}`}
                </p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); navigate(`/mates/${mate.id}`) }}
                className="shrink-0 bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-4 py-2.5 text-sm font-medium border-none cursor-pointer whitespace-nowrap transition-colors leading-tight"
            >
                View Listings
            </button>
        </div>
    )
}
