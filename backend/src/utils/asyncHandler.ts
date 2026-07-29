import type { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Express doesn't forward rejected promises from async handlers to error
// middleware on its own — wrap every controller with this so thrown/rejected
// errors reach errorHandler instead of hanging the request.
export function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
