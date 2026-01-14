
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCheck, ShoppingCart, Heart, MessageSquare, AlertCircle, TrendingUp, Package } from "lucide-react"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "order",
      icon: ShoppingCart,
      title: "Order Confirmed",
      message: "Your order for Premium Holstein Dairy Cow has been confirmed",
      time: "5 minutes ago",
      read: false,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      id: 2,
      type: "message",
      icon: MessageSquare,
      title: "New Message",
      message: "Green Valley Farm replied to your inquiry",
      time: "1 hour ago",
      read: false,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: 3,
      type: "wishlist",
      icon: Heart,
      title: "Price Drop Alert",
      message: "Merino Sheep price dropped by 15%",
      time: "3 hours ago",
      read: false,
      color: "text-rose-600 bg-rose-50",
    },
    {
      id: 4,
      type: "alert",
      icon: AlertCircle,
      title: "Stock Alert",
      message: "Items in your wishlist are running low on stock",
      time: "5 hours ago",
      read: true,
      color: "text-amber-600 bg-amber-50",
    },
    {
      id: 5,
      type: "delivery",
      icon: Package,
      title: "Delivery Update",
      message: "Your order is out for delivery",
      time: "1 day ago",
      read: true,
      color: "text-purple-600 bg-purple-50",
    },
    {
      id: 6,
      type: "market",
      icon: TrendingUp,
      title: "Market Update",
      message: "Cattle prices increased by 8% this week",
      time: "2 days ago",
      read: true,
      color: "text-indigo-600 bg-indigo-50",
    },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-balance">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread notifications</p>}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Card key={notification.id} className={!notification.read ? "border-l-4 border-l-emerald-600" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-pretty">{notification.title}</h3>
                          {!notification.read && <Badge className="bg-emerald-600 ml-2">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 text-pretty">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            {notifications
              .filter((n) => !n.read)
              .map((notification) => {
                const Icon = notification.icon
                return (
                  <Card key={notification.id} className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-pretty">{notification.title}</h3>
                            <Badge className="bg-emerald-600 ml-2">New</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 text-pretty">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>

          <TabsContent value="orders" className="space-y-3">
            {notifications
              .filter((n) => n.type === "order" || n.type === "delivery")
              .map((notification) => {
                const Icon = notification.icon
                return (
                  <Card key={notification.id} className={!notification.read ? "border-l-4 border-l-emerald-600" : ""}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-pretty">{notification.title}</h3>
                            {!notification.read && <Badge className="bg-emerald-600 ml-2">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 text-pretty">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            {notifications
              .filter((n) => n.type === "message")
              .map((notification) => {
                const Icon = notification.icon
                return (
                  <Card key={notification.id} className={!notification.read ? "border-l-4 border-l-emerald-600" : ""}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-pretty">{notification.title}</h3>
                            {!notification.read && <Badge className="bg-emerald-600 ml-2">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 text-pretty">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
