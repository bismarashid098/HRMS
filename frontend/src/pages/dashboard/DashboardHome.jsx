import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box, SimpleGrid, Text, Flex, Icon, Spinner,
  Badge, Button, Avatar, Grid,
} from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaChartLine, FaChevronRight, FaClock, FaUserCheck, FaUserTimes,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTip, ResponsiveContainer,
} from "recharts";

/* ── helpers ── */
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};
const Rs = (n) =>
  n >= 1e6 ? `Rs ${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `Rs ${(n / 1e3).toFixed(0)}K` : `Rs ${n || 0}`;

const useClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

/* ── gradient presets ── */
const GRAD = {
  green:  { from: "#34d399", to: "#059669" },
  yellow: { from: "#fbbf24", to: "#d97706" },
  red:    { from: "#f87171", to: "#dc2626" },
  blue:   { from: "#60a5fa", to: "#2563eb" },
};

/* ════════════════════════════════
   KPI CARD
════════════════════════════════ */
const KpiCard = ({ label, value, sub, icon, grad, to }) => {
  const nav = useNavigate();
  const g = GRAD[grad];
  return (
    <Box
      bgGradient={`linear(135deg, ${g.from}, ${g.to})`}
      borderRadius="2xl" p={5} color="white" position="relative" overflow="hidden"
      cursor={to ? "pointer" : "default"} onClick={() => to && nav(to)}
      boxShadow={`0 8px 28px ${g.to}40`}
      _hover={to ? { transform: "translateY(-3px)", boxShadow: `0 14px 36px ${g.to}55` } : {}}
      transition="all 0.22s ease"
    >
      <Box position="absolute" top="-20px" right="-20px" w="90px" h="90px"
        borderRadius="full" bg="whiteAlpha.200" />
      <Box position="absolute" bottom="-15px" right="25px" w="50px" h="50px"
        borderRadius="full" bg="whiteAlpha.150" />

      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="10.5px" fontWeight="700" opacity={0.82} textTransform="uppercase" letterSpacing="0.1em">
            {label}
          </Text>
          <Text fontSize="28px" fontWeight="800" mt={1} lineHeight={1}>{value}</Text>
        </Box>
        <Flex w={10} h={10} borderRadius="xl" bg="whiteAlpha.250" align="center" justify="center"
          flexShrink={0} boxShadow="inset 0 1px 0 rgba(255,255,255,0.25)">
          <Icon as={icon} boxSize={4.5} />
        </Flex>
      </Flex>

      <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.200">
        <Text fontSize="11px" opacity={0.78} fontWeight="500">{sub}</Text>
      </Box>
    </Box>
  );
};

/* ── Panel wrapper ── */
const Panel = ({ title, action, onAction, children, ...rest }) => (
  <Flex direction="column" bg="white" borderRadius="2xl"
    boxShadow="0 2px 8px rgba(0,0,0,0.05)" border="1px solid" borderColor="gray.100"
    overflow="hidden" {...rest}>
    {title && (
      <Flex px={5} pt={4} pb={2.5} justify="space-between" align="center"
        flexShrink={0} borderBottom="1px solid" borderColor="gray.50">
        <Text fontWeight="700" fontSize="13px" color="gray.800" letterSpacing="-0.01em">{title}</Text>
        {action && (
          <Button size="xs" variant="ghost" colorScheme="gray" borderRadius="lg"
            onClick={onAction} rightIcon={<Icon as={FaChevronRight} boxSize={2} />}
            fontSize="11px" px={2.5} h={6} color="gray.400" fontWeight="500">
            {action}
          </Button>
        )}
      </Flex>
    )}
    {children}
  </Flex>
);

/* ── Recharts container fix ── */
const FlexChart = ({ children }) => (
  <Box flex={1} minH={0} px={3} pb={3}>
    <Box h="100%" position="relative">
      <Box position="absolute" top={0} left={0} right={0} bottom={0}>{children}</Box>
    </Box>
  </Box>
);

/* ── Stat row with progress bar ── */
const StatRow = ({ label, value, max, color, badge, bgColor, badgeColor }) => {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <Box mb={3}>
      <Flex justify="space-between" align="center" mb={1.5}>
        <Flex align="center" gap={2}>
          <Box w={2} h={2} borderRadius="full" bg={color} flexShrink={0} />
          <Text fontSize="12px" color="gray.600" fontWeight="600">{label}</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Text fontSize="12px" fontWeight="800" color="gray.800">{value}</Text>
          {badge && (
            <Badge bg={bgColor} color={badgeColor} borderRadius="full"
              fontSize="9px" px={1.5} py={0.5} fontWeight="700">{badge}</Badge>
          )}
        </Flex>
      </Flex>
      <Box bg="gray.100" borderRadius="full" h="5px">
        <Box bg={color} borderRadius="full" h="100%" w={`${pct}%`} transition="width 0.6s ease" />
      </Box>
    </Box>
  );
};

/* ── leave type colors ── */
const LEAVE_CFG = {
  "Sick Leave":      { color: "#ef4444", bg: "#fef2f2" },
  "Annual Leave":    { color: "#3b82f6", bg: "#eff6ff" },
  "Emergency Leave": { color: "#f59e0b", bg: "#fffbeb" },
  "Unpaid Leave":    { color: "#8b5cf6", bg: "#faf5ff" },
  "Maternity Leave": { color: "#ec4899", bg: "#fdf2f8" },
  "No Data":         { color: "#9ca3af", bg: "#f9fafb" },
};
const leaveCfg = (name) => LEAVE_CFG[name] || { color: "#6366f1", bg: "#eef2ff" };

/* ════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════ */
const AdminDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const clock = useClock();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const curMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const total   = data.summary.totalEmployees  || 0;
  const pres    = data.summary.attendanceToday  || 0;
  const leaves  = data.summary.pendingLeaves    || 0;
  const payroll = data.summary.monthlyPayroll   || 0;
  const absent  = Math.max(0, total - pres);
  const rate    = total ? Math.round((pres / total) * 100) : 0;

  const barData = data.attendance.map((i) => ({
    name: i._id.slice(5), Present: i.present, Absent: i.absent,
  }));
  const leaveList = data.leaves.map((i) => ({ name: i._id, value: i.total }));
  if (!leaveList.length) leaveList.push({ name: "No Data", value: 0 });
  const absTotal  = barData.reduce((s, i) => s + (i.Absent  || 0), 0);
  const leavTotal = data.leaves.reduce((s, l) => s + l.total, 0);

  const feed = [
    { icon: FaUserCheck,     color: "#059669", bg: "#f0fdf4", label: "Employees Present Today",   value: pres,        sub: `${rate}% attendance rate`   },
    { icon: FaClipboardList, color: "#d97706", bg: "#fffbeb", label: "Leave Requests Pending",     value: leaves,      sub: "Awaiting your approval"     },
    { icon: FaMoneyBillWave, color: "#7c3aed", bg: "#faf5ff", label: "Monthly Payroll Disbursed",  value: Rs(payroll), sub: `Net salary · ${curMonth}`   },
    { icon: FaUserTimes,     color: "#dc2626", bg: "#fef2f2", label: "Absences This Month",         value: absTotal,    sub: "Total absent records"       },
  ];

  return (
    <Flex direction="column" gap={3}
      mx={{ base: -4, md: -6 }} mt={{ base: -4, md: -6 }} mb={{ base: -4, md: -6 }}
      h="calc(100vh - 64px)" overflow="hidden" bg="#f0f2f7"
      px={5} pt={4} pb={3}>

      {/* TOP BAR */}
      <Flex justify="space-between" align="center" flexShrink={0}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800" letterSpacing="-0.02em">Dashboard</Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            {greet()},{" "}
            <Text as="span" color="gray.600" fontWeight="600">{firstName}</Text>
            {" "}· {curMonth}
          </Text>
        </Box>
        <Flex align="center" gap={2.5}>
          <Flex align="center" gap={2} px={3} py={2} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Icon as={FaClock} color="gray.300" boxSize={3} />
            <Text fontSize="12px" fontWeight="700" color="gray.700" letterSpacing="0.04em" fontFamily="mono">{clock}</Text>
          </Flex>
          <Flex align="center" gap={1.5} px={3} py={2} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Box w={2} h={2} borderRadius="full" bg="#4ade80" boxShadow="0 0 0 3px rgba(74,222,128,0.25)" />
            <Text fontSize="11px" color="gray.500" fontWeight="600">Live</Text>
          </Flex>
          <Avatar name={user?.name} size="sm" bg="#059669" color="white" fontWeight="bold"
            boxShadow="0 2px 8px rgba(5,150,105,0.35)" />
        </Flex>
      </Flex>

      {/* KPI CARDS */}
      <SimpleGrid columns={4} spacing={4} flexShrink={0}>
        <KpiCard label="Total Employees" value={total}       sub={`${total} active staff members`}          icon={FaUsers}         grad="green"  to="/dashboard/employees" />
        <KpiCard label="Present Today"   value={pres}        sub={`${rate}% attendance · ${absent} absent`} icon={FaCalendarCheck} grad="yellow" to="/dashboard/attendance/daily" />
        <KpiCard label="Pending Leaves"  value={leaves}      sub="Requests awaiting your approval"          icon={FaClipboardList} grad="red"    to="/dashboard/leaves" />
        <KpiCard label="Monthly Payroll" value={Rs(payroll)} sub={`Net disbursed · ${curMonth}`}            icon={FaMoneyBillWave} grad="blue"   to="/dashboard/payroll" />
      </SimpleGrid>

      {/* MIDDLE ROW */}
      <Grid flex={1} minH={0} templateColumns="1fr 300px" gap={4}>

        {/* Bar chart */}
        <Panel title="Attendance Statistics">
          <Flex gap={4} px={5} pb={2} flexShrink={0}>
            <Flex align="center" gap={2}>
              <Box w={2.5} h={2.5} borderRadius="sm" bg="#3b82f6" />
              <Text fontSize="11px" color="gray.500" fontWeight="500">Present</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w={2.5} h={2.5} borderRadius="sm" bg="#fca5a5" />
              <Text fontSize="11px" color="gray.500" fontWeight="500">Absent</Text>
            </Flex>
          </Flex>
          <FlexChart>
            {barData.length === 0
              ? (
                <Flex h="100%" align="center" justify="center" direction="column" gap={2}>
                  <Icon as={FaCalendarCheck} boxSize={8} color="gray.200" />
                  <Text color="gray.300" fontSize="sm">No attendance data yet</Text>
                </Flex>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={3} barCategoryGap="38%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <ReTip
                      contentStyle={{ borderRadius: "14px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.10)", fontSize: "12px", padding: "10px 14px" }}
                      cursor={{ fill: "rgba(0,0,0,0.025)" }}
                    />
                    <Bar dataKey="Present" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="Absent"  fill="#fca5a5" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </FlexChart>
        </Panel>

        {/* Leave Breakdown */}
        <Panel title="Leave Breakdown" action="View All" onAction={() => nav("/dashboard/leaves")}>
          <Box px={3} pb={3} flex={1} overflowY="auto">
            {leaveList.map((item) => {
              const cfg = leaveCfg(item.name);
              return (
                <Flex key={item.name} align="center" gap={3} px={3} py={2.5} mb={1.5}
                  bg="#fafbfc" borderRadius="xl" border="1px solid" borderColor="gray.100"
                  _hover={{ bg: "white", borderColor: "gray.200", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  transition="all 0.15s">
                  <Flex w={9} h={9} borderRadius="xl" bg={cfg.bg} align="center" justify="center" flexShrink={0}>
                    <Icon as={FaClipboardList} color={cfg.color} boxSize={3.5} />
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text fontSize="12px" fontWeight="700" color="gray.800" noOfLines={1}>{item.name}</Text>
                    <Text fontSize="10px" color="gray.400">{item.value} request{item.value !== 1 ? "s" : ""} this month</Text>
                  </Box>
                  <Badge bg={cfg.bg} color={cfg.color} borderRadius="full" fontSize="10px" px={2} py={0.5} fontWeight="800">
                    {item.value}
                  </Badge>
                </Flex>
              );
            })}
            <Flex mt={2} px={3} py={2.5} bg="gray.50" borderRadius="xl" justify="space-between" align="center">
              <Text fontSize="11px" color="gray.500" fontWeight="500">Total Requests</Text>
              <Text fontSize="13px" fontWeight="800" color="gray.800">{leavTotal}</Text>
            </Flex>
          </Box>
        </Panel>
      </Grid>

      {/* BOTTOM ROW */}
      <Grid flexShrink={0} templateColumns="1fr 1fr" gap={4} h="160px">

        {/* Activity Summary */}
        <Panel title="Activity Summary">
          <Box px={4} pb={2.5} overflowY="hidden">
            {feed.slice(0, 3).map((f, i) => (
              <Flex key={i} align="center" gap={3} py={2}
                borderBottom={i < 2 ? "1px solid" : "none"} borderColor="gray.50">
                <Flex w={7} h={7} borderRadius="lg" bg={f.bg} align="center" justify="center" flexShrink={0}>
                  <Icon as={f.icon} color={f.color} boxSize={3} />
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="12px" color="gray.700" fontWeight="600" noOfLines={1}>{f.label}</Text>
                  <Text fontSize="10px" color="gray.400">{f.sub}</Text>
                </Box>
                <Text fontSize="12px" fontWeight="800" color="gray.700">{f.value}</Text>
              </Flex>
            ))}
          </Box>
        </Panel>

        {/* Workforce Snapshot */}
        <Panel title="Workforce Snapshot" action="Full Report" onAction={() => nav("/dashboard/reports/attendance")}>
          <Box px={5} pt={2} pb={3}>
            <StatRow label="Present Today"  value={pres}   max={total}              color="#3b82f6" badge={`${rate}%`}                      bgColor="#eff6ff" badgeColor="#1d4ed8" />
            <StatRow label="Absent Today"   value={absent} max={total}              color="#f87171" />
            <StatRow label="Pending Leaves" value={leaves} max={Math.max(leaves,10)} color="#f59e0b" badge={leaves > 0 ? "Action Needed" : undefined} bgColor="#fffbeb" badgeColor="#92400e" />
          </Box>
        </Panel>
      </Grid>
    </Flex>
  );
};

/* ════════════════════════════════
   MANAGER DASHBOARD
════════════════════════════════ */
const ManagerDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const clock = useClock();
  const name = user?.name?.split(" ")[0] || "Manager";
  const curMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const total  = data.summary.totalEmployees  || 0;
  const pres   = data.summary.attendanceToday  || 0;
  const leaves = data.summary.pendingLeaves    || 0;
  const absent = Math.max(0, total - pres);
  const rate   = total ? Math.round((pres / total) * 100) : 0;

  const barData = data.attendance.map((i) => ({
    name: i._id.slice(5), Present: i.present, Absent: i.absent,
  }));
  const leaveList = data.leaves.map((i) => ({ name: i._id, value: i.total }));
  if (!leaveList.length) leaveList.push({ name: "No Data", value: 0 });
  const presTotal = barData.reduce((s, i) => s + (i.Present || 0), 0);
  const absTotal  = barData.reduce((s, i) => s + (i.Absent  || 0), 0);

  const feed = [
    { icon: FaUserCheck,     color: "#059669", bg: "#f0fdf4", label: "Present Today",    value: pres,   sub: `${rate}% attendance rate` },
    { icon: FaClipboardList, color: "#d97706", bg: "#fffbeb", label: "Pending Leaves",    value: leaves, sub: "Needs your review"        },
    { icon: FaUserTimes,     color: "#dc2626", bg: "#fef2f2", label: "Absent / Unmarked", value: absent, sub: "Not marked today"         },
  ];

  return (
    <Flex direction="column" gap={3}
      mx={{ base: -4, md: -6 }} mt={{ base: -4, md: -6 }} mb={{ base: -4, md: -6 }}
      h="calc(100vh - 64px)" overflow="hidden" bg="#f0f2f7"
      px={5} pt={4} pb={3}>

      {/* TOP BAR */}
      <Flex justify="space-between" align="center" flexShrink={0}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800" letterSpacing="-0.02em">Dashboard</Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            {greet()},{" "}
            <Text as="span" color="gray.600" fontWeight="600">{name}</Text>
            {" "}· Manager View
          </Text>
        </Box>
        <Flex align="center" gap={2.5}>
          <Flex align="center" gap={2} px={3} py={2} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Icon as={FaClock} color="gray.300" boxSize={3} />
            <Text fontSize="12px" fontWeight="700" color="gray.700" letterSpacing="0.04em" fontFamily="mono">{clock}</Text>
          </Flex>
          <Flex align="center" gap={1.5} px={3} py={2} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Box w={2} h={2} borderRadius="full" bg="#4ade80" boxShadow="0 0 0 3px rgba(74,222,128,0.25)" />
            <Text fontSize="11px" color="gray.500" fontWeight="600">Live</Text>
          </Flex>
          <Avatar name={user?.name} size="sm" bg="#059669" color="white" fontWeight="bold"
            boxShadow="0 2px 8px rgba(5,150,105,0.35)" />
        </Flex>
      </Flex>

      {/* KPI CARDS */}
      <SimpleGrid columns={4} spacing={4} flexShrink={0}>
        <KpiCard label="Total Staff"     value={total}      sub={`${total} active employees`}           icon={FaUsers}         grad="green"  to="/dashboard/employees" />
        <KpiCard label="Present Today"   value={pres}       sub={`${rate}% rate · ${absent} absent`}    icon={FaCalendarCheck} grad="yellow" to="/dashboard/attendance/daily" />
        <KpiCard label="Pending Leaves"  value={leaves}     sub="Awaiting your approval"                icon={FaClipboardList} grad="red"    to="/dashboard/leaves" />
        <KpiCard label="Attendance Rate" value={`${rate}%`} sub={`${presTotal} present this month`}     icon={FaChartLine}     grad="blue" />
      </SimpleGrid>

      {/* MIDDLE ROW */}
      <Grid flex={1} minH={0} templateColumns="1fr 300px" gap={4}>

        {/* Bar chart */}
        <Panel title="Monthly Attendance Statistics">
          <Flex gap={4} px={5} pb={2} flexShrink={0}>
            <Flex align="center" gap={2}>
              <Box w={2.5} h={2.5} borderRadius="sm" bg="#3b82f6" />
              <Text fontSize="11px" color="gray.500" fontWeight="500">Present ({presTotal})</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w={2.5} h={2.5} borderRadius="sm" bg="#fca5a5" />
              <Text fontSize="11px" color="gray.500" fontWeight="500">Absent ({absTotal})</Text>
            </Flex>
          </Flex>
          <FlexChart>
            {barData.length === 0
              ? (
                <Flex h="100%" align="center" justify="center" direction="column" gap={2}>
                  <Icon as={FaCalendarCheck} boxSize={8} color="gray.200" />
                  <Text color="gray.300" fontSize="sm">No data yet</Text>
                </Flex>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={3} barCategoryGap="38%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <ReTip
                      contentStyle={{ borderRadius: "14px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.10)", fontSize: "12px", padding: "10px 14px" }}
                      cursor={{ fill: "rgba(0,0,0,0.025)" }}
                    />
                    <Bar dataKey="Present" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="Absent"  fill="#fca5a5" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </FlexChart>
        </Panel>

        {/* Leave Breakdown */}
        <Panel title="Leave Breakdown" action="View All" onAction={() => nav("/dashboard/leaves")}>
          <Box px={3} pb={3} flex={1} overflowY="auto">
            {leaveList.map((item) => {
              const cfg = leaveCfg(item.name);
              return (
                <Flex key={item.name} align="center" gap={3} px={3} py={2.5} mb={1.5}
                  bg="#fafbfc" borderRadius="xl" border="1px solid" borderColor="gray.100"
                  _hover={{ bg: "white", borderColor: "gray.200", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  transition="all 0.15s">
                  <Flex w={9} h={9} borderRadius="xl" bg={cfg.bg} align="center" justify="center" flexShrink={0}>
                    <Icon as={FaClipboardList} color={cfg.color} boxSize={3.5} />
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text fontSize="12px" fontWeight="700" color="gray.800" noOfLines={1}>{item.name}</Text>
                    <Text fontSize="10px" color="gray.400">{item.value} requests this month</Text>
                  </Box>
                  <Badge bg={cfg.bg} color={cfg.color} borderRadius="full" fontSize="10px" px={2} py={0.5} fontWeight="800">
                    {item.value}
                  </Badge>
                </Flex>
              );
            })}
          </Box>
        </Panel>
      </Grid>

      {/* BOTTOM ROW */}
      <Grid flexShrink={0} templateColumns="1fr 1fr" gap={4} h="155px">

        {/* Activity Summary */}
        <Panel title="Activity Summary">
          <Box px={4} pb={2.5} overflowY="hidden">
            {feed.map((f, i) => (
              <Flex key={i} align="center" gap={3} py={1.5}
                borderBottom={i < feed.length - 1 ? "1px solid" : "none"} borderColor="gray.50">
                <Flex w={7} h={7} borderRadius="lg" bg={f.bg} align="center" justify="center" flexShrink={0}>
                  <Icon as={f.icon} color={f.color} boxSize={3} />
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="12px" color="gray.700" fontWeight="600" noOfLines={1}>{f.label}</Text>
                  <Text fontSize="10px" color="gray.400">{f.sub}</Text>
                </Box>
                <Text fontSize="12px" fontWeight="800" color="gray.700">{f.value}</Text>
              </Flex>
            ))}
          </Box>
        </Panel>

        {/* Workforce Snapshot */}
        <Panel title="Workforce Snapshot" action="Full Report" onAction={() => nav("/dashboard/reports/attendance")}>
          <Box px={5} pt={2} pb={3}>
            <StatRow label="Present Today"  value={pres}   max={total}               color="#3b82f6" badge={`${rate}%`}                           bgColor="#eff6ff" badgeColor="#1d4ed8" />
            <StatRow label="Absent Today"   value={absent} max={total}               color="#f87171" />
            <StatRow label="Pending Leaves" value={leaves} max={Math.max(leaves, 10)} color="#f59e0b" badge={leaves > 0 ? "Pending" : undefined} bgColor="#fffbeb" badgeColor="#92400e" />
          </Box>
        </Panel>
      </Grid>
    </Flex>
  );
};

/* ════════════════════════════════
   MAIN EXPORT
════════════════════════════════ */
const DashboardHome = () => {
  const { user }   = useContext(AuthContext);
  const isManager  = user?.role === "Manager";
  const [data, setData] = useState({
    summary: { totalEmployees: 0, attendanceToday: 0, pendingLeaves: 0, monthlyPayroll: 0 },
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
        setData({ summary: res[0].data, attendance: res[1].data, leaves: res[2].data, payroll: res[3]?.data || [] });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [isManager]);

  if (loading) return (
    <Flex justify="center" align="center" h="100vh" direction="column" gap={4} bg="#f0f2f7">
      <Spinner size="xl" color="#059669" thickness="3px" speed="0.7s" emptyColor="gray.100" />
      <Text fontSize="13px" color="gray.400" fontWeight="500">Loading dashboard...</Text>
    </Flex>
  );

  return isManager ? <ManagerDashboard data={data} /> : <AdminDashboard data={data} />;
};

export default DashboardHome;
