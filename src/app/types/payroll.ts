export interface PayrollRecord {
  id: number;
  employee: string;
  department: string;
  position: string;
  gross: number;
  deductions: number;
  net: number;
  status: string;
}
