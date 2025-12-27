
import { Button } from "@/components/ui/button";
import { User, Plus, Users } from "lucide-react";
import { Hero } from "./components/Hero";
import { BrowseCategories } from "./components/BrowseCategory";
import { Features } from "./components/Feature";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero/>

      {/* Categories Section */}
      <BrowseCategories />

      {/* Featured Listings Section */}
      <Features />

      {/* How It Works Section */}
      <section className="relative z-0 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            How It Works
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <Link href="/signup">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <User className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Create an Account
              </h3>
              <p className="mt-2 text-gray-600">
                Sign up for free and create your profile.
              </p>
            </div>
            </Link>
            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                List Your Livestock
              </h3>
              <p className="mt-2 text-gray-600">
                Create a listing for your livestock with details and photos.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Connect with Buyers
              </h3>
              <p className="mt-2 text-gray-600">
                Connect with interested buyers and manage your sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-0 bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            What Our Users Say
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial Card 1 */}
            <div className="rounded-lg border bg-white p-6">
              <p className="text-gray-600">
                "StockLot is the best platform to sell livestock. I sold my
                cattle in just a few days."
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">John Doe</p>
                  <p className="text-gray-600">Farmer</p>
                </div>
              </div>
            </div>
            {/* Testimonial Card 2 */}
            <div className="rounded-lg border bg-white p-6">
              <p className="text-gray-600">
                "I found the perfect sheep for my farm on StockLot. The process
                was smooth and easy."
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">Jane Smith</p>
                  <p className="text-gray-600">Farmer</p>
                </div>
              </div>
            </div>
            {/* Testimonial Card 3 */}
            <div className="rounded-lg border bg-white p-6">
              <p className="text-gray-600">
                "A great platform for both buyers and sellers. Highly
                recommended!"
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">Mike Johnson</p>
                  <p className="text-gray-600">Trader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-0 bg-emerald-600 py-20 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="mt-2 text-lg">
            Create an account today and start trading livestock.
          </p>
          <Link href="/signup">
          <Button
            variant="outline"
            className="mt-8 border-white text-white hover:bg-white hover:text-emerald-600"
          >
            Sign Up Now
          </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
