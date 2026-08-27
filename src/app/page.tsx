"use client";

import React, { useState } from "react";
import { Shield, Eye, Flame, MapPin, Search, Lock, User, Radio, RefreshCw, Settings, Users, Ban, CheckCircle, CreditCard, DollarSign, Activity, AlertTriangle } from "lucide-react";
import { MOCK_VENUES, MOCK_RESERVATIONS } from "@/lib/data";
import { BoothReservation, PreferenceType, VisibilityStatus, UserProfile } from "@/types";

const INITIAL_USERS: UserProfile[] = [
  { id: "user-101", handle: "NeonKnight99", email: "neon99@proton.me", subscriptionActive: true, role: "PREMIUM" },
  { id: "user-102", handle: "MidnightRider", email: "rider@anonmail.com", subscriptionActive: true, role: "PREMIUM" },
  { id: "user-103", handle: "ShadowWalker", email: "shadow@tempmail.io", subscriptionActive: true, role: "MEMBER" },
  { id: "user-104", handle: "CrimsonViper", email: "viper@secure.net", subscriptionActive: false, role: "MEMBER" },
  { id: "user-admin", handle: "CaptainChuck", email: "admin@rlgl.app", subscriptionActive: true, role: "ADMIN" },
];

export default function Dashboard() {
  const [selectedVenueId, setSelectedVenueId] = useState<string>("venue-lawrenceville");
  const [activeTab, setActiveTab] = useState<"map" | "booths" | "new_reservation" | "admin">("booths");
  const [searchQuery, setSearchQuery] = useState("");
  const [panicMode, setPanicMode] = useState(false);

  // New Reservation Form State
  const [newBooth, setNewBooth] = useState<number>(4);
  const [newStatus, setNewStatus] = useState<VisibilityStatus>("GREEN_LIGHT");
  const [newPref, setNewPreference] = useState<PreferenceType>("HANGOUT");
  const [newNote, setNewNote] = useState("");
  const [reservations, setReservations] = useState<BoothReservation[]>(MOCK_RESERVATIONS);

  // Admin User Management State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [adminSearch, setAdminSearch] = useState("");

  if (panicMode) {
    return (
      <div className="min-h-screen bg-white p-8 font-sans text-gray-800">
        <h1 className="text-3xl font-bold mb-4">National Weather Service — Tioga County Regional Radar</h1>
        <p className="mb-4">Current Conditions: 68°F — Mostly Sunny, Winds WSW at 6 mph.</p>
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-xl">
          <h2 className="font-semibold text-lg text-blue-900 mb-2">Extended 5-Day Forecast</h2>
          <p className="text-sm text-blue-800">High pressure system moving across northern Pennsylvania. Dry conditions expected through Saturday evening.</p>
        </div>
        <button 
          onClick={() => setPanicMode(false)}
          className="mt-8 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs text-gray-600"
        >
          Restore View
        </button>
      </div>
    );
  }

  const selectedVenue = MOCK_VENUES.find((v) => v.id === selectedVenueId) || MOCK_VENUES[0];
  const filteredReservations = reservations.filter(
    (r) => r.venueId === selectedVenueId && (searchQuery === "" || r.userHandle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u) => adminSearch === "" || u.handle.toLowerCase().includes(adminSearch.toLowerCase()) || u.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const toggleUserSubscription = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, subscriptionActive: !u.subscriptionActive } : u)));
  };

  const toggleUserRole = (userId: string) => {
    setUsers(users.map((u) => {
      if (u.id === userId) {
        const nextRole = u.role === "MEMBER" ? "PREMIUM" : u.role === "PREMIUM" ? "ADMIN" : "MEMBER";
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const created: BoothReservation = {
      id: `res-${Date.now()}`,
      userId: "user-admin",
      userHandle: "CaptainChuck (You)",
      venueId: selectedVenueId,
      venueName: selectedVenue.name,
      boothNumber: newBooth,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60000).toISOString(),
      status: newStatus,
      preference: newPref,
      note: newNote || "Present at booth, open to meet.",
    };

    setReservations([created, ...reservations]);
    setActiveTab("booths");
    setNewNote("");
  };

  // FinOps Stats Calculation
  const activeSubs = users.filter((u) => u.subscriptionActive).length;
  const mrr = activeSubs * 5.0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-rose-500 to-amber-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              RED LIGHT, GREEN LIGHT
            </h1>
            <p className="text-xs text-slate-400">Discrete Real-Time Booth Matchmaker</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Panic Hide Button */}
          <button
            onClick={() => setPanicMode(true)}
            className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Instant Hide Screen"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Panic Hide</span>
          </button>

          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-full text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">CaptainChuck</span>
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">
              SYSTEM ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Venue Selector & Quick Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Select Venue</span>
              <MapPin className="w-4 h-4 text-emerald-400" />
            </h2>

            <div className="space-y-2">
              {MOCK_VENUES.map((venue) => {
                const isSelected = venue.id === selectedVenueId;
                return (
                  <button
                    key={venue.id}
                    onClick={() => setSelectedVenueId(venue.id)}
                    className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-800/90 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/20"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{venue.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[220px]">{venue.address}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                        {venue.activeReservationsCount} Active
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin FinOps Stats Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <DollarSign className="w-24 h-24 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-emerald-300 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>SaaS Revenue & MRR Stats</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Subscriptions</span>
                <span className="text-lg font-extrabold text-emerald-400">{activeSubs} Members</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Monthly Recurring (MRR)</span>
                <span className="text-lg font-extrabold text-amber-400">${mrr.toFixed(2)}/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Booths, Timeslot Form & Admin Portal */}
        <div className="lg:col-span-8 space-y-4">
          {/* Action Navigation Tabs */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("booths")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === "booths" ? "bg-slate-800 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Active Booths ({filteredReservations.length})
              </button>
              <button
                onClick={() => setActiveTab("new_reservation")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === "new_reservation" ? "bg-slate-800 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                + Post Timeslot
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === "admin" ? "bg-slate-800 text-amber-400 border border-amber-500/30" : "text-amber-400/70 hover:text-amber-300"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 px-2">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
              <span className="text-[11px] text-slate-500 font-mono">Live Sync</span>
            </div>
          </div>

          {/* Active Booth Presence Feed */}
          {activeTab === "booths" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-300">
                  Showing active members at <span className="font-bold text-emerald-400">{selectedVenue.name}</span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search handle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {filteredReservations.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                  No active presence posted at this venue right now. Be the first to post a timeslot!
                </div>
              ) : (
                filteredReservations.map((res) => {
                  let statusColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                  let statusText = "Green Light — Available Now";
                  if (res.status === "YELLOW_LIGHT") {
                    statusColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
                    statusText = "Yellow Light — Arriving Soon";
                  } else if (res.status === "RED_LIGHT") {
                    statusColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
                    statusText = "Red Light — Occupied / Busy";
                  }

                  let prefLabel = "Hangout / Watch Videos";
                  if (res.preference === "GIVE") prefLabel = "Give";
                  if (res.preference === "RECEIVE") prefLabel = "Receive";
                  if (res.preference === "GIVE_OR_RECEIVE") prefLabel = "Give or Receive";

                  return (
                    <div
                      key={res.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-100 text-sm">{res.userHandle}</span>
                          {res.boothNumber && (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded">
                              Booth #{res.boothNumber}
                            </span>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Preference</span>
                          <span className="text-amber-400 font-semibold">{prefLabel}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Timeslot</span>
                          <span className="text-slate-300 font-mono">
                            {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {res.note && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/50 italic">
                          "{res.note}"
                        </p>
                      )}

                      <div className="flex justify-end pt-1">
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Send Discrete Message</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* New Reservation Form */}
          {activeTab === "new_reservation" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Post Presence / Reserve Booth Timeslot</span>
              </h3>
              <p className="text-xs text-slate-400">
                Post your availability at <strong className="text-emerald-400">{selectedVenue.name}</strong> so other members know when you will be there.
              </p>

              <form onSubmit={handleCreateReservation} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Booth Number (Optional)</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedVenue.boothCount}
                      value={newBooth}
                      onChange={(e) => setNewBooth(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Light Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as VisibilityStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="GREEN_LIGHT">Green Light — Available Now</option>
                      <option value="YELLOW_LIGHT">Yellow Light — Arriving Soon</option>
                      <option value="RED_LIGHT">Red Light — Occupied / Busy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Preference Protocol</label>
                  <select
                    value={newPref}
                    onChange={(e) => setNewPreference(e.target.value as PreferenceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HANGOUT">Hangout / Watch Videos Together</option>
                    <option value="GIVE">Give</option>
                    <option value="RECEIVE">Receive</option>
                    <option value="GIVE_OR_RECEIVE">Give or Receive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Discrete Note (Max 140 chars)</label>
                  <input
                    type="text"
                    maxLength={140}
                    placeholder="e.g. In Booth #4 for the next hour, watching videos."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-lg shadow-emerald-950/40"
                  >
                    Post Timeslot Now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admin Account Management Portal */}
          {activeTab === "admin" && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold text-slate-100">RLGL Admin User & Membership Console</h3>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter user or email..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Manage user accounts, Stripe subscription statuses ($5/mo), and assign administrative privileges.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase bg-slate-950/60">
                      <th className="p-3">Handle</th>
                      <th className="p-3">Discrete Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-200">{user.handle}</td>
                        <td className="p-3 font-mono text-slate-400">{user.email}</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleUserRole(user.id)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded border bg-slate-800 text-amber-300 border-amber-500/30 hover:border-amber-400 transition"
                          >
                            {user.role}
                          </button>
                        </td>
                        <td className="p-3">
                          {user.subscriptionActive ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Active ($5/mo)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-rose-400 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Inactive / Canceled</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleUserSubscription(user.id)}
                            className={`px-3 py-1 rounded text-xs font-bold transition border ${
                              user.subscriptionActive
                                ? "bg-rose-950/60 text-rose-300 border-rose-800/50 hover:bg-rose-900"
                                : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900"
                            }`}
                          >
                            {user.subscriptionActive ? "Cancel Sub" : "Activate $5/mo"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
