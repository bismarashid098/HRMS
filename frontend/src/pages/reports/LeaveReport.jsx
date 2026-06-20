import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Select,
  Grid, Button, Badge, Input, Icon, Avatar, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { FaFileExcel, FaSearch, FaCalendarCheck, FaClock, FaCalendarTimes, FaCalendarAlt } from "react-icons/fa";

/* ─── Dark Theme (matches Dashboard) ─── */
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

const statusColors = { Approved: T.green, Rejected: T.red, Pending: T.amber };
const typeColors = { Casual: T.blue, Sick: T.red, Annual: T.green };
const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

/* ── Stat Card Dark ── */
const StatCard = ({ label, value, color, icon }) => (
  <Box bg={T.surface} borderRadius="14px" p={4} border={`1px solid ${T.border}`}
    position="relative" overflow="hidden" _hover={{ borderColor: color, transform: "translateY(-2px)" }} transition="all 0.2s">
    <Box position="absolute" top="0" left="0" right="0" h="2px" bg={`linear-gradient(90deg, ${color}, transparent)`} />
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color={T.muted} mb={2}>{label}</Text>
        <Text fontSize="28px" fontWeight="900" color={T.text} lineHeight="1">{value}</Text>
      </Box>
      <Flex w="36px" h="36px" borderRadius="10px" bg={`${color}18`} border={`1px solid ${color}30`} align="center" justify="center">
        <Icon as={icon} fontSize="16px" color={color} />
      </Flex>
    </Flex>
  </Box>
);

