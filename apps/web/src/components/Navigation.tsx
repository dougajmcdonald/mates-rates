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
            <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-8">
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <img src="/logo.svg" className="h-6 w-6" alt="Mates Rates" />
                    <span className="font-bold sm:inline-block">Mates Rates</span>
                </Link>

                <div className="flex items-center gap-4">
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
