export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Validator<Input, Output> {
  validate(input: Input, output: Output): ValidationResult;
}
