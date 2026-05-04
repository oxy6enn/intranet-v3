import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type PermissionRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  assignedUsers: number;
};

export function PermissionsTable({ data }: { data: PermissionRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assigned users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((permission) => (
              <TableRow key={permission.id} className="bg-background">
                <TableCell>
                  <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">
                    {permission.code}
                  </code>
                </TableCell>
                <TableCell>{permission.name}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {permission.description || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{permission.assignedUsers}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                ยังไม่มี permission ในระบบ
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
