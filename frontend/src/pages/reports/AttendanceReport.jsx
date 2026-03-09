import { Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Select, Grid, Icon, Badge } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaChartBar } from "react-icons/fa";

const StatCard = ({ label, value, color, bg, icon, sub }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
        {sub && <Text fontSize="xs" color="gray.400" mt={0.5}>{sub}</Text>}
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
      </Flex>
    </Flex>
  </Box>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box bg="white" shadow="lg" borderRadius="xl" p={3} border="1px solid" borderColor="gray.100">
      <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Day {label}</Text>
      {payload.map((p) => (
        <Flex key={p.name} align="center" gap={2} mb={1}>
          <Box w={2} h={2} borderRadius="full" bg={p.fill} />
          <Text fontSize="xs" color="gray.600">{p.name}: <Text as="span" fontWeight="bold">{p.value}</Text></Text>
        </Flex>
      ))}
    </Box>
  );
};

const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const AttendanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/dashboard/attendance-chart?month=${month}&year=${year}`);
        setReportData(data);
        setError(null);
      } catch { setError("Failed to load attendance report."); }
      finally { setLoading(false); }
    };
    fetchReport();
  }, [month, year]);

  const totalPresent = reportData.reduce((s, d) => s + (d.present || 0), 0);
  const totalAbsent = reportData.reduce((s, d) => s + (d.absent || 0), 0);
  const avgPresent = reportData.length > 0 ? Math.round(totalPresent / reportData.length) : 0;
  const attendanceRate = (totalPresent + totalAbsent) > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) : 0;

  if (loading) return <Flex justify="center" align="center" h="400px" direction="column" gap={3}><Spinner size="xl" color="#065f46" thickness="3px" /><Text color="gray.400" fontSize="sm">Loading report...</Text></Flex>;
  if (error) return <Box bg="red.50" borderRadius="xl" p={6}><Text color="red.500">{error}</Text></Box>;

  return (
    <Box>
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Attendance Report</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>{monthNames[month]} {year} — Present vs Absent daily breakdown</Text>
          </Box>
          <Flex gap={3}>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} w="140px" borderRadius="xl" fontSize="sm" bg="whiteAlpha.200" color="white" border="1px solid" borderColor="whiteAlpha.300" sx={{ option: { bg: "#021024" } }}>
              {monthNames.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </Select>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))} w="100px" borderRadius="xl" fontSize="sm" bg="whiteAlpha.200" color="white" border="1px solid" borderColor="whiteAlpha.300" sx={{ option: { bg: "#021024" } }}>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </Select>
          </Flex>
        </Flex>
      </Box>

      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Days Loaded" value={reportData.length} color="#1d4ed8" bg="#eff6ff" icon={FaCalendarAlt} sub={`${monthNames[month]} ${year}`} />
        <StatCard label="Total Present" value={totalPresent} color="#065f46" bg="#f0fdf4" icon={FaUserCheck} sub="cumulative entries" />
        <StatCard label="Total Absent" value={totalAbsent} color="#dc2626" bg="#fef2f2" icon={FaUserTimes} sub="cumulative entries" />
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} color="#d97706" bg="#fffbeb" icon={FaChartBar} sub={`avg ${avgPresent} present/day`} />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={5}>
        <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100">
          <Text fontWeight="bold" fontSize="md" color="gray.800" mb={1}>Daily Attendance Overview</Text>
          <Text fontSize="xs" color="gray.400" mb={4}>Present vs Absent employees per day</Text>
          <Box h="320px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="present" name="Present" fill="#065f46" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight="bold" fontSize="md" color="gray.800">Daily Breakdown</Text>
            <Text fontSize="xs" color="gray.400">Present vs Absent per day</Text>
          </Box>
          <Box overflowY="auto" maxH="360px">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Day</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Present</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Absent</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reportData.length === 0 ? (
                  <Tr><Td colSpan={3} textAlign="center" py={8} color="gray.400">No data for this period.</Td></Tr>
                ) : reportData.map((day) => (
                  <Tr key={day._id} _hover={{ bg: "gray.50" }}>
                    <Td py={2}><Text fontSize="sm" fontWeight="medium" color="gray.700">{day._id}</Text></Td>
                    <Td py={2} isNumeric><Badge colorScheme="green" borderRadius="full" px={2} fontSize="xs">{day.present}</Badge></Td>
                    <Td py={2} isNumeric><Badge colorScheme="red" borderRadius="full" px={2} fontSize="xs">{day.absent}</Badge></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default AttendanceReport;
