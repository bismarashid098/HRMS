import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Heading,
    HStack,
    Text,
    useToast,
    Spinner,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,

    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import * as XLSX from "xlsx";

const Leaves = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Form State
    const [formData, setFormData] = useState({
        type: "",
        fromDate: "",
        toDate: "",
        reason: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // track which leave is being updated
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [fromFilter, setFromFilter] = useState("");
    const [toFilter, setToFilter] = useState("");

    const isEmployee = user?.role === "Employee";
    const isAdmin = user?.role === "Admin" || user?.role === "HR" || user?.role === "Manager";

    useEffect(() => {
        if (!isAdmin) return;
        const loadEmployees = async () => {
            setEmployeesLoading(true);
            try {
                const { data } = await api.get("/employees");
                setEmployees(data);
            } catch (err) {
                toast({
                    title: "Error loading employees",
                    description: err.response?.data?.message || "Failed to load employees list.",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            } finally {
                setEmployeesLoading(false);
            }
        };
        loadEmployees();
    }, [isAdmin, toast]);

    const fetchLeaves = useCallback(async () => {
        try {
            let endpoint = "/leaves";
            if (isEmployee && user?.employeeId) {
                endpoint = `/leaves/my/${user.employeeId}`;
            }
            const { data } = await api.get(endpoint);
            setLeaves(data);
        } catch (err) {
            console.error(err);
            toast({
                title: "Error fetching leaves",
                description: err.response?.data?.message || "Failed to load leave records.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [isEmployee, user, toast]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleApplyLeave = async () => {
        if (isAdmin && !selectedEmployeeId) {
            toast({
                title: "Employee required",
                description: "Please select an employee.",
                status: "warning",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        if (!formData.type || !formData.fromDate || !formData.toDate || !formData.reason) {
            toast({
                title: "Missing Fields",
                description: "Please fill all required fields.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (new Date(formData.toDate) < new Date(formData.fromDate)) {
            toast({
                title: "Invalid Dates",
                description: "'To Date' cannot be before 'From Date'.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSubmitting(true);
        try {
            const employeeId = isEmployee ? user.employeeId : selectedEmployeeId;
            await api.post("/leaves", {
                employeeId,
                ...formData
            });
            toast({
                title: "Leave Applied",
                description: "Your leave request has been submitted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            setFormData({ type: "", fromDate: "", toDate: "", reason: "" });
            if (isAdmin) {
                setSelectedEmployeeId("");
            }
            fetchLeaves();
        } catch (err) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to apply leave.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await api.put(`/leaves/${id}`, { status });
            toast({
                title: `Leave ${status}`,
                description: `The leave request has been marked as ${status}.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchLeaves();
        } catch {
            toast({
                title: "Error",
                description: "Failed to update leave status.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved": return "green";
            case "Rejected": return "red";
            default: return "yellow";
        }
    };

    const summary = {
        total: leaves.length,
        pending: leaves.filter((leave) => leave.status === "Pending").length,
        approved: leaves.filter((leave) => leave.status === "Approved").length,
        rejected: leaves.filter((leave) => leave.status === "Rejected").length,
        paid: leaves.filter((leave) => leave.paid).length,
        unpaid: leaves.filter((leave) => leave.paid === false).length
    };

    const filteredLeaves = leaves.filter((leave) => {
        if (isAdmin && selectedEmployeeId && leave.employee && leave.employee._id) {
            if (leave.employee._id.toString() !== selectedEmployeeId) {
                return false;
            }
        }

        if (statusFilter !== "All" && leave.status !== statusFilter) {
            if (statusFilter === "Pending+Approved") {
                if (leave.status !== "Pending" && leave.status !== "Approved") {
                    return false;
                }
            } else {
                if (leave.status !== statusFilter) {
                    return false;
                }
            }
        }

        if (typeFilter !== "All" && leave.type !== typeFilter) {
            return false;
        }

        if (fromFilter) {
            const from = new Date(fromFilter);
            const leaveFrom = new Date(leave.fromDate);
            if (leaveFrom < from) {
                return false;
            }
        }

        if (toFilter) {
            const to = new Date(toFilter);
            const leaveTo = new Date(leave.toDate);
            if (leaveTo > to) {
                return false;
            }
        }

        const query = search.trim().toLowerCase();
        if (query) {
            const employeeName =
                leave.employee && leave.employee.user && leave.employee.user.name
                    ? leave.employee.user.name.toLowerCase()
                    : "";
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

    const handleExport = () => {
        if (filteredLeaves.length === 0) {
            toast({
                title: "No data",
                description: "There are no leave records to export for current filters.",
                status: "info",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        const rows = filteredLeaves.map((leave) => {
            const base = {
                Type: leave.type,
                "From Date": new Date(leave.fromDate).toLocaleDateString(),
                "To Date": new Date(leave.toDate).toLocaleDateString(),
                Days: leave.totalDays,
                Status: leave.status,
                Paid: leave.paid ? "Paid" : "Unpaid",
                Reason: leave.reason || ""
            };

            if (isAdmin) {
                return {
                    Employee: leave.employee && leave.employee.user
                        ? leave.employee.user.name
                        : "",
                    Department: leave.employee && leave.employee.department
                        ? leave.employee.department
                        : "",
                    ...base
                };
            }

            return base;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");

        const suffix = isAdmin
            ? "all"
            : (user && user.employeeId) ? user.employeeId : "me";

        XLSX.writeFile(workbook, `leaves-${suffix}.xlsx`);
    };

    if (loading) return (
        <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" color="green.500" />
        </Flex>
    );

    return (
        <Box p={6}>
            <Flex justify="space-between" align="center" mb={6} gap={4} wrap="wrap">
                <Box>
                    <Heading size="lg" color="gray.700">Leave Management</Heading>
                    <Text fontSize="sm" color="gray.500">
                        Leave requests with approval workflow and quick stats.
                    </Text>
                </Box>
                <HStack spacing={3}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        isDisabled={filteredLeaves.length === 0}
                    >
                        Export Excel
                    </Button>
                    {(isEmployee || isAdmin) && (
                        <Button
                            leftIcon={<FaPlus />}
                            colorScheme="green"
                            onClick={onOpen}
                            _hover={{ bg: "green.600" }}
                        >
                            {isEmployee ? "Apply Leave" : "Add Manual Leave"}
                        </Button>
                    )}
                </HStack>
            </Flex>

            {leaves.length > 0 && (
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={6}>
                    <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
                        <StatLabel>Total Requests</StatLabel>
                        <StatNumber>{summary.total}</StatNumber>
                    </Stat>
                    <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
                        <StatLabel>Approved</StatLabel>
                        <StatNumber color="green.500">{summary.approved}</StatNumber>
                    </Stat>
                    <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
                        <StatLabel>Pending</StatLabel>
                        <StatNumber color="orange.400">{summary.pending}</StatNumber>
                    </Stat>
                    <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
                        <StatLabel>Rejected</StatLabel>
                        <StatNumber color="red.500">{summary.rejected}</StatNumber>
                    </Stat>
                    <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
                        <StatLabel>Paid Leaves</StatLabel>
                        <StatNumber color="green.600">{summary.paid}</StatNumber>
                    </Stat>
                    <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
                        <StatLabel>Unpaid Leaves</StatLabel>
                        <StatNumber color="purple.500">{summary.unpaid}</StatNumber>
                    </Stat>
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
                    <Box minW={{ base: "100%", md: "180px" }}>
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
                    <Box minW={{ base: "100%", md: "180px" }}>
                        <Text fontSize="sm" mb={1}>
                            Type
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
                    <Box minW={{ base: "100%", md: "180px" }}>
                        <Text fontSize="sm" mb={1}>
                            From
                        </Text>
                        <Input
                            type="date"
                            value={fromFilter}
                            onChange={(e) => setFromFilter(e.target.value)}
                        />
                    </Box>
                    <Box minW={{ base: "100%", md: "180px" }}>
                        <Text fontSize="sm" mb={1}>
                            To
                        </Text>
                        <Input
                            type="date"
                            value={toFilter}
                            onChange={(e) => setToFilter(e.target.value)}
                        />
                    </Box>
                    {isAdmin && (
                        <Box minW={{ base: "100%", md: "220px" }}>
                            <Text fontSize="sm" mb={1}>
                                Employee
                            </Text>
                            <Select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                placeholder={
                                    employeesLoading
                                        ? "Loading employees..."
                                        : "All employees"
                                }
                            >
                                <option value="">All employees</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.employeeId} - {emp.user?.name || emp.name}
                                    </option>
                                ))}
                            </Select>
                        </Box>
                    )}
                    <Box flex="1" minW={{ base: "100%", md: "220px" }}>
                        <Text fontSize="sm" mb={1}>
                            Search
                        </Text>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={
                                isAdmin
                                    ? "Search by employee, department, type or reason"
                                    : "Search by type or reason"
                            }
                        />
                    </Box>
                </Flex>
                <Text mt={2} fontSize="xs" color="gray.500">
                    Showing {filteredLeaves.length} of {leaves.length} requests
                </Text>
            </Box>

            <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            {isAdmin && <Th>Employee</Th>}
                            <Th>Type</Th>
                            <Th>From</Th>
                            <Th>To</Th>
                            <Th>Days</Th>
                            <Th>Reason</Th>
                            <Th>Status</Th>
                            {isAdmin && <Th>Actions</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {leaves.length === 0 ? (
                            <Tr>
                                <Td colSpan={isAdmin ? 8 : 7} textAlign="center" color="gray.500" py={8}>
                                    No leave records found.
                                </Td>
                            </Tr>
                        ) : filteredLeaves.length === 0 ? (
                            <Tr>
                                <Td colSpan={isAdmin ? 8 : 7} textAlign="center" color="gray.500" py={8}>
                                    No leaves match the current filters.
                                </Td>
                            </Tr>
                        ) : (
                            filteredLeaves.map((leave) => (
                                <Tr key={leave._id}>
                                    {isAdmin && (
                                        <Td>
                                            <Text fontWeight="medium">{leave.employee?.user?.name || "Unknown"}</Text>
                                            <Text fontSize="xs" color="gray.500">{leave.employee?.department || "N/A"}</Text>
                                        </Td>
                                    )}
                                    <Td>{leave.type}</Td>
                                    <Td>{new Date(leave.fromDate).toLocaleDateString()}</Td>
                                    <Td>{new Date(leave.toDate).toLocaleDateString()}</Td>
                                    <Td>{leave.totalDays}</Td>
                                    <Td maxW="200px" isTruncated title={leave.reason}>{leave.reason}</Td>
                                    <Td>
                                        <Badge colorScheme={getStatusColor(leave.status)}>
                                            {leave.status}
                                        </Badge>
                                    </Td>
                                    {isAdmin && (
                                        <Td>
                                            {leave.status === "Pending" && (
                                                <HStack spacing={2}>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="green"
                                                        leftIcon={<FaCheck />}
                                                        onClick={() => updateStatus(leave._id, "Approved")}
                                                        isLoading={actionLoading === leave._id}
                                                        isDisabled={actionLoading && actionLoading !== leave._id}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="red"
                                                        leftIcon={<FaTimes />}
                                                        onClick={() => updateStatus(leave._id, "Rejected")}
                                                        isLoading={actionLoading === leave._id}
                                                        isDisabled={actionLoading && actionLoading !== leave._id}
                                                    >
                                                        Reject
                                                    </Button>
                                                </HStack>
                                            )}
                                        </Td>
                                    )}
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Apply Leave Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader borderBottomWidth="1px">
                        {isEmployee ? "Apply for Leave" : "Add Manual Leave"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        {isAdmin && (
                            <FormControl mb={4} isRequired>
                                <FormLabel>Employee</FormLabel>
                                <Select
                                    placeholder={
                                        employeesLoading
                                            ? "Loading employees..."
                                            : "Select employee"
                                    }
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    isDisabled={employeesLoading || employees.length === 0}
                                >
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.employeeId} - {emp.user?.name || emp.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <FormControl mb={4} isRequired>
                            <FormLabel>Leave Type</FormLabel>
                            <Select
                                placeholder="Select leave type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Casual">Casual Leave</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Annual">Annual Leave</option>
                            </Select>
                        </FormControl>

                        <HStack mb={4} spacing={4} align="start">
                            <FormControl isRequired>
                                <FormLabel>From Date</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.fromDate}
                                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>To Date</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.toDate}
                                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                />
                            </FormControl>
                        </HStack>

                        <FormControl isRequired>
                            <FormLabel>Reason</FormLabel>
                            <Textarea
                                placeholder="Reason for leave request..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={3}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button 
                            colorScheme="green" 
                            onClick={handleApplyLeave} 
                            isLoading={submitting}
                            loadingText="Submitting"
                        >
                            Submit Request
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Leaves;
