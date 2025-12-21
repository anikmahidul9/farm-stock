import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Main Hero Content */}
      <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
                  Trusted Livestock Marketplace
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl text-balance">
                Buy and Sell Quality Livestock with Confidence
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed text-pretty">
                Connect with trusted buyers and sellers across South Africa. Browse thousands of cattle, sheep, goats,
                and more. Quality assured, secure transactions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 text-base">
                Browse Livestock
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 text-base bg-transparent"
              >
                Post Your Listing
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-emerald-600">50K+</div>
                <div className="text-sm text-gray-600 mt-1">Active Listings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">15K+</div>
                <div className="text-sm text-gray-600 mt-1">Trusted Sellers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">98%</div>
                <div className="text-sm text-gray-600 mt-1">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image Grid */}
          <div className="relative lg:h-[600px]">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Large Image */}
              <div className="col-span-2 relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-xl">
                <img src="/healthy-cattle-grazing-in-green-field.jpg" alt="Quality cattle" className="object-cover w-full h-full" />
              </div>

              {/* Small Images */}
              <div className="relative h-48 lg:h-64 rounded-2xl overflow-hidden shadow-lg">
                <img src="/sheep-flock-in-pasture.jpg" alt="Sheep" className="object-cover w-full h-full" />
              </div>
              <div className="relative h-48 lg:h-64 rounded-2xl overflow-hidden shadow-lg">
                <img src="/goats-in-farm-setting.jpg" alt="Goats" className="object-cover w-full h-full" />
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-md border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Quick Search</div>
                  <div className="text-xs text-gray-500 mt-0.5">Find your perfect livestock in seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 -z-10 opacity-20">
        <div className="w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-20">
        <div className="w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
