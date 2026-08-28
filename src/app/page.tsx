"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Shield, Eye, Flame, MapPin, Search, Lock, User, Radio, RefreshCw, Settings, Users,
  Ban, CheckCircle, CreditCard, DollarSign, Activity, AlertTriangle, Plus, Trash2, Edit, LogOut, MessageSquare, Map as MapIcon, Key, Clock, Inbox, Send, Server, CheckCircle2, XCircle, Calendar
} from "lucide-react";
import { MOCK_VENUES, MOCK_RESERVATIONS } from "@/lib/data";
import { BoothReservation, PreferenceType, VisibilityStatus, UserProfile, Venue } from "@/types";

// Dynamic import of Leaflet Map component (client-side only rendering)
const VenueMap = dynamic(() => import("@/components/VenueMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs">
      <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
      Loading Geofenced Map Layer...
    </div>
  ),
});

const INITIAL_USERS: UserProfile[] = [
  { id: "user-admin-chuck", handle: "chuck", email: "chuck.forsyth@gmail.com", subscriptionActive: true, role: "ADMIN" },
  { id: "user-101", handle: "NeonKnight99", email: "neon99@proton.me", subscriptionActive: true, role: "PREMIUM" },
  { id: "user-102", handle: "MidnightRider", email: "rider@anonmail.com", subscriptionActive: true, role: "PREMIUM" },
  { id: "user-103", handle: "ShadowWalker", email: "shadow@tempmail.io", subscriptionActive: true, role: "MEMBER" },
  { id: "user-104", handle: "CrimsonViper", email: "viper@secure.net", subscriptionActive: false, role: "MEMBER" },
];

