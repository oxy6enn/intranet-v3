"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionRequestsReview } from "@/components/admin/permission-requests-review";

type PermissionRequestWorkspaceRow = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  reviewerName: string | null;
  reviewerEmail: string | null;
  permissionCode: string;
  permissionName: string;
  reason: string;
  status: string;
  createdAtLabel: string;
  reviewedAtLabel: string | null;
  reviewNote: string | null;
};

type PermissionRequestInsightItem = {
  code: string;
  name: string;
  count: number;
};

type RequesterInsightItem = {
  name: string;
  email: string;
  count: number;
};

type ReviewActivityItem = {
  id: string;
  requesterName: string;
  permissionCode: string;
  status: string;
  reviewerName: string | null;
  reviewedAtLabel: string | null;
  reviewNote: string | null;
};

type PermissionRequestsWorkspaceProps = {
  requests: PermissionRequestWorkspaceRow[];
  totalRequests: number;
};

type RequestStatusFilter = "all" | "pending" | "approved" | "rejected";

function buildTopRequestedPermissions(
  requests: PermissionRequestWorkspaceRow[]
): PermissionRequestInsightItem[] {
  return Object.values(
    requests.reduce<Record<string, PermissionRequestInsightItem>>(
      (accumulator, request) => {
        if (!accumulator[request.permissionCode]) {
          accumulator[request.permissionCode] = {
            code: request.permissionCode,
            name: request.permissionName,
            count: 0,
          };
        }

        accumulator[request.permissionCode].count += 1;
        return accumulator;
      },
      {}
    )
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
}

function buildTopRequesters(
  requests: PermissionRequestWorkspaceRow[]
): RequesterInsightItem[] {
  return Object.values(
    requests.reduce<Record<string, RequesterInsightItem>>((accumulator, request) => {
      if (!accumulator[request.requesterEmail]) {
        accumulator[request.requesterEmail] = {
          name: request.requesterName,
          email: request.requesterEmail,
          count: 0,
        };
      }

      accumulator[request.requesterEmail].count += 1;
      return accumulator;
    }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
}

function buildLatestReviewedRequests(
  requests: PermissionRequestWorkspaceRow[]
): ReviewActivityItem[] {
  return requests
    .filter((request) => request.reviewedAtLabel)
    .slice()
    .sort((left, right) => {
      if (!left.reviewedAtLabel || !right.reviewedAtLabel) {
        return 0;
      }

      return right.reviewedAtLabel.localeCompare(left.reviewedAtLabel);
    })
    .slice(0, 5)
    .map((request) => ({
      id: request.id,
      requesterName: request.requesterName,
      permissionCode: request.permissionCode,
      status: request.status,
      reviewerName: request.reviewerName,
      reviewedAtLabel: request.reviewedAtLabel,
      reviewNote: request.reviewNote,
    }));
}

export function PermissionRequestsWorkspace({
  requests,
  totalRequests,
}: PermissionRequestsWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        request.requesterName,
        request.requesterEmail,
        request.reviewerName ?? "",
        request.permissionCode,
        request.permissionName,
        request.reason,
        request.reviewNote ?? "",
        request.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [deferredQuery, requests, statusFilter]);

  const pendingCount = filteredRequests.filter(
    (request) => request.status === "pending"
  ).length;
  const approvedCount = filteredRequests.filter(
    (request) => request.status === "approved"
  ).length;
  const rejectedCount = filteredRequests.filter(
    (request) => request.status === "rejected"
  ).length;
  const reviewedCount = approvedCount + rejectedCount;
  const approvalRate =
    reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0;
  const topRequestedPermissions = buildTopRequestedPermissions(filteredRequests);
  const topRequesters = buildTopRequesters(filteredRequests);
  const latestReviewedRequests = buildLatestReviewedRequests(filteredRequests);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending requests</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {pendingCount}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            waiting for admin review
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {approvedCount}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            requests converted into direct permissions
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {rejectedCount}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            requests that did not meet approval criteria
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Approval rate</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {approvalRate}%
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            based on reviewed requests only
          </p>
        </article>
      </section>

      <Card className="rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-2xl">Search and filters</CardTitle>
              <CardDescription>
                Narrow the inbox by request status or search people, permissions, and notes.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search requester, permission, note, status..."
                className="rounded-xl pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All requests" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
            ].map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={statusFilter === item.id ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => setStatusFilter(item.id as RequestStatusFilter)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">permission:manage</Badge>
            <Badge variant="secondary">
              {filteredRequests.length} visible / {totalRequests} total requests
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Top requested permissions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Which permission codes appear most often in the filtered request set
          </p>
          <div className="mt-6 space-y-3">
            {topRequestedPermissions.length ? (
              topRequestedPermissions.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.code}</p>
                  </div>
                  <Badge variant="secondary">{item.count} requests</Badge>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                No request data matches the current filter.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Latest review activity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recent decisions from the currently visible request set
          </p>
          <div className="mt-6 space-y-3">
            {latestReviewedRequests.length ? (
              latestReviewedRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{request.requesterName}</p>
                    <Badge variant="outline">{request.permissionCode}</Badge>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Reviewer: {request.reviewerName ?? "Unknown reviewer"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reviewed at {request.reviewedAtLabel ?? "-"}
                  </p>
                  {request.reviewNote ? (
                    <p className="mt-3 text-sm text-foreground/80">
                      Note: {request.reviewNote}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                No reviewed request matches the current filter.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Most active requesters</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Users who generate the most requests in the current filtered view
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topRequesters.length ? (
            topRequesters.map((item) => (
              <div
                key={item.email}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {item.email}
                </p>
                <p className="mt-4 text-2xl font-semibold">{item.count}</p>
                <p className="text-sm text-muted-foreground">requests sent</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground md:col-span-2 xl:col-span-4">
              No requester activity matches the current filter.
            </div>
          )}
        </div>
      </section>

      <PermissionRequestsReview requests={filteredRequests} />
    </>
  );
}
