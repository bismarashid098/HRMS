import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box, Text, Flex, Icon, Spinner, Badge, Button, Avatar, Grid,
} from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaChevronRight, FaClock, FaUserCheck, FaUserTimes, FaChartBar,
} from "react-icons/fa";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTip, ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/dashboard/Card";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { Sparkline } from "../../components/dashboard/Sparkline";
import { ChartTooltip } from "../../components/dashboard/ChartTooltip";

/* ── helpers ── */
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};
const Rs = (n) =>
  n >= 1e6 ? `Rs ${(n / 1e6).toFixed(1)}M`
  : n >= 1e3 ? `Rs ${(n / 1e3).toFixed(0)}K`
  : `Rs ${n || 0}`;
const useClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

/* ── SVG Donut Ring with glow ── */
const DonutRing = ({ value, max, color, size = 120, thickness = 12 }) => {
  const pct  = max ? Math.min(1, value / max) : 0;
  const r    = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const c    = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={thickness}
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)",
          filter: `drop-shadow(0 0 5px ${color}99)`,
        }} />
    </svg>
  );
};

/* ── Chart container ── */
const ChartBox = ({ children }) => (
  <Box flex={1} minH={0} px={4} pb={3}>
    <Box h="100%" position="relative">
      <Box position="absolute" inset={0}>{children}</Box>
    </Box>
  </Box>
);

/* ── Workforce Snapshot progress row ── */
const SnapRow = ({ label, value, max, fill, track, badge, badgeBg, badgeTxt }) => {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <Box mb={3.5}>
      <Flex justify="space-between" align="center" mb={1.5}>
        <Flex align="center" gap={2}>
          <Box w="9px" h="9px" borderRadius="3px" bg={fill} />
          <Text fontSize="11.5px" color="gray.600" fontWeight="600">{label}</Text>
        </Flex>
        <Flex align="center" gap={1.5}>
          <Text fontSize="14px" fontWeight="900" color="gray.800" letterSpacing="-0.02em">{value}</Text>
          {badge && (
            <Badge bg={badgeBg} color={badgeTxt} borderRadius="full"
              fontSize="9px" px={1.5} py={0.5} fontWeight="700">{badge}</Badge>
          )}
        </Flex>
      </Flex>
      <Box bg={track} borderRadius="full" h="8px" overflow="hidden"
        style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.07)" }}>
        <Box bg={fill} h="100%" w={`${pct}%`} borderRadius="full"
          transition="width 1.2s cubic-bezier(0.4,0,0.2,1)"
          style={{ boxShadow: `0 0 10px ${fill}aa, 0 2px 4px ${fill}55` }} />
      </Box>
    </Box>
  );
};

/* ── Leave type colors ── */
const LEAVE_CFG = {
  "Sick Leave":      { color: "#ef4444", bg: "#fef2f2", grad: "linear-gradient(90deg, #ef4444, #fca5a5)" },
  "Annual Leave":    { color: "#6366f1", bg: "#eef2ff", grad: "linear-gradient(90deg, #6366f1, #a5b4fc)" },
  "Emergency Leave": { color: "#f59e0b", bg: "#fffbeb", grad: "linear-gradient(90deg, #f59e0b, #fcd34d)" },
  "Unpaid Leave":    { color: "#8b5cf6", bg: "#faf5ff", grad: "linear-gradient(90deg, #8b5cf6, #c4b5fd)" },
  "Maternity Leave": { color: "#ec4899", bg: "#fdf2f8", grad: "linear-gradient(90deg, #ec4899, #f9a8d4)" },
  "Casual":          { color: "#14b8a6", bg: "#f0fdfa", grad: "linear-gradient(90deg, #14b8a6, #5eead4)" },
  "No Data":         { color: "#94a3b8", bg: "#f8fafc", grad: "linear-gradient(90deg, #94a3b8, #cbd5e1)" },
};
const leaveCfg = (n) => LEAVE_CFG[n] || { color: "#6366f1", bg: "#eef2ff", grad: "linear-gradient(90deg, #6366f1, #a5b4fc)" };

