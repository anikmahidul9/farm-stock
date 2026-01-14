import Link from "next/link";
import Image from "next/image";
import { Beef, Bird, Rabbit, Fish, Egg, Dog, LucideProps } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Category } from "@/types";

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Beef,
  Bird,
  Rabbit,
  Fish,
  Egg,
  Dog,
};

export function BrowseCategories({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Browse by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect livestock for your needs across our wide range of
            categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {categories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <Link
                key={category.name}
                href={`/marketplace?category=${category.name}`}
              >
                <Card className="p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 border-none cursor-pointer h-full">
                  {category.imageURL ? (
                    <div className="relative h-24 w-24 mx-auto mb-3">
                      <Image
                        src={category.imageURL}
                        alt={category.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    Icon && (
                      <Icon
                        className="w-12 h-12 mx-auto mb-3"
                        strokeWidth={1.5}
                      />
                    )
                  )}
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm opacity-80">
                    {category.numberOfProducts !== undefined
                      ? `${category.numberOfProducts} products`
                      : category.count}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
