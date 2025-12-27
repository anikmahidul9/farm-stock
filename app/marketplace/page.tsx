"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Navbar } from "../components/Navbar"


const listings = [
  {
    id: 1,
    title: "Premium Holstein Dairy Cattle",
    price: 450000,
    location: "Dhaka, Bangladesh",
    seller: "Rajesh Farms",
    rating: 4.8,
    reviews: 24,
    image: "/black-and-white-holstein-dairy-cow.jpg",
    category: "Cattle",
    verified: true,
    age: "3 years",
    weight: "550 kg",
  },
  {
    id: 2,
    title: "Healthy Broiler Chickens",
    price: 3500,
    location: "Chittagong, Bangladesh",
    seller: "Poultry Paradise",
    rating: 4.6,
    reviews: 18,
    image: "/healthy-white-broiler-chickens.jpg",
    category: "Poultry",
    verified: true,
    age: "6 weeks",
    weight: "2.5 kg",
  },
  {
    id: 3,
    title: "Merino Wool Sheep",
    price: 180000,
    location: "Sylhet, Bangladesh",
    seller: "Desert Livestock",
    rating: 4.9,
    reviews: 31,
    image: "/white-merino-sheep-with-wool.jpg",
    category: "Sheep",
    verified: true,
    age: "2 years",
    weight: "65 kg",
  },
  {
    id: 4,
    title: "Boer Goats for Meat",
    price: 120000,
    location: "Khulna, Bangladesh",
    seller: "Southern Farms",
    rating: 4.7,
    reviews: 15,
    image: "/brown-and-white-boer-goat.jpg",
    category: "Goats",
    verified: true,
    age: "1.5 years",
    weight: "45 kg",
  },
  {
    id: 5,
    title: "Jersey Dairy Cows",
    price: 380000,
    location: "Rajshahi, Bangladesh",
    seller: "Green Pastures",
    rating: 4.8,
    reviews: 22,
    image: "/brown-jersey-dairy-cow.jpg",
    category: "Cattle",
    verified: true,
    age: "4 years",
    weight: "480 kg",
  },
  {
    id: 6,
    title: "Free Range Ducks",
    price: 8000,
    location: "Barisal, Bangladesh",
    seller: "River Farm",
    rating: 4.5,
    reviews: 12,
    image: "/white-ducks-on-farm.jpg",
    category: "Poultry",
    verified: true,
    age: "4 months",
    weight: "3 kg",
  },
]

const categories = ["All", "Cattle", "Poultry", "Sheep", "Goats", "Fish", "Dairy"]
const priceRanges = ["All Prices", "Under Tk 5,000", "Tk 5,000 - Tk 20,000", "Tk 20,000 - Tk 50,000", "Above Tk 50,000"]

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse and discover quality livestock from verified sellers</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search livestock, breeds, or sellers..." className="pl-10" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Filters</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Price Range</Label>
                    <Select defaultValue="All Prices">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Location</Label>
                    <Input placeholder="Enter location" />
                  </div>

                  {/* Verified Sellers */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="verified" defaultChecked />
                    <Label htmlFor="verified" className="text-sm cursor-pointer">
                      Verified sellers only
                    </Label>
                  </div>

                  {/* Age Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Age</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age1" />
                        <Label htmlFor="age1" className="text-sm cursor-pointer">
                          Under 1 year
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age2" />
                        <Label htmlFor="age2" className="text-sm cursor-pointer">
                          1-3 years
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="age3" />
                        <Label htmlFor="age3" className="text-sm cursor-pointer">
                          Above 3 years
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">Showing {listings.length} listings</p>
              <Select defaultValue="recent">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    {listing.verified && <Badge className="absolute top-2 right-2 bg-emerald-500">Verified</Badge>}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                      <Badge variant="outline">{listing.category}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">Tk{listing.price.toLocaleString()}</p>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {listing.rating} ({listing.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <span>Age: {listing.age}</span>
                        <span>Weight: {listing.weight}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <div className="w-full flex gap-2">
                      <Button className="flex-1">View Details</Button>
                      <Button variant="outline">Contact</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
