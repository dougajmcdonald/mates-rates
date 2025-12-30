import { Navigation } from "@/components/Navigation"
import { Outlet } from "react-router-dom"

export function Layout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}
