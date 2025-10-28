"use client";

import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { useState } from "react";
import { cognitoClient } from "@/lib/auth/cognitoClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CLIENT_ID, generateSecretHash } from "@/lib/auth/generateHash";

// Generate Cognito Secret Hash

export default function SignupPage() {
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const secretHash = generateSecretHash(email);
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
      SecretHash: secretHash,
    };

    try {
      if (password.trim() !== confirmPassword.trim()) {
        throw new Error("Passwords matching failed");
      }
      const command = new SignUpCommand(params);
      await cognitoClient.send(command);
      setMessage("Verification code sent to your email.");
      setStep("confirm");
    } catch (err: any) {
      setMessage(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm", {
        method: "POST",
        body: JSON.stringify({ name, email, code }),
      });
      const resMsg = await res.json();
      if (resMsg.status !== 200) {
        const msg = await res.json();
        throw new Error(msg.message);
      }
    } catch (error: any) {
      console.log(error);
      setMessage(error.message || "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-32 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-3">
        <h1 className="text-2xl font-bold text-center ">
          {step === "signup" ? "Create Account" : "Confirm Your Email"}
        </h1>

        {message && (
          <p
            className={`text-sm text-center mb-12 ${
              message.includes("✅")
                ? "text-green-600"
                : message.includes("failed")
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}

        {step === "signup" ? (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Jon Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size={"lg"}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Code
              </label>
              <Input
                type="text"
                placeholder="Enter code from email"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button
              className=" w-full"
              size={"lg"}
              type="submit"
              disabled={loading}
            >
              {" "}
              {loading ? "Confirming..." : "Confirm Account"}
            </Button>

            <button
              type="button"
              onClick={() => setStep("signup")}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
