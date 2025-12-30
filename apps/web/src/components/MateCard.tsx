import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface MateCardProps {
    mate: {
        id: string;
        name: string;
        avatarUrl?: string;
        listingCount: number;
    }
}

export function MateCard({ mate }: MateCardProps) {
    const navigate = useNavigate();

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={mate.avatarUrl} alt={mate.name} />
                    <AvatarFallback>{mate.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{mate.name}</CardTitle>
                    <CardDescription>{mate.listingCount} active listings</CardDescription>
                </div>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" onClick={() => navigate(`/mates/${mate.id}`)}>
                    View Listings
                </Button>
            </CardFooter>
        </Card>
    )
}
