"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller';
      case 'buyer':
        return '/buyer';
      default:
        return '/'; // Fallback to home page if role is unknown
    }
  }

  const handleLoginSuccess = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const redirectPath = getRedirectPath(userData.role);
      router.push(redirectPath);
    } else {
      // This case should ideally not happen for a user signing in,
      // but as a fallback, send them to the homepage.
      setError("User profile not found. Please contact support.");
      router.push("/");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(userCredential.user);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
      console.error(err);
      setLoading(false); // Only set loading to false on error
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      await handleLoginSuccess(result.user);
    } catch (error: any) {
      setError("Failed to sign in with Google. Please try again.");
      console.error(error);
      setGoogleLoading(false); // Only set loading to false on error
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
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

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline text-emerald-600 hover:text-emerald-500">
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" disabled={loading || googleLoading}>
                  {loading && <Spinner className="h-4 w-4" />}
                  Login
                </Button>
                <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
                  {googleLoading && <Spinner className="h-4 w-4" />}
                  Login with Google
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm md:hidden">
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
