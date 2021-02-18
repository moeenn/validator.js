export interface ValidationDetail {
  selector: string,
  error: string,
  handler(value: string): boolean,
}
