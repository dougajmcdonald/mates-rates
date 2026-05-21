import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2, Package, Share2, BadgePoundSterling, Shield, Users, Link2, Check } from "lucide-react"

const HOW_IT_WORKS = [
    {
        step: "01",
        icon: Package,
        title: "List your items",
        description: "Add photos, set your price, write a description. Done in minutes.",
    },
    {
        step: "02",
        icon: Share2,
        title: "Share with mates",
        description: "One link, your trusted circle. No WhatsApp threads, no Facebook groups.",
    },
    {
        step: "03",
        icon: BadgePoundSterling,
        title: "Sell on your terms",
        description: "Receive offers from people you trust. Accept the right one. Done.",
    },
]

const PAIN_POINTS = [
    "Got large items that need a new home but can't face Marketplace strangers?",
    "Tired of no-shows and time wasters from people you'll never meet?",
    "Want your friends to get first dibs before you list publicly?",
    "Done with endless WhatsApp groups pinging at all hours?",
]

const FEATURES = [
    {
        icon: Shield,
        title: "Your trusted circle only",
        description: "Only the people you invite can see your listings. No strangers browsing your home.",
    },
    {
        icon: Users,
        title: "Mates rates, not market rates",
        description: "Sell to people you actually know. Set prices that feel fair between friends.",
    },
    {
        icon: Link2,
        title: "One step removed — no further",
        description: "Your mates can share with their mates, but it stops there. Trusted, not exposed.",
    },
]

