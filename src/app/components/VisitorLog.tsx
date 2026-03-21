import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
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
import { Search, LogOut, Eye, Calendar, Filter, Download } from "lucide-react";
import { toast } from "sonner";

interface Visitor {
  id: string;
  name: string;
  mobile: string;
  email: string;
  company: string;
  address: string;
  personToMeet: string;
  purpose: string;
  photo: string;
  idProof: string;
  checkInTime: string;
  checkOutTime: string | null;
}

export function VisitorLog() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [searchQuery, statusFilter, visitors]);

  const loadVisitors = () => {
    const stored = localStorage.getItem("visitors");
    if (stored) {
      const parsedVisitors = JSON.parse(stored) as Visitor[];
      setVisitors(parsedVisitors.reverse()); // Show latest first
    }
  };

  const filterVisitors = () => {
    let filtered = [...visitors];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.mobile.includes(searchQuery) ||
          v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.personToMeet.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((v) => !v.checkOutTime);
    } else if (statusFilter === "checked-out") {
      filtered = filtered.filter((v) => v.checkOutTime);
    }

    setFilteredVisitors(filtered);
  };

  const handleCheckOut = (visitor: Visitor) => {
    const updatedVisitors = visitors.map((v) =>
      v.id === visitor.id
        ? { ...v, checkOutTime: new Date().toISOString() }
        : v
    );
    setVisitors(updatedVisitors);
    localStorage.setItem("visitors", JSON.stringify(updatedVisitors.reverse()));
    toast.success(`${visitor.name} checked out successfully`);
  };

  const viewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsDetailsOpen(true);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Mobile", "Email", "Company", "Person to Meet", "Purpose", "Check In", "Check Out"];
    const rows = filteredVisitors.map(v => [
      v.name,
      v.mobile,
      v.email,
      v.company,
      v.personToMeet,
      v.purpose,
      new Date(v.checkInTime).toLocaleString(),
      v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : "Active",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Visitor log exported successfully");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Active";
    const duration = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            Visitor Log
          </h2>
          <p className="text-slate-700 mt-2 text-lg">
            View and manage all visitor records
          </p>
        </div>
        <Button 
          onClick={exportToCSV} 
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md"
        >
          <Download className="size-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                All Visitors
              </CardTitle>
              <CardDescription className="mt-1 text-slate-600">
                {filteredVisitors.length} visitor(s) found
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search visitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-[250px] bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white border-violet-200">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="checked-out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVisitors.length === 0 ? (
            <div className="text-center py-16">
              <div className="size-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
                <Calendar className="size-10 text-violet-600" />
              </div>
              <p className="text-slate-700 font-medium text-lg">No visitors found</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Register your first visitor to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-50/50 to-cyan-50/50 border-violet-100">
                    <TableHead className="font-semibold text-slate-700">Photo</TableHead>
                    <TableHead className="font-semibold text-slate-700">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                    <TableHead className="font-semibold text-slate-700">Meeting With</TableHead>
                    <TableHead className="font-semibold text-slate-700">Purpose</TableHead>
                    <TableHead className="font-semibold text-slate-700">Check In</TableHead>
                    <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id} className="hover:bg-violet-50/30 transition-colors border-violet-100/50">
                      <TableCell>
                        <div className="size-14 rounded-lg overflow-hidden ring-2 ring-violet-200 ring-offset-2 ring-offset-white">
                          <img
                            src={visitor.photo}
                            alt={visitor.name}
                            className="size-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{visitor.name}</p>
                          {visitor.company && (
                            <p className="text-sm text-slate-600">{visitor.company}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-slate-700">{visitor.mobile}</p>
                          <p className="text-slate-600">{visitor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{visitor.personToMeet}</TableCell>
                      <TableCell className="text-slate-700">{visitor.purpose}</TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {formatDateTime(visitor.checkInTime)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {calculateDuration(visitor.checkInTime, visitor.checkOutTime)}
                      </TableCell>
                      <TableCell>
                        {visitor.checkOutTime ? (
                          <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                            Checked Out
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDetails(visitor)}
                            className="border-violet-300 hover:bg-violet-50 text-violet-700"
                          >
                            <Eye className="size-4" />
                          </Button>
                          {!visitor.checkOutTime && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckOut(visitor)}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                            >
                              <LogOut className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visitor Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">Visitor Details</DialogTitle>
            <DialogDescription className="text-slate-600">Complete visitor information</DialogDescription>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <img
                  src={selectedVisitor.photo}
                  alt={selectedVisitor.name}
                  className="size-32 rounded-lg object-cover ring-2 ring-violet-200"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">{selectedVisitor.name}</h3>
                  {selectedVisitor.checkOutTime ? (
                    <Badge variant="secondary" className="bg-slate-200 text-slate-700">Checked Out</Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Active</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Mobile Number</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Company</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.company || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Person to Meet</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.personToMeet}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Purpose of Visit</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">ID Proof</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.idProof || "Not uploaded"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Address</p>
                  <p className="font-medium text-slate-900">{selectedVisitor.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Check In Time</p>
                  <p className="font-medium text-slate-900">{formatDateTime(selectedVisitor.checkInTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Check Out Time</p>
                  <p className="font-medium text-slate-900">
                    {selectedVisitor.checkOutTime
                      ? formatDateTime(selectedVisitor.checkOutTime)
                      : "Still on premises"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Duration</p>
                  <p className="font-medium text-slate-900">
                    {calculateDuration(selectedVisitor.checkInTime, selectedVisitor.checkOutTime)}
                  </p>
                </div>
              </div>

              {!selectedVisitor.checkOutTime && (
                <Button
                  onClick={() => {
                    handleCheckOut(selectedVisitor);
                    setIsDetailsOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md"
                >
                  <LogOut className="size-4 mr-2" />
                  Check Out Visitor
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}