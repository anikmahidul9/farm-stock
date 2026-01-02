"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, CreditCard, Trash2, Plus } from "lucide-react"

function ProfileContent() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-orange-900">My Profile</h1>
        <p className="text-orange-600/80">Manage your account information and preferences.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-orange-50 border border-orange-100">
          <TabsTrigger value="personal" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Addresses
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  SJ
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                  >
                    Change Photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
              </div>

              <Separator className="bg-orange-100" />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-orange-900">
                    First Name
                  </Label>
                  <Input id="firstName" defaultValue="Sarah" className="border-orange-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-orange-900">
                    Last Name
                  </Label>
                  <Input id="lastName" defaultValue="Johnson" className="border-orange-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-orange-900">
                  Email Address
                </Label>
                <Input id="email" type="email" defaultValue="sarah.j@example.com" className="border-orange-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-orange-900">
                  Phone Number
                </Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="border-orange-200" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">Save Changes</Button>
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <div className="flex flex-col gap-4">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 self-start">
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>

            {[1, 2].map((i) => (
              <Card key={i} className="border-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-orange-950">Home</h3>
                          {i === 1 && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-orange-600/70 mt-1">
                          123 Main Street
                          <br />
                          San Francisco, CA 94103
                          <br />
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                      >
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="flex flex-col gap-4">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 self-start">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>

            <Card className="border-orange-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-orange-950">Visa ending in 4242</h3>
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      </div>
                      <p className="text-sm text-orange-600/70 mt-1">Expires 12/2026</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  )
}
