import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Dashboard from "@/pages/Dashboard"
import CreateListing from "@/pages/CreateListing"
import Invite from "@/pages/Invite"
import ListingDetails from "@/pages/ListingDetails"
import EditListing from "@/pages/EditListing"
import Account from "@/pages/Account"
import { Layout } from "@/components/Layout"
import MyMates from "@/pages/MyMates"
import MateListings from "@/pages/MateListings"
import AuthCallback from "@/pages/AuthCallback"
import Landing from "@/pages/Landing"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/listings/new" element={<CreateListing />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              <Route path="/listings/:id/edit" element={<EditListing />} />
              <Route path="/invite" element={<Invite />} />
              <Route path="/account" element={<Account />} />
              <Route path="/mates" element={<MyMates />} />
              <Route path="/mates/:id" element={<MateListings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
