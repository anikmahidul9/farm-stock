
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Review = {
  id: string;
  user: string;
  avatar: string;
  review: string;
  role: string;
};

type UserReviewsProps = {
  reviews: Review[];
};

export function UserReviews({ reviews }: UserReviewsProps) {
  return (
    <section className="relative z-0 bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          What Our Users Say
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-white p-6">
              <p className="text-gray-600">{review.review}</p>
              <div className="mt-4 flex items-center">
                <Avatar>
                  <AvatarImage src={review.avatar} alt={review.user} />
                  <AvatarFallback>{review.user?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">{review.user}</p>
                  <p className="text-gray-600">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
