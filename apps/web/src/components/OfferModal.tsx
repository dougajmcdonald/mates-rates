import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
                <button
                    className="w-full flex items-center justify-center bg-primary hover:bg-rausch-active text-primary-foreground rounded-button h-12 px-6 text-base font-medium border-none cursor-pointer leading-tight transition-colors"
                >
                    Make an Offer
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground">Make an Offer</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Enter your price for {ListingTitle}. The seller will be notified.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold text-foreground">£</span>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="form-field h-14 text-lg flex-1"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <button
                        onClick={handleOffer}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-rausch-active disabled:bg-rausch-disabled text-primary-foreground rounded-button h-12 px-6 text-base font-medium border-none cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Offer"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
