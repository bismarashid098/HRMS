import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Select,
  Grid, Button, Badge, Input, Icon, Avatar, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { FaFileExcel, FaSearch, FaCalendarCheck, FaClock, FaCalendarTimes, FaCalendarAlt } from "react-icons/fa";

const statusColors = { Approved: "green", Rejected: "red", Pending: "yellow" };
const typeColors = { Casual: "blue", Sick: "red", Annual: "green" };
const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

const StatCard = ({ label, value, color, bg, icon }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
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

  if (loading) return <Flex justify="center" align="center" h="400px" direction="column" gap={3}><Spinner size="xl" color="#065f46" thickness="3px" /><Text color="gray.400" fontSize="sm">Loading report...</Text></Flex>;
  if (error) return <Box bg="red.50" borderRadius="xl" p={6}><Text color="red.500">{error}</Text></Box>;

  return (
    <Box>
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Leave Report</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Approved and pending leave requests for all employees</Text>
          </Box>
          <Button leftIcon={<FaFileExcel />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} size="sm" borderRadius="xl"
            onClick={handleExport} isDisabled={!filteredLeaves.length}>Export Excel</Button>
        </Flex>
      </Box>

      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Total Requests" value={summary.total} color="#065f46" bg="#f0fdf4" icon={FaCalendarAlt} />
        <StatCard label="Approved" value={summary.approved} color="#1d4ed8" bg="#eff6ff" icon={FaCalendarCheck} />
        <StatCard label="Pending" value={summary.pending} color="#d97706" bg="#fffbeb" icon={FaClock} />
        <StatCard label="Rejected" value={summary.rejected} color="#dc2626" bg="#fef2f2" icon={FaCalendarTimes} />
      </Grid>

      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} wrap="wrap" align="center">
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="13px" /></InputLeftElement>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee, type or reason..."
              borderRadius="xl" bg="gray.50" fontSize="sm" focusBorderColor="#065f46" />
          </InputGroup>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="150px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} w="150px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
            <option value="All">All Types</option>
            <option value="Casual">Casual</option>
            <option value="Sick">Sick</option>
            <option value="Annual">Annual</option>
          </Select>
          <Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} w="110px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
            <option value="All">All Years</option>
            {years.map((y) => <option key={y} value={y.toString()}>{y}</option>)}
          </Select>
          {(search || statusFilter !== "All" || typeFilter !== "All" || yearFilter !== "All") && (
            <Button size="sm" variant="ghost" borderRadius="xl" onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); setYearFilter("All"); }}>Clear</Button>
          )}
        </Flex>
        <Text mt={2} fontSize="xs" color="gray.400">Showing {filteredLeaves.length} of {leaves.length} leave records</Text>
      </Box>

      <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="gray.50">
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Type</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Applied On</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Period</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Days</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Reason</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaves.length === 0 ? (
                <Tr><Td colSpan={7} textAlign="center" py={12} color="gray.400">No leave records found.</Td></Tr>
              ) : filteredLeaves.length === 0 ? (
                <Tr><Td colSpan={7} textAlign="center" py={8} color="gray.400">No leaves match the current filters.</Td></Tr>
              ) : filteredLeaves.map((leave) => {
                const name = (leave.employee?.user?.name) || (leave.employee?.name) || "Unknown";
                return (
                  <Tr key={leave._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td py={3}>
                      <Flex align="center" gap={2}>
                        <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                          <Text fontSize="xs" color="gray.400">{leave.employee?.department || "N/A"}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td py={3}><Badge colorScheme={typeColors[leave.type] || "gray"} borderRadius="full" px={2} fontSize="xs">{leave.type}</Badge></Td>
                    <Td py={3}><Text fontSize="sm" color="gray.600">{leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : "—"}</Text></Td>
                    <Td py={3}>
                      <Text fontSize="sm" color="gray.700">{leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : "—"}</Text>
                      <Text fontSize="xs" color="gray.400">to {leave.toDate ? new Date(leave.toDate).toLocaleDateString() : "—"}</Text>
                    </Td>
                    <Td py={3} isNumeric><Text fontSize="sm" fontWeight="bold" color="gray.700">{leave.totalDays}</Text></Td>
                    <Td py={3} maxW="180px"><Text fontSize="sm" color="gray.600" noOfLines={2} title={leave.reason}>{leave.reason}</Text></Td>
                    <Td py={3}>
                      <Badge colorScheme={statusColors[leave.status] || "gray"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{leave.status}</Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default LeaveReport;
