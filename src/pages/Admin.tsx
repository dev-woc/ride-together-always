import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { SiteEvent } from "@/types/events";

type EventFormValues = {
  title: string;
  date_label: string;
  time_label: string;
  location: string;
  description: string;
  featured: boolean;
  signup_link: string;
  sort_order: string;
};

const emptyForm: EventFormValues = {
  title: "",
  date_label: "",
  time_label: "",
  location: "",
  description: "",
  featured: false,
  signup_link: "",
  sort_order: "0",
};

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload as T;
}

function toEventPayload(form: EventFormValues) {
  return {
    title: form.title.trim(),
    date_label: form.date_label.trim(),
    time_label: form.time_label.trim(),
    location: form.location.trim(),
    description: form.description.trim(),
    featured: form.featured,
    signup_link: form.signup_link.trim() || null,
    sort_order: Number(form.sort_order) || 0,
  };
}

function toFormValues(event: SiteEvent | null): EventFormValues {
  if (!event) {
    return emptyForm;
  }

  return {
    title: event.title,
    date_label: event.date_label,
    time_label: event.time_label,
    location: event.location,
    description: event.description,
    featured: event.featured,
    signup_link: event.signup_link || "",
    sort_order: String(event.sort_order ?? 0),
  };
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormValues>(emptyForm);

  const sessionQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => apiFetch<{ authenticated: boolean }>("/api/admin/session"),
  });

  const eventsQuery = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => apiFetch<{ events: SiteEvent[] }>("/api/admin/events"),
    enabled: sessionQuery.data?.authenticated === true,
  });

  const selectedEvent = useMemo(
    () => eventsQuery.data?.events.find((event) => event.id === selectedId) ?? null,
    [eventsQuery.data?.events, selectedId]
  );

  const loginMutation = useMutation({
    mutationFn: (nextPassword: string) =>
      apiFetch<{ authenticated: boolean }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: nextPassword }),
      }),
    onSuccess: async () => {
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Admin access granted" });
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ authenticated: boolean }>("/api/admin/logout", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      setSelectedId(null);
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      queryClient.removeQueries({ queryKey: ["admin-events"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      apiFetch<{ event: SiteEvent }>("/api/admin/events", {
        method: "POST",
        body: JSON.stringify(toEventPayload(values)),
      }),
    onSuccess: async ({ event }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setSelectedId(event.id);
      setForm(toFormValues(event));
      toast({ title: "Event created" });
    },
    onError: (error: Error) => {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: EventFormValues }) =>
      apiFetch<{ event: SiteEvent }>(`/api/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(toEventPayload(values)),
      }),
    onSuccess: async ({ event }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setForm(toFormValues(event));
      toast({ title: "Event updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/events/${id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setSelectedId(null);
      setForm(emptyForm);
      toast({ title: "Event deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const saveLabel = selectedEvent ? "Update Event" : "Create Event";
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSelectEvent = (event: SiteEvent) => {
    setSelectedId(event.id);
    setForm(toFormValues(event));
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, values: form });
      return;
    }

    createMutation.mutate(form);
  };

  if (sessionQuery.isLoading) {
    return <div className="min-h-screen bg-background px-6 py-24 text-foreground">Loading admin...</div>;
  }

  if (!sessionQuery.data?.authenticated) {
    return (
      <div className="min-h-screen bg-background px-6 py-24">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Admin Login</CardTitle>
              <CardDescription>Use the shared admin password to manage site events.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  loginMutation.mutate(password);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter admin password"
                  />
                </div>
                <Button type="submit" className="w-full font-display uppercase tracking-wider" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Site Admin</p>
            <h1 className="font-display text-4xl font-bold uppercase text-foreground">Manage Events</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              This is Phase 1 of the admin system. Events are live-editable here, while homepage content stays code-owned for now.
            </p>
          </div>
          <Button variant="outline" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display uppercase">Events</CardTitle>
                <CardDescription>Select an event or create a new one.</CardDescription>
              </div>
              <Button onClick={handleCreateNew} size="sm">
                New Event
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading events...</p>
              ) : eventsQuery.data?.events.length ? (
                eventsQuery.data.events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleSelectEvent(event)}
                    className={`w-full rounded-sm border p-4 text-left transition-colors ${
                      event.id === selectedId ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-lg uppercase text-foreground">{event.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{event.date_label}</p>
                      </div>
                      {event.featured ? (
                        <span className="rounded-sm bg-primary px-2 py-1 text-[10px] uppercase tracking-wider text-primary-foreground">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No events yet. Create the first one.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">{selectedEvent ? "Edit Event" : "Create Event"}</CardTitle>
              <CardDescription>Changes save directly to the database and update the public events section.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                    <Input required id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={form.sort_order}
                      onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Date picker */}
                  <div className="space-y-2">
                    <Label htmlFor="date_label">Date Label <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        required
                        id="date_label"
                        value={form.date_label}
                        onChange={(event) => setForm((current) => ({ ...current, date_label: event.target.value }))}
                        placeholder="e.g. Every Saturday"
                        className="flex-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <CalendarIcon size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            onSelect={(date) => {
                              if (date) setForm((current) => ({ ...current, date_label: format(date, "EEEE, MMMM d") }));
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Time picker */}
                  <div className="space-y-2">
                    <Label htmlFor="time_label">Time Label <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        required
                        id="time_label"
                        value={form.time_label}
                        onChange={(event) => setForm((current) => ({ ...current, time_label: event.target.value }))}
                        placeholder="e.g. 8:00 AM"
                        className="flex-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <Clock size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3" align="end">
                          <p className="text-xs text-muted-foreground mb-2 font-display uppercase tracking-wider">Pick a time</p>
                          <input
                            type="time"
                            className="w-full bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                            onChange={(e) => {
                              const [h, m] = e.target.value.split(":");
                              if (!h || !m) return;
                              const hour = parseInt(h, 10);
                              const ampm = hour >= 12 ? "PM" : "AM";
                              const h12 = hour % 12 === 0 ? 12 : hour % 12;
                              setForm((current) => ({ ...current, time_label: `${h12}:${m} ${ampm}` }));
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                  <Input
                    required
                    id="location"
                    value={form.location}
                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup_link">Signup Link</Label>
                  <Input
                    id="signup_link"
                    value={form.signup_link}
                    onChange={(event) => setForm((current) => ({ ...current, signup_link: event.target.value }))}
                    placeholder="/ride-signup"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    required
                    id="description"
                    rows={5}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-sm border border-border px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">Featured event</p>
                    <p className="text-sm text-muted-foreground">Featured items render with the highlighted treatment on the homepage.</p>
                  </div>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm((current) => ({ ...current, featured: checked }))}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : saveLabel}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCreateNew}>
                      Reset
                    </Button>
                  </div>
                  {selectedEvent ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(selectedEvent.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
