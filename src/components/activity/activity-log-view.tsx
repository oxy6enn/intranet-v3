"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Clock3, Download, Search, ShieldCheck, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ActivityEventItem = {
  id: string;
  eventType: string;
  actorName: string | null;
  subjectName: string | null;
  entityType: string | null;
  title: string;
  description: string;
  createdAtIso: string;
  createdAtLabel: string;
};

type ActivityLogViewProps = {
  isAdmin: boolean;
  totalEvents: number;
  events: ActivityEventItem[];
};

type EventFilter = "all" | "identify" | "request";
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

export function ActivityLogView({
  isAdmin,
  totalEvents,
  events,
}: ActivityLogViewProps) {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredEvents = useMemo(() => {
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

    return events.filter((event) => {
      const matchesEventFilter =
        eventFilter === "all"
          ? true
          : eventFilter === "identify"
            ? event.eventType === "identify.completed"
            : event.eventType.startsWith("permission_request.");

      if (!matchesEventFilter) {
        return false;
      }

      const createdAt = new Date(event.createdAtIso);

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

      const haystack = [
        event.title,
        event.description,
        event.eventType,
        event.entityType ?? "",
        event.actorName ?? "",
        event.subjectName ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [dateRangeFilter, deferredQuery, eventFilter, events, fromDate, toDate]);

  const identifyEvents = filteredEvents.filter(
    (event) => event.eventType === "identify.completed"
  ).length;
  const requestEvents = filteredEvents.filter((event) =>
    event.eventType.startsWith("permission_request.")
  ).length;
  const topActors = Object.values(
    filteredEvents.reduce<Record<string, { label: string; count: number }>>(
      (accumulator, event) => {
        const label = event.actorName ?? event.subjectName ?? "System";

        if (!accumulator[label]) {
          accumulator[label] = {
            label,
            count: 0,
          };
        }

        accumulator[label].count += 1;
        return accumulator;
      },
      {}
    )
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
  const eventTypeBreakdown = Object.values(
    filteredEvents.reduce<Record<string, { key: string; count: number }>>(
      (accumulator, event) => {
        if (!accumulator[event.eventType]) {
          accumulator[event.eventType] = {
            key: event.eventType,
            count: 0,
          };
        }

        accumulator[event.eventType].count += 1;
        return accumulator;
      },
      {}
    )
  ).sort((left, right) => right.count - left.count);
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

  const exportVisibleEvents = () => {
    downloadCsvFile("activity-events.csv", [
      [
        "Created At",
        "Event Type",
        "Title",
        "Description",
        "Actor",
        "Subject",
        "Entity Type",
      ],
      ...filteredEvents.map((event) => [
        event.createdAtLabel,
        event.eventType,
        event.title,
        event.description,
        event.actorName ?? "",
        event.subjectName ?? "",
        event.entityType ?? "",
      ]),
    ]);
  };

  const exportSummary = () => {
    downloadCsvFile("activity-summary.csv", [
      ["Metric", "Value"],
      ["Visible Events", String(filteredEvents.length)],
      ["Total Events", String(totalEvents)],
      ["Identify Events", String(identifyEvents)],
      ["Request Events", String(requestEvents)],
      ["Event Filter", eventFilter],
      ["Date Range Filter", dateRangeLabel],
      ["Search Query", normalizedQuery || "-"],
      [],
      ["Event Type", "Count"],
      ...eventTypeBreakdown.map((item) => [item.key, String(item.count)]),
      [],
      ["Top Actors", "Count"],
      ...topActors.map((item) => [item.label, String(item.count)]),
    ]);
  };

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <Badge variant="outline">Workspace / Activity</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Activity log
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            A chronological view of important identity, permission request, and
            review events recorded by the system.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Visible events</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {filteredEvents.length}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              filtered from {totalEvents} total events
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Identify events</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {identifyEvents}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              employee verification milestones recorded
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Request events</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {requestEvents}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              permission request and review events tracked
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Top actor</p>
            <p className="mt-3 text-lg font-semibold tracking-tight">
              {topActors[0]?.label ?? "No activity"}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {topActors[0] ? `${topActors[0].count} visible events` : "no actor data"}
            </p>
          </article>
        </section>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-2xl">Search and filters</CardTitle>
                <CardDescription>
                  Narrow the timeline by event type, date range, or search keywords.
                </CardDescription>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, description, actor, subject..."
                  className="rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={exportVisibleEvents}
                disabled={!filteredEvents.length}
                data-testid="export-visible-activity-events"
              >
                <Download className="size-4" />
                Export visible CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={exportSummary}
                data-testid="export-activity-summary"
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
                { id: "all", label: "All events" },
                { id: "identify", label: "Identify only" },
                { id: "request", label: "Request events" },
              ].map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={eventFilter === item.id ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setEventFilter(item.id as EventFilter)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {filteredEvents.length} visible / {totalEvents} total events
              </Badge>
              <Badge variant="secondary">{dateRangeLabel}</Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                  <Clock3 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Timeline</CardTitle>
                  <CardDescription>
                    Latest recorded events ordered from newest to oldest.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredEvents.length ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge variant="outline">{event.eventType}</Badge>
                      {event.entityType ? (
                        <Badge variant="secondary">{event.entityType}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>{event.createdAtLabel}</span>
                      {event.actorName ? <span>Actor {event.actorName}</span> : null}
                      {event.subjectName ? (
                        <span>Subject {event.subjectName}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  No activity event matches the current filter.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Audit summary</CardTitle>
              <CardDescription>
                Quick reporting and route shortcuts from the current activity set.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Event type breakdown
                </p>
                {eventTypeBreakdown.length ? (
                  eventTypeBreakdown.slice(0, 5).map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                    >
                      <p className="text-sm font-medium">{item.key}</p>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                    No event matches the current filter.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Top actors
                </p>
                {topActors.length ? (
                  topActors.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <Badge variant="outline">{item.count} events</Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                    No actor insight matches the current filter.
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Related routes
                </p>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-xl"
                  )}
                >
                  <Clock3 className="size-4" />
                  Back to dashboard
                </Link>
                <Link
                  href="/notifications"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-xl"
                  )}
                >
                  <ShieldCheck className="size-4" />
                  Notification center
                </Link>
                <Link
                  href="/permissions/request"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-xl"
                  )}
                >
                  <ShieldCheck className="size-4" />
                  Permission requests
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-xl"
                  )}
                >
                  <UserCircle2 className="size-4" />
                  Profile details
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin/permission-requests"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-start rounded-xl"
                    )}
                  >
                    <ShieldCheck className="size-4" />
                    Admin request inbox
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
