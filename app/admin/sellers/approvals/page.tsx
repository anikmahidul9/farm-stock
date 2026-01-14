'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Added Link import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ExternalLink, Loader2, User, FileText, Building, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SellerVerificationRequest {
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
  profileImageUrl?: string; // Renamed for consistency
}

export default function SellerApprovals() {
  const [verificationRequests, setVerificationRequests] = useState<SellerVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVerificationRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'seller'),
        where('isVerified', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const requests: SellerVerificationRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.verificationDocuments?.tradeLicense || data.verificationDocuments?.nationalId) {
          const firstName = data.firstName || "";
          const lastName = data.lastName || "";
          requests.push({
            uid: doc.id,
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
            profileImageUrl: data.profileImage || undefined, // Corrected: fetch data.profileImage
          });
        }
      });
      setVerificationRequests(requests);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const handleApproveDocument = async (
    sellerUid: string,
    documentType: 'tradeLicense' | 'nationalId',
    currentStatus: 'pending' | 'approved' | 'rejected'
  ) => {
    if (currentStatus === 'approved') {
      toast({
        title: "Info",
        description: "Document is already approved.",
      });
      return;
    }

    setIsUpdating(sellerUid + documentType);
    try {
      const userDocRef = doc(db, 'users', sellerUid);
      await updateDoc(userDocRef, {
        [`verificationDocuments.${documentType}.status`]: 'approved',
      });
      toast({
        title: "Success",
        description: `${documentType === 'tradeLicense' ? 'Trade License' : 'National ID'} approved.`,
      });
      await fetchVerificationRequests();
    } catch (error) {
      console.error(`Error approving ${documentType} for ${sellerUid}:`, error);
      toast({
        title: "Error",
        description: `Failed to approve ${documentType}.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectDocument = async (
    sellerUid: string,
    documentType: 'tradeLicense' | 'nationalId',
    currentStatus: 'pending' | 'approved' | 'rejected'
  ) => {
    if (currentStatus === 'rejected') {
      toast({
        title: "Info",
        description: "Document is already rejected.",
      });
      return;
    }

    setIsUpdating(sellerUid + documentType);
    try {
      const userDocRef = doc(db, 'users', sellerUid);
      await updateDoc(userDocRef, {
        [`verificationDocuments.${documentType}.status`]: 'rejected',
      });
      toast({
        title: "Success",
        description: `${documentType === 'tradeLicense' ? 'Trade License' : 'National ID'} rejected.`,
      });
      await fetchVerificationRequests();
    } catch (error) {
      console.error(`Error rejecting ${documentType} for ${sellerUid}:`, error);
      toast({
        title: "Error",
        description: `Failed to reject ${documentType}.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleApproveSeller = async (sellerUid: string) => {
    setIsUpdating(sellerUid + 'seller');
    try {
      const userDocRef = doc(db, 'users', sellerUid);
      await updateDoc(userDocRef, {
        isVerified: true,
      });
      toast({
        title: "Success",
        description: "Seller has been fully verified and can now access the marketplace.",
      });
      await fetchVerificationRequests();
    } catch (error) {
      console.error(`Error verifying seller ${sellerUid}:`, error);
      toast({
        title: "Error",
        description: "Failed to verify seller.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20">
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
          <p className="text-muted-foreground">Loading verification requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Verification</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve seller documents to grant marketplace access
          </p>
        </div>
        <Badge variant="outline" className="h-8 px-3">
          <ShieldCheck className="mr-2 h-4 w-4" />
          {verificationRequests.length} Pending
        </Badge>
      </div>

      {verificationRequests.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ShieldCheck className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground text-center max-w-md">
              All seller verification requests have been processed. Check back later for new submissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {verificationRequests.map((request) => {
            const allDocumentsApproved = 
              request.verificationDocuments.tradeLicense?.status === 'approved' &&
              request.verificationDocuments.nationalId?.status === 'approved';
            
            return (
              <Card key={request.uid} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={request.profileImageUrl} alt={`${request.firstName} ${request.lastName}'s profile`} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.firstName?.[0]}{request.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {request.farmDetails.farmName || "Unnamed Farm"}
                          {allDocumentsApproved && (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                              Ready to Approve
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3" />
                          {`${request.firstName} ${request.lastName}`.trim() || "Unknown Owner"}
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm">{request.email}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/sellers/approvals/${request.uid}`}>
                          View Details
                        </Link>
                      </Button>
                      <Badge variant="secondary" className="h-6">
                        ID: {request.uid.substring(0, 8)}...
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Farm Information */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Farm Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium">{request.farmDetails.phone || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{request.farmDetails.address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Verification Documents
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Trade License Card */}
                        <Card className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">Trade License</h4>
                                <p className="text-sm text-muted-foreground">Business registration document</p>
                              </div>
                              {getStatusBadge(request.verificationDocuments.tradeLicense?.status || 'not-uploaded')}
                            </div>
                            
                            {request.verificationDocuments.tradeLicense?.url ? (
                              <div className="space-y-3">
                                <a
                                  href={request.verificationDocuments.tradeLicense.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Document
                                </a>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleApproveDocument(
                                      request.uid, 
                                      'tradeLicense', 
                                      request.verificationDocuments.tradeLicense?.status || 'rejected'
                                    )}
                                    disabled={
                                      isUpdating === request.uid + 'tradeLicense' || 
                                      request.verificationDocuments.tradeLicense?.status === 'approved'
                                    }
                                  >
                                    {isUpdating === request.uid + 'tradeLicense' && (
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleRejectDocument(
                                      request.uid, 
                                      'tradeLicense', 
                                      request.verificationDocuments.tradeLicense?.status || 'rejected'
                                    )}
                                    disabled={
                                      isUpdating === request.uid + 'tradeLicense' || 
                                      request.verificationDocuments.tradeLicense?.status === 'rejected'
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Document not uploaded</p>
                            )}
                          </CardContent>
                        </Card>

                        {/* National ID Card */}
                        <Card className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">National ID / Passport</h4>
                                <p className="text-sm text-muted-foreground">Government-issued identification</p>
                              </div>
                              {getStatusBadge(request.verificationDocuments.nationalId?.status || 'not-uploaded')}
                            </div>
                            
                            {request.verificationDocuments.nationalId?.url ? (
                              <div className="space-y-3">
                                <a
                                  href={request.verificationDocuments.nationalId.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Document
                                </a>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleApproveDocument(
                                      request.uid, 
                                      'nationalId', 
                                      request.verificationDocuments.nationalId?.status || 'rejected'
                                    )}
                                    disabled={
                                      isUpdating === request.uid + 'nationalId' || 
                                      request.verificationDocuments.nationalId?.status === 'approved'
                                    }
                                  >
                                    {isUpdating === request.uid + 'nationalId' && (
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleRejectDocument(
                                      request.uid, 
                                      'nationalId', 
                                      request.verificationDocuments.nationalId?.status || 'rejected'
                                    )}
                                    disabled={
                                      isUpdating === request.uid + 'nationalId' || 
                                      request.verificationDocuments.nationalId?.status === 'rejected'
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Document not uploaded</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Final Approval Section */}
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Seller Verification Status</h4>
                          <p className="text-sm text-muted-foreground">
                            {allDocumentsApproved 
                              ? "All documents approved. Ready for final verification."
                              : "Both documents must be approved before verifying seller."}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleApproveSeller(request.uid)}
                          disabled={
                            isUpdating === request.uid + 'seller' ||
                            request.isVerified ||
                            !allDocumentsApproved
                          }
                          className="gap-2"
                        >
                          {isUpdating === request.uid + 'seller' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Verify Seller
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}