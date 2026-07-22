"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { Command } from "lucide-react";
import Link from "next/link";

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return <main className="grid min-h-screen bg-background lg:grid-cols-2"><section className="hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="flex size-7 items-center justify-center rounded-lg bg-white text-zinc-950"><Command className="size-4" /></span>Vektorix</Link><blockquote className="mt-auto max-w-lg"><p className="text-3xl font-medium leading-tight tracking-[-0.035em]">“Vektorix gives us one clear view of what is actually driving growth.”</p><footer className="mt-6 text-sm text-zinc-400">Mira K. — Growth Director, Northstar</footer></blockquote></section><section className="flex items-center justify-center p-6">{configured ? mode === "sign-in" ? <SignIn /> : <SignUp /> : <div className="surface-card w-full max-w-md p-8"><span className="flex size-10 items-center justify-center rounded-[calc(var(--input-radius)+0.25rem)] bg-primary text-white"><Command className="size-5" /></span><h1 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1><p className="mt-2 text-sm leading-relaxed text-text-muted">Clerk authentication is ready. Add your publishable and secret keys to <code className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">.env.local</code> to enable this screen.</p><Link href="/" className="focus-ring mt-6 inline-flex min-h-10 items-center rounded-input bg-primary px-4 text-sm font-medium text-white transition-[background-color,scale] duration-150 hover:bg-zinc-800 active:scale-[0.96]">Continue in demo mode</Link></div>}</section></main>;
}
