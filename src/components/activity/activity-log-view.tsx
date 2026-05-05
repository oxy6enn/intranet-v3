"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Clock3, Search, ShieldCheck, UserCircle2 } from "lucide-react";
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
  createdAtLabel: string;
};

type ActivityLogViewProps = {
  isAdmin: boolean;
  totalEvents: number;
  events: ActivityEventItem[];
};

type EventFilter = "all" | "identify" | "request";

export function ActivityLogView({
  isAdmin,
  totalEvents,
  events,
}: ActivityLogViewProps) {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

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
  }, [deferredQuery, eventFilter, events]);

  const identifyEvents = filteredEvents.filter(
    (event) => event.eventType === "identify.completed"
  ).length;
  const requestEvents = filteredEvents.filter((event) =>
    event.eventType.startsWith("permission_request.")
  ).length;

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

        <section className="grid gap-4 md:grid-cols-3">
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
        </section>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-2xl">Search and filters</CardTitle>
                <CardDescription>
                  Narrow the timeline by event type or search keywords.
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
              <CardTitle className="text-2xl">Related routes</CardTitle>
              <CardDescription>
                Jump quickly between the core workflow and its audit trail.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
