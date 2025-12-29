import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function OfferModal({ listingId, ListingTitle }: { listingId: number, ListingTitle: string }) {
    const { session } = useAuth()
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleOffer = async () => {
        if (!amount) return
        setLoading(true)
        try {
            // Convert to cents/pence implies input is major units (e.g. 50.00)
            const valueInCents = Math.round(parseFloat(amount) * 100)

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${listingId}/offers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ amount: valueInCents })
            })

            if (res.ok) {
                setOpen(false)
                setAmount("")
                alert("Offer sent successfully!")
            } else {
                alert("Failed to send offer")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">Make an Offer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                    <DialogTitle>Make an Offer</DialogTitle>
                    <DialogDescription>
                        Enter your price for {ListingTitle}. The seller will be notified.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-bold">£</span>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-lg"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleOffer} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Offer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
