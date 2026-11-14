export interface ValidationResult {
  valid: boolean;
  isValid?: boolean;
  errors: string[];
  warnings?: string[];
  metrics?: Record<string, unknown>;
}

export interface Validator<Input, Output> {
  validate(input: Input, output: Output, expected?: unknown): ValidationResult;
}
