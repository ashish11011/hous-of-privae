import { cognitoClient } from "@/lib/auth/cognitoClient";
import { CLIENT_ID, generateSecretHash } from "@/lib/auth/generateHash";
import {
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
        SecretHash: generateSecretHash(email),
      })
    );

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to your email.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Could not send reset code." },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { message: "Email, code, and new password are required." },
        { status: 400 }
      );
    }

    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: password,
        SecretHash: generateSecretHash(email),
      })
    );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Could not reset password." },
      { status: 400 }
    );
  }
}
