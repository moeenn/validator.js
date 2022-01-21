/**
 *  data types i.e. interfaces
 *
 */
export interface ValidationHandlerArgs {
  input: string;
  validator_value?: string;
}

export type ValidationHandler = (
  details: ValidationHandlerArgs
) => ValidationHandlerResult;

export interface ValidationHandlerResult {
  is_valid: boolean;
  message?: string;
}
