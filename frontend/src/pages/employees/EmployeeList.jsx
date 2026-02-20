import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Spinner,
  Text,
  useToast,
  IconButton,
  Tooltip,
  Input,
  Select
} from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

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
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load employees.";
      setError(message);
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
        toast({
          title: "Deleted",
          description: "Employee has been removed.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete employee.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Resigned":
        return "orange";
      case "Terminated":
        return "red";
      default:
        return "gray";
    }
  };

  const departmentOptions = Array.from(
    new Set(
      employees
        .map((employee) => employee.department)
        .filter((department) => department && department.trim() !== "")
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredEmployees = employees.filter((employee) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      (employee.user?.name &&
        employee.user.name.toLowerCase().includes(query)) ||
      (employee.user?.email &&
        employee.user.email.toLowerCase().includes(query)) ||
      (employee.department &&
        employee.department.toLowerCase().includes(query)) ||
      (employee.designation &&
        employee.designation.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "All" || employee.employmentStatus === statusFilter;

    const matchesDepartment =
      departmentFilter === "All" || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const getValue = (employee) => {
      if (sortField === "name") {
        return employee.user?.name || "";
      }
      if (sortField === "email") {
        return employee.user?.email || "";
      }
      if (sortField === "department") {
        return employee.department || "";
      }
      if (sortField === "status") {
        return employee.employmentStatus || "";
      }
      if (sortField === "role") {
        return employee.designation || "";
      }
      return employee.user?.name || "";
    };

    const aValue = getValue(a).toString().toLowerCase();
    const bValue = getValue(b).toString().toLowerCase();

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const pageSizeNumber =
    pageSize === "All" ? (sortedEmployees.length || 1) : Number(pageSize);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedEmployees.length / pageSizeNumber)
  );

  const safeCurrentPage =
    currentPage > totalPages ? totalPages : currentPage;

  const startIndex = (safeCurrentPage - 1) * pageSizeNumber;
  const employeesToShow = sortedEmployees.slice(
    startIndex,
    startIndex + pageSizeNumber
  );

  const handleSort = (field) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDirection) =>
          prevDirection === "asc" ? "desc" : "asc"
        );
        return prevField;
      }
      setSortDirection("asc");
      return field;
    });
  };

  const renderSortLabel = (label, field) => {
    const isActive = sortField === field;
    const arrow = !isActive ? "" : sortDirection === "asc" ? " ↑" : " ↓";
    return `${label}${arrow}`;
  };

  const handleChangePageSize = (value) => {
    setPageSize(value === "All" ? "All" : Number(value));
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (sortedEmployees.length === 0) {
      toast({
        title: "No data",
        description: "There are no employees to export.",
        status: "info",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const rows = sortedEmployees.map((employee) => ({
      "Employee ID": employee.employeeId,
      Name: employee.user?.name || "",
      Email: employee.user?.email || "",
      Department: employee.department || "",
      Role: employee.designation || "",
      Status: employee.employmentStatus || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees.xlsx");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, departmentFilter, employees.length]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === "Active"
  ).length;

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.700">
            Employees
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Manage your employee directory with quick filters and actions.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            variant="outline"
            onClick={handleExport}
            isDisabled={employees.length === 0}
          >
            Export Excel
          </Button>
          {!isManager && (
            <Button
              leftIcon={<FaPlus />}
              colorScheme="green"
              onClick={() => navigate("/dashboard/employees/create")}
            >
              Add Employee
            </Button>
          )}
        </HStack>
      </Flex>

      <Flex
        mb={6}
        gap={4}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
      >
        <Box flex="1" minW="0">
          <Text fontSize="sm" mb={1}>
            Search
          </Text>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department or role"
          />
        </Box>
        <Box w={{ base: "100%", md: "220px" }}>
          <Text fontSize="sm" mb={1}>
            Status
          </Text>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg="white"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </Select>
        </Box>
        <Box w={{ base: "100%", md: "220px" }}>
          <Text fontSize="sm" mb={1}>
            Department
          </Text>
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            bg="white"
          >
            <option value="All">All</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </Select>
        </Box>
        <Box w={{ base: "100%", md: "220px" }}>
          <Text fontSize="sm" mb={1}>
            Summary
          </Text>
          <Box
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            px={4}
            py={2}
          >
            <Text fontSize="xs" color="gray.500">
              Total:{" "}
              <Text as="span" fontWeight="semibold" color="gray.700">
                {totalEmployees}
              </Text>{" "}
              • Active:{" "}
              <Text as="span" fontWeight="semibold" color="green.600">
                {activeEmployees}
              </Text>
            </Text>
          </Box>
        </Box>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="green.400" />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : employees.length === 0 ? (
        <Text color="gray.500">No employees added yet.</Text>
      ) : (
        <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort("name")}
                >
                  {renderSortLabel("Name", "name")}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort("email")}
                >
                  {renderSortLabel("Email", "email")}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort("role")}
                >
                  {renderSortLabel("Role", "role")}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort("department")}
                >
                  {renderSortLabel("Department", "department")}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort("status")}
                >
                  {renderSortLabel("Status", "status")}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {employeesToShow.map((employee) => (
                <Tr key={employee._id}>
                  <Td fontWeight="medium">
                    <Button
                      variant="link"
                      colorScheme="blue"
                      onClick={() =>
                        navigate(
                          `/dashboard/attendance?employeeId=${employee._id}`
                        )
                      }
                    >
                      {employee.user?.name || "N/A"}
                    </Button>
                  </Td>
                  <Td color="gray.600">{employee.user?.email || "N/A"}</Td>
                  <Td>{employee.designation}</Td>
                  <Td>{employee.department}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(employee.employmentStatus)}>
                      {employee.employmentStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="View Details">
                        <IconButton
                          icon={<FaEye />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/dashboard/employees/${employee._id}`)
                          }
                          aria-label="View"
                        />
                      </Tooltip>
                      {!isManager && (
                        <>
                          <Tooltip label="Edit">
                            <IconButton
                              icon={<FaEdit />}
                              size="sm"
                              colorScheme="orange"
                              variant="ghost"
                              onClick={() =>
                                navigate(
                                  `/dashboard/employees/edit/${employee._id}`
                                )
                              }
                              aria-label="Edit"
                            />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(employee._id)}
                              aria-label="Delete"
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Flex
            justify="space-between"
            align="center"
            px={4}
            py={3}
            borderTopWidth="1px"
            borderColor="gray.100"
            gap={3}
            flexWrap="wrap"
          >
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.500">
                Rows per page
              </Text>
              <Select
                size="sm"
                value={pageSize === "All" ? "All" : pageSize}
                onChange={(e) => handleChangePageSize(e.target.value)}
                w="80px"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="All">All</option>
              </Select>
            </HStack>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.500">
                Page {safeCurrentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                isDisabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                }
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                isDisabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < totalPages ? prev + 1 : prev
                  )
                }
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;
