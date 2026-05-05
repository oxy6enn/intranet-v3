import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { WorkspaceShellData } from "@/lib/workspace-shell-data";

type AdminWorkspaceShellProps = {
  workspace: WorkspaceShellData;
  children: ReactNode;
};

export function AdminWorkspaceShell({
  workspace,
  children,
}: AdminWorkspaceShellProps) {
  return (
    <WorkspaceShell {...workspace} variant="admin">
      {children}
    </WorkspaceShell>
  );
}
