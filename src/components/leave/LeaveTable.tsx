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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, CalendarDays, ArrowRight } from "lucide-react";

interface LeaveTableProps {
  leaveRequests: LeaveRequest[];
  onApprove: (id: string, forwardToManagerId?: string) => void;
  onReject: (id: string) => void;
  currentEmployee?: Employee | null;
}

export function LeaveTable({ leaveRequests, onApprove, onReject, currentEmployee }: LeaveTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [session, setSession] = useState<any>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      const [data, sess] = await Promise.all([
        EmployeeStorageService.getAll(),
        (await import("@/services/auth-storage")).AuthStorageService.getSession(),
      ]);
      setEmployees(data);
      setSession(sess);
    }
    loadData();
  }, []);

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

  const managers = employees.filter((emp) => ["Manager", "Director"].includes(emp.position));

  const isAdmin = session?.role === "ADMIN";
  const isSeniorStaff = currentEmployee?.position === "Senior Staff";

  const canApprove = (request: LeaveRequest) => {
    if (isAdmin) return true;
    if (request.approverId === session?.employeeId) return true;
    return false;
  };

  const canActOn = (request: LeaveRequest) => {
    if (!canApprove(request)) return false;
    if (isSeniorStaff && request.status === "PENDING") return true;
    if (["Manager", "Director"].includes(currentEmployee?.position ?? "")) {
      return request.status === "PENDING" || request.status === "CHECKED";
    }
    if (isAdmin) return request.status === "PENDING" || request.status === "CHECKED";
    return false;
  };

  const showActionsColumn = isAdmin || leaveRequests.some(canApprove);

  const handleApprove = (requestId: string) => {
    if (isSeniorStaff) {
      const managerId = selectedManagerId[requestId];
      if (!managerId) return;
      onApprove(requestId, managerId);
    } else {
      onApprove(requestId);
    }
  };

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
                <div>
                  {request.approverId ? getEmployeeName(request.approverId) : "System/Admin"}
                  {request.checkedById && (
                    <div className="text-xs text-blue-600 mt-0.5">
                      Checked by: {getEmployeeName(request.checkedById)}
                    </div>
                  )}
                </div>
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
                  {canActOn(request) ? (
                    <div className="flex items-center justify-end gap-1">
                      {/* Senior Staff: show forward-to-manager flow */}
                      {isSeniorStaff && request.status === "PENDING" ? (
                        <div className="flex items-center gap-1">
                          <Select
                            value={selectedManagerId[request.id] ?? ""}
                            onValueChange={(v) =>
                              setSelectedManagerId((prev) => ({ ...prev, [request.id]: v }))
                            }
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Select Manager">
                                {selectedManagerId[request.id]
                                  ? getEmployeeName(selectedManagerId[request.id])
                                  : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {managers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  disabled={!selectedManagerId[request.id]}
                                />
                              }
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Check & Forward
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Check & Forward to Manager</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  This will mark the request as <strong className="text-blue-600">CHECKED</strong> and forward it to{" "}
                                  <strong className="text-foreground">
                                    {selectedManagerId[request.id] ? getEmployeeName(selectedManagerId[request.id]) : "Manager"}
                                  </strong>{" "}
                                  for final approval.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApprove(request.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Check & Forward
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        /* Manager/Admin: standard approve */
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
                                {request.status === "CHECKED" && (
                                  <span className="block mt-1 text-blue-600">
                                    This request was checked by {getEmployeeName(request.checkedById ?? "")}.
                                  </span>
                                )}
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
                      )}

                      {/* Reject button - always available */}
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
