import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2, CheckCircle, XCircle, Copy } from "lucide-react"

export default function Invite() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()
    const { session } = useAuth()
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")
    const [generatedLink, setGeneratedLink] = useState("")

    const mode = token ? "accept" : "create"

    useEffect(() => {
        if (mode === "create" || !session) return

        const acceptInvite = async () => {
            setStatus("loading")
            setMessage("Processing invite…")
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/accept-invite`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                })
                const data = await res.json()
                if (res.ok) {
                    setStatus("success")
                    setMessage("You are now mates! Redirecting to dashboard…")
                    setTimeout(() => navigate("/dashboard"), 2000)
                } else {
                    setStatus("error")
                    setMessage(data.error || data.message || "Failed to accept invite.")
                }
            } catch {
                setStatus("error")
                setMessage("Something went wrong.")
            }
        }

        if (token) acceptInvite()
    }, [token, session, navigate, mode])

    const handleCreateInvite = async () => {
        if (!session) return
        setStatus("loading")
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/share`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            const data = await res.json()
            if (data.token) {
                const link = `${window.location.origin}/invite?token=${data.token}`
                await navigator.clipboard.writeText(link)
                setGeneratedLink(link)
                setStatus("success")
                setMessage("Invite link copied to clipboard!")
            }
        } catch {
            setStatus("error")
            setMessage("Failed to generate invite")
        }
    }

    if (mode === "accept") {
        return (
            <div className="flex items-center justify-center px-6 min-h-[60vh]">
                <div className="w-full max-w-sm text-center flex flex-col items-center gap-5 border border-border rounded-card px-8 py-10 bg-background">
                    <h1 className="text-[22px] font-semibold text-foreground">Mates Rates Invite</h1>

                    {status === "loading" && (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    )}
                    {status === "success" && (
                        <CheckCircle className="h-10 w-10 text-[#22a06b]" />
                    )}
                    {status === "error" && (
                        <XCircle className="h-10 w-10 text-destructive" />
                    )}

                    {message && (
                        <p className="text-base text-body">{message}</p>
                    )}

                    {status === "error" && (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-6 h-12 text-base font-medium border-none cursor-pointer transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center px-6 min-h-[60vh]">
            <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center border border-border rounded-card px-8 py-10 bg-background">
                <h1 className="text-[22px] font-semibold text-foreground">Invite a Mate</h1>
                <p className="text-base text-muted-foreground leading-normal">
                    Generate a unique link to invite your friends to Mates Rates.
                </p>

                {status === "success" && generatedLink && (
                    <div className="w-full text-left border border-border rounded-button px-3.5 py-3 bg-muted">
                        <p className="text-xs font-mono text-body break-all">
                            {generatedLink}
                        </p>
                    </div>
                )}

                <button
                    onClick={handleCreateInvite}
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-rausch-active disabled:bg-rausch-disabled text-primary-foreground rounded-button h-12 text-base font-medium border-none cursor-pointer disabled:cursor-not-allowed leading-tight transition-colors"
                >
                    {status === "loading"
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Copy className="h-4 w-4" />
                    }
                    {status === "success" ? "Copy Link Again" : "Generate Invite Link"}
                </button>

                {message && status !== "idle" && (
                    <p className={`text-sm ${status === "error" ? "text-destructive" : "text-[#22a06b]"}`}>
                        {message}
                    </p>
                )}

                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-transparent border-none cursor-pointer text-sm text-muted-foreground underline"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    )
}
