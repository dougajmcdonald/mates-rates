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
        <header className="sticky top-0 z-50 w-full bg-white border-b border-[#dddddd]" style={{ height: 80 }}>
            <div className="mx-auto flex h-full items-center justify-between px-6 md:px-10 max-w-7xl">
                {/* Brand wordmark */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 shrink-0"
                    style={{ color: "#ff385c" }}
                >
                    <img src="/logo.svg" className="h-8 w-8" alt="Mates Rates" />
                    <span
                        className="hidden sm:block font-semibold tracking-tight"
                        style={{ fontSize: 20, color: "#ff385c" }}
                    >
                        Mates Rates
                    </span>
                </Link>

                {/* Centre nav links */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ to, label }) => {
                        const active = isActive(to)
                        return (
                            <Link
                                key={to}
                                to={to}
                                className="relative flex flex-col items-center px-4 py-2 text-sm font-semibold transition-colors"
                                style={{
                                    color: active ? "#222222" : "#6a6a6a",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    letterSpacing: 0,
                                    lineHeight: 1.25,
                                    textDecoration: "none",
                                }}
                            >
                                {label}
                                {active && (
                                    <span
                                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                        style={{ backgroundColor: "#222222" }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Account avatar */}
                <div className="flex items-center gap-3">
                    {user && (
                        <Link to="/account">
                            <Avatar
                                className="h-9 w-9 cursor-pointer transition-all"
                                style={{ border: "2px solid #dddddd" }}
                            >
                                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
                                <AvatarFallback
                                    style={{
                                        backgroundColor: "#f2f2f2",
                                        color: "#222222",
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }}
                                >
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
