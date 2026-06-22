import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";

type Params = { params: Promise<{ id: string }> };

// GET /api/employees/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const employee = await Employee.findById(id).lean();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({
      employee: {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email ?? "",
        department: employee.department,
        position: employee.position,
        leaveBalance: employee.leaveBalance ?? 12,
      },
    });
  } catch (error) {
    console.error("[GET /api/employees/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/employees/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, department, position, leaveBalance } = body;

    await connectDB();
    const employee = await Employee.findByIdAndUpdate(
      id,
      { name, email, department, position, leaveBalance },
      { new: true, runValidators: true }
    ).lean();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({
      employee: {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email ?? "",
        department: employee.department,
        position: employee.position,
        leaveBalance: employee.leaveBalance ?? 12,
      },
    });
  } catch (error) {
    console.error("[PUT /api/employees/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/employees/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/employees/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
