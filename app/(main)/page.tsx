
import { Button } from "@/components/ui/button";
import { User, Plus, Users } from "lucide-react";
import { Hero } from "../components/Hero";
import { BrowseCategories } from "../components/BrowseCategory";
import { Features } from "../components/Feature";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category, Review } from "@/types";
import { UserReviews } from "../components/UserReviews";

async function getCategories() {
  const querySnapshot = await getDocs(collection(db, "categories"));
  const categoriesData = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      icon: data.icon,
      count: data.count,
      color: data.color,
      imageURL: data.imageUrl,
      numberOfProducts: data.numberOfProducts,
      alertThreshold: data.alertThreshold,
      unit: data.unit,
    } as Category;
  });
  return categoriesData;
}

async function getReviews() {
  const querySnapshot = await getDocs(collection(db, "reviews"));
  if (querySnapshot.empty) {
    return [
      {
        id: "1",
        user: "Alice",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        review:
          "StockLot has revolutionized how I manage my farm's inventory. The real-time tracking and analytics are game-changers!",
        role: "Dairy Farmer",
      },
      {
        id: "2",
        user: "John",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        review:
          "The marketplace is fantastic. I've been able to connect with local buyers and get the best prices for my livestock.",
        role: "Cattle Rancher",
      },
      {
        id: "3",
        user: "Mary",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
        review:
          "As a small-scale poultry farmer, StockLot has given me access to a wider market. The app is user-friendly and very intuitive.",
        role: "Poultry Farmer",
      },
    ];
  }
  const reviewsData = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      avatar: data.avatar,
      review: data.review,
      role: data.role,
    } as Review;
  });
  return reviewsData;
}

export default async function Home() {
  const categories = await getCategories();
  const reviews = await getReviews();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero/>

      {/* Categories Section */}
      <BrowseCategories categories={categories} />

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
      {/* <UserReviews reviews={reviews} /> */}

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
