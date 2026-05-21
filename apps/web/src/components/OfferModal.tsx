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
                <button
                    className="w-full flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: "#ff385c",
                        color: "#ffffff",
                        borderRadius: 8,
                        padding: "14px 24px",
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                        border: "none",
                        cursor: "pointer",
                        lineHeight: 1.25,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e00b41")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff385c")}
                >
                    Make an Offer
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                    <DialogTitle style={{ fontSize: 20, fontWeight: 600, color: "#222222" }}>Make an Offer</DialogTitle>
                    <DialogDescription style={{ fontSize: 14, color: "#6a6a6a" }}>
                        Enter your price for {ListingTitle}. The seller will be notified.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-3">
                        <span style={{ fontSize: 20, fontWeight: 600, color: "#222222" }}>£</span>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            style={{
                                flex: 1,
                                height: 56,
                                border: "1px solid #dddddd",
                                borderRadius: 8,
                                padding: "0 12px",
                                fontSize: 18,
                                color: "#222222",
                                outline: "none",
                                backgroundColor: "#ffffff",
                            }}
                            onFocus={(e) => (e.currentTarget.style.border = "2px solid #222222")}
                            onBlur={(e) => (e.currentTarget.style.border = "1px solid #dddddd")}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <button
                        onClick={handleOffer}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 transition-colors"
                        style={{
                            backgroundColor: loading ? "#ffd1da" : "#ff385c",
                            color: "#ffffff",
                            borderRadius: 8,
                            padding: "14px 24px",
                            height: 48,
                            fontSize: 16,
                            fontWeight: 500,
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#e00b41" }}
                        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#ff385c" }}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Offer"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
