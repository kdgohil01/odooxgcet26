import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { X, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { updateSalaryStructure, type SalaryStructure, type EnhancedPayrollRecord } from "../../utils/payrollStorage";

interface SalaryStructureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRecord: EnhancedPayrollRecord | null;
  onUpdate: () => void;
}

export function SalaryStructureDialog({ isOpen, onClose, payrollRecord, onUpdate }: SalaryStructureDialogProps) {
  const [formData, setFormData] = useState({
    basic: 0,
    housing: 0,
    transport: 0,
    medical: 0,
    other: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when payroll record changes
  useState(() => {
    if (payrollRecord) {
      setFormData(payrollRecord.salaryStructure);
    }
  }, [payrollRecord]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.basic <= 0) {
      newErrors.basic = 'Basic salary must be greater than 0';
    }
    
    if (formData.housing < 0) {
      newErrors.housing = 'Housing allowance cannot be negative';
    }
    
    if (formData.transport < 0) {
      newErrors.transport = 'Transport allowance cannot be negative';
    }
    
    if (formData.medical < 0) {
      newErrors.medical = 'Medical allowance cannot be negative';
    }
    
    if (formData.other < 0) {
      newErrors.other = 'Other allowance cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!payrollRecord) {
      toast.error('No employee selected');
      return;
    }
    
    const success = updateSalaryStructure(payrollRecord.employeeId, {
      basic: formData.basic,
      housing: formData.housing,
      transport: formData.transport,
      medical: formData.medical,
      other: formData.other
    });
    
    if (success) {
      toast.success('Salary structure updated successfully');
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to update salary structure');
    }
  };

  const totalGross = formData.basic + formData.housing + formData.transport + formData.medical + formData.other;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Salary Structure Management
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {payrollRecord && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">Employee</p>
                <p className="text-muted-foreground">{payrollRecord.employee}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Department</p>
                <p className="text-muted-foreground">{payrollRecord.department}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Position</p>
                <p className="text-muted-foreground">{payrollRecord.position}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-muted-foreground">{payrollRecord.email}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="basic">Basic Salary</Label>
                <Input
                  id="basic"
                  type="number"
                  value={formData.basic}
                  onChange={(e) => setFormData({ ...formData, basic: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className={errors.basic ? 'border-red-500' : ''}
                />
                {errors.basic && (
                  <p className="text-sm text-red-500 mt-1">{errors.basic}</p>
                )}
              </div>

              <div>
                <Label htmlFor="housing">Housing Allowance</Label>
                <Input
                  id="housing"
                  type="number"
                  value={formData.housing}
                  onChange={(e) => setFormData({ ...formData, housing: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className={errors.housing ? 'border-red-500' : ''}
                />
                {errors.housing && (
                  <p className="text-sm text-red-500 mt-1">{errors.housing}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transport">Transport Allowance</Label>
                <Input
                  id="transport"
                  type="number"
                  value={formData.transport}
                  onChange={(e) => setFormData({ ...formData, transport: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className={errors.transport ? 'border-red-500' : ''}
                />
                {errors.transport && (
                  <p className="text-sm text-red-500 mt-1">{errors.transport}</p>
                )}
              </div>

              <div>
                <Label htmlFor="medical">Medical Allowance</Label>
                <Input
                  id="medical"
                  type="number"
                  value={formData.medical}
                  onChange={(e) => setFormData({ ...formData, medical: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className={errors.medical ? 'border-red-500' : ''}
                />
                {errors.medical && (
                  <p className="text-sm text-red-500 mt-1">{errors.medical}</p>
                )}
              </div>

              <div>
                <Label htmlFor="other">Other Allowance</Label>
                <Input
                  id="other"
                  type="number"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className={errors.other ? 'border-red-500' : ''}
                />
                {errors.other && (
                  <p className="text-sm text-red-500 mt-1">{errors.other}</p>
                )}
              </div>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Gross Salary
              </h3>
              <span className="text-2xl font-bold text-primary">
                ${totalGross.toFixed(2)}
              </span>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!payrollRecord}
            >
              Update Salary Structure
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
