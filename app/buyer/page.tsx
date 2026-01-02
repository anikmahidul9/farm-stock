import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Truck, Heart, ArrowRight, Star, LucidePackageOpen as LucidePackageIcon, Zap } from "lucide-react"
import Link from "next/link"

export default function BuyerOverview() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">Welcome back, Sarah! 👋</h1>
        <p className="text-orange-600/80">Get the freshest produce from your local farmers today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border-orange-100 shadow-sm bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800/70">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-950">12</div>
            <p className="text-xs text-orange-600/60">+2 from last month</p>
          </CardContent>
          <div className="h-1 w-full bg-orange-100 mt-2">
            <div className="h-full bg-orange-500 w-2/3" />
          </div>
        </Card>
        <Card className="border-orange-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800/70">Active Orders</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-950">02</div>
            <p className="text-xs text-orange-600/60">Next delivery tomorrow</p>
          </CardContent>
        </Card>
        <Card className="border-orange-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800/70">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-950">08</div>
            <p className="text-xs text-orange-600/60">3 items on sale</p>
          </CardContent>
        </Card>
        <Card className="border-orange-100 shadow-sm bg-white overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Fresh Rewards</CardTitle>
            <Star className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450 pts</div>
            <p className="text-xs text-orange-100/70">50 pts to next reward</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="border-orange-100 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-orange-900">Track Recent Orders</CardTitle>
            <Link href="/buyer/orders">
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg border border-orange-50 bg-orange-50/20 hover:bg-orange-50/40 transition-colors"
              >
                <div className="h-12 w-12 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-orange-950 text-sm">Order #892{i}</h4>
                  <p className="text-xs text-orange-600/70">Organic Harvest Box & 3 more items</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                    {i === 1 ? "Out for Delivery" : "Processing"}
                  </span>
                  <p className="text-xs font-semibold text-orange-900 mt-1">$45.00</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Browse Categories */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-orange-900">Explore Categories</h3>
          <div className="grid grid-cols-2 gap-4">
            {["Vegetables", "Fruits", "Dairy & Eggs", "Organic Honey"].map((cat) => (
              <Button
                key={cat}
                variant="outline"
                className="h-24 flex-col gap-2 border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all group"
              >
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <LucidePackageIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{cat}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
            <h3 className="text-xl font-bold text-orange-900">Recommended for You</h3>
          </div>
          <Link href="/buyer/browse">
            <Button variant="link" className="text-orange-600 p-0 h-auto">
              View all products
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Organic Red Tomatoes", price: "$4.50", farm: "Green Valley Farm", rating: 4.8 },
            { name: "Fresh Baby Spinach", price: "$3.20", farm: "Sunny Acres", rating: 4.9 },
            { name: "Pure Golden Honey", price: "$12.00", farm: "Bee Happy Apiary", rating: 5.0 },
            { name: "Farm Fresh Eggs", price: "$6.50", farm: "Maplewood Poultry", rating: 4.7 },
          ].map((product, idx) => (
            <Card key={idx} className="group border-orange-100 overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-orange-50 relative overflow-hidden">
                <div className="absolute top-2 right-2 z-10">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm">
                    <Heart className="h-4 w-4 text-orange-500" />
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Image Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-orange-200">
                  <LucidePackageIcon className="h-12 w-12" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                  {product.rating}
                </div>
                <h4 className="font-bold text-orange-950 leading-tight mb-1 group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h4>
                <p className="text-xs text-orange-600/60 mb-3">{product.farm}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-orange-900">{product.price}</span>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8 px-3">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
