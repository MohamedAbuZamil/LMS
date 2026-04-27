import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { UpcomingExams } from "@/components/dashboard/UpcomingExams";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { WeekChart } from "@/components/dashboard/WeekChart";
import { MyCourses } from "@/components/dashboard/MyCourses";

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <WelcomeBanner name="أحمد" />
      <StatsRow />

      {/* two-column lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <UpcomingExams />
        <UpcomingLessons />
      </div>

      {/* three-column bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PerformanceCard />
        <WeekChart />
        <MyCourses />
      </div>
    </div>
  );
}
