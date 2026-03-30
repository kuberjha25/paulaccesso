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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
  X,
  CalendarDays,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Camera,
  Tag,
} from "lucide-react";
import { useApp } from "./context/AppContext";

export function VisitorLog() {
  const {
    visitors,
    checkoutVisitor,
    loading,
    assignTagToVisitor,
    fetchAvailableTags,
    availableTags,
    token,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);
  const [visitorToCheckout, setVisitorToCheckout] = useState(null);
  const [checkoutPhoto, setCheckoutPhoto] = useState("");
  const [showCheckoutCamera, setShowCheckoutCamera] = useState(false);

  // Tag assignment states
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [visitorForTag, setVisitorForTag] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [localAvailableTags, setLocalAvailableTags] = useState([]);

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

  // Fetch available tags when dialog opens
  useEffect(() => {
    if (showTagDialog) {
      const loadTags = async () => {
        const tags = await fetchAvailableTags();
        setLocalAvailableTags(tags);
      };
      loadTags();
    }
  }, [showTagDialog]);

  // Get unique persons to meet and purposes for filters
  const uniquePersonsToMeet = [...new Set(visitors.map((v) => v.personToMeet))];
  const uniquePurposes = [...new Set(visitors.map((v) => v.purpose))];

  const filteredVisitors = visitors.filter((v) => {
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
  });

  const handleCheckoutClick = (visitor) => {
    setVisitorToCheckout(visitor);
    setCheckoutPhoto("");
    setShowCheckoutCamera(true);
  };

  const handleConfirmCheckout = async () => {
    if (visitorToCheckout) {
      await checkoutVisitor(visitorToCheckout.id, checkoutPhoto);
      if (selectedVisitor?.id === visitorToCheckout.id) {
        const updatedVisitor = visitors.find(
          (v) => v.id === visitorToCheckout.id,
        );
        setSelectedVisitor(updatedVisitor);
      }
      setIsCheckoutConfirmOpen(false);
      setShowCheckoutCamera(false);
      setVisitorToCheckout(null);
      setCheckoutPhoto("");
    }
  };

  const handleAssignTag = async () => {
    if (visitorForTag && selectedTag) {
      const result = await assignTagToVisitor(visitorForTag.id, selectedTag);
      if (result) {
        setShowTagDialog(false);
        setVisitorForTag(null);
        setSelectedTag("");
        // Update selected visitor if details dialog is open
        if (selectedVisitor?.id === visitorForTag.id) {
          setSelectedVisitor(result);
        }
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatDateForExport = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

  // Get data based on download filters
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

  // Prepare data for export
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

  // Export functions (same as before)
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

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Visitor Log
          </h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-1 sm:mt-2">
            View and manage visitor records
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

      {/* Main Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                All Visitors
              </CardTitle>
              <CardDescription className="text-sm">
                {filteredVisitors.length} visitor(s) found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search name, tag, mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
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
          </div>
        </CardHeader>
        <CardContent>
          {filteredVisitors.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-sm sm:text-base text-gray-500">
                No visitors found
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {filteredVisitors.map((v) => (
                  <div key={v.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {v.photo ? (
                          <img
                            src={v.photo}
                            alt={v.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base truncate">
                            {v.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {!v.active ? (
                              <Badge variant="secondary" className="text-xs">
                                Checked Out
                              </Badge>
                            ) : (
                              <Badge className="bg-green-600 text-xs">
                                Active
                              </Badge>
                            )}
                            {v.tagNumber && (
                              <Badge className="bg-purple-600 text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {v.tagNumber}
                              </Badge>
                            )}
                            {v.checkoutPhoto && !v.active && (
                              <Badge variant="outline" className="text-xs">
                                <Camera className="w-3 h-3 mr-1" />
                                Photo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVisitor(v);
                            setIsDetailsOpen(true);
                          }}
                          className="h-9 w-9 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {v.active && (
                          <Button
                            size="sm"
                            onClick={() => handleCheckoutClick(v)}
                            disabled={loading}
                            className="bg-cyan-600 h-9 w-9 p-0"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Meeting With</TableHead>
                      <TableHead>Tag/Pass</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          {v.photo ? (
                            <img
                              src={v.photo}
                              alt={v.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {v.mobile}
                            <br />
                            <span className="text-xs text-gray-500">
                              {v.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{v.personToMeet}</TableCell>
                        <TableCell>
                          {v.tagNumber ? (
                            <Badge className="bg-purple-600">
                              <Tag className="w-3 h-3 mr-1" />
                              {v.tagNumber}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateTime(v.checkInTime)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateTime(v.checkOutTime)}
                          {v.checkoutPhoto && !v.active && (
                            <Camera className="w-3 h-3 inline ml-1 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {!v.active ? (
                            <Badge variant="secondary">Checked Out</Badge>
                          ) : (
                            <Badge className="bg-green-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVisitor(v);
                                setIsDetailsOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {v.active && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckoutClick(v)}
                                disabled={loading}
                                className="bg-cyan-600 h-8 w-8 p-0"
                              >
                                <LogOut className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
              <p className="text-sm">
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
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCheckout}
                disabled={loading}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                {loading ? "Processing..." : "Confirm Checkout"}
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
                onClick={() => setShowTagDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignTag}
                disabled={
                  !selectedTag || loading || localAvailableTags.length === 0
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Assigning..." : "Assign Tag"}
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
                {selectedVisitor.photo && (
                  <img
                    src={selectedVisitor.photo}
                    alt={selectedVisitor.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">
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
                  <p className="font-medium text-sm">
                    {selectedVisitor.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm break-all">
                    {selectedVisitor.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="font-medium text-sm">
                    {selectedVisitor.company || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Person to Meet</p>
                  <p className="font-medium text-sm">
                    {selectedVisitor.personToMeet}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Purpose</p>
                  <p className="font-medium text-sm">
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
                  <p className="font-medium text-sm">
                    {formatDateTime(selectedVisitor.checkInTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check Out</p>
                  <p className="font-medium text-sm">
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

              {/* Checkout Photo Display */}
              {selectedVisitor.checkoutPhoto && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">
                    Checkout Photo:
                  </h4>
                  <img
                    src={selectedVisitor.checkoutPhoto}
                    alt="Checkout"
                    className="w-full max-w-md rounded-lg object-cover"
                  />
                </div>
              )}

              {/* ID Proof Display */}
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
                          <p>
                            <strong>Type:</strong> {idProof.type}
                          </p>
                          <p>
                            <strong>Number:</strong> {idProof.number || "N/A"}
                          </p>
                          {idProof.photo && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">
                                ID Photo:
                              </p>
                              <img
                                src={idProof.photo}
                                alt="ID Proof"
                                className="w-full max-w-md rounded-lg object-cover"
                              />
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
                      <img
                        src={selectedVisitor.personToMeetDetails.photo}
                        alt={selectedVisitor.personToMeetDetails.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">
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

              <div className="flex gap-3">
                {selectedVisitor.active && !selectedVisitor.tagNumber && (
                  <Button
                    onClick={() => {
                      setVisitorForTag(selectedVisitor);
                      setShowTagDialog(true);
                      setIsDetailsOpen(false);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Assign Tag/Pass
                  </Button>
                )}
                {selectedVisitor.active && (
                  <Button
                    onClick={() => handleCheckoutClick(selectedVisitor)}
                    disabled={loading}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}
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
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
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
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
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
                    className="text-sm"
                  />
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
