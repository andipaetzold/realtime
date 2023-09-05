import type { NextFunction, Request, Response } from "express";
import type { OptionsWithDefaults } from "../internal-types.js";

export function auth(options: OptionsWithDefaults) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const canEdit = await options.auth.canEdit(req);

    if (!canEdit) {
      res.sendStatus(403);
      return;
    }

    next();
  };
}