export default function Landing() {
    const { signInWithGoogle, user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (user) return <Navigate to="/dashboard" />

    return (
        <div className="min-h-screen bg-background text-foreground">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded-button focus:text-sm focus:font-medium focus:border focus:border-border"
            >
                Skip to main content
            </a>

            {/* Nav */}
            <header role="banner" className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="mx-auto max-w-6xl px-6 md:px-10 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" className="h-7 w-7" alt="Mates Rates" />
                        <span className="text-base font-semibold tracking-tight">Mates Rates</span>
                    </div>
                    <button
                        onClick={signInWithGoogle}
                        className="bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-5 h-10 text-sm font-medium border-none cursor-pointer transition-colors"
                    >
                        Sign in
                    </button>
                </div>
            </header>

            <main id="main">

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <section aria-labelledby="hero-heading" className="mx-auto max-w-6xl px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Copy */}
                        <div>
                            <p className="inline-block text-sm font-medium text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-8">
                                Private marketplace for your social circle
                            </p>
                            <h1
                                id="hero-heading"
                                className="text-[38px] md:text-[56px] font-bold text-foreground leading-[1.08] tracking-tight mb-6"
                            >
                                Sell to friends.<br />
                                <span className="text-primary">Not strangers.</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-[420px]">
                                List what you don't need, share it with your mates, and sell without the time wasters, flakes, or randos from the internet.
                            </p>
                            <button
                                onClick={signInWithGoogle}
                                className="inline-flex items-center gap-3 bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-8 h-14 text-base font-medium border-none cursor-pointer transition-colors"
                            >
                                Get started with Google
                            </button>
                            <p className="text-[13px] text-muted-soft mt-4">Free to use · No credit card needed</p>
                        </div>

                        {/* App preview — hidden on mobile */}
                        <div className="hidden lg:block relative" aria-hidden="true">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 bg-background rounded-card border border-border shadow-card-hover overflow-hidden">
                                    <div className="h-44 bg-orange-50 flex items-center justify-center text-6xl select-none">🛋️</div>
                                    <div className="p-4 flex items-baseline justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Vintage sofa — great condition</p>
                                            <p className="text-[13px] text-muted-foreground mt-0.5">Furniture</p>
                                        </div>
                                        <span className="text-sm font-semibold text-primary shrink-0 ml-4">£120</span>
                                    </div>
                                </div>
                                <div className="bg-background rounded-card border border-border overflow-hidden">
                                    <div className="h-28 bg-sky-50 flex items-center justify-center text-4xl select-none">🚲</div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-foreground truncate">Road bike</p>
                                        <p className="text-[13px] text-primary font-semibold">£85</p>
                                    </div>
                                </div>
                                <div className="bg-background rounded-card border border-border overflow-hidden">
                                    <div className="h-28 bg-violet-50 flex items-center justify-center text-4xl select-none">📷</div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-foreground truncate">DSLR camera</p>
                                        <p className="text-[13px] text-primary font-semibold">£200</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-3 bg-background border border-border rounded-full shadow-card-hover px-4 py-2">
                                <span className="text-[13px] font-semibold text-foreground">👥 3 mates interested</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ── How it works ─────────────────────────────────────────── */}
                <section aria-labelledby="how-heading" className="bg-muted py-20 md:py-24">
                    <div className="mx-auto max-w-6xl px-6 md:px-10">
                        <div className="text-center mb-14">
                            <h2 id="how-heading" className="text-[28px] md:text-[36px] font-bold text-foreground mb-4">
                                How it works
                            </h2>
                            <p className="text-base text-muted-foreground max-w-sm mx-auto">
                                Three steps from "taking up space" to "mates sorted".
                            </p>
                        </div>
                        <ol className="grid md:grid-cols-3 gap-6" role="list">
                            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
                                <li key={step} className="bg-background rounded-card border border-border p-8 flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <div className="h-10 w-10 rounded-button bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                                        </div>
                                        <span className="text-[22px] font-bold text-border select-none" aria-hidden="true">{step}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ── Who it's for ─────────────────────────────────────────── */}
                <section aria-labelledby="who-heading" className="py-20 md:py-24">
                    <div className="mx-auto max-w-6xl px-6 md:px-10">
                        <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">
                            <div>
                                <h2 id="who-heading" className="text-[28px] md:text-[36px] font-bold text-foreground mb-8">
                                    Sound familiar?
                                </h2>
                                <ul className="flex flex-col gap-5" role="list">
                                    {PAIN_POINTS.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                                            </div>
                                            <p className="text-base text-muted-foreground leading-relaxed">{point}</p>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-base font-semibold text-foreground mt-8">
                                    Mates Rates is built for exactly this.
                                </p>
                            </div>

                            <figure className="bg-accent rounded-card p-8 md:p-10 flex flex-col gap-6 m-0">
                                <span className="text-4xl" aria-hidden="true">🛋️</span>
                                <blockquote className="m-0 p-0 border-0">
                                    <p className="text-[20px] font-medium text-foreground leading-[1.45]">
                                        "Listed my sofa, sent the link to the group chat — sold it to a mate of a mate the same day. Zero hassle."
                                    </p>
                                </blockquote>
                                <figcaption className="text-sm text-muted-foreground">Early Mates Rates user</figcaption>
                            </figure>
                        </div>
                    </div>
                </section>

                {/* ── Why Mates Rates ──────────────────────────────────────── */}
                <section aria-labelledby="why-heading" className="bg-muted py-20 md:py-24">
                    <div className="mx-auto max-w-6xl px-6 md:px-10">
                        <div className="text-center mb-14">
                            <h2 id="why-heading" className="text-[28px] md:text-[36px] font-bold text-foreground mb-4">
                                Why Mates Rates?
                            </h2>
                            <p className="text-base text-muted-foreground max-w-sm mx-auto">
                                Built on trust, not traffic. No algorithm, no strangers, no nonsense.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {FEATURES.map(({ icon: Icon, title, description }) => (
                                <article key={title} className="bg-background rounded-card border border-border p-8">
                                    <div className="h-10 w-10 rounded-button bg-primary/10 flex items-center justify-center mb-5">
                                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ────────────────────────────────────────────── */}
                <section aria-labelledby="cta-heading" className="py-20 md:py-28">
                    <div className="mx-auto max-w-2xl px-6 md:px-10 text-center">
                        <h2 id="cta-heading" className="text-[28px] md:text-[40px] font-bold text-foreground mb-6 leading-tight">
                            Ready to sell to people<br className="hidden sm:block" /> you actually trust?
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
                            Invite your mates, list your first item, and see how much easier selling can be when everyone involved actually knows each other.
                        </p>
                        <button
                            onClick={signInWithGoogle}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-rausch-active text-primary-foreground rounded-button px-8 h-14 text-base font-medium border-none cursor-pointer transition-colors"
                        >
                            Get started with Google
                        </button>
                        <p className="text-[13px] text-muted-soft mt-4">Free to use · No credit card needed</p>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer role="contentinfo" className="border-t border-border py-8">
                <div className="mx-auto max-w-6xl px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" className="h-5 w-5" alt="Mates Rates" />
                        <span className="text-sm font-semibold text-foreground">Mates Rates</span>
                    </div>
                    <p className="text-sm text-muted-foreground">The private marketplace for your social circle.</p>
                    <p className="text-[13px] text-muted-soft">© {new Date().getFullYear()} Mates Rates</p>
                </div>
            </footer>
        </div>
    )
}
