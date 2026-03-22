import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calculateDashboardSummary, formatCurrency } from "@/lib/calculations";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { FAB } from "@/components/layout/fab";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entries = await prisma.ledgerEntry.findMany({
    where: { userId: user.id },
    include: {
      contact: { select: { name: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const contacts = await prisma.contact.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const summary = calculateDashboardSummary(entries);
  const recentEntries = entries.slice(0, 5);

  return (
    <div className="px-5 py-5 space-y-5">
      {/* Net Position Card */}
      <div className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-3xl p-6 text-white shadow-lg animate-slide-up">
        <p className="text-sm text-white/70 font-medium">Net Position</p>
        <p className="text-3xl font-bold mt-1">
          {formatCurrency(summary.netPosition)}
        </p>
        <p className="text-xs text-white/60 mt-2">
          {summary.netPosition >= 0
            ? "You are a net creditor"
            : "You owe more than you're owed"}
        </p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          label="Owed to you"
          value={formatCurrency(summary.totalReceivable)}
        />
        <StatCard
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          label="You owe"
          value={formatCurrency(summary.totalPayable)}
        />
        <StatCard
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          label="Overdue"
          value={String(summary.overdueCount)}
        />
        <StatCard
          icon={CheckCircle}
          iconColor="text-gray-500"
          iconBg="bg-gray-100"
          label="Settled"
          value={String(summary.settledCount)}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <span className="text-xs text-gray-400">{summary.activeCount} active</span>
        </div>
        <RecentActivity entries={recentEntries} />
      </div>

      <FAB contacts={contacts} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-slide-up">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", iconBg)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
