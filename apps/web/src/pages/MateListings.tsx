import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export default function MateListings() {
    const { id } = useParams()
    const { session } = useAuth()
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchListings = async () => {
            if (!session?.access_token || !id) return
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/listings`, {
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
    }, [session, id])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/mates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Mate's Listings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                    <Link key={item.id} to={`/listings/${item.id}`} className="block">
                        <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                            {item.images && item.images.length > 0 ? (
                                <div className="w-full">
                                    <Carousel className="w-full">
                                        <CarouselContent>
                                            {item.images.map((image: string, index: number) => (
                                                <CarouselItem key={index}>
                                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                                        <img
                                                            src={image}
                                                            alt={`${item.title} ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        {item.images.length > 1 && (
                                            <>
                                                <CarouselPrevious className="left-2" />
                                                <CarouselNext className="right-2" />
                                            </>
                                        )}
                                    </Carousel>
                                </div>
                            ) : (
                                <div className="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
                                    No images
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
                                <div className="text-sm">
                                    <p className="font-medium">Selling for mates</p>
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>

            {listings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    This mate hasn't listed anything yet.
                </div>
            )}
        </div>
    )
}