const LeaveReport = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await api.get("/leaves");
        setLeaves(data);
      } catch (err) { setError(err.response?.data?.message || "Failed to load leave report."); }
      finally { setLoading(false); }
    };
    fetchLeaves();
  }, []);

  const years = useMemo(() => {
    const set = new Set();
    leaves.forEach((l) => { if (l.fromDate) set.add(new Date(l.fromDate).getFullYear()); });
    return Array.from(set).sort((a, b) => b - a);
  }, [leaves]);

  const filteredLeaves = useMemo(() =>
    leaves.filter((leave) => {
      if (statusFilter !== "All" && leave.status !== statusFilter) return false;
      if (typeFilter !== "All" && leave.type !== typeFilter) return false;
      if (yearFilter !== "All" && leave.fromDate && new Date(leave.fromDate).getFullYear().toString() !== yearFilter) return false;
      const q = search.trim().toLowerCase();
      if (q) {
        const name = ((leave.employee?.user?.name) || (leave.employee?.name) || "").toLowerCase();
        const dept = (leave.employee?.department || "").toLowerCase();
        if (!name.includes(q) && !dept.includes(q) && !(leave.type || "").toLowerCase().includes(q) && !(leave.reason || "").toLowerCase().includes(q)) return false;
      }
      return true;
    }), [leaves, statusFilter, typeFilter, yearFilter, search]);

  const summary = useMemo(() => ({
    total: filteredLeaves.length,
    pending: filteredLeaves.filter((l) => l.status === "Pending").length,
    approved: filteredLeaves.filter((l) => l.status === "Approved").length,
    rejected: filteredLeaves.filter((l) => l.status === "Rejected").length,
  }), [filteredLeaves]);

  const handleExport = () => {
    if (!filteredLeaves.length) return;
    const rows = filteredLeaves.map((l) => ({
      Employee: (l.employee?.user?.name) || (l.employee?.name) || "",
      Department: l.employee?.department || "",
      "Leave Type": l.type,
      "Applied On": l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "",
      "Start Date": l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "",
      "End Date": l.toDate ? new Date(l.toDate).toLocaleDateString() : "",
      Days: l.totalDays, Status: l.status, Paid: l.paid ? "Paid" : "Unpaid", Reason: l.reason || ""
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Report");
    XLSX.writeFile(wb, "leave-report.xlsx");
  };

  if (loading) return <Flex justify="center" align="center" h="400px" direction="column" gap={3}><Spinner size="xl" color={T.teal} thickness="3px" /><Text color={T.muted} fontSize="sm">Loading report...</Text></Flex>;
  if (error) return <Box bg="rgba(255,107,107,0.1)" borderRadius="14px" p={6} border={`1px solid ${T.red}`}><Text color={T.red}>{error}</Text></Box>;

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xl" fontWeight="700" color={T.text}>Leave Report</Text>
            <Text fontSize="sm" color={T.muted}>Approved and pending leave requests for all employees</Text>
          </Box>
          <Button leftIcon={<FaFileExcel />} variant="outline" borderColor={T.border} color={T.muted}
            _hover={{ borderColor: T.green, color: T.green }} size="sm" borderRadius="10px"
            onClick={handleExport} isDisabled={!filteredLeaves.length}>Export Excel</Button>
        </Flex>

        {/* Stats */}
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
          <StatCard label="Total Requests" value={summary.total} color={T.teal} icon={FaCalendarAlt} />
          <StatCard label="Approved" value={summary.approved} color={T.green} icon={FaCalendarCheck} />
          <StatCard label="Pending" value={summary.pending} color={T.amber} icon={FaClock} />
          <StatCard label="Rejected" value={summary.rejected} color={T.red} icon={FaCalendarTimes} />
        </Grid>

        {/* Filters */}
        <Box bg={T.surface} borderRadius="14px" p={4} mb={4} border={`1px solid ${T.border}`}>
          <Flex gap={3} wrap="wrap" align="center">
            <InputGroup flex="1" minW="200px">
              <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color={T.muted} fontSize="13px" /></InputLeftElement>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee, type or reason..."
                borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm" />
            </InputGroup>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="150px" borderRadius="10px"
              bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm">
              <option value="All">All Status</option><option value="Pending">Pending</option>
              <option value="Approved">Approved</option><option value="Rejected">Rejected</option>
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} w="150px" borderRadius="10px"
              bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm">
              <option value="All">All Types</option><option value="Casual">Casual</option>
              <option value="Sick">Sick</option><option value="Annual">Annual</option>
            </Select>
            <Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} w="110px" borderRadius="10px"
              bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm">
              <option value="All">All Years</option>
              {years.map((y) => <option key={y} value={y.toString()}>{y}</option>)}
            </Select>
            {(search || statusFilter !== "All" || typeFilter !== "All" || yearFilter !== "All") && (
              <Button size="sm" variant="ghost" color={T.muted} _hover={{ color: T.text, bg: T.surface2 }} borderRadius="10px"
                onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); setYearFilter("All"); }}>Clear</Button>
            )}
          </Flex>
          <Text mt={2} fontSize="xs" color={T.muted}>Showing {filteredLeaves.length} of {leaves.length} leave records</Text>
        </Box>

        {/* Table */}
        <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg={T.surface2}>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Employee</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Type</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Applied On</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Period</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase" isNumeric>Days</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Reason</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaves.length === 0 ? (
                  <Tr><Td colSpan={7} textAlign="center" py={12}><Text color={T.muted}>No leave records found.</Text></Td></Tr>
                ) : filteredLeaves.length === 0 ? (
                  <Tr><Td colSpan={7} textAlign="center" py={8}><Text color={T.muted}>No leaves match the current filters.</Text></Td></Tr>
                ) : filteredLeaves.map((leave) => {
                  const name = (leave.employee?.user?.name) || (leave.employee?.name) || "Unknown";
                  return (
                    <Tr key={leave._id} _hover={{ bg: T.surface2 }} transition="background 0.15s">
                      <Td borderColor={T.border} py={3}>
                        <Flex align="center" gap={2}>
                          <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color={T.text}>{name}</Text>
                            <Text fontSize="xs" color={T.muted}>{leave.employee?.department || "N/A"}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td borderColor={T.border} py={3}>
                        <Badge bg={`${typeColors[leave.type] || T.muted}20`} color={typeColors[leave.type] || T.muted} borderRadius="full" px={2} fontSize="xs">{leave.type}</Badge>
                      </Td>
                      <Td borderColor={T.border} py={3}>
                        <Text fontSize="sm" color={T.text}>{leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : "—"}</Text>
                      </Td>
                      <Td borderColor={T.border} py={3}>
                        <Text fontSize="sm" color={T.text}>{leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : "—"}</Text>
                        <Text fontSize="xs" color={T.muted}>to {leave.toDate ? new Date(leave.toDate).toLocaleDateString() : "—"}</Text>
                      </Td>
                      <Td borderColor={T.border} py={3} isNumeric>
                        <Text fontSize="sm" fontWeight="bold" color={T.text}>{leave.totalDays}</Text>
                      </Td>
                      <Td borderColor={T.border} py={3} maxW="180px">
                        <Text fontSize="sm" color={T.muted} noOfLines={2} title={leave.reason}>{leave.reason}</Text>
                      </Td>
                      <Td borderColor={T.border} py={3}>
                        <Badge bg={`${statusColors[leave.status] || T.muted}20`} color={statusColors[leave.status] || T.muted} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{leave.status}</Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LeaveReport;