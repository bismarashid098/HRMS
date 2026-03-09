import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Select, Grid,
  Icon, Badge, Avatar, Tabs, TabList, TabPanels, Tab, TabPanel, Button, InputGroup,
  InputLeftElement, Input
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  FaMoneyBillWave, FaChartLine, FaCalendarAlt, FaTimesCircle,
  FaFileExcel, FaSearch, FaUsers
} from "react-icons/fa";
import * as XLSX from "xlsx";

const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

const StatCard = ({ label, value, color, bg, icon, sub }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
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
      <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>{label}</Text>
      <Text fontSize="sm" color="#065f46" fontWeight="bold">Rs {payload[0]?.value?.toLocaleString()}</Text>
    </Box>
  );
};

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthFull = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const fmtMoney = (n) => n >= 1000000 ? `Rs ${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `Rs ${(n / 1000).toFixed(0)}K` : `Rs ${n}`;

const PayrollReport = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  // Ledger tab state
  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerMonth, setLedgerMonth] = useState(new Date().getMonth() + 1);
  const [ledgerYear, setLedgerYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/dashboard/payroll-stats?year=${year}`);
        setStats(data);
        setError(null);
      } catch { setError("Failed to load payroll stats."); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [year]);

  const fetchLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const { data } = await api.get(`/payroll?month=${ledgerMonth}&year=${ledgerYear}`);
      setLedger(data);
    } catch { setLedger([]); }
    finally { setLedgerLoading(false); }
  }, [ledgerMonth, ledgerYear]);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  const filteredLedger = ledger.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = p.employee?.user?.name || "";
    const dept = p.employee?.department || "";
    return name.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
  });

  const totalPaid = stats.reduce((sum, item) => sum + item.totalPaid, 0);
  const monthsWithPayroll = stats.length;
  const maxMonth = stats.reduce((max, item) => (item.totalPaid > max ? item.totalPaid : max), 0);
  const averageMonthly = monthsWithPayroll > 0 ? Math.round(totalPaid / monthsWithPayroll) : 0;
  const chartData = stats.map((item) => ({ name: monthNames[item._id], amount: item.totalPaid }));

  const ledgerTotal = filteredLedger.reduce((s, p) => s + (p.netSalary || 0), 0);
  const ledgerDeductions = filteredLedger.reduce((s, p) => s + (p.deductions || 0), 0);
  const ledgerBasic = filteredLedger.reduce((s, p) => s + (p.basicSalary || 0), 0);

  const exportLedger = () => {
    const rows = filteredLedger.map((p) => ({
      Employee: p.employee?.user?.name || "Unknown",
      Department: p.employee?.department || "N/A",
      Designation: p.employee?.designation || "N/A",
      "Basic Salary": p.basicSalary || 0,
      Allowance: p.allowance || 0,
      Deductions: p.deductions || 0,
      "Net Salary": p.netSalary || 0,
      Status: p.status || "Generated"
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Ledger");
    XLSX.writeFile(wb, `Payroll-Ledger-${monthFull[ledgerMonth]}-${ledgerYear}.xlsx`);
  };

  if (loading) return (
    <Flex justify="center" align="center" h="400px" direction="column" gap={3}>
      <Spinner size="xl" color="#065f46" thickness="3px" />
      <Text color="gray.400" fontSize="sm">Loading payroll stats...</Text>
    </Flex>
  );
  if (error) return <Box bg="red.50" borderRadius="xl" p={6}><Text color="red.500">{error}</Text></Box>;

  return (
    <Box>
      {/* Header */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Payroll Report</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Salary payout trends and full employee ledger</Text>
          </Box>
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))} w="110px" borderRadius="xl" fontSize="sm" bg="whiteAlpha.200" color="white" border="1px solid" borderColor="whiteAlpha.300" sx={{ option: { bg: "#021024" } }}>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </Select>
        </Flex>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Total Payroll Paid" value={fmtMoney(totalPaid)} color="#065f46" bg="#f0fdf4" icon={FaMoneyBillWave} sub={`across ${monthsWithPayroll} months`} />
        <StatCard label="Average Monthly" value={fmtMoney(averageMonthly)} color="#d97706" bg="#fffbeb" icon={FaChartLine} sub="based on recorded months" />
        <StatCard label="Highest Monthly" value={fmtMoney(maxMonth)} color="#1d4ed8" bg="#eff6ff" icon={FaCalendarAlt} sub={`peak payout in ${year}`} />
        <StatCard label="Months Without Payroll" value={12 - monthsWithPayroll} color="#dc2626" bg="#fef2f2" icon={FaTimesCircle} sub="no records" />
      </Grid>

      {/* Tabs */}
      <Tabs variant="unstyled">
        <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" mb={5} px={2} py={2}>
          <TabList gap={1}>
            {["Monthly Overview", "Employee Ledger"].map((tab) => (
              <Tab
                key={tab}
                borderRadius="xl"
                fontSize="sm"
                fontWeight="medium"
                color="gray.500"
                px={4}
                py={2}
                _selected={{ bg: "#065f46", color: "white", fontWeight: "semibold" }}
              >
                {tab}
              </Tab>
            ))}
          </TabList>
        </Box>

        <TabPanels>
          {/* Monthly Overview Tab */}
          <TabPanel p={0}>
            <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={5}>
              <Box bg="white" borderRadius="2xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100">
                <Text fontWeight="bold" fontSize="md" color="gray.800" mb={1}>Monthly Payout Trend</Text>
                <Text fontSize="xs" color="gray.400" mb={4}>Total salary disbursed per month in {year}</Text>
                <Box h="320px">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#065f46" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#065f46" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#065f46" strokeWidth={2} fill="url(#payrollGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                  <Text fontWeight="bold" fontSize="md" color="gray.800">Monthly Breakdown</Text>
                  <Text fontSize="xs" color="gray.400">Payroll total per month in {year}</Text>
                </Box>
                <Box overflowY="auto" maxH="360px">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Month</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Total Paid</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Employees</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {stats.length === 0 ? (
                        <Tr><Td colSpan={3} textAlign="center" py={8} color="gray.400">No payroll data for {year}.</Td></Tr>
                      ) : stats.map((item) => (
                        <Tr key={item._id} _hover={{ bg: "gray.50" }}>
                          <Td py={3}>
                            <Flex align="center" gap={2}>
                              <Box w={2} h={2} borderRadius="full" bg="#065f46" />
                              <Text fontSize="sm" fontWeight="medium" color="gray.700">{monthFull[item._id]}</Text>
                            </Flex>
                          </Td>
                          <Td py={3} isNumeric>
                            <Text fontSize="sm" fontWeight="bold" color="#065f46">Rs {item.totalPaid.toLocaleString()}</Text>
                          </Td>
                          <Td py={3} isNumeric>
                            <Badge colorScheme="green" borderRadius="full" px={2} fontSize="xs">{item.count || "—"}</Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </Grid>
          </TabPanel>

          {/* Employee Ledger Tab */}
          <TabPanel p={0}>
            {/* Ledger Filters */}
            <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
              <Flex gap={3} align="flex-end" wrap="wrap">
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Month</Text>
                  <Select value={ledgerMonth} onChange={(e) => setLedgerMonth(Number(e.target.value))} w="160px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
                    {monthFull.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Year</Text>
                  <Select value={ledgerYear} onChange={(e) => setLedgerYear(Number(e.target.value))} w="110px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </Select>
                </Box>
                <Box flex="1" minW="200px">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Search</Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="12px" /></InputLeftElement>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or department..." borderRadius="xl" fontSize="sm" focusBorderColor="#065f46" />
                  </InputGroup>
                </Box>
                <Button leftIcon={<FaFileExcel />} bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl" onClick={exportLedger} isDisabled={filteredLedger.length === 0}>Export</Button>
              </Flex>
            </Box>

            {/* Ledger Summary */}
            {filteredLedger.length > 0 && (
              <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={4} mb={4}>
                <StatCard label="Total Basic" value={fmtMoney(ledgerBasic)} color="#1d4ed8" bg="#eff6ff" icon={FaUsers} sub={`${filteredLedger.length} employees`} />
                <StatCard label="Total Deductions" value={fmtMoney(ledgerDeductions)} color="#dc2626" bg="#fef2f2" icon={FaTimesCircle} sub="tax + advance" />
                <StatCard label="Total Net Salary" value={fmtMoney(ledgerTotal)} color="#065f46" bg="#f0fdf4" icon={FaMoneyBillWave} sub={`${monthFull[ledgerMonth]} ${ledgerYear}`} />
              </Grid>
            )}

            {/* Ledger Table */}
            {ledgerLoading ? (
              <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
                <Spinner size="xl" color="#065f46" thickness="3px" />
                <Text color="gray.400" fontSize="sm">Loading payroll ledger...</Text>
              </Flex>
            ) : filteredLedger.length === 0 ? (
              <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm" border="1px dashed" borderColor="gray.200">
                <Icon as={FaMoneyBillWave} fontSize="48px" color="gray.200" mb={4} />
                <Text color="gray.500" fontWeight="medium">No payroll records for {monthFull[ledgerMonth]} {ledgerYear}.</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>Generate payroll from the Payroll Processing page first.</Text>
              </Box>
            ) : (
              <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Basic</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Allowance</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Deductions</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Net Salary</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredLedger.map((p) => {
                        const name = p.employee?.user?.name || "Unknown";
                        return (
                          <Tr key={p._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                            <Td py={3}>
                              <Flex align="center" gap={3}>
                                <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                                <Box>
                                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                                  <Text fontSize="xs" color="gray.400">{p.employee?.department} · {p.employee?.designation}</Text>
                                </Box>
                              </Flex>
                            </Td>
                            <Td py={3} isNumeric>
                              <Text fontSize="sm" color="gray.700">Rs {(p.basicSalary || 0).toLocaleString()}</Text>
                            </Td>
                            <Td py={3} isNumeric>
                              <Text fontSize="sm" color="gray.700">Rs {(p.allowance || 0).toLocaleString()}</Text>
                            </Td>
                            <Td py={3} isNumeric>
                              <Text fontSize="sm" color="#dc2626" fontWeight="semibold">
                                {p.deductions > 0 ? `- Rs ${(p.deductions || 0).toLocaleString()}` : "—"}
                              </Text>
                            </Td>
                            <Td py={3} isNumeric>
                              <Text fontSize="sm" fontWeight="bold" color="#065f46">Rs {(p.netSalary || 0).toLocaleString()}</Text>
                            </Td>
                            <Td py={3}>
                              <Badge
                                colorScheme={p.status === "Paid" ? "green" : p.status === "Generated" ? "blue" : "gray"}
                                borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold"
                              >
                                {p.status || "Generated"}
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
                <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100" justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.400">
                    <Text as="span" fontWeight="semibold" color="gray.600">{filteredLedger.length}</Text> employees
                  </Text>
                  <Flex gap={6}>
                    <Text fontSize="xs" color="gray.500">Deductions: <Text as="span" fontWeight="bold" color="#dc2626">Rs {ledgerDeductions.toLocaleString()}</Text></Text>
                    <Text fontSize="xs" color="gray.500">Net Total: <Text as="span" fontWeight="bold" color="#065f46">Rs {ledgerTotal.toLocaleString()}</Text></Text>
                  </Flex>
                </Flex>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PayrollReport;
