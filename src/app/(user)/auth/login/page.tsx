"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tgoogle } from "@/lib/icons";
import Link from "next/link";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.status === 401) {
        setMessage("Invalid username or password");
      } else if (res?.status === 200) {
        router.push(callbackUrl);
      } else if (res?.error) {
        setMessage(res.error);
      }
    } catch (error) {
      setMessage("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center px-4 py-20 md:py-32 bg-background">
      <div className="w-full max-w-md border border-border bg-card p-6 md:p-8 space-y-4">
        <div className="text-center">
          <p className="eyebrow mb-3">Account</p>
          <h1 className="font-heading text-4xl heading-rule">Welcome Back</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Sign in to access your account
        </p>

        {message && (
          <p
            className={`text-sm text-center mb-12 ${
              message.includes("Invalid")
                ? "text-red-600"
                : message.includes("failed")
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Credentials login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs"
            size={"lg"}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Google Sign-In */}
        <Button
          variant="outline"
          size="lg"
          className="w-full flex items-center justify-center rounded-none h-12"
          onClick={() => signIn("google", { callbackUrl })}
        >
          <Tgoogle className="text-2xl mr-2" />
          Continue with Google
        </Button>

        {/* Optional link to signup */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-[#B89146] hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500">
          <Link href="/auth/forgot-password" className="text-[#B89146] hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex items-center justify-center px-4 py-20 md:py-32 bg-background">
          <div className="w-full max-w-md border border-border bg-card p-6 md:p-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
