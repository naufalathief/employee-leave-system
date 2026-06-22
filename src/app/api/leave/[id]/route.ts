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

      // Everyone else → full APPROVED
      // Deduct ANNUAL leave balance using atomic $inc
      if (leave.type === "ANNUAL" && previousStatus !== "APPROVED") {
        const days = countDays(leave.startDate, leave.endDate);
        console.log(`[APPROVAL] Deducting ${days} days from employee ${leave.employeeId}, leave type: ${leave.type}`);

        // First check current balance
        const employee = await Employee.findById(leave.employeeId);
        if (!employee) {
          console.error(`[APPROVAL] Employee not found: ${leave.employeeId}`);
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        console.log(`[APPROVAL] Current balance: ${employee.leaveBalance}, days to deduct: ${days}`);

        if (employee.leaveBalance < days) {
          return NextResponse.json(
            { error: `Insufficient leave balance. Required: ${days} days, Available: ${employee.leaveBalance} days` },
            { status: 400 }
          );
        }

        // Use atomic $inc to guarantee the write happens
        const updatedEmployee = await Employee.findByIdAndUpdate(
          leave.employeeId,
          { $inc: { leaveBalance: -days } },
          { new: true, runValidators: false }
        );

        console.log(`[APPROVAL] Balance after deduction: ${updatedEmployee?.leaveBalance}`);
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
      if (previousStatus === "APPROVED" && leave.type === "ANNUAL") {
        const days = countDays(leave.startDate, leave.endDate);
        await Employee.findByIdAndUpdate(
          leave.employeeId,
          { $inc: { leaveBalance: days } },
          { runValidators: false }
        );
        console.log(`[REJECTION] Restored ${days} days to employee ${leave.employeeId}`);
      }
    }

    // If reverting from APPROVED to PENDING for ANNUAL leave, restore balance
    if (previousStatus === "APPROVED" && status === "PENDING" && leave.type === "ANNUAL") {
      const days = countDays(leave.startDate, leave.endDate);
      await Employee.findByIdAndUpdate(
        leave.employeeId,
        { $inc: { leaveBalance: days } },
        { runValidators: false }
      );
      console.log(`[REVERT] Restored ${days} days to employee ${leave.employeeId}`);
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
      const days = countDays(leave.startDate, leave.endDate);
      await Employee.findByIdAndUpdate(
        leave.employeeId,
        { $inc: { leaveBalance: days } },
        { runValidators: false }
      );
    }

    await LeaveRequest.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/leave/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
