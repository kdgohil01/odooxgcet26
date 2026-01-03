import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { 
  getEmployeeProfile, 
  setEmployeeProfile, 
  updatePersonalInfo, 
  updateEmploymentInfo, 
  updateEmergencyContact,
  type EmployeeProfile 
} from "../../utils/profileStorage";
import { useProfileContext } from "../../context/ProfileContext";

export function EmployeeProfile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [formData, setFormData] = useState<EmployeeProfile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { updateProfile: updateProfileContext } = useProfileContext();

  // Initialize profile with current user data on component mount
  useEffect(() => {
    if (currentUser) {
      // Try to get existing profile first
      const existingProfile = getEmployeeProfile();
      
      // Check if the existing profile belongs to the current user
      if (existingProfile && existingProfile.employmentInfo.employeeId === currentUser.employeeId) {
        setProfile(existingProfile);
        setFormData(existingProfile);
      } else {
        // Create new profile based on current user data
        const newProfile: EmployeeProfile = {
          personalInfo: {
            firstName: extractFirstNameFromEmail(currentUser.email),
            lastName: extractLastNameFromEmail(currentUser.email),
            email: currentUser.email,
            phone: "+1 (555) 000-0000", // Default phone
            address: "Address not set" // Default address
          },
          employmentInfo: {
            employeeId: currentUser.employeeId,
            department: currentUser.role === 'HR' ? 'Human Resources' : 'General',
            position: currentUser.role === 'HR' ? 'HR Manager' : 'Employee',
            joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            reportingTo: currentUser.role === 'HR' ? 'Management' : 'HR Manager'
          },
          emergencyContact: {
            name: "Emergency Contact",
            relationship: "Contact",
            phone: "+1 (555) 000-0000"
          }
        };
        
        setProfile(newProfile);
        setFormData(newProfile);
        setEmployeeProfile(newProfile); // Save the new profile
      }
    }
  }, [currentUser]);

  // Helper functions to extract name from email
  const extractFirstNameFromEmail = (email: string): string => {
    const namePart = email.split('@')[0];
    const parts = namePart.split(/[._-]/); // Split on common separators
    
    if (parts.length > 0) {
      const firstName = parts[0].replace(/[^a-zA-Z]/g, ''); // Remove non-letters
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    return 'User';
  };

  const extractLastNameFromEmail = (email: string): string => {
    const namePart = email.split('@')[0];
    const parts = namePart.split(/[._-]/); // Split on common separators
    
    if (parts.length > 1) {
      const lastName = parts[parts.length - 1].replace(/[^a-zA-Z]/g, ''); // Remove non-letters
      return lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    }
    return ''; // No last name found
  };

  const handleDownload = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Validate form data before saving
      if (!formData) return;
      
      // Basic validation
      const errors = [];
      
      if (!formData.personalInfo.firstName.trim()) {
        errors.push("First name is required");
      }
      if (!formData.personalInfo.lastName.trim()) {
        errors.push("Last name is required");
      }
      if (!formData.personalInfo.email.trim()) {
        errors.push("Email is required");
      } else if (!formData.personalInfo.email.includes("@")) {
        errors.push("Please enter a valid email address");
      }
      if (!formData.employmentInfo.position.trim()) {
        errors.push("Position is required");
      }
      if (!formData.employmentInfo.department.trim()) {
        errors.push("Department is required");
      }
      
      if (errors.length > 0) {
        toast.error(errors.join(", "));
        return;
      }
      
      // Save changes
      if (hasChanges) {
        setEmployeeProfile(formData);
        updateProfileContext(formData);
        toast.success("Profile updated successfully");
        setProfile(formData);
        setHasChanges(false);
      }
      setIsEditing(false);
    } else {
      // Start editing
      setIsEditing(true);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
      setHasChanges(false);
    }
    setIsEditing(false);
  };

  const handleInputChange = (section: keyof EmployeeProfile, field: string, value: string) => {
    if (!formData) return;
    
    const updatedFormData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    
    setFormData(updatedFormData);
    setHasChanges(true);
  };

  const renderEditableField = (
    section: keyof EmployeeProfile,
    field: string,
    value: string,
    icon: React.ReactNode,
    label: string,
    type: "text" | "email" | "tel" = "text"
  ) => {
    if (!isEditing || !formData) {
      return (
        <div>
          <Label className="text-muted-foreground">{label}</Label>
          <div className="flex items-center gap-2 mt-2">
            {icon}
            <p className="text-foreground">{value}</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <Label className="text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2 mt-2">
          {icon}
          <Input
            type={type}
            value={formData[section][field as keyof typeof formData[typeof section]]}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    );
  };

  if (!profile || !formData) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl">
            {profile.personalInfo.firstName.charAt(0)}{profile.personalInfo.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl text-foreground">
              {profile.personalInfo.firstName} {profile.personalInfo.lastName}
            </h2>
            <p className="text-muted-foreground mt-1">{profile.employmentInfo.position}</p>
            <div className="flex gap-2 mt-3">
              <Badge>Full-time</Badge>
              <Badge variant="secondary">{profile.employmentInfo.department}</Badge>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing && hasChanges && (
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button 
              variant={isEditing && hasChanges ? "default" : "outline"} 
              onClick={handleEditToggle}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="mb-6 text-foreground">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderEditableField(
                "personalInfo",
                "firstName",
                formData.personalInfo.firstName,
                <User className="w-4 h-4 text-muted-foreground" />,
                "First Name"
              )}
              {renderEditableField(
                "personalInfo",
                "lastName",
                formData.personalInfo.lastName,
                <User className="w-4 h-4 text-muted-foreground" />,
                "Last Name"
              )}
            </div>
            
            {renderEditableField(
              "personalInfo",
              "email",
              formData.personalInfo.email,
              <Mail className="w-4 h-4 text-muted-foreground" />,
              "Email Address",
              "email"
            )}
            
            {renderEditableField(
              "personalInfo",
              "phone",
              formData.personalInfo.phone,
              <Phone className="w-4 h-4 text-muted-foreground" />,
              "Phone Number",
              "tel"
            )}
            
            {renderEditableField(
              "personalInfo",
              "address",
              formData.personalInfo.address,
              <MapPin className="w-4 h-4 text-muted-foreground" />,
              "Address"
            )}
          </div>
        </Card>

        {/* Employment Details */}
        <Card className="p-6">
          <h3 className="mb-6 text-foreground">Employment Details</h3>
          <div className="space-y-4">
            {renderEditableField(
              "employmentInfo",
              "employeeId",
              formData.employmentInfo.employeeId,
              <Briefcase className="w-4 h-4 text-muted-foreground" />,
              "Employee ID"
            )}
            
            {renderEditableField(
              "employmentInfo",
              "department",
              formData.employmentInfo.department,
              <Briefcase className="w-4 h-4 text-muted-foreground" />,
              "Department"
            )}
            
            {renderEditableField(
              "employmentInfo",
              "position",
              formData.employmentInfo.position,
              <Briefcase className="w-4 h-4 text-muted-foreground" />,
              "Position"
            )}
            
            {renderEditableField(
              "employmentInfo",
              "joinDate",
              formData.employmentInfo.joinDate,
              <Calendar className="w-4 h-4 text-muted-foreground" />,
              "Join Date"
            )}
            
            {renderEditableField(
              "employmentInfo",
              "reportingTo",
              formData.employmentInfo.reportingTo,
              <User className="w-4 h-4 text-muted-foreground" />,
              "Reporting To"
            )}
          </div>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card className="p-6">
        <h3 className="mb-6 text-foreground">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderEditableField(
            "emergencyContact",
            "name",
            formData.emergencyContact.name,
            <User className="w-4 h-4 text-muted-foreground" />,
            "Contact Name"
          )}
          
          {renderEditableField(
            "emergencyContact",
            "relationship",
            formData.emergencyContact.relationship,
            <User className="w-4 h-4 text-muted-foreground" />,
            "Relationship"
          )}
          
          {renderEditableField(
            "emergencyContact",
            "phone",
            formData.emergencyContact.phone,
            <Phone className="w-4 h-4 text-muted-foreground" />,
            "Phone Number",
            "tel"
          )}
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