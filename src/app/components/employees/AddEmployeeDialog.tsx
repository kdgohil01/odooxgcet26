import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { type Employee } from "../../utils/employeeStorage";
import { validateNotPastDate, validateFutureDate, getMinDate, getMaxDate } from "../../utils/dateValidation";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded?: (employee: Omit<Employee, 'id'>) => void;
}

export function AddEmployeeDialog({ open, onOpenChange, onEmployeeAdded }: AddEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    startDate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle start date change with validation
  const handleStartDateChange = (value: string) => {
    if (value) {
      // Validate not past date
      const pastValidation = validateNotPastDate(value, "Start date");
      if (!pastValidation.isValid) {
        toast.error(pastValidation.errorMessage);
        return;
      }

      // Validate not too far in future
      const futureValidation = validateFutureDate(value, 6, "Start date");
      if (!futureValidation.isValid) {
        toast.error(futureValidation.errorMessage);
        return;
      }
    }
    handleInputChange("startDate", value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.position) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate start date
    if (!formData.startDate) {
      toast.error("Please select a start date");
      return;
    }

    // Validate start date using utility functions
    const pastValidation = validateNotPastDate(formData.startDate, "Start date");
    if (!pastValidation.isValid) {
      toast.error(pastValidation.errorMessage);
      return;
    }

    const futureValidation = validateFutureDate(formData.startDate, 6, "Start date");
    if (!futureValidation.isValid) {
      toast.error(futureValidation.errorMessage);
      return;
    }

    // Create new employee object without ID (will be added by storage utility)
    const newEmployee: Omit<Employee, 'id'> = {
      name: `${formData.firstName} ${formData.lastName}`,
      department: formData.department,
      position: formData.position,
      email: formData.email,
      phone: formData.phone || "Not provided",
      joinDate: formData.startDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: "active",
      salary: 45000, // Default salary
      address: "TBD",
      emergencyContact: "TBD",
      skills: [],
      performance: {
        rating: 3,
        lastReview: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      }
    };

    // Call the callback to add the employee
    if (onEmployeeAdded) {
      onEmployeeAdded(newEmployee);
    }

    // Show success message
    toast.success(`Employee ${newEmployee.name} has been added successfully!`);

    // Reset form and close dialog
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      startDate: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the employee details below to add a new team member.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              placeholder="Enter job position"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              min={getMinDate(false)} // Prevent past dates
              max={getMaxDate(6)} // Prevent dates more than 6 months in future
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
