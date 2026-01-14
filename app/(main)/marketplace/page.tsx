'use client';
import { useEffect, useState } from "react";
import { collection, getDocs, doc, writeBatch, onSnapshot, deleteDoc, setDoc, serverTimestamp, query, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  location: string;
  sellerId: string;
  sellerName: string;
  imageUrls: string[];
  category: string;
  categoryName: string;
  unit: string;
  unitName: string;
  age: number;
  weight: number;
  description: string;
  rating?: number;
  reviews?: number;
  isVerified?: boolean; // Add this field
};

type CategoryData = {
  id: string;
  name: string;
};

type UnitData = {
  id: string;
  name: string;
};

const priceRanges = ["All Prices", "Under Tk 5,000", "Tk 5,000 - Tk 20,000", "Tk 20,000 - Tk 50,000", "Above Tk 50,000"];

// Add this function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('BDT', 'Tk');
};

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
  const [unitMap, setUnitMap] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices");
  const [locationFilter, setLocationFilter] = useState("");
  const [verifiedSellersOnly, setVerifiedSellersOnly] = useState(false);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleMessageSeller = async (sellerId: string) => {
    if (!user) {
      toast.error("Please sign in to message sellers.");
      return;
    }
    if (user.uid === sellerId) {
      toast.info("You cannot message yourself.");
      return;
    }

    try {
      const conversationsRef = collection(db, "conversations");
      const q = query(
        conversationsRef,
        where("participants", "array-contains", user.uid)
      );

      const querySnapshot = await getDocs(q);
      let existingConversation: { id: string, participants: string[] } | null = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(sellerId)) {
          existingConversation = { id: doc.id, ...data } as { id: string, participants: string[] };
        }
      });

      if (existingConversation) {
        router.push(`/messages/${existingConversation.id}`);
      } else {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
          participants: [user.uid, sellerId],
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageAt: serverTimestamp(),
        });
        router.push(`/messages/${newConversationRef.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  useEffect(() => {
    if (user) {
      const wishlistRef = collection(db, "users", user.uid, "wishlist");
      const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
        const newWishlist = new Set<string>();
        snapshot.forEach((doc) => {
          newWishlist.add(doc.id);
        });
        setWishlist(newWishlist);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleWishlistToggle = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to add items to your wishlist.");
      return;
    }

    const wishlistItemRef = doc(db, "users", user.uid, "wishlist", productId);
    const newWishlist = new Set(wishlist);

    try {
      if (newWishlist.has(productId)) {
        await deleteDoc(wishlistItemRef);
        newWishlist.delete(productId);
        toast.success("Removed from wishlist.");
      } else {
        await setDoc(wishlistItemRef, { productId, addedAt: new Date() });
        newWishlist.add(productId);
        toast.success("Added to wishlist.");
      }
      setWishlist(newWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist.");
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })) as CategoryData[];
        setCategories(categoriesData);
        const catMap = new Map<string, string>();
        categoriesData.forEach(cat => catMap.set(cat.id, cat.name));
        setCategoryMap(catMap);

        // Fetch Units
        const unitsSnapshot = await getDocs(collection(db, "units"));
        const unitsData = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })) as UnitData[];
        setUnits(unitsData);
        const uMap = new Map<string, string>();
        unitsData.forEach(unit => uMap.set(unit.id, unit.name));
        setUnitMap(uMap);
      } catch (error) {
        console.error("Error fetching initial data: ", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (categoryMap.size === 0 || unitMap.size === 0) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            location: data.location,
            sellerId: data.sellerId,
            sellerName: data.sellerName,
            imageUrls: data.imageUrls || [],
            category: data.category,
            categoryName: categoryMap.get(data.category) || "Unknown",
            unit: data.unit,
            unitName: unitMap.get(data.unit) || "Unknown",
            age: data.age || 0,
            weight: data.weight || 0,
            description: data.description || "",
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            isVerified: data.isVerified || false,
          };
        }) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [categoryMap, unitMap]);

  const parsePriceRange = (range: string) => {
    if (range === "All Prices") return { min: 0, max: Infinity };
    if (range === "Under Tk 5,000") return { min: 0, max: 5000 };
    if (range === "Tk 5,000 - Tk 20,000") return { min: 5000, max: 20000 };
    if (range === "Tk 20,000 - Tk 50,000") return { min: 20000, max: 50000 };
    if (range === "Above Tk 50,000") return { min: 50000, max: Infinity };
    return { min: 0, max: Infinity };
  };

  const handleAgeRangeChange = (range: string, checked: boolean) => {
    setSelectedAgeRanges(prev =>
      checked ? [...prev, range] : prev.filter(r => r !== range)
    );
  };

  const filteredProducts = products.filter(product => {
    // Search Filter
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sellerName.toLowerCase().includes(searchQuery.toLowerCase());

    // Category Filter
    const matchesCategory = selectedCategory === "All" || product.categoryName === selectedCategory;

    // Price Range Filter
    const { min: minPrice, max: maxPrice } = parsePriceRange(selectedPriceRange);
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

    // Location Filter
    const matchesLocation = locationFilter === "" || 
      product.location.toLowerCase().includes(locationFilter.toLowerCase());

    // Verified Sellers Filter
    const matchesVerified = !verifiedSellersOnly || product.isVerified;

    // Age Range Filter
    const matchesAge = selectedAgeRanges.length === 0 || selectedAgeRanges.some(range => {
      if (range === "Under 1 year") return product.age < 365;
      if (range === "1-3 years") return product.age >= 365 && product.age <= (3 * 365);
      if (range === "Above 3 years") return product.age > (3 * 365);
      return false;
    });

    return matchesSearch && matchesCategory && matchesPrice && matchesLocation && matchesVerified && matchesAge;
  });

  return (
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
            <Input
              placeholder="Search livestock, breeds, or sellers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories.map(cat => cat.name)].map((categoryName) => (
            <Button
              key={categoryName}
              variant={selectedCategory === categoryName ? "default" : "outline"}
              onClick={() => setSelectedCategory(categoryName)}
              className="whitespace-nowrap"
            >
              {categoryName}
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
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
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
                  <Input
                    placeholder="Enter location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>

                {/* Verified Sellers */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={verifiedSellersOnly}
                    onCheckedChange={(checked: boolean) => setVerifiedSellersOnly(checked)}
                  />
                  <Label htmlFor="verified" className="text-sm cursor-pointer">
                    Verified sellers only
                  </Label>
                </div>

                {/* Age Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Age</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="age1"
                        checked={selectedAgeRanges.includes("Under 1 year")}
                        onCheckedChange={(checked: boolean) => handleAgeRangeChange("Under 1 year", checked)}
                      />
                      <Label htmlFor="age1" className="text-sm cursor-pointer">
                        Under 1 year
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="age2"
                        checked={selectedAgeRanges.includes("1-3 years")}
                        onCheckedChange={(checked: boolean) => handleAgeRangeChange("1-3 years", checked)}
                      />
                      <Label htmlFor="age2" className="text-sm cursor-pointer">
                        1-3 years
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="age3"
                        checked={selectedAgeRanges.includes("Above 3 years")}
                        onCheckedChange={(checked: boolean) => handleAgeRangeChange("Above 3 years", checked)}
                      />
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
            <p className="text-sm text-muted-foreground">Showing {filteredProducts.length} listings</p>
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

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-sm">
                  <div className="relative">
                    <Skeleton className="w-full h-48" />
                  </div>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">No products found matching your criteria.</p>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={product.imageUrls[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/50 hover:bg-white rounded-full"
                        onClick={(e) => handleWishlistToggle(product.id, e)}
                      >
                        <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                      </Button>
                      {product.isVerified && <Badge className="absolute top-2 left-2 bg-emerald-500">Verified</Badge>}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        <Badge variant="outline">{product.categoryName}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                      {product.rating !== undefined && product.reviews !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>
                            {product.rating.toFixed(1)} ({product.reviews} reviews)
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{product.location}</span>
                        </div>
                        <div className="flex gap-4">
                          <span>Age: {product.age} days</span>
                          <span>Weight: {product.weight} kg</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <div className="w-full flex gap-2">
                        <Link href={`/marketplace/${product.id}`} className="flex-1">
                          <Button className="w-full">View Details</Button>
                        </Link>
                        <Button variant="outline" onClick={() => handleMessageSeller(product.sellerId)}>Contact</Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}