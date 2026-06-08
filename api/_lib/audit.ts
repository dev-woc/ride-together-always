import { sql } from "./db";

export interface AuditEvent {
  accessorType: "cos_user" | "admin_session";
  accessorId: string;
  accessorEmail?: string;
  action:
    | "view_application"
    | "view_applications_list"
    | "submit_application"
    | "update_application_status";
  resourceType: "cos_application";
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export function logPhiAccess(event: AuditEvent): void {
  // Fire-and-forget — never await this on the response path
  sql`
    INSERT INTO phi_access_log
      (accessor_type, accessor_id, accessor_email, action, resource_type, resource_id, ip_address, user_agent)
    VALUES
      (${event.accessorType}, ${event.accessorId}, ${event.accessorEmail ?? null},
       ${event.action}, ${event.resourceType}, ${event.resourceId ?? null},
       ${event.ipAddress ?? null}, ${event.userAgent ?? null})
  `.catch((err) => console.error("[audit] Failed to write phi_access_log:", err));
}

export function getClientIp(req: Request): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined
  );
}
