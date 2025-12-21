"use client"

import { useState } from "react"
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


const buyRequests = [
  {
    id: 1,
    title: "Looking for 10 Holstein Dairy Cattle",
    category: "Cattle",
    budget: "400,000 - 500,000",
    quantity: 10,
    location: "Punjab, India",
    postedBy: "Amit Kumar",
    postedDate: "2 days ago",
    deadline: "15 days left",
    description:
      "Need healthy Holstein dairy cattle for our new dairy farm. Must be disease-free with vaccination records.",
    responses: 8,
    status: "active",
  },
  {
    id: 2,
    title: "Bulk Order: 500 Broiler Chickens",
    category: "Poultry",
    budget: "150,000 - 180,000",
    quantity: 500,
    location: "Gujarat, India",
    postedBy: "Priya Farms",
    postedDate: "5 hours ago",
    deadline: "7 days left",
    description: "Looking for 6-week old broiler chickens for commercial purposes. Must deliver within Gujarat.",
    responses: 3,
    status: "active",
  },
  {
    id: 3,
    title: "Merino Sheep for Wool Production",
    category: "Sheep",
    budget: "80,000 - 100,000",
    quantity: 5,
    location: "Rajasthan, India",
    postedBy: "Desert Wool Co.",
    postedDate: "1 day ago",
    deadline: "20 days left",
    description: "Need premium Merino sheep for wool production. Looking for healthy breeding stock.",
    responses: 12,
    status: "active",
  },
  {
    id: 4,
    title: "Goats for Meat - Immediate Need",
    category: "Goats",
    budget: "50,000 - 60,000",
    quantity: 8,
    location: "Karnataka, India",
    postedBy: "Organic Meats",
    postedDate: "3 days ago",
    deadline: "3 days left",
    description: "Urgent requirement for healthy goats. Must be ready for immediate delivery.",
    responses: 15,
    status: "urgent",
  },
  {
    id: 5,
    title: "Jersey Cows for Small Dairy",
    category: "Cattle",
    budget: "150,000 - 200,000",
    quantity: 4,
    location: "Kerala, India",
    postedBy: "Green Valley Dairy",
    postedDate: "1 week ago",
    deadline: "10 days left",
    description: "Looking for Jersey cows with good milk yield history. Prefer young cows.",
    responses: 6,
    status: "active",
  },
]

export default function BuyRequestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
                <DialogDescription>Tell sellers what you're looking for and receive offers directly</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title *</Label>
                  <Input id="title" placeholder="e.g., Looking for 10 Holstein Dairy Cattle" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cattle">Cattle</SelectItem>
                        <SelectItem value="poultry">Poultry</SelectItem>
                        <SelectItem value="sheep">Sheep</SelectItem>
                        <SelectItem value="goats">Goats</SelectItem>
                        <SelectItem value="fish">Fish</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input id="quantity" type="number" placeholder="e.g., 10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Describe your requirements in detail..." rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-budget">Min Budget (₹)</Label>
                    <Input id="min-budget" type="number" placeholder="e.g., 50000" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-budget">Max Budget (₹)</Label>
                    <Input id="max-budget" type="number" placeholder="e.g., 100000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="e.g., Punjab, India" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Response Deadline</Label>
                  <Input id="deadline" type="date" />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Tips for better responses:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Be specific about quantity and requirements</li>
                      <li>Include your budget range</li>
                      <li>Mention quality standards or certifications needed</li>
                      <li>Add delivery location and timeline</li>
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Post Request</Button>
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
                  <p className="text-2xl font-bold">124</p>
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
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-sm text-muted-foreground">States Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buy Requests List */}
        <div className="space-y-4">
          {buyRequests.map((request) => (
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
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {request.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">₹{request.budget}</p>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{request.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Posted by {request.postedBy}</span>
                    <span>•</span>
                    <span>{request.postedDate}</span>
                  </div>
                  <span className="font-medium text-emerald-600">{request.responses} Responses</span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full flex gap-2">
                  <Button className="flex-1">Send Offer</Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
