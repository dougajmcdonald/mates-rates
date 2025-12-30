import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function Navigation() {
    const { user } = useAuth()

    // Get initials for avatar fallback
    const getInitials = (email: string | undefined) => {
        if (!email) return "U"
        return email.substring(0, 2).toUpperCase()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold sm:inline-block">Mates Rates</span>
                </Link>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Main Navigation */}
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/listings/new">Sell Item</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/invite">Invite Mate</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/mates">My Mates</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <nav className="flex items-center gap-2">

                        {user && (
                            <Link to="/account">
                                <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary transition-colors cursor-pointer">
                                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
                                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                </Avatar>
                            </Link>
                        )}

                    </nav>
                </div>
            </div>
        </header >
    )
}
