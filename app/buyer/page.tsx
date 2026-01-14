import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Store, Package } from "lucide-react"

export default function BuyerPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Buyer Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">2 new items added</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">1 new seller saved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">#3210</TableCell>
                <TableCell>White Broiler Chickens</TableCell>
                <TableCell>2023-11-23</TableCell>
                <TableCell><Badge>Delivered</Badge></TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#3209</TableCell>
                <TableCell>Brown Jersey Dairy Cow</TableCell>
                <TableCell>2023-11-22</TableCell>
                <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#3208</TableCell>
                <TableCell>Goats in Farm Setting</TableCell>
                <TableCell>2023-11-21</TableCell>
                <TableCell><Badge>Delivered</Badge></TableCell>
                <TableCell className="text-right">$350.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#3207</TableCell>
                <TableCell>Healthy Cattle Grazing</TableCell>
                <TableCell>2023-11-20</TableCell>
                <TableCell><Badge variant="destructive">Cancelled</Badge></TableCell>
                <TableCell className="text-right">$450.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#3206</TableCell>
                <TableCell>White Merino Sheep</TableCell>
                <TableCell>2023-11-19</TableCell>
                <TableCell><Badge>Delivered</Badge></TableCell>
                <TableCell className="text-right">$550.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
