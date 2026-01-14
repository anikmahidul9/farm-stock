"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        role,
        createdAt: new Date(),
      });

      // Redirect to the role-specific dashboard
      router.push(getRedirectPath(role));

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userRole = role; // Default to the role selected on the page

      if (!userDoc.exists()) {
        const nameParts = user.displayName?.split(" ") || [""];
        const newFirstName = nameParts[0];
        const newLastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        await setDoc(userDocRef, {
          uid: user.uid,
          firstName: newFirstName,
          lastName: newLastName,
          email: user.email,
          role: userRole,
          createdAt: new Date(),
        });
      } else {
        // If user doc exists, use their existing role
        userRole = userDoc.data().role;
      }
      
      const redirectPath = getRedirectPath(userRole);
      router.push(redirectPath);

    } catch (error: any) {
      setError("Failed to sign up with Google. Please try again.");
      console.error(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
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

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>I am a:</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="buyer" name="role" value="buyer" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" checked={role === 'buyer'} onChange={() => setRole('buyer')} />
                      <Label htmlFor="buyer">Buyer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="seller" name="role" value="seller" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" checked={role === 'seller'} onChange={() => setRole('seller')} />
                      <Label htmlFor="seller">Seller</Label>
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" disabled={loading || googleLoading}>
                  {loading && <Spinner className="h-4 w-4" />}
                  Create an account
                </Button>
                <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={handleGoogleSignUp} disabled={loading || googleLoading}>
                  {googleLoading && <Spinner className="h-4 w-4" />}
                  Sign up with Google
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm md:hidden">
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
