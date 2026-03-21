import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { CameraCapture } from "./CameraCapture";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Send, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface VisitorFormData {
  name: string;
  mobile: string;
  email: string;
  company: string;
  address: string;
  personToMeet: string;
  purpose: string;
}

const employees = [
  { id: "1", name: "John Smith", department: "CEO" },
  { id: "2", name: "Sarah Johnson", department: "HR Manager" },
  { id: "3", name: "Michael Brown", department: "IT Director" },
  { id: "4", name: "Emily Davis", department: "Marketing Head" },
  { id: "5", name: "David Wilson", department: "Operations Manager" },
];

const purposes = [
  "Business Meeting",
  "Interview",
  "Delivery",
  "Maintenance",
  "Personal Visit",
  "Other",
];

export function VisitorRegistration() {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState("");
  const [idProof, setIdProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<VisitorFormData>();

  const personToMeet = watch("personToMeet");
  const purpose = watch("purpose");

  const handlePhotoCapture = (image: string) => {
    setCapturedImage(image);
    toast.success("Visitor photo captured successfully");
  };

  const handleIdProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProof(e.target.files[0]);
      toast.success("ID proof uploaded successfully");
    }
  };

  const onSubmit = async (data: VisitorFormData) => {
    if (!capturedImage) {
      toast.error("Please capture visitor photo");
      return;
    }

    if (!data.personToMeet) {
      toast.error("Please select person to meet");
      return;
    }

    if (!data.purpose) {
      toast.error("Please select purpose of visit");
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const visitor = {
      id: Date.now().toString(),
      ...data,
      photo: capturedImage,
      idProof: idProof?.name || "",
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
    };

    // Save to localStorage
    const visitors = JSON.parse(localStorage.getItem("visitors") || "[]");
    visitors.push(visitor);
    localStorage.setItem("visitors", JSON.stringify(visitors));

    // Mock notification
    toast.success(
      `Visitor registered! Notification sent to ${data.personToMeet}`,
      {
        description: `Email and SMS notification sent successfully`,
      }
    );

    setIsSubmitting(false);

    // Navigate to log after a moment
    setTimeout(() => {
      navigate("/log");
    }, 1000);
  };

  const resetForm = () => {
    setCapturedImage("");
    setIdProof(null);
    setSelectedPerson("");
    setSelectedPurpose("");
    setFormSubmitted(false);
    setValue("name", "");
    setValue("mobile", "");
    setValue("email", "");
    setValue("company", "");
    setValue("address", "");
    setValue("personToMeet", "");
    setValue("purpose", "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
          Register New Visitor
        </h2>
        <p className="text-slate-700 mt-2 text-lg">
          Capture visitor information and photo
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">Visitor Information</CardTitle>
          <CardDescription className="text-slate-600">
            Please fill in all required fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Camera Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visitor Photo *
              </label>
              <CameraCapture
                onCapture={handlePhotoCapture}
                capturedImage={capturedImage}
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <Input
                  {...register("name")}
                  placeholder="Enter full name"
                  className="bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number *
                </label>
                <Input
                  {...register("mobile")}
                  placeholder="Enter mobile number"
                  className="bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Enter email address"
                  className="bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company/Organization
                </label>
                <Input
                  {...register("company")}
                  placeholder="Enter company name"
                  className="bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <Textarea
                {...register("address")}
                placeholder="Enter full address"
                rows={3}
                className="bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
              />
            </div>

            {/* Visit Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Person to Meet *
                </label>
                <Select
                  value={selectedPerson}
                  onValueChange={setSelectedPerson}
                >
                  <SelectTrigger className="bg-white border-violet-200">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.name}>
                        {emp.name} - {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedPerson && formSubmitted && (
                  <p className="text-red-500 text-sm mt-1">Please select a person to meet</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Purpose of Visit *
                </label>
                <Select
                  value={selectedPurpose}
                  onValueChange={setSelectedPurpose}
                >
                  <SelectTrigger className="bg-white border-violet-200">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {purposes.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedPurpose && formSubmitted && (
                  <p className="text-red-500 text-sm mt-1">Please select purpose of visit</p>
                )}
              </div>
            </div>

            {/* ID Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ID Proof (Optional)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdProofUpload}
                  className="bg-white border-violet-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-violet-600 file:to-purple-600 file:text-white hover:file:from-violet-700 hover:file:to-purple-700"
                />
                {idProof && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="size-4" />
                    <span>Uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="size-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Register Visitor
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <XCircle className="size-4 mr-2" />
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}