import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Marketing/Description */}
        <div className="flex flex-col justify-center space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Welcome Back to StockLot
          </h1>
          <p className="mt-3 text-lg leading-6 text-gray-600">
            Connect with the best livestock marketplace. Sign in to manage your listings, requests, and messages.
          </p>
          <p className="text-sm text-gray-500">
            New here? <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">Create an account</Link>
          </p>
        </div>

        {/* Right Column: Login Form */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline text-emerald-600 hover:text-emerald-500">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm md:hidden"> {/* Hide on medium screens and up */}
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline text-emerald-600 hover:text-emerald-500">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
