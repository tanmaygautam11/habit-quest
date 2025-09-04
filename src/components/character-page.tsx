"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Achievement {
  title: string;
  description: string;
  date: string | Date;
  icon: string;
}

interface Profile {
  level: number;
  xp: number;
  gems: number;
  avatar: string;
  name: string;
  about?: string;
  achievements?: Achievement[];
}

const avatars = ["🧙", "🧑‍🎤", "🧑‍🚀", "🧑‍🌾", "🧑‍💻", "🧑‍🎨", "🧑‍🔬", "🧑‍🚒"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [upgrading, setUpgrading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const XP_PER_LEVEL = 100;
  const GEMS_PER_UPGRADE = 20;

  useEffect(() => {
    fetch("/api/user/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setAvatarIdx(avatars.indexOf(data.avatar) >= 0 ? avatars.indexOf(data.avatar) : 0);
        setAbout(data.about || "");
        setAchievements(Array.isArray(data.achievements) ? data.achievements : []);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = async (idx: number) => {
    setAvatarIdx(idx);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: avatars[idx] }),
    });
    setProfile((p) => p ? { ...p, avatar: avatars[idx] } : p);
  };

  const handleUpdateProfile = async () => {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about, achievements }),
    });
    setProfile((p) => p ? { ...p, about, achievements } : p);
    setEditing(false);
  };

  const handleUpgrade = async () => {
    if (!profile || profile.gems < GEMS_PER_UPGRADE) return;
    setUpgrading(true);
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upgrade: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    }
    setUpgrading(false);
  };

  if (loading) return <div className="text-center text-slate-400 mt-10">Loading character...</div>;
  if (!profile) return <div className="text-center text-rose-600 mt-10">Could not load character.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Profile</h2>
      <div className="bg-white rounded-xl shadow p-6 border border-indigo-100 flex flex-col gap-4 items-center">
        {/* Avatar selection or display */}
        {(!profile.avatar || !avatars.includes(profile.avatar) || editing) ? (
          <div className="flex gap-2 mb-2">
            {avatars.map((a, i) => (
              <button
                key={a}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-colors ${avatarIdx === i ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}
                onClick={() => handleAvatarChange(i)}
                aria-label={`Choose avatar ${a}`}
              >
                {a}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 mb-2">
            <span className="text-4xl">{profile.avatar}</span>
          </div>
        )}
        <div className="text-lg font-semibold text-slate-700">Level {profile.level}</div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${(profile.xp / (profile.level * XP_PER_LEVEL)) * 100}%` }} />
        </div>
        <div className="flex gap-6 text-slate-600">
          <div>XP: {profile.xp}/{profile.level * XP_PER_LEVEL}</div>
          <div>Gems: {profile.gems}</div>
        </div>
        {/* About section */}
        <div className="w-full">
          <label className="block text-slate-500 font-medium mb-1">About</label>
          {editing ? (
            <textarea className="w-full border rounded p-2" value={about} onChange={e => setAbout(e.target.value)} />
          ) : (
            <div className="text-slate-700 min-h-[2rem]">{about || <span className="text-slate-400">No about info yet.</span>}</div>
          )}
        </div>
        {/* Achievements section */}
        <div className="w-full">
          <label className="block text-slate-500 font-medium mb-1">Achievements</label>
          <ul className="list-disc pl-5">
            {achievements.length === 0 && <li className="text-slate-400">No achievements yet.</li>}
            {achievements.map((a, i) => (
              <li key={i} className="mb-1 flex items-center gap-2">
                <span className="text-2xl">{a.icon}</span>
                <span className="font-semibold text-indigo-700">{a.title}</span> - <span className="text-slate-600">{a.description}</span> <span className="text-xs text-slate-400">({a.date ? new Date(a.date).toLocaleDateString() : ""})</span>
              </li>
            ))}
          </ul>
          {editing && (
            <Button size="sm" className="mt-2" onClick={() => setAchievements([
              ...achievements,
              { title: "New Achievement", description: "Describe...", date: new Date(), icon: "🏅" }
            ])}>Add Achievement</Button>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleUpgrade} disabled={profile.gems < GEMS_PER_UPGRADE || upgrading}>
            {upgrading ? "Upgrading..." : `Upgrade (20 Gems)`}
          </Button>
          <Button variant="outline" onClick={() => setEditing(e => !e)}>{editing ? "Cancel" : "Update Profile"}</Button>
          {editing && <Button variant="secondary" onClick={handleUpdateProfile}>Save</Button>}
        </div>
      </div>
    </div>
  );
}
