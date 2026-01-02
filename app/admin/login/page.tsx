"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function AdminLogin() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground h-12 w-12 rounded flex items-center justify-center font-bold text-2xl mb-4">
            M
          </div>
          <CardTitle className="text-2xl">MarketAdmin Access</CardTitle>
          <CardDescription>Enter your credentials to access the management panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@market.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/admin">Sign In</Link>
          </Button>
          <Button variant="link" className="text-xs text-muted-foreground">
            Forgot password?
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
