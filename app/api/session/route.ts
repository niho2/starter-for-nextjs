import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("my-custom-session");

    if (session?.value) {
      return NextResponse.json({ session: session.value });
    } else {
      return NextResponse.json({ session: null }, { status: 401 });
    }
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
