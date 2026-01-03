import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Download, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner";

export function PayrollView() {
  const handleDownloadPayslip = (period?: string) => {
    if (period) {
      toast.success(`Downloading payslip for ${period}...`);
    } else {
      toast.success("Downloading current payslip...");
    }
  };

  const handleDownloadTaxDoc = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
  };

  const currentPayroll = {
    period: "December 2025",
    payDate: "December 28, 2025",
    grossSalary: 6000,
    deductions: {
      tax: 900,
      insurance: 250,
      pension: 300,
      other: 50,
    },
    netSalary: 4500,
  };

  const payrollHistory = [
    { period: "November 2025", payDate: "Nov 28, 2025", gross: 6000, deductions: 1500, net: 4500 },
    { period: "October 2025", payDate: "Oct 28, 2025", gross: 6000, deductions: 1500, net: 4500 },
    { period: "September 2025", payDate: "Sep 28, 2025", gross: 6000, deductions: 1500, net: 4500 },
    { period: "August 2025", payDate: "Aug 28, 2025", gross: 6000, deductions: 1500, net: 4500 },
  ];

  const ytdSummary = {
    totalGross: 72000,
    totalDeductions: 18000,
    totalNet: 54000,
    avgMonthly: 4500,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Current Payroll */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground">Current Payroll</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {currentPayroll.period} • Paid on {currentPayroll.payDate}
            </p>
          </div>
          <Button variant="outline" onClick={() => handleDownloadPayslip()}>
            <Download className="w-4 h-4 mr-2" />
            Download Payslip
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Gross Salary</p>
            <p className="text-2xl text-foreground mt-2">
              ${currentPayroll.grossSalary.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl text-foreground mt-2">
              ${Object.values(currentPayroll.deductions).reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded">
            <p className="text-sm text-primary">Net Salary</p>
            <p className="text-2xl text-primary mt-2">
              ${currentPayroll.netSalary.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm text-muted-foreground mb-4">Deduction Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Income Tax</p>
              <p className="text-foreground mt-1">${currentPayroll.deductions.tax}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Health Insurance</p>
              <p className="text-foreground mt-1">${currentPayroll.deductions.insurance}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pension</p>
              <p className="text-foreground mt-1">${currentPayroll.deductions.pension}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Other</p>
              <p className="text-foreground mt-1">${currentPayroll.deductions.other}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* YTD Summary */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Year-to-Date Summary (2025)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Gross</p>
            <p className="text-2xl text-foreground mt-2">
              ${ytdSummary.totalGross.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl text-foreground mt-2">
              ${ytdSummary.totalDeductions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Net</p>
            <p className="text-2xl text-primary mt-2">
              ${ytdSummary.totalNet.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Monthly</p>
            <p className="text-2xl text-foreground mt-2">
              ${ytdSummary.avgMonthly.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Payroll History */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Payroll History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead>Gross Salary</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollHistory.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.period}</TableCell>
                <TableCell>{record.payDate}</TableCell>
                <TableCell>${record.gross.toLocaleString()}</TableCell>
                <TableCell>${record.deductions.toLocaleString()}</TableCell>
                <TableCell>${record.net.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(record.period)}>
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Tax Documents */}
      <Card className="p-6">
        <h3 className="mb-4 text-foreground">Tax Documents</h3>
        <div className="space-y-3">
          {[
            { name: "W-2 Form 2025", year: "2025", size: "156 KB" },
            { name: "W-2 Form 2024", year: "2024", size: "148 KB" },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded">
              <div>
                <p className="text-sm text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">Tax Year: {doc.year} • {doc.size}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadTaxDoc(doc.name)}>
                <Download className="w-3 h-3 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}