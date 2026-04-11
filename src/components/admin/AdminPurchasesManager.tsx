import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Clock, XCircle, IndianRupee, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface ProjectPurchase {
  id: string;
  user_id: string;
  project_id: string;
  price: number;
  currency: string;
  payment_id: string;
  payment_status: "pending" | "completed" | "verified" | "approved" | "rejected";
  created_at: string;
  verified_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  client_email?: string;
  client_name?: string;
  project_title?: string;
}

export default function AdminPurchasesManager() {
  const [purchases, setPurchases] = useState<ProjectPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingRejectionId, setPendingRejectionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("project_purchases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPurchases((data as ProjectPurchase[]) || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (
    purchaseId: string,
    newStatus: "verified" | "approved" | "rejected",
    rejectionReason?: string
  ) => {
    try {
      setProcessingId(purchaseId);
      const updateData: any = {
        payment_status: newStatus,
      };
      
      // Add timestamp for verified status
      if (newStatus === "verified") {
        updateData.verified_at = new Date().toISOString();
      }
      
      // Add timestamp for approved status
      if (newStatus === "approved") {
        updateData.approved_at = new Date().toISOString();
      }
      
      // Add rejection reason for rejected status
      if (newStatus === "rejected" && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }
      
      const { error } = await supabase
        .from("project_purchases")
        .update(updateData)
        .eq("id", purchaseId);

      if (error) throw error;

      toast.success(`Payment ${newStatus} successfully!`);
      fetchPurchases();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-200";
      case "verified":
        return "bg-blue-500/20 text-blue-700 border-blue-200";
      case "approved":
        return "bg-green-500/20 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-500/20 text-red-700 border-red-200";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const pendingPurchases = purchases.filter((p) => p.payment_status === "pending" || p.payment_status === "completed");
  const verifiedPurchases = purchases.filter((p) => p.payment_status === "verified");
  const approvedPurchases = purchases.filter((p) => p.payment_status === "approved");
  const rejectedPurchases = purchases.filter((p) => p.payment_status === "rejected");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground mt-2">
          Verify and approve client project purchases
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Pending</span>
            <span className="sm:hidden">Pend</span>
            <span className="ml-1 text-xs bg-yellow-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">{pendingPurchases.length}</span>
          </TabsTrigger>
          <TabsTrigger value="verified" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Verified</span>
            <span className="sm:hidden">Veri</span>
            <span className="ml-1 text-xs bg-blue-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">{verifiedPurchases.length}</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Approved</span>
            <span className="sm:hidden">Appr</span>
            <span className="ml-1 text-xs bg-green-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">{approvedPurchases.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Rejected</span>
            <span className="sm:hidden">Rej</span>
            <span className="ml-1 text-xs bg-red-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">{rejectedPurchases.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingPurchases.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No pending payments
              </CardContent>
            </Card>
          ) : (
            pendingPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-yellow-200 bg-yellow-50/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-sm text-muted-foreground">Project</p>
                        <p className="font-semibold text-base">{purchase.project_title || "Project"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Client Name</p>
                        <p className="font-semibold text-base">{purchase.client_name || "Unknown User"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        {purchase.client_email && purchase.client_email !== "N/A" ? (
                          <a href={`mailto:${purchase.client_email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                            {purchase.client_email}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(purchase.payment_status)}>
                      {getStatusIcon(purchase.payment_status)}
                      <span className="ml-1 capitalize">{purchase.payment_status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        ₹{purchase.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment ID</p>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{purchase.payment_id.slice(0, 20)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{format(new Date(purchase.created_at), "MMM dd, yyyy")}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updatePaymentStatus(purchase.id, "verified")}
                      disabled={processingId === purchase.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {processingId === purchase.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Payment"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setPendingRejectionId(purchase.id);
                        setRejectionReason("");
                        setRejectionDialogOpen(true);
                      }}
                      disabled={processingId === purchase.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4 mt-6">
          {verifiedPurchases.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No verified payments
              </CardContent>
            </Card>
          ) : (
            verifiedPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-sm text-muted-foreground">Project</p>
                        <p className="font-semibold text-base">{purchase.project_title || "Project"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Client Name</p>
                        <p className="font-semibold text-base">{purchase.client_name || "Unknown User"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        {purchase.client_email && purchase.client_email !== "N/A" ? (
                          <a href={`mailto:${purchase.client_email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                            {purchase.client_email}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(purchase.payment_status)}>
                      {getStatusIcon(purchase.payment_status)}
                      <span className="ml-1 capitalize">{purchase.payment_status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" /> {purchase.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verified On</p>
                      <p className="text-sm font-medium">
                        {purchase.verified_at ? format(new Date(purchase.verified_at), "MMM dd, yyyy") : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={() => updatePaymentStatus(purchase.id, "approved")}
                      disabled={processingId === purchase.id}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {processingId === purchase.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Approving...
                        </>
                      ) : (
                        "Grant Access"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedPurchases.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No approved payments
              </CardContent>
            </Card>
          ) : (
            approvedPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{purchase.project_title || "Project"}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span>{purchase.client_name || "Unknown User"}</span>
                        {purchase.client_email && purchase.client_email !== "N/A" && (
                          <a href={`mailto:${purchase.client_email}`} className="text-xs text-blue-600 hover:underline">
                            {purchase.client_email}
                          </a>
                        )}
                        {(!purchase.client_email || purchase.client_email === "N/A") && (
                          <span className="text-xs text-muted-foreground">({purchase.user_id?.slice(0, 8)}...)</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(purchase.payment_status)}>
                      {getStatusIcon(purchase.payment_status)}
                      <span className="ml-1 capitalize">{purchase.payment_status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" /> {purchase.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved On</p>
                      <p className="text-sm font-medium">
                        {purchase.approved_at ? format(new Date(purchase.approved_at), "MMM dd, yyyy") : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedPurchases.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No rejected payments
              </CardContent>
            </Card>
          ) : (
            rejectedPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-red-200 bg-red-50/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{purchase.project_title || "Project"}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span>{purchase.client_name || "Unknown User"}</span>
                        {purchase.client_email && purchase.client_email !== "N/A" && (
                          <a href={`mailto:${purchase.client_email}`} className="text-xs text-blue-600 hover:underline">
                            {purchase.client_email}
                          </a>
                        )}
                        {(!purchase.client_email || purchase.client_email === "N/A") && (
                          <span className="text-xs text-muted-foreground">({purchase.user_id?.slice(0, 8)}...)</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(purchase.payment_status)}>
                      {getStatusIcon(purchase.payment_status)}
                      <span className="ml-1 capitalize">{purchase.payment_status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {purchase.rejection_reason && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300">
                      <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                      <p className="text-sm text-red-700 mt-1">{purchase.rejection_reason}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" /> {purchase.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment ID</p>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{purchase.payment_id.slice(0, 20)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{format(new Date(purchase.created_at), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Reason Dialog */}
      <AlertDialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <AlertDialogTitle>Reject Payment</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Please provide a reason for rejecting this payment. The client will see this reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason... (e.g., 'Payment information does not match', 'Duplicate transaction', etc.)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!rejectionReason.trim()) {
                  toast.error("Please provide a reason for rejection");
                  return;
                }
                if (pendingRejectionId) {
                  updatePaymentStatus(pendingRejectionId, "rejected", rejectionReason);
                  setRejectionDialogOpen(false);
                  setPendingRejectionId(null);
                  setRejectionReason("");
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Payment
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
