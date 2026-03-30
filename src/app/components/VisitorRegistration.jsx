import { useState } from "react";
import { useNavigate } from "react-router";
import { CameraCapture } from "./CameraCapture";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useApp } from "./context/AppContext";
import { CheckCircle2, XCircle, Plus, Minus } from "lucide-react";

export function VisitorRegistration() {
  const navigate = useNavigate();
  const { registerVisitor, employees, loading } = useApp();
  const [capturedImage, setCapturedImage] = useState("");
  const [capturedIdProof, setCapturedIdProof] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    company: "",
    address: "",
    personToMeet: "",
    purpose: "",
    otherPurpose: "", // For "Other" option
    idType: "",
    idNumber: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [errors, setErrors] = useState({});

  // Predefined purpose options
  const purposeOptions = [
    "Business Meeting",
    "Interview",
    "Client Visit",
    "Delivery",
    "Service Call",
    "Personal Visit",
    "Other"
  ];

  // ID Proof options
  const idProofOptions = [
    "Aadhar Card",
    "PAN Card",
    "Driving License",
    "Passport",
    "Voter ID",
    "Company ID",
    "Other"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handlePurposeChange = (value) => {
    setFormData({ ...formData, purpose: value, otherPurpose: value === "Other" ? formData.otherPurpose : "" });
    if (errors.purpose) setErrors({ ...errors, purpose: "" });
  };

  const handleIdTypeChange = (value) => {
    setFormData({ ...formData, idType: value });
    if (errors.idType) setErrors({ ...errors, idType: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.mobile) newErrors.mobile = "Mobile is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!selectedEmployee) newErrors.personToMeet = "Please select person to meet";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (formData.purpose === "Other" && !formData.otherPurpose) newErrors.otherPurpose = "Please specify purpose";
    if (!capturedImage) newErrors.photo = "Photo is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare final purpose
    const finalPurpose = formData.purpose === "Other" ? formData.otherPurpose : formData.purpose;
    
    // Prepare ID proof (optional)
    let idProofData = null;
    if (formData.idType) {
      idProofData = {
        type: formData.idType,
        number: formData.idNumber || "",
        photo: capturedIdProof || null
      };
    }

    const visitorData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      company: formData.company || "",
      address: formData.address || "",
      personToMeet: selectedEmployee,
      purpose: finalPurpose,
      photo: capturedImage,
      idProof: idProofData ? JSON.stringify(idProofData) : null, // Store as JSON string
    };

    const result = await registerVisitor(visitorData);
    if (result) {
      setTimeout(() => navigate("/log"), 1500);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      email: "",
      company: "",
      address: "",
      personToMeet: "",
      purpose: "",
      otherPurpose: "",
      idType: "",
      idNumber: "",
    });
    setSelectedEmployee("");
    setCapturedImage("");
    setCapturedIdProof("");
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-blue-600">Register New Visitor</h2>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Capture visitor information and photo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Information</CardTitle>
          <CardDescription>Please fill in all required fields</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visitor Photo */}
            <div>
              <Label className="mb-2 block">Visitor Photo *</Label>
              <CameraCapture onCapture={setCapturedImage} capturedImage={capturedImage} />
              {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Full Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Mobile Number *</Label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Email Address *</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Company</Label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name (optional)"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label className="mb-2 block">Address</Label>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Full address (optional)"
              />
            </div>

            {/* Person to Meet */}
            <div>
              <Label className="mb-2 block">Person to Meet *</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.email}>
                      {emp.name} - {emp.designation || "Employee"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.personToMeet && <p className="text-red-500 text-sm mt-1">{errors.personToMeet}</p>}
            </div>

            {/* Purpose of Visit - Dropdown */}
            <div>
              <Label className="mb-2 block">Purpose of Visit *</Label>
              <Select value={formData.purpose} onValueChange={handlePurposeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {purposeOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
              
              {/* Other Purpose Input */}
              {formData.purpose === "Other" && (
                <div className="mt-2">
                  <Input
                    name="otherPurpose"
                    value={formData.otherPurpose}
                    onChange={handleChange}
                    placeholder="Please specify purpose"
                    className="mt-1"
                  />
                  {errors.otherPurpose && <p className="text-red-500 text-sm mt-1">{errors.otherPurpose}</p>}
                </div>
              )}
            </div>

            {/* ID Proof Section - Optional */}
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-500" />
                  ID Proof (Optional)
                </h3>
                <p className="text-sm text-gray-500">Add ID proof for verification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">ID Type</Label>
                  <Select value={formData.idType} onValueChange={handleIdTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {idProofOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">ID Number</Label>
                  <Input
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Enter ID number (optional)"
                  />
                </div>
              </div>

              {/* ID Proof Photo Capture (Optional) */}
              {formData.idType && (
                <div className="mt-4">
                  <Label className="mb-2 block">ID Proof Photo (Optional)</Label>
                  <CameraCapture onCapture={setCapturedIdProof} capturedImage={capturedIdProof} />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload photo of ID proof for verification
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  "Registering..."
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Register Visitor
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <XCircle className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}