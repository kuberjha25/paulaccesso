import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { CameraCapture } from "./CameraCapture";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useApp } from "./context/AppContext";
import { CheckCircle2, XCircle, Plus, Search, ChevronDown } from "lucide-react";

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
    personToMeetEmpId: "",
    purpose: "",
    otherPurpose: "",
    idType: "",
    idNumber: "",
  });
  const [selectedEmployeeEmpId, setSelectedEmployeeEmpId] = useState("");
  const [errors, setErrors] = useState({});

  // State for custom searchable dropdown (Person to Meet)
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const employeeDropdownRef = useRef(null);

  // State for Purpose dropdown
  const [isPurposeDropdownOpen, setIsPurposeDropdownOpen] = useState(false);
  const purposeDropdownRef = useRef(null);

  // State for ID Type dropdown
  const [isIdTypeDropdownOpen, setIsIdTypeDropdownOpen] = useState(false);
  const idTypeDropdownRef = useRef(null);

  // Sort employees A to Z by name
  const sortedEmployees = [...employees].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Filter employees based on search term
  const filteredEmployees = sortedEmployees.filter((emp) => {
    const searchLower = employeeSearchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(searchLower) ||
      emp.empId.toLowerCase().includes(searchLower) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchLower))
    );
  });

  // Handle click outside for Employee dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click outside for Purpose dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        purposeDropdownRef.current &&
        !purposeDropdownRef.current.contains(event.target)
      ) {
        setIsPurposeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click outside for ID Type dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        idTypeDropdownRef.current &&
        !idTypeDropdownRef.current.contains(event.target)
      ) {
        setIsIdTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeEmpId(empId);
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
    if (errors.personToMeetEmpId) {
      setErrors({ ...errors, personToMeetEmpId: "" });
    }
  };

  const handleSelectPurpose = (purpose) => {
    setFormData({
      ...formData,
      purpose: purpose,
      otherPurpose: purpose === "Other" ? formData.otherPurpose : "",
    });
    setIsPurposeDropdownOpen(false);
    if (errors.purpose) {
      setErrors({ ...errors, purpose: "" });
    }
  };

  const handleSelectIdType = (idType) => {
    setFormData({ ...formData, idType: idType });
    setIsIdTypeDropdownOpen(false);
    if (errors.idType) {
      setErrors({ ...errors, idType: "" });
    }
  };

  const getSelectedEmployeeName = () => {
    const employee = employees.find(
      (emp) => emp.empId === selectedEmployeeEmpId,
    );
    if (employee) {
      return `${employee.name} - ${employee.empId}${employee.designation ? ` (${employee.designation})` : ""}`;
    }
    return "";
  };

  const purposeOptions = [
    "Business Meeting",
    "Interview",
    "Client Visit",
    "Delivery",
    "Service Call",
    "Personal Visit",
    "Other",
  ];

  const idProofOptions = [
    "Aadhar Card",
    "PAN Card",
    "Driving License",
    "Passport",
    "Voter ID",
    "Company ID",
    "Other",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.mobile) newErrors.mobile = "Mobile is required";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!selectedEmployeeEmpId)
      newErrors.personToMeetEmpId = "Please select person to meet";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (formData.purpose === "Other" && !formData.otherPurpose)
      newErrors.otherPurpose = "Please specify purpose";
    if (!capturedImage) newErrors.photo = "Photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalPurpose =
      formData.purpose === "Other" ? formData.otherPurpose : formData.purpose;

    let idProofData = null;
    if (formData.idType) {
      idProofData = {
        type: formData.idType,
        number: formData.idNumber || "",
        photo: capturedIdProof || null,
      };
    }

    const visitorData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email || "",
      company: formData.company || "",
      address: formData.address || "",
      personToMeetEmpId: selectedEmployeeEmpId,
      purpose: finalPurpose,
      photo: capturedImage,
      idProof: idProofData ? JSON.stringify(idProofData) : null,
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
      personToMeetEmpId: "",
      purpose: "",
      otherPurpose: "",
      idType: "",
      idNumber: "",
    });
    setSelectedEmployeeEmpId("");
    setCapturedImage("");
    setCapturedIdProof("");
    setErrors({});
    setEmployeeSearchTerm("");
    setIsEmployeeDropdownOpen(false);
    setIsPurposeDropdownOpen(false);
    setIsIdTypeDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-blue-600">
          Register New Visitor
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Capture visitor information and photo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Information</CardTitle>
          <CardDescription>
            Please fill in all required fields (
            <span className="text-red-500">*</span> = required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="mb-2 block">
                Visitor Photo <span className="text-red-500">*</span>
              </Label>
              <CameraCapture
                onCapture={setCapturedImage}
                capturedImage={capturedImage}
              />
              {errors.photo && (
                <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label className="mb-2 block">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>
              <div>
                <Label className="mb-2 block">
                  Email Address
                  <span className="text-gray-400 text-sm ml-1">(Optional)</span>
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email (optional)"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Email is optional, but recommended for updates
                </p>
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

            {/* Person to Meet - Searchable Dropdown */}
            <div>
              <Label className="mb-2 block">
                Person to Meet <span className="text-red-500">*</span>
              </Label>
              <div className="relative" ref={employeeDropdownRef}>
                <div
                  className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() =>
                    setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)
                  }
                >
                  <span
                    className={selectedEmployeeEmpId ? "" : "text-gray-400"}
                  >
                    {selectedEmployeeEmpId
                      ? getSelectedEmployeeName()
                      : "Select employee"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>

                {isEmployeeDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search by name, ID, or designation..."
                          value={employeeSearchTerm}
                          onChange={(e) =>
                            setEmployeeSearchTerm(e.target.value)
                          }
                          className="pl-8"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => handleSelectEmployee(emp.empId)}
                          >
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-gray-500">
                              {emp.empId}{" "}
                              {emp.designation && `• ${emp.designation}`}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-500">
                          No employees found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.personToMeetEmpId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.personToMeetEmpId}
                </p>
              )}
            </div>

            {/* Purpose of Visit - Non-searchable Dropdown */}
            <div>
              <Label className="mb-2 block">
                Purpose of Visit <span className="text-red-500">*</span>
              </Label>
              <div className="relative" ref={purposeDropdownRef}>
                <div
                  className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() =>
                    setIsPurposeDropdownOpen(!isPurposeDropdownOpen)
                  }
                >
                  <span className={formData.purpose ? "" : "text-gray-400"}>
                    {formData.purpose || "Select purpose"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>

                {isPurposeDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {purposeOptions.map((option) => (
                      <div
                        key={option}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleSelectPurpose(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.purpose && (
                <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
              )}

              {formData.purpose === "Other" && (
                <div className="mt-2">
                  <Input
                    name="otherPurpose"
                    value={formData.otherPurpose}
                    onChange={handleChange}
                    placeholder="Please specify purpose"
                    className="mt-1"
                  />
                  {errors.otherPurpose && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.otherPurpose}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-500" />
                  ID Proof (Optional)
                </h3>
                <p className="text-sm text-gray-500">
                  Add ID proof for verification
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">ID Type</Label>
                  <div className="relative" ref={idTypeDropdownRef}>
                    <div
                      className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-white dark:bg-gray-800"
                      onClick={() =>
                        setIsIdTypeDropdownOpen(!isIdTypeDropdownOpen)
                      }
                    >
                      <span className={formData.idType ? "" : "text-gray-400"}>
                        {formData.idType || "Select ID type (optional)"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>

                    {isIdTypeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {idProofOptions.map((option) => (
                          <div
                            key={option}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => handleSelectIdType(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

              {formData.idType && (
                <div className="mt-4">
                  <Label className="mb-2 block">
                    ID Proof Photo (Optional)
                  </Label>
                  <CameraCapture
                    onCapture={setCapturedIdProof}
                    capturedImage={capturedIdProof}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload photo of ID proof for verification
                  </p>
                </div>
              )}
            </div>

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
