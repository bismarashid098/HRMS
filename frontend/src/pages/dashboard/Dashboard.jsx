import { useEffect, useState, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundary";
import {
  Box, Flex, Grid, Text, Icon, Badge,
  useBreakpointValue, useDisclosure,
} from "@chakra-ui/react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, Legend,
} from "recharts";
import { FaUsers, FaClock, FaUserCheck, FaUserTimes, FaBell, FaChevronRight } from "react-icons/fa";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/TopNavbar";

/* ─── Theme (same as before) ─── */
const T = {
  bg:       "#0D1117",
  surface:  "#161B22",
  surface2: "#1C2330",
  border:   "#30363D",
  teal:     "#00D4B4",
  tealDim:  "#00A896",
  blue:     "#58A6FF",
  red:      "#FF6B6B",
  amber:    "#F0A500",
  green:    "#3FB950",
  text:     "#E6EDF3",
  muted:    "#8B949E",
};

/* ─── Helpers ─── */
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

/* ─── Live Clock ─── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <Text fontSize="22px" fontWeight="800" color={T.teal} letterSpacing="0.05em" lineHeight="1">
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </Text>
  );
};

/* ─── Custom Tooltip ─── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box bg={T.surface2} border="1px solid" borderColor={T.border} borderRadius="10px" p={3}>
      <Text fontSize="xs" color={T.muted} mb={2} fontWeight="600">{label}</Text>
      {payload.map((p, i) => (
        <Flex key={i} align="center" gap={2} mb={1}>
          <Box w="8px" h="8px" borderRadius="2px" bg={p.color} />
          <Text fontSize="xs" color={T.muted}>{p.name}:</Text>
          <Text fontSize="xs" fontWeight="700" color={T.text}>{p.value}</Text>
        </Flex>
      ))}
    </Box>
  );
};

/* ─── KPI Card ─── */
const KPI = ({ label, value, sub, icon, accent }) => (
  <Box
    bg={T.surface} p={5} borderRadius="14px"
    border="1px solid" borderColor={T.border}
    position="relative" overflow="hidden"
    _hover={{ borderColor: accent, transform: "translateY(-2px)" }}
    transition="all 0.2s ease"
  >
    <Box
      position="absolute" top="0" left="0" right="0" h="2px"
      bg={`linear-gradient(90deg, ${accent}, transparent)`}
    />
    <Box
      position="absolute" top="-20px" right="-20px"
      w="80px" h="80px" borderRadius="full"
      bg={accent} opacity="0.05"
    />
    <Flex justify="space-between" align="flex-start">
      <Box>
        <Text fontSize="10px" color={T.muted} fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
          {label}
        </Text>
        <Text fontSize="30px" fontWeight="900" color={T.text} lineHeight="1" mb={1}>
          {value}
        </Text>
        <Text fontSize="xs" color={T.muted}>{sub}</Text>
      </Box>
      <Box
        p={2.5} borderRadius="10px"
        bg={`${accent}18`}
        border="1px solid" borderColor={`${accent}30`}
      >
        <Icon as={icon} boxSize={5} color={accent} />
      </Box>
    </Flex>
  </Box>
);

/* ─── Section Title ─── */
const STitle = ({ children, right }) => (
  <Flex justify="space-between" align="center" mb={4}>
    <Text fontSize="13px" fontWeight="700" color={T.text} letterSpacing="0.02em">
      {children}
    </Text>
    {right}
  </Flex>
);

/* ─── Leave Row ─── */
const LeaveRow = ({ type, count, color }) => (
  <Flex
    justify="space-between" align="center"
    py={2} px={2} borderRadius="8px"
    _hover={{ bg: T.surface2 }} transition="0.15s" cursor="default"
  >
    <Flex align="center" gap={3}>
      <Box w="7px" h="7px" borderRadius="full" bg={color} />
      <Text fontSize="sm" color={T.muted}>{type}</Text>
    </Flex>
    <Text fontSize="sm" fontWeight="700" color={color}>{count}</Text>
  </Flex>
);

/* ─── Chip ─── */
const Chip = ({ children }) => (
  <Box
    px={2} py={0.5} borderRadius="6px"
    bg={T.surface2} border="1px solid" borderColor={T.border}
    fontSize="10px" fontWeight="600" color={T.muted}
  >
    {children}
  </Box>
);

