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

/* ─── Light Theme ─── */
const T = {
  bg:       "#F8FAFC",
  surface:  "#FFFFFF",
  surface2: "#F1F5F9",
  border:   "#E2E8F0",
  teal:     "#0891B2",
  tealDim:  "#0E7490",
  blue:     "#1D4ED8",
  red:      "#DC2626",
  amber:    "#D97706",
  green:    "#059669",
  text:     "#0F172A",
  muted:    "#64748B",
};

/* ─── Helper functions ─── */
const getInitials = (name = "") =>
  name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const avatarColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626", "#0891b2"];
const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return T.green;
    case "Resigned": return T.amber;
    case "Terminated": return T.red;
    default: return T.muted;
  }
};

const getStatusBg = (status) => {
  switch (status) {
    case "Active": return "#DCFCE7";
    case "Resigned": return "#FEF3C7";
    case "Terminated": return "#FEE2E2";
    default: return T.surface2;
  }
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon, color }) => (
  <Box
    bg={T.surface}
    borderRadius="14px"
    p={4}
    border="1px solid"
    borderColor={T.border}
    position="relative"
    overflow="hidden"
    _hover={{ borderColor: color, transform: "translateY(-2px)" }}
    transition="all 0.2s ease"
    boxShadow="0 1px 3px rgba(0,0,0,0.06)"
  >
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      h="2px"
      bg={`linear-gradient(90deg, ${color}, transparent)`}
    />
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color={T.muted} mb={2}>
          {label}
        </Text>
        <Text fontSize="28px" fontWeight="900" color={T.text} lineHeight="1">
          {value}
        </Text>
      </Box>
      <Flex
        w="36px"
        h="36px"
        borderRadius="10px"
        bg={`${color}18`}
        border="1px solid"
        borderColor={`${color}30`}
        align="center"
        justify="center"
      >
        <Icon as={icon} fontSize="16px" color={color} />
      </Flex>
    </Flex>
  </Box>
);

