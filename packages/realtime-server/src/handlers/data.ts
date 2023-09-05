import type { Request, Response } from "express";
import pkg from "fast-json-patch";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import type { Store } from "../types.js";

const { validate } = pkg;

export function handleGETData(
  req: Request<ParamsDictionary, any, any, { path?: string }, { store: Store }>,
  res: Response
) {
  const path = String(req.query.path ?? "/");
  if (!path.startsWith("/")) {
    res.sendStatus(400);
    return;
  }

  const data = req.app.locals["store"].get(path) ?? null;
  res.status(200).json(data);
}

export function handlePUTData(
  req: Request<ParamsDictionary, any, any, { path?: string }, { store: Store }>,
  res: Response
) {
  const path = String(req.query.path ?? "/");
  if (!path.startsWith("/")) {
    res.sendStatus(400);
    return;
  }

  const value = req.body;
  req.app.locals["store"].set(path, value ?? null);
  res.sendStatus(204);
}

export function handlePATCHData(
  req: Request<ParamsDictionary, any, any, Query, { store: Store }>,
  res: Response
) {
  if (validate(req.body) instanceof Error) {
    res.sendStatus(400);
    return;
  }

  req.app.locals["store"].patch(req.body);
  res.sendStatus(204);
}

export function handleDELETEData(
  req: Request<ParamsDictionary, any, any, { path?: string }, { store: Store }>,
  res: Response
) {
  const path = String(req.query.path ?? "/");
  if (!path.startsWith("/")) {
    res.sendStatus(400);
    return;
  }

  req.app.locals["store"].set(path, null);
  res.sendStatus(204);
}
