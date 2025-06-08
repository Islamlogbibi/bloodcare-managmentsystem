import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Plus, Activity, AlertTriangle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getPatientStats } from "./lib/actions"
import { StatsCard } from "@/components/stats-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Blood donation management dashboard with patient statistics and quick actions",
}

async function DashboardStats() {
  const stats = await getPatientStats()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
      <StatsCard
        title="Total Patients"
        value={stats.totalPatients}
        icon={Users}
        description="Active patients in system"
        trend="+12% from last month"
      />
      <StatsCard
        title="Today's Transfusions"
        value={stats.todayTransfusions}
        icon={Clock}
        description="Scheduled for today"
        trend="3 urgent cases"
        variant="warning"
      />
      <StatsCard
        title="Tomorrow's Schedule"
        value={stats.tomorrowTransfusions}
        icon={Calendar}
        description="Appointments scheduled"
        trend="All confirmed"
        variant="success"
      />
      <StatsCard
        title="Urgent Cases"
        value={stats.urgentCases}
        icon={AlertTriangle}
        description="Require immediate attention"
        trend="2 critical"
        variant="destructive"
      />
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="animate-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Blood Donation Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive patient care and transfusion scheduling</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/patients/new">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 focus-ring transition-all duration-200 hover:shadow-lg"
                aria-label="Add new patient to the system"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Patient
              </Button>
            </Link>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <DashboardStats />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          <Card className="border-0 shadow-md card-hover glass-effect">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-900">
                <Users className="mr-3 h-5 w-5 text-red-600" />
                Patient Management
              </CardTitle>
              <CardDescription>Manage patient records and medical information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patients" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="View all patients in the system"
                >
                  <Users className="mr-3 h-4 w-4" />
                  View All Patients
                </Button>
              </Link>
              <Link href="/patients/new" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="Register a new patient"
                >
                  <Plus className="mr-3 h-4 w-4" />
                  Register New Patient
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md card-hover glass-effect">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-900">
                <Calendar className="mr-3 h-5 w-5 text-blue-600" />
                Transfusion Schedule
              </CardTitle>
              <CardDescription>Manage blood transfusion appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/transfusions/today" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="View today's transfusion schedule"
                >
                  <Clock className="mr-3 h-4 w-4" />
                  Today's Schedule
                </Button>
              </Link>
              <Link href="/transfusions/tomorrow" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="View tomorrow's transfusion schedule"
                >
                  <Calendar className="mr-3 h-4 w-4" />
                  Tomorrow's Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md card-hover glass-effect">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-900">
                <BarChart3 className="mr-3 h-5 w-5 text-green-600" />
                Analytics
              </CardTitle>
              <CardDescription>View performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/analytics" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="View analytics dashboard"
                >
                  <Activity className="mr-3 h-4 w-4" />
                  Analytics Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 animate-slide-up">
          <Card className="border-0 shadow-md card-hover">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              <CardDescription>Latest patient registrations and transfusions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" role="feed" aria-label="Recent activity feed">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg transition-colors duration-200 hover:bg-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New patient registered</p>
                    <p className="text-xs text-gray-600">Sarah Johnson - A+ Blood Type</p>
                  </div>
                  <time className="text-xs text-gray-500" dateTime="2024-01-15T10:30:00">
                    2 min ago
                  </time>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg transition-colors duration-200 hover:bg-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Transfusion completed</p>
                    <p className="text-xs text-gray-600">John Doe - 2 units transfused</p>
                  </div>
                  <time className="text-xs text-gray-500" dateTime="2024-01-15T10:15:00">
                    15 min ago
                  </time>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg transition-colors duration-200 hover:bg-yellow-100">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Urgent case scheduled</p>
                    <p className="text-xs text-gray-600">Michael Brown - Emergency transfusion</p>
                  </div>
                  <time className="text-xs text-gray-500" dateTime="2024-01-15T09:30:00">
                    1 hour ago
                  </time>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md card-hover">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              <CardDescription>Frequently used functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Quick action buttons">
                <Link href="/patients/new">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="Add new patient"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Add Patient</span>
                  </Button>
                </Link>
                <Link href="/transfusions/schedule">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="Schedule transfusion"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Schedule</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="View analytics"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                </Link>
                <Link href="/patients">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="View all patients"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Patients</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
