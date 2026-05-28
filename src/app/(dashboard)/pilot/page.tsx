"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Flag, Plus, RefreshCw, AlertOctagon, X, Loader2 } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { useAuth } from "@/hooks/use-auth";
import { PilotCard } from "@/components/pilot/PilotCard";
import { CampaignList } from "@/components/pilot/CampaignList";
import type { PilotOrganization, FieldCampaign, PilotStatus } from "@/types";

const INDIAN_STATES = [
  "Andhra Pradesh","Bihar","Chhattisgarh","Gujarat","Haryana",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha",
  "Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal",
];

interface NewPilotForm {
  name: string; district: string; state: string; region: string;
  contactName: string; contactEmail: string; startDate: string;
}

const EMPTY_FORM: NewPilotForm = {
  name: "", district: "", state: "Maharashtra", region: "",
  contactName: "", contactEmail: "", startDate: new Date().toISOString().slice(0, 10),
};

export default function PilotPage() {
  const { role, loading: roleLoading } = useRole();
  const { user } = useAuth();
  const [pilots, setPilots] = useState<PilotOrganization[]>([]);
  const [campaigns, setCampaigns] = useState<FieldCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewPilotForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot");
      const data = await res.json();
      if (data.pilots) setPilots(data.pilots);
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreatePilot() {
    if (!form.name || !form.district || !form.contactEmail) return;
    setSaving(true);
    try {
      await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pilot", ...form, createdBy: user?.uid ?? "admin" }),
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchData();
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: PilotStatus) {
    await fetch("/api/pilot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, collection: "pilot", status }),
    });
    setPilots((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  }

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin" />
      </div>
    );
  }

  if (role !== "admin" && role !== "org_manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <AlertOctagon className="w-7 h-7 text-orange-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Access Restricted</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Pilot management is available to Org Managers and Admins.
          </p>
        </div>
      </div>
    );
  }

  const activePilots = pilots.filter((p) => p.status === "active").length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Pilot Management</h1>
            <p className="text-xs text-muted-foreground/60">
              {activePilots} active pilots · {activeCampaigns} active campaigns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-sm hover:bg-green-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Pilot
          </button>
        </div>
      </div>

      {/* New Pilot Form */}
      {showForm && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Create Pilot Organization</h3>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
              <X className="w-4 h-4 text-muted-foreground/50 hover:text-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["name", "district", "region", "contactName", "contactEmail"] as const).map((field) => (
              <div key={field}>
                <label className="text-[11px] text-muted-foreground/60 capitalize mb-1 block">
                  {field === "contactName" ? "Contact Name" : field === "contactEmail" ? "Contact Email" : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "contactEmail" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-green-500/40"
                  placeholder={field}
                />
              </div>
            ))}
            <div>
              <label className="text-[11px] text-muted-foreground/60 mb-1 block">State</label>
              <select
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-green-500/40"
              >
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/60 mb-1 block">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-green-500/40"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreatePilot}
              disabled={saving || !form.name || !form.district}
              className="flex items-center gap-2 h-9 px-6 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-500/30 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pilot Grid */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Pilot Organizations ({pilots.length})
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2].map((i) => (
              <div key={i} className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : pilots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl border border-dashed border-border">
            <Building2 className="w-8 h-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">No pilot organizations yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs text-green-400/70 hover:text-green-400 transition-colors"
            >
              Create your first pilot →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pilots.map((pilot) => (
              <PilotCard key={pilot.id} pilot={pilot} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </section>

      {/* Field Campaigns */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Flag className="w-3.5 h-3.5 text-orange-400" />
          <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Field Campaigns ({campaigns.length})
          </h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <CampaignList campaigns={campaigns} loading={loading} />
        </div>
      </section>
    </div>
  );
}
