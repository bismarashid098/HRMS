import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Icon,
  Heading,
  Spinner,
  Badge,
  Button,
  Progress,
  Divider,
  Avatar,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaCalendarCheck,
  FaClipboardList,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaUserTie,
  FaBell,
  FaChevronRight,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ─── color palette ─── */
const GREEN = "#065f46";
const GREEN_LIGHT = "#d1fae5";
const BLUE = "#1d4ed8";
const BLUE_LIGHT = "#dbeafe";
const ORANGE = "#b45309";
const ORANGE_LIGHT = "#fef3c7";
const PURPLE = "#6d28d9";
const PURPLE_LIGHT = "#ede9fe";
const RED = "#dc2626";
const PIE_COLORS = ["#065f46", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

/* ─── helpers ─── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const fmtMoney = (n) =>
  n >= 1_000_000
    ? `Rs ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `Rs ${(n / 1_000).toFixed(0)}K`
    : `Rs ${n}`;

const monthNames = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ══════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════ */
const StatCard = ({ label, value, sub, icon, iconBg, iconColor, accentColor, trend, to }) => {
  const navigate = useNavigate();
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={5}
      shadow="md"
      borderLeft="4px solid"
      borderLeftColor={accentColor}
      cursor={to ? "pointer" : "default"}
      _hover={to ? { shadow: "lg", transform: "translateY(-2px)" } : {}}
      transition="all 0.2s"
      onClick={() => to && navigate(to)}
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="extrabold" color="gray.800" mt={1}>
            {value}
          </Text>
          {sub && (
            <Text fontSize="xs" color="gray.400" mt={0.5}>
              {sub}
            </Text>
          )}
        </Box>
        <Box bg={iconBg} borderRadius="xl" p={3} display="flex" alignItems="center" justifyContent="center">
          <Icon as={icon} boxSize={5} color={iconColor} />
        </Box>
      </Flex>
      {trend !== undefined && (
        <Flex align="center" mt={3} gap={1}>
          <Icon
            as={trend >= 0 ? FaArrowUp : FaArrowDown}
            boxSize={3}
            color={trend >= 0 ? "green.500" : "red.500"}
          />
          <Text fontSize="xs" color={trend >= 0 ? "green.600" : "red.500"} fontWeight="medium">
            {Math.abs(trend)}% vs last month
          </Text>
        </Flex>
      )}
    </Box>
  );
};

/* ══════════════════════════════════════════════
   QUICK LINK CARD
══════════════════════════════════════════════ */
const QuickLink = ({ icon, label, to, color }) => {
  const navigate = useNavigate();
  return (
    <Flex
      align="center"
      gap={3}
      p={3}
      borderRadius="xl"
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
      onClick={() => navigate(to)}
      transition="all 0.15s"
    >
      <Box bg={color + "15"} p={2} borderRadius="lg">
        <Icon as={icon} color={color} boxSize={4} />
      </Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.700" flex={1}>
        {label}
      </Text>
      <Icon as={FaChevronRight} boxSize={3} color="gray.400" />
    </Flex>
  );
};

