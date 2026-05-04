"use client";
/* eslint-disable react-hooks/incompatible-library */

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type EmployeeTableRow = {
  id: string;
  employeeCode: string;
  fullName: string;
  position: string | null;
  department: string | null;
  isClaimed: boolean;
  claimedEmail: string | null;
  tempPasswordExpiresAt: string | null;
};

const columns: ColumnDef<EmployeeTableRow>[] = [
  {
    accessorKey: "employeeCode",
    header: "Employee code",
    cell: ({ row }) => (
      <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">
        {row.original.employeeCode}
      </code>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Full name",
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => row.original.position || "-",
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => row.original.department || "-",
  },
  {
    id: "claimed",
    header: "Status",
    cell: ({ row }) =>
      row.original.isClaimed ? (
        <Badge variant="secondary">Claimed</Badge>
      ) : (
        <Badge variant="outline">Waiting</Badge>
      ),
  },
  {
    id: "claimOwner",
    header: "Claimed by",
    cell: ({ row }) => row.original.claimedEmail || "-",
  },
  {
    id: "expiresAt",
    header: "Temp password expiry",
    cell: ({ row }) => {
      if (!row.original.tempPasswordExpiresAt) {
        return "Not set";
      }

      return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(row.original.tempPasswordExpiresAt));
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/admin/employees/${row.original.id}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}
      >
        Edit
      </Link>
    ),
  },
];

export function EmployeesTable({ data }: { data: EmployeeTableRow[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-12 font-medium text-foreground">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="bg-background">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                ยังไม่มีข้อมูลพนักงาน
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
