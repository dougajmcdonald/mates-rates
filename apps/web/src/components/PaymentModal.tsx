import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) {
    const stripe = useStripe()
    const elements = useElements()
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsLoading(true)

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard?payment=success`,
                },
                redirect: 'if_required',
            })

            if (error) {
                setMessage(error.message || "An unexpected error occurred.")
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                setMessage("Payment succeeded!")
                onSuccess()
            } else {
                setMessage("Payment processing...")
            }
        } catch (e) {
            console.error(e)
            setMessage("An error occurred")
        }

        setIsLoading(false)
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4 pt-4">
            <PaymentElement id="payment-element" />
            {message && <div id="payment-message" className="text-sm text-red-500">{message}</div>}
            <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : "Pay Now"}
            </Button>
        </form>
    )
}

export function PaymentModal({ offerId, amount, listingTitle }: { offerId: number, amount: number, listingTitle: string }) {
    const { session } = useAuth()
    const [clientSecret, setClientSecret] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const initializePayment = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-intent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ offerId }),
            })
            const data = await res.json()
            if (data.clientSecret) {
                setClientSecret(data.clientSecret)
            } else {
                alert("Failed to initialize payment: " + (data.error || "Unknown error"))
                setOpen(false)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to contact server")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (val && !clientSecret) initializePayment()
        }}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">Pay £{(amount / 100).toFixed(2)}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete Payment for {listingTitle}</DialogTitle>
                </DialogHeader>
                {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}
                {!loading && clientSecret && (
                    <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                        <CheckoutForm clientSecret={clientSecret} onSuccess={() => {
                            alert("Payment Successful! Item matches are yours!")
                            setOpen(false)
                            // Ideally refresh parent
                            window.location.reload()
                        }} />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    )
}