/* ═══════════════════════════════════════════════════════════
   DASHBOARD HOME COMPONENT (existing content)
═══════════════════════════════════════════════════════════ */
const DashboardHome = () => {
  const [data, setData] = useState({ summary: {}, attendance: [], leaves: [] });
  const [loading, setLoading] = useState(true);
  const [today] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  );

  useEffect(() => {
    (async () => {
      try {
        const [s, a, l] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/attendance-chart"),
          api.get("/dashboard/leave-stats"),
        ]);
        setData({ summary: s.data, attendance: a.data, leaves: l.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total   = data.summary.totalEmployees  || 0;
  const present = data.summary.attendanceToday || 0;
  const absent  = Math.max(0, total - present);
  const rate    = total ? Math.round((present / total) * 100) : 0;

  const chartData = data.attendance.map((i) => ({
    name: i._id?.slice(5),
    Present: i.present,
    Absent:  i.absent,
  }));

  const pieData = [
    { name: "Present", value: present, color: T.teal  },
    { name: "Absent",  value: absent,  color: T.red   },
  ];

  const leaveColors = [T.teal, T.blue, T.amber, T.red, T.green];

  return (
    <Box>
      {/* KPI Row */}
      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }}
        gap={4} mb={5}
      >
        <KPI label="Total Employees" value={total}        sub="Active staff"          icon={FaUsers}     accent={T.teal}  />
        <KPI label="Present Today"   value={present}      sub={`${rate}% attendance`} icon={FaUserCheck} accent={T.blue}  />
        <KPI label="Absent Today"    value={absent}       sub="Not checked in"        icon={FaUserTimes} accent={T.red}   />
        <Box
          bg={T.surface} p={5} borderRadius="14px"
          border="1px solid" borderColor={T.border}
          position="relative" overflow="hidden"
          _hover={{ borderColor: T.amber, transform: "translateY(-2px)" }}
          transition="all 0.2s ease"
        >
          <Box position="absolute" top="0" left="0" right="0" h="2px" bg={`linear-gradient(90deg, ${T.amber}, transparent)`} />
          <Box position="absolute" top="-20px" right="-20px" w="80px" h="80px" borderRadius="full" bg={T.amber} opacity="0.05" />
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text fontSize="10px" color={T.muted} fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
                Current Time
              </Text>
              <LiveClock />
              <Text fontSize="xs" color={T.muted} mt={1}>Live clock</Text>
            </Box>
            <Box p={2.5} borderRadius="10px" bg={`${T.amber}18`} border="1px solid" borderColor={`${T.amber}30`}>
              <Icon as={FaClock} boxSize={5} color={T.amber} />
            </Box>
          </Flex>
        </Box>
      </Grid>

      {/* Main Charts Row */}
      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={4} mb={4}>
        {/* Attendance Bar + Line Chart */}
        <Box bg={T.surface} p={5} borderRadius="14px" border="1px solid" borderColor={T.border}>
          <STitle right={<Chip>Last 7 days</Chip>}>Attendance Trend</STitle>
          <Box h="220px">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.teal} stopOpacity={1} />
                    <stop offset="100%" stopColor={T.tealDim} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="Present" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Line
                  type="monotone" dataKey="Absent"
                  stroke={T.red} strokeWidth={2}
                  dot={{ fill: T.red, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: T.red, stroke: T.surface, strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>

          {/* Rate bar */}
          <Box mt={4}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="11px" color={T.muted} fontWeight="600" textTransform="uppercase" letterSpacing="0.06em">Attendance Rate</Text>
              <Text fontSize="11px" fontWeight="800" color={T.teal}>{rate}%</Text>
            </Flex>
            <Box h="4px" bg={T.surface2} borderRadius="99px" overflow="hidden">
              <Box h="100%" borderRadius="99px" bg={`linear-gradient(90deg, ${T.teal}, ${T.blue})`} w={`${rate}%`} transition="width 1.2s ease" />
            </Box>
          </Box>
        </Box>

        {/* Pie + Summary */}
        <Flex direction="column" gap={4}>
          <Box bg={T.surface} p={5} borderRadius="14px" border="1px solid" borderColor={T.border} flex="1">
            <STitle>Today's Distribution</STitle>
            <Flex align="center" gap={4}>
              <Box w="120px" h="120px" flexShrink="0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={35} outerRadius={55}
                      paddingAngle={3} dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Flex direction="column" gap={3} flex="1">
                {[
                  { label: "Present", val: present, color: T.teal  },
                  { label: "Absent",  val: absent,  color: T.red   },
                  { label: "Rate",    val: `${rate}%`, color: T.blue },
                ].map((s, i) => (
                  <Flex key={i} justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <Box w="7px" h="7px" borderRadius="full" bg={s.color} />
                      <Text fontSize="12px" color={T.muted}>{s.label}</Text>
                    </Flex>
                    <Text fontSize="14px" fontWeight="800" color={s.color}>{s.val}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Box>

          <Box bg={T.surface} p={5} borderRadius="14px" border="1px solid" borderColor={T.border}>
            <STitle right={<Icon as={FaChevronRight} boxSize={3} color={T.muted} />}>
              Leave Overview
            </STitle>
            <Flex direction="column" gap={1}>
              {data.leaves?.map((l, i) => (
                <LeaveRow
                  key={i}
                  type={l._id}
                  count={l.total}
                  color={leaveColors[i % leaveColors.length]}
                />
              ))}
            </Flex>
          </Box>
        </Flex>
      </Grid>

      {/* Area Chart */}
      <Box bg={T.surface} p={5} borderRadius="14px" border="1px solid" borderColor={T.border}>
        <STitle right={<Chip>Weekly</Chip>}>Attendance Over Time</STitle>
        <Box h="160px">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.teal} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.teal} stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="areaAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.red} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: T.muted, paddingTop: "8px" }}
                iconType="circle" iconSize={7}
              />
              <Area type="monotone" dataKey="Present" stroke={T.teal} strokeWidth={2} fill="url(#areaPresent)" dot={false} activeDot={{ r: 4, fill: T.teal }} />
              <Area type="monotone" dataKey="Absent"  stroke={T.red}  strokeWidth={2} fill="url(#areaAbsent)"  dot={false} activeDot={{ r: 4, fill: T.red  }} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD (now with Outlet)
═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  // کیا current route صرف "/dashboard" ہے؟
  const isDashboardHome = location.pathname === "/dashboard";

  return (
    <Flex h="100vh" bg={T.bg} overflow="hidden" color={T.text}>
      {/* Sidebar */}
      {!isMobile && (
        <Box w="240px" flexShrink="0" bg={T.surface} borderRight="1px solid" borderColor={T.border}>
          <Sidebar />
        </Box>
      )}

      {/* Main Area */}
      <Flex direction="column" flex="1" overflow="hidden">
        {/* Topbar */}
        <Flex
          h="60px" bg={T.surface} align="center"
          justify="space-between" px={6} flexShrink="0"
          borderBottom="1px solid" borderColor={T.border}
        >
          <Box>
            <Text fontSize="15px" fontWeight="800" color={T.text}>
              {greet()}, {user?.name?.split(" ")[0] || "User"}
            </Text>
            <Text fontSize="11px" color={T.muted}>HRMS Dashboard Overview</Text>
          </Box>
          <Flex align="center" gap={3}>
            <Chip>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</Chip>
            <Box position="relative" cursor="pointer">
              <Flex
                w="34px" h="34px" borderRadius="9px"
                bg={T.surface2} border="1px solid" borderColor={T.border}
                align="center" justify="center"
                _hover={{ borderColor: T.teal }} transition="0.15s"
              >
                <Icon as={FaBell} boxSize={3.5} color={T.muted} />
              </Flex>
              <Box
                position="absolute" top="7px" right="7px"
                w="6px" h="6px" borderRadius="full" bg={T.red}
                border={`1.5px solid ${T.surface}`}
              />
            </Box>
            {!isMobile && <TopNavbar onMenuOpen={isMobile ? onOpen : undefined} />}
          </Flex>
        </Flex>

        {/* Content */}
        <Box flex="1" overflowY="auto" p={5}
          sx={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { bg: T.bg },
            "&::-webkit-scrollbar-thumb": { bg: T.border, borderRadius: "99px" },
          }}
        >
          <ErrorBoundary routeKey={location.pathname}>
            <Outlet />
            {isDashboardHome && <DashboardHome />}
          </ErrorBoundary>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;