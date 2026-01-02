import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Wallet, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function SellerDashboard() {
  const stats = [
    {
      title: "Total Products",
      value: "24",
      description: "5 added this month",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Orders",
      value: "12",
      description: "3 pending acceptance",
      icon: ShoppingCart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Sales",
      value: "$1,240.00",
      description: "+12.5% from last week",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Wallet Balance",
      value: "$850.50",
      description: "Available for withdrawal",
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const lowStockProducts = [
    { name: "Organic Tomatoes", stock: 5, limit: 10 },
    { name: "Fresh Spinach", stock: 2, limit: 15 },
    { name: "Honey (500g)", stock: 8, limit: 10 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Green Valley Farm</h1>
        <p className="text-muted-foreground">Here's what's happening with your farm today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>You have 3 new orders to review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Order #ORD-{2430 + i}</p>
                    <p className="text-xs text-muted-foreground">Customer: John Doe • 2 items • $45.00</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    New
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lowStockProducts.map((product) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">
                      {product.stock} / {product.limit} units
                    </span>
                  </div>
                  <Progress
                    value={(product.stock / product.limit) * 100}
                    className="h-2 bg-amber-100"
                    indicatorClassName="bg-amber-500"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
