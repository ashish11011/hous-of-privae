"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Could not send reset code.");
      }

      setMessage(payload.message);
      setStep("reset");
    } catch (error: any) {
      setMessage(error.message || "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const response = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Could not reset password.");
      }

      setMessage(payload.message);
      setPassword("");
      setConfirmPassword("");
      setCode("");
    } catch (error: any) {
      setMessage(error.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center px-4 py-20 md:py-32 bg-background">
      <div className="w-full max-w-md border border-border bg-card p-6 md:p-8 space-y-4">
        <div className="text-center">
          <p className="eyebrow mb-3">Account</p>
          <h1 className="font-heading text-4xl heading-rule">Reset Password</h1>
        </div>

        {message && (
          <p className="text-sm text-center text-muted-foreground">{message}</p>
        )}

        {step === "request" ? (
          <form onSubmit={requestCode} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs"
              size="lg"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Verification Code
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code from email"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs"
              size="lg"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-[#B89146] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
