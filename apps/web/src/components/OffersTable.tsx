
import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, CreditCard, ArrowRight, ArrowLeft } from "lucide-react"
import { PaymentModal } from "@/components/PaymentModal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type IncomingOffer = {
    id: number
    amount: number
    status: 'pending' | 'accepted' | 'declined' | 'paid'
    createdAt: string
    listingTitle: string
    buyerName: string
    listingId: number
}

export type OutgoingOffer = {
    id: number
    amount: number
    status: 'pending' | 'accepted' | 'declined' | 'paid'
    listingTitle: string
    listingId: number
    sellerName: string
}

interface OffersTableProps {
    incoming: IncomingOffer[]
    outgoing: OutgoingOffer[]
    onStatusUpdate: (id: number, status: 'accepted' | 'declined') => Promise<void>
}

export function OffersTable({ incoming, outgoing, onStatusUpdate }: OffersTableProps) {
    const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all')

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>
            case 'declined': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Declined</Badge>
            case 'paid': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Paid</Badge>
            default: return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>
        }
    }

    // Merge and normalize data for table
    const allOffers = [
        ...incoming.map(o => ({ ...o, type: 'incoming' as const, party: o.buyerName })),
        ...outgoing.map(o => ({ ...o, type: 'outgoing' as const, party: o.sellerName }))
    ].sort((a, b) => {
        // Sort by ID descending (proxy for date if date missing in outgoing) or explicit date if available
        return b.id - a.id
    })

    const filteredOffers = allOffers.filter(o => {
        if (filter === 'all') return true
        return o.type === filter
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Offers</h3>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="incoming">Incoming</TabsTrigger>
                        <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Listing</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOffers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No offers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOffers.map((offer) => (
                                <TableRow key={`${offer.type}-${offer.id}`} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {offer.type === 'incoming' ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                                                    <ArrowLeft className="h-3 w-3" /> Incoming
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                                                    Outgoing <ArrowRight className="h-3 w-3" />
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{offer.listingTitle}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">{offer.type === 'incoming' ? 'From' : 'To'}</span>
                                            <span>{offer.party}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        £{(offer.amount / 100).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(offer.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                            {offer.type === 'incoming' && offer.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => onStatusUpdate(offer.id, 'declined')}
                                                        title="Decline"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                        onClick={() => onStatusUpdate(offer.id, 'accepted')}
                                                        title="Accept"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {offer.type === 'outgoing' && offer.status === 'accepted' && (
                                                <PaymentModal
                                                    offerId={offer.id}
                                                    amount={offer.amount}
                                                    listingTitle={offer.listingTitle}
                                                    trigger={
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 px-3">
                                                            <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Pay Now
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
