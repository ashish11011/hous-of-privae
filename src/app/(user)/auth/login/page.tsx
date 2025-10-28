"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tgoogle } from "@/lib/icons";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

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
        router.push("/");
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
    <div className="flex items-center justify-center py-32  bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-3">
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-center text-gray-500">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full"
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
            <span className="bg-white px-3 text-gray-500">or</span>
          </div>
        </div>

        {/* Google Sign-In */}
        <Button
          variant="outline"
          size="lg"
          className="w-full flex items-center justify-center"
          onClick={() => signIn("google", { callbackUrl: "/" })}
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
      </div>
    </div>
  );
}
