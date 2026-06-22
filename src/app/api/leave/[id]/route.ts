import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";
import { Employee } from "@/models/Employee";
import { countBusinessDays } from "@/lib/holidays";

type Params = { params: Promise<{ id: string }> };

/**
 * countDays uses the shared countBusinessDays utility that excludes
 * both weekends and Indonesian public holidays.
 */
const countDays = countBusinessDays;

// PATCH /api/leave/[id] — approve, check, or reject
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, approverEmployeeId, forwardToManagerId } = body;

    if (!["APPROVED", "REJECTED", "PENDING", "CHECKED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    const previousStatus = leave.status;

    // Determine the position of the person doing the approval
    let approverPosition = "";
    if (approverEmployeeId) {
      const approver = await Employee.findById(approverEmployeeId);
      if (approver) {
        approverPosition = approver.position;
      }
    }

    // --- APPROVAL WORKFLOW ---
    if (status === "APPROVED") {
      // Senior Staff approving a PENDING request → becomes CHECKED, not APPROVED
      if (approverPosition === "Senior Staff" && leave.status === "PENDING") {
        leave.status = "CHECKED";
        leave.checkedById = approverEmployeeId;

        if (forwardToManagerId) {
          leave.approverId = forwardToManagerId;
          leave.finalApproverId = forwardToManagerId;
        }

        await leave.save();

        return NextResponse.json({
          leave: {
            id: leave._id.toString(),
            employeeId: leave.employeeId,
            approverId: leave.approverId,
            checkedById: leave.checkedById,
            finalApproverId: leave.finalApproverId,
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
          },
          message: "Request checked by Senior Staff. Forwarded to Manager for final approval.",
        });
      }

      // Everyone else → full APPROVED (Manager, Director, Admin, or fallback)
      // Deduct ANNUAL leave balance
      if (leave.type === "ANNUAL" && previousStatus !== "APPROVED") {
        const employee = await Employee.findById(leave.employeeId);
        if (!employee) {
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        const days = countDays(leave.startDate, leave.endDate);

        if (employee.leaveBalance < days) {
          return NextResponse.json(
            { error: `Insufficient leave balance. Required: ${days} days, Available: ${employee.leaveBalance} days` },
            { status: 400 }
          );
        }

        employee.leaveBalance -= days;
        await employee.save();
      }

      leave.status = "APPROVED";
      leave.finalApproverId = approverEmployeeId || leave.approverId;
      await leave.save();

      return NextResponse.json({
        leave: {
          id: leave._id.toString(),
          employeeId: leave.employeeId,
          approverId: leave.approverId,
          checkedById: leave.checkedById,
          finalApproverId: leave.finalApproverId,
          type: leave.type,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
        },
      });
    }

    // --- REJECTION ---
    if (status === "REJECTED") {
      // If reverting from APPROVED for ANNUAL leave, restore balance
      if (previousStatus === "APPROVED" && leave.type === "ANNUAL") {
        const employee = await Employee.findById(leave.employeeId);
        if (employee) {
          const days = countDays(leave.startDate, leave.endDate);
          employee.leaveBalance = Math.min(employee.leaveBalance + days, 12);
          await employee.save();
        }
      }
    }

    // If reverting from APPROVED to PENDING for ANNUAL leave, restore balance
    if (previousStatus === "APPROVED" && status === "PENDING" && leave.type === "ANNUAL") {
      const employee = await Employee.findById(leave.employeeId);
      if (employee) {
        const days = countDays(leave.startDate, leave.endDate);
        employee.leaveBalance = Math.min(employee.leaveBalance + days, 12);
        await employee.save();
      }
    }

    leave.status = status;
    await leave.save();

    return NextResponse.json({
      leave: {
        id: leave._id.toString(),
        employeeId: leave.employeeId,
        approverId: leave.approverId,
        checkedById: leave.checkedById,
        finalApproverId: leave.finalApproverId,
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

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    // If deleting an approved ANNUAL leave, restore balance
    if (leave.status === "APPROVED" && leave.type === "ANNUAL") {
      const employee = await Employee.findById(leave.employeeId);
      if (employee) {
        const days = countDays(leave.startDate, leave.endDate);
        employee.leaveBalance = Math.min(employee.leaveBalance + days, 12);
        await employee.save();
      }
    }

    await LeaveRequest.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/leave/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
