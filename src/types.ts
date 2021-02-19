export interface ValidationDetail {
  error: string,
  handler(value: string): boolean,
}