/* ════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════ */
const AdminDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const nav      = useNavigate();
  const clock    = useClock();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const curMonth  = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const today     = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" });

  const total   = data.summary.totalEmployees  || 0;
  const pres    = data.summary.attendanceToday  || 0;
  const leaves  = data.summary.pendingLeaves    || 0;
  const payroll = data.summary.monthlyPayroll   || 0;
  const absent  = Math.max(0, total - pres);
  const rate    = total ? Math.round((pres / total) * 100) : 0;

  const chartData = data.attendance.map((i) => ({ name: i._id.slice(5), Present: i.present, Absent: i.absent }));
  const leaveList = data.leaves.map((i) => ({ name: i._id, value: i.total }));
  if (!leaveList.length) leaveList.push({ name: "No Data", value: 0 });
  const leavTotal = data.leaves.reduce((s, l) => s + l.total, 0);

  const sparkPresent = chartData.slice(-8).map((d) => d.Present);

  const kpiCards = [
    { label: "Total Staff",     value: total,       sub: "Active employees",  gradient: "linear(135deg, #10b981 0%, #059669 100%)", icon: FaUsers },
    { label: "Present Today",   value: pres,        sub: `${rate}% rate`,     gradient: "linear(135deg, #3b82f6 0%, #1d4ed8 100%)", icon: FaUserCheck, sparkData: sparkPresent },
    { label: "Pending Leaves",  value: leaves,      sub: "Awaiting approval", gradient: "linear(135deg, #f59e0b 0%, #d97706 100%)", icon: FaClipboardList },
    { label: "Monthly Payroll", value: Rs(payroll), sub: curMonth,            gradient: "linear(135deg, #8b5cf6 0%, #7c3aed 100%)", icon: FaMoneyBillWave },
  ];

  const quickLinks = [
    { label: "Employees",  sub: `${total} total`,    icon: FaUsers,         color: "#10b981", to: "/dashboard/employees" },
    { label: "Attendance", sub: "View today",         icon: FaCalendarCheck, color: "#6366f1", to: "/dashboard/attendance/daily" },
    { label: "Payroll",    sub: curMonth,             icon: FaMoneyBillWave, color: "#0ea5e9", to: "/dashboard/payroll" },
    { label: "Leaves",     sub: `${leaves} pending`, icon: FaClipboardList, color: "#f59e0b", to: "/dashboard/leaves" },
  ];

  const feedItems = [
    { icon: FaUserCheck,     color: "#10b981", label: "Present Today",   value: pres,        sub: `${rate}% attendance rate` },
    { icon: FaClipboardList, color: "#f59e0b", label: "Pending Leaves",  value: leaves,      sub: "Awaiting approval" },
    { icon: FaMoneyBillWave, color: "#6366f1", label: "Monthly Payroll", value: Rs(payroll), sub: curMonth },
  ];

  return (
    <Flex
      direction="column"
      gap={4}
      mx={{ base: -4, md: -6 }}
      mt={{ base: -4, md: -6 }}
      mb={{ base: -4, md: -6 }}
      minH="calc(100vh - 64px)"
      overflow="hidden"
      bg="#f0f4ff"
      px={5}
      pt={4}
      pb={4}
    >

      {/* ════ WELCOME BANNER ════ */}
      <Box
        bgGradient="linear(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)"
        borderRadius="20px" px={6} py={4} flexShrink={0}
        position="relative" overflow="hidden">
        <Box pos="absolute" top="-30px" right="120px" w="140px" h="140px"
          borderRadius="full" bg="rgba(16,185,129,0.06)" />
        <Box pos="absolute" top="-20px" right="-20px" w="100px" h="100px"
          borderRadius="full" bg="rgba(99,102,241,0.07)" />

        <Flex justify="space-between" align="center" position="relative">
          <Box>
            <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="-0.02em">
              {greet()}, {firstName}
            </Text>
            <Text fontSize="11px" color="rgba(255,255,255,0.35)" mt={0.5} fontWeight="500">
              {today} · WorkSphere HRMS
            </Text>
          </Box>

          <Flex align="center" gap={2.5} flexShrink={0}>
            <Flex align="center" gap={2} px={3} py={1.5}
              bg="rgba(255,255,255,0.07)" borderRadius="12px"
              border="1px solid rgba(255,255,255,0.1)">
              <Icon as={FaClock} color="rgba(255,255,255,0.4)" boxSize={3} />
              <Text fontSize="12px" fontWeight="700" color="white"
                letterSpacing="0.04em" fontFamily="'Courier New', monospace">{clock}</Text>
            </Flex>
            <Flex align="center" gap={1.5} px={3} py={1.5}
              bg="rgba(255,255,255,0.07)" borderRadius="12px"
              border="1px solid rgba(255,255,255,0.1)">
              <Box w={2} h={2} borderRadius="full" bg="#22c55e"
                boxShadow="0 0 0 3px rgba(34,197,94,0.22)" />
              <Text fontSize="11px" color="rgba(255,255,255,0.6)" fontWeight="600">Live</Text>
            </Flex>
            <Avatar name={user?.name} size="sm" bg="#10b981" color="white" fontWeight="800"
              boxShadow="0 0 0 2px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3)" />
          </Flex>
        </Flex>
      </Box>

      {/* ════ BELOW-HEADER DASHBOARD (REDESIGNED) ════ */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        {/* subtle enterprise background lines */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: [
              // soft grid
              "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px)",
              "linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
              // soft diagonals
              "linear-gradient(135deg, rgba(6,95,70,0.07) 0%, transparent 45%)",
              "linear-gradient(315deg, rgba(99,102,241,0.06) 0%, transparent 45%)",
            ].join(", "),
            backgroundSize: "64px 64px, 64px 64px, 100% 100%, 100% 100%",
            opacity: 0.55,
            maskImage:
              "radial-gradient(ellipse at top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.0) 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.0) 85%)",
          }}
        />
        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:auto-rows-fr">
          {kpiCards.map((k) => (
            <MetricCard
              key={k.label}
              label={k.label}
              value={k.value}
              sub={k.sub}
              icon={k.icon}
              gradient={k.gradient}
              spark={
                k.sparkData ? (
                  <Sparkline
                    data={k.sparkData}
                    color="rgba(255,255,255,0.75)"
                    width={120}
                    height={26}
                  />
                ) : null
              }
            />
          ))}
        </div>

        {/* Main grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">

          {/* Attendance Trend */}
          <Card
            title="Attendance Trend"
            subtitle="Present vs Absent (last days)"
            accent="#10b981"
            className="min-h-[320px] xl:min-h-0"
            right={
              <button
                type="button"
                className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                onClick={() => nav("/dashboard/attendance/daily")}
              >
                View daily <span className="ml-1">→</span>
              </button>
            }
          >
            <div className="px-5 pt-2 pb-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-[4px]"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  />
                  <span className="text-[11px] font-semibold text-slate-500">
                    Present
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-[2px] w-6 rounded-full"
                    style={{ borderTop: "2px dashed #f87171" }}
                  />
                  <span className="text-[11px] font-semibold text-slate-500">
                    Absent
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[260px] px-4 pb-4">
              {chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
                  <FaCalendarCheck className="h-10 w-10 opacity-40" />
                  <div className="text-sm font-medium">No attendance data yet</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#eef2f7" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    />
                    <ReTip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                    <Bar dataKey="Present" name="Present" fill="url(#barGradA)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                    <Line
                      type="monotone"
                      dataKey="Absent"
                      name="Absent"
                      stroke="#f87171"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray="5 3"
                      activeDot={{ r: 5, fill: "#f87171", stroke: "white", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Right rail */}
          <div className="grid min-h-0 grid-cols-1 gap-4">

            <Card title="Today's Overview" subtitle="Live snapshot" accent="#6366f1" className="min-h-[220px]">
              <div className="flex items-center justify-between gap-4 px-5 py-5">
                <div className="relative">
                  <div className="rotate-[-90deg]">
                    <DonutRing value={pres} max={total} color="#10b981" size={120} thickness={12} />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[22px] font-black tracking-[-0.02em] text-slate-800 leading-none">
                      {rate}%
                    </div>
                    <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      Rate
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-2">
                  <div className="rounded-2xl p-3 text-center" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                    <div className="text-[20px] font-black leading-none" style={{ color: "#059669" }}>
                      {pres}
                    </div>
                    <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#059669" }}>
                      Present
                    </div>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
                    <div className="text-[20px] font-black leading-none" style={{ color: "#dc2626" }}>
                      {absent}
                    </div>
                    <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#dc2626" }}>
                      Absent
                    </div>
                  </div>
                  <div className="col-span-2 mt-1 flex items-center justify-between rounded-2xl px-3 py-2" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
                    <div className="text-[11px] font-semibold" style={{ color: "#92400e" }}>
                      Pending Leaves
                    </div>
                    <div className="rounded-full px-2 py-1 text-[10px] font-extrabold" style={{ background: "#fde68a", color: "#92400e" }}>
                      {leaves}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Leave Breakdown"
              subtitle="By type"
              accent="#f59e0b"
              right={
                <button
                  type="button"
                  className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                  onClick={() => nav("/dashboard/leaves")}
                >
                  View all <span className="ml-1">→</span>
                </button>
              }
              className="min-h-[240px] xl:min-h-0"
            >
              <div className="max-h-[320px] overflow-auto px-4 py-4">
                <div className="space-y-2">
                  {leaveList.map((item) => {
                    const cfg = leaveCfg(item.name);
                    const pct = leavTotal ? Math.round((item.value / leavTotal) * 100) : 0;
                    return (
                      <div
                        key={item.name}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:bg-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)]"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
                            <div className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                          </div>
                          <div className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-slate-800">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[12px] font-black" style={{ color: cfg.color }}>
                              {item.value}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">
                              {pct}%
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: cfg.grad }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          <Card
            title="Quick Access"
            subtitle="Shortcuts"
            accent="#0ea5e9"
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-2">
              {quickLinks.map((a) => {
                const I = a.icon;
                return (
                  <button
                    type="button"
                    key={a.label}
                    onClick={() => nav(a.to)}
                    className={[
                      "group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left",
                      "shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out",
                      "hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]",
                      "focus:outline-none focus:ring-2 focus:ring-slate-200",
                    ].join(" ")}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
                      style={{
                        background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}cc 100%)`,
                        boxShadow: `0 8px 18px ${a.color}33`,
                      }}
                    >
                      <I className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-extrabold text-slate-700">
                        {a.label}
                      </span>
                      <span className="block truncate text-[10px] font-medium text-slate-400">
                        {a.sub}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Activity Summary" subtitle="Key metrics" accent="#8b5cf6" className="order-2 lg:order-1">
            <div className="relative px-5 py-4">
              <div
                className="absolute left-[26px] top-6 bottom-6 w-[2px]"
                style={{ background: "linear-gradient(180deg, #8b5cf655, #e2e8f0)" }}
              />
              <div className="space-y-3">
                {feedItems.map((f, i) => {
                  const I = f.icon;
                  return (
                    <div key={i} className="relative flex items-center gap-3">
                      <div
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${f.color}28, ${f.color}12)`,
                          border: `1.5px solid ${f.color}33`,
                        }}
                      >
                        <I className="h-3 w-3" style={{ color: f.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-extrabold text-slate-700">
                          {f.label}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {f.sub}
                        </div>
                      </div>
                      <div className="rounded-xl px-3 py-1" style={{ background: `${f.color}16` }}>
                        <div className="text-[13px] font-black tracking-[-0.02em]" style={{ color: f.color }}>
                          {f.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card
            title="Workforce Snapshot"
            subtitle="Progress overview"
            accent="#f59e0b"
            className="order-3 lg:order-3"
            right={
              <button
                type="button"
                className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                onClick={() => nav("/dashboard/reports/attendance")}
              >
                Report <span className="ml-1">→</span>
              </button>
            }
          >
            <div className="px-5 py-4">
              <SnapRow
                label="Present Today"
                value={pres}
                max={total}
                fill="#10b981"
                track="#f0fdf4"
                badge={`${rate}%`}
                badgeBg="#f0fdf4"
                badgeTxt="#059669"
              />
              <SnapRow
                label="Absent Today"
                value={absent}
                max={total}
                fill="#f87171"
                track="#fef2f2"
              />
              <SnapRow
                label="Pending Leaves"
                value={leaves}
                max={Math.max(leaves, 10)}
                fill="#f59e0b"
                track="#fffbeb"
                badge={leaves > 0 ? "Action" : undefined}
                badgeBg="#fffbeb"
                badgeTxt="#92400e"
              />
            </div>
          </Card>
        </div>
      </div>
    </Flex>
  );
};

/* ════════════════════════════════════════════
   MANAGER DASHBOARD
════════════════════════════════════════════ */
const ManagerDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const nav      = useNavigate();
  const clock    = useClock();
  const name     = user?.name?.split(" ")[0] || "Manager";
  const today    = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" });

  const total  = data.summary.totalEmployees  || 0;
  const pres   = data.summary.attendanceToday  || 0;
  const leaves = data.summary.pendingLeaves    || 0;
  const absent = Math.max(0, total - pres);
  const rate   = total ? Math.round((pres / total) * 100) : 0;

  const chartData  = data.attendance.map((i) => ({ name: i._id.slice(5), Present: i.present, Absent: i.absent }));
  const leaveList = data.leaves.map((i) => ({ name: i._id, value: i.total }));
  if (!leaveList.length) leaveList.push({ name: "No Data", value: 0 });
  const presTotal = chartData.reduce((s, i) => s + (i.Present || 0), 0);
  const absTotal  = chartData.reduce((s, i) => s + (i.Absent  || 0), 0);
  const leavTotal = data.leaves.reduce((s, l) => s + l.total, 0);

  const sparkPresent = chartData.slice(-8).map((d) => d.Present);

  const kpiCards = [
    { label: "Total Staff",     value: total,      sub: "Active employees",         gradient: "linear(135deg, #10b981 0%, #059669 100%)", icon: FaUsers },
    { label: "Present Today",   value: pres,        sub: `${rate}% rate`,            gradient: "linear(135deg, #3b82f6 0%, #1d4ed8 100%)", icon: FaUserCheck, sparkData: sparkPresent },
    { label: "Attendance Rate", value: `${rate}%`, sub: `${presTotal} total present`, gradient: "linear(135deg, #f59e0b 0%, #d97706 100%)", icon: FaCalendarCheck },
    { label: "Absent Today",    value: absent,      sub: `${absTotal} total absent`,  gradient: "linear(135deg, #ef4444 0%, #dc2626 100%)", icon: FaUserTimes },
  ];

  const quickLinks = [
    { label: "Employees",  sub: `${total} total`,    icon: FaUsers,         color: "#10b981", to: "/dashboard/employees" },
    { label: "Attendance", sub: "View today",         icon: FaCalendarCheck, color: "#6366f1", to: "/dashboard/attendance/daily" },
    { label: "Leaves",     sub: `${leaves} pending`, icon: FaClipboardList, color: "#f59e0b", to: "/dashboard/leaves" },
    { label: "Reports",    sub: "View all",           icon: FaChartBar,      color: "#0ea5e9", to: "/dashboard/reports/attendance" },
  ];

  const feedItems = [
    { icon: FaUserCheck,     color: "#10b981", label: "Present Today",     value: pres,   sub: `${rate}% attendance rate` },
    { icon: FaClipboardList, color: "#f59e0b", label: "Pending Leaves",    value: leaves, sub: "Needs your review" },
    { icon: FaUserTimes,     color: "#ef4444", label: "Absent / Unmarked", value: absent, sub: "Not marked today" },
  ];

  return (
    <Flex
      direction="column"
      gap={4}
      mx={{ base: -4, md: -6 }}
      mt={{ base: -4, md: -6 }}
      mb={{ base: -4, md: -6 }}
      minH="calc(100vh - 64px)"
      overflow="hidden"
      bg="#f0f4ff"
      px={5}
      pt={4}
      pb={4}
    >

      {/* ════ WELCOME BANNER ════ */}
      <Box
        bgGradient="linear(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)"
        borderRadius="20px" px={6} py={4} flexShrink={0}
        position="relative" overflow="hidden">
        <Box pos="absolute" top="-30px" right="120px" w="140px" h="140px"
          borderRadius="full" bg="rgba(16,185,129,0.06)" />
        <Box pos="absolute" top="-20px" right="-20px" w="100px" h="100px"
          borderRadius="full" bg="rgba(99,102,241,0.07)" />

        <Flex justify="space-between" align="center" position="relative">
          <Box>
            <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="-0.02em">
              {greet()}, {name}
            </Text>
            <Text fontSize="11px" color="rgba(255,255,255,0.35)" mt={0.5} fontWeight="500">
              {today} · Manager View
            </Text>
          </Box>
          <Flex align="center" gap={2.5} flexShrink={0}>
            <Flex align="center" gap={2} px={3} py={1.5}
              bg="rgba(255,255,255,0.07)" borderRadius="12px"
              border="1px solid rgba(255,255,255,0.1)">
              <Icon as={FaClock} color="rgba(255,255,255,0.4)" boxSize={3} />
              <Text fontSize="12px" fontWeight="700" color="white"
                letterSpacing="0.04em" fontFamily="'Courier New', monospace">{clock}</Text>
            </Flex>
            <Flex align="center" gap={1.5} px={3} py={1.5}
              bg="rgba(255,255,255,0.07)" borderRadius="12px"
              border="1px solid rgba(255,255,255,0.1)">
              <Box w={2} h={2} borderRadius="full" bg="#22c55e"
                boxShadow="0 0 0 3px rgba(34,197,94,0.22)" />
              <Text fontSize="11px" color="rgba(255,255,255,0.6)" fontWeight="600">Live</Text>
            </Flex>
            <Avatar name={user?.name} size="sm" bg="#10b981" color="white" fontWeight="800"
              boxShadow="0 0 0 2px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3)" />
          </Flex>
        </Flex>
      </Box>

      {/* ════ BELOW-HEADER DASHBOARD (REDESIGNED) ════ */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        {/* subtle enterprise background lines */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: [
              "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px)",
              "linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
              "linear-gradient(135deg, rgba(6,95,70,0.07) 0%, transparent 45%)",
              "linear-gradient(315deg, rgba(99,102,241,0.06) 0%, transparent 45%)",
            ].join(", "),
            backgroundSize: "64px 64px, 64px 64px, 100% 100%, 100% 100%",
            opacity: 0.55,
            maskImage:
              "radial-gradient(ellipse at top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.0) 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.0) 85%)",
          }}
        />
        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:auto-rows-fr">
          {kpiCards.map((k) => (
            <MetricCard
              key={k.label}
              label={k.label}
              value={k.value}
              sub={k.sub}
              icon={k.icon}
              gradient={k.gradient}
              spark={
                k.sparkData ? (
                  <Sparkline
                    data={k.sparkData}
                    color="rgba(255,255,255,0.75)"
                    width={120}
                    height={26}
                  />
                ) : null
              }
            />
          ))}
        </div>

        {/* Main grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">

          <Card
            title="Monthly Attendance Trend"
            subtitle="Present vs Absent"
            accent="#10b981"
            className="min-h-[320px] xl:min-h-0"
            right={
              <button
                type="button"
                className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                onClick={() => nav("/dashboard/attendance/daily")}
              >
                View daily <span className="ml-1">→</span>
              </button>
            }
          >
            <div className="px-5 pt-2 pb-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-[4px]"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  />
                  <span className="text-[11px] font-semibold text-slate-500">
                    Present ({presTotal})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-[2px] w-6 rounded-full"
                    style={{ borderTop: "2px dashed #f87171" }}
                  />
                  <span className="text-[11px] font-semibold text-slate-500">
                    Absent ({absTotal})
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[260px] px-4 pb-4">
              {chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
                  <FaCalendarCheck className="h-10 w-10 opacity-40" />
                  <div className="text-sm font-medium">No data yet</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#eef2f7" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    />
                    <ReTip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                    <Bar dataKey="Present" name="Present" fill="url(#barGradM)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                    <Line
                      type="monotone"
                      dataKey="Absent"
                      name="Absent"
                      stroke="#f87171"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray="5 3"
                      activeDot={{ r: 5, fill: "#f87171", stroke: "white", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <div className="grid min-h-0 grid-cols-1 gap-4">
            <Card title="Today's Overview" subtitle="Live snapshot" accent="#6366f1" className="min-h-[220px]">
              <div className="flex items-center justify-between gap-4 px-5 py-5">
                <div className="relative">
                  <div className="rotate-[-90deg]">
                    <DonutRing value={pres} max={total} color="#10b981" size={120} thickness={12} />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[22px] font-black tracking-[-0.02em] text-slate-800 leading-none">
                      {rate}%
                    </div>
                    <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      Rate
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-2">
                  <div className="rounded-2xl p-3 text-center" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                    <div className="text-[20px] font-black leading-none" style={{ color: "#059669" }}>
                      {pres}
                    </div>
                    <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#059669" }}>
                      Present
                    </div>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
                    <div className="text-[20px] font-black leading-none" style={{ color: "#dc2626" }}>
                      {absent}
                    </div>
                    <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "#dc2626" }}>
                      Absent
                    </div>
                  </div>
                  <div className="col-span-2 mt-1 flex items-center justify-between rounded-2xl px-3 py-2" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
                    <div className="text-[11px] font-semibold" style={{ color: "#92400e" }}>
                      Pending Leaves
                    </div>
                    <div className="rounded-full px-2 py-1 text-[10px] font-extrabold" style={{ background: "#fde68a", color: "#92400e" }}>
                      {leaves}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Leave Breakdown"
              subtitle="By type"
              accent="#f59e0b"
              right={
                <button
                  type="button"
                  className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                  onClick={() => nav("/dashboard/leaves")}
                >
                  View all <span className="ml-1">→</span>
                </button>
              }
              className="min-h-[240px] xl:min-h-0"
            >
              <div className="max-h-[320px] overflow-auto px-4 py-4">
                <div className="space-y-2">
                  {leaveList.map((item) => {
                    const cfg = leaveCfg(item.name);
                    const pct = leavTotal ? Math.round((item.value / leavTotal) * 100) : 0;
                    return (
                      <div
                        key={item.name}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:bg-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)]"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
                            <div className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                          </div>
                          <div className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-slate-800">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[12px] font-black" style={{ color: cfg.color }}>
                              {item.value}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">
                              {pct}%
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: cfg.grad }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card
            title="Quick Access"
            subtitle="Shortcuts"
            accent="#0ea5e9"
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-2">
              {quickLinks.map((a) => {
                const I = a.icon;
                return (
                  <button
                    type="button"
                    key={a.label}
                    onClick={() => nav(a.to)}
                    className={[
                      "group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left",
                      "shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out",
                      "hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]",
                      "focus:outline-none focus:ring-2 focus:ring-slate-200",
                    ].join(" ")}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
                      style={{
                        background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}cc 100%)`,
                        boxShadow: `0 8px 18px ${a.color}33`,
                      }}
                    >
                      <I className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-extrabold text-slate-700">
                        {a.label}
                      </span>
                      <span className="block truncate text-[10px] font-medium text-slate-400">
                        {a.sub}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Activity Summary" subtitle="Key metrics" accent="#8b5cf6" className="order-2 lg:order-1">
            <div className="relative px-5 py-4">
              <div
                className="absolute left-[26px] top-6 bottom-6 w-[2px]"
                style={{ background: "linear-gradient(180deg, #8b5cf655, #e2e8f0)" }}
              />
              <div className="space-y-3">
                {feedItems.map((f, i) => {
                  const I = f.icon;
                  return (
                    <div key={i} className="relative flex items-center gap-3">
                      <div
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${f.color}28, ${f.color}12)`,
                          border: `1.5px solid ${f.color}33`,
                        }}
                      >
                        <I className="h-3 w-3" style={{ color: f.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-extrabold text-slate-700">
                          {f.label}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {f.sub}
                        </div>
                      </div>
                      <div className="rounded-xl px-3 py-1" style={{ background: `${f.color}16` }}>
                        <div className="text-[13px] font-black tracking-[-0.02em]" style={{ color: f.color }}>
                          {f.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card
            title="Workforce Snapshot"
            subtitle="Progress overview"
            accent="#f59e0b"
            className="order-3 lg:order-3"
            right={
              <button
                type="button"
                className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                onClick={() => nav("/dashboard/reports/attendance")}
              >
                Report <span className="ml-1">→</span>
              </button>
            }
          >
            <div className="px-5 py-4">
              <SnapRow
                label="Present Today"
                value={pres}
                max={total}
                fill="#10b981"
                track="#f0fdf4"
                badge={`${rate}%`}
                badgeBg="#f0fdf4"
                badgeTxt="#059669"
              />
              <SnapRow
                label="Absent Today"
                value={absent}
                max={total}
                fill="#f87171"
                track="#fef2f2"
              />
              <SnapRow
                label="Pending Leaves"
                value={leaves}
                max={Math.max(leaves, 10)}
                fill="#f59e0b"
                track="#fffbeb"
                badge={leaves > 0 ? "Action" : undefined}
                badgeBg="#fffbeb"
                badgeTxt="#92400e"
              />
            </div>
          </Card>
        </div>
      </div>
    </Flex>
  );
};

/* ════════════════════════════════════════════
   LOADING
════════════════════════════════════════════ */
const LoadingScreen = () => (
  <Flex justify="center" align="center" h="100vh" direction="column" gap={5} bg="#f0f4ff">
    <Box position="relative" w="52px" h="52px">
      <Spinner size="xl" color="#10b981" thickness="3px" speed="0.65s"
        emptyColor="#e2e8f0" w="52px" h="52px" />
      <Flex position="absolute" inset={0} align="center" justify="center">
        <Text fontSize="16px" fontWeight="800" color="#10b981">W</Text>
      </Flex>
    </Box>
    <Box textAlign="center">
      <Text fontSize="14px" fontWeight="700" color="gray.700" letterSpacing="-0.01em">WorkSphere HRMS</Text>
      <Text fontSize="12px" color="gray.400" mt={1} fontWeight="500">Loading your dashboard...</Text>
    </Box>
  </Flex>
);

/* ════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════ */
const DashboardHome = () => {
  const { user }  = useContext(AuthContext);
  const isManager = user?.role === "Manager";
  const [data, setData] = useState({
    summary:    { totalEmployees: 0, attendanceToday: 0, pendingLeaves: 0, monthlyPayroll: 0 },
    attendance: [], leaves: [], payroll: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const reqs = [
          api.get("/dashboard/summary"),
          api.get("/dashboard/attendance-chart"),
          api.get("/dashboard/leave-stats"),
        ];
        if (!isManager) reqs.push(api.get("/dashboard/payroll-stats"));
        const res = await Promise.all(reqs);
        setData({
          summary:    res[0].data,
          attendance: res[1].data,
          leaves:     res[2].data,
          payroll:    res[3]?.data || [],
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [isManager]);

  if (loading) return <LoadingScreen />;
  return isManager ? <ManagerDashboard data={data} /> : <AdminDashboard data={data} />;
};

export default DashboardHome;




