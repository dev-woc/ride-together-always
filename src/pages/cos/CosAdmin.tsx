import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LogOut, ChevronDown } from 'lucide-react';

const STATUSES = ['all', 'pending', 'reviewing', 'approved', 'rejected'] as const;
type Status = typeof STATUSES[number];
type Tab = 'applications' | 'ride-signups';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  reviewing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function CosAdmin() {
  const { token, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('applications');

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<Status>('all');
  const [appsLoading, setAppsLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  // Ride signups state
  const [signups, setSignups] = useState<any[]>([]);
  const [signupsGrouped, setSignupsGrouped] = useState<Record<string, any[]>>({});
  const [signupsLoading, setSignupsLoading] = useState(false);
  const [selectedSignup, setSelectedSignup] = useState<any>(null);

  const loadApps = async (status: Status) => {
    setAppsLoading(true);
    const url = `/api/admin/applications${status !== 'all' ? `?status=${status}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setApplications(data.applications ?? []);
    setAppsLoading(false);
  };

  const loadSignups = async () => {
    setSignupsLoading(true);
    const res = await fetch('/api/admin/ride-signups', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSignups(data.signups ?? []);
    setSignupsGrouped(data.grouped ?? {});
    setSignupsLoading(false);
  };

  useEffect(() => { loadApps(filter); }, [filter]);

  useEffect(() => {
    if (tab === 'ride-signups') loadSignups();
  }, [tab]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    await fetch(`/api/admin/applications?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    await loadApps(filter);
    setSelected((prev: any) => prev?.id === id ? { ...prev, status } : prev);
    setUpdating(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-display text-sm uppercase tracking-[0.3em] text-primary block mb-1">Admin Portal</span>
              <h1 className="font-display text-4xl font-black uppercase text-foreground">KPF Admin</h1>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <LogOut size={16} /> Sign out
            </button>
          </div>

          {/* Top-level tabs */}
          <div className="flex gap-1 mb-8 border-b border-border">
            {([
              { key: 'applications', label: 'COS Applications' },
              { key: 'ride-signups', label: 'Ride Sign-Ups' },
            ] as { key: Tab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelected(null); setSelectedSignup(null); }}
                className={`font-display text-xs uppercase tracking-wider px-5 py-2.5 border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Applications Tab ── */}
          {tab === 'applications' && (
            <>
              {/* Status filters */}
              <div className="flex gap-2 mb-8 flex-wrap">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`font-display text-xs uppercase tracking-wider px-4 py-2 border transition-colors ${
                      filter === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-6">
                <div className="flex-1 space-y-3 min-w-0">
                  {appsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="bg-card border border-border rounded-sm p-12 text-center">
                      <p className="text-muted-foreground">No applications found</p>
                    </div>
                  ) : (
                    applications.map(app => (
                      <button
                        key={app.id}
                        onClick={() => setSelected(app)}
                        className={`w-full text-left bg-card border rounded-sm p-4 hover:border-primary transition-colors ${selected?.id === app.id ? 'border-primary' : 'border-border'}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-display text-sm font-bold uppercase text-foreground truncate">{app.full_name}</div>
                            <div className="text-xs text-muted-foreground">{app.email}</div>
                            <div className="text-xs text-muted-foreground">{app.city_state}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`inline-flex text-xs font-display uppercase tracking-wider px-2 py-1 border rounded-sm ${STATUS_COLORS[app.status] ?? ''}`}>
                              {app.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(app.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Application detail panel */}
                {selected && (
                  <div className="w-96 shrink-0 bg-card border border-border rounded-sm p-6 space-y-5 self-start sticky top-6">
                    <div className="flex items-start justify-between">
                      <h2 className="font-display text-lg font-bold uppercase text-foreground leading-tight">{selected.full_name}</h2>
                      <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <DetailRow label="Email" value={selected.email} />
                      <DetailRow label="Phone" value={selected.phone} />
                      <DetailRow label="Gender" value={selected.gender} />
                      <DetailRow label="DOB" value={selected.date_of_birth} />
                      <DetailRow label="Location" value={selected.city_state} />
                      <DetailRow label="Prior Therapy" value={selected.prior_therapy ? 'Yes' : 'No'} />
                      <DetailRow label="Insurance" value={selected.has_insurance ? 'Yes' : 'No'} />
                      <DetailRow label="Challenges" value={selected.current_challenges?.join(', ')} />
                      <DetailRow label="Video documentation" value={selected.video_documentation ? 'Yes' : 'No'} />
                      <DetailRow label="Weekly commit" value={selected.weekly_commitment ? 'Yes' : 'No'} />
                      <DetailRow label="Has device" value={selected.has_device ? 'Yes' : 'No'} />
                    </div>

                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Mental Health</div>
                      <p className="text-xs text-foreground leading-relaxed">{selected.mental_health_description}</p>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Motivation</div>
                      <p className="text-xs text-foreground leading-relaxed">{selected.therapy_motivation}</p>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Goals</div>
                      <p className="text-xs text-foreground leading-relaxed">{selected.therapy_goals}</p>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Barriers</div>
                      <p className="text-xs text-foreground leading-relaxed">{selected.therapy_barriers}</p>
                    </div>

                    {selected.intro_video_url && (
                      <div className="border-t border-border pt-4">
                        <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">Intro Video</div>
                        <video src={selected.intro_video_url} controls className="w-full rounded-sm border border-border" />
                      </div>
                    )}

                    <div className="border-t border-border pt-4">
                      <label className="block font-display text-xs uppercase tracking-wider text-foreground mb-2">Update Status</label>
                      <div className="relative">
                        <select
                          value={selected.status}
                          disabled={updating}
                          onChange={e => updateStatus(selected.id, e.target.value)}
                          className="w-full appearance-none bg-background border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary rounded-sm pr-8 disabled:opacity-60"
                        >
                          {['pending', 'reviewing', 'approved', 'rejected'].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Ride Sign-Ups Tab ── */}
          {tab === 'ride-signups' && (
            <div className="flex gap-6">
              <div className="flex-1 space-y-6 min-w-0">
                {signupsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : signups.length === 0 ? (
                  <div className="bg-card border border-border rounded-sm p-12 text-center">
                    <p className="text-muted-foreground">No ride sign-ups yet</p>
                  </div>
                ) : (
                  Object.entries(signupsGrouped).map(([eventName, eventSignups]) => (
                    <div key={eventName}>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">{eventName}</h2>
                        <span className="text-xs text-muted-foreground border border-border rounded-sm px-2 py-0.5">{eventSignups.length} sign-up{eventSignups.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-2">
                        {eventSignups.map(signup => (
                          <button
                            key={signup.id}
                            onClick={() => setSelectedSignup(signup)}
                            className={`w-full text-left bg-card border rounded-sm p-4 hover:border-primary transition-colors ${selectedSignup?.id === signup.id ? 'border-primary' : 'border-border'}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="font-display text-sm font-bold uppercase text-foreground truncate">{signup.full_name}</div>
                                <div className="text-xs text-muted-foreground">{signup.email}</div>
                                <div className="text-xs text-muted-foreground capitalize">{signup.ride_group} group</div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                                {signup.yoga_signup && <span className="text-primary">Yoga</span>}
                                {signup.lime_bike && <span className="text-primary">Bike Rental</span>}
                                <span>{new Date(signup.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Ride signup detail panel */}
              {selectedSignup && (
                <div className="w-96 shrink-0 bg-card border border-border rounded-sm p-6 space-y-5 self-start sticky top-6">
                  <div className="flex items-start justify-between">
                    <h2 className="font-display text-lg font-bold uppercase text-foreground leading-tight">{selectedSignup.full_name}</h2>
                    <button onClick={() => setSelectedSignup(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <DetailRow label="Email" value={selectedSignup.email} />
                    <DetailRow label="Phone" value={selectedSignup.phone_number} />
                    <DetailRow label="Instagram" value={selectedSignup.instagram_handle || '—'} />
                    <DetailRow label="Ride Group" value={selectedSignup.ride_group} />
                    <DetailRow label="Yoga Sign-Up" value={selectedSignup.yoga_signup ? 'Yes' : 'No'} />
                    <DetailRow label="Bike Rental" value={selectedSignup.lime_bike ? 'Yes' : 'No'} />
                    <DetailRow label="Bike Waiver" value={selectedSignup.bike_rental_waiver_agreed ? 'Agreed' : 'N/A'} />
                    <DetailRow label="Signed Up" value={new Date(selectedSignup.created_at).toLocaleString()} />
                  </div>

                  {selectedSignup.driver_license_data && (
                    <div className="border-t border-border pt-4">
                      <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">Driver's License</div>
                      <img
                        src={selectedSignup.driver_license_data}
                        alt="Driver's license"
                        className="w-full rounded-sm border border-border object-contain max-h-48"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="font-display text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-xs text-foreground text-right">{value || '—'}</span>
    </div>
  );
}
