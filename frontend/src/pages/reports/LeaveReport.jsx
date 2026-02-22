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
  SimpleGrid,
  Select,
  HStack,
  Button,
  Badge,
  Input
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import * as XLSX from "xlsx";

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
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leave report.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const years = useMemo(() => {
    const set = new Set();
    leaves.forEach((leave) => {
      if (leave.fromDate) {
        const year = new Date(leave.fromDate).getFullYear();
        set.add(year);
      }
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [leaves]);

  const getStatusColor = (status) => {
    if (status === "Approved") return "green";
    if (status === "Rejected") return "red";
    if (status === "Pending") return "yellow";
    return "gray";
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (statusFilter !== "All" && leave.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== "All" && leave.type !== typeFilter) {
        return false;
      }

      if (yearFilter !== "All" && leave.fromDate) {
        const year = new Date(leave.fromDate).getFullYear().toString();
        if (year !== yearFilter) {
          return false;
        }
      }

      const query = search.trim().toLowerCase();
      if (query) {
        const employeeName = (
          (leave.employee && leave.employee.user && leave.employee.user.name) ||
          (leave.employee && leave.employee.name) ||
          ""
        )
          .toString()
          .toLowerCase();

        const department =
          leave.employee && leave.employee.department
            ? leave.employee.department.toLowerCase()
            : "";
        const type = leave.type ? leave.type.toLowerCase() : "";
        const reason = leave.reason ? leave.reason.toLowerCase() : "";

        const matchesQuery =
          employeeName.includes(query) ||
          department.includes(query) ||
          type.includes(query) ||
          reason.includes(query);

        if (!matchesQuery) {
          return false;
        }
      }

      return true;
    });
  }, [leaves, statusFilter, typeFilter, yearFilter, search]);

  const summary = useMemo(() => {
    return {
      total: filteredLeaves.length,
      pending: filteredLeaves.filter((leave) => leave.status === "Pending")
        .length,
      approved: filteredLeaves.filter((leave) => leave.status === "Approved")
        .length,
      rejected: filteredLeaves.filter((leave) => leave.status === "Rejected")
        .length
    };
  }, [filteredLeaves]);

  const handleExport = () => {
    if (!filteredLeaves || filteredLeaves.length === 0) {
      return;
    }

    const rows = filteredLeaves.map((leave) => ({
      Employee:
        (leave.employee &&
          leave.employee.user &&
          leave.employee.user.name) ||
        (leave.employee && leave.employee.name) ||
        "",
      Department:
        leave.employee && leave.employee.department
          ? leave.employee.department
          : "",
      "Leave Type": leave.type,
      "Applied On": leave.createdAt
        ? new Date(leave.createdAt).toLocaleDateString()
        : "",
      "Start Date": leave.fromDate
        ? new Date(leave.fromDate).toLocaleDateString()
        : "",
      "End Date": leave.toDate
        ? new Date(leave.toDate).toLocaleDateString()
        : "",
      Days: leave.totalDays,
      Status: leave.status,
      Paid: leave.paid ? "Paid" : "Unpaid",
      Reason: leave.reason || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");
    XLSX.writeFile(workbook, "leave-report.xlsx");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="green.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6} gap={4} wrap="wrap">
        <Box>
          <Heading size="lg" color="gray.700">
            Manage Leave Report
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Approved and pending leave requests for all employees.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            isDisabled={!filteredLeaves || filteredLeaves.length === 0}
          >
            Export Excel
          </Button>
        </HStack>
      </Flex>

      {filteredLeaves.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <Text fontSize="sm" color="gray.500">
              Total Requests
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {summary.total}
            </Text>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <Text fontSize="sm" color="gray.500">
              Approved
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {summary.approved}
            </Text>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <Text fontSize="sm" color="gray.500">
              Pending
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.400">
              {summary.pending}
            </Text>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <Text fontSize="sm" color="gray.500">
              Rejected
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {summary.rejected}
            </Text>
          </Box>
        </SimpleGrid>
      )}

      <Box
        mb={4}
        bg="white"
        p={4}
        borderRadius="lg"
        shadow="sm"
      >
        <Flex
          gap={4}
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          flexWrap="wrap"
        >
          <Box minW={{ base: "100%", md: "160px" }}>
            <Text fontSize="sm" mb={1}>
              Status
            </Text>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              bg="white"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </Box>
          <Box minW={{ base: "100%", md: "160px" }}>
            <Text fontSize="sm" mb={1}>
              Leave Type
            </Text>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              bg="white"
            >
              <option value="All">All</option>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Annual">Annual</option>
            </Select>
          </Box>
          <Box minW={{ base: "100%", md: "140px" }}>
            <Text fontSize="sm" mb={1}>
              Year
            </Text>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              bg="white"
            >
              <option value="All">All</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>
          </Box>
          <Box flex="1" minW={{ base: "100%", md: "220px" }}>
            <Text fontSize="sm" mb={1}>
              Search
            </Text>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee, department, type or reason"
            />
          </Box>
        </Flex>
        <Text mt={2} fontSize="xs" color="gray.500">
          Showing {filteredLeaves.length} of {leaves.length} leave records
        </Text>
      </Box>

      <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Employee</Th>
              <Th>Leave Type</Th>
              <Th>Applied On</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Total Days</Th>
              <Th>Leave Reason</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaves.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" color="gray.500" py={8}>
                  No leave records found.
                </Td>
              </Tr>
            ) : filteredLeaves.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" color="gray.500" py={8}>
                  No leaves match the current filters.
                </Td>
              </Tr>
            ) : (
              filteredLeaves.map((leave) => (
                <Tr key={leave._id}>
                  <Td>
                    <Text fontWeight="medium">
                      {(leave.employee &&
                        leave.employee.user &&
                        leave.employee.user.name) ||
                        (leave.employee && leave.employee.name) ||
                        "Unknown"}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {leave.employee && leave.employee.department
                        ? leave.employee.department
                        : "N/A"}
                    </Text>
                  </Td>
                  <Td>{leave.type}</Td>
                  <Td>
                    {leave.createdAt
                      ? new Date(leave.createdAt).toLocaleDateString()
                      : "-"}
                  </Td>
                  <Td>
                    {leave.fromDate
                      ? new Date(leave.fromDate).toLocaleDateString()
                      : "-"}
                  </Td>
                  <Td>
                    {leave.toDate
                      ? new Date(leave.toDate).toLocaleDateString()
                      : "-"}
                  </Td>
                  <Td>{leave.totalDays}</Td>
                  <Td maxW="260px" isTruncated title={leave.reason}>
                    {leave.reason}
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(leave.status)}>
                      {leave.status}
                    </Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default LeaveReport;
