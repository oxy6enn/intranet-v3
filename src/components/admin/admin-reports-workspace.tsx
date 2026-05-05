"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Download, FileClock, Search, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EventTypeItem = {
  key: string;
  count: number;
};

type PermissionDemandItem = {
  code: string;
  name: string;
  count: number;
};

type RequesterItem = {
  name: string;
  email: string;
  count: number;
};

type ReviewDecisionItem = {
  id: string;
  requesterName: string;
  permissionCode: string;
  permissionName: string;
  status: string;
  reviewerName: string | null;
  reviewedAtLabel: string;
  reviewNote: string | null;
};

type ActivityTimelineItem = {
  id: string;
  eventType: string;
  title: string;
  description: string;
  actorName: string | null;
  createdAtLabel: string;
};

type AdminReportsWorkspaceProps = {
  summary: {
    totalActivityEvents: number;
    totalPermissionRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    reviewedLast7Days: number;
    activityLast7Days: number;
    activeUsers: number;
  };
  eventBreakdown: EventTypeItem[];
  permissionDemand: PermissionDemandItem[];
  topRequesters: RequesterItem[];
  recentReviewDecisions: ReviewDecisionItem[];
  recentActivity: ActivityTimelineItem[];
};

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

export function AdminReportsWorkspace({
  summary,
  eventBreakdown,
  permissionDemand,
  topRequesters,
  recentReviewDecisions,
  recentActivity,
}: AdminReportsWorkspaceProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredReviews = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return recentReviewDecisions;
    }

    return recentReviewDecisions.filter((item) =>
      [
        item.requesterName,
        item.permissionCode,
        item.permissionName,
        item.status,
        item.reviewerName ?? "",
        item.reviewNote ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [deferredQuery, recentReviewDecisions]);

  const filteredActivity = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return recentActivity;
    }

    return recentActivity.filter((item) =>
      [
        item.eventType,
        item.title,
        item.description,
        item.actorName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [deferredQuery, recentActivity]);

  const exportReportSummary = () => {
    downloadCsvFile("admin-reports-summary.csv", [
      ["Metric", "Value"],
      ["Total Activity Events", String(summary.totalActivityEvents)],
      ["Activity Events Last 7 Days", String(summary.activityLast7Days)],
      ["Total Permission Requests", String(summary.totalPermissionRequests)],
      ["Pending Requests", String(summary.pendingRequests)],
      ["Approved Requests", String(summary.approvedRequests)],
      ["Rejected Requests", String(summary.rejectedRequests)],
      ["Reviewed Last 7 Days", String(summary.reviewedLast7Days)],
      ["Active Users", String(summary.activeUsers)],
      [],
      ["Event Breakdown", "Count"],
      ...eventBreakdown.map((item) => [item.key, String(item.count)]),
      [],
      ["Top Requested Permissions", "Count"],
      ...permissionDemand.map((item) => [
        `${item.name} (${item.code})`,
        String(item.count),
      ]),
      [],
      ["Top Requesters", "Count"],
      ...topRequesters.map((item) => [
        `${item.name} <${item.email}>`,
        String(item.count),
      ]),
    ]);
  };

  const exportReviewWindow = () => {
    downloadCsvFile("admin-review-window.csv", [
      [
        "Requester Name",
        "Permission Code",
        "Permission Name",
        "Status",
        "Reviewer Name",
        "Reviewed At",
        "Review Note",
      ],
      ...filteredReviews.map((item) => [
        item.requesterName,
        item.permissionCode,
        item.permissionName,
        item.status,
        item.reviewerName ?? "",
        item.reviewedAtLabel,
        item.reviewNote ?? "",
      ]),
      [],
      ["Event Type", "Title", "Description", "Actor", "Created At"],
      ...filteredActivity.map((item) => [
        item.eventType,
        item.title,
        item.description,
        item.actorName ?? "",
        item.createdAtLabel,
      ]),
    ]);
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total requests</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {summary.totalPermissionRequests}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            all permission requests recorded
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending queue</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {summary.pendingRequests}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            requests still waiting for a decision
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Reviewed in 7 days</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {summary.reviewedLast7Days}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            approvals and rejections completed recently
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Activity in 7 days</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {summary.activityLast7Days}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            identity and request events added to the audit trail
          </p>
        </article>
      </section>

      <Card className="rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-2xl">Cross-view reports</CardTitle>
              <CardDescription>
                Combine request metrics and recent activity into one admin-facing view.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search review decisions and activity..."
                className="rounded-xl pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={exportReportSummary}
              data-testid="export-admin-report-summary"
            >
              <Download className="size-4" />
              Export summary CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={exportReviewWindow}
              data-testid="export-admin-report-window"
            >
              <Download className="size-4" />
              Export review window CSV
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">report:view</Badge>
            <Badge variant="secondary">
              {filteredReviews.length} review rows / {filteredActivity.length} activity rows
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <CardTitle className="text-2xl">Request demand</CardTitle>
                <CardDescription>
                  Permissions and people driving the most access review work.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Top requested permissions
              </p>
              {permissionDemand.length ? (
                permissionDemand.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.code}</p>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  No permission demand data available yet.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Most active requesters
              </p>
              {topRequesters.length ? (
                topRequesters.map((item) => (
                  <div
                    key={item.email}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.email}</p>
                    </div>
                    <Badge variant="outline">{item.count} requests</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  No requester demand data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                <FileClock className="size-4" />
              </div>
              <div>
                <CardTitle className="text-2xl">Recent review window</CardTitle>
                <CardDescription>
                  A compact slice of the latest review decisions and audit activity.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Review decisions
              </p>
              {filteredReviews.length ? (
                filteredReviews.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.requesterName}</p>
                      <Badge variant="outline">{item.permissionCode}</Badge>
                      <Badge variant="secondary">{item.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.permissionName} · reviewer {item.reviewerName ?? "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.reviewedAtLabel}
                    </p>
                    {item.reviewNote ? (
                      <p className="mt-2 text-sm text-foreground/80">
                        Note: {item.reviewNote}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  No review item matches the current search.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Audit activity
              </p>
              {filteredActivity.length ? (
                filteredActivity.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant="outline">{item.eventType}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>{item.createdAtLabel}</span>
                      {item.actorName ? <span>Actor {item.actorName}</span> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  No activity item matches the current search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                <Users className="size-4" />
              </div>
              <div>
                <CardTitle className="text-2xl">Operational footprint</CardTitle>
                <CardDescription>
                  High-level counts that help interpret report context.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">Active users</p>
              <Badge variant="secondary">{summary.activeUsers}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">Approved requests</p>
              <Badge variant="secondary">{summary.approvedRequests}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">Rejected requests</p>
              <Badge variant="secondary">{summary.rejectedRequests}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">Total activity events</p>
              <Badge variant="outline">{summary.totalActivityEvents}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Event breakdown</CardTitle>
            <CardDescription>
              Which audit event types contribute most to the current operational trail.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {eventBreakdown.length ? (
              eventBreakdown.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <p className="text-sm font-medium">{item.key}</p>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground md:col-span-2">
                No event breakdown data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
