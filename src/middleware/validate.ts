import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../errors/ValidationError";

type ValidateSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) throw new ValidationError(result.error);
        req.body = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) throw new ValidationError(result.error);
        req.params = result.data as typeof req.params;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) throw new ValidationError(result.error);
        req.query = result.data as typeof req.query;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
