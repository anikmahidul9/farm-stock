import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailPage() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-3xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground">
          Unfortunately, we were unable to process your payment. Please try again.
        </p>
        <div className="flex gap-4">
          <Link href="/buyer/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
