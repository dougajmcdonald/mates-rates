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
        <div className="mx-auto max-w-xl px-6 md:px-10" style={{ paddingTop: 48, paddingBottom: 64 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#222222", marginBottom: 32 }}>Account</h1>

            {/* Profile block */}
            <div
                className="flex items-center gap-5 pb-8"
                style={{ borderBottom: "1px solid #ebebeb" }}
            >
                <Avatar className="h-20 w-20 shrink-0" style={{ border: "2px solid #dddddd" }}>
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                    <AvatarFallback
                        style={{ backgroundColor: "#f2f2f2", color: "#222222", fontSize: 22, fontWeight: 600 }}
                    >
                        {getInitials(user?.email)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p style={{ fontSize: 20, fontWeight: 600, color: "#222222", lineHeight: 1.2 }}>
                        {user?.user_metadata?.full_name || user?.email}
                    </p>
                    {user?.user_metadata?.full_name && (
                        <p style={{ fontSize: 14, color: "#6a6a6a", marginTop: 4 }}>{user.email}</p>
                    )}
                </div>
            </div>

            {/* Settings */}
            <div style={{ paddingTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Payouts row */}
                <div
                    className="flex items-center justify-between"
                    style={{
                        border: "1px solid #dddddd",
                        borderRadius: 14,
                        padding: "20px 24px",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "#222222" }}>Payouts</p>
                        <p style={{ fontSize: 14, color: "#6a6a6a", marginTop: 4 }}>
                            Connect your Stripe account to receive payments.
                        </p>
                    </div>
                    <button
                        onClick={handleConnectStripe}
                        className="flex items-center gap-2 shrink-0 transition-colors"
                        style={{
                            backgroundColor: "#ffffff",
                            color: "#222222",
                            border: "1px solid #222222",
                            borderRadius: 8,
                            padding: "10px 16px",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                    >
                        <DollarSign className="h-4 w-4" />
                        Connect Payouts
                    </button>
                </div>

                {/* Sign out */}
                <div
                    className="flex items-center justify-between"
                    style={{
                        border: "1px solid #dddddd",
                        borderRadius: 14,
                        padding: "20px 24px",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "#222222" }}>Sign out</p>
                        <p style={{ fontSize: 14, color: "#6a6a6a", marginTop: 4 }}>
                            Sign out of your Mates Rates account.
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 shrink-0 transition-colors"
                        style={{
                            backgroundColor: "#ffffff",
                            color: "#c13515",
                            border: "1px solid #c13515",
                            borderRadius: 8,
                            padding: "10px 16px",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff5f3")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
