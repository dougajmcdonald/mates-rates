import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                const redirect = sessionStorage.getItem('auth_redirect')
                sessionStorage.removeItem('auth_redirect')
                navigate(redirect || "/dashboard", { replace: true })
            } else if (event === "INITIAL_SESSION") {
                navigate("/", { replace: true })
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}
