import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const session = {
      username: payload.username as string,
      role: payload.role as "ADMIN" | "EMPLOYEE",
      employeeId: (payload.employeeId as string) ?? undefined,
      isLoggedIn: true,
      loginAt: new Date(Number(payload.iat) * 1000).toISOString(),
    };

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ session: null }, { status: 401 });
  }
}
