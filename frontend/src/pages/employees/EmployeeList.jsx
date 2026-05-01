import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import {
  Box, Button, Flex, Grid, GridItem, Table, Thead, Tbody, Tr, Th, Td,
  Badge, HStack, Spinner, Text, useToast, IconButton, Tooltip, Input,
  Select, Avatar, InputGroup, InputLeftElement, Icon,
} from "@chakra-ui/react";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
  FaFileExcel, FaUsers, FaUserCheck, FaUserTimes, FaUserClock,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const StatCard = ({ label, value, icon, color, bg }) => (
  <Box
    bg="white" borderRadius="2xl" p={4}
    shadow="sm" border="1px solid" borderColor="gray.100"
    borderLeft="4px solid" borderLeftColor={color}
  >
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

const getInitials = (name = "") =>
  name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const avatarColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626", "#0891b2"];
const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "green";
    case "Resigned": return "orange";
    case "Terminated": return "red";
    default: return "gray";
  }
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const isManager = user?.role === "Manager";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await api.get("/employees");
      setEmployees(data);
      setError(null);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load employees.";
      setError(message);
      toast({ title: "Error", description: message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
      toast({ title: "Deleted", description: "Employee removed successfully.", status: "success", duration: 3000, isClosable: true });
    } catch {
      toast({ title: "Error", description: "Failed to delete employee.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const departmentOptions = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filteredEmployees = employees.filter((e) => {
    const q = search.trim().toLowerCase();
    const name = (e.name ?? e.user?.name ?? "").toLowerCase();
    const email = (e.email ?? e.user?.email ?? "").toLowerCase();
    const matchSearch = !q || name.includes(q) || email.includes(q) ||
      (e.department && e.department.toLowerCase().includes(q)) ||
      (e.designation && e.designation.toLowerCase().includes(q));
    const matchStatus = statusFilter === "All" || e.employmentStatus === statusFilter;
    const matchDept = departmentFilter === "All" || e.department === departmentFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const get = (e) => {
      if (sortField === "name") return e.name || e.user?.name || "";
      if (sortField === "email") return e.email || e.user?.email || "";
      if (sortField === "department") return e.department || "";
      if (sortField === "status") return e.employmentStatus || "";
      if (sortField === "role") return e.designation || "";
      return "";
    };
    const av = get(a).toLowerCase(), bv = get(b).toLowerCase();
    if (av < bv) return sortDirection === "asc" ? -1 : 1;
    if (av > bv) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const pageSizeNum = pageSize === "All" ? (sortedEmployees.length || 1) : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSizeNum));
  const safePage = currentPage > totalPages ? totalPages : currentPage;
  const startIdx = (safePage - 1) * pageSizeNum;
  const pageEmployees = sortedEmployees.slice(startIdx, startIdx + pageSizeNum);

  const handleSort = (field) => {
    setSortField((prev) => {
      if (prev === field) { setSortDirection((d) => d === "asc" ? "desc" : "asc"); return prev; }
      setSortDirection("asc");
      return field;
    });
  };

  const sortLabel = (label, field) => {
    const arrow = sortField !== field ? "" : sortDirection === "asc" ? " ↑" : " ↓";
    return `${label}${arrow}`;
  };

  const handleExport = () => {
    if (!sortedEmployees.length) {
      toast({ title: "No data to export", status: "info", duration: 3000, isClosable: true });
      return;
    }
    const rows = sortedEmployees.map((e) => ({
      "Employee ID": e.employeeId,
      Name: e.name || e.user?.name || "",
      Email: e.email || e.user?.email || "",
      Department: e.department || "",
      Designation: e.designation || "",
      Status: e.employmentStatus || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employees.xlsx");
  };

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, departmentFilter, employees.length]);

  const total = employees.length;
  const active = employees.filter((e) => e.employmentStatus === "Active").length;
  const resigned = employees.filter((e) => e.employmentStatus === "Resigned").length;
  const terminated = employees.filter((e) => e.employmentStatus === "Terminated").length;

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">Employee Directory Some Edit in Time By Bisma</Text>
          <Text fontSize="sm" color="gray.400">Manage and track all employees in your organization</Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FaFileExcel />}
            variant="outline"
            colorScheme="green"
            borderRadius="xl"
            size="sm"
            onClick={handleExport}
            isDisabled={!employees.length}
          >
            Export Excel
          </Button>
          {!isManager && (
            <Button
              leftIcon={<FaPlus />}
              bg="#065f46"
              color="white"
              _hover={{ bg: "#047857" }}
              borderRadius="xl"
              size="sm"
              fontWeight="bold"
              onClick={() => navigate("/dashboard/employees/create")}
            >
              Add Employee
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Stat Cards */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Total Staff" value={total} icon={FaUsers} color="#065f46" bg="#f0fdf4" />
        <StatCard label="Active" value={active} icon={FaUserCheck} color="#1d4ed8" bg="#eff6ff" />
        <StatCard label="Resigned" value={resigned} icon={FaUserClock} color="#d97706" bg="#fffbeb" />
        <StatCard label="Terminated" value={terminated} icon={FaUserTimes} color="#dc2626" bg="#fef2f2" />
      </Grid>

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} wrap="wrap" align="center">
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.300" fontSize="13px" />
            </InputLeftElement>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department or role..."
              borderRadius="xl"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _focus={{ bg: "white", borderColor: "#065f46" }}
              fontSize="sm"
            />
          </InputGroup>

          <InputGroup w={{ base: "full", md: "180px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaFilter} color="gray.300" fontSize="12px" />
            </InputLeftElement>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              borderRadius="xl"
              bg="gray.50"
              fontSize="sm"
              pl={8}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </Select>
          </InputGroup>

          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            w={{ base: "full", md: "200px" }}
            borderRadius="xl"
            bg="gray.50"
            fontSize="sm"
          >
            <option value="All">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>

          {(search || statusFilter !== "All" || departmentFilter !== "All") && (
            <Button
              size="sm" variant="ghost" colorScheme="gray" borderRadius="xl"
              onClick={() => { setSearch(""); setStatusFilter("All"); setDepartmentFilter("All"); }}
            >
              Clear
            </Button>
          )}
        </Flex>
      </Box>

      {/* Table */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#065f46" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading employees...</Text>
        </Flex>
      ) : error ? (
        <Box bg="red.50" borderRadius="xl" p={6} textAlign="center">
          <Text color="red.500">{error}</Text>
        </Box>
      ) : employees.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm">
          <Icon as={FaUsers} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No employees added yet.</Text>
          {!isManager && (
            <Button mt={4} size="sm" bg="#065f46" color="white" borderRadius="xl" leftIcon={<FaPlus />}
              onClick={() => navigate("/dashboard/employees/create")}>
              Add First Employee
            </Button>
          )}
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={4} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                    Employee
                  </Th>
                  <Th
                    py={4} fontSize="xs" color="gray.500" fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="wider"
                    cursor="pointer" onClick={() => handleSort("role")}
                    _hover={{ color: "gray.700" }}
                  >
                    {sortLabel("Designation", "role")}
                  </Th>
                  <Th
                    py={4} fontSize="xs" color="gray.500" fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="wider"
                    cursor="pointer" onClick={() => handleSort("department")}
                    _hover={{ color: "gray.700" }}
                  >
                    {sortLabel("Department", "department")}
                  </Th>
                  <Th
                    py={4} fontSize="xs" color="gray.500" fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="wider"
                    cursor="pointer" onClick={() => handleSort("status")}
                    _hover={{ color: "gray.700" }}
                  >
                    {sortLabel("Status", "status")}
                  </Th>
                  <Th py={4} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {pageEmployees.map((emp, idx) => {
                  const name = emp.name || emp.user?.name || "N/A";
                  const email = emp.email || emp.user?.email || "";
                  const initials = getInitials(name);
                  const avatarBg = getAvatarColor(name);
                  return (
                    <Tr
                      key={emp._id}
                      _hover={{ bg: "gray.50" }}
                      transition="background 0.15s"
                      borderBottom="1px solid"
                      borderColor="gray.50"
                    >
                      <Td py={3}>
                        <Flex align="center" gap={3}>
                          <Avatar
                            size="sm"
                            name={name}
                            bg={avatarBg}
                            color="white"
                            fontSize="xs"
                            fontWeight="bold"
                          />
                          <Box>
                            <Button
                              variant="link"
                              color="gray.800"
                              fontWeight="semibold"
                              fontSize="sm"
                              _hover={{ color: "#065f46" }}
                              onClick={() => navigate(`/dashboard/attendance?employeeId=${emp._id}`)}
                              height="auto"
                              lineHeight="1.3"
                            >
                              {name}
                            </Button>
                            <Text fontSize="xs" color="gray.400" lineHeight="1.3">{email || "—"}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="sm" color="gray.700">{emp.designation || "—"}</Text>
                      </Td>
                      <Td py={3}>
                        {emp.department ? (
                          <Badge
                            bg="gray.100" color="gray.600"
                            borderRadius="full" px={2} py={0.5} fontSize="xs"
                          >
                            {emp.department}
                          </Badge>
                        ) : <Text fontSize="sm" color="gray.400">—</Text>}
                      </Td>
                      <Td py={3}>
                        <Badge
                          colorScheme={getStatusColor(emp.employmentStatus)}
                          borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold"
                        >
                          {emp.employmentStatus || "—"}
                        </Badge>
                      </Td>
                      <Td py={3}>
                        <HStack spacing={1}>
                          <Tooltip label="View Profile" hasArrow>
                            <IconButton
                              icon={<FaEye />} size="sm" variant="ghost" colorScheme="blue"
                              borderRadius="lg"
                              onClick={() => navigate(`/dashboard/employees/${emp._id}`)}
                              aria-label="View"
                            />
                          </Tooltip>
                          {!isManager && (
                            <>
                              <Tooltip label="Edit Employee" hasArrow>
                                <IconButton
                                  icon={<FaEdit />} size="sm" variant="ghost" colorScheme="orange"
                                  borderRadius="lg"
                                  onClick={() => navigate(`/dashboard/employees/edit/${emp._id}`)}
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Delete Employee" hasArrow>
                                <IconButton
                                  icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red"
                                  borderRadius="lg"
                                  onClick={() => handleDelete(emp._id)}
                                  aria-label="Delete"
                                />
                              </Tooltip>
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex
            justify="space-between" align="center"
            px={5} py={3}
            borderTop="1px solid" borderColor="gray.100"
            flexWrap="wrap" gap={3}
          >
            <HStack spacing={2}>
              <Text fontSize="xs" color="gray.400">Rows per page</Text>
              <Select
                size="xs" w="70px" borderRadius="lg"
                value={pageSize === "All" ? "All" : pageSize}
                onChange={(e) => { setPageSize(e.target.value === "All" ? "All" : Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="All">All</option>
              </Select>
            </HStack>

            <Text fontSize="xs" color="gray.400">
              Showing <Text as="span" fontWeight="semibold" color="gray.600">
                {startIdx + 1}–{Math.min(startIdx + pageSizeNum, sortedEmployees.length)}
              </Text> of <Text as="span" fontWeight="semibold" color="gray.600">{sortedEmployees.length}</Text> employees
            </Text>

            <HStack spacing={1}>
              <Button
                size="xs" variant="outline" borderRadius="lg"
                isDisabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                ← Prev
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page} size="xs" borderRadius="lg"
                    variant={safePage === page ? "solid" : "outline"}
                    bg={safePage === page ? "#065f46" : undefined}
                    color={safePage === page ? "white" : undefined}
                    borderColor={safePage === page ? "#065f46" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 5 && <Text fontSize="xs" color="gray.400">...</Text>}
              <Button
                size="xs" variant="outline" borderRadius="lg"
                isDisabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next →
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;
