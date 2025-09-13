"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const SignUp = () => {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/habits");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      // Automatically sign in after successful signup
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (signInRes?.ok) {
        router.push("/");
      } else {
        setError("Account created, but failed to log in. Please try logging in manually.");
      }
    } else {
      setError(data.message);
    }
  };

  const handleProvider = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: "github" | "google"
  ) => {
    event.preventDefault();
    signIn(value, { callbackUrl: "/" });
  };

  return (
    <>
      {session ? (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-100">
          <div className="bg-white/90 rounded-3xl shadow-2xl px-12 py-16 flex flex-col items-center max-w-lg w-full border-t-8 border-emerald-400">
            <h1 className="text-4xl font-extrabold text-emerald-700 mb-2 tracking-tight">Welcome, <span className="text-indigo-700">{session.user?.name || session.user?.email}</span>!</h1>
            <p className="text-lg text-slate-600 mb-6">Your account is ready. Start your habit journey from the sidebar.</p>
            <p className="text-base text-slate-500 text-center">Stay consistent and level up your life with HabitQuest!</p>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col items-center bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-100 px-2 py-10">
          <div className="mb-10 text-center animate-fade-in">
            <p className="text-4xl text-slate-700 font-semibold mb-2">Start your adventure and build better habits!</p>
            <p className="text-base text-slate-500">Create your free account to unlock achievements and track your progress.</p>
          </div>
          <Card className="w-full max-w-lg p-10 shadow-2xl rounded-3xl border-2 border-indigo-200 bg-white/95 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-extrabold text-indigo-700 mb-1">Create your account</CardTitle>
              <CardDescription className="text-center text-base text-slate-500 mb-4">Sign up with your email or a provider to begin your quest.</CardDescription>
            </CardHeader>
            {!!error && (
              <div className="bg-rose-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-rose-600 mb-6">
                <TriangleAlert className="size-4" />
                <p>{error}</p>
              </div>
            )}
            <CardContent className="px-2 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="text-lg py-3"
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="text-lg py-3"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="text-lg py-3"
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="text-lg py-3"
                />
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white shadow-lg text-lg py-3 font-semibold tracking-wide transition-colors"
                  size="lg"
                >
                  Sign up
                </Button>
              </form>
              <Separator className="my-8" />
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={(e) => handleProvider(e, "google")}
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center gap-2 w-full border-sky-300 text-sky-700 hover:bg-sky-50 hover:text-sky-900 hover:scale-105 transition-colors text-base"
                >
                  <FcGoogle className="size-6" /> Sign up with Google
                </Button>
                <Button
                  onClick={(e) => handleProvider(e, "github")}
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center gap-2 w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 hover:scale-105 transition-colors text-base"
                >
                  <FaGithub className="size-6 text-slate-800" /> Sign up with GitHub
                </Button>
              </div>
              <p className="text-center text-sm mt-8 text-slate-600">
                Already have an account?
                <Link
                  className="text-indigo-600 ml-2 font-semibold underline hover:text-indigo-900"
                  href="/auth/signin"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SignUp;
