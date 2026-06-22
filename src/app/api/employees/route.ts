import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";

// GET /api/employees — list all employees
export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ createdAt: -1 }).lean();

    const result = employees.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      email: e.email ?? "",
      department: e.department,
      position: e.position,
      leaveBalance: e.leaveBalance ?? 12,
    }));

    return NextResponse.json({ employees: result });
  } catch (error) {
    console.error("[GET /api/employees]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/employees — create employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, department, position, leaveBalance } = body;

    if (!name || !department || !position) {
      return NextResponse.json({ error: "Name, department, and position are required" }, { status: 400 });
    }

    await connectDB();
    const employee = await Employee.create({
      name,
      email: email ?? "",
      department,
      position,
      leaveBalance: leaveBalance ?? 12,
    });

    return NextResponse.json({
      employee: {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        leaveBalance: employee.leaveBalance,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/employees]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
