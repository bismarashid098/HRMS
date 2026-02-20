import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Flex,
  Select,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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
        const { data } = await api.get(
          `/dashboard/attendance-chart?month=${month}&year=${year}`
        );
        setReportData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching attendance report:", err);
        setError("Failed to load attendance report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [month, year]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="green.500" />
      </Flex>
    );
  }
  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const totalPresent = reportData.reduce(
    (sum, day) => sum + (day.present || 0),
    0
  );
  const totalAbsent = reportData.reduce(
    (sum, day) => sum + (day.absent || 0),
    0
  );

  return (
    <Box p={6}>
      <Box mb={4}>
        <Heading size="lg" color="gray.700">
          Attendance Report
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Monthly overview of present vs absent employees with chart and table.
        </Text>
      </Box>

      <HStack mb={6} spacing={4}>
        <Select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          w="150px"
          bg="white"
        >
          <option value={1}>January</option>
          <option value={2}>February</option>
          <option value={3}>March</option>
          <option value={4}>April</option>
          <option value={5}>May</option>
          <option value={6}>June</option>
          <option value={7}>July</option>
          <option value={8}>August</option>
          <option value={9}>September</option>
          <option value={10}>October</option>
          <option value={11}>November</option>
          <option value={12}>December</option>
        </Select>
        <Select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          w="100px"
          bg="white"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </Select>
      </HStack>

      <SimpleGrid
        columns={{ base: 2, md: 4 }}
        spacing={4}
        mb={8}
      >
        <Box bg="white" p={4} borderRadius="lg" shadow="sm">
          <Stat>
            <StatLabel fontSize="xs" textTransform="uppercase" color="gray.500">
              Total Days Loaded
            </StatLabel>
            <StatNumber fontSize="xl" color="gray.800">
              {reportData.length}
            </StatNumber>
          </Stat>
        </Box>
        <Box bg="white" p={4} borderRadius="lg" shadow="sm">
          <Stat>
            <StatLabel fontSize="xs" textTransform="uppercase" color="green.700">
              Total Present
            </StatLabel>
            <StatNumber fontSize="xl" color="green.700">
              {totalPresent}
            </StatNumber>
          </Stat>
        </Box>
        <Box bg="white" p={4} borderRadius="lg" shadow="sm">
          <Stat>
            <StatLabel fontSize="xs" textTransform="uppercase" color="red.700">
              Total Absent
            </StatLabel>
            <StatNumber fontSize="xl" color="red.700">
              {totalAbsent}
            </StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        <Box bg="white" p={4} borderRadius="lg" shadow="sm" h="400px">
          <Heading size="md" mb={4} color="gray.600">
            Daily Attendance Overview
          </Heading>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reportData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#48BB78" name="Present" />
              <Bar dataKey="absent" fill="#F56565" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box bg="white" p={4} borderRadius="lg" shadow="sm" overflowX="auto">
          <Heading size="md" mb={4} color="gray.600">
            Detailed Records (Daily Present vs Absent)
          </Heading>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Date</Th>
                <Th isNumeric>Present</Th>
                <Th isNumeric>Absent</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reportData.length === 0 ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={4}>
                    No attendance data found for this period.
                  </Td>
                </Tr>
              ) : (
                reportData.map((day) => (
                  <Tr key={day._id}>
                    <Td>{day._id}</Td>
                    <Td isNumeric color="green.500" fontWeight="bold">
                      {day.present}
                    </Td>
                    <Td isNumeric color="red.500" fontWeight="bold">
                      {day.absent}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default AttendanceReport;
