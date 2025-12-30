import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert('Failed to get onboarding link')
            }
        } catch (e) {
            console.error(e)
            alert('Error connecting to Stripe')
        }
    }

    return (
        <div className="container py-10 max-w-2xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
                        <AvatarFallback className="text-lg">{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle>{user?.email}</CardTitle>
                        <CardDescription>Manage your account and settings</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div className="grid gap-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <div className="font-medium">Payouts</div>
                                <div className="text-sm text-muted-foreground">connnect your stripe account to receive payouts.</div>
                            </div>
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleConnectStripe}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Connect Payouts
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-start pt-6">
                        <Button variant="destructive" onClick={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
