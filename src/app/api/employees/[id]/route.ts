import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { Employee } from "@/models/Employee";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

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
        username: employee.username ?? "",
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
    const { name, username, email, password, department, position, leaveBalance } = body;

    await connectDB();

    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // If username changed, check uniqueness
    if (username && username.toLowerCase().trim() !== existingEmployee.username) {
      const duplicateUser = await User.findOne({ username: username.toLowerCase().trim() });
      const duplicateEmployee = await Employee.findOne({ username: username.toLowerCase().trim(), _id: { $ne: id } });
      if (duplicateUser || duplicateEmployee) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
      }
    }

    // Update employee
    console.log("[PUT /api/employees/[id]] Updating employee:", id, "with data:", {
      name,
      username: username?.toLowerCase().trim(),
      email,
      department,
      position,
      leaveBalance,
    });

    const employee = await Employee.findByIdAndUpdate(
      id,
      { name, username: username?.toLowerCase().trim(), email, department, position, leaveBalance },
      { new: true, runValidators: true }
    ).lean();

    console.log("[PUT /api/employees/[id]] Update result in db:", employee);

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update user account if username or password changed
    const oldUsername = existingEmployee.username;
    const userUpdate: Record<string, string> = {};
    if (username && username.toLowerCase().trim() !== oldUsername) {
      userUpdate.username = username.toLowerCase().trim();
    }
    if (password && password.trim() !== "") {
      userUpdate.password = await bcrypt.hash(password, 10);
    }
    if (Object.keys(userUpdate).length > 0) {
      await User.findOneAndUpdate(
        { employeeId: id },
        userUpdate
      );
    }

    return NextResponse.json({
      employee: {
        id: employee._id.toString(),
        name: employee.name,
        username: employee.username ?? "",
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

    // Also delete the associated user account
    await User.findOneAndDelete({ employeeId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/employees/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
