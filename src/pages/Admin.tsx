import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { defaultSiteContent, mergeSiteContent } from "@/lib/site-content";
import { uploadFiles } from "@/lib/uploadthing";
import type { CommunityPhoto } from "@/types/community-photo";
import type { CommunityVideo } from "@/types/community-video";
import type { SiteEvent } from "@/types/events";
import type { AboutContent, ContactContent, DonateContent, HeroContent, SiteContent } from "@/types/site-content";

type AdminTab = "signups" | "events" | "hero" | "about" | "donate" | "contact" | "community" | "resources";

type RideSignup = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  instagram_handle: string | null;
  ride_group: string;
  yoga_signup: boolean;
  lime_bike: boolean;
  bike_rental_waiver_agreed: boolean;
  driver_license_data: string | null;
  event_name: string;
  created_at: string;
};

function exportSignupsCsv(signups: RideSignup[], label: string) {
  const headers = ["Name", "Email", "Phone", "Instagram", "Event", "Ride Group", "Yoga", "Bike Rental", "Bike Waiver", "Signed Up"];
  const rows = signups.map((s) => [
    `"${s.full_name}"`,
    `"${s.email}"`,
    `"${s.phone_number}"`,
    `"${s.instagram_handle ?? ""}"`,
    `"${s.event_name}"`,
    `"${s.ride_group}"`,
    s.yoga_signup ? "Yes" : "No",
    s.lime_bike ? "Yes" : "No",
    s.bike_rental_waiver_agreed ? "Yes" : "No",
    `"${new Date(s.created_at).toLocaleString()}"`,
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ride-signups-${label.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Resource = {
  id: string;
  title: string;
  description: string;
  link: string;
  urgent: boolean;
  sort_order: number;
};

type ResourceFormValues = {
  title: string;
  description: string;
  link: string;
  urgent: boolean;
  sort_order: string;
};

type CommunityPhotoFormValues = {
  alt_text: string;
  sort_order: string;
};

type CommunityVideoFormValues = {
  title: string;
  sort_order: string;
};

const emptyResourceForm: ResourceFormValues = {
  title: "",
  description: "",
  link: "",
  urgent: false,
  sort_order: "0",
};

const emptyCommunityPhotoForm: CommunityPhotoFormValues = {
  alt_text: "",
  sort_order: "0",
};

const emptyCommunityVideoForm: CommunityVideoFormValues = {
  title: "",
  sort_order: "0",
};

type EventFormValues = {
  title: string;
  date_label: string;
  time_label: string;
  location: string;
  description: string;
  featured: boolean;
  signup_link: string;
  sort_order: string;
  show_yoga: boolean;
  show_bike_rental: boolean;
};

const emptyEventForm: EventFormValues = {
  title: "",
  date_label: "",
  time_label: "",
  location: "",
  description: "",
  featured: false,
  signup_link: "",
  sort_order: "0",
  show_yoga: false,
  show_bike_rental: false,
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

function buildAutoLink(title: string, showYoga: boolean, showBikeRental: boolean) {
  if (!title.trim()) return "";
  let link = `/ride-signup?event=${encodeURIComponent(title.trim())}`;
  if (showYoga) link += "&yoga=1";
  if (showBikeRental) link += "&bikes=1";
  return link;
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
    show_yoga: form.show_yoga,
    show_bike_rental: form.show_bike_rental,
  };
}

function toEventFormValues(event: SiteEvent | null): EventFormValues {
  if (!event) {
    return emptyEventForm;
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
    show_yoga: event.show_yoga ?? false,
    show_bike_rental: event.show_bike_rental ?? false,
  };
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>("events");
  const [password, setPassword] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormValues>(emptyEventForm);
  const [heroForm, setHeroForm] = useState<HeroContent>(defaultSiteContent.hero);
  const [aboutForm, setAboutForm] = useState<AboutContent>(defaultSiteContent.about);
  const [donateForm, setDonateForm] = useState<DonateContent>(defaultSiteContent.donate);
  const [contactForm, setContactForm] = useState<ContactContent>(defaultSiteContent.contact);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourceFormValues>(emptyResourceForm);
  const [communityPhotoForm, setCommunityPhotoForm] = useState<CommunityPhotoFormValues>(emptyCommunityPhotoForm);
  const [communityPhotoFile, setCommunityPhotoFile] = useState<File | null>(null);
  const [communityVideoForm, setCommunityVideoForm] = useState<CommunityVideoFormValues>(emptyCommunityVideoForm);
  const [communityVideoFile, setCommunityVideoFile] = useState<File | null>(null);
  const [selectedSignupId, setSelectedSignupId] = useState<string | null>(null);
  const [signupEventFilter, setSignupEventFilter] = useState<string>("all");

  const sessionQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => apiFetch<{ authenticated: boolean }>("/api/admin/session"),
  });

  const eventsQuery = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => apiFetch<{ events: SiteEvent[] }>("/api/admin/events"),
    enabled: sessionQuery.data?.authenticated === true,
  });

  const siteContentQuery = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: async () => {
      const data = await apiFetch<{ content: Partial<SiteContent> }>("/api/admin/site-content");
      return mergeSiteContent(data.content);
    },
    enabled: sessionQuery.data?.authenticated === true,
  });

  const resourcesQuery = useQuery({
    queryKey: ["admin-resources"],
    queryFn: () => apiFetch<{ resources: Resource[] }>("/api/admin/resources"),
    enabled: sessionQuery.data?.authenticated === true,
  });

  const communityPhotosQuery = useQuery({
    queryKey: ["admin-community-photos"],
    queryFn: () => apiFetch<{ photos: CommunityPhoto[] }>("/api/admin/community-photos"),
    enabled: sessionQuery.data?.authenticated === true,
  });

  const communityVideosQuery = useQuery({
    queryKey: ["admin-community-videos"],
    queryFn: () => apiFetch<{ videos: CommunityVideo[] }>("/api/admin/community-videos"),
    enabled: sessionQuery.data?.authenticated === true,
  });

  const rideSignupsQuery = useQuery({
    queryKey: ["admin-ride-signups"],
    queryFn: () => apiFetch<{ signups: RideSignup[]; grouped: Record<string, RideSignup[]> }>("/api/admin/ride-signups"),
    enabled: sessionQuery.data?.authenticated === true,
  });

  const selectedResource = useMemo(
    () => resourcesQuery.data?.resources.find((r) => r.id === selectedResourceId) ?? null,
    [resourcesQuery.data?.resources, selectedResourceId]
  );

  const createResourceMutation = useMutation({
    mutationFn: (values: ResourceFormValues) =>
      apiFetch<{ resource: Resource }>("/api/admin/resources", {
        method: "POST",
        body: JSON.stringify({ ...values, sort_order: Number(values.sort_order) || 0 }),
      }),
    onSuccess: async ({ resource }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      setSelectedResourceId(resource.id);
      setResourceForm({ ...resource, sort_order: String(resource.sort_order) });
      toast({ title: "Resource created" });
    },
    onError: (error: Error) => toast({ title: "Create failed", description: error.message, variant: "destructive" }),
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ResourceFormValues }) =>
      apiFetch<{ resource: Resource }>(`/api/admin/resources?id=${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...values, sort_order: Number(values.sort_order) || 0 }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Resource updated" });
    },
    onError: (error: Error) => toast({ title: "Update failed", description: error.message, variant: "destructive" }),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/resources?id=${id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      setSelectedResourceId(null);
      setResourceForm(emptyResourceForm);
      toast({ title: "Resource deleted" });
    },
    onError: (error: Error) => toast({ title: "Delete failed", description: error.message, variant: "destructive" }),
  });

  const uploadCommunityPhotoMutation = useMutation({
    mutationFn: async ({ file, values }: { file: File; values: CommunityPhotoFormValues }) => {
      const uploadedFiles = await uploadFiles("communityPhoto", { files: [file] });
      const uploadedFile = uploadedFiles[0];

      if (!uploadedFile) {
        throw new Error("Upload did not return a file");
      }

      return apiFetch<{ photo: CommunityPhoto }>("/api/admin/community-photos", {
        method: "POST",
        body: JSON.stringify({
          image_url: uploadedFile.ufsUrl || uploadedFile.url,
          file_key: uploadedFile.key,
          alt_text: values.alt_text.trim(),
          sort_order: Number(values.sort_order) || 0,
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-community-photos"] });
      await queryClient.invalidateQueries({ queryKey: ["community-photos"] });
      setCommunityPhotoForm(emptyCommunityPhotoForm);
      setCommunityPhotoFile(null);
      toast({ title: "Community photo uploaded" });
    },
    onError: (error: Error) => toast({ title: "Upload failed", description: error.message, variant: "destructive" }),
  });

  const deleteCommunityPhotoMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/community-photos?id=${id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-community-photos"] });
      await queryClient.invalidateQueries({ queryKey: ["community-photos"] });
      toast({ title: "Community photo removed" });
    },
    onError: (error: Error) => toast({ title: "Delete failed", description: error.message, variant: "destructive" }),
  });

  const uploadCommunityVideoMutation = useMutation({
    mutationFn: async ({ file, values }: { file: File; values: CommunityVideoFormValues }) => {
      const uploadedFiles = await uploadFiles("communityVideo", { files: [file] });
      const uploadedFile = uploadedFiles[0];

      if (!uploadedFile) {
        throw new Error("Upload did not return a file");
      }

      return apiFetch<{ video: CommunityVideo }>("/api/admin/community-videos", {
        method: "POST",
        body: JSON.stringify({
          video_url: uploadedFile.ufsUrl || uploadedFile.url,
          file_key: uploadedFile.key,
          title: values.title.trim(),
          sort_order: Number(values.sort_order) || 0,
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-community-videos"] });
      await queryClient.invalidateQueries({ queryKey: ["community-videos"] });
      setCommunityVideoForm(emptyCommunityVideoForm);
      setCommunityVideoFile(null);
      toast({ title: "Community video uploaded" });
    },
    onError: (error: Error) => toast({ title: "Upload failed", description: error.message, variant: "destructive" }),
  });

  const deleteCommunityVideoMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/community-videos?id=${id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-community-videos"] });
      await queryClient.invalidateQueries({ queryKey: ["community-videos"] });
      toast({ title: "Community video removed" });
    },
    onError: (error: Error) => toast({ title: "Delete failed", description: error.message, variant: "destructive" }),
  });

  const selectedEvent = useMemo(
    () => eventsQuery.data?.events.find((event) => event.id === selectedEventId) ?? null,
    [eventsQuery.data?.events, selectedEventId]
  );

  useEffect(() => {
    if (!siteContentQuery.data) {
      return;
    }

    setHeroForm(siteContentQuery.data.hero);
    setAboutForm(siteContentQuery.data.about);
    setDonateForm(siteContentQuery.data.donate);
    setContactForm(siteContentQuery.data.contact);
  }, [siteContentQuery.data]);

  const loginMutation = useMutation({
    mutationFn: (nextPassword: string) =>
      apiFetch<{ authenticated: boolean }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: nextPassword }),
      }),
    onSuccess: async () => {
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
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
      setSelectedEventId(null);
      setEventForm(emptyEventForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      queryClient.removeQueries({ queryKey: ["admin-events"] });
      queryClient.removeQueries({ queryKey: ["admin-site-content"] });
      queryClient.removeQueries({ queryKey: ["admin-community-photos"] });
      queryClient.removeQueries({ queryKey: ["admin-community-videos"] });
      queryClient.removeQueries({ queryKey: ["admin-ride-signups"] });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      apiFetch<{ event: SiteEvent }>("/api/admin/events", {
        method: "POST",
        body: JSON.stringify(toEventPayload(values)),
      }),
    onSuccess: async ({ event }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["site-events"] });
      setSelectedEventId(event.id);
      setEventForm(toEventFormValues(event));
      toast({ title: "Event created" });
    },
    onError: (error: Error) => {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: EventFormValues }) =>
      apiFetch<{ event: SiteEvent }>(`/api/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(toEventPayload(values)),
      }),
    onSuccess: async ({ event }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["site-events"] });
      setEventForm(toEventFormValues(event));
      toast({ title: "Event updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/events/${id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["site-events"] });
      setSelectedEventId(null);
      setEventForm(emptyEventForm);
      toast({ title: "Event deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const saveSiteContentMutation = useMutation({
    mutationFn: ({ key, value }: { key: keyof SiteContent; value: SiteContent[keyof SiteContent] }) =>
      apiFetch<{ item: { key: string } }>("/api/admin/site-content", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: `${variables.key} content saved` });
    },
    onError: (error: Error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const resetContentForms = () => {
    const merged = siteContentQuery.data || defaultSiteContent;
    setHeroForm(merged.hero);
    setAboutForm(merged.about);
    setDonateForm(merged.donate);
    setContactForm(merged.contact);
  };

  const handleEventSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedEvent) {
      updateEventMutation.mutate({ id: selectedEvent.id, values: eventForm });
      return;
    }

    createEventMutation.mutate(eventForm);
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
              <CardDescription>Use the shared admin password to manage events and homepage content.</CardDescription>
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
            <h1 className="font-display text-4xl font-bold uppercase text-foreground">Manage Site Content</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Phase 2 is live. Events, hero copy, about copy, donate messaging, and footer/contact links now save into the admin content layer.
            </p>
          </div>
          <Button variant="outline" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)} className="space-y-6">
          <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="signups">Ride Sign-Ups</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="donate">Donate</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="community">Community Media</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="signups">
            {(() => {
              const allSignups = rideSignupsQuery.data?.signups ?? [];
              const grouped = rideSignupsQuery.data?.grouped ?? {};
              const eventNames = Object.keys(grouped);
              const filtered = signupEventFilter === "all" ? allSignups : (grouped[signupEventFilter] ?? []);
              const selectedSignup = allSignups.find((s) => s.id === selectedSignupId) ?? null;
              const yogaCount = filtered.filter((s) => s.yoga_signup).length;
              const bikeCount = filtered.filter((s) => s.lime_bike).length;

              return (
                <div className="space-y-6">
                  {/* Header row */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="font-display text-xl font-bold uppercase text-foreground">Ride Sign-Ups</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {filtered.length} sign-up{filtered.length !== 1 ? "s" : ""}
                        {yogaCount > 0 && ` · ${yogaCount} yoga`}
                        {bikeCount > 0 && ` · ${bikeCount} bike rental${bikeCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filtered.length === 0}
                      onClick={() => exportSignupsCsv(filtered, signupEventFilter === "all" ? "all-events" : signupEventFilter)}
                      className="font-display uppercase tracking-wider text-xs"
                    >
                      <Download size={14} className="mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  {/* Event filter tabs */}
                  {eventNames.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => { setSignupEventFilter("all"); setSelectedSignupId(null); }}
                        className={`font-display text-xs uppercase tracking-wider px-4 py-2 border transition-colors rounded-sm ${
                          signupEventFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                        }`}
                      >
                        All ({allSignups.length})
                      </button>
                      {eventNames.map((name) => (
                        <button
                          key={name}
                          onClick={() => { setSignupEventFilter(name); setSelectedSignupId(null); }}
                          className={`font-display text-xs uppercase tracking-wider px-4 py-2 border transition-colors rounded-sm ${
                            signupEventFilter === name ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                          }`}
                        >
                          {name} ({grouped[name]?.length ?? 0})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main content */}
                  <div className="flex gap-6 items-start">
                    <div className="flex-1 min-w-0">
                      {rideSignupsQuery.isLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : filtered.length === 0 ? (
                        <div className="bg-card border border-border rounded-sm p-12 text-center">
                          <p className="text-muted-foreground text-sm">No sign-ups yet{signupEventFilter !== "all" ? ` for ${signupEventFilter}` : ""}.</p>
                        </div>
                      ) : (
                        <div className="bg-card border border-border rounded-sm overflow-hidden">
                          {/* Table header */}
                          <div className="hidden md:grid grid-cols-[2fr,2fr,1.5fr,1fr,1fr,1fr,1fr] gap-3 px-4 py-3 border-b border-border bg-muted/50">
                            {["Name", "Email", "Phone", "Group", "Yoga", "Bike", "Date"].map((h) => (
                              <span key={h} className="font-display text-xs uppercase tracking-wider text-muted-foreground">{h}</span>
                            ))}
                          </div>
                          {/* Table rows */}
                          {filtered.map((signup, i) => (
                            <button
                              key={signup.id}
                              onClick={() => setSelectedSignupId(selectedSignupId === signup.id ? null : signup.id)}
                              className={`w-full text-left transition-colors ${
                                selectedSignupId === signup.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40"
                              } ${i !== 0 ? "border-t border-border" : ""}`}
                            >
                              {/* Desktop row */}
                              <div className="hidden md:grid grid-cols-[2fr,2fr,1.5fr,1fr,1fr,1fr,1fr] gap-3 px-4 py-3 items-center">
                                <span className="font-medium text-sm text-foreground truncate">{signup.full_name}</span>
                                <span className="text-xs text-muted-foreground truncate">{signup.email}</span>
                                <span className="text-xs text-muted-foreground">{signup.phone_number}</span>
                                <span className="text-xs text-muted-foreground capitalize">{signup.ride_group}</span>
                                <span className={`text-xs font-medium ${signup.yoga_signup ? "text-primary" : "text-muted-foreground"}`}>
                                  {signup.yoga_signup ? "Yes" : "—"}
                                </span>
                                <span className={`text-xs font-medium ${signup.lime_bike ? "text-primary" : "text-muted-foreground"}`}>
                                  {signup.lime_bike ? "Yes" : "—"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(signup.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {/* Mobile card */}
                              <div className="md:hidden px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-sm text-foreground">{signup.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{signup.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{signup.ride_group} · {signup.event_name}</p>
                                  </div>
                                  <div className="text-right text-xs text-muted-foreground shrink-0">
                                    {signup.yoga_signup && <p className="text-primary">Yoga</p>}
                                    {signup.lime_bike && <p className="text-primary">Bike</p>}
                                    <p>{new Date(signup.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Detail panel */}
                    {selectedSignup && (
                      <div className="w-80 shrink-0 bg-card border border-border rounded-sm p-5 space-y-4 self-start sticky top-6">
                        <div className="flex items-start justify-between">
                          <h3 className="font-display text-base font-bold uppercase text-foreground leading-tight">{selectedSignup.full_name}</h3>
                          <button onClick={() => setSelectedSignupId(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none ml-2">×</button>
                        </div>
                        <div className="space-y-2 text-sm">
                          {[
                            ["Event", selectedSignup.event_name],
                            ["Email", selectedSignup.email],
                            ["Phone", selectedSignup.phone_number],
                            ["Instagram", selectedSignup.instagram_handle || "—"],
                            ["Ride Group", selectedSignup.ride_group],
                            ["Yoga", selectedSignup.yoga_signup ? "Yes" : "No"],
                            ["Bike Rental", selectedSignup.lime_bike ? "Yes" : "No"],
                            ["Bike Waiver", selectedSignup.bike_rental_waiver_agreed ? "Agreed" : "N/A"],
                            ["Signed Up", new Date(selectedSignup.created_at).toLocaleString()],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3">
                              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{label}</span>
                              <span className="text-xs text-foreground text-right capitalize">{value}</span>
                            </div>
                          ))}
                        </div>
                        {selectedSignup.driver_license_data && (
                          <div className="border-t border-border pt-4">
                            <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">Driver's License</p>
                            <img
                              src={selectedSignup.driver_license_data}
                              alt="Driver's license"
                              className="w-full rounded-sm border border-border object-contain max-h-40"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="events">
            <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display uppercase">Events</CardTitle>
                    <CardDescription>Select an event or create a new one.</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedEventId(null);
                      setEventForm(emptyEventForm);
                    }}
                    size="sm"
                  >
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
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setEventForm(toEventFormValues(event));
                        }}
                        className={`w-full rounded-sm border p-4 text-left transition-colors ${
                          event.id === selectedEventId ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
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
                  <form className="grid gap-5" onSubmit={handleEventSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          required
                          id="title"
                          value={eventForm.title}
                          onChange={(e) => {
                            const title = e.target.value;
                            setEventForm((current) => {
                              const autoLink = buildAutoLink(title, current.show_yoga, current.show_bike_rental);
                              const prevAuto = buildAutoLink(current.title, current.show_yoga, current.show_bike_rental);
                              return {
                                ...current,
                                title,
                                signup_link: current.signup_link === "" || current.signup_link === prevAuto ? autoLink : current.signup_link,
                              };
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input id="sort_order" type="number" value={eventForm.sort_order} onChange={(event) => setEventForm((current) => ({ ...current, sort_order: event.target.value }))} />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date_label">Date Label <span className="text-destructive">*</span></Label>
                        <div className="flex gap-2">
                          <Input
                            required
                            id="date_label"
                            value={eventForm.date_label}
                            onChange={(e) => setEventForm((current) => ({ ...current, date_label: e.target.value }))}
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
                                  if (date) setEventForm((current) => ({ ...current, date_label: format(date, "EEEE, MMMM d") }));
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time_label">Time Label <span className="text-destructive">*</span></Label>
                        <div className="flex gap-2">
                          <Input
                            required
                            id="time_label"
                            value={eventForm.time_label}
                            onChange={(e) => setEventForm((current) => ({ ...current, time_label: e.target.value }))}
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
                                  setEventForm((current) => ({ ...current, time_label: `${h12}:${m} ${ampm}` }));
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input required id="location" value={eventForm.location} onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup_link">Signup Link</Label>
                      <Input id="signup_link" value={eventForm.signup_link} onChange={(event) => setEventForm((current) => ({ ...current, signup_link: event.target.value }))} placeholder="/ride-signup?event=Event+Name" />
                      <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">/ride-signup?event=Event+Name</code> to tag signups to this event.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea required id="description" rows={5} value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-border px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">Featured event</p>
                        <p className="text-sm text-muted-foreground">Featured items render with the highlighted treatment on the homepage.</p>
                      </div>
                      <Switch checked={eventForm.featured} onCheckedChange={(checked) => setEventForm((current) => ({ ...current, featured: checked }))} />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-border px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">Show yoga signup</p>
                        <p className="text-sm text-muted-foreground">Adds an optional post-ride yoga question to the signup form.</p>
                      </div>
                      <Switch
                        checked={eventForm.show_yoga}
                        onCheckedChange={(checked) =>
                          setEventForm((current) => {
                            const updated = { ...current, show_yoga: checked };
                            const prevAuto = buildAutoLink(current.title, current.show_yoga, current.show_bike_rental);
                            const newAuto = buildAutoLink(updated.title, updated.show_yoga, updated.show_bike_rental);
                            return { ...updated, signup_link: current.signup_link === prevAuto ? newAuto : current.signup_link };
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-border px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">Show bike rental</p>
                        <p className="text-sm text-muted-foreground">Adds the Lime bike rental step (driver's license + rental waiver) to the signup form.</p>
                      </div>
                      <Switch
                        checked={eventForm.show_bike_rental}
                        onCheckedChange={(checked) =>
                          setEventForm((current) => {
                            const updated = { ...current, show_bike_rental: checked };
                            const prevAuto = buildAutoLink(current.title, current.show_yoga, current.show_bike_rental);
                            const newAuto = buildAutoLink(updated.title, updated.show_yoga, updated.show_bike_rental);
                            return { ...updated, signup_link: current.signup_link === prevAuto ? newAuto : current.signup_link };
                          })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <div className="flex gap-3">
                        <Button type="submit" disabled={createEventMutation.isPending || updateEventMutation.isPending}>
                          {createEventMutation.isPending || updateEventMutation.isPending ? "Saving..." : selectedEvent ? "Update Event" : "Create Event"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEventForm(selectedEvent ? toEventFormValues(selectedEvent) : emptyEventForm)}>
                          Reset
                        </Button>
                      </div>
                      {selectedEvent ? (
                        <Button type="button" variant="destructive" onClick={() => deleteEventMutation.mutate(selectedEvent.id)} disabled={deleteEventMutation.isPending}>
                          {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase">Hero Content</CardTitle>
                <CardDescription>Edit the homepage hero copy and CTA buttons.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveSiteContentMutation.mutate({ key: "hero", value: heroForm });
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hero-hashtag">Hashtag</Label>
                      <Input id="hero-hashtag" value={heroForm.hashtag} onChange={(event) => setHeroForm((current) => ({ ...current, hashtag: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-tagline">Tagline</Label>
                      <Input id="hero-tagline" value={heroForm.tagline} onChange={(event) => setHeroForm((current) => ({ ...current, tagline: event.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title-1">Title Line 1</Label>
                      <Input id="hero-title-1" value={heroForm.titleLine1} onChange={(event) => setHeroForm((current) => ({ ...current, titleLine1: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-title-2">Title Line 2</Label>
                      <Input id="hero-title-2" value={heroForm.titleLine2} onChange={(event) => setHeroForm((current) => ({ ...current, titleLine2: event.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hero-primary-label">Primary CTA Label</Label>
                      <Input id="hero-primary-label" value={heroForm.primaryCtaLabel} onChange={(event) => setHeroForm((current) => ({ ...current, primaryCtaLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-primary-href">Primary CTA Link</Label>
                      <Input id="hero-primary-href" value={heroForm.primaryCtaHref} onChange={(event) => setHeroForm((current) => ({ ...current, primaryCtaHref: event.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hero-secondary-label">Secondary CTA Label</Label>
                      <Input id="hero-secondary-label" value={heroForm.secondaryCtaLabel} onChange={(event) => setHeroForm((current) => ({ ...current, secondaryCtaLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-secondary-href">Secondary CTA Link</Label>
                      <Input id="hero-secondary-href" value={heroForm.secondaryCtaHref} onChange={(event) => setHeroForm((current) => ({ ...current, secondaryCtaHref: event.target.value }))} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saveSiteContentMutation.isPending}>{saveSiteContentMutation.isPending ? "Saving..." : "Save Hero"}</Button>
                    <Button type="button" variant="outline" onClick={() => setHeroForm((siteContentQuery.data || defaultSiteContent).hero)}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase">About Content</CardTitle>
                <CardDescription>Edit the about section copy and stat labels.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveSiteContentMutation.mutate({ key: "about", value: aboutForm });
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="about-eyebrow">Eyebrow</Label>
                      <Input id="about-eyebrow" value={aboutForm.eyebrow} onChange={(event) => setAboutForm((current) => ({ ...current, eyebrow: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about-title-1">Title Line 1</Label>
                      <Input id="about-title-1" value={aboutForm.titleLine1} onChange={(event) => setAboutForm((current) => ({ ...current, titleLine1: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about-title-2">Title Line 2</Label>
                      <Input id="about-title-2" value={aboutForm.titleLine2} onChange={(event) => setAboutForm((current) => ({ ...current, titleLine2: event.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-paragraph-1">Paragraph 1</Label>
                    <Textarea id="about-paragraph-1" rows={5} value={aboutForm.paragraph1} onChange={(event) => setAboutForm((current) => ({ ...current, paragraph1: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about-paragraph-2">Paragraph 2</Label>
                    <Textarea id="about-paragraph-2" rows={5} value={aboutForm.paragraph2} onChange={(event) => setAboutForm((current) => ({ ...current, paragraph2: event.target.value }))} />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    {aboutForm.stats.map((stat, index) => (
                      <div key={index} className="space-y-3 rounded-sm border border-border p-4">
                        <div className="space-y-2">
                          <Label htmlFor={`about-stat-value-${index}`}>Stat {index + 1} Value</Label>
                          <Input
                            id={`about-stat-value-${index}`}
                            value={stat.value}
                            onChange={(event) =>
                              setAboutForm((current) => ({
                                ...current,
                                stats: current.stats.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, value: event.target.value } : item
                                ),
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`about-stat-label-${index}`}>Stat {index + 1} Label</Label>
                          <Input
                            id={`about-stat-label-${index}`}
                            value={stat.label}
                            onChange={(event) =>
                              setAboutForm((current) => ({
                                ...current,
                                stats: current.stats.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, label: event.target.value } : item
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saveSiteContentMutation.isPending}>{saveSiteContentMutation.isPending ? "Saving..." : "Save About"}</Button>
                    <Button type="button" variant="outline" onClick={() => setAboutForm((siteContentQuery.data || defaultSiteContent).about)}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donate">
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase">Donate Content</CardTitle>
                <CardDescription>Edit donation messaging and CTA links.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveSiteContentMutation.mutate({ key: "donate", value: donateForm });
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="donate-eyebrow">Eyebrow</Label>
                      <Input id="donate-eyebrow" value={donateForm.eyebrow} onChange={(event) => setDonateForm((current) => ({ ...current, eyebrow: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donate-prefix">Heading Prefix</Label>
                      <Input id="donate-prefix" value={donateForm.headingPrefix} onChange={(event) => setDonateForm((current) => ({ ...current, headingPrefix: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donate-emphasis">Heading Emphasis</Label>
                      <Input id="donate-emphasis" value={donateForm.headingEmphasis} onChange={(event) => setDonateForm((current) => ({ ...current, headingEmphasis: event.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donate-body">Body Copy</Label>
                    <Textarea id="donate-body" rows={5} value={donateForm.body} onChange={(event) => setDonateForm((current) => ({ ...current, body: event.target.value }))} />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="donate-primary-label">Primary CTA Label</Label>
                      <Input id="donate-primary-label" value={donateForm.primaryCtaLabel} onChange={(event) => setDonateForm((current) => ({ ...current, primaryCtaLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donate-primary-link">Primary CTA Link</Label>
                      <Input id="donate-primary-link" value={donateForm.primaryCtaHref} onChange={(event) => setDonateForm((current) => ({ ...current, primaryCtaHref: event.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="donate-secondary-label">Secondary CTA Label</Label>
                      <Input id="donate-secondary-label" value={donateForm.secondaryCtaLabel} onChange={(event) => setDonateForm((current) => ({ ...current, secondaryCtaLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donate-secondary-link">Secondary CTA Link</Label>
                      <Input id="donate-secondary-link" value={donateForm.secondaryCtaHref} onChange={(event) => setDonateForm((current) => ({ ...current, secondaryCtaHref: event.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donate-trust-copy">Trust Copy</Label>
                    <Textarea id="donate-trust-copy" rows={3} value={donateForm.trustCopy} onChange={(event) => setDonateForm((current) => ({ ...current, trustCopy: event.target.value }))} />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saveSiteContentMutation.isPending}>{saveSiteContentMutation.isPending ? "Saving..." : "Save Donate"}</Button>
                    <Button type="button" variant="outline" onClick={() => setDonateForm((siteContentQuery.data || defaultSiteContent).donate)}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">Upload Community Photo</CardTitle>
                  <CardDescription>Add a photo to the public Our Community gallery.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-5"
                    onSubmit={(event) => {
                      event.preventDefault();

                      if (!communityPhotoFile) {
                        toast({
                          title: "Photo required",
                          description: "Choose an image file before uploading.",
                          variant: "destructive",
                        });
                        return;
                      }

                      uploadCommunityPhotoMutation.mutate({
                        file: communityPhotoFile,
                        values: communityPhotoForm,
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="community-photo-file">Image File</Label>
                      <Input
                        id="community-photo-file"
                        type="file"
                        accept="image/*"
                        onChange={(event) => setCommunityPhotoFile(event.target.files?.[0] ?? null)}
                      />
                      <p className="text-xs text-muted-foreground">Uploads go to hosted storage and appear in the gallery immediately after save.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="community-photo-alt">Alt Text</Label>
                      <Input
                        id="community-photo-alt"
                        value={communityPhotoForm.alt_text}
                        onChange={(event) => setCommunityPhotoForm((current) => ({ ...current, alt_text: event.target.value }))}
                        placeholder="Describe the photo for accessibility"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="community-photo-sort">Sort Order</Label>
                      <Input
                        id="community-photo-sort"
                        type="number"
                        value={communityPhotoForm.sort_order}
                        onChange={(event) => setCommunityPhotoForm((current) => ({ ...current, sort_order: event.target.value }))}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={uploadCommunityPhotoMutation.isPending}>
                        {uploadCommunityPhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCommunityPhotoForm(emptyCommunityPhotoForm);
                          setCommunityPhotoFile(null);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">Current Gallery Photos</CardTitle>
                  <CardDescription>These images feed the public Our Community carousel in sort order.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {communityPhotosQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading photos...</p>
                  ) : communityPhotosQuery.data?.photos.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {communityPhotosQuery.data.photos.map((photo) => (
                        <div key={photo.id} className="overflow-hidden rounded-lg border border-border">
                          <img src={photo.image_url} alt={photo.alt_text || "Community photo"} className="h-48 w-full object-cover" />
                          <div className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">Sort order: {photo.sort_order}</p>
                                <p className="mt-1 text-sm text-muted-foreground break-words">
                                  {photo.alt_text || "No alt text provided."}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteCommunityPhotoMutation.mutate(photo.id)}
                                disabled={deleteCommunityPhotoMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No uploaded photos yet. The public page is still using bundled fallback images.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Community Videos */}
            <div className="grid gap-6 lg:grid-cols-[420px,1fr] mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">Upload Community Video</CardTitle>
                  <CardDescription>Add a video to the Our Community section.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-5"
                    onSubmit={(event) => {
                      event.preventDefault();

                      if (!communityVideoFile) {
                        toast({
                          title: "Video required",
                          description: "Choose a video file before uploading.",
                          variant: "destructive",
                        });
                        return;
                      }

                      uploadCommunityVideoMutation.mutate({
                        file: communityVideoFile,
                        values: communityVideoForm,
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="community-video-file">Video File</Label>
                      <Input
                        id="community-video-file"
                        type="file"
                        accept="video/*"
                        onChange={(event) => setCommunityVideoFile(event.target.files?.[0] ?? null)}
                      />
                      <p className="text-xs text-muted-foreground">Max 256 MB. Appears in the Community Videos section below the photo gallery.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="community-video-title">Title (optional)</Label>
                      <Input
                        id="community-video-title"
                        value={communityVideoForm.title}
                        onChange={(event) => setCommunityVideoForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="e.g. Bike N Thrive Recap"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="community-video-sort">Sort Order</Label>
                      <Input
                        id="community-video-sort"
                        type="number"
                        value={communityVideoForm.sort_order}
                        onChange={(event) => setCommunityVideoForm((current) => ({ ...current, sort_order: event.target.value }))}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={uploadCommunityVideoMutation.isPending}>
                        {uploadCommunityVideoMutation.isPending ? "Uploading..." : "Upload Video"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCommunityVideoForm(emptyCommunityVideoForm);
                          setCommunityVideoFile(null);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">Current Community Videos</CardTitle>
                  <CardDescription>These videos appear in the Community Videos section on the Our Community page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {communityVideosQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading videos...</p>
                  ) : communityVideosQuery.data?.videos.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {communityVideosQuery.data.videos.map((video) => (
                        <div key={video.id} className="overflow-hidden rounded-lg border border-border">
                          <video
                            src={video.video_url}
                            controls
                            preload="metadata"
                            className="w-full aspect-video object-contain bg-muted"
                          />
                          <div className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {video.title || "Untitled"}
                                </p>
                                <p className="text-xs text-muted-foreground">Sort order: {video.sort_order}</p>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteCommunityVideoMutation.mutate(video.id)}
                                disabled={deleteCommunityVideoMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display uppercase">Resources</CardTitle>
                    <CardDescription>Select a resource or create a new one.</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => { setSelectedResourceId(null); setResourceForm(emptyResourceForm); }}>
                    New
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resourcesQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : resourcesQuery.data?.resources.length ? (
                    resourcesQuery.data.resources.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { setSelectedResourceId(r.id); setResourceForm({ ...r, sort_order: String(r.sort_order) }); }}
                        className={`w-full rounded-sm border p-4 text-left transition-colors ${
                          r.id === selectedResourceId ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-display text-sm uppercase text-foreground truncate">{r.title}</p>
                          {r.urgent && <span className="shrink-0 rounded-sm bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">Urgent</span>}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No resources yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">{selectedResource ? "Edit Resource" : "Create Resource"}</CardTitle>
                  <CardDescription>Changes update the Mental Health Resources page immediately.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (selectedResource) {
                        updateResourceMutation.mutate({ id: selectedResource.id, values: resourceForm });
                      } else {
                        createResourceMutation.mutate(resourceForm);
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="res-title">Title</Label>
                      <Input required id="res-title" value={resourceForm.title} onChange={(e) => setResourceForm((c) => ({ ...c, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="res-desc">Description</Label>
                      <Textarea required id="res-desc" rows={3} value={resourceForm.description} onChange={(e) => setResourceForm((c) => ({ ...c, description: e.target.value }))} />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="res-link">Link (URL)</Label>
                        <Input required id="res-link" type="url" value={resourceForm.link} onChange={(e) => setResourceForm((c) => ({ ...c, link: e.target.value }))} placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="res-sort">Sort Order</Label>
                        <Input id="res-sort" type="number" value={resourceForm.sort_order} onChange={(e) => setResourceForm((c) => ({ ...c, sort_order: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-sm border border-border px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">Mark as urgent</p>
                        <p className="text-sm text-muted-foreground">Highlights the card with a primary color — use for crisis lines.</p>
                      </div>
                      <Switch checked={resourceForm.urgent} onCheckedChange={(checked) => setResourceForm((c) => ({ ...c, urgent: checked }))} />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <div className="flex gap-3">
                        <Button type="submit" disabled={createResourceMutation.isPending || updateResourceMutation.isPending}>
                          {createResourceMutation.isPending || updateResourceMutation.isPending ? "Saving..." : selectedResource ? "Update" : "Create"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setResourceForm(selectedResource ? { ...selectedResource, sort_order: String(selectedResource.sort_order) } : emptyResourceForm)}>
                          Reset
                        </Button>
                      </div>
                      {selectedResource && (
                        <Button type="button" variant="destructive" onClick={() => deleteResourceMutation.mutate(selectedResource.id)} disabled={deleteResourceMutation.isPending}>
                          {deleteResourceMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase">Contact and Footer</CardTitle>
                <CardDescription>Edit the stay connected text, footer links, and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveSiteContentMutation.mutate({ key: "contact", value: contactForm });
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-title">Stay Connected Title</Label>
                      <Input id="contact-title" value={contactForm.stayConnectedTitle} onChange={(event) => setContactForm((current) => ({ ...current, stayConnectedTitle: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-button">Newsletter Button Label</Label>
                      <Input id="contact-button" value={contactForm.stayConnectedButtonLabel} onChange={(event) => setContactForm((current) => ({ ...current, stayConnectedButtonLabel: event.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-success">Success Message</Label>
                    <Input id="contact-success" value={contactForm.stayConnectedSuccessMessage} onChange={(event) => setContactForm((current) => ({ ...current, stayConnectedSuccessMessage: event.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-tagline">Footer Tagline</Label>
                    <Input id="contact-tagline" value={contactForm.brandTagline} onChange={(event) => setContactForm((current) => ({ ...current, brandTagline: event.target.value }))} />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="contact-instagram">Instagram URL</Label>
                      <Input id="contact-instagram" value={contactForm.instagramUrl} onChange={(event) => setContactForm((current) => ({ ...current, instagramUrl: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-facebook">Facebook URL</Label>
                      <Input id="contact-facebook" value={contactForm.facebookUrl} onChange={(event) => setContactForm((current) => ({ ...current, facebookUrl: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-tiktok">TikTok URL</Label>
                      <Input id="contact-tiktok" value={contactForm.tiktokUrl} onChange={(event) => setContactForm((current) => ({ ...current, tiktokUrl: event.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" value={contactForm.email} onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-location">Location Label</Label>
                      <Input id="contact-location" value={contactForm.locationLabel} onChange={(event) => setContactForm((current) => ({ ...current, locationLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-org">Organization Label</Label>
                      <Input id="contact-org" value={contactForm.footerOrganizationLabel} onChange={(event) => setContactForm((current) => ({ ...current, footerOrganizationLabel: event.target.value }))} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saveSiteContentMutation.isPending}>{saveSiteContentMutation.isPending ? "Saving..." : "Save Contact"}</Button>
                    <Button type="button" variant="outline" onClick={() => setContactForm((siteContentQuery.data || defaultSiteContent).contact)}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={resetContentForms}>Reset All Content Forms</Button>
        </div>
      </div>
    </div>
  );
}
