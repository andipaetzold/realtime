import type { Request } from "express";

export interface Auth {
  canEdit(request: Request): Promise<boolean>;
}
