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

/* ── Mini Sparkline ── */
const Sparkline = ({ data, color = "rgba(255,255,255,0.8)", width = 110, height = 28 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 4;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const fillPts = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={fillPts} fill={color} fillOpacity={0.15} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Gradient KPI Card ── */
const KPICard = ({ label, value, sub, gradient, icon, sparkData }) => (
  <Box bgGradient={gradient} borderRadius="20px" px={5} pt={4} pb={3}
    position="relative" overflow="hidden"
    _hover={{ transform: "translateY(-4px)", boxShadow: "0 20px 50px rgba(0,0,0,0.22)" }}
    transition="all 0.28s cubic-bezier(0.34,1.56,0.64,1)" cursor="default">
    <Box pos="absolute" top="-20px" right="-20px" w="105px" h="105px"
      borderRadius="full" bg="rgba(255,255,255,0.1)" />
    <Box pos="absolute" bottom="-32px" left="-14px" w="85px" h="85px"
      borderRadius="full" bg="rgba(255,255,255,0.06)" />
    <Box pos="absolute" top="50%" right="55px" w="55px" h="55px"
      borderRadius="full" bg="rgba(255,255,255,0.04)"
      style={{ transform: "translateY(-50%)" }} />

    <Flex justify="space-between" align="flex-start" position="relative">
      <Box flex={1} minW={0}>
        <Text fontSize="10px" color="rgba(255,255,255,0.65)" fontWeight="700"
          textTransform="uppercase" letterSpacing="0.14em" mb={1.5}>{label}</Text>
        <Text fontSize="2xl" fontWeight="900" color="white" lineHeight="1.1"
          letterSpacing="-0.02em">{value}</Text>
        {sub && (
          <Text fontSize="10px" color="rgba(255,255,255,0.55)" mt={1} fontWeight="500">{sub}</Text>
        )}
      </Box>
      <Flex w="40px" h="40px" borderRadius="14px" bg="rgba(255,255,255,0.18)"
        align="center" justify="center" flexShrink={0}
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}>
        <Icon as={icon} color="white" boxSize="17px" />
      </Flex>
    </Flex>

    {sparkData && sparkData.length > 1 && (
      <Box mt={2.5} position="relative">
        <Sparkline data={sparkData} color="rgba(255,255,255,0.75)" width={110} height={26} />
      </Box>
    )}
  </Box>
);

/* ── Panel card ── */
const Panel = ({ title, accent = "#10b981", action, onAction, children, ...rest }) => (
  <Flex direction="column" bg="white" borderRadius="20px"
    boxShadow="0 2px 4px rgba(0,0,0,0.04), 0 8px 28px rgba(0,0,0,0.07)"
    border="1px solid rgba(0,0,0,0.05)" overflow="hidden" {...rest}>
    <Box h="3.5px" flexShrink={0}
      style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}55 100%)` }} />
    {title && (
      <Flex px={5} pt={3.5} pb={3} justify="space-between" align="center"
        flexShrink={0} borderBottom="1px solid" borderColor="gray.50">
        <Text fontWeight="700" fontSize="13px" color="gray.800" letterSpacing="-0.01em">{title}</Text>
        {action && (
          <Button size="xs" variant="ghost" borderRadius="lg" onClick={onAction}
            rightIcon={<Icon as={FaChevronRight} boxSize={2} />}
            fontSize="11px" px={2.5} h={6} color="gray.400" fontWeight="500"
            _hover={{ color: "gray.600", bg: "gray.50" }}>{action}</Button>
        )}
      </Flex>
    )}
    {children}
  </Flex>
);

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

/* ── Custom chart tooltip ── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box bg="white" borderRadius="14px"
      boxShadow="0 8px 32px rgba(0,0,0,0.14)" px={3.5} py={3}
      border="1px solid" borderColor="gray.100" minW="130px">
      <Text fontSize="11px" fontWeight="700" color="gray.400" mb={2}>{label}</Text>
      {payload.map((p, i) => (
        <Flex key={i} align="center" gap={2} mb={i < payload.length - 1 ? 1 : 0}>
          <Box w={2} h={2} borderRadius="3px" bg={p.color || p.stroke || p.fill} />
          <Text fontSize="12px" color="gray.500">{p.name}:</Text>
          <Text fontSize="12px" fontWeight="800" color="gray.800">{p.value}</Text>
        </Flex>
      ))}
    </Box>
  );
};

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
    <Flex direction="column" gap={4}
      mx={{ base: -4, md: -6 }} mt={{ base: -4, md: -6 }} mb={{ base: -4, md: -6 }}
      h="calc(100vh - 64px)" overflow="hidden"
      bg="#f0f4ff" px={5} pt={4} pb={4}>

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

      {/* ════ KPI CARDS ════ */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} flexShrink={0}>
        {kpiCards.map((k) => <KPICard key={k.label} {...k} />)}
      </Grid>

      {/* ════ MIDDLE ROW ════ */}
      <Grid flex={1} minH={0} templateColumns="1fr 300px" gap={4}>

        {/* Composed Chart: bars + line */}
        <Panel title="Attendance Trend" accent="#10b981">
          <Flex gap={5} px={5} pt={1} pb={2} flexShrink={0} align="center">
            <Flex align="center" gap={2}>
              <Box w={3} h={3} borderRadius="4px"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }} />
              <Text fontSize="11px" color="gray.500" fontWeight="600">Present</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w={3} h="2px" borderRadius="full" bg="#f87171"
                style={{ borderTop: "2px dashed #f87171" }} />
              <Text fontSize="11px" color="gray.500" fontWeight="600">Absent</Text>
            </Flex>
          </Flex>
          <ChartBox>
            {chartData.length === 0 ? (
              <Flex h="100%" align="center" justify="center" direction="column" gap={2}>
                <Icon as={FaCalendarCheck} boxSize={10} color="gray.200" />
                <Text color="gray.300" fontSize="sm">No attendance data yet</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                  <ReTip content={<ChartTip />}
                    cursor={{ fill: "rgba(148,163,184,0.06)", radius: 8 }} />
                  <Bar dataKey="Present" name="Present" fill="url(#barGradA)"
                    radius={[7, 7, 0, 0]} maxBarSize={30} />
                  <Line type="monotone" dataKey="Absent" name="Absent"
                    stroke="#f87171" strokeWidth={2.5} dot={false}
                    strokeDasharray="5 3"
                    activeDot={{ r: 5, fill: "#f87171", stroke: "white", strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </ChartBox>
        </Panel>

        {/* Right column — Today's Overview + Leave Breakdown */}
        <Flex direction="column" gap={4}>

          {/* Donut ring */}
          <Panel title="Today's Overview" accent="#6366f1" flex={1} minH={0}>
            <Flex direction="column" align="center" justify="center"
              flex={1} px={4} pb={3} pt={1} gap={3}>
              <Box position="relative">
                <DonutRing value={pres} max={total} color="#10b981" size={120} thickness={12} />
                <Flex position="absolute" inset={0} align="center" justify="center" direction="column">
                  <Text fontSize="22px" fontWeight="900" color="gray.800" lineHeight="1"
                    letterSpacing="-0.02em">{rate}%</Text>
                  <Text fontSize="9px" color="gray.400" fontWeight="700"
                    textTransform="uppercase" letterSpacing="0.08em">Rate</Text>
                </Flex>
              </Box>
              <Grid templateColumns="1fr 1fr" gap={2} w="100%">
                <Box borderRadius="13px" p={2.5} textAlign="center"
                  style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                  <Text fontSize="20px" fontWeight="900" color="#059669" lineHeight="1">{pres}</Text>
                  <Text fontSize="9px" fontWeight="700" color="#059669" mt={1}
                    textTransform="uppercase" letterSpacing="0.08em">Present</Text>
                </Box>
                <Box borderRadius="13px" p={2.5} textAlign="center"
                  style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
                  <Text fontSize="20px" fontWeight="900" color="#dc2626" lineHeight="1">{absent}</Text>
                  <Text fontSize="9px" fontWeight="700" color="#dc2626" mt={1}
                    textTransform="uppercase" letterSpacing="0.08em">Absent</Text>
                </Box>
              </Grid>
              <Flex w="100%" align="center" justify="space-between"
                px={3} py={2} borderRadius="12px"
                style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
                <Text fontSize="11px" color="#92400e" fontWeight="600">Pending Leaves</Text>
                <Badge style={{ background: "#fde68a" }} color="#92400e" borderRadius="full"
                  fontSize="10px" fontWeight="800" px={2}>{leaves}</Badge>
              </Flex>
            </Flex>
          </Panel>

          {/* Leave breakdown */}
          <Panel title="Leave Breakdown" accent="#f59e0b" flex={1} minH={0}
            action="View All" onAction={() => nav("/dashboard/leaves")}>
            <Box px={3} pb={3} flex={1} overflowY="auto">
              {leaveList.map((item) => {
                const cfg = leaveCfg(item.name);
                const pct = leavTotal ? Math.round((item.value / leavTotal) * 100) : 0;
                return (
                  <Box key={item.name} px={3} py={2} mb={1.5}
                    bg="#fafbfc" borderRadius="12px"
                    border="1px solid" borderColor="gray.100"
                    _hover={{ bg: "white", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}
                    transition="all 0.15s">
                    <Flex align="center" gap={2} mb={2}>
                      <Flex w={6} h={6} borderRadius="8px" bg={cfg.bg}
                        align="center" justify="center" flexShrink={0}>
                        <Box w="7px" h="7px" borderRadius="full" bg={cfg.color} />
                      </Flex>
                      <Text fontSize="11.5px" fontWeight="700" color="gray.800" flex={1} noOfLines={1}>{item.name}</Text>
                      <Flex align="center" gap={1.5}>
                        <Text fontSize="11px" fontWeight="900" color={cfg.color}>{item.value}</Text>
                        <Text fontSize="9px" color="gray.400" fontWeight="500">{pct}%</Text>
                      </Flex>
                    </Flex>
                    <Box bg="gray.100" borderRadius="full" h="5px" overflow="hidden">
                      <Box h="100%" borderRadius="full" w={`${pct}%`}
                        transition="width 0.8s ease"
                        style={{ background: cfg.grad }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Panel>
        </Flex>
      </Grid>

      {/* ════ BOTTOM ROW ════ */}
      <Grid flexShrink={0} templateColumns="1fr 1fr 1fr" gap={4} h="178px">

        {/* Timeline Activity Feed */}
        <Panel title="Activity Summary" accent="#8b5cf6">
          <Box px={4} pb={3} overflowY="hidden" position="relative">
            <Box position="absolute" left="30px" top="4px" bottom="10px" w="1.5px"
              style={{ background: "linear-gradient(180deg, #8b5cf655, #e2e8f0)" }} />
            {feedItems.map((f, i) => (
              <Flex key={i} align="center" gap={3} py={2} position="relative">
                <Flex w={7} h={7} borderRadius="10px" flexShrink={0}
                  align="center" justify="center" position="relative" zIndex={1}
                  style={{
                    background: `linear-gradient(135deg, ${f.color}28, ${f.color}12)`,
                    border: `1.5px solid ${f.color}33`,
                  }}>
                  <Icon as={f.icon} color={f.color} boxSize="11px" />
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="11.5px" color="gray.700" fontWeight="600" noOfLines={1}>{f.label}</Text>
                  <Text fontSize="10px" color="gray.400">{f.sub}</Text>
                </Box>
                <Box px={2.5} py={1} borderRadius="10px" flexShrink={0}
                  style={{ background: `${f.color}16` }}>
                  <Text fontSize="13px" fontWeight="900" color={f.color}
                    letterSpacing="-0.02em">{f.value}</Text>
                </Box>
              </Flex>
            ))}
          </Box>
        </Panel>

        {/* Quick Access with gradient icons */}
        <Panel title="Quick Access" accent="#0ea5e9">
          <Grid templateColumns="1fr 1fr" gap={2} px={4} pb={3}>
            {quickLinks.map((a) => (
              <Flex key={a.label} align="center" gap={2.5} px={3} py={2.5}
                bg="white" borderRadius="14px" cursor="pointer"
                border="1px solid" borderColor="gray.100"
                _hover={{
                  transform: "translateY(-2px)",
                  borderColor: `${a.color}55`,
                }}
                transition="all 0.22s cubic-bezier(0.34,1.56,0.64,1)"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                onClick={() => nav(a.to)}>
                <Flex w={8} h={8} borderRadius="12px" flexShrink={0}
                  align="center" justify="center"
                  style={{
                    background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}cc 100%)`,
                    boxShadow: `0 4px 12px ${a.color}44`,
                  }}>
                  <Icon as={a.icon} boxSize="13px" color="white" />
                </Flex>
                <Box minW={0}>
                  <Text fontSize="11px" fontWeight="700" color="gray.700" noOfLines={1}>{a.label}</Text>
                  <Text fontSize="9.5px" color="gray.400" noOfLines={1}>{a.sub}</Text>
                </Box>
              </Flex>
            ))}
          </Grid>
        </Panel>

        {/* Workforce Snapshot — glowing bars */}
        <Panel title="Workforce Snapshot" accent="#f59e0b"
          action="Report" onAction={() => nav("/dashboard/reports/attendance")}>
          <Box px={5} pt={2} pb={3}>
            <SnapRow label="Present Today"  value={pres}   max={total}
              fill="#10b981" track="#f0fdf4"
              badge={`${rate}%`} badgeBg="#f0fdf4" badgeTxt="#059669" />
            <SnapRow label="Absent Today"   value={absent} max={total}
              fill="#f87171" track="#fef2f2" />
            <SnapRow label="Pending Leaves" value={leaves} max={Math.max(leaves, 10)}
              fill="#f59e0b" track="#fffbeb"
              badge={leaves > 0 ? "Action" : undefined} badgeBg="#fffbeb" badgeTxt="#92400e" />
          </Box>
        </Panel>
      </Grid>
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
    <Flex direction="column" gap={4}
      mx={{ base: -4, md: -6 }} mt={{ base: -4, md: -6 }} mb={{ base: -4, md: -6 }}
      h="calc(100vh - 64px)" overflow="hidden"
      bg="#f0f4ff" px={5} pt={4} pb={4}>

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

      {/* ════ KPI CARDS ════ */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} flexShrink={0}>
        {kpiCards.map((k) => <KPICard key={k.label} {...k} />)}
      </Grid>

      {/* ════ MIDDLE ROW ════ */}
      <Grid flex={1} minH={0} templateColumns="1fr 300px" gap={4}>

        {/* Composed Chart */}
        <Panel title="Monthly Attendance Trend" accent="#10b981">
          <Flex gap={5} px={5} pt={1} pb={2} flexShrink={0} align="center">
            <Flex align="center" gap={2}>
              <Box w={3} h={3} borderRadius="4px"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }} />
              <Text fontSize="11px" color="gray.500" fontWeight="600">Present ({presTotal})</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w={3} h="2px" bg="#f87171"
                style={{ borderTop: "2px dashed #f87171" }} />
              <Text fontSize="11px" color="gray.500" fontWeight="600">Absent ({absTotal})</Text>
            </Flex>
          </Flex>
          <ChartBox>
            {chartData.length === 0 ? (
              <Flex h="100%" align="center" justify="center" direction="column" gap={2}>
                <Icon as={FaCalendarCheck} boxSize={10} color="gray.200" />
                <Text color="gray.300" fontSize="sm">No data yet</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                  <ReTip content={<ChartTip />}
                    cursor={{ fill: "rgba(148,163,184,0.06)", radius: 8 }} />
                  <Bar dataKey="Present" name="Present" fill="url(#barGradM)"
                    radius={[7, 7, 0, 0]} maxBarSize={30} />
                  <Line type="monotone" dataKey="Absent" name="Absent"
                    stroke="#f87171" strokeWidth={2.5} dot={false}
                    strokeDasharray="5 3"
                    activeDot={{ r: 5, fill: "#f87171", stroke: "white", strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </ChartBox>
        </Panel>

        {/* Right column */}
        <Flex direction="column" gap={4}>
          <Panel title="Today's Overview" accent="#6366f1" flex={1} minH={0}>
            <Flex direction="column" align="center" justify="center"
              flex={1} px={4} pb={3} pt={1} gap={3}>
              <Box position="relative">
                <DonutRing value={pres} max={total} color="#10b981" size={120} thickness={12} />
                <Flex position="absolute" inset={0} align="center" justify="center" direction="column">
                  <Text fontSize="22px" fontWeight="900" color="gray.800" lineHeight="1"
                    letterSpacing="-0.02em">{rate}%</Text>
                  <Text fontSize="9px" color="gray.400" fontWeight="700"
                    textTransform="uppercase" letterSpacing="0.08em">Rate</Text>
                </Flex>
              </Box>
              <Grid templateColumns="1fr 1fr" gap={2} w="100%">
                <Box borderRadius="13px" p={2.5} textAlign="center"
                  style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                  <Text fontSize="20px" fontWeight="900" color="#059669" lineHeight="1">{pres}</Text>
                  <Text fontSize="9px" fontWeight="700" color="#059669" mt={1}
                    textTransform="uppercase" letterSpacing="0.08em">Present</Text>
                </Box>
                <Box borderRadius="13px" p={2.5} textAlign="center"
                  style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
                  <Text fontSize="20px" fontWeight="900" color="#dc2626" lineHeight="1">{absent}</Text>
                  <Text fontSize="9px" fontWeight="700" color="#dc2626" mt={1}
                    textTransform="uppercase" letterSpacing="0.08em">Absent</Text>
                </Box>
              </Grid>
              <Flex w="100%" align="center" justify="space-between"
                px={3} py={2} borderRadius="12px"
                style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
                <Text fontSize="11px" color="#92400e" fontWeight="600">Pending Leaves</Text>
                <Badge style={{ background: "#fde68a" }} color="#92400e" borderRadius="full"
                  fontSize="10px" fontWeight="800" px={2}>{leaves}</Badge>
              </Flex>
            </Flex>
          </Panel>

          <Panel title="Leave Breakdown" accent="#f59e0b" flex={1} minH={0}
            action="View All" onAction={() => nav("/dashboard/leaves")}>
            <Box px={3} pb={3} flex={1} overflowY="auto">
              {leaveList.map((item) => {
                const cfg = leaveCfg(item.name);
                const pct = leavTotal ? Math.round((item.value / leavTotal) * 100) : 0;
                return (
                  <Box key={item.name} px={3} py={2} mb={1.5}
                    bg="#fafbfc" borderRadius="12px"
                    border="1px solid" borderColor="gray.100"
                    _hover={{ bg: "white", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}
                    transition="all 0.15s">
                    <Flex align="center" gap={2} mb={2}>
                      <Flex w={6} h={6} borderRadius="8px" bg={cfg.bg}
                        align="center" justify="center" flexShrink={0}>
                        <Box w="7px" h="7px" borderRadius="full" bg={cfg.color} />
                      </Flex>
                      <Text fontSize="11.5px" fontWeight="700" color="gray.800" flex={1} noOfLines={1}>{item.name}</Text>
                      <Flex align="center" gap={1.5}>
                        <Text fontSize="11px" fontWeight="900" color={cfg.color}>{item.value}</Text>
                        <Text fontSize="9px" color="gray.400" fontWeight="500">{pct}%</Text>
                      </Flex>
                    </Flex>
                    <Box bg="gray.100" borderRadius="full" h="5px" overflow="hidden">
                      <Box h="100%" borderRadius="full" w={`${pct}%`}
                        transition="width 0.8s ease"
                        style={{ background: cfg.grad }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Panel>
        </Flex>
      </Grid>

      {/* ════ BOTTOM ROW ════ */}
      <Grid flexShrink={0} templateColumns="1fr 1fr 1fr" gap={4} h="178px">

        {/* Timeline Activity Feed */}
        <Panel title="Activity Summary" accent="#8b5cf6">
          <Box px={4} pb={3} overflowY="hidden" position="relative">
            <Box position="absolute" left="30px" top="4px" bottom="10px" w="1.5px"
              style={{ background: "linear-gradient(180deg, #8b5cf655, #e2e8f0)" }} />
            {feedItems.map((f, i) => (
              <Flex key={i} align="center" gap={3} py={2} position="relative">
                <Flex w={7} h={7} borderRadius="10px" flexShrink={0}
                  align="center" justify="center" position="relative" zIndex={1}
                  style={{
                    background: `linear-gradient(135deg, ${f.color}28, ${f.color}12)`,
                    border: `1.5px solid ${f.color}33`,
                  }}>
                  <Icon as={f.icon} color={f.color} boxSize="11px" />
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="11.5px" color="gray.700" fontWeight="600" noOfLines={1}>{f.label}</Text>
                  <Text fontSize="10px" color="gray.400">{f.sub}</Text>
                </Box>
                <Box px={2.5} py={1} borderRadius="10px" flexShrink={0}
                  style={{ background: `${f.color}16` }}>
                  <Text fontSize="13px" fontWeight="900" color={f.color}
                    letterSpacing="-0.02em">{f.value}</Text>
                </Box>
              </Flex>
            ))}
          </Box>
        </Panel>

        {/* Quick Access with gradient icons */}
        <Panel title="Quick Access" accent="#0ea5e9">
          <Grid templateColumns="1fr 1fr" gap={2} px={4} pb={3}>
            {quickLinks.map((a) => (
              <Flex key={a.label} align="center" gap={2.5} px={3} py={2.5}
                bg="white" borderRadius="14px" cursor="pointer"
                border="1px solid" borderColor="gray.100"
                _hover={{
                  transform: "translateY(-2px)",
                  borderColor: `${a.color}55`,
                }}
                transition="all 0.22s cubic-bezier(0.34,1.56,0.64,1)"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                onClick={() => nav(a.to)}>
                <Flex w={8} h={8} borderRadius="12px" flexShrink={0}
                  align="center" justify="center"
                  style={{
                    background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}cc 100%)`,
                    boxShadow: `0 4px 12px ${a.color}44`,
                  }}>
                  <Icon as={a.icon} boxSize="13px" color="white" />
                </Flex>
                <Box minW={0}>
                  <Text fontSize="11px" fontWeight="700" color="gray.700" noOfLines={1}>{a.label}</Text>
                  <Text fontSize="9.5px" color="gray.400" noOfLines={1}>{a.sub}</Text>
                </Box>
              </Flex>
            ))}
          </Grid>
        </Panel>

        {/* Workforce Snapshot — glowing bars */}
        <Panel title="Workforce Snapshot" accent="#f59e0b"
          action="Report" onAction={() => nav("/dashboard/reports/attendance")}>
          <Box px={5} pt={2} pb={3}>
            <SnapRow label="Present Today"  value={pres}   max={total}
              fill="#10b981" track="#f0fdf4"
              badge={`${rate}%`} badgeBg="#f0fdf4" badgeTxt="#059669" />
            <SnapRow label="Absent Today"   value={absent} max={total}
              fill="#f87171" track="#fef2f2" />
            <SnapRow label="Pending Leaves" value={leaves} max={Math.max(leaves, 10)}
              fill="#f59e0b" track="#fffbeb"
              badge={leaves > 0 ? "Action" : undefined} badgeBg="#fffbeb" badgeTxt="#92400e" />
          </Box>
        </Panel>
      </Grid>
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