export default function Application() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [loginHandle, setLoginHandle] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);

  // App Core State
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("venue-lawrenceville");
  const [activeTab, setActiveTab] = useState<"booths" | "map" | "new_reservation" | "inbox" | "profile" | "admin">("booths");
  const [searchQuery, setSearchQuery] = useState("");
  const [panicMode, setPanicMode] = useState(false);

  // Global Reservations State (Across ALL Venues)
  const [reservations, setReservations] = useState<BoothReservation[]>(MOCK_RESERVATIONS);
  const [newBooth, setNewBooth] = useState<number>(4);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newStartTime, setNewStartTime] = useState("11:00");
  const [newEndTime, setNewEndTime] = useState("12:30");
  const [newPref, setNewPreference] = useState<PreferenceType>("HANGOUT");
  const [newNote, setNewNote] = useState("");

  // Admin User & Venue CRUD State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminView, setAdminView] = useState<"users" | "venues">("users");

  // Admin Modal Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newAdminHandle, setNewAdminHandle] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"MEMBER" | "PREMIUM" | "ADMIN">("MEMBER");

  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueBooths, setNewVenueBooths] = useState(12);

  // Direct Messaging State
  const [messagingTarget, setMessagingTarget] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);

  // Self-Service Profile State
  const [editHandle, setEditHandle] = useState("");

  // FETCH ALL RESERVATIONS ACROSS ALL VENUES FOR ACCURATE GLOBAL COUNTS
  useEffect(() => {
    fetchLiveReservations();
    fetchLiveUsers();

    const interval = setInterval(() => {
      fetchLiveReservations();
      if (currentUser) {
        fetchUserMessages();
      }
    }, 5000); // 5s Global Sync

    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchLiveReservations = async () => {
    try {
      // Query without venueId parameter to fetch ALL active reservations globally!
      const res = await fetch(`/api/reservations`);
      const data = await res.json();
      if (data.success) {
        setReservations(data.reservations);
      }
    } catch (e) {}
  };

  const fetchLiveUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users.length > 0) {
        setUsers(data.users);
      }
    } catch (e) {}
  };

  const fetchUserMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages?userHandle=${currentUser.handle}`);
      const data = await res.json();
      if (data.success) {
        setAllMessages(data.messages);
      }
    } catch (e) {}
  };

  // PANIC HIDE SCREEN
  if (panicMode) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 font-sans text-slate-100">
        <h1 className="text-3xl font-bold mb-4 text-sky-400">National Weather Service — Tioga County Regional Radar</h1>
        <p className="mb-4 text-slate-300">Current Conditions: 68°F — Mostly Sunny, Winds WSW at 6 mph.</p>
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg max-w-xl shadow-lg">
          <h2 className="font-semibold text-lg text-sky-300 mb-2">Extended 5-Day Regional Forecast</h2>
          <p className="text-sm text-slate-300">High pressure system moving across northern Pennsylvania and New York Southern Tier. Dry conditions expected through Saturday evening.</p>
        </div>
        <button
          onClick={() => setPanicMode(false)}
          className="mt-8 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded text-xs transition"
        >
          Restore View
        </button>
      </div>
    );
  }

  // --- INSTANT ON-SITE CHECK IN & CHECK OUT HANDLERS ---
  const handleInstantCheckIn = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin",
          userId: currentUser.id,
          venueId: selectedVenueId,
          boothNumber: newBooth,
          preference: newPref,
          note: "Checked in on-site right now (1-hr window).",
        }),
      });
      const data = await res.json();
      if (data.success && data.reservation) {
        fetchLiveReservations(); // Refresh global list immediately
        setActiveTab("booths");
        return;
      }
    } catch (e) {
      console.error("Instant check-in fallback");
    }
  };

  const handleInstantCheckOut = async () => {
    if (!currentUser) return;
    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          userId: currentUser.id,
        }),
      });
      fetchLiveReservations(); // Refresh global list immediately
    } catch (e) {
      console.error("Instant check-out fallback");
    }
  };

  // --- STRICT AUTHENTICATION API HANDLERS ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signin",
          handle: loginHandle,
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid credentials. Please check your username/password.");
        return;
      }

      setCurrentUser(data.user);
      setEditHandle(data.user.handle);
      fetchLiveReservations();
    } catch (e: any) {
      setAuthError("Server connection error. Please try again.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!ageVerified) {
      setAuthError("You must confirm you are 18 years of age or older to register.");
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          handle: loginHandle,
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Failed to create account.");
        return;
      }

      setCurrentUser(data.user);
      setEditHandle(data.user.handle);
      fetchLiveReservations();
    } catch (e) {
      setAuthError("Server connection error. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signout" }),
      });
    } catch (e) {}

    setCurrentUser(null);
    setLoginHandle("");
    setLoginEmail("");
    setLoginPassword("");
    setAuthError("");
  };

  const handleSelfDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account and all associated booth presence logs?")) {
      if (currentUser) {
        try {
          await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", userId: currentUser.id }),
          });
        } catch (e) {}

        setUsers(users.filter((u) => u.id !== currentUser.id));
        setReservations(reservations.filter((r) => r.userId !== currentUser.id));
        handleSignOut();
      }
    }
  };

  const handleUpdateSelfHandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && editHandle) {
      const updated = { ...currentUser, handle: editHandle };
      setCurrentUser(updated);
      setUsers(users.map((u) => (u.id === currentUser.id ? updated : u)));
      alert("Handle updated successfully!");
    }
  };

  // --- LANDING PAGE / SIGN IN GATE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
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

          <button
            onClick={() => setPanicMode(true)}
            className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Panic Hide</span>
          </button>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict PostgreSQL & Password Verification Active</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
            Know Who's There <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Before You Arrive.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Red Light, Green Light is the private membership platform for patrons of discrete entertainment venues. Broadcast presence timeslots, check live booth availability, and coordinate 1-on-1 meetups with complete anonymity.
          </p>

          {/* Auth Modal Container */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md mx-auto shadow-2xl space-y-4 text-left">
            <div className="flex border-b border-slate-800 pb-3">
              <button
                onClick={() => { setAuthMode("signin"); setAuthError(""); }}
                className={`flex-1 text-center py-2 text-xs font-bold transition ${
                  authMode === "signin" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                className={`flex-1 text-center py-2 text-xs font-bold transition ${
                  authMode === "signup" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Create Account ($5/mo)
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Discrete Member Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NeonKnight99 or chuck"
                  value={loginHandle}
                  onChange={(e) => setLoginHandle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Discrete Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@proton.me or chuck.forsyth@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {authMode === "signup" && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="age"
                    checked={ageVerified}
                    onChange={(e) => setAgeVerified(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="age" className="text-xs text-slate-400">
                    I confirm I am 18 years of age or older.
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-lg shadow-emerald-950/40"
              >
                {authMode === "signin" ? "Sign In & Enter Dashboard" : "Start $5/mo Membership"}
              </button>
            </form>
          </div>
        </main>

        <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
          Red Light, Green Light Platform &copy; 2026 — Private Discrete Membership SaaS.
        </footer>
      </div>
    );
  }

  // --- DASHBOARD FOR AUTHENTICATED USER ---
  const selectedVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];

  // Active reservations for the currently selected venue
  const filteredReservations = reservations.filter(
    (r) => r.venueId === selectedVenueId && (searchQuery === "" || r.userHandle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u) => adminSearch === "" || u.handle.toLowerCase().includes(adminSearch.toLowerCase()) || u.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  // User Inbox Messages
  const myInboxMessages = allMessages.filter(
    (m) => m.receiverHandle.toLowerCase() === currentUser.handle.toLowerCase() || m.senderHandle.toLowerCase() === currentUser.handle.toLowerCase()
  );

  // Check if current user is checked into ANY venue
  const myActivePresenceAnywhere = reservations.find((r) => r.userId === currentUser.id);

  // Admin Actions
  const handleAdminAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminHandle || !newAdminEmail) return;
    const created: UserProfile = {
      id: `user-${Date.now()}`,
      handle: newAdminHandle,
      email: newAdminEmail,
      subscriptionActive: true,
      role: newAdminRole,
    };
    setUsers([created, ...users]);
    setShowAddUserModal(false);
    setNewAdminHandle("");
    setNewAdminEmail("");
  };

  const handleAdminDeleteUser = async (userId: string) => {
    if (confirm("Permanently delete this user and their reservations?")) {
      try {
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", userId }),
        });
      } catch (e) {}

      setUsers(users.filter((u) => u.id !== userId));
      setReservations(reservations.filter((r) => r.userId !== userId));
    }
  };

  const handleAdminAddVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName || !newVenueAddress) return;
    const created: Venue = {
      id: `venue-${Date.now()}`,
      name: newVenueName,
      address: newVenueAddress,
      latitude: 42.1000,
      longitude: -76.9000,
      boothCount: newVenueBooths,
      activeReservationsCount: 0,
    };
    setVenues([...venues, created]);
    setShowAddVenueModal(false);
    setNewVenueName("");
    setNewVenueAddress("");
  };

  const handleAdminDeleteVenue = (venueId: string) => {
    if (confirm("Permanently delete this venue listing?")) {
      setVenues(venues.filter((v) => v.id !== venueId));
    }
  };

  const toggleUserSubscription = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleSub", userId, subscriptionActive: !currentStatus }),
      });
    } catch (e) {}

    setUsers(users.map((u) => (u.id === userId ? { ...u, subscriptionActive: !u.subscriptionActive } : u)));
  };

  // Create Reservation with Custom Date & Timeslot Selection
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const startIso = new Date(`${newDate}T${newStartTime}:00`).toISOString();
    const endIso = new Date(`${newDate}T${newEndTime}:00`).toISOString();

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          venueId: selectedVenueId,
          boothNumber: newBooth,
          startTime: startIso,
          endTime: endIso,
          preference: newPref,
          note: newNote || "Scheduled booth presence.",
        }),
      });
      const data = await res.json();
      if (data.success && data.reservation) {
        fetchLiveReservations(); // Refresh global list
        setActiveTab("booths");
        setNewNote("");
        return;
      }
    } catch (e) {
      console.error("Post reservation fallback");
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingTarget || !chatMessage) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderHandle: currentUser.handle,
          receiverHandle: messagingTarget,
          content: chatMessage,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setAllMessages([...allMessages, data.message]);
        setChatMessage("");
        return;
      }
    } catch (e) {}
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
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <span>Discrete Real-Time Booth Matchmaker</span>
              <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.2 bg-emerald-950 rounded border border-emerald-800">
                Global Venue Sync Active
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Panic Hide Button */}
          <button
            onClick={() => setPanicMode(true)}
            className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Panic Hide</span>
          </button>

          {/* User Badge & Sign Out */}
          <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-full text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">{currentUser.handle}</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${
              currentUser.role === "ADMIN" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}>
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 text-xs font-bold transition flex items-center space-x-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Venue Selector & Instant On-Site Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* On-Site Instant Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 p-4 rounded-xl space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>On-Site Instant Check-In</span>
            </h3>

            {myActivePresenceAnywhere ? (
              <div className="space-y-2 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg text-xs">
                <div className="text-emerald-300 font-bold flex items-center justify-between">
                  <span>Currently Checked In</span>
                  <span className="animate-ping w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-slate-300 font-semibold">{myActivePresenceAnywhere.venueName}</div>
                <button
                  onClick={handleInstantCheckOut}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 font-extrabold rounded text-xs transition flex items-center justify-center space-x-1 mt-1 shadow"
                >
                  <XCircle className="w-4 h-4" />
                  <span>CHECK OUT NOW</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleInstantCheckIn}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>CHECK IN NOW TO {selectedVenue.name.toUpperCase()}</span>
              </button>
            )}
          </div>

          {/* Venue List with ACCURATE Real-Time Counts Across ALL Venues */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Select Venue</span>
              <MapPin className="w-4 h-4 text-emerald-400" />
            </h2>

            <div className="space-y-2">
              {venues.map((venue) => {
                const isSelected = venue.id === selectedVenueId;
                // Count active reservations for THIS specific venue from global reservations array
                const activeCount = reservations.filter((r) => r.venueId === venue.id).length;
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
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full border ${
                        activeCount > 0
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-800/80 text-slate-500 border-slate-700/50"
                      }`}>
                        {activeCount} Active
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Booths, Timeslot Form, Map, Inbox, Profile & Admin Portal */}
        <div className="lg:col-span-8 space-y-4">
          {/* Action Navigation Tabs */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex items-center justify-between overflow-x-auto">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("booths")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "booths" ? "bg-slate-800 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Active Booths ({filteredReservations.length})
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                  activeTab === "map" ? "bg-slate-800 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interactive Map</span>
              </button>
              <button
                onClick={() => setActiveTab("new_reservation")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "new_reservation" ? "bg-slate-800 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                + Post Timeslot
              </button>
              <button
                onClick={() => setActiveTab("inbox")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                  activeTab === "inbox" ? "bg-slate-800 text-teal-400 border border-teal-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Messages ({myInboxMessages.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "profile" ? "bg-slate-800 text-slate-200 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Account Settings
              </button>

              {/* Sole Admin Access Check: chuck / chuck.forsyth@gmail.com */}
              {currentUser.role === "ADMIN" && (currentUser.handle.toLowerCase() === "chuck" || currentUser.email.toLowerCase() === "chuck.forsyth@gmail.com") && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                    activeTab === "admin" ? "bg-slate-800 text-amber-400 border border-amber-500/30" : "text-amber-400/70 hover:text-amber-300"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center space-x-2 px-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-[11px] text-emerald-400 font-mono">Global Venue Sync</span>
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
                  No active presence posted at this venue right now. Be the first to tap <strong className="text-emerald-400">CHECK IN NOW</strong>!
                </div>
              ) : (
                filteredReservations.map((res) => {
                  let statusColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                  let statusText = "Green Light — Active Timeslot";
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
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Scheduled Date & Time</span>
                          <span className="text-slate-300 font-mono flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>
                              {new Date(res.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        </div>
                      </div>

                      {res.note && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/50 italic">
                          "{res.note}"
                        </p>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setMessagingTarget(res.userHandle)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Send Discrete Message</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Interactive Geofenced Map Component */}
          {activeTab === "map" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <MapIcon className="w-4 h-4 text-emerald-400" />
                  <span>Geofenced Venue Map View</span>
                </h3>
                <span className="text-xs text-slate-400">Click any marker pin to view venue details</span>
              </div>
              <VenueMap
                venues={venues}
                selectedVenueId={selectedVenueId}
                onSelectVenue={(id) => {
                  setSelectedVenueId(id);
                  setActiveTab("booths");
                }}
              />
            </div>
          )}

          {/* New Reservation Form with Explicit Date & Time Picker */}
          {activeTab === "new_reservation" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Schedule Future Timeslot & Booth Window</span>
              </h3>
              <p className="text-xs text-slate-400">
                Schedule a future presence date and time window at <strong className="text-emerald-400">{selectedVenue.name}</strong>.
              </p>

              <form onSubmit={handleCreateReservation} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Scheduled Date</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
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
                    placeholder="e.g. Visiting Booth #4 tomorrow evening."
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
                    Post Scheduled Timeslot
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User Messages Inbox Tab */}
          {activeTab === "inbox" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Inbox className="w-4 h-4 text-teal-400" />
                <span>Discrete Messages Inbox ({myInboxMessages.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                View, read, and reply to all discrete 1-on-1 messages sent to your account.
              </p>

              {myInboxMessages.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 text-center text-slate-500 text-xs">
                  Your inbox is currently empty. Direct messages sent from booth cards will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {myInboxMessages.map((msg) => (
                    <div key={msg.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">
                          From: {msg.senderHandle} ➔ To: {msg.receiverHandle}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 bg-slate-900/80 p-2 rounded border border-slate-800">
                        "{msg.content}"
                      </p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setMessagingTarget(msg.senderHandle === currentUser.handle ? msg.receiverHandle : msg.senderHandle)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-bold transition flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Self-Service Profile Settings Tab */}
          {activeTab === "profile" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Self-Service Account & Membership Settings</span>
              </h3>

              <form onSubmit={handleUpdateSelfHandle} className="space-y-4 border-b border-slate-800 pb-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Discrete Member Handle</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Update Handle
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase text-rose-400">Danger Zone</h4>
                <p className="text-xs text-slate-400">
                  Permanently delete your account, cancel your subscription, and wipe all associated booth logs.
                </p>
                <button
                  onClick={handleSelfDeleteAccount}
                  className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-bold transition flex items-center space-x-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Account Permanently</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Account & Venue CRUD Portal — Restricted Solely to chuck / chuck.forsyth@gmail.com */}
          {activeTab === "admin" && currentUser.role === "ADMIN" && (currentUser.handle.toLowerCase() === "chuck" || currentUser.email.toLowerCase() === "chuck.forsyth@gmail.com") && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold text-slate-100">RLGL Admin CRUD Console</h3>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setAdminView("users")}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      adminView === "users" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Users CRUD ({users.length})
                  </button>
                  <button
                    onClick={() => setAdminView("venues")}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      adminView === "venues" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Venues CRUD ({venues.length})
                  </button>
                </div>
              </div>

              {/* Admin FinOps Banner Inside Admin Portal Only */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Financial Overview</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{activeSubs} Active Members</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Monthly Recurring (MRR)</span>
                  <span className="text-amber-400 font-extrabold text-sm">${mrr.toFixed(2)}/mo</span>
                </div>
              </div>

              {/* Users CRUD View */}
              {adminView === "users" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filter user..."
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create User</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase bg-slate-950/60">
                          <th className="p-3">Handle</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Subscription</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-bold text-slate-200">{u.handle}</td>
                            <td className="p-3 font-mono text-slate-400">{u.email}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-slate-800 text-amber-300 border-amber-500/30">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              {u.subscriptionActive ? (
                                <span className="text-emerald-400 font-bold">Active ($5/mo)</span>
                              ) : (
                                <span className="text-rose-400 font-bold">Canceled</span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => toggleUserSubscription(u.id, u.subscriptionActive)}
                                className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px] font-bold"
                              >
                                Toggle Sub
                              </button>
                              <button
                                onClick={() => handleAdminDeleteUser(u.id)}
                                className="p-1 text-rose-400 hover:bg-rose-950/60 rounded"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Venues CRUD View */}
              {adminView === "venues" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowAddVenueModal(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Venue Listing</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {venues.map((v) => (
                      <div key={v.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-slate-200">{v.name}</h4>
                            <p className="text-xs text-slate-400">{v.address}</p>
                          </div>
                          <button
                            onClick={() => handleAdminDeleteVenue(v.id)}
                            className="p-1 text-rose-400 hover:bg-rose-950/60 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Booths: {v.boothCount} | Lat/Lng: {v.latitude.toFixed(2)}, {v.longitude.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Admin Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Create New Member Account</h3>
            <form onSubmit={handleAdminAddUser} className="space-y-3">
              <input
                type="text"
                placeholder="Handle (e.g. NeonViper)"
                value={newAdminHandle}
                onChange={(e) => setNewAdminHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                required
              />
              <input
                type="email"
                placeholder="Email (e.g. viper@anon.com)"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                required
              />
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as "MEMBER" | "PREMIUM" | "ADMIN")}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
              >
                <option value="MEMBER">MEMBER</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded text-xs"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Venue Modal */}
      {showAddVenueModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Add New Venue Listing</h3>
            <form onSubmit={handleAdminAddVenue} className="space-y-3">
              <input
                type="text"
                placeholder="Venue Name (e.g. Adult World - Syracuse)"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                required
              />
              <input
                type="text"
                placeholder="Full Address"
                value={newVenueAddress}
                onChange={(e) => setNewVenueAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                required
              />
              <input
                type="number"
                placeholder="Booth Count"
                value={newVenueBooths}
                onChange={(e) => setNewVenueBooths(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
                required
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVenueModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded text-xs"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {messagingTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Discrete Chat w/ {messagingTarget}</h3>
              <button
                onClick={() => setMessagingTarget(null)}
                className="text-slate-500 hover:text-slate-200 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 h-40 overflow-y-auto space-y-2 text-xs">
              {(allMessages.filter(
                (m) =>
                  (m.senderHandle.toLowerCase() === currentUser.handle.toLowerCase() && m.receiverHandle.toLowerCase() === messagingTarget.toLowerCase()) ||
                  (m.senderHandle.toLowerCase() === messagingTarget.toLowerCase() && m.receiverHandle.toLowerCase() === currentUser.handle.toLowerCase())
              ) || []).length === 0 ? (
                <div className="text-slate-500 italic text-center pt-12">
                  No messages exchanged yet. Send a discrete greeting!
                </div>
              ) : (
                (allMessages.filter(
                  (m) =>
                    (m.senderHandle.toLowerCase() === currentUser.handle.toLowerCase() && m.receiverHandle.toLowerCase() === messagingTarget.toLowerCase()) ||
                    (m.senderHandle.toLowerCase() === messagingTarget.toLowerCase() && m.receiverHandle.toLowerCase() === currentUser.handle.toLowerCase())
                ) || []).map((msg) => (
                  <div key={msg.id} className="bg-slate-900 p-2 rounded border border-slate-800 text-emerald-300">
                    <span className="font-bold text-amber-400 block text-[10px]">{msg.senderHandle}:</span>
                    {msg.content}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="flex space-x-2">
              <input
                type="text"
                placeholder="Type discrete message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded text-xs"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