/* ══════════════════════════════════════════════
   MANAGER DASHBOARD
══════════════════════════════════════════════ */
const ManagerDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Manager";
  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const totalEmployees = data.summary.totalEmployees || 0;
  const presentToday = data.summary.attendanceToday || 0;
  const pendingLeaves = data.summary.pendingLeaves || 0;
  const notMarked = Math.max(0, totalEmployees - presentToday);
  const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const donutData = [
    { name: "Present", value: presentToday },
    { name: "Absent / Not Marked", value: notMarked },
  ];

  const attendanceChartData = data.attendance.map((item) => ({
    name: item._id.slice(5),
    Present: item.present,
    Absent: item.absent,
  }));

  return (
    <Box p={{ base: 4, md: 6 }} bg="#f7f9fc" minH="100%">
      {/* ── Header Banner ── */}
      <Box
        mb={6}
        p={6}
        borderRadius="2xl"
        bgGradient="linear(135deg, #021024 0%, #065f46 100%)"
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* decorative circles */}
        <Box position="absolute" top="-20px" right="-20px" w="120px" h="120px" borderRadius="full" bg="whiteAlpha.100" />
        <Box position="absolute" bottom="-30px" right="80px" w="80px" h="80px" borderRadius="full" bg="whiteAlpha.50" />

        <Flex justify="space-between" align="center" position="relative" zIndex={1}>
          <Box>
            <Badge colorScheme="green" mb={2} fontSize="xs">{getGreeting()}</Badge>
            <Heading size="lg" fontWeight="extrabold">
              Welcome back, {firstName} 👋
            </Heading>
            <Text fontSize="sm" mt={1} opacity={0.8}>{today}</Text>
          </Box>
          <Avatar name={user?.name} size="md" bg="green.400" color="white" />
        </Flex>
      </Box>

      {/* ── Stat Cards ── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <StatCard label="Total Staff" value={totalEmployees} icon={FaUsers} iconBg={BLUE_LIGHT} iconColor={BLUE} accentColor={BLUE} to="/dashboard/employees" />
        <StatCard label="Present Today" value={presentToday} icon={FaCalendarCheck} iconBg={GREEN_LIGHT} iconColor={GREEN} accentColor={GREEN} to="/dashboard/attendance/daily" />
        <StatCard label="Pending Leaves" value={pendingLeaves} icon={FaClipboardList} iconBg={ORANGE_LIGHT} iconColor={ORANGE} accentColor={ORANGE} to="/dashboard/leaves" />
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} sub={`${notMarked} not marked`} icon={FaChartLine} iconBg={PURPLE_LIGHT} iconColor={PURPLE} accentColor={PURPLE} />
      </SimpleGrid>

      {/* ── Attendance Rate Progress ── */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm" mb={6}>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="sm" color="gray.700">Today's Attendance Rate</Heading>
          <Badge colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"} borderRadius="full" px={3}>
            {attendanceRate >= 80 ? "Good" : attendanceRate >= 60 ? "Average" : "Low"}
          </Badge>
        </Flex>
        <Progress value={attendanceRate} colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"} borderRadius="full" size="lg" mb={2} />
        <Flex justify="space-between">
          <Text fontSize="xs" color="gray.500">{presentToday} Present</Text>
          <Text fontSize="xs" color="gray.500">{notMarked} Absent / Not Marked</Text>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* ── Attendance Donut ── */}
        <Box bg="white" borderRadius="2xl" p={5} shadow="sm">
          <Heading size="sm" color="gray.700" mb={4}>Attendance Snapshot</Heading>
          <Flex direction={{ base: "column", sm: "row" }} align="center" gap={4}>
            <Box w="180px" h="180px" flexShrink={0} position="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#16a34a" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Flex position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)" direction="column" align="center">
                <Text fontSize="2xl" fontWeight="extrabold" color="gray.800">{attendanceRate}%</Text>
                <Text fontSize="9px" color="gray.500" textAlign="center">Present</Text>
              </Flex>
            </Box>
            <Box flex={1} w="100%">
              {donutData.map((d, i) => (
                <Flex key={d.name} align="center" justify="space-between" mb={3}>
                  <Flex align="center" gap={2}>
                    <Box w="10px" h="10px" borderRadius="full" bg={i === 0 ? "#16a34a" : "#e5e7eb"} />
                    <Text fontSize="sm" color="gray.600">{d.name}</Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="bold" color="gray.800">{d.value}</Text>
                </Flex>
              ))}
              <Divider my={2} />
              <Flex justify="space-between">
                <Text fontSize="xs" color="gray.500">Total Staff</Text>
                <Text fontSize="xs" fontWeight="bold">{totalEmployees}</Text>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* ── Monthly Attendance Chart ── */}
        <Box bg="white" borderRadius="2xl" p={5} shadow="sm">
          <Heading size="sm" color="gray.700" mb={4}>Monthly Attendance Trend</Heading>
          {attendanceChartData.length === 0 ? (
            <Flex h="160px" align="center" justify="center" color="gray.400" fontSize="sm">No data for this month</Flex>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attendanceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={2} fill="url(#colorPresent)" dot={false} />
                <Area type="monotone" dataKey="Absent" stroke="#dc2626" strokeWidth={2} fill="url(#colorAbsent)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      </SimpleGrid>

      {/* ── Quick Actions ── */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm">
        <Heading size="sm" color="gray.700" mb={3}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={1}>
          <QuickLink icon={FaCalendarCheck} label="Daily Attendance" to="/dashboard/attendance/daily" color="#16a34a" />
          <QuickLink icon={FaUsers} label="Employee List" to="/dashboard/employees" color={BLUE} />
          <QuickLink icon={FaClipboardList} label="Leave Management" to="/dashboard/leaves" color={ORANGE} />
        </SimpleGrid>
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
const AdminDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const totalEmployees = data.summary.totalEmployees || 0;
  const presentToday = data.summary.attendanceToday || 0;
  const pendingLeaves = data.summary.pendingLeaves || 0;
  const monthlyPayroll = data.summary.monthlyPayroll || 0;
  const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const attendanceChartData = data.attendance.map((item) => ({
    name: item._id.slice(5),
    Present: item.present,
    Absent: item.absent,
  }));

  const leaveChartData = data.leaves.map((item) => ({
    name: item._id,
    value: item.total,
  }));
  if (leaveChartData.length === 0) leaveChartData.push({ name: "No Data", value: 1 });

  const payrollTrendData = data.payroll.map((p) => ({
    name: monthNames[p._id],
    value: p.totalPaid,
  }));

  const totalPresentMonth = attendanceChartData.reduce((s, i) => s + (i.Present || 0), 0);
  const totalAbsentMonth = attendanceChartData.reduce((s, i) => s + (i.Absent || 0), 0);

  return (
    <Box p={{ base: 4, md: 6 }} bg="#f7f9fc" minH="100%">
      {/* ── Header Banner ── */}
      <Box
        mb={6}
        p={6}
        borderRadius="2xl"
        bgGradient="linear(135deg, #021024 0%, #065f46 100%)"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="-30px" right="-30px" w="160px" h="160px" borderRadius="full" bg="whiteAlpha.100" />
        <Box position="absolute" bottom="-20px" right="120px" w="90px" h="90px" borderRadius="full" bg="whiteAlpha.50" />
        <Box position="absolute" top="10px" right="40px" w="50px" h="50px" borderRadius="full" bg="whiteAlpha.100" />

        <Flex justify="space-between" align="center" position="relative" zIndex={1} wrap="wrap" gap={3}>
          <Box>
            <Badge colorScheme="green" mb={2} fontSize="xs" px={3} borderRadius="full">{getGreeting()}</Badge>
            <Heading size="lg" fontWeight="extrabold">
              Welcome back, {firstName} 👋
            </Heading>
            <Text fontSize="sm" mt={1} opacity={0.8}>{today}</Text>
          </Box>
          <Flex align="center" gap={3}>
            <Box textAlign="right">
              <Text fontSize="xs" opacity={0.7}>Attendance Today</Text>
              <Text fontSize="2xl" fontWeight="extrabold">{attendanceRate}%</Text>
            </Box>
            <Avatar name={user?.name} size="md" bg="green.400" color="white" />
          </Flex>
        </Flex>
      </Box>

      {/* ── 4 KPI Cards ── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <StatCard
          label="Total Employees"
          value={totalEmployees}
          sub="Active staff"
          icon={FaUsers}
          iconBg={BLUE_LIGHT}
          iconColor={BLUE}
          accentColor={BLUE}
          to="/dashboard/employees"
        />
        <StatCard
          label="Present Today"
          value={presentToday}
          sub={`${attendanceRate}% attendance`}
          icon={FaCalendarCheck}
          iconBg={GREEN_LIGHT}
          iconColor={GREEN}
          accentColor={GREEN}
          to="/dashboard/attendance/daily"
        />
        <StatCard
          label="Pending Leaves"
          value={pendingLeaves}
          sub="Awaiting approval"
          icon={FaClipboardList}
          iconBg={ORANGE_LIGHT}
          iconColor={ORANGE}
          accentColor={ORANGE}
          to="/dashboard/leaves"
        />
        <StatCard
          label="Monthly Payroll"
          value={fmtMoney(monthlyPayroll)}
          sub="Net this month"
          icon={FaMoneyBillWave}
          iconBg={PURPLE_LIGHT}
          iconColor={PURPLE}
          accentColor={PURPLE}
          to="/dashboard/payroll"
        />
      </SimpleGrid>

      {/* ── Attendance Progress Bar ── */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm" mb={6}>
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Heading size="sm" color="gray.700">Today's Attendance Overview</Heading>
            <Text fontSize="xs" color="gray.400" mt={0.5}>{presentToday} present · {totalEmployees - presentToday} absent/not marked</Text>
          </Box>
          <Badge
            colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"}
            borderRadius="full" px={3} py={1} fontSize="sm"
          >
            {attendanceRate}%
          </Badge>
        </Flex>
        <Progress
          value={attendanceRate}
          colorScheme={attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "yellow" : "red"}
          borderRadius="full"
          size="md"
          bg="gray.100"
        />
      </Box>

      {/* ── Row 1: Area Chart + Pie Leave ── */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} mb={6}>
        {/* Attendance Area Chart */}
        <Box gridColumn={{ xl: "span 2" }} bg="white" borderRadius="2xl" p={5} shadow="sm" minW={0}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="sm" color="gray.700">Monthly Attendance</Heading>
              <Text fontSize="xs" color="gray.400">Present vs Absent — day by day</Text>
            </Box>
            <Flex gap={4}>
              <Flex align="center" gap={1}>
                <Box w="8px" h="8px" borderRadius="full" bg="#16A34A" />
                <Text fontSize="xs" color="gray.500">Present ({totalPresentMonth})</Text>
              </Flex>
              <Flex align="center" gap={1}>
                <Box w="8px" h="8px" borderRadius="full" bg="#DC2626" />
                <Text fontSize="xs" color="gray.500">Absent ({totalAbsentMonth})</Text>
              </Flex>
            </Flex>
          </Flex>
          {attendanceChartData.length === 0 ? (
            <Flex h="200px" align="center" justify="center" color="gray.400" fontSize="sm">No attendance data for this month</Flex>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: "12px" }}
                  cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={2.5} fill="url(#gPresent)" dot={false} activeDot={{ r: 5, fill: "#16a34a" }} />
                <Area type="monotone" dataKey="Absent" stroke="#dc2626" strokeWidth={2.5} fill="url(#gAbsent)" dot={false} activeDot={{ r: 5, fill: "#dc2626" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Leave Breakdown Donut */}
        <Box bg="white" borderRadius="2xl" p={5} shadow="sm" minW={0}>
          <Heading size="sm" color="gray.700" mb={4}>Leave Breakdown</Heading>
          <Box display="flex" justifyContent="center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={leaveChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {leaveChartData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box mt={2}>
            {leaveChartData.map((item, index) => (
              <Flex key={item.name} align="center" justify="space-between" mb={2}>
                <Flex align="center" gap={2}>
                  <Box w="8px" h="8px" borderRadius="full" bg={PIE_COLORS[index % PIE_COLORS.length]} />
                  <Text fontSize="xs" color="gray.600">{item.name}</Text>
                </Flex>
                <Text fontSize="xs" fontWeight="bold" color="gray.700">{item.value}</Text>
              </Flex>
            ))}
          </Box>
        </Box>
      </SimpleGrid>

      {/* ── Row 2: Payroll Bar Chart + Quick Links ── */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} mb={6}>
        {/* Payroll Trend */}
        <Box gridColumn={{ xl: "span 2" }} bg="white" borderRadius="2xl" p={5} shadow="sm" minW={0}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="sm" color="gray.700">Payroll Trend</Heading>
              <Text fontSize="xs" color="gray.400">Net salaries paid by month</Text>
            </Box>
            <Button size="xs" variant="outline" colorScheme="green" onClick={() => navigate("/dashboard/reports/payroll")}>
              View Report
            </Button>
          </Flex>
          {payrollTrendData.length === 0 ? (
            <Flex h="200px" align="center" justify="center" color="gray.400" fontSize="sm">No payroll data yet</Flex>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payrollTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#065f46" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`Rs ${Number(value).toLocaleString()}`, "Net Salary"]}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: "12px" }}
                  cursor={{ fill: "#f0fdf4" }}
                />
                <Bar dataKey="value" fill="url(#gPayroll)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Quick Links */}
        <Box bg="white" borderRadius="2xl" p={5} shadow="sm">
          <Heading size="sm" color="gray.700" mb={4}>Quick Navigation</Heading>
          <QuickLink icon={FaUsers} label="Employee Directory" to="/dashboard/employees" color={BLUE} />
          <QuickLink icon={FaCalendarCheck} label="Daily Attendance" to="/dashboard/attendance/daily" color={GREEN} />
          <QuickLink icon={FaClipboardList} label="Leave Requests" to="/dashboard/leaves" color={ORANGE} />
          <QuickLink icon={FaMoneyBillWave} label="Payroll" to="/dashboard/payroll" color={PURPLE} />
          <QuickLink icon={FaUserTie} label="User Management" to="/dashboard/users" color="#0891b2" />
          <QuickLink icon={FaChartLine} label="Reports" to="/dashboard/reports/attendance" color="#7c3aed" />
        </Box>
      </SimpleGrid>

      {/* ── Row 3: Stats Summary Bar ── */}
      <Box bg="white" borderRadius="2xl" p={5} shadow="sm">
        <Heading size="sm" color="gray.700" mb={4}>This Month at a Glance</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Box textAlign="center" p={3} bg="#f0fdf4" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="extrabold" color="green.600">{totalPresentMonth}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Total Attendances</Text>
          </Box>
          <Box textAlign="center" p={3} bg="#fef2f2" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="extrabold" color="red.500">{totalAbsentMonth}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Total Absences</Text>
          </Box>
          <Box textAlign="center" p={3} bg="#fefce8" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="extrabold" color="yellow.600">
              {data.leaves.reduce((s, l) => s + l.total, 0)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Leave Requests</Text>
          </Box>
          <Box textAlign="center" p={3} bg="#f0f9ff" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="extrabold" color="blue.600">{fmtMoney(monthlyPayroll)}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Payroll Disbursed</Text>
          </Box>
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
    attendance: [],
    leaves: [],
    payroll: [],
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
          summary: results[0].data,
          attendance: results[1].data,
          leaves: results[2].data,
          payroll: results[3]?.data || [],
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
        <Text fontSize="sm" color="gray.500">Loading dashboard...</Text>
      </Flex>
    );
  }

  return isManager ? <ManagerDashboard data={data} /> : <AdminDashboard data={data} />;
};

export default DashboardHome;
