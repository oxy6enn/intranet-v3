"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type PermissionRequestRow = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  permissionCode: string;
  permissionName: string;
  reason: string;
  status: string;
  createdAtLabel: string;
  reviewedAtLabel: string | null;
  reviewNote: string | null;
};

type PermissionRequestsReviewProps = {
  requests: PermissionRequestRow[];
};

type ReviewAction = "approve" | "reject";

type ReviewPermissionRequestResponse = {
  message?: string;
};

export function PermissionRequestsReview({
  requests,
}: PermissionRequestsReviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notesByRequestId, setNotesByRequestId] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        requests.map((request) => [request.id, request.reviewNote ?? ""])
      )
  );

  const reviewRequest = (requestId: string, action: ReviewAction) => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/permission-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          reviewNote: notesByRequestId[requestId] ?? "",
        }),
      });

      const payload =
        (await response.json().catch(() => ({}))) as ReviewPermissionRequestResponse;

      if (!response.ok) {
        toast.error("Review failed", {
          description:
            payload.message ?? "We could not update this permission request.",
        });
        return;
      }

      toast.success(
        action === "approve" ? "Request approved" : "Request rejected",
        {
          description:
            payload.message ??
            "The permission request status has been updated successfully.",
        }
      );
      router.refresh();
    });
  };

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Review permission requests</CardTitle>
        <CardDescription>
          Approve requests to grant direct permissions immediately, or reject
          them with a short note.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length ? (
                requests.map((request) => (
                  <TableRow key={request.id} className="bg-background align-top">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{request.requesterName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.requesterEmail}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {request.createdAtLabel}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-medium">{request.permissionName}</p>
                        <Badge variant="outline">{request.permissionCode}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-sm whitespace-normal text-sm text-muted-foreground">
                      {request.reason}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant="secondary">{request.status}</Badge>
                        {request.reviewedAtLabel ? (
                          <p className="text-xs text-muted-foreground">
                            {request.reviewedAtLabel}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-64">
                      <Textarea
                        value={notesByRequestId[request.id] ?? ""}
                        onChange={(event) =>
                          setNotesByRequestId((current) => ({
                            ...current,
                            [request.id]: event.target.value,
                          }))
                        }
                        disabled={request.status !== "pending"}
                        placeholder="Optional review note for the requester"
                        data-testid={`permission-request-note-${request.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            className="rounded-xl"
                            disabled={isPending}
                            data-testid={`approve-permission-request-${request.id}`}
                            onClick={() => reviewRequest(request.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            disabled={isPending}
                            data-testid={`reject-permission-request-${request.id}`}
                            onClick={() => reviewRequest(request.id, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Completed
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No permission request is waiting for review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
