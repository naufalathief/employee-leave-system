import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    let employeeId = (payload.employeeId as string) ?? undefined;

    if (payload.role === "EMPLOYEE" && !employeeId) {
      await connectDB();
      const emp = await Employee.findOne({ username: (payload.username as string).toLowerCase().trim() });
      if (emp) {
        employeeId = emp._id.toString();
      }
    }

    const session = {
      username: payload.username as string,
      role: payload.role as "ADMIN" | "EMPLOYEE",
      employeeId,
      isLoggedIn: true,
      loginAt: new Date(Number(payload.iat) * 1000).toISOString(),
    };

    return NextResponse.json({ session });
  } catch (error) {
    console.error("[GET /api/auth/session] Error parsing session:", error);
    return NextResponse.json({ session: null }, { status: 401 });
  }
}
