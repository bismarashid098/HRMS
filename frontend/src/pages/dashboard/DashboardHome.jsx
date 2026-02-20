import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  SimpleGrid,
  Text,
  Card,
  CardBody,
  Flex,
  Icon,
  Heading,
  Spinner,
  Avatar,
  Tag,
  TagLabel,
  Badge,
} from "@chakra-ui/react";
import { FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#065f46", "#FFBB28", "#FF8042", "#021024"];

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const isManager = user?.role === "Manager";
  const [data, setData] = useState({
    summary: {
      totalEmployees: 0,
      attendanceToday: 0,
      pendingLeaves: 0,
      monthlyPayroll: 0,
    },
    attendance: [],
    leaves: [],
    payroll: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, attendanceRes, leavesRes, payrollRes] =
          await Promise.all([
            api.get("/dashboard/summary"),
            api.get("/dashboard/attendance-chart"),
            api.get("/dashboard/leave-stats"),
            api.get("/dashboard/payroll-stats"),
          ]);

        setData({
          summary: summaryRes.data,
          attendance: attendanceRes.data,
          leaves: leavesRes.data,
          payroll: payrollRes.data,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="500px">
        <Spinner size="xl" color="#065f46" />
      </Flex>
    );
  }

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const attendanceChartData = data.attendance.map((item) => ({
    name: item._id.slice(5),
    Present: item.present,
    Absent: item.absent,
  }));

  const leaveChartData = data.leaves.map((item) => ({
    name: item._id,
    value: item.total,
  }));
  if (leaveChartData.length === 0) {
    leaveChartData.push({ name: "No Leaves", value: 1 });
  }

  const payrollTrendData = data.payroll.map((p) => ({
    name: monthNames[p._id],
    value: p.totalPaid,
  }));

  const totalEmployees = data.summary.totalEmployees || 0;
  const presentToday = data.summary.attendanceToday || 0;
  const notMarked = totalEmployees > presentToday ? totalEmployees - presentToday : 0;
  const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const managerDonutData = [
    { name: "Present / Marked", value: presentToday },
    { name: "Not Marked", value: notMarked },
  ];

  const today = new Date().toLocaleDateString();
  const firstName = user?.name?.split(" ")[0] || "Manager";

  if (isManager) {
    return (
      <Box p={4} bg="#f5f5f0" minH="100%">
        <Box
          mb={5}
          p={4}
          borderRadius="2xl"
          bg="#021024"
          color="white"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="sm" opacity={0.8}>
                Hello, {firstName}
              </Text>
              <Heading size="md" mt={1}>
                Good Morning
              </Heading>
              <Text fontSize="xs" mt={1} opacity={0.8}>
                Quick view of your team today
              </Text>
            </Box>
            <Box
              w="40px"
              h="40px"
              borderRadius="full"
              bg="#facc15"
            />
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
          <ManagerStatCard
            label="Total Employees"
            value={totalEmployees}
            icon={FaUsers}
            iconBg="#ede9fe"
            iconColor="#4c1d95"
          />
          <ManagerStatCard
            label="Present Today"
            value={presentToday}
            icon={FaCalendarCheck}
            iconBg="#dbeafe"
            iconColor="#1d4ed8"
          />
          <ManagerStatCard
            label="Pending Leaves"
            value={data.summary.pendingLeaves}
            icon={FaClipboardList}
            iconBg="#fef9c3"
            iconColor="#92400e"
          />
          <ManagerStatCard
            label="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={FaCalendarCheck}
            iconBg="#dcfce7"
            iconColor="#166534"
          />
        </SimpleGrid>

        <Box bg="white" borderRadius="2xl" p={4} shadow="sm">
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" color="gray.700">
              Attendance Snapshot
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Today • {today}
            </Text>
          </Flex>

          <Flex gap={6} align="center" direction={{ base: "column", md: "row" }}>
            <Box w={{ base: "180px", md: "220px" }} h={{ base: "180px", md: "220px" }} position="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={managerDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {managerDonutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#16a34a" : "#e5e7eb"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Flex
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                direction="column"
                align="center"
              >
                <Text fontSize="xl" fontWeight="bold">
                  {totalEmployees}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Employees
                </Text>
              </Flex>
            </Box>

            <Box flex="1" w="100%">
              <SimpleGrid columns={1} spacing={2}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Box w="10px" h="10px" borderRadius="full" bg="#16a34a" />
                    <Text fontSize="sm" color="gray.700">
                      Present / Marked
                    </Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="semibold">
                    {presentToday}
                  </Text>
                </Flex>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Box w="10px" h="10px" borderRadius="full" bg="#e5e7eb" />
                    <Text fontSize="sm" color="gray.700">
                      Not Marked
                    </Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="semibold">
                    {notMarked}
                  </Text>
                </Flex>
              </SimpleGrid>
            </Box>
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box
        mb={6}
        p={4}
        borderRadius="2xl"
        bgGradient="linear(to-r, blue.700, purple.600)"
        color="white"
      >
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <Box>
            <Flex align="center" gap={2}>
              <Text fontSize="xs" textTransform="uppercase" opacity={0.8}>
                HRMS Overview
              </Text>
              <Badge colorScheme="green" variant="solid" fontSize="0.6em">v2.0 LIVE</Badge>
            </Flex>
            <Heading size="lg">
              Good day, {user?.name || "User"}
            </Heading>
            <Text fontSize="sm" mt={1} opacity={0.9}>
              Track attendance, leaves and payroll insights at a glance.
            </Text>
          </Box>
          <Flex align="center" gap={3}>
            <Box textAlign="right">
              <Text fontSize="xs" opacity={0.8}>
                Today
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {today}
              </Text>
            </Box>
            <Avatar size="md" name={user?.name} />
          </Flex>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mb={8}>
        <SummaryCard
          title="Active Employees"
          value={data.summary.totalEmployees}
          subtitle="Employees currently active in the system"
          icon={FaUsers}
          bg="#ECFDF5"
          color="#065f46"
          to="/dashboard/employees"
        />
        <SummaryCard
          title="Present Today"
          value={data.summary.attendanceToday}
          subtitle="Employees marked Present, Late or Half Day"
          icon={FaCalendarCheck}
          bg="#E0F2FE"
          color="#1D4ED8"
          to="/dashboard/attendance/daily"
        />
        <SummaryCard
          title="Pending Leaves"
          value={data.summary.pendingLeaves}
          subtitle="Leave requests waiting for approval"
          icon={FaClipboardList}
          bg="#FEF9C3"
          color="#92400E"
          to="/dashboard/leaves"
        />
        <SummaryCard
          title="This Month Payroll"
          value={`Rs ${data.summary.monthlyPayroll.toLocaleString()}`}
          subtitle="Net salaries generated for current month"
          icon={FaMoneyBillWave}
          bg="#FEE2E2"
          color="#B91C1C"
          to="/dashboard/payroll"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
        <Box gridColumn={{ xl: "span 2" }} bg="white" p={5} borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm" color="gray.600">
              Attendance This Month
            </Heading>
            <Text fontSize="xs" color="gray.400">
              Present vs Absent by day
            </Text>
          </Flex>
          <Box h="280px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Present" stroke="#16A34A" fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="Absent" stroke="#DC2626" fillOpacity={0.9} fill="url(#colorAbsent)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box bg="white" p={5} borderRadius="lg" shadow="sm">
          <Heading size="sm" color="gray.600" mb={4}>
            Leave Breakdown
          </Heading>
          <Box h="220px" position="relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leaveChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <SimpleGrid columns={2} mt={4} spacing={2}>
            {leaveChartData.map((item, index) => (
              <Flex key={item.name} align="center" gap={2}>
                <Box w="10px" h="10px" borderRadius="full" bg={COLORS[index % COLORS.length]} />
                <Text fontSize="xs" color="gray.600">
                  {item.name} ({item.value})
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} mt={6}>
        <Box bg="white" p={5} borderRadius="lg" shadow="sm">
          <Heading size="sm" color="gray.600" mb={3}>
            HRMS Modules
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={2}>
            <ModuleCard
              title="Employees"
              icon={FaUsers}
              tagline="Employees, profiles and history"
              items={[
                { label: "Employee List", to: "/dashboard/employees" },
                { label: "Add Employee", to: "/dashboard/employees/create" },
                { label: "Employee Detail Card", to: "/dashboard/employees" },
                { label: "Employee Ledger", to: "/dashboard/attendance" },
              ]}
            />
            <ModuleCard
              title="Attendance"
              icon={FaCalendarCheck}
              tagline="Daily attendance and late comers"
              items={[
                { label: "Attendance", to: "/dashboard/attendance" },
                { label: "Attendance Report", to: "/dashboard/reports/attendance" },
                { label: "Daily Attendance (Total Staff)", to: "/dashboard/attendance/daily" },
                { label: "Late Comers (Daily)", to: "/dashboard/attendance/daily?view=late" },
              ]}
            />
            <ModuleCard
              title="Payroll"
              icon={FaMoneyBillWave}
              tagline="Salary, loans and adjustments"
              items={[
                { label: "Payroll", to: "/dashboard/payroll" },
                { label: "Advance Salary", to: "/dashboard/advance" },
                { label: "Payroll Report", to: "/dashboard/reports/payroll" },
                { label: "Advance Report", to: "/dashboard/reports/advances" },
              ]}
            />
            <ModuleCard
              title="Leaves"
              icon={FaClipboardList}
              tagline="Leave requests and balances"
              items={[
                { label: "Leaves", to: "/dashboard/leaves" },
                { label: "Leave Report", to: "/dashboard/reports/leaves" },
                { label: "Absent Report (Daily)", to: "/dashboard/reports/attendance" },
                { label: "Remaining Leaves (Monthly)", to: "/dashboard/reports/leaves" },
              ]}
            />
            <ModuleCard
              title="Accounts Linking"
              icon={FaMoneyBillWave}
              tagline="Advance expenses and ledgers"
              items={[
                { label: "Account Ledger (Advance Expenses)", to: "/dashboard/reports/advances" },
                { label: "Salary Credit Summary", to: "/dashboard/reports/payroll" },
                { label: "If Linked With Accounts", to: "/dashboard/reports/advances" },
                { label: "Misc (Other)", to: "/dashboard/reports/advances" },
              ]}
            />
          </SimpleGrid>
        </Box>

        <Box gridColumn={{ xl: "span 2" }} bg="white" p={5} borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm" color="gray.600">
              Payroll Trend
            </Heading>
            <Text fontSize="xs" color="gray.400">
              Net salaries paid by month
            </Text>
          </Flex>
          <Box h="220px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} />
                <Area type="monotone" dataKey="value" stroke="#4F46E5" fillOpacity={1} fill="url(#colorPayroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const ManagerStatCard = ({ label, value, icon, iconBg, iconColor }) => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={3}
      shadow="sm"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Box
          borderRadius="full"
          bg={iconBg}
          p={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {icon && <Icon as={icon} boxSize={4} color={iconColor} />}
        </Box>
      </Flex>
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontSize="xl" fontWeight="bold" mt={1}>
        {value}
      </Text>
    </Box>
  );
};

const SummaryCard = ({ title, value, subtitle, icon, bg, color, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <Card
      borderRadius="xl"
      bg={bg}
      color={color}
      borderWidth="1px"
      borderColor="whiteAlpha.700"
      shadow="sm"
      cursor={to ? "pointer" : "default"}
      _hover={
        to
          ? { shadow: "md", transform: "translateY(-2px)", opacity: 0.95 }
          : { shadow: "sm", transform: "translateY(-2px)" }
      }
      transition="all 0.15s ease-out"
      onClick={handleClick}
    >
      <CardBody>
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Text fontSize="xs" textTransform="uppercase" fontWeight="semibold">
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="xs" mt={1} opacity={0.8}>
                {subtitle}
              </Text>
            )}
          </Box>
          {icon && (
            <Box
              borderRadius="full"
              bg="whiteAlpha.800"
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={icon} boxSize={4} color={color} />
            </Box>
          )}
        </Flex>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
          <Tag size="sm" variant="subtle" bg="whiteAlpha.900" color={color}>
            <TagLabel>Live</TagLabel>
          </Tag>
        </Flex>
      </CardBody>
    </Card>
  );
};

const ModuleCard = ({ title, tagline, icon, items }) => {
  const navigate = useNavigate();

  return (
    <Box
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.100"
      p={3}
      _hover={{ borderColor: "green.200", shadow: "sm" }}
      cursor="default"
    >
      <Flex align="center" mb={2} gap={2}>
        {icon && (
          <Box
            borderRadius="full"
            bg="green.50"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={icon} boxSize={4} color="green.700" />
          </Box>
        )}
        <Box>
          <Text fontSize="sm" fontWeight="semibold">
            {title}
          </Text>
          {tagline && (
            <Text fontSize="xs" color="gray.500">
              {tagline}
            </Text>
          )}
        </Box>
      </Flex>
      <Box mt={2}>
        {items.map((item) => (
          <Text
            key={item.label}
            fontSize="xs"
            color="gray.700"
            mb={1}
            cursor={item.to ? "pointer" : "default"}
            _hover={item.to ? { color: "green.700" } : undefined}
            onClick={() => item.to && navigate(item.to)}
          >
            • {item.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardHome;
