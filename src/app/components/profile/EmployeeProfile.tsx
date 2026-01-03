import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function EmployeeProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const handleDownload = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      toast.success("Profile updated successfully");
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl">
            JS
          </div>
          <div className="flex-1">
            <h2 className="text-2xl text-foreground">John Smith</h2>
            <p className="text-muted-foreground mt-1">Senior Software Engineer</p>
            <div className="flex gap-2 mt-3">
              <Badge>Full-time</Badge>
              <Badge variant="secondary">Engineering</Badge>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleEditToggle}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="mb-6 text-foreground">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <div className="flex items-center gap-2 mt-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">John Michael Smith</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Email Address</Label>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">john.smith@company.com</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone Number</Label>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">123 Main Street, San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Employment Details */}
        <Card className="p-6">
          <h3 className="mb-6 text-foreground">Employment Details</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Employee ID</Label>
              <div className="flex items-center gap-2 mt-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">EMP-2023-0145</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Department</Label>
              <div className="flex items-center gap-2 mt-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">Engineering</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Position</Label>
              <div className="flex items-center gap-2 mt-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">Senior Software Engineer</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Join Date</Label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">March 15, 2023</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Reporting To</Label>
              <div className="flex items-center gap-2 mt-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground">Sarah Johnson (Engineering Manager)</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card className="p-6">
        <h3 className="mb-6 text-foreground">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-muted-foreground">Contact Name</Label>
            <p className="text-foreground mt-2">Jane Smith</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Relationship</Label>
            <p className="text-foreground mt-2">Spouse</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone Number</Label>
            <p className="text-foreground mt-2">+1 (555) 987-6543</p>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card className="p-6">
        <h3 className="mb-6 text-foreground">Documents</h3>
        <div className="space-y-3">
          {[
            { name: "Employment Contract.pdf", date: "Mar 15, 2023", size: "245 KB" },
            { name: "NDA Agreement.pdf", date: "Mar 15, 2023", size: "128 KB" },
            { name: "Benefits Enrollment.pdf", date: "Apr 1, 2023", size: "312 KB" },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
              <div>
                <p className="text-sm text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.date} • {doc.size}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>Download</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}