/* ─── Main Component ─── */
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
    <Box bg={T.bg} minH="100vh" p={5}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xl" fontWeight="700" color={T.text}>
            Employee Directory
          </Text>
          <Text fontSize="sm" color={T.muted}>
            Manage and track all employees in your organization
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FaFileExcel />}
            variant="outline"
            borderColor={T.border}
            color={T.muted}
            _hover={{ borderColor: T.green, color: T.green, bg: "transparent" }}
            borderRadius="10px"
            size="sm"
            onClick={handleExport}
            isDisabled={!employees.length}
          >
            Export Excel
          </Button>
          {!isManager && (
            <Button
              leftIcon={<FaPlus />}
              bg={T.teal}
              color="white"
              _hover={{ bg: T.tealDim }}
              borderRadius="10px"
              size="sm"
              fontWeight="600"
              onClick={() => navigate("/dashboard/employees/create")}
            >
              Add Employee
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Stat Cards */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Total Staff" value={total} icon={FaUsers} color={T.teal} />
        <StatCard label="Active" value={active} icon={FaUserCheck} color={T.green} />
        <StatCard label="Resigned" value={resigned} icon={FaUserClock} color={T.amber} />
        <StatCard label="Terminated" value={terminated} icon={FaUserTimes} color={T.red} />
      </Grid>

      {/* Filters */}
      <Box bg={T.surface} borderRadius="14px" p={4} mb={4} border="1px solid" borderColor={T.border} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
        <Flex gap={3} wrap="wrap" align="center">
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color={T.muted} fontSize="13px" />
            </InputLeftElement>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department or role..."
              borderRadius="10px"
              bg={T.bg}
              border="1px solid"
              borderColor={T.border}
              _focus={{ borderColor: T.teal }}
              _hover={{ borderColor: "#CBD5E1" }}
              color={T.text}
              fontSize="sm"
            />
          </InputGroup>

          <InputGroup w={{ base: "full", md: "180px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaFilter} color={T.muted} fontSize="12px" />
            </InputLeftElement>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              borderRadius="10px"
              bg={T.bg}
              borderColor={T.border}
              color={T.text}
              fontSize="sm"
              pl={8}
              _focus={{ borderColor: T.teal }}
              _hover={{ borderColor: "#CBD5E1" }}
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
            borderRadius="10px"
            bg={T.bg}
            borderColor={T.border}
            color={T.text}
            fontSize="sm"
            _focus={{ borderColor: T.teal }}
            _hover={{ borderColor: "#CBD5E1" }}
          >
            <option value="All">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>

          {(search || statusFilter !== "All" || departmentFilter !== "All") && (
            <Button
              size="sm"
              variant="ghost"
              color={T.muted}
              _hover={{ color: T.text, bg: T.surface2 }}
              borderRadius="10px"
              onClick={() => { setSearch(""); setStatusFilter("All"); setDepartmentFilter("All"); }}
            >
              Clear
            </Button>
          )}
        </Flex>
      </Box>

      {/* Table Area */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color={T.teal} thickness="3px" />
          <Text color={T.muted} fontSize="sm">Loading employees...</Text>
        </Flex>
      ) : error ? (
        <Box bg="#FEE2E2" borderRadius="14px" p={6} textAlign="center" border="1px solid" borderColor="#FECACA">
          <Text color={T.red}>{error}</Text>
        </Box>
      ) : employees.length === 0 ? (
        <Box bg={T.surface} borderRadius="14px" p={12} textAlign="center" border="1px solid" borderColor={T.border}>
          <Icon as={FaUsers} fontSize="48px" color={T.muted} mb={4} opacity={0.5} />
          <Text color={T.muted} fontWeight="medium">No employees added yet.</Text>
          {!isManager && (
            <Button
              mt={4}
              size="sm"
              bg={T.teal}
              color="white"
              borderRadius="10px"
              leftIcon={<FaPlus />}
              _hover={{ bg: T.tealDim }}
              onClick={() => navigate("/dashboard/employees/create")}
            >
              Add First Employee
            </Button>
          )}
        </Box>
      ) : (
        <Box bg={T.surface} borderRadius="14px" border="1px solid" borderColor={T.border} overflow="hidden" boxShadow="0 1px 3px rgba(0,0,0,0.05)">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg={T.surface2}>
                  <Th py={4} fontSize="xs" color={T.muted} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" borderColor={T.border}>
                    Employee
                  </Th>
                  <Th
                    py={4} fontSize="xs" color={T.muted} fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="wider"
                    cursor="pointer" onClick={() => handleSort("role")}
                    _hover={{ color: T.text }}
                    borderColor={T.border}
                  >
                    {sortLabel("Designation", "role")}
                  </Th>
                  <Th
                    py={4} fontSize="xs" color={T.muted} fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="wider"
                    cursor="pointer" onClick={() => handleSort("department")}
                    _hover={{ color: T.text }}
                    borderColor={T.border}
                  >
                    {sortLabel("Department", "department")}
                  </Th>
                  <Th
                    py={4} fontSize="xs" color={T.muted} fontWeight="semibold"
                    textTransform="uppercase" letterSpacing="wider"
                    cursor="pointer" onClick={() => handleSort("status")}
                    _hover={{ color: T.text }}
                    borderColor={T.border}
                  >
                    {sortLabel("Status", "status")}
                  </Th>
                  <Th py={4} fontSize="xs" color={T.muted} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" borderColor={T.border}>
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {pageEmployees.map((emp, idx) => {
                  const name = emp.name || emp.user?.name || "N/A";
                  const email = emp.email || emp.user?.email || "";
                  const avatarBg = getAvatarColor(name);
                  return (
                    <Tr
                      key={emp._id}
                      _hover={{ bg: T.surface2 }}
                      transition="background 0.15s"
                      borderBottom="1px solid"
                      borderColor={T.border}
                    >
                      <Td py={3} borderColor={T.border}>
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
                              color={T.text}
                              fontWeight="semibold"
                              fontSize="sm"
                              _hover={{ color: T.teal }}
                              onClick={() => navigate(`/dashboard/attendance?employeeId=${emp._id}`)}
                              height="auto"
                              lineHeight="1.3"
                            >
                              {name}
                            </Button>
                            <Text fontSize="xs" color={T.muted} lineHeight="1.3">{email || "—"}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={3} borderColor={T.border}>
                        <Text fontSize="sm" color={T.text}>{emp.designation || "—"}</Text>
                      </Td>
                      <Td py={3} borderColor={T.border}>
                        {emp.department ? (
                          <Badge
                            bg={T.surface2}
                            color={T.muted}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="xs"
                          >
                            {emp.department}
                          </Badge>
                        ) : <Text fontSize="sm" color={T.muted}>—</Text>}
                      </Td>
                      <Td py={3} borderColor={T.border}>
                        <Badge
                          bg={getStatusBg(emp.employmentStatus)}
                          color={getStatusColor(emp.employmentStatus)}
                          borderRadius="full"
                          px={3}
                          py={0.5}
                          fontSize="xs"
                          fontWeight="semibold"
                        >
                          {emp.employmentStatus || "—"}
                        </Badge>
                      </Td>
                      <Td py={3} borderColor={T.border}>
                        <HStack spacing={1}>
                          <Tooltip label="View Profile" hasArrow>
                            <IconButton
                              icon={<FaEye />}
                              size="sm"
                              variant="ghost"
                              color={T.muted}
                              _hover={{ color: T.blue, bg: T.surface2 }}
                              borderRadius="lg"
                              onClick={() => navigate(`/dashboard/employees/${emp._id}`)}
                              aria-label="View"
                            />
                          </Tooltip>
                          {!isManager && (
                            <>
                              <Tooltip label="Edit Employee" hasArrow>
                                <IconButton
                                  icon={<FaEdit />}
                                  size="sm"
                                  variant="ghost"
                                  color={T.muted}
                                  _hover={{ color: T.amber, bg: T.surface2 }}
                                  borderRadius="lg"
                                  onClick={() => navigate(`/dashboard/employees/edit/${emp._id}`)}
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Delete Employee" hasArrow>
                                <IconButton
                                  icon={<FaTrash />}
                                  size="sm"
                                  variant="ghost"
                                  color={T.muted}
                                  _hover={{ color: T.red, bg: T.surface2 }}
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
            justify="space-between"
            align="center"
            px={5}
            py={3}
            borderTop="1px solid"
            borderColor={T.border}
            flexWrap="wrap"
            gap={3}
          >
            <HStack spacing={2}>
              <Text fontSize="xs" color={T.muted}>Rows per page</Text>
              <Select
                size="xs"
                w="70px"
                borderRadius="lg"
                bg={T.bg}
                borderColor={T.border}
                color={T.text}
                value={pageSize === "All" ? "All" : pageSize}
                onChange={(e) => { setPageSize(e.target.value === "All" ? "All" : Number(e.target.value)); setCurrentPage(1); }}
                _focus={{ borderColor: T.teal }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="All">All</option>
              </Select>
            </HStack>

            <Text fontSize="xs" color={T.muted}>
              Showing <Text as="span" fontWeight="semibold" color={T.text}>
                {startIdx + 1}–{Math.min(startIdx + pageSizeNum, sortedEmployees.length)}
              </Text> of <Text as="span" fontWeight="semibold" color={T.text}>{sortedEmployees.length}</Text> employees
            </Text>

            <HStack spacing={1}>
              <Button
                size="xs"
                variant="outline"
                borderColor={T.border}
                color={T.muted}
                _hover={{ borderColor: T.teal, color: T.teal, bg: "transparent" }}
                borderRadius="lg"
                isDisabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                ← Prev
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    size="xs"
                    borderRadius="lg"
                    variant={safePage === page ? "solid" : "outline"}
                    bg={safePage === page ? T.teal : "transparent"}
                    color={safePage === page ? "white" : T.muted}
                    borderColor={safePage === page ? T.teal : T.border}
                    _hover={{ borderColor: T.teal, color: safePage === page ? "white" : T.teal }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 5 && <Text fontSize="xs" color={T.muted}>...</Text>}
              <Button
                size="xs"
                variant="outline"
                borderColor={T.border}
                color={T.muted}
                _hover={{ borderColor: T.teal, color: T.teal, bg: "transparent" }}
                borderRadius="lg"
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
