import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";
import { DEFAULT_ANNUAL_LEAVE_DAYS } from "@/constants";

/**
 * POST /api/leave/reset — Reset annual leave balance for all employees.
 * 
 * This endpoint resets leave balance to 12 for all employees whose last reset
 * was more than ~1 year ago. It is designed to be called:
 * 
 * 1. Manually by admin
 * 2. Via Vercel Cron Job (recommended — set in vercel.json)
 * 
 * Logic:
 * - Checks each employee's `leaveBalanceResetAt` field
 * - If current year > reset year, resets balance to 12 and updates timestamp
 * - Employees already reset this year are skipped
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: verify a secret to prevent unauthorized calls
    const { searchParams } = new URL(req.url);
    const cronSecret = searchParams.get("secret");
    
    // If CRON_SECRET is set, validate it
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const currentYear = new Date().getFullYear();

    // Find employees whose last reset was before this year
    const employees = await Employee.find({});
    let resetCount = 0;

    for (const employee of employees) {
      const lastResetYear = employee.leaveBalanceResetAt
        ? new Date(employee.leaveBalanceResetAt).getFullYear()
        : 0;

      if (lastResetYear < currentYear) {
        employee.leaveBalance = DEFAULT_ANNUAL_LEAVE_DAYS;
        employee.leaveBalanceResetAt = new Date();
        await employee.save();
        resetCount++;
      }
    }

    return NextResponse.json({
      message: `Annual leave balance reset completed`,
      year: currentYear,
      employeesReset: resetCount,
      totalEmployees: employees.length,
    });
  } catch (error) {
    console.error("[POST /api/leave/reset]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
