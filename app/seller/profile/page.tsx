"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, ShieldCheck, CreditCard, Upload, MapPin, Phone, Mail, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider";
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

export default function SellerProfile() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const { toast } = useToast();

  const [farmName, setFarmName] = useState(userData?.farmDetails?.farmName || "");
  const [ownerName, setOwnerName] = useState(userData?.farmDetails?.ownerName || "");
  const [email, setEmail] = useState(userData?.farmDetails?.email || user?.email || "");
  const [phone, setPhone] = useState(userData?.farmDetails?.phone || "");
  const [address, setAddress] = useState(userData?.farmDetails?.address || "");
  const [bio, setBio] = useState(userData?.farmDetails?.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(userData?.profileImage || "");

  // New states for document uploads
  const [isUploadingTradeLicense, setIsUploadingTradeLicense] = useState(false);
  const [isUploadingNationalId, setIsUploadingNationalId] = useState(false);

  // New states for bank details
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [isSavingBankDetails, setIsSavingBankDetails] = useState(false);

  useEffect(() => {
    if (userData) {
      setFarmName(userData.farmDetails?.farmName || "");
      setOwnerName(userData.farmDetails?.ownerName || "");
      setEmail(userData.farmDetails?.email || user?.email || "");
      setPhone(userData.farmDetails?.phone || "");
      setAddress(userData.farmDetails?.address || "");
      setBio(userData.farmDetails?.bio || "");
      setProfileImagePreview(userData.profileImage || "");

      // Populate bank details
      setBankName(userData.bankDetails?.bankName || "");
      setAccountName(userData.bankDetails?.accountName || "");
      setAccountNumber(userData.bankDetails?.accountNumber || "");
      setBranchCode(userData.bankDetails?.branchCode || "");
    }
  }, [userData, user]);

  const handleSaveFarmDetails = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save farm details.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        farmDetails: {
          farmName,
          ownerName,
          email,
          phone,
          address,
          bio,
        },
      });
      toast({
        title: "Success",
        description: "Farm details updated successfully!",
      });
    } catch (error) {
      console.error("Error updating farm details:", error);
      toast({
        title: "Error",
        description: "Failed to update farm details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImageToCloudinary = async (file: File) => {
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Image upload failed via API route.");
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      // Update Firestore with the new image URL
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          profileImage: imageUrl,
        });
        setProfileImagePreview(imageUrl); // Update preview immediately
        toast({
          title: "Success",
          description: "Profile image updated successfully!",
        });
        refreshUserData(); // Call to refresh global user data
      }
    } catch (error) {
      console.error("Error uploading image via API route or updating Firestore:", error);
      toast({
        title: "Error",
        description: `Failed to upload image: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({
          title: "File Too Large",
          description: "Image size should not exceed 2MB.",
          variant: "destructive",
        });
        return;
      }
      uploadImageToCloudinary(file);
    }
  };

  const uploadDocument = async (file: File, documentType: 'tradeLicense' | 'nationalId') => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload documents.",
        variant: "destructive",
      });
      return;
    }

    if (documentType === 'tradeLicense') setIsUploadingTradeLicense(true);
    if (documentType === 'nationalId') setIsUploadingNationalId(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    try {
      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Document upload failed via API route.");
      }

      const data = await response.json();
      const documentUrl = data.documentUrl;

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        [`verificationDocuments.${documentType}`]: {
          url: documentUrl,
          status: 'pending', // Set status to pending after upload
          uploadedAt: new Date(),
        },
        isVerified: false, // Reset overall verification status if documents are re-uploaded
      });
      refreshUserData(); // Refresh global user data
      toast({
        title: "Success",
        description: `${documentType === 'tradeLicense' ? 'Trade License' : 'National ID'} uploaded successfully! Awaiting admin review.`,
      });
    } catch (error) {
      console.error(`Error uploading ${documentType} or updating Firestore:`, error);
      toast({
        title: "Error",
        description: `Failed to upload ${documentType === 'tradeLicense' ? 'Trade License' : 'National ID'}: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      if (documentType === 'tradeLicense') setIsUploadingTradeLicense(false);
      if (documentType === 'nationalId') setIsUploadingNationalId(false);
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>, documentType: 'tradeLicense' | 'nationalId') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Max 5MB for documents
        toast({
          title: "File Too Large",
          description: "Document size should not exceed 5MB.",
          variant: "destructive",
        });
        return;
      }
      uploadDocument(file, documentType);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save bank details.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingBankDetails(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
          branchCode,
        },
      });
      toast({
        title: "Success",
        description: "Bank details updated successfully!",
      });
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update bank details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBankDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Seller Profile</h1>
          {userData?.isVerified ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verified Seller
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verification Pending
            </Badge>
          )}
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
                    <Input id="farmName" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Primary Contact Name</Label>
                    <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" className="pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About your farm</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about your story and products..."
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <Button onClick={handleSaveFarmDetails} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm h-fit">
              <CardHeader>
                <CardTitle>Profile Image</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 rounded-full bg-muted border-2 border-dashed border-emerald-200 flex items-center justify-center text-emerald-600 overflow-hidden">
                  {userData?.profileImage ? (
                    <img src={userData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input
                  id="profileImageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => document.getElementById('profileImageUpload')?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? "Uploading..." : "Change Photo"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">Square images work best. Max 2MB.</p>
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
                {/* Trade License Upload */}
                <div className="space-y-3 p-4 rounded-xl border-2 border-dashed border-muted hover:bg-muted/50 transition-colors cursor-pointer text-center relative">
                  {isUploadingTradeLicense && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                  <input
                    id="tradeLicenseUpload"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocumentChange(e, 'tradeLicense')}
                    disabled={isUploadingTradeLicense}
                  />
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold">Trade License</p>
                    {userData?.verificationDocuments?.tradeLicense?.url && (
                      <a
                        href={userData.verificationDocuments.tradeLicense.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                  {userData?.verificationDocuments?.tradeLicense?.status === 'approved' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-none">Approved</Badge>
                  ) : userData?.verificationDocuments?.tradeLicense?.status === 'pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending Review</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-none">Not Uploaded</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent mt-2"
                    onClick={() => document.getElementById('tradeLicenseUpload')?.click()}
                    disabled={isUploadingTradeLicense}
                  >
                    {isUploadingTradeLicense ? "Uploading..." : "Upload Trade License"}
                  </Button>
                </div>

                {/* National ID / Passport Upload */}
                <div className="space-y-3 p-4 rounded-xl border-2 border-dashed border-muted hover:bg-muted/50 transition-colors cursor-pointer text-center relative">
                  {isUploadingNationalId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                  <input
                    id="nationalIdUpload"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocumentChange(e, 'nationalId')}
                    disabled={isUploadingNationalId}
                  />
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold">National ID / Passport</p>
                    {userData?.verificationDocuments?.nationalId?.url && (
                      <a
                        href={userData.verificationDocuments.nationalId.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                  {userData?.verificationDocuments?.nationalId?.status === 'approved' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-none">Approved</Badge>
                  ) : userData?.verificationDocuments?.nationalId?.status === 'pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending Review</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-none">Not Uploaded</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent mt-2"
                    onClick={() => document.getElementById('nationalIdUpload')?.click()}
                    disabled={isUploadingNationalId}
                  >
                    {isUploadingNationalId ? "Uploading..." : "Upload National ID"}
                  </Button>
                </div>
              </div>

              {userData?.isVerified ? (
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
              ) : (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-yellow-900">Verification Pending</p>
                    <p className="text-xs text-yellow-700/80 leading-relaxed">
                      Please upload all required documents for verification. Your account will be reviewed by an admin.
                    </p>
                  </div>
                </div>
              )}
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
                  <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number / Mobile Number</Label>
                  <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch / Routing Number</Label>
                  <Input id="branchCode" value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveBankDetails} disabled={isSavingBankDetails} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSavingBankDetails && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Payout Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
