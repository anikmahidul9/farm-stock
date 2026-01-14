"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, CreditCard, Trash2, Plus, Upload } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { AddressManager } from "@/components/address-manager"

function ProfileContent() {
  const { user, userData, refreshUserData } = useAuth()
  const [firstName, setFirstName] = useState(userData?.firstName || "")
  const [lastName, setLastName] = useState(userData?.lastName || "")
  const [email, setEmail] = useState(userData?.email || "")
  const [phone, setPhone] = useState(userData?.phone || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "")
      setLastName(userData.lastName || "")
      setEmail(userData.email || "")
      setPhone(userData.phone || "")
    }
  }, [userData])

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Image upload failed")
      }

      const { imageUrl } = await response.json()

      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        profileImage: imageUrl,
      })

      await refreshUserData()
      toast.success("Profile photo updated successfully!")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to update profile photo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return

    const userDocRef = doc(db, "users", user.uid)
    try {
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        email,
        phone,
      })
      await refreshUserData()
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile.")
    }
  }

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
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData?.profileImageUrl} alt="User Avatar" />
                  <AvatarFallback className="text-2xl font-bold">
                    {getInitials(userData?.firstName, userData?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>
              </div>

              <Separator className="bg-orange-100" />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-orange-900">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-orange-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-orange-900">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-orange-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-orange-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-orange-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-orange-900">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-orange-200"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveChanges}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Save Changes
                </Button>
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
          <AddressManager />
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
