import { Shield, Zap, Users, MapPin, CreditCard, HeadphonesIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Buy and sell with confidence using our secure payment system and buyer protection guarantee.",
  },
  {
    icon: Zap,
    title: "Fast Listings",
    description: "Post your livestock in minutes with our streamlined listing process and reach thousands of buyers.",
  },
  {
    icon: Users,
    title: "Verified Sellers",
    description: "All sellers are thoroughly verified to ensure authenticity and maintain marketplace quality.",
  },
  {
    icon: MapPin,
    title: "Local & Global Reach",
    description: "Connect with buyers and sellers in your area or expand your reach to international markets.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Multiple payment options including credit wallet, cards, and escrow services for large transactions.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our dedicated support team is always ready to help with any questions or concerns you may have.",
  },
]

export function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose StockLot?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The most trusted livestock marketplace with features designed for modern agriculture
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow border border-gray-200">
                <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
