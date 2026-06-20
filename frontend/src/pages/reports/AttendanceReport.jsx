import { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Grid, Text, Button, useToast, Select, Input,
  Spinner, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack,
  Icon, InputGroup, InputLeftElement, Avatar
} from "@chakra-ui/react";
import {
  FaCalendarAlt, FaChartLine, FaDownload, FaSearch,
  FaUserCheck, FaUserTimes, FaPercent
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Line, ComposedChart
} from "recharts";
import api from "../../api/axios";
import * as XLSX from "xlsx";

/* ─── Theme ─── */
const T = {
  bg: "#0D1117", surface: "#161B22", surface2: "#1C2330",
  border: "#30363D", teal: "#00D4B4", blue: "#58A6FF",
  red: "#FF6B6B", amber: "#F0A500", green: "#3FB950",
  text: "#E6EDF3", muted: "#8B949E"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box bg={T.surface2} p={2} borderRadius="8px" border={`1px solid ${T.border}`}>
        <Text color={T.text} fontSize="sm">{label}</Text>
        {payload.map((p, idx) => (
          <Text key={idx} fontSize="xs" color={p.color}>
            {p.name}: {p.value}
          </Text>
        ))}
      </Box>
    );
  }
  return null;
};

const AttendanceReport = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState({ from: "", to: "" });
  const [data, setData] = useState({ summary: {}, daily: [] });
  const [search, setSearch] = useState("");

  // Set default range: last 7 days
  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 7);
    setRange({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10)
    });
  }, []);

  const fetchReport = useCallback(async () => {
    if (!range.from || !range.to) return;
    setLoading(true);
    try {
      const res = await api.get("/attendance/report", {
        params: { from: range.from, to: range.to, search: search || undefined }
      });
      setData(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load report", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [range, search, toast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = () => {
    if (!data.daily.length) return;
    const rows = data.daily.map(day => ({
      Date: day.date,
      Present: day.present,
      Absent: day.absent,
      "Attendance Rate": `${day.rate}%`
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `attendance_report_${range.from}_to_${range.to}.xlsx`);
  };

  const { summary } = data;
  const totalDays = data.daily.length;
  const totalPresent = summary.totalPresent || 0;
  const totalAbsent = summary.totalAbsent || 0;
  const overallRate = totalDays ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) : 0;

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xl" fontWeight="700" color={T.text}>Attendance Report</Text>
            <Text fontSize="sm" color={T.muted}>View attendance trends over any date range</Text>
          </Box>
          <Button
            leftIcon={<FaDownload />}
            variant="outline"
            borderColor={T.border}
            color={T.muted}
            _hover={{ borderColor: T.green, color: T.green }}
            onClick={handleExport}
            disabled={!data.daily.length}
            borderRadius="10px"
          >
            Export Excel
          </Button>
        </Flex>

        {/* Filters */}
        <Box bg={T.surface} borderRadius="14px" p={4} mb={5} border={`1px solid ${T.border}`}>
          <Flex gap={4} wrap="wrap" align="flex-end">
            <Box>
              <Text fontSize="xs" color={T.muted} mb={1}>From Date</Text>
              <Input
                type="date"
                value={range.from}
                onChange={(e) => setRange(prev => ({ ...prev, from: e.target.value }))}
                bg={T.bg} borderColor={T.border} color={T.text}
                borderRadius="10px"
              />
            </Box>
            <Box>
              <Text fontSize="xs" color={T.muted} mb={1}>To Date</Text>
              <Input
                type="date"
                value={range.to}
                onChange={(e) => setRange(prev => ({ ...prev, to: e.target.value }))}
                bg={T.bg} borderColor={T.border} color={T.text}
                borderRadius="10px"
              />
            </Box>
            <Box flex="1">
              <Text fontSize="xs" color={T.muted} mb={1}>Search Employee</Text>
              <InputGroup>
                <InputLeftElement><Icon as={FaSearch} color={T.muted} /></InputLeftElement>
                <Input
                  placeholder="Name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  bg={T.bg} borderColor={T.border} color={T.text}
                  borderRadius="10px"
                />
              </InputGroup>
            </Box>
            <Button
              bg={T.teal} color={T.bg} _hover={{ bg: T.tealDim }}
              onClick={fetchReport}
              isLoading={loading}
              borderRadius="10px"
            >
              Generate
            </Button>
          </Flex>
        </Box>

        {/* Stat Cards */}
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }} gap={4} mb={6}>
          <StatCard label="Days Loaded" value={totalDays} sub={`${range.from} → ${range.to}`} icon={FaCalendarAlt} color={T.teal} />
          <StatCard label="Total Present" value={totalPresent} sub="cumulative entries" icon={FaUserCheck} color={T.green} />
          <StatCard label="Total Absent" value={totalAbsent} sub="cumulative entries" icon={FaUserTimes} color={T.red} />
          <StatCard label="Attendance Rate" value={`${overallRate}%`} sub={`avg ${(totalPresent/totalDays||0).toFixed(1)} present/day`} icon={FaPercent} color={T.amber} />
        </Grid>

        {/* Charts */}
        {loading ? (
          <Flex justify="center" py={10}><Spinner size="xl" color={T.teal} /></Flex>
        ) : data.daily.length === 0 ? (
          <Box bg={T.surface} borderRadius="14px" p={12} textAlign="center">
            <Text color={T.muted}>No data for selected range</Text>
          </Box>
        ) : (
          <>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
              {/* Bar Chart */}
              <Box bg={T.surface} borderRadius="14px" p={4} border={`1px solid ${T.border}`}>
                <Text fontSize="sm" fontWeight="600" color={T.text} mb={3}>Daily Attendance Overview</Text>
                <Box h="280px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.daily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={T.border} vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} />
                      <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: T.muted }} />
                      <Bar dataKey="present" name="Present" fill={T.green} radius={[4,4,0,0]} />
                      <Bar dataKey="absent" name="Absent" fill={T.red} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Line + Bar Combo */}
              <Box bg={T.surface} borderRadius="14px" p={4} border={`1px solid ${T.border}`}>
                <Text fontSize="sm" fontWeight="600" color={T.text} mb={3}>Present vs Absent Trend</Text>
                <Box h="280px">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.daily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={T.border} vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} />
                      <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill={T.green} barSize={30} />
                      <Line type="monotone" dataKey="absent" name="Absent" stroke={T.red} strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>

            {/* Detailed Table */}
            <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} overflow="hidden">
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr bg={T.surface2}>
                      <Th color={T.muted} borderColor={T.border}>Date</Th>
                      <Th color={T.muted} borderColor={T.border} isNumeric>Present</Th>
                      <Th color={T.muted} borderColor={T.border} isNumeric>Absent</Th>
                      <Th color={T.muted} borderColor={T.border} isNumeric>Rate</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.daily.map((day, idx) => (
                      <Tr key={idx} _hover={{ bg: T.surface2 }}>
                        <Td borderColor={T.border} color={T.text}>{day.date}</Td>
                        <Td borderColor={T.border} isNumeric>
                          <Badge bg={`${T.green}20`} color={T.green} px={2} borderRadius="full">{day.present}</Badge>
                        </Td>
                        <Td borderColor={T.border} isNumeric>
                          <Badge bg={`${T.red}20`} color={T.red} px={2} borderRadius="full">{day.absent}</Badge>
                        </Td>
                        <Td borderColor={T.border} isNumeric>
                          <Text fontSize="sm" fontWeight="500" color={day.rate >= 80 ? T.green : T.amber}>
                            {day.rate}%
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

// Stat Card Helper Component
const StatCard = ({ label, value, sub, icon, color }) => (
  <Box bg={T.surface} borderRadius="14px" p={4} border={`1px solid ${T.border}`} position="relative" overflow="hidden"
    _hover={{ borderColor: color, transform: "translateY(-2px)" }} transition="0.2s">
    <Box position="absolute" top="0" left="0" right="0" h="2px" bg={`linear-gradient(90deg, ${color}, transparent)`} />
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color={T.muted} mb={2}>{label}</Text>
        <Text fontSize="28px" fontWeight="900" color={T.text} lineHeight="1">{value}</Text>
        <Text fontSize="xs" color={T.muted} mt={1}>{sub}</Text>
      </Box>
      <Flex w="36px" h="36px" borderRadius="10px" bg={`${color}18`} border={`1px solid ${color}30`} align="center" justify="center">
        <Icon as={icon} fontSize="16px" color={color} />
      </Flex>
    </Flex>
  </Box>
);

export default AttendanceReport;