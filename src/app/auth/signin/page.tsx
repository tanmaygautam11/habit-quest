
"use client";
import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { TriangleAlert } from "lucide-react";
import Header  from "@/components/header";
import TestLogout from "@/components/test-logout";
import AuthSessionProvider from "@/components/auth-session-provider";


function SigninContent() {
  const { data: session } = useSession();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/");
    } else if (res?.status === 401) {
      setError("Invalid Credentials");
    } else {
      setError("Something went wrong");
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
      {!session && <Header />}
      {session ? (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-100">
          <TestLogout />
          <div className="bg-white/90 rounded-3xl shadow-2xl px-12 py-16 flex flex-col items-center max-w-lg w-full border-t-8 border-emerald-400">
            <h1 className="text-4xl font-extrabold text-emerald-700 mb-2 tracking-tight">Welcome back, <span className="text-indigo-700">{session.user?.name || session.user?.email}</span>!</h1>
            <p className="text-lg text-slate-600 mb-6">You are now logged in. Explore your habits, quests, and more from the sidebar.</p>
            <p className="text-base text-slate-500 text-center">Stay consistent and level up your life with HabitQuest!</p>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col items-center bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-100 px-2 py-10">
          <div className="mb-10 text-center animate-fade-in">
            <p className="text-4xl text-slate-700 font-semibold mb-2">Welcome back, Adventurer!</p>
            <p className="text-base text-slate-500">Sign in to continue your quest for better habits.</p>
          </div>
          <Card className="w-full max-w-lg p-10 shadow-2xl rounded-3xl border-2 border-indigo-200 bg-white/95 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-extrabold text-indigo-700 mb-1">Sign in to your account</CardTitle>
              <CardDescription className="text-center text-base text-slate-500 mb-4">Track your progress, unlock achievements, and join the HabitQuest community.</CardDescription>
            </CardHeader>
            {!!error && (
              <div className="bg-rose-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-rose-600 mb-6">
                <TriangleAlert />
                <p>{error}</p>
              </div>
            )}
            <CardContent className="px-2 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-indigo-400 text-lg py-3"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-emerald-400 text-lg py-3"
                />
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white shadow-lg text-lg py-3 font-semibold tracking-wide transition-colors"
                  size="lg"
                >
                  Sign in
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
                  <FcGoogle className="size-6" /> Sign in with Google
                </Button>
                <Button
                  onClick={(e) => handleProvider(e, "github")}
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center gap-2 w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 hover:scale-105 transition-colors text-base"
                >
                  <FaGithub className="size-6 text-slate-800" /> Sign in with GitHub
                </Button>
              </div>
              <p className="text-center text-sm mt-8 text-slate-600">
                Don&apos;t have an account?
                <Link
                  className="text-indigo-600 ml-2 font-semibold underline hover:text-indigo-900"
                  href="/auth/signup"
                >
                  Sign up
                </Link>
              </p>
              <blockquote className="mt-6 text-center text-sm italic text-gray-500 border-l-4 border-emerald-400 pl-4">
                “HabitQuest helped me finally stay consistent and reach my goals.”
                <br />
                <span className="not-italic font-semibold text-emerald-700">— A Real User</span>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

const SignIn = () => (
  <AuthSessionProvider>
    <SigninContent />
  </AuthSessionProvider>
);


export default SignIn;
