import { Button } from "@/components/ui/button"
import { useAuth, AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import Dashboard from "@/pages/Dashboard"
import CreateListing from "@/pages/CreateListing"
import Invite from "@/pages/Invite"

function Landing() {
  const { signInWithGoogle, user, loading } = useAuth()

  if (loading) return <Loader2 className="animate-spin" />

  if (user) return <Navigate to="/dashboard" />

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-6">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
        Mates Rates
      </h1>
      <p className="text-xl text-muted-foreground">
        The friendly marketplace for your social circle.
      </p>
      <div className="flex gap-4">
        <Button size="lg" onClick={signInWithGoogle}>Login with Google</Button>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listings/new" element={<CreateListing />} />
            <Route path="/invite" element={<Invite />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
