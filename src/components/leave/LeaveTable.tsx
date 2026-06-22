"use client";

import { useEffect, useState, useMemo } from "react";
import { LeaveRequest, Employee } from "@/types";
import { EmployeeStorageService } from "@/services/employee-storage";
import { formatDate, statusColors } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, CalendarDays } from "lucide-react";

interface LeaveTableProps {
  leaveRequests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function LeaveTable({ leaveRequests, onApprove, onReject }: LeaveTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const [data, session] = await Promise.all([
        EmployeeStorageService.getAll(),
        (await import("@/services/auth-storage")).AuthStorageService.getSession(),
      ]);
      setEmployees(data);
      setSession(session);
    }
    loadData();
  }, []);

  // Performance Optimization: useMemo so we don't recalculate the map on every re-render
  const employeeMap = useMemo(() => {
    const map: Record<string, Employee> = {};
    employees.forEach((emp) => {
      map[emp.id] = emp;
    });
    return map;
  }, [employees]);

  const getEmployeeName = (employeeId: string): string => {
    return employeeMap[employeeId]?.name ?? "Unknown Employee";
  };

  const isAdmin = session?.role === "ADMIN";

  const canApprove = (request: LeaveRequest) => {
    if (isAdmin) return true;
    return request.approverId === session?.employeeId;
  };

  const showActionsColumn = isAdmin || leaveRequests.some(canApprove);

  if (leaveRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-primary">No leave requests found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No leave requests match the current filter
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Employee</TableHead>
            <TableHead className="font-semibold text-foreground">Type</TableHead>
            <TableHead className="font-semibold text-foreground">Approver</TableHead>
            <TableHead className="font-semibold text-foreground">Start Date</TableHead>
            <TableHead className="font-semibold text-foreground">End Date</TableHead>
            <TableHead className="font-semibold hidden md:table-cell text-foreground">Reason</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            {showActionsColumn && <TableHead className="font-semibold text-right text-foreground">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((request) => (
            <TableRow key={request.id} className="hover:bg-muted/30 border-b transition-colors">
              <TableCell className="font-medium">
                {getEmployeeName(request.employeeId)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {request.type ?? "ANNUAL"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {request.approverId ? getEmployeeName(request.approverId) : "System/Admin"}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(request.startDate)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(request.endDate)}</TableCell>
              <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                {request.reason}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[request.status]}
                >
                  {request.status}
                </Badge>
              </TableCell>
              {showActionsColumn && (
                <TableCell className="text-right">
                  {canApprove(request) && request.status === "PENDING" ? (
                    <div className="flex items-center justify-end gap-1">
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            />
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Are you sure you want to approve the leave request for{" "}
                              <strong className="text-foreground">{getEmployeeName(request.employeeId)}</strong> from{" "}
                              {formatDate(request.startDate)} to {formatDate(request.endDate)}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onApprove(request.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Approve
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            />
                          }
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Are you sure you want to reject the leave request for{" "}
                              <strong className="text-foreground">{getEmployeeName(request.employeeId)}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onReject(request.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
