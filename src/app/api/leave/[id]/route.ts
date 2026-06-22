import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/leave/[id] — approve or reject
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const leave = await LeaveRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

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
    });
  } catch (error) {
    console.error("[PATCH /api/leave/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/leave/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const leave = await LeaveRequest.findByIdAndDelete(id);

    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/leave/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
