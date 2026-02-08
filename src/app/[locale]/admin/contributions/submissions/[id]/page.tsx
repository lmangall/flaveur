"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Label } from "@/app/[locale]/components/ui/label";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Alert, AlertDescription } from "@/app/[locale]/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import {
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import {
  getSubstanceForReview,
  verifySubstance,
  rejectSubstance,
  markSubstanceUnderReview,
  type PendingSubstanceWithUser,
} from "@/actions/admin/contributions";

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    case "under_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Eye className="h-3 w-3 mr-1" />
          Under Review
        </Badge>
      );
    case "user_entry":
    default:
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
  }
}

function DataRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex py-2 border-b last:border-0">
      <span className="w-40 text-sm text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span className="text-sm">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </span>
    </div>
  );
}

export default function AdminSubmissionReviewPage() {
  const router = useRouter();
  const params = useParams();
  const substanceId = parseInt(params.id as string);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;

  const [substance, setSubstance] = useState<PendingSubstanceWithUser | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const fetchSubstance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubstanceForReview(substanceId);
      if (!data) {
        setError("Substance not found");
        return;
      }
      setSubstance(data);
      setAdminNotes(data.admin_notes || "");
    } catch (e) {
      console.error("Error fetching substance:", e);
      setError(e instanceof Error ? e.message : "Failed to load substance");
    } finally {
      setIsLoading(false);
    }
  }, [substanceId]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn && substanceId) {
      fetchSubstance();
    }
  }, [isSignedIn, isLoaded, router, substanceId, fetchSubstance]);

  const handleVerify = async () => {
    setIsProcessing(true);
    try {
      await verifySubstance(substanceId, adminNotes || undefined);
      router.push("/admin/contributions/submissions?verified=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to verify substance");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkUnderReview = async () => {
    setIsProcessing(true);
    try {
      await markSubstanceUnderReview(substanceId, adminNotes || undefined);
      await fetchSubstance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setError("Please provide a rejection reason (at least 5 characters)");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await rejectSubstance(substanceId, rejectionReason);
      if (result.removedFromFormulas > 0) {
        alert(
          `Substance rejected. It was removed from ${result.removedFromFormulas} formula(s).`
        );
      }
      router.push("/admin/contributions/submissions?rejected=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject substance");
    } finally {
      setIsProcessing(false);
      setShowRejectDialog(false);
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to submissions
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : substance ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {substance.common_name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                {getStatusBadge(substance.verification_status)}
                {substance.cas_id && (
                  <span className="text-muted-foreground">
                    CAS: {substance.cas_id}
                  </span>
                )}
                {substance.fema_number && (
                  <span className="text-muted-foreground">
                    FEMA: {substance.fema_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted by:</span>
                <span>{substance.submitter_username || "Unknown"}</span>
                {substance.submitter_email && (
                  <span className="text-muted-foreground">
                    ({substance.submitter_email})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted:</span>
                <span>{formatDate(substance.submitted_at)}</span>
              </div>
              {substance.source_reference && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                  <span>{substance.source_reference}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Substance Data */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Identifiers</CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow label="CAS ID" value={substance.cas_id} />
                <DataRow label="FEMA Number" value={substance.fema_number} />
                <DataRow label="PubChem ID" value={substance.pubchem_id} />
                <DataRow label="FL Number" value={substance.fl_number} />
                <DataRow label="IUPAC Name" value={substance.iupac_name} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow label="Natural" value={substance.is_natural} />
                <DataRow label="Synthetic" value={substance.synthetic} />
                <DataRow
                  label="Functional Groups"
                  value={substance.functional_groups}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sensory Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow label="Odor" value={substance.odor} />
                <DataRow label="Taste" value={substance.taste} />
                <DataRow label="Flavor Profile" value={substance.flavor_profile} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chemical Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow
                  label="Molecular Formula"
                  value={substance.molecular_formula}
                />
                <DataRow
                  label="Molecular Weight"
                  value={substance.molecular_weight}
                />
                <DataRow label="SMILES" value={substance.smile} />
                <DataRow label="InChI" value={substance.inchi} />
              </CardContent>
            </Card>
          </div>

          {substance.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{substance.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Review the submission and take appropriate action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  placeholder="Add internal notes about this submission..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                {substance.verification_status === "user_entry" && (
                  <Button
                    variant="outline"
                    onClick={handleMarkUnderReview}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    Mark Under Review
                  </Button>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Verify & Approve
                </Button>

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isProcessing}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Submission</DialogTitle>
                      <DialogDescription>
                        This will permanently delete the substance. If it's being
                        used in any formulas, it will be removed from them.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="rejection_reason">
                          Rejection Reason (required)
                        </Label>
                        <Textarea
                          id="rejection_reason"
                          placeholder="Explain why this submission is being rejected..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isProcessing || rejectionReason.length < 5}
                      >
                        {isProcessing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirm Rejection
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Substance not found</p>
        </Card>
      )}
    </div>
  );
}
