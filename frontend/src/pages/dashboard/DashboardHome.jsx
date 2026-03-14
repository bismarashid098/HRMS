import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box, SimpleGrid, Text, Flex, Icon, Heading, Spinner,
  Badge, Button, Progress, Divider, Avatar, Grid, GridItem,
} from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaArrowUp, FaArrowDown, FaChartLine, FaUserTie, FaChevronRight,
  FaExclamationTriangle, FaCheckCircle, FaBell,
} from "react-icons/fa";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ── palette ── */
const C = {
  green:      "#065f46",
  greenMid:   "#10b981",
  greenLight: "#d1fae5",
  blue:       "#1d4ed8",
  blueLight:  "#dbeafe",
  orange:     "#b45309",
  orangeLight:"#fef3c7",
  purple:     "#6d28d9",
  purpleLight:"#ede9fe",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  navy:       "#021024",
};
const PIE_COLORS = ["#065f46", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];
const monthNames  = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const getGreeting = () => { const h = new Date().getHours(); if(h<12) return "Good Morning"; if(h<17) return "Good Afternoon"; return "Good Evening"; };
const fmtMoney    = (n) => n >= 1_000_000 ? `Rs ${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `Rs ${(n/1_000).toFixed(0)}K` : `Rs ${n}`;

/* ══════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════ */
const KpiCard = ({ label, value, sub, icon, accent, trend, to }) => {
  const navigate = useNavigate();
  return (
    <Box
      bg="white" borderRadius="2xl" p={5} shadow="sm"
      border="1px solid" borderColor="gray.100"
      position="relative" overflow="hidden"
      cursor={to ? "pointer" : "default"}
      _hover={to ? { shadow: "md", transform: "translateY(-2px)" } : {}}
      transition="all 0.2s"
      onClick={() => to && navigate(to)}
    >
      {/* accent strip */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} borderRadius="2xl 0 0 2xl" />
      <Flex justify="space-between" align="flex-start" pl={1}>
        <Box>
          <Text fontSize="11px" color="gray.400" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="extrabold" color="gray.800" mt={1} lineHeight={1}>{value}</Text>
          {sub && <Text fontSize="xs" color="gray.400" mt={1}>{sub}</Text>}
          {trend !== undefined && (
            <Flex align="center" mt={2} gap={1}>
              <Box w={5} h={5} borderRadius="full" bg={trend >= 0 ? "green.50" : "red.50"}
                display="flex" alignItems="center" justifyContent="center">
                <Icon as={trend >= 0 ? FaArrowUp : FaArrowDown}
                  boxSize={2.5} color={trend >= 0 ? "green.500" : "red.500"} />
              </Box>
              <Text fontSize="11px" color={trend >= 0 ? "green.600" : "red.500"} fontWeight="600">
                {Math.abs(trend)}% vs last month
              </Text>
            </Flex>
          )}
        </Box>
        <Flex w={11} h={11} borderRadius="xl" bg={accent + "18"} align="center" justify="center" flexShrink={0}>
          <Icon as={icon} boxSize={5} color={accent} />
        </Flex>
      </Flex>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   CHART CARD WRAPPER
══════════════════════════════════════════════ */
const ChartCard = ({ title, sub, badge, badgeColor, action, onAction, children }) => (
  <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100" h="100%">
    <Flex justify="space-between" align="flex-start" mb={4}>
      <Box>
        <Flex align="center" gap={2}>
          <Text fontWeight="700" fontSize="sm" color="gray.800">{title}</Text>
          {badge && <Badge colorScheme={badgeColor || "green"} borderRadius="full" fontSize="10px" px={2}>{badge}</Badge>}
        </Flex>
        {sub && <Text fontSize="xs" color="gray.400" mt={0.5}>{sub}</Text>}
      </Box>
      {action && (
        <Button size="xs" variant="ghost" colorScheme="green" borderRadius="lg" onClick={onAction}
          rightIcon={<Icon as={FaChevronRight} />} fontSize="xs">{action}</Button>
      )}
    </Flex>
    {children}
  </Box>
);

/* ══════════════════════════════════════════════
   QUICK NAV ITEM
══════════════════════════════════════════════ */
const NavItem = ({ icon, label, to, accent }) => {
  const navigate = useNavigate();
  return (
    <Flex align="center" gap={3} p={3} borderRadius="xl" cursor="pointer"
      _hover={{ bg: accent + "0f" }} onClick={() => navigate(to)} transition="all 0.15s"
      border="1px solid" borderColor="gray.100">
      <Flex w={8} h={8} borderRadius="lg" bg={accent + "15"} align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color={accent} boxSize={4} />
      </Flex>
      <Text fontSize="sm" fontWeight="600" color="gray.700" flex={1}>{label}</Text>
      <Icon as={FaChevronRight} boxSize={2.5} color="gray.300" />
    </Flex>
  );
};

/* ══════════════════════════════════════════════
   ALERT STRIP
══════════════════════════════════════════════ */
const AlertStrip = ({ pendingLeaves, attendanceRate }) => {
  if (pendingLeaves === 0 && attendanceRate >= 75) return null;
  return (
    <Flex gap={3} mb={5} wrap="wrap">
      {pendingLeaves > 0 && (
        <Flex flex={1} minW="200px" align="center" gap={3} px={4} py={3}
          bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="xl">
          <Icon as={FaBell} color="orange.500" boxSize={4} />
          <Text fontSize="sm" color="orange.700" fontWeight="600">
            {pendingLeaves} leave request{pendingLeaves !== 1 ? "s" : ""} awaiting approval
          </Text>
        </Flex>
      )}
      {attendanceRate < 75 && (
        <Flex flex={1} minW="200px" align="center" gap={3} px={4} py={3}
          bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl">
          <Icon as={FaExclamationTriangle} color="red.500" boxSize={4} />
          <Text fontSize="sm" color="red.700" fontWeight="600">
            Low attendance today — only {attendanceRate}% present
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

/* ══════════════════════════════════════════════
   MANAGER DASHBOARD
══════════════════════════════════════════════ */
const ManagerDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const navigate   = useNavigate();
  const firstName  = user?.name?.split(" ")[0] || "Manager";
  const today      = new Date().toLocaleDateString("en-PK", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  const totalEmployees = data.summary.totalEmployees || 0;
  const presentToday   = data.summary.attendanceToday || 0;
  const pendingLeaves  = data.summary.pendingLeaves || 0;
  const notMarked      = Math.max(0, totalEmployees - presentToday);
  const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const donutData = [
    { name: "Present",  value: presentToday },
    { name: "Not Marked", value: notMarked   },
  ];
  const attendanceChartData = data.attendance.map((item) => ({
    name: item._id.slice(5),
    Present: item.present,
    Absent:  item.absent,
  }));

  return (
    <Box bg="#f7f9fc" minH="100%">
      {/* ── Header Banner ── */}
      <Box mb={6} p={6} borderRadius="2xl" overflow="hidden" position="relative"
        bgGradient="linear(135deg, #021024 0%, #065f46 100%)">
        <Box position="absolute" top="-20px" right="-20px" w="120px" h="120px" borderRadius="full" bg="whiteAlpha.100" />
        <Box position="absolute" bottom="-30px" right="100px" w="80px" h="80px" borderRadius="full" bg="whiteAlpha.50" />
        <Flex justify="space-between" align="center" position="relative" zIndex={1} wrap="wrap" gap={3}>
          <Box>
            <Flex align="center" gap={2} mb={2}>
              <Box w={2} h={2} borderRadius="full" bg="green.400"
                boxShadow="0 0 0 3px rgba(74,222,128,0.3)" />
              <Text fontSize="11px" color="whiteAlpha.700" fontWeight="600" textTransform="uppercase" letterSpacing="0.1em">
                {getGreeting()}
              </Text>
            </Flex>
            <Heading size="lg" color="white" fontWeight="extrabold">Welcome, {firstName} 👋</Heading>
            <Text fontSize="sm" color="whiteAlpha.600" mt={1}>{today}</Text>
          </Box>
          <Flex align="center" gap={4}>
            <Box textAlign="right">
              <Text fontSize="xs" color="whiteAlpha.600">Today's Rate</Text>
              <Text fontSize="3xl" fontWeight="extrabold" color="white" lineHeight={1}>{attendanceRate}%</Text>
            </Box>
            <Avatar name={user?.name} size="lg" bg="green.400" color="white" fontWeight="bold" />
          </Flex>
        </Flex>
      </Box>

      {/* Alert Strip */}
      <AlertStrip pendingLeaves={pendingLeaves} attendanceRate={attendanceRate} />

      {/* ── KPI Cards ── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <KpiCard label="Total Staff"      value={totalEmployees} sub="Active employees" icon={FaUsers}        accent={C.blue}   to="/dashboard/employees" />
        <KpiCard label="Present Today"    value={presentToday}   sub={`${notMarked} not marked`} icon={FaCalendarCheck} accent={C.green}  to="/dashboard/attendance/daily" />
        <KpiCard label="Pending Leaves"   value={pendingLeaves}  sub="Awaiting action"  icon={FaClipboardList} accent={C.orange} to="/dashboard/leaves" />
        <KpiCard label="Attendance Rate"  value={`${attendanceRate}%`} sub="of workforce today" icon={FaChartLine} accent={C.purple} />
      </SimpleGrid>

      {/* ── Attendance Rate Bar ── */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100" mb={6}>
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Text fontWeight="700" fontSize="sm" color="gray.800">Today's Attendance</Text>
            <Text fontSize="xs" color="gray.400">{presentToday} present · {notMarked} absent/not marked</Text>
          </Box>
          <Badge colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"}
            borderRadius="full" px={3} py={1} fontSize="sm" fontWeight="bold">{attendanceRate}%</Badge>
        </Flex>
        <Progress value={attendanceRate} colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"}
          borderRadius="full" size="md" bg="gray.100" />
        <Flex justify="space-between" mt={2}>
          <Flex align="center" gap={1.5}><Box w={2} h={2} borderRadius="full" bg="green.400" /><Text fontSize="xs" color="gray.400">{presentToday} Present</Text></Flex>
          <Flex align="center" gap={1.5}><Box w={2} h={2} borderRadius="full" bg="gray.200" /><Text fontSize="xs" color="gray.400">{notMarked} Not Marked</Text></Flex>
        </Flex>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
        {/* Attendance Donut */}
        <ChartCard title="Attendance Snapshot" sub="Today's workforce status">
          <Flex direction={{ base: "column", sm: "row" }} align="center" gap={5}>
            <Box w="160px" h="160px" flexShrink={0} position="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={73} paddingAngle={3} dataKey="value">
                    <Cell fill="#16a34a" /><Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Flex position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)" direction="column" align="center">
                <Text fontSize="2xl" fontWeight="extrabold" color="gray.800">{attendanceRate}%</Text>
                <Text fontSize="9px" color="gray.400">Present</Text>
              </Flex>
            </Box>
            <Box flex={1} w="100%">
              {donutData.map((d, i) => (
                <Flex key={d.name} align="center" justify="space-between" mb={3} p={3}
                  bg={i === 0 ? "green.50" : "gray.50"} borderRadius="xl">
                  <Flex align="center" gap={2}>
                    <Box w={3} h={3} borderRadius="full" bg={i === 0 ? "#16a34a" : "#9ca3af"} />
                    <Text fontSize="sm" color="gray.600" fontWeight="500">{d.name}</Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="bold" color="gray.800">{d.value}</Text>
                </Flex>
              ))}
              <Flex justify="space-between" mt={2} px={1}>
                <Text fontSize="xs" color="gray.400">Total Staff</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.700">{totalEmployees}</Text>
              </Flex>
            </Box>
          </Flex>
        </ChartCard>

        {/* Monthly Trend */}
        <ChartCard title="Monthly Attendance Trend" sub="Daily present vs absent"
          action="View All" onAction={() => navigate("/dashboard/attendance/daily")}>
          {attendanceChartData.length === 0 ? (
            <Flex h="160px" align="center" justify="center" color="gray.300" fontSize="sm">No data yet</Flex>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attendanceChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="mgP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mgA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <ReTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={2.5} fill="url(#mgP)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="Absent"  stroke="#dc2626" strokeWidth={2.5} fill="url(#mgA)"  dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Grid>

      {/* Quick Actions */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100">
        <Text fontWeight="700" fontSize="sm" color="gray.800" mb={3}>Quick Navigation</Text>
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={2}>
          <NavItem icon={FaCalendarCheck} label="Daily Attendance" to="/dashboard/attendance/daily" accent="#16a34a" />
          <NavItem icon={FaUsers}         label="Employee List"    to="/dashboard/employees"         accent={C.blue} />
          <NavItem icon={FaClipboardList} label="Leave Management" to="/dashboard/leaves"            accent={C.orange} />
        </SimpleGrid>
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
const AdminDashboard = ({ data }) => {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();
  const firstName  = user?.name?.split(" ")[0] || "Admin";
  const today      = new Date().toLocaleDateString("en-PK", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const currentMonth = new Date().toLocaleString("default", { month:"long", year:"numeric" });

  const totalEmployees = data.summary.totalEmployees || 0;
  const presentToday   = data.summary.attendanceToday || 0;
  const pendingLeaves  = data.summary.pendingLeaves || 0;
  const monthlyPayroll = data.summary.monthlyPayroll || 0;
  const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;
  const notMarked      = Math.max(0, totalEmployees - presentToday);

  const attendanceChartData = data.attendance.map((item) => ({
    name: item._id.slice(5), Present: item.present, Absent: item.absent,
  }));
  const leaveChartData = data.leaves.map((item) => ({ name: item._id, value: item.total }));
  if (leaveChartData.length === 0) leaveChartData.push({ name: "No Data", value: 1 });
  const payrollTrendData = data.payroll.map((p) => ({
    name: monthNames[p._id], Net: p.totalPaid,
  }));
  const totalPresentMonth = attendanceChartData.reduce((s, i) => s + (i.Present || 0), 0);
  const totalAbsentMonth  = attendanceChartData.reduce((s, i) => s + (i.Absent  || 0), 0);
  const totalLeaves       = data.leaves.reduce((s, l) => s + l.total, 0);

  return (
    <Box bg="#f7f9fc" minH="100%">
      {/* ══ HEADER BANNER ══ */}
      <Box mb={6} borderRadius="2xl" overflow="hidden" position="relative"
        bgGradient="linear(135deg, #021024 0%, #065f46 100%)">
        {/* decorative blobs */}
        <Box position="absolute" top="-30px" right="-30px" w="180px" h="180px" borderRadius="full" bg="whiteAlpha.100" />
        <Box position="absolute" bottom="-20px" right="130px" w="100px" h="100px" borderRadius="full" bg="whiteAlpha.50" />
        <Box position="absolute" top="20px" right="50px" w="50px" h="50px" borderRadius="full" bg="whiteAlpha.100" />

        <Flex justify="space-between" align="center" p={6} position="relative" zIndex={1} wrap="wrap" gap={4}>
          <Box>
            <Flex align="center" gap={2} mb={2}>
              <Box w={2} h={2} borderRadius="full" bg="green.400"
                boxShadow="0 0 0 3px rgba(74,222,128,0.3)" />
              <Text fontSize="11px" color="whiteAlpha.600" fontWeight="600" textTransform="uppercase" letterSpacing="0.1em">
                Live Dashboard
              </Text>
              <Text fontSize="11px" color="whiteAlpha.400">·</Text>
              <Text fontSize="11px" color="whiteAlpha.500">{currentMonth}</Text>
            </Flex>
            <Heading size="xl" color="white" fontWeight="extrabold">
              {getGreeting()}, {firstName} 👋
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.600" mt={1}>{today}</Text>
          </Box>
          <Flex align="center" gap={5}>
            {/* Inline mini stats */}
            <Flex gap={5} display={{ base: "none", md: "flex" }}>
              <Box textAlign="center" px={4} py={2} bg="whiteAlpha.100" borderRadius="xl">
                <Text fontSize="xl" fontWeight="extrabold" color="white">{totalEmployees}</Text>
                <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase">Staff</Text>
              </Box>
              <Box textAlign="center" px={4} py={2} bg="whiteAlpha.100" borderRadius="xl">
                <Text fontSize="xl" fontWeight="extrabold" color="green.300">{attendanceRate}%</Text>
                <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase">Present</Text>
              </Box>
              <Box textAlign="center" px={4} py={2} bg="whiteAlpha.100" borderRadius="xl">
                <Text fontSize="xl" fontWeight="extrabold" color="orange.300">{pendingLeaves}</Text>
                <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase">Pending</Text>
              </Box>
            </Flex>
            <Avatar name={user?.name} size="lg" bg="green.400" color="white" fontWeight="bold" />
          </Flex>
        </Flex>

        {/* Bottom strip */}
        <Flex px={6} py={3} bg="blackAlpha.200" justify="space-between" align="center" wrap="wrap" gap={2}>
          <Flex align="center" gap={1.5}>
            <Icon as={FaCheckCircle} color="green.300" boxSize={3} />
            <Text fontSize="xs" color="whiteAlpha.700">System operational</Text>
          </Flex>
          <Flex gap={4}>
            <Button size="xs" variant="ghost" color="whiteAlpha.700" _hover={{ color: "white" }}
              onClick={() => navigate("/dashboard/employees")}>Employees</Button>
            <Button size="xs" variant="ghost" color="whiteAlpha.700" _hover={{ color: "white" }}
              onClick={() => navigate("/dashboard/payroll")}>Payroll</Button>
            <Button size="xs" variant="ghost" color="whiteAlpha.700" _hover={{ color: "white" }}
              onClick={() => navigate("/dashboard/reports/attendance")}>Reports</Button>
          </Flex>
        </Flex>
      </Box>

      {/* Alert Strip */}
      <AlertStrip pendingLeaves={pendingLeaves} attendanceRate={attendanceRate} />

      {/* ══ 4 KPI CARDS ══ */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <KpiCard label="Total Employees" value={totalEmployees}        sub="Active staff"         icon={FaUsers}         accent={C.blue}   to="/dashboard/employees" />
        <KpiCard label="Present Today"   value={presentToday}          sub={`${notMarked} absent`} icon={FaCalendarCheck} accent={C.green}  to="/dashboard/attendance/daily" />
        <KpiCard label="Pending Leaves"  value={pendingLeaves}         sub="Need approval"        icon={FaClipboardList} accent={C.orange} to="/dashboard/leaves" />
        <KpiCard label="Monthly Payroll" value={fmtMoney(monthlyPayroll)} sub="Net disbursed"    icon={FaMoneyBillWave} accent={C.purple} to="/dashboard/payroll" />
      </SimpleGrid>

      {/* ══ ATTENDANCE PROGRESS BAR ══ */}
      <Box bg="white" borderRadius="2xl" px={6} py={4} mb={6} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Text fontWeight="700" fontSize="sm" color="gray.800">Today's Attendance</Text>
            <Text fontSize="xs" color="gray.400">{presentToday} present · {notMarked} absent/not marked</Text>
          </Box>
          <Badge colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"}
            borderRadius="full" px={3} py={1} fontSize="sm" fontWeight="bold">{attendanceRate}%</Badge>
        </Flex>
        <Progress value={attendanceRate} colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"}
          borderRadius="full" size="md" bg="gray.100" />
        <Flex justify="space-between" mt={2}>
          <Flex align="center" gap={1.5}><Box w={2} h={2} borderRadius="full" bg="green.400" /><Text fontSize="xs" color="gray.400">{presentToday} Present</Text></Flex>
          <Flex align="center" gap={1.5}><Box w={2} h={2} borderRadius="full" bg="gray.200" /><Text fontSize="xs" color="gray.400">{notMarked} Not Marked</Text></Flex>
        </Flex>
      </Box>

      {/* ══ ROW 1: Attendance Chart (2/3) + Leave Donut (1/3) ══ */}
      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6} mb={6}>
        <ChartCard title="Monthly Attendance" sub="Present vs Absent — day by day"
          action="Attendance Page" onAction={() => navigate("/dashboard/attendance/daily")}>
          <Flex gap={4} mb={3} wrap="wrap">
            <Flex align="center" gap={1.5}><Box w={3} h={3} borderRadius="full" bg="#16a34a" /><Text fontSize="xs" color="gray.500">Present ({totalPresentMonth})</Text></Flex>
            <Flex align="center" gap={1.5}><Box w={3} h={3} borderRadius="full" bg="#dc2626" /><Text fontSize="xs" color="gray.500">Absent ({totalAbsentMonth})</Text></Flex>
          </Flex>
          {attendanceChartData.length === 0 ? (
            <Flex h="200px" align="center" justify="center" color="gray.300" fontSize="sm">No attendance data yet</Flex>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.35} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.25} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <ReTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={2.5} fill="url(#gP)" dot={false} activeDot={{ r: 5, fill: "#16a34a" }} />
                <Area type="monotone" dataKey="Absent"  stroke="#dc2626" strokeWidth={2.5} fill="url(#gA)"  dot={false} activeDot={{ r: 5, fill: "#dc2626" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Leave Breakdown" sub="By leave type this month">
          <Flex justify="center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={leaveChartData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                  {leaveChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <ReTooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </Flex>
          <Divider mb={3} />
          {leaveChartData.map((item, i) => (
            <Flex key={item.name} align="center" justify="space-between" mb={2}>
              <Flex align="center" gap={2}>
                <Box w={2.5} h={2.5} borderRadius="full" bg={PIE_COLORS[i % PIE_COLORS.length]} />
                <Text fontSize="xs" color="gray.600">{item.name}</Text>
              </Flex>
              <Text fontSize="xs" fontWeight="bold" color="gray.700">{item.value}</Text>
            </Flex>
          ))}
        </ChartCard>
      </Grid>

      {/* ══ ROW 2: Payroll Trend (2/3) + Quick Nav (1/3) ══ */}
      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6} mb={6}>
        <ChartCard title="Payroll Trend" sub="Net salaries disbursed by month"
          action="Payroll Report" onAction={() => navigate("/dashboard/reports/payroll")}>
          {payrollTrendData.length === 0 ? (
            <Flex h="200px" align="center" justify="center" color="gray.300" fontSize="sm">No payroll data yet</Flex>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payrollTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#065f46" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <ReTooltip formatter={(v) => [`Rs ${Number(v).toLocaleString()}`, "Net Salary"]}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: "12px" }}
                  cursor={{ fill: "#f0fdf4" }} />
                <Bar dataKey="Net" fill="url(#gBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontWeight="700" fontSize="sm" color="gray.800" mb={4}>Quick Navigation</Text>
          <Flex direction="column" gap={2}>
            <NavItem icon={FaUsers}         label="Employees"     to="/dashboard/employees"              accent={C.blue}   />
            <NavItem icon={FaCalendarCheck} label="Attendance"    to="/dashboard/attendance/daily"       accent={C.green}  />
            <NavItem icon={FaClipboardList} label="Leave Requests" to="/dashboard/leaves"               accent={C.orange} />
            <NavItem icon={FaMoneyBillWave} label="Payroll"       to="/dashboard/payroll"                accent={C.purple} />
            <NavItem icon={FaUserTie}       label="Users"         to="/dashboard/users"                  accent="#0891b2"  />
            <NavItem icon={FaChartLine}     label="Reports"       to="/dashboard/reports/attendance"     accent="#7c3aed"  />
          </Flex>
        </Box>
      </Grid>

      {/* ══ BOTTOM: Month at a Glance ══ */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Text fontWeight="700" fontSize="sm" color="gray.800">This Month at a Glance</Text>
            <Text fontSize="xs" color="gray.400">{currentMonth} summary</Text>
          </Box>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {[
            { label: "Total Attendances", value: totalPresentMonth, bg: "#f0fdf4", color: "green.600" },
            { label: "Total Absences",    value: totalAbsentMonth,  bg: "#fef2f2", color: "red.500"   },
            { label: "Leave Requests",    value: totalLeaves,       bg: "#fefce8", color: "yellow.600" },
            { label: "Payroll Disbursed", value: fmtMoney(monthlyPayroll), bg: "#f0f9ff", color: "blue.600" },
          ].map((s) => (
            <Flex key={s.label} direction="column" align="center" justify="center"
              p={4} bg={s.bg} borderRadius="xl" textAlign="center" gap={1}>
              <Text fontSize="2xl" fontWeight="extrabold" color={s.color}>{s.value}</Text>
              <Text fontSize="xs" color="gray.500" fontWeight="500">{s.label}</Text>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════ */
const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const isManager = user?.role === "Manager";

  const [data, setData] = useState({
    summary: { totalEmployees: 0, attendanceToday: 0, pendingLeaves: 0, monthlyPayroll: 0 },
    attendance: [], leaves: [], payroll: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = [
          api.get("/dashboard/summary"),
          api.get("/dashboard/attendance-chart"),
          api.get("/dashboard/leave-stats"),
        ];
        if (!isManager) requests.push(api.get("/dashboard/payroll-stats"));
        const results = await Promise.all(requests);
        setData({
          summary:    results[0].data,
          attendance: results[1].data,
          leaves:     results[2].data,
          payroll:    results[3]?.data || [],
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isManager]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="500px" direction="column" gap={4}>
        <Spinner size="xl" color="#065f46" thickness="4px" />
        <Text fontSize="sm" color="gray.400">Loading dashboard...</Text>
      </Flex>
    );
  }

  return isManager ? <ManagerDashboard data={data} /> : <AdminDashboard data={data} />;
};

export default DashboardHome;
