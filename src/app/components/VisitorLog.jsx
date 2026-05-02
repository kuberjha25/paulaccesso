import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CameraCapture } from "./CameraCapture";
import {
  Search,
  LogOut,
  Eye,
  Calendar,
  Filter,
  Users,
  Download,
  CalendarDays,
  User,
  FileText,
  CheckCircle,
  Camera,
  Tag,
  Mail,
  Phone,
  Building,
  Clock,
  Calendar as CalendarIcon,
  X,
  Maximize2,
} from "lucide-react";
import { useApp } from "./context/AppContext";

export function VisitorLog() {
  const {
    visitors,
    checkoutVisitor,
    loading,
    assignTagToVisitor,
    fetchAvailableTags,
    token,
    fetchVisitors,
    API_BASE,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [visitorToCheckout, setVisitorToCheckout] = useState(null);
  const [checkoutPhoto, setCheckoutPhoto] = useState("");
  const [showCheckoutCamera, setShowCheckoutCamera] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Image preview states
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageTitle, setPreviewImageTitle] = useState("");

  // Tag assignment states
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [visitorForTag, setVisitorForTag] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [localAvailableTags, setLocalAvailableTags] = useState([]);
  const [isAssigningTag, setIsAssigningTag] = useState(false);

  // Download dialog states
  const [downloadFilters, setDownloadFilters] = useState({
    dateRange: {
      startDate: "",
      endDate: "",
    },
    personToMeet: "all",
    purpose: "all",
    status: "all",
  });
  const [selectedFormat, setSelectedFormat] = useState("csv");

  // Handle image click to open preview
  const handleImageClick = (imageUrl, title) => {
    setPreviewImageUrl(imageUrl);
    setPreviewImageTitle(title);
    setIsImagePreviewOpen(true);
  };

  // Fetch available tags when dialog opens
  useEffect(() => {
    if (showTagDialog) {
      const loadTags = async () => {
        const tags = await fetchAvailableTags();
        setLocalAvailableTags(tags);
      };
      loadTags();
    }
  }, [showTagDialog, fetchAvailableTags]);

  // Get unique persons to meet and purposes for filters
  const uniquePersonsToMeet = [...new Set(visitors.map((v) => v.personToMeet))];
  const uniquePurposes = [...new Set(visitors.map((v) => v.purpose))];

  // First filter visitors, then reverse them (newest/latest first)
  const filteredAndReversedVisitors = visitors
    .filter((v) => {
      const matchesSearch =
        !searchQuery ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.mobile.includes(searchQuery) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.personToMeet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.tagNumber &&
          v.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && v.active) ||
        (statusFilter === "checked-out" && !v.active);

      return matchesSearch && matchesStatus;
    })
    .reverse();

  const handleCheckoutClick = (visitor) => {
    setVisitorToCheckout(visitor);
    setCheckoutPhoto("");
    setShowCheckoutCamera(true);
  };

  const handleConfirmCheckout = async () => {
    if (!visitorToCheckout) return;

    setIsCheckingOut(true);

    try {
      const result = await checkoutVisitor(visitorToCheckout.id, checkoutPhoto);

      if (result) {
        setShowCheckoutCamera(false);
        setVisitorToCheckout(null);
        setCheckoutPhoto("");

        if (selectedVisitor?.id === visitorToCheckout.id) {
          setIsDetailsOpen(false);
          setSelectedVisitor(null);
        }

        await fetchVisitors();
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAssignTag = async () => {
    if (!visitorForTag || !selectedTag) return;

    setIsAssigningTag(true);

    try {
      const result = await assignTagToVisitor(visitorForTag.id, selectedTag);

      if (result) {
        setShowTagDialog(false);
        setVisitorForTag(null);
        setSelectedTag("");

        if (selectedVisitor?.id === visitorForTag.id) {
          setSelectedVisitor(result);
        }

        await fetchVisitors();
      }
    } catch (error) {
      console.error("Tag assignment error:", error);
    } finally {
      setIsAssigningTag(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    // Parse the date string (assuming it's in UTC or already has timezone info)
    const date = new Date(dateString);

    // Format in 24-hour format with IST
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // This ensures 24-hour format
    });
  };

  const formatDateForExport = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn) return "N/A";
    if (!checkOut) return "Active";
    const duration = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getFilteredDataForDownload = () => {
    return visitors.filter((v) => {
      const checkInDate = new Date(v.checkInTime);
      const matchesDateRange =
        (!downloadFilters.dateRange.startDate ||
          checkInDate >= new Date(downloadFilters.dateRange.startDate)) &&
        (!downloadFilters.dateRange.endDate ||
          checkInDate <=
            new Date(downloadFilters.dateRange.endDate + "T23:59:59"));

      const matchesPersonToMeet =
        downloadFilters.personToMeet === "all" ||
        v.personToMeet === downloadFilters.personToMeet;

      const matchesPurpose =
        downloadFilters.purpose === "all" ||
        v.purpose === downloadFilters.purpose;

      const matchesStatus =
        downloadFilters.status === "all" ||
        (downloadFilters.status === "active" && v.active) ||
        (downloadFilters.status === "checked-out" && !v.active);

      return (
        matchesDateRange &&
        matchesPersonToMeet &&
        matchesPurpose &&
        matchesStatus
      );
    });
  };

  const prepareExportData = (dataToExport) => {
    return dataToExport.map((v) => ({
      Name: v.name,
      Mobile: v.mobile,
      Email: v.email,
      Company: v.company || "N/A",
      "Person to Meet": v.personToMeet,
      Purpose: v.purpose,
      "Tag/Pass": v.tagNumber || "Not Assigned",
      "Meeting Status": v.meetingStatus || "PENDING",
      "Check In Time": formatDateForExport(v.checkInTime),
      "Check Out Time": v.checkOutTime
        ? formatDateForExport(v.checkOutTime)
        : "Active",
      Duration: calculateDuration(v.checkInTime, v.checkOutTime),
      Status: v.active ? "Active" : "Checked Out",
      "Has Checkout Photo": v.checkoutPhoto ? "Yes" : "No",
    }));
  };

  const exportToCSV = (data) => {
    if (data.length === 0) {
      alert("No data to export with selected filters");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        let value = row[header];
        if (value === undefined || value === null) value = "";
        if (typeof value === "string") {
          value = value.replace(/"/g, '""');
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            value = `"${value}"`;
          }
        }
        return value;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `visitor_log_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data) => {
    if (data.length === 0) {
      alert("No data to export with selected filters");
      return;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `visitor_log_${new Date().toISOString().split("T")[0]}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToHTML = (data) => {
    if (data.length === 0) {
      alert("No data to export with selected filters");
      return;
    }

    const headers = Object.keys(data[0]);

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Visitor Log Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; }
          .info { margin-bottom: 20px; color: #666; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .status-active { color: green; font-weight: bold; }
          .status-checked-out { color: gray; }
          .tag-badge { background: #9333ea; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
          @media (max-width: 768px) {
            th, td { padding: 4px; font-size: 12px; }
            h1 { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>Visitor Log Report</h1>
        <div class="info">
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Visitors: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${headers
                  .map((header) => {
                    let value = row[header];
                    if (header === "Status") {
                      value = `<span class="status-${value.toLowerCase().replace(" ", "-")}">${value}</span>`;
                    }
                    if (header === "Tag/Pass" && value !== "Not Assigned") {
                      value = `<span class="tag-badge">${value}</span>`;
                    }
                    return `<td>${value}</td>`;
                  })
                  .join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `visitor_log_${new Date().toISOString().split("T")[0]}.html`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    const filteredData = getFilteredDataForDownload();
    const exportData = prepareExportData(filteredData);

    switch (selectedFormat) {
      case "csv":
        exportToCSV(exportData);
        break;
      case "json":
        exportToJSON(exportData);
        break;
      case "html":
        exportToHTML(exportData);
        break;
      default:
        exportToCSV(exportData);
    }

    setIsDownloadDialogOpen(false);
  };

  const resetDownloadFilters = () => {
    setDownloadFilters({
      dateRange: { startDate: "", endDate: "" },
      personToMeet: "all",
      purpose: "all",
      status: "all",
    });
  };

  const resendMeetingEmail = async (visitorId) => {
    try {
      const response = await fetch(
        `${API_BASE}/visitors/${visitorId}/resend-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        alert("Meeting request email resent successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to resend email. Please try again.");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Visitor Log
          </h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-1 sm:mt-2">
            View and manage visitor records (Latest first)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsDownloadDialogOpen(true)}
            className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            size="sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Data</span>
            <span className="sm:hidden">Download</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, mobile, tag, person to meet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {filteredAndReversedVisitors.length} visitor(s) found
          </p>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-black/95 border-none [&>button:first-child]:hidden">
          <button
            onClick={() => setIsImagePreviewOpen(false)}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
          {previewImageTitle && (
            <div className="absolute top-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded-lg">
              <p className="text-sm font-medium">{previewImageTitle}</p>
            </div>
          )}
          <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
            <img
              src={previewImageUrl}
              alt={previewImageTitle}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Visitor Cards - Responsive Grid with Reversed Order */}
      {filteredAndReversedVisitors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 sm:py-16">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-sm sm:text-base text-gray-500">
              No visitors found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndReversedVisitors.map((visitor) => (
            <Card
              key={visitor.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4 sm:p-6">
                {/* Header with Photo and Name - Photo is clickable */}
                <div className="flex items-start gap-3 mb-4">
                  {visitor.photo ? (
                    <div
                      className="cursor-pointer group relative flex-shrink-0"
                      onClick={() =>
                        handleImageClick(
                          visitor.photo,
                          `${visitor.name}'s Photo`,
                        )
                      }
                    >
                      <img
                        src={visitor.photo}
                        alt={visitor.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-base sm:text-lg truncate"
                      title={visitor.name}
                    >
                      {visitor.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {visitor.active ? (
                        <Badge className="bg-green-600 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Checked Out
                        </Badge>
                      )}
                      {visitor.tagNumber && (
                        <Badge className="bg-purple-600 text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {visitor.tagNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visitor Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate" title={visitor.mobile}>
                      {visitor.mobile}
                    </span>
                  </div>
                  {visitor.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate" title={visitor.email}>
                        {visitor.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate" title={visitor.personToMeet}>
                      Meeting: {visitor.personToMeet}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      In: {formatDateTime(visitor.checkInTime)}
                    </span>
                  </div>
                  {visitor.checkOutTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        Out: {formatDateTime(visitor.checkOutTime)}
                      </span>
                    </div>
                  )}
                  {visitor.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate" title={visitor.company}>
                        {visitor.company}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedVisitor(visitor);
                      setIsDetailsOpen(true);
                    }}
                    className="flex-1"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {visitor.active && (
                    <Button
                      onClick={() => handleCheckoutClick(visitor)}
                      disabled={isCheckingOut || loading}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Checkout Dialog with Camera */}
      <Dialog open={showCheckoutCamera} onOpenChange={setShowCheckoutCamera}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md mx-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Checkout Visitor
            </DialogTitle>
            <DialogDescription className="text-center">
              {visitorToCheckout?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm break-words">
                <strong>Check-in Time:</strong>{" "}
                {formatDateTime(visitorToCheckout?.checkInTime)}
              </p>
              <p className="text-sm mt-1">
                <strong>Duration:</strong>{" "}
                {calculateDuration(visitorToCheckout?.checkInTime, new Date())}
              </p>
              {visitorToCheckout?.tagNumber && (
                <p className="text-sm mt-1">
                  <strong>Tag/Pass:</strong>{" "}
                  <Badge className="bg-purple-600">
                    {visitorToCheckout.tagNumber}
                  </Badge>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Checkout Photo (Optional)
              </label>
              <CameraCapture
                onCapture={setCheckoutPhoto}
                capturedImage={checkoutPhoto}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCheckoutCamera(false);
                  setCheckoutPhoto("");
                  setVisitorToCheckout(null);
                }}
                disabled={isCheckingOut}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCheckout}
                disabled={isCheckingOut}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                {isCheckingOut ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  "Confirm Checkout"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Assignment Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Visitor Pass/Tag</DialogTitle>
            <DialogDescription>
              Assign a tag number to {visitorForTag?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Tag Number
              </label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose available tag" />
                </SelectTrigger>
                <SelectContent>
                  {localAvailableTags.length > 0 ? (
                    localAvailableTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.tagNumber}>
                        {tag.tagNumber}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No tags available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {localAvailableTags.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  No tags available. Please contact admin to add more tags.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTagDialog(false);
                  setVisitorForTag(null);
                  setSelectedTag("");
                }}
                disabled={isAssigningTag}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignTag}
                disabled={
                  !selectedTag ||
                  isAssigningTag ||
                  localAvailableTags.length === 0
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isAssigningTag ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </div>
                ) : (
                  "Assign Tag"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visitor Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl mx-2 sm:mx-0 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              Visitor Details
            </DialogTitle>
            <DialogDescription className="text-sm">
              Complete visitor information
            </DialogDescription>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {selectedVisitor.photo ? (
                  <div
                    className="cursor-pointer group relative"
                    onClick={() =>
                      handleImageClick(
                        selectedVisitor.photo,
                        `${selectedVisitor.name}'s Photo`,
                      )
                    }
                  >
                    <img
                      src={selectedVisitor.photo}
                      alt={selectedVisitor.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold break-words">
                    {selectedVisitor.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge
                      className={selectedVisitor.active ? "bg-green-600" : ""}
                    >
                      {selectedVisitor.active ? "Active" : "Checked Out"}
                    </Badge>
                    {selectedVisitor.tagNumber && (
                      <Badge className="bg-purple-600">
                        <Tag className="w-3 h-3 mr-1" />
                        {selectedVisitor.tagNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Mobile</p>
                  <p className="font-medium text-sm break-all">
                    {selectedVisitor.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm break-all">
                    {selectedVisitor.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="font-medium text-sm break-words">
                    {selectedVisitor.company || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Person to Meet</p>
                  <p className="font-medium text-sm break-words">
                    {selectedVisitor.personToMeet}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Purpose</p>
                  <p className="font-medium text-sm break-words">
                    {selectedVisitor.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Meeting Status</p>
                  <p className="font-medium text-sm">
                    {selectedVisitor.meetingStatus || "PENDING"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check In</p>
                  <p className="font-medium text-sm break-words">
                    {formatDateTime(selectedVisitor.checkInTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check Out</p>
                  <p className="font-medium text-sm break-words">
                    {formatDateTime(selectedVisitor.checkOutTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-sm">
                    {calculateDuration(
                      selectedVisitor.checkInTime,
                      selectedVisitor.checkOutTime,
                    )}
                  </p>
                </div>
              </div>

              {/* Checkout Photo Display - Clickable */}
              {selectedVisitor.checkoutPhoto && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">
                    Checkout Photo:
                  </h4>
                  <div
                    className="cursor-pointer group relative inline-block"
                    onClick={() =>
                      handleImageClick(
                        selectedVisitor.checkoutPhoto,
                        `Checkout Photo - ${selectedVisitor.name}`,
                      )
                    }
                  >
                    <img
                      src={selectedVisitor.checkoutPhoto}
                      alt="Checkout"
                      className="w-full max-w-md rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* ID Proof Display - Clickable */}
              {selectedVisitor.idProof &&
                (() => {
                  try {
                    const idProof = JSON.parse(selectedVisitor.idProof);
                    return (
                      <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm">
                          ID Proof:
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="break-words">
                            <strong>Type:</strong> {idProof.type}
                          </p>
                          <p className="break-words">
                            <strong>Number:</strong> {idProof.number || "N/A"}
                          </p>
                          {idProof.photo && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">
                                ID Photo:
                              </p>
                              <div
                                className="cursor-pointer group relative inline-block"
                                onClick={() =>
                                  handleImageClick(
                                    idProof.photo,
                                    `ID Proof - ${idProof.type}`,
                                  )
                                }
                              >
                                <img
                                  src={idProof.photo}
                                  alt="ID Proof"
                                  className="w-full max-w-md rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return null;
                  }
                })()}

              {selectedVisitor.personToMeetDetails && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Meeting With:</h4>
                  <div className="flex items-center gap-3">
                    {selectedVisitor.personToMeetDetails.photo ? (
                      <div
                        className="cursor-pointer group relative"
                        onClick={() =>
                          handleImageClick(
                            selectedVisitor.personToMeetDetails.photo,
                            `${selectedVisitor.personToMeetDetails.name}'s Photo`,
                          )
                        }
                      >
                        <img
                          src={selectedVisitor.personToMeetDetails.photo}
                          alt={selectedVisitor.personToMeetDetails.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm break-words">
                        {selectedVisitor.personToMeetDetails.name}
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        {selectedVisitor.personToMeetDetails.email}
                      </p>
                      {selectedVisitor.personToMeetDetails.designation && (
                        <p className="text-xs text-gray-400">
                          {selectedVisitor.personToMeetDetails.designation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTONS SECTION */}
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedVisitor.active && !selectedVisitor.tagNumber && (
                  <Button
                    onClick={() => {
                      setVisitorForTag(selectedVisitor);
                      setShowTagDialog(true);
                      setIsDetailsOpen(false);
                    }}
                    disabled={isAssigningTag}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Assign Tag/Pass
                  </Button>
                )}

                {selectedVisitor.active &&
                  selectedVisitor.meetingStatus === "PENDING" && (
                    <Button
                      onClick={() => resendMeetingEmail(selectedVisitor.id)}
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Email
                    </Button>
                  )}

                {selectedVisitor.active && (
                  <Button
                    onClick={() => handleCheckoutClick(selectedVisitor)}
                    disabled={isCheckingOut}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}
              </div>

              <div className="text-xs text-center text-gray-400 sm:hidden mt-2">
                <p>Tap buttons below to take action</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Dialog */}
      <Dialog
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
      >
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl mx-2 sm:mx-0 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              Download Visitor Data
            </DialogTitle>
            <DialogDescription className="text-sm">
              Apply filters and choose format to download visitor records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-4">
            {/* Date Range Filter - Fixed with proper calendar */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={downloadFilters.dateRange.startDate}
                      onChange={(e) =>
                        setDownloadFilters({
                          ...downloadFilters,
                          dateRange: {
                            ...downloadFilters.dateRange,
                            startDate: e.target.value,
                          },
                        })
                      }
                      className="text-sm cursor-pointer"
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                    />
                    <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={downloadFilters.dateRange.endDate}
                      onChange={(e) =>
                        setDownloadFilters({
                          ...downloadFilters,
                          dateRange: {
                            ...downloadFilters.dateRange,
                            endDate: e.target.value,
                          },
                        })
                      }
                      className="text-sm cursor-pointer"
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                    />
                    <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Person to Meet Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Person to Meet
              </label>
              <Select
                value={downloadFilters.personToMeet}
                onValueChange={(value) =>
                  setDownloadFilters({
                    ...downloadFilters,
                    personToMeet: value,
                  })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Persons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Persons</SelectItem>
                  {uniquePersonsToMeet.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purpose Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Purpose
              </label>
              <Select
                value={downloadFilters.purpose}
                onValueChange={(value) =>
                  setDownloadFilters({ ...downloadFilters, purpose: value })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  {uniquePurposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Status
              </label>
              <Select
                value={downloadFilters.status}
                onValueChange={(value) =>
                  setDownloadFilters({ ...downloadFilters, status: value })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="checked-out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Format */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Download Format</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant={selectedFormat === "csv" ? "default" : "outline"}
                  onClick={() => setSelectedFormat("csv")}
                  className="gap-2 text-sm"
                  size="sm"
                >
                  CSV
                </Button>
                <Button
                  type="button"
                  variant={selectedFormat === "json" ? "default" : "outline"}
                  onClick={() => setSelectedFormat("json")}
                  className="gap-2 text-sm"
                  size="sm"
                >
                  JSON
                </Button>
                <Button
                  type="button"
                  variant={selectedFormat === "html" ? "default" : "outline"}
                  onClick={() => setSelectedFormat("html")}
                  className="gap-2 text-sm"
                  size="sm"
                >
                  HTML
                </Button>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                Data to be downloaded:
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {getFilteredDataForDownload().length} records
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Based on selected filters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={resetDownloadFilters}
              className="w-full sm:w-auto"
            >
              Reset Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDownloadDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 gap-2 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Download {selectedFormat.toUpperCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
