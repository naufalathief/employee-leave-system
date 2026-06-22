import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Employee } from "@/models/Employee";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    await connectDB();

    let user = await User.findOne({ username: username.toLowerCase().trim() });

    // If no User found, check if there's an Employee with this username
    // that doesn't have a User account yet (created before User-creation logic)
    if (!user) {
      const employee = await Employee.findOne({ username: username.toLowerCase().trim() });
      if (employee) {
        // No user account exists for this employee — auth fails
        return NextResponse.json(
          { error: "No login account found for this employee. Please contact admin to reset your account." },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // If user is EMPLOYEE but employeeId is missing, try to find and link
    if (user.role === "EMPLOYEE" && !user.employeeId) {
      const employee = await Employee.findOne({ username: user.username });
      if (employee) {
        user.employeeId = employee._id.toString();
        await user.save();
      }
    }

    const token = await new SignJWT({
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
      employeeId: user.employeeId ?? null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const session = {
      username: user.username,
      role: user.role,
      employeeId: user.employeeId ?? undefined,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    };

    const response = NextResponse.json({ success: true, session });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
