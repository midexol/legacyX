import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type Target = "body" | "params" | "query";

export function validate(schema: ZodTypeAny, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    req[target] = schema.parse(req[target]);
    next();
  };
}
