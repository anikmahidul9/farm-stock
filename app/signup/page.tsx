import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Marketing/Description */}
        <div className="flex flex-col justify-center space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Join the StockLot Community
          </h1>
          <p className="mt-3 text-lg leading-6 text-gray-600">
            Create your account to buy and sell livestock with ease. Connect with a network of farmers and buyers.
          </p>
          <p className="text-sm text-gray-500">
            Already have an account? <Link href="/signin" className="font-medium text-emerald-600 hover:text-emerald-500">Sign in</Link>
          </p>
        </div>

        {/* Right Column: Sign Up Form */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="Max" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Robinson" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              {/* Role Selection */}
              <div className="grid gap-2">
                <Label>I am a:</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="buyer" name="role" value="buyer" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" defaultChecked />
                    <Label htmlFor="buyer">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="seller" name="role" value="seller" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                    <Label htmlFor="seller">Seller</Label>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Create an account
              </Button>
              <Button variant="outline" className="w-full">
                Sign up with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm md:hidden"> {/* Hide on medium screens and up */}
              Already have an account?{" "}
              <Link href="/signin" className="underline text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
