import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, LogOut } from "lucide-react"

export default function Account() {
    const { user, session, signOut } = useAuth()

    const getInitials = (email: string | undefined) => {
        if (!email) return "U"
        return email.substring(0, 2).toUpperCase()
    }

    const handleConnectStripe = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/onboard`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.access_token}` },
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert("Failed to get onboarding link")
            }
        } catch (e) {
            console.error(e)
            alert("Error connecting to Stripe")
        }
    }

    return (
        <div className="mx-auto max-w-xl px-6 md:px-10 pt-12 pb-16">
            <h1 className="text-[28px] font-bold text-foreground mb-8">Account</h1>

            <div className="flex items-center gap-5 pb-8 border-b border-hairline-soft">
                <Avatar className="h-20 w-20 shrink-0 border-2 border-border">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                    <AvatarFallback className="bg-accent text-foreground text-[22px] font-semibold">
                        {getInitials(user?.email)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xl font-semibold text-foreground leading-tight">
                        {user?.user_metadata?.full_name || user?.email}
                    </p>
                    {user?.user_metadata?.full_name && (
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    )}
                </div>
            </div>

            <div className="pt-8 flex flex-col gap-3">

                <div className="flex items-center justify-between border border-border rounded-card px-6 py-5 bg-background">
                    <div>
                        <p className="text-base font-semibold text-foreground">Payouts</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Connect your Stripe account to receive payments.
                        </p>
                    </div>
                    <button
                        onClick={handleConnectStripe}
                        className="flex items-center gap-2 shrink-0 bg-background hover:bg-muted text-foreground border border-foreground rounded-button px-4 py-2.5 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
                    >
                        <DollarSign className="h-4 w-4" />
                        Connect Payouts
                    </button>
                </div>

                <div className="flex items-center justify-between border border-border rounded-card px-6 py-5 bg-background">
                    <div>
                        <p className="text-base font-semibold text-foreground">Sign out</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Sign out of your Mates Rates account.
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 shrink-0 bg-background hover:bg-[#fff5f3] text-destructive border border-destructive rounded-button px-4 py-2.5 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
