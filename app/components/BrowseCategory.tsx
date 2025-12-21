import Link from "next/link"
import { Beef, Bird, Rabbit, Fish, Egg, Dog } from "lucide-react"
import { Card } from "@/components/ui/card"

const categories = [
  {
    name: "Cattle",
    icon: Beef,
    count: "2,543 listings",
    color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  },
  {
    name: "Poultry",
    icon: Bird,
    count: "1,876 listings",
    color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
  {
    name: "Sheep",
    icon: Rabbit,
    count: "1,234 listings",
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    name: "Goats",
    icon: Rabbit,
    count: "987 listings",
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  },
  {
    name: "Fish",
    icon: Fish,
    count: "654 listings",
    color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
  },
  {
    name: "Dairy",
    icon: Egg,
    count: "432 listings",
    color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  },
  {
    name: "Working Animals",
    icon: Dog,
    count: "321 listings",
    color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  },
  {
    name: "Pets",
    icon: Dog,
    count: "245 listings",
    color: "bg-pink-50 text-pink-600 hover:bg-pink-100",
  },
]

export function BrowseCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect livestock for your needs across our wide range of categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.name} href={`/category/${category.name.toLowerCase()}`}>
                <Card
                  className={`p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 ${category.color} border-none cursor-pointer`}
                >
                  <Icon className="w-12 h-12 mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm opacity-80">{category.count}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
