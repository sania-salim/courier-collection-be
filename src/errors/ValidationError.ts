import { ZodError } from "zod";

export type ValidationIssue = {
  path: string;
  message: string;
};

export class ValidationError extends Error {
  statusCode = 400;
  issues: ValidationIssue[];

  constructor(error: ZodError) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }
}
