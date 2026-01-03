import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card } from "../ui/card";
import { Calendar, Mail, Phone, MapPin, Briefcase, DollarSign, Award } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  status: string;
  salary?: number;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  performance?: {
    rating: number;
    lastReview: string;
  };
}

interface EmployeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeDetailDialog({ open, onOpenChange, employee }: EmployeeDetailDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Complete information for {employee.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{employee.name}</h3>
                  <p className="text-muted-foreground">{employee.position}</p>
                  <Badge className="mt-2 bg-green-50 text-green-700 border-green-200">
                    {employee.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="text-foreground">{employee.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">{employee.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Join Date</p>
                    <p className="text-foreground">{employee.joinDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {employee.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="text-foreground">${employee.salary.toLocaleString()}/year</p>
                    </div>
                  </div>
                )}
                
                {employee.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">{employee.address}</p>
                    </div>
                  </div>
                )}
                
                {employee.emergencyContact && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="text-foreground">{employee.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Skills */}
          {employee.skills && employee.skills.length > 0 && (
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Skills & Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Performance */}
          {employee.performance && (
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Performance Review</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Rating</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded ${
                          i < employee.performance!.rating
                            ? 'bg-yellow-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm">{employee.performance.rating}/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Review</span>
                  <span className="text-sm">{employee.performance.lastReview}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              Edit Employee
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
