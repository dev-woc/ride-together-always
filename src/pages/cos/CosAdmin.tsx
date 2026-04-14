import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LogOut, ChevronDown } from 'lucide-react';

const STATUSES = ['all', 'pending', 'reviewing', 'approved', 'rejected'] as const;
type Status = typeof STATUSES[number];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  reviewing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function CosAdmin() {
  const { token, logout } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<Status>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const loadApps = async (status: Status) => {
    setLoading(true);
    const url = `/api/admin/applications${status !== 'all' ? `?status=${status}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setApplications(data.applications ?? []);
    setLoading(false);
  };

  useEffect(() => { loadApps(filter); }, [filter]);

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
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="font-display text-sm uppercase tracking-[0.3em] text-primary block mb-1">Admin Portal</span>
              <h1 className="font-display text-4xl font-black uppercase text-foreground">APPLICATIONS</h1>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <LogOut size={16} /> Sign out
            </button>
          </div>

          {/* Filter Tabs */}
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
            {/* Applications List */}
            <div className="flex-1 space-y-3 min-w-0">
              {loading ? (
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

            {/* Detail Panel */}
            {selected && (
              <div className="w-96 shrink-0 bg-card border border-border rounded-sm p-6 space-y-5 self-start sticky top-6">
                <div className="flex items-start justify-between">
                  <h2 className="font-display text-lg font-bold uppercase text-foreground leading-tight">{selected.full_name}</h2>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                </div>

                <div className="space-y-2 text-sm">
                  <DetailRow label="Email" value={selected.email} />
                  <DetailRow label="Phone" value={selected.phone} />
                  <DetailRow label="DOB" value={selected.date_of_birth} />
                  <DetailRow label="Location" value={selected.city_state} />
                  <DetailRow label="Prior Therapy" value={selected.prior_therapy ? 'Yes' : 'No'} />
                  <DetailRow label="Insurance" value={selected.has_insurance ? 'Yes' : 'No'} />
                  <DetailRow label="Challenges" value={selected.current_challenges?.join(', ')} />
                  <DetailRow label="Weekly commit" value={selected.weekly_commitment ? 'Yes' : 'No'} />
                  <DetailRow label="Has device" value={selected.has_device ? 'Yes' : 'No'} />
                  <DetailRow label="Testimonial" value={selected.testimonial_willing ? 'Yes' : 'No'} />
                  <DetailRow label="Therapist pref" value={selected.therapist_preference === 'foundation' ? 'KPF matched' : 'Own'} />
                  {selected.preferred_therapist_name && <DetailRow label="Preferred therapist" value={selected.preferred_therapist_name} />}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Mental Health</div>
                  <p className="text-xs text-foreground leading-relaxed">{selected.mental_health_description}</p>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Motivation</div>
                  <p className="text-xs text-foreground leading-relaxed">{selected.therapy_motivation}</p>
                </div>

                {selected.intro_video_url && (
                  <div className="border-t border-border pt-4">
                    <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">Intro Video</div>
                    <video
                      src={selected.intro_video_url}
                      controls
                      className="w-full rounded-sm border border-border"
                    />
                  </div>
                )}

                {/* Status Update */}
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
