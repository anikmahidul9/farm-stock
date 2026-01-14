"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link" // Import Link

type Offer = {
  id: string
  buyRequestId: string
  buyRequestTitle: string
  buyerId: string
  price: number
  message: string
  createdAt: any
  status: 'pending' | 'accepted' | 'rejected'
  orderId?: string // Added orderId
}

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOffers = useCallback(async () => {
    if (!user) return;
    setLoading(true)
    const offersQuery = query(collection(db, "offers"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"))
    const offersSnapshot = await getDocs(offersQuery)
    
    const offersDataPromises = offersSnapshot.docs.map(async offerDoc => {
        const offer = { id: offerDoc.id, ...offerDoc.data() } as Offer;
        
        // If the offer is accepted, try to find the associated order
        if (offer.status === 'accepted') {
            const ordersQuery = query(collection(db, "orders"), where("offerId", "==", offer.id));
            const ordersSnapshot = await getDocs(ordersQuery);
            if (!ordersSnapshot.empty) {
                offer.orderId = ordersSnapshot.docs[0].id;
            }
        }
        return offer;
    });

    const offersData = await Promise.all(offersDataPromises);
    setOffers(offersData)
    setLoading(false)
}, [user]);

  useEffect(() => {
    if (user) {
      fetchOffers()
    }
  }, [user, fetchOffers])

  const handleMessageBuyer = async (buyerId: string) => {
    if (!user) return;

    const conversationQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const querySnapshot = await getDocs(conversationQuery);
    let existingConversation: { id: string, participants: string[] } | null = null;

    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(buyerId)) {
            existingConversation = { id: doc.id, ...data } as { id: string, participants: string[] };
        }
    });

    if (existingConversation) {
      router.push(`/messages/${existingConversation.id}`);
    } else {
      const newConversationRef = await addDoc(collection(db, "conversations"), {
        participants: [user.uid, buyerId],
        lastUpdatedAt: serverTimestamp(),
        lastRead: {
          [user.uid]: serverTimestamp()
        }
      });
      router.push(`/messages/${newConversationRef.id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', 'Tk')
  }

  if (loading) {
    return <div className="text-center py-10">Loading your sent offers...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Sent Offers</h1>
      <div className="space-y-4">
        {offers.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">You have not sent any offers.</p>
        ) : (
          offers.map(offer => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Offer for: {offer.buyRequestTitle}</CardTitle>
                    {offer.status === 'accepted' && <Badge className="bg-green-100 text-green-800">Accepted</Badge>}
                    {offer.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                    {offer.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                </div>
                <CardDescription>
                  Sent on {offer.createdAt ? format(offer.createdAt.toDate(), "PPP") : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-end">
                <div>
                    <p className="text-lg font-bold text-emerald-600 mb-2">{formatCurrency(offer.price)}</p>
                    <p className="text-muted-foreground text-sm">{offer.message}</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleMessageBuyer(offer.buyerId)}>Message Buyer</Button>
                    {offer.status === 'accepted' && offer.orderId && (
                        <Link href={`/orders/${offer.orderId}`}>
                            <Button size="sm" variant="outline">View Order</Button>
                        </Link>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
