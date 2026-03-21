import { Link } from "react-router";
import { UserPlus, ClipboardList, Users, Clock, CheckCircle2, XCircle, UserCheck, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";

interface Visitor {
  id: string;
  checkInTime: string;
  checkOutTime?: string;
  name: string;
  photo: string;
  personToMeet: string;
}

export function Dashboard() {
  const [stats, setStats] = useState({
    totalToday: 0,
    activeNow: 0,
    checkedOut: 0,
  });

  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    const visitors = JSON.parse(localStorage.getItem("visitors") || "[]") as Visitor[];
    const today = new Date().toDateString();
    
    const todayVisitors = visitors.filter(v => 
      new Date(v.checkInTime).toDateString() === today
    );
    
    const active = todayVisitors.filter(v => !v.checkOutTime).length;
    const checkedOut = todayVisitors.filter(v => v.checkOutTime).length;

    setStats({
      totalToday: todayVisitors.length,
      activeNow: active,
      checkedOut: checkedOut,
    });

    setRecentVisitors(todayVisitors.slice(-5).reverse());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-slate-700 mt-2 text-lg">
          Welcome to PaulAccesso Visitor Management System
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Today's Visitors</CardTitle>
            <div className="size-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
              <Users className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {stats.totalToday}
            </div>
            <p className="text-xs text-slate-600 mt-2">Total check-ins today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Active Now</CardTitle>
            <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <UserCheck className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {stats.activeNow}
            </div>
            <p className="text-xs text-slate-600 mt-2">Visitors on premises</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Checked Out</CardTitle>
            <div className="size-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <LogOut className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {stats.checkedOut}
            </div>
            <p className="text-xs text-slate-600 mt-2">Completed visits today</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">Quick Actions</CardTitle>
          <CardDescription className="text-slate-600">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/register" className="block">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-auto py-6 flex items-center justify-start gap-4 shadow-md">
              <div className="size-12 rounded-lg bg-white/20 flex items-center justify-center">
                <UserPlus className="size-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-base">Register New Visitor</p>
                <p className="text-sm text-white/90">Add a new visitor entry</p>
              </div>
            </Button>
          </Link>
          <Link to="/log" className="block">
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-auto py-6 flex items-center justify-start gap-4 shadow-md">
              <div className="size-12 rounded-lg bg-white/20 flex items-center justify-center">
                <ClipboardList className="size-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-base">View Visitor Log</p>
                <p className="text-sm text-white/90">Check all visitor records</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Visitors */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">Recent Visitors</CardTitle>
              <CardDescription className="text-slate-600">
                Latest visitor check-ins
              </CardDescription>
            </div>
            <Link to="/log">
              <Button variant="outline" size="sm" className="border-violet-300 text-violet-700 hover:bg-violet-50">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentVisitors.length === 0 ? (
            <div className="text-center py-12">
              <div className="size-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
                <Users className="size-8 text-violet-600" />
              </div>
              <p className="text-slate-700 font-medium">No visitors yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Register your first visitor to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-violet-50/50 to-cyan-50/50 border border-violet-100 hover:shadow-md transition-all"
                >
                  <div className="size-14 rounded-lg overflow-hidden ring-2 ring-violet-200 ring-offset-2 ring-offset-white">
                    <img
                      src={visitor.photo}
                      alt={visitor.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{visitor.name}</p>
                    <p className="text-sm text-slate-600">Meeting: {visitor.personToMeet}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(visitor.checkInTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    {visitor.checkOutTime ? (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                        Checked Out
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}