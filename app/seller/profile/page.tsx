"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, ShieldCheck, CreditCard, Upload, MapPin, Phone, Mail } from "lucide-react"

export default function SellerProfile() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Seller Profile</h1>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <ShieldCheck className="mr-1 h-3 w-3" /> Verified Seller
          </Badge>
        </div>
        <p className="text-muted-foreground">Manage your farm details, business documents, and payout accounts.</p>
      </div>

      <Tabs defaultValue="farm" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="farm" className="gap-2">
            <User className="h-4 w-4" /> Farm Details
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Verification
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" /> Payment Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farm">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your farm or shop profile visible to customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm/Vendor Name</Label>
                    <Input id="farmName" defaultValue="Green Valley Farm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Primary Contact Name</Label>
                    <Input id="ownerName" defaultValue="Farmer John" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" className="pl-9" defaultValue="farmer@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" className="pl-9" defaultValue="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-9"
                      defaultValue="123 Fresh Lane, Garden District, Metropolis, MP 45678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About your farm</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about your story and products..."
                    rows={4}
                    defaultValue="Passionate about providing organic, locally-grown produce directly to your table since 2010."
                  />
                </div>

                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Profile Changes</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm h-fit">
              <CardHeader>
                <CardTitle>Profile Image</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-full bg-muted border-2 border-dashed border-emerald-200 flex items-center justify-center text-emerald-600">
                  <User className="h-12 w-12" />
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Change Photo
                </Button>
                <p className="text-xs text-center text-muted-foreground">Square images work best. Max 1MB.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="border-none shadow-sm max-w-3xl">
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>Upload your business licenses and ID for platform verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 p-4 rounded-xl border-2 border-dashed border-muted hover:bg-muted/50 transition-colors cursor-pointer text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold">Trade License</p>
                    <p className="text-xs text-muted-foreground mt-1">Uploaded: Oct 10, 2025</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">Verified</Badge>
                </div>

                <div className="space-y-3 p-4 rounded-xl border-2 border-dashed border-muted hover:bg-muted/50 transition-colors cursor-pointer text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold">National ID / Passport</p>
                    <p className="text-xs text-muted-foreground mt-1">Uploaded: Oct 10, 2025</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">Verified</Badge>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-900">All documents verified!</p>
                  <p className="text-xs text-emerald-700/80 leading-relaxed">
                    Your account is fully verified. You have full access to all marketplace features and higher
                    withdrawal limits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="border-none shadow-sm max-w-3xl">
            <CardHeader>
              <CardTitle>Payment & Bank Information</CardTitle>
              <CardDescription>Configure how you want to receive your sales earnings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank / Provider Name</Label>
                  <Input id="bankName" defaultValue="Metropolis National Bank" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input id="accountName" defaultValue="Farmer John Doe" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number / Mobile Number</Label>
                  <Input id="accountNumber" defaultValue="**** 4321" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch / Routing Number</Label>
                  <Input id="branchCode" defaultValue="123-456" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Update Payout Details</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
