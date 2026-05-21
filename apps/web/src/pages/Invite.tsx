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
            <div className="flex items-center justify-center px-6" style={{ minHeight: "60vh" }}>
                <div
                    className="w-full max-w-sm text-center flex flex-col items-center gap-5"
                    style={{
                        border: "1px solid #dddddd",
                        borderRadius: 14,
                        padding: "40px 32px",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: "#222222" }}>Mates Rates Invite</h1>

                    {status === "loading" && (
                        <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#ff385c" }} />
                    )}
                    {status === "success" && (
                        <CheckCircle className="h-10 w-10" style={{ color: "#22a06b" }} />
                    )}
                    {status === "error" && (
                        <XCircle className="h-10 w-10" style={{ color: "#c13515" }} />
                    )}

                    {message && (
                        <p style={{ fontSize: 16, color: "#3f3f3f" }}>{message}</p>
                    )}

                    {status === "error" && (
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                backgroundColor: "#ff385c",
                                color: "#ffffff",
                                borderRadius: 8,
                                padding: "14px 24px",
                                height: 48,
                                fontSize: 16,
                                fontWeight: 500,
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Go to Dashboard
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center px-6" style={{ minHeight: "60vh" }}>
            <div
                className="w-full max-w-sm flex flex-col items-center gap-6"
                style={{
                    border: "1px solid #dddddd",
                    borderRadius: 14,
                    padding: "40px 32px",
                    backgroundColor: "#ffffff",
                    textAlign: "center",
                }}
            >
                <h1 style={{ fontSize: 22, fontWeight: 600, color: "#222222" }}>Invite a Mate</h1>
                <p style={{ fontSize: 16, color: "#6a6a6a", lineHeight: 1.5 }}>
                    Generate a unique link to invite your friends to Mates Rates.
                </p>

                {status === "success" && generatedLink && (
                    <div
                        className="w-full text-left"
                        style={{
                            border: "1px solid #dddddd",
                            borderRadius: 8,
                            padding: "12px 14px",
                            backgroundColor: "#f7f7f7",
                        }}
                    >
                        <p style={{ fontSize: 12, fontFamily: "monospace", color: "#3f3f3f", wordBreak: "break-all" }}>
                            {generatedLink}
                        </p>
                    </div>
                )}

                <button
                    onClick={handleCreateInvite}
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 transition-colors"
                    style={{
                        backgroundColor: status === "loading" ? "#ffd1da" : "#ff385c",
                        color: "#ffffff",
                        borderRadius: 8,
                        padding: "14px 24px",
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                        border: "none",
                        cursor: status === "loading" ? "not-allowed" : "pointer",
                        lineHeight: 1.25,
                    }}
                    onMouseEnter={(e) => { if (status !== "loading") e.currentTarget.style.backgroundColor = "#e00b41" }}
                    onMouseLeave={(e) => { if (status !== "loading") e.currentTarget.style.backgroundColor = "#ff385c" }}
                >
                    {status === "loading"
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Copy className="h-4 w-4" />
                    }
                    {status === "success" ? "Copy Link Again" : "Generate Invite Link"}
                </button>

                {message && status !== "idle" && (
                    <p style={{
                        fontSize: 14,
                        color: status === "error" ? "#c13515" : "#22a06b",
                    }}>
                        {message}
                    </p>
                )}

                <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#6a6a6a",
                        textDecoration: "underline",
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    )
}
