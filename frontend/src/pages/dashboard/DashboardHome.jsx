import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Box, Flex, Text, Icon, Spinner, Avatar } from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaClock, FaUserCheck, FaUserTimes, FaChartBar,
} from "react-icons/fa";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTip, ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/dashboard/Card";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { Sparkline } from "../../components/dashboard/Sparkline";
import { ChartTooltip } from "../../components/dashboard/ChartTooltip";

/* ── Helpers ── */
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

const Rs = (n) =>
  n >= 1_000_000 ? `Rs ${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `Rs ${(n / 1_000).toFixed(0)}K`
  : `Rs ${n || 0}`;

const useClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

/* ── SVG Donut Ring ── */
const DonutRing = ({ value, max, color, size = 110, thickness = 11 }) => {
  const pct  = max ? Math.min(1, value / max) : 0;
  const r    = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const c    = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={thickness} />
      <circle
        cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={thickness}
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)",
          filter: `drop-shadow(0 0 6px ${color}cc)`,
        }}
      />
    </svg>
  );
};

/* ── Workforce Snapshot Row ── */
const SnapRow = ({ label, value, max, fill, track, badge, badgeBg, badgeTxt }) => {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <Box mb={3.5}>
      <Flex justify="space-between" align="center" mb={1.5}>
        <Flex align="center" gap={2}>
          <Box w="9px" h="9px" borderRadius="3px" bg={fill} />
          <Text fontSize="12px" color="#64748b" fontWeight="600">{label}</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Text fontSize="14px" fontWeight="900" color="#d0dce8">{value}</Text>
          {badge && (
            <Box as="span" bg={badgeBg} color={badgeTxt} borderRadius="full"
              fontSize="9px" px="6px" py="2px" fontWeight="700">{badge}</Box>
          )}
        </Flex>
      </Flex>
      <Box bg={track} borderRadius="full" h="8px" overflow="hidden">
        <Box
          bg={fill} h="100%" borderRadius="full" w={`${pct}%`}
          transition="width 1.2s cubic-bezier(0.4,0,0.2,1)"
          style={{ boxShadow: `0 0 10px ${fill}cc` }}
        />
      </Box>
    </Box>
  );
};

/* ── Leave type colors ── */
const LEAVE_CFG = {
  Sick:   { color: "#f87171", bg: "rgba(248,113,113,0.1)",  grad: "linear-gradient(90deg,#f87171,#fca5a5)" },
  Annual: { color: "#818cf8", bg: "rgba(129,140,248,0.1)",  grad: "linear-gradient(90deg,#818cf8,#a5b4fc)" },
  Casual: { color: "#34d399", bg: "rgba(52,211,153,0.1)",   grad: "linear-gradient(90deg,#34d399,#6ee7b7)" },
};
const leaveCfg = (n) =>
  LEAVE_CFG[n] || { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", grad: "linear-gradient(90deg,#a78bfa,#c4b5fd)" };

/* ── Welcome Banner ── */
const WelcomeBanner = ({ userName, subtitle }) => {
  const clock = useClock();
  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" });
  return (
    <Box
      bgGradient="linear(135deg, #020c1b 0%, #0d2340 55%, #021024 100%)"
      borderRadius="20px" px={6} py={5} position="relative" overflow="hidden" mb={5}
      border="1px solid rgba(255,255,255,0.07)"
      boxShadow="0 4px 24px rgba(0,0,0,0.4)"
    >
      {/* Accent orbs */}
      <Box pos="absolute" top="-40px" right="140px" w="160px" h="160px" borderRadius="full"
        bg="rgba(16,185,129,0.08)" style={{ filter: "blur(20px)" }} />
      <Box pos="absolute" top="-30px" right="-30px"  w="120px" h="120px" borderRadius="full"
        bg="rgba(99,102,241,0.1)"  style={{ filter: "blur(16px)" }} />
      {/* Green glow bar */}
      <Box position="absolute" top={0} left={0} right={0} h="2px"
        bg="linear-gradient(90deg,#10b981,rgba(16,185,129,0.1))" />

      <Flex justify="space-between" align="center" position="relative">
        <Box>
          <Text fontSize="19px" fontWeight="800" color="#f0f4ff" letterSpacing="-0.025em">
            {greet()}, {userName}
          </Text>
          <Text fontSize="12px" color="rgba(148,163,184,0.7)" mt={1} fontWeight="500">
            {today} · {subtitle}
          </Text>
        </Box>

        <Flex align="center" gap={3} flexShrink={0}>
          <Flex align="center" gap={2} px={3} py="7px"
            bg="rgba(255,255,255,0.06)" borderRadius="12px"
            border="1px solid rgba(255,255,255,0.1)">
            <Icon as={FaClock} color="rgba(255,255,255,0.35)" boxSize="11px" />
            <Text fontSize="12px" fontWeight="700" color="#d0dce8"
              letterSpacing="0.04em" fontFamily="'Courier New', monospace">{clock}</Text>
          </Flex>
          <Flex align="center" gap={2} px={3} py="7px"
            bg="rgba(255,255,255,0.06)" borderRadius="12px"
            border="1px solid rgba(255,255,255,0.1)">
            <Box w="7px" h="7px" borderRadius="full" bg="#22c55e"
              style={{ boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" }} />
            <Text fontSize="11px" color="rgba(255,255,255,0.55)" fontWeight="600">Live</Text>
          </Flex>
          <Avatar name={userName} size="sm" bg="#10b981" color="white" fontWeight="800"
            boxShadow="0 0 0 2px rgba(16,185,129,0.35), 0 4px 12px rgba(0,0,0,0.4)" />
        </Flex>
      </Flex>
    </Box>
  );
};

/* ── Shared Dashboard Layout ── */
const DashboardLayout = ({
  user, kpiCards, feedItems, quickLinks,
  total, pres, absent, leaves, rate,
  chartData, leaveList, nav,
}) => {
  const totalLeaves = leaveList.reduce((s, l) => s + l.value, 0);

  return (
    <Box>
      <WelcomeBanner
        userName={user?.name?.split(" ")[0] || "User"}
        subtitle={user?.role === "Manager" ? "Manager View" : "WorkSphere HRMS"}
      />

      {/* KPI Row */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => (
          <MetricCard
            key={k.label}
            label={k.label}
            value={k.value}
            sub={k.sub}
            icon={k.icon}
            gradient={k.gradient}
            spark={
              k.sparkData
                ? <Sparkline data={k.sparkData} color="rgba(255,255,255,0.7)" width={120} height={26} />
                : null
            }
          />
        ))}
      </div>

      {/* Middle Row */}
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">

        {/* Attendance Chart */}
        <Card
          title="Attendance Trend"
          subtitle="Present vs Absent — current month"
          accent="#10b981"
          right={
            <button type="button" onClick={() => nav("/dashboard/attendance")}
              className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition"
              style={{ color: "#4a6080", background: "transparent" }}
              onMouseEnter={(e) => { e.target.style.color = "#d0dce8"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.target.style.color = "#4a6080"; e.target.style.background = "transparent"; }}>
              View daily →
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-4 px-5 pb-1 pt-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[4px]"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)" }} />
              <span className="text-[11px] font-semibold" style={{ color: "#4a6080" }}>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-6" style={{ borderTop: "2px dashed #f87171" }} />
              <span className="text-[11px] font-semibold" style={{ color: "#4a6080" }}>Absent</span>
            </div>
          </div>
          <div className="h-[250px] px-4 pb-4">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-sm" style={{ color: "#4a6080" }}>No attendance data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#4a6080", fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#4a6080", fontWeight: 600 }} />
                  <ReTip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="Present" name="Present" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={32} />
                  <Line type="monotone" dataKey="Absent" name="Absent" stroke="#f87171"
                    strokeWidth={2.5} dot={false} strokeDasharray="5 3"
                    activeDot={{ r: 5, fill: "#f87171", stroke: "#0a1f35", strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Right Rail */}
        <div className="flex flex-col gap-4">

          {/* Today's Overview */}
          <Card title="Today's Overview" subtitle="Live snapshot" accent="#818cf8">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="relative flex-shrink-0">
                <DonutRing value={pres} max={total} color="#10b981" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[20px] font-black leading-none tracking-[-0.02em]"
                    style={{ color: "#d0dce8" }}>{rate}%</div>
                  <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em]"
                    style={{ color: "#4a6080" }}>Rate</div>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-2">
                <div className="rounded-2xl p-3 text-center"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <div className="text-[20px] font-black leading-none" style={{ color: "#34d399" }}>{pres}</div>
                  <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#34d399" }}>Present</div>
                </div>
                <div className="rounded-2xl p-3 text-center"
                  style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <div className="text-[20px] font-black leading-none" style={{ color: "#f87171" }}>{absent}</div>
                  <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#f87171" }}>Absent</div>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded-2xl px-3 py-2"
                  style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <div className="text-[11px] font-semibold" style={{ color: "#fbbf24" }}>Pending Leaves</div>
                  <div className="rounded-full px-2 py-1 text-[10px] font-extrabold"
                    style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>{leaves}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Leave Breakdown */}
          <Card title="Leave Breakdown" subtitle="By type" accent="#f59e0b"
            right={
              <button type="button" onClick={() => nav("/dashboard/leaves")}
                className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition"
                style={{ color: "#4a6080", background: "transparent" }}
                onMouseEnter={(e) => { e.target.style.color = "#d0dce8"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { e.target.style.color = "#4a6080"; e.target.style.background = "transparent"; }}>
                View all →
              </button>
            }
          >
            <div className="space-y-2 px-4 py-4">
              {leaveList.length === 0 ? (
                <div className="py-4 text-center text-[12px]" style={{ color: "#4a6080" }}>No leave data</div>
              ) : (
                leaveList.map((item) => {
                  const cfg = leaveCfg(item.name);
                  const pct = totalLeaves ? Math.round((item.value / totalLeaves) * 100) : 0;
                  return (
                    <div key={item.name}
                      className="rounded-xl px-3 py-2 transition"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}>
                      <div className="mb-1.5 flex items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: cfg.bg }}>
                          <div className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                        </div>
                        <div className="min-w-0 flex-1 truncate text-[12px] font-bold"
                          style={{ color: "#d0dce8" }}>{item.name}</div>
                        <div className="text-[12px] font-black" style={{ color: cfg.color }}>{item.value}</div>
                        <div className="text-[10px] font-medium" style={{ color: "#4a6080" }}>{pct}%</div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: cfg.grad, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Activity Summary */}
        <Card title="Activity Summary" subtitle="Key metrics" accent="#a78bfa">
          <div className="relative px-5 py-4">
            <div className="absolute bottom-6 left-[26px] top-6 w-[2px]"
              style={{ background: "linear-gradient(180deg,rgba(167,139,250,0.5),rgba(255,255,255,0.04))" }} />
            <div className="space-y-3">
              {feedItems.map((f, i) => {
                const I = f.icon;
                return (
                  <div key={i} className="relative flex items-center gap-3">
                    <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `linear-gradient(135deg,${f.color}22,${f.color}0e)`,
                        border: `1.5px solid ${f.color}30`,
                      }}>
                      <I className="h-3 w-3" style={{ color: f.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-extrabold" style={{ color: "#d0dce8" }}>{f.label}</div>
                      <div className="text-[10px] font-medium" style={{ color: "#4a6080" }}>{f.sub}</div>
                    </div>
                    <div className="flex-shrink-0 rounded-xl px-3 py-1"
                      style={{ background: `${f.color}18` }}>
                      <div className="text-[13px] font-black" style={{ color: f.color }}>{f.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Quick Access */}
        <Card title="Quick Access" subtitle="Shortcuts" accent="#38bdf8">
          <div className="grid grid-cols-2 gap-2 px-5 py-4">
            {quickLinks.map((a) => {
              const I = a.icon;
              return (
                <button
                  type="button"
                  key={a.label}
                  onClick={() => nav(a.to)}
                  className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white"
                    style={{
                      background: `linear-gradient(135deg,${a.color},${a.color}bb)`,
                      boxShadow: `0 4px 12px ${a.color}44`,
                    }}
                  >
                    <I className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-extrabold" style={{ color: "#d0dce8" }}>{a.label}</span>
                    <span className="block truncate text-[10px] font-medium" style={{ color: "#4a6080" }}>{a.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Workforce Snapshot */}
        <Card title="Workforce Snapshot" subtitle="Progress overview" accent="#f59e0b"
          right={
            <button type="button" onClick={() => nav("/dashboard/reports/attendance")}
              className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition"
              style={{ color: "#4a6080", background: "transparent" }}
              onMouseEnter={(e) => { e.target.style.color = "#d0dce8"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.target.style.color = "#4a6080"; e.target.style.background = "transparent"; }}>
              Report →
            </button>
          }
        >
          <div className="px-5 py-4">
            <SnapRow
              label="Present Today" value={pres} max={total}
              fill="#10b981" track="rgba(16,185,129,0.1)"
              badge={`${rate}%`} badgeBg="rgba(16,185,129,0.2)" badgeTxt="#34d399"
            />
            <SnapRow
              label="Absent Today" value={absent} max={total}
              fill="#f87171" track="rgba(248,113,113,0.1)"
            />
            <SnapRow
              label="Pending Leaves" value={leaves} max={Math.max(leaves, 10)}
              fill="#fbbf24" track="rgba(251,191,36,0.1)"
              badge={leaves > 0 ? "Action" : undefined}
              badgeBg="rgba(251,191,36,0.2)" badgeTxt="#fbbf24"
            />
          </div>
        </Card>
      </div>
    </Box>
  );
};

/* ── Loading Screen ── */
const Loading = () => (
  <Flex justify="center" align="center" h="60vh" direction="column" gap={4}>
    <Box position="relative" w="48px" h="48px">
      <Spinner size="xl" color="#10b981" thickness="3px" speed="0.65s"
        emptyColor="rgba(255,255,255,0.07)" w="48px" h="48px" />
      <Flex position="absolute" inset={0} align="center" justify="center">
        <Text fontSize="15px" fontWeight="800" color="#10b981">W</Text>
      </Flex>
    </Box>
    <Box textAlign="center">
      <Text fontSize="14px" fontWeight="700" color="#d0dce8">WorkSphere HRMS</Text>
      <Text fontSize="12px" color="#4a6080" mt={1}>Loading dashboard…</Text>
    </Box>
  </Flex>
);

/* ── Main Export ── */
const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const isManager = user?.role === "Manager";

  const [data, setData] = useState({ summary: {}, attendance: [], leaves: [] });
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isManager]);

  if (loading) return <Loading />;

  const total   = data.summary.totalEmployees  || 0;
  const pres    = data.summary.attendanceToday  || 0;
  const leaves  = data.summary.pendingLeaves    || 0;
  const payroll = data.summary.monthlyPayroll   || 0;
  const absent  = Math.max(0, total - pres);
  const rate    = total ? Math.round((pres / total) * 100) : 0;

  const chartData    = data.attendance.map((i) => ({ name: i._id.slice(5), Present: i.present, Absent: i.absent }));
  const leaveList    = data.leaves.map((i) => ({ name: i._id, value: i.total }));
  const curMonth     = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const sparkPresent = chartData.slice(-8).map((d) => d.Present);

  const kpiCards = isManager
    ? [
        { label: "Total Staff",     value: total,      sub: "Active employees",  gradient: "linear-gradient(135deg,#10b981,#059669)", icon: FaUsers },
        { label: "Present Today",   value: pres,        sub: `${rate}% rate`,    gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", icon: FaUserCheck, sparkData: sparkPresent },
        { label: "Attendance Rate", value: `${rate}%`, sub: "Today's rate",      gradient: "linear-gradient(135deg,#f59e0b,#d97706)", icon: FaCalendarCheck },
        { label: "Absent Today",    value: absent,      sub: "Not checked in",   gradient: "linear-gradient(135deg,#ef4444,#dc2626)", icon: FaUserTimes },
      ]
    : [
        { label: "Total Employees", value: total,       sub: "Active staff",       gradient: "linear-gradient(135deg,#10b981,#059669)", icon: FaUsers },
        { label: "Present Today",   value: pres,         sub: `${rate}% rate`,     gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", icon: FaUserCheck, sparkData: sparkPresent },
        { label: "Pending Leaves",  value: leaves,       sub: "Awaiting approval", gradient: "linear-gradient(135deg,#f59e0b,#d97706)", icon: FaClipboardList },
        { label: "Monthly Payroll", value: Rs(payroll),  sub: curMonth,            gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", icon: FaMoneyBillWave },
      ];

  const quickLinks = isManager
    ? [
        { label: "Employees",  sub: `${total} total`,    icon: FaUsers,         color: "#10b981", to: "/dashboard/employees" },
        { label: "Attendance", sub: "View today",         icon: FaCalendarCheck, color: "#818cf8", to: "/dashboard/attendance" },
        { label: "Leaves",     sub: `${leaves} pending`, icon: FaClipboardList, color: "#fbbf24", to: "/dashboard/leaves" },
        { label: "Reports",    sub: "Attendance",         icon: FaChartBar,      color: "#38bdf8", to: "/dashboard/reports/attendance" },
      ]
    : [
        { label: "Employees",  sub: `${total} total`,    icon: FaUsers,         color: "#10b981", to: "/dashboard/employees" },
        { label: "Attendance", sub: "View today",         icon: FaCalendarCheck, color: "#818cf8", to: "/dashboard/attendance" },
        { label: "Payroll",    sub: curMonth,             icon: FaMoneyBillWave, color: "#38bdf8", to: "/dashboard/payroll" },
        { label: "Leaves",     sub: `${leaves} pending`, icon: FaClipboardList, color: "#fbbf24", to: "/dashboard/leaves" },
      ];

  const feedItems = isManager
    ? [
        { icon: FaUserCheck,     color: "#10b981", label: "Present Today",     value: pres,        sub: `${rate}% attendance rate` },
        { icon: FaClipboardList, color: "#fbbf24", label: "Pending Leaves",    value: leaves,      sub: "Needs your review" },
        { icon: FaUserTimes,     color: "#f87171", label: "Absent / Unmarked", value: absent,      sub: "Not marked today" },
      ]
    : [
        { icon: FaUserCheck,     color: "#10b981", label: "Present Today",   value: pres,        sub: `${rate}% attendance rate` },
        { icon: FaClipboardList, color: "#fbbf24", label: "Pending Leaves",  value: leaves,      sub: "Awaiting approval" },
        { icon: FaMoneyBillWave, color: "#a78bfa", label: "Monthly Payroll", value: Rs(payroll), sub: curMonth },
      ];

  return (
    <DashboardLayout
      user={user}
      kpiCards={kpiCards}
      feedItems={feedItems}
      quickLinks={quickLinks}
      total={total}
      pres={pres}
      absent={absent}
      leaves={leaves}
      rate={rate}
      chartData={chartData}
      leaveList={leaveList}
      nav={nav}
    />
  );
};

export default DashboardHome;
