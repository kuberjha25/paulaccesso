import { Link } from "react-router";
import { UserPlus, ClipboardList, Users, UserCheck, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useApp } from "./context/AppContext";

export function Dashboard() {
  const { visitors, getStats } = useApp();
  const stats = getStats();
  
  const recentVisitors = visitors.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-blue-600">Dashboard</h2>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Welcome to Visitor Management System</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">Today's Visitors</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalToday}</div>
            <p className="text-xs text-gray-500 mt-2">Total check-ins today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">Active Now</CardTitle>
            <UserCheck className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeNow}</div>
            <p className="text-xs text-gray-500 mt-2">Visitors on premises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">Checked Out</CardTitle>
            <LogOut className="w-5 h-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.checkedOut}</div>
            <p className="text-xs text-gray-500 mt-2">Completed visits today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/register">
            <Button className="w-full h-auto py-4 flex gap-3 bg-blue-600">
              <UserPlus className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold">Register New Visitor</p>
                <p className="text-xs opacity-90">Add a new visitor entry</p>
              </div>
            </Button>
          </Link>
          <Link to="/log">
            <Button className="w-full h-auto py-4 flex gap-3 bg-cyan-600">
              <ClipboardList className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold">View Visitor Log</p>
                <p className="text-xs opacity-90">Check all visitor records</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Visitors</CardTitle>
              <CardDescription>Latest visitor check-ins</CardDescription>
            </div>
            <Link to="/log"><Button variant="outline" size="sm">View All</Button></Link>
          </div>
          
        </CardHeader>
        <CardContent>
          {recentVisitors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No visitors yet</div>
          ) : (
            <div className="space-y-3">
              {recentVisitors.map(v => (
                <div key={v.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  {v.photo ? (
                    <img src={v.photo} alt={v.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-sm text-gray-500">Meeting: {v.personToMeet}</p>
                    <p className="text-xs text-gray-400">{new Date(v.checkInTime).toLocaleString()}</p>
                  </div>
                  <Badge className={v.active ? "bg-green-600" : ""}>{v.active ? "Active" : "Checked Out"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}