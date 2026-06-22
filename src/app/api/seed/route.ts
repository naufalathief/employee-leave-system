import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

// POST /api/seed — create initial admin user (run once)
export async function POST() {
  try {
    await connectDB();

    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 200 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    });

    return NextResponse.json({ message: "Admin user created successfully" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/seed]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
