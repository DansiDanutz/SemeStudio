"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    // Mock signup — replace with Supabase auth
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Account created! Check your email to verify.");
    setLoading(false);
  };

  const handleOAuth = (provider: string) => {
    toast.info(`${provider} signup coming soon`);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#FAFAFA] mb-2">Create your account</h2>
        <p className="text-sm text-[#52525B]">
          Start creating with 10 free AI credits
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <Button
          variant="outline"
          className="w-full border-[#222] bg-[#111] hover:bg-[#161616] text-[#FAFAFA] h-11"
          onClick={() => handleOAuth("Google")}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="relative mb-6">
        <Separator className="bg-[#222]" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#080808] px-3 text-xs text-[#52525B]">
          or
        </span>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-[#A1A1AA]">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Dan Semenescu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 border-[#222] bg-[#111] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000] focus:ring-[#FF0000]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-[#A1A1AA]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 border-[#222] bg-[#111] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000] focus:ring-[#FF0000]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-[#A1A1AA]">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 border-[#222] bg-[#111] text-[#FAFAFA] placeholder:text-[#52525B] focus:border-[#FF0000] focus:ring-[#FF0000]/20"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold shadow-lg shadow-red-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-[#52525B]">
        By signing up, you agree to our{" "}
        <a href="#" className="underline hover:text-[#A1A1AA]">Terms</a> and{" "}
        <a href="#" className="underline hover:text-[#A1A1AA]">Privacy Policy</a>.
      </p>

      <p className="mt-6 text-center text-sm text-[#52525B]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#FF0000] hover:text-[#CC0000] font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
