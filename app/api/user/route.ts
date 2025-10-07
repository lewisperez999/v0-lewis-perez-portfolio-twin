import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get current user information from Clerk
 */
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses.map(email => ({
          emailAddress: email.emailAddress,
          id: email.id,
        })),
        primaryEmailAddress: user.primaryEmailAddress?.emailAddress,
      }
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
