import { cognitoClient } from "@/lib/auth/cognitoClient";
import {
  CLIENT_ID,
  generateSecretHash,
  USER_POOL_ID,
} from "@/lib/auth/generateHash";
import { insertUser } from "@/lib/auth/getUserTypeFromEmail";
import { db } from "@/lib/db";
import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, email, code } = await request.json();
  const secretHash = generateSecretHash(email);
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: secretHash,
  };

  try {
    const command = new ConfirmSignUpCommand(params);
    const awsResponse = await cognitoClient.send(command);
    console.log("awsResponse: ", awsResponse);
    const userCommand = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });
    const awsUserData = await cognitoClient.send(userCommand);
    console.log("awsUserData: ", awsUserData);

    if (awsResponse) {
      const user = {
        email,
        name,
      };
      const userData = await insertUser(user);
      const userId = userData[0].id;

      return new Response(JSON.stringify(awsResponse), {
        status: 200,
      });
    }
  } catch (error: any) {
    // Check if it's a Postgres unique constraint violation
    if (error.code === "23505") {
      // Optional: check which field caused it
      if (error.constraint === "users_email_unique") {
        return new Response(
          JSON.stringify({ message: "Email already exists", status: 400 })
        );
      }
    }

    // Catch-all for other errors
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong", status: 500 })
    );
  }
}
