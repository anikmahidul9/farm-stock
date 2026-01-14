"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Phone, MapPin, Building, Banknote, FileText, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SellerDetails {
  uid: string;
  email: string;
  firstName: string; // New field
  lastName: string; // New field
  farmDetails: {
    farmName: string;
    ownerName: string; // This will be derived from firstName and lastName
    // email: string; // Removed from farmDetails
    phone: string;
    address: string;
    bio: string;
  };
  verificationDocuments: {
    tradeLicense?: { url: string; status: 'pending' | 'approved' | 'rejected' };
    nationalId?: { url: string; status: 'pending' | 'approved' | 'rejected' };
  };
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
  };
  isVerified: boolean;
  profileImageUrl?: string;
}

export default function SellerDetailPage() {
  const { uid } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [seller, setSeller] = useState<SellerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    const fetchSellerDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'users', uid as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const firstName = data.firstName || "";
          const lastName = data.lastName || "";
          setSeller({
            uid: docSnap.id,
            email: data.email,
            firstName: firstName,
            lastName: lastName,
            farmDetails: {
              ...(data.farmDetails || {}), // Provide default empty object if data.farmDetails is null/undefined
              ownerName: `${firstName} ${lastName}`.trim(), // Derived ownerName
            },
            verificationDocuments: data.verificationDocuments || {},
            bankDetails: data.bankDetails || {},
            isVerified: data.isVerified || false,
            profileImageUrl: data.profileImage || undefined, // Fetch data.profileImage
          });
        } else {
          setError("Seller not found.");
          toast({
            title: "Error",
            description: "Seller details not found.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching seller details:", err);
        setError("Failed to load seller details.");
        toast({
          title: "Error",
          description: "Failed to load seller details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [uid, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Not Uploaded
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-muted-foreground">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-red-500">
          <AlertCircle className="h-10 w-10" />
          <p className="text-lg">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No seller data available.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Seller Details</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={seller.profileImageUrl} alt={`${seller.firstName} ${seller.lastName}'s profile`} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {seller.firstName?.[0]}{seller.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{seller.farmDetails.farmName || "Unnamed Farm"}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <User className="h-4 w-4" />
              {`${seller.firstName} ${seller.lastName}`.trim() || "Unknown Owner"}
            </CardDescription>
            <CardDescription className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {seller.email}
            </CardDescription>
            <Badge variant={seller.isVerified ? "default" : "destructive"} className="mt-2">
              {seller.isVerified ? "Verified Seller" : "Not Verified"}
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          {/* Farm Details */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Building className="h-5 w-5" /> Farm Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Farm Name</p>
                <p className="font-medium">{seller.farmDetails.farmName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Owner Name</p>
                <p className="font-medium">{`${seller.firstName} ${seller.lastName}`.trim() || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Phone</p>
                <p className="font-medium flex items-center gap-1"><Phone className="h-4 w-4 text-muted-foreground" /> {seller.farmDetails.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> {seller.farmDetails.address || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="font-medium">{seller.farmDetails.bio || "No bio provided."}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Documents */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Verification Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Trade License</h4>
                    {getStatusBadge(seller.verificationDocuments.tradeLicense?.status || 'not-uploaded')}
                  </div>
                  {seller.verificationDocuments.tradeLicense?.url ? (
                    <a
                      href={seller.verificationDocuments.tradeLicense.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Document
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Document not uploaded</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">National ID / Passport</h4>
                    {getStatusBadge(seller.verificationDocuments.nationalId?.status || 'not-uploaded')}
                  </div>
                  {seller.verificationDocuments.nationalId?.url ? (
                    <a
                      href={seller.verificationDocuments.nationalId.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Document
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Document not uploaded</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Banknote className="h-5 w-5" /> Bank Details</h3>
            {seller.bankDetails && seller.bankDetails.bankName ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{seller.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Name</p>
                  <p className="font-medium">{seller.bankDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{seller.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch Code</p>
                  <p className="font-medium">{seller.bankDetails.branchCode}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No bank details provided.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
