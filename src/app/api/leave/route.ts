import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";

export const dynamic = "force-dynamic";

// GET /api/leave — list all leave requests (optionally filtered by employeeId)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    const filter = employeeId ? { employeeId } : {};
    const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 }).lean();

    const result = leaves.map((l) => ({
      id: l._id.toString(),
      employeeId: l.employeeId,
      approverId: l.approverId,
      checkedById: l.checkedById ?? undefined,
      finalApproverId: l.finalApproverId ?? undefined,
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      reason: l.reason,
      status: l.status,
    }));

    return NextResponse.json({ leaves: result });
  } catch (error) {
    console.error("[GET /api/leave]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/leave — create leave request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, approverId, type, startDate, endDate, reason } = body;

    if (!employeeId || !approverId || !type || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDB();
    const leave = await LeaveRequest.create({
      employeeId,
      approverId,
      type,
      startDate,
      endDate,
      reason,
      status: "PENDING",
    });

    return NextResponse.json({
      leave: {
        id: leave._id.toString(),
        employeeId: leave.employeeId,
        approverId: leave.approverId,
        type: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/leave]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
