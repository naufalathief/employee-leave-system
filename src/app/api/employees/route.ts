import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/employees — list all employees
export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ createdAt: -1 }).lean();

    const result = employees.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      username: e.username ?? "",
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

// POST /api/employees — create employee + user account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, email, password, department, position, leaveBalance } = body;

    if (!name || !username || !password || !department || !position) {
      return NextResponse.json(
        { error: "Name, username, password, department, and position are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if username already exists in User or Employee collection
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const existingEmployee = await Employee.findOne({ username: username.toLowerCase().trim() });
    if (existingEmployee) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await Employee.create({
      name,
      username: username.toLowerCase().trim(),
      email: email ?? "",
      department,
      position,
      leaveBalance: leaveBalance ?? 12,
    });

    // Create user account for employee login
    try {
      await User.create({
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        role: "EMPLOYEE",
        employeeId: employee._id.toString(),
      });
    } catch (userError) {
      // If user creation fails, rollback the employee
      await Employee.findByIdAndDelete(employee._id);
      console.error("[POST /api/employees] User creation failed:", userError);
      return NextResponse.json(
        { error: "Failed to create user account for employee" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      employee: {
        id: employee._id.toString(),
        name: employee.name,
        username: employee.username,
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
