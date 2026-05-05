"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
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
  createdAtIso: string;
  createdAtLabel: string;
  reviewedAtIso: string | null;
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
type DateRangeFilter = "all" | "last7" | "last30" | "last90" | "custom";

function escapeCsvValue(value: string) {
  const normalizedValue = value.replaceAll('"', '""');
  return `"${normalizedValue}"`;
}

function downloadCsvFile(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

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
    .filter((request) => request.reviewedAtIso)
    .slice()
    .sort((left, right) => {
      if (!left.reviewedAtIso || !right.reviewedAtIso) {
        return 0;
      }

      return (
        new Date(right.reviewedAtIso).getTime() -
        new Date(left.reviewedAtIso).getTime()
      );
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
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const now = new Date();

    const rangeStart =
      dateRangeFilter === "last7"
        ? new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)
        : dateRangeFilter === "last30"
          ? new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)
          : dateRangeFilter === "last90"
            ? new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90)
            : null;

    const customStart = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const customEnd = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }

      const createdAt = new Date(request.createdAtIso);

      if (rangeStart && createdAt < rangeStart) {
        return false;
      }

      if (dateRangeFilter === "custom") {
        if (customStart && createdAt < customStart) {
          return false;
        }

        if (customEnd && createdAt > customEnd) {
          return false;
        }
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
  }, [dateRangeFilter, deferredQuery, fromDate, requests, statusFilter, toDate]);

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
  const normalizedQuery = deferredQuery.trim();
  const dateRangeLabel =
    dateRangeFilter === "all"
      ? "all dates"
      : dateRangeFilter === "last7"
        ? "last 7 days"
        : dateRangeFilter === "last30"
          ? "last 30 days"
          : dateRangeFilter === "last90"
            ? "last 90 days"
            : `${fromDate || "any start"} -> ${toDate || "any end"}`;

  const selectDateRangeFilter = (nextFilter: DateRangeFilter) => {
    setDateRangeFilter(nextFilter);

    if (nextFilter !== "custom") {
      setFromDate("");
      setToDate("");
    }
  };

  const exportVisibleRequests = () => {
    const filenameSuffix =
      statusFilter === "all" ? "all-statuses" : statusFilter;

    downloadCsvFile(`permission-requests-${filenameSuffix}.csv`, [
      [
        "Requester Name",
        "Requester Email",
        "Permission Code",
        "Permission Name",
        "Status",
        "Reason",
        "Review Note",
        "Reviewer Name",
        "Reviewer Email",
        "Created At",
        "Reviewed At",
      ],
      ...filteredRequests.map((request) => [
        request.requesterName,
        request.requesterEmail,
        request.permissionCode,
        request.permissionName,
        request.status,
        request.reason,
        request.reviewNote ?? "",
        request.reviewerName ?? "",
        request.reviewerEmail ?? "",
        request.createdAtLabel,
        request.reviewedAtLabel ?? "",
      ]),
    ]);
  };

  const exportSummaryReport = () => {
    downloadCsvFile("permission-request-summary.csv", [
      ["Metric", "Value"],
      ["Visible Requests", String(filteredRequests.length)],
      ["Total Requests", String(totalRequests)],
      ["Pending Requests", String(pendingCount)],
      ["Approved Requests", String(approvedCount)],
      ["Rejected Requests", String(rejectedCount)],
      ["Approval Rate", `${approvalRate}%`],
      ["Status Filter", statusFilter],
      ["Date Range Filter", dateRangeLabel],
      ["Search Query", normalizedQuery || "-"],
      [],
      ["Top Requested Permissions", "Request Count"],
      ...topRequestedPermissions.map((item) => [
        `${item.name} (${item.code})`,
        String(item.count),
      ]),
      [],
      ["Most Active Requesters", "Request Count"],
      ...topRequesters.map((item) => [
        `${item.name} <${item.email}>`,
        String(item.count),
      ]),
      [],
      ["Latest Review Activity", "Details"],
      ...latestReviewedRequests.map((request) => [
        request.requesterName,
        `${request.permissionCode} / ${request.status} / reviewer: ${
          request.reviewerName ?? "Unknown reviewer"
        } / reviewed: ${request.reviewedAtLabel ?? "-"}`,
      ]),
    ]);
  };

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
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={exportVisibleRequests}
              disabled={!filteredRequests.length}
              data-testid="export-visible-permission-requests"
            >
              <Download className="size-4" />
              Export visible CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={exportSummaryReport}
              data-testid="export-permission-request-summary"
            >
              <Download className="size-4" />
              Export summary CSV
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All dates" },
              { id: "last7", label: "Last 7 days" },
              { id: "last30", label: "Last 30 days" },
              { id: "last90", label: "Last 90 days" },
              { id: "custom", label: "Custom range" },
            ].map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={dateRangeFilter === item.id ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => selectDateRangeFilter(item.id as DateRangeFilter)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          {dateRangeFilter === "custom" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-xl"
                aria-label="From date"
              />
              <Input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-xl"
                aria-label="To date"
              />
            </div>
          ) : null}
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
            <Badge variant="secondary">{dateRangeLabel}</Badge>
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
