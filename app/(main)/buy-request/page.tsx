"use client"

import { useState, useEffect } from "react"
import { Plus, MapPin, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, runTransaction, where, getDocs } from "firebase/firestore"
import { toast } from "sonner"
import { format } from "date-fns"

type BuyRequest = {
  id: string
  title: string
  category: string
  quantity: number
  description: string
  minBudget: number
  maxBudget: number
  location: string
  deadline: Date | null
  buyerId: string
  buyerName: string
  createdAt: Date
  status: "active" | "urgent" | "closed"
  responses: number
}

type CategoryData = {
  id: string
  name: string
}

export default function BuyRequestsPage() {
  const { user, userData } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<BuyRequest | null>(null)

  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerRequest, setOfferRequest] = useState<BuyRequest | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const [formState, setFormState] = useState({
    title: "",
    category: "",
    quantity: "",
    description: "",
    minBudget: "",
    maxBudget: "",
    location: "",
    deadline: "",
  })

  useEffect(() => {
    const q = query(collection(db, "buy-requests"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          deadline: data.deadline?.toDate(),
        } as BuyRequest
      })
      setBuyRequests(requests)
      setLoading(false)
    })

    const categoriesCollection = collection(db, "categories")
    const unsubscribeCategories = onSnapshot(categoriesCollection, (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })) as CategoryData[]
      setCategories(cats)
    })

    return () => {
      unsubscribe()
      unsubscribeCategories()
    }
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormState((prevState) => ({ ...prevState, [id]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormState((prevState) => ({ ...prevState, category: value }))
  }

  const handlePostRequest = async () => {
    if (!user || !userData) {
      toast.error("You must be logged in to post a request.")
      return
    }

    const { title, category, quantity, description, minBudget, maxBudget, location, deadline } = formState
    if (!title || !category || !quantity || !description || !location) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      await addDoc(collection(db, "buy-requests"), {
        title,
        category,
        quantity: Number(quantity),
        description,
        minBudget: Number(minBudget) || 0,
        maxBudget: Number(maxBudget) || 0,
        location,
        deadline: deadline ? new Date(deadline) : null,
        buyerId: user.uid,
        buyerName: `${userData.firstName} ${userData.lastName}`,
        createdAt: serverTimestamp(),
        status: "active",
        responses: 0,
      })
      
      // Notify all sellers
      const sellersQuery = query(collection(db, "users"), where("role", "==", "seller"));
      const sellersSnapshot = await getDocs(sellersQuery);
      const notificationPromises = sellersSnapshot.docs.map(sellerDoc => {
        const sellerId = sellerDoc.id;
        const notification = {
          userId: sellerId,
          title: "New Buy Request",
          message: `A new request for "${title}" has been posted.`,
          link: `/buy-request`,
          read: false,
          createdAt: serverTimestamp(),
        };
        return addDoc(collection(db, "notifications"), notification);
      });
      await Promise.all(notificationPromises);

      toast.success("Buy request posted successfully!")
      setIsDialogOpen(false)
      setFormState({
        title: "",
        category: "",
        quantity: "",
        description: "",
        minBudget: "",
        maxBudget: "",
        location: "",
        deadline: "",
      })
    } catch (error) {
      console.error("Error posting buy request:", error)
      toast.error("Failed to post buy request.")
    }
  }

  const handleOpenOfferDialog = (request: BuyRequest) => {
    if (!user) {
      toast.error("Please log in to send an offer.");
      return;
    }
    setOfferRequest(request);
    setIsOfferDialogOpen(true);
    setSelectedRequest(null); // Close details dialog if open
  };

  const handleSendOffer = async () => {
    if (!user || !userData) {
      toast.error("You must be logged in to send an offer.");
      return;
    }
    if (!offerRequest || !offerPrice || !offerMessage) {
      toast.error("Please fill in all offer fields.");
      return;
    }
  
    try {
      const buyRequestRef = doc(db, "buy-requests", offerRequest.id);
  
      await runTransaction(db, async (transaction) => {
        const buyRequestDoc = await transaction.get(buyRequestRef);
        if (!buyRequestDoc.exists()) {
          throw "Buy request does not exist anymore.";
        }
  
        const newResponsesCount = (buyRequestDoc.data().responses || 0) + 1;
        transaction.update(buyRequestRef, { responses: newResponsesCount });
  
        const offerCollectionRef = collection(db, "offers");
        const newOfferRef = doc(offerCollectionRef);
        transaction.set(newOfferRef, {
          buyRequestId: offerRequest.id,
          buyRequestTitle: offerRequest.title,
          buyerId: offerRequest.buyerId,
          sellerId: user.uid,
          sellerName: `${userData.firstName} ${userData.lastName}`,
          price: Number(offerPrice),
          message: offerMessage,
          createdAt: serverTimestamp(),
          status: "pending",
        });
      });
      
      // Notify the buyer
      const notification = {
        userId: offerRequest.buyerId,
        title: "New Offer Received",
        message: `You have a new offer for your request: "${offerRequest.title}".`,
        link: `/buyer/orders`, // Or a more specific link
        read: false,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "notifications"), notification);

      toast.success("Offer sent successfully!");
      setIsOfferDialogOpen(false);
      setOfferPrice("");
      setOfferMessage("");
      setOfferRequest(null);
    } catch (error) {
      console.error("Error sending offer:", error);
      toast.error("Failed to send offer. Please try again.");
    }
  };

  // Safe date formatting function
  const formatDate = (date: Date | null) => {
    if (!date) return "No deadline"
    try {
      return format(date, "MMM dd, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  // Safe time ago function
  const getTimeAgo = (date: Date) => {
    try {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return "just now"
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
      
      return format(date, "MMM dd, yyyy")
    } catch {
      return "recently"
    }
  }

  // Function to format currency in Bangladeshi Taka
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', 'Tk')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Buy Requests</h1>
            <p className="text-muted-foreground">Browse buyer requirements or post your own request</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Post Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a Buy Request</DialogTitle>
                <DialogDescription>Tell sellers what you&apos;re looking for and receive offers directly</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Looking for 10 Holstein Dairy Cattle" 
                    value={formState.title} 
                    onChange={handleFormChange} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formState.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="e.g., 10" 
                      value={formState.quantity} 
                      onChange={handleFormChange} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your requirements in detail..." 
                    rows={4} 
                    value={formState.description} 
                    onChange={handleFormChange} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minBudget">Min Budget (Tk)</Label>
                    <Input 
                      id="minBudget" 
                      type="number" 
                      placeholder="e.g., 50000" 
                      value={formState.minBudget} 
                      onChange={handleFormChange} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxBudget">Max Budget (Tk)</Label>
                    <Input 
                      id="maxBudget" 
                      type="number" 
                      placeholder="e.g., 100000" 
                      value={formState.maxBudget} 
                      onChange={handleFormChange} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g., Dhaka, Bangladesh" 
                    value={formState.location} 
                    onChange={handleFormChange} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Response Deadline</Label>
                  <Input 
                    id="deadline" 
                    type="date" 
                    value={formState.deadline} 
                    onChange={handleFormChange} 
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Tips for better responses:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Be specific about quantity and requirements</li>
                      <li>Include your budget range in Bangladeshi Taka</li>
                      <li>Mention quality standards or certifications needed</li>
                      <li>Add delivery location and timeline within Bangladesh</li>
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePostRequest}>Post Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{buyRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Active Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {buyRequests.filter(r => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return r.createdAt > weekAgo
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Array.from(new Set(buyRequests.map(r => r.location.split(',')[1]?.trim() || r.location.split(',')[0]?.trim()))).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Bangladesh Divisions Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buy Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : buyRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No buy requests found. Be the first to post one!</p>
            </div>
          ) : (
            buyRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{request.title}</h3>
                        {request.status === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                        {request.status === "active" && <Badge className="bg-emerald-500">Active</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline">{request.category}</Badge>
                        </span>
                        <span>Qty: {request.quantity}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {request.location}
                        </span>
                        {request.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {formatDate(request.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(request.minBudget)} - {formatCurrency(request.maxBudget)}
                      </p>
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Posted by {request.buyerName}</span>
                      <span>•</span>
                      <span>{getTimeAgo(request.createdAt)}</span>
                    </div>
                    <span className="font-medium text-emerald-600">{request.responses} Responses</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full flex gap-2">
                    <Button className="flex-1" onClick={() => handleOpenOfferDialog(request)}>Send Offer</Button>
                    <Button variant="outline" onClick={() => setSelectedRequest(request)}>View Details</Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* View Details Dialog */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedRequest.title}</DialogTitle>
                <DialogDescription>
                  Posted by {selectedRequest.buyerName} • {getTimeAgo(selectedRequest.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <p className="font-semibold">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <p className="font-semibold">{selectedRequest.quantity}</p>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-muted-foreground">{selectedRequest.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget</Label>
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(selectedRequest.minBudget)} - {formatCurrency(selectedRequest.maxBudget)}
                    </p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="font-semibold">{selectedRequest.location}</p>
                  </div>
                </div>
                {selectedRequest.deadline && (
                  <div>
                    <Label>Deadline</Label>
                    <p className="font-semibold">{formatDate(selectedRequest.deadline)}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
                <Button onClick={() => {
                  if(selectedRequest) {
                    handleOpenOfferDialog(selectedRequest)
                  }
                }}>Send Offer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Send Offer Dialog */}
        <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Offer for &quot;{offerRequest?.title}&quot;</DialogTitle>
              <DialogDescription>
                Submit your price and a message to the buyer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="offerPrice">Your Offer Price (Tk)</Label>
                <Input
                  id="offerPrice"
                  type="number"
                  placeholder="e.g., 85000"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerMessage">Message</Label>
                <Textarea
                  id="offerMessage"
                  placeholder="Include details about your product, delivery, etc."
                  rows={4}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendOffer}>Send Offer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
