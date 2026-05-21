import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const NAV_LINKS = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/listings/new", label: "Sell Item" },
    { to: "/invite", label: "Invite Mate" },
    { to: "/mates", label: "My Mates" },
]

export function Navigation() {
    const { user } = useAuth()
    const location = useLocation()

    const getInitials = (email: string | undefined) => {
        if (!email) return "U"
        return email.substring(0, 2).toUpperCase()
    }

    const isActive = (to: string) =>
        to === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(to)

    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-border h-20">
            <div className="mx-auto flex h-full items-center justify-between px-6 md:px-10 max-w-7xl">
                <Link to="/dashboard" className="flex items-center gap-2 shrink-0 text-primary no-underline">
                    <img src="/logo.svg" className="h-8 w-8" alt="Mates Rates" />
                    <span className="hidden sm:block text-xl font-semibold tracking-tight">
                        Mates Rates
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ to, label }) => {
                        const active = isActive(to)
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`relative flex flex-col items-center px-4 py-2 text-sm font-semibold transition-colors no-underline ${
                                    active
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {label}
                                {active && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-foreground" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    {user && (
                        <Link to="/account">
                            <Avatar className="h-9 w-9 cursor-pointer border-2 border-border hover:border-primary transition-colors">
                                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
                                <AvatarFallback className="bg-accent text-foreground text-[13px] font-semibold">
                                    {getInitials(user.email)}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
