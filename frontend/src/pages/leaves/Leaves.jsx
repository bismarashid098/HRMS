import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Text,
  useToast, Spinner, Flex, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl,
  FormLabel, Input, Select, Textarea, Grid, Icon, InputGroup, InputLeftElement, Avatar
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import {
  FaPlus, FaCheck, FaTimes, FaSearch, FaFilter, FaFileExcel,
  FaCalendarCheck, FaClock, FaCalendarTimes, FaCalendarAlt, FaMoneyBillWave
} from "react-icons/fa";

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

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({ type: "", fromDate: "", toDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [empFilter, setEmpFilter] = useState("");

  const isAdmin = user?.role === "Admin" || user?.role === "Manager";

  useEffect(() => {
    if (!isAdmin) return;
    setEmployeesLoading(true);
    api.get("/employees").then(({ data }) => setEmployees(data)).catch(() => {}).finally(() => setEmployeesLoading(false));
  }, [isAdmin]);

  const fetchLeaves = useCallback(async () => {
    try {
      const { data } = await api.get("/leaves");
      setLeaves(data);
    } catch (err) {
      toast({ title: "Error fetching leaves", description: err.response?.data?.message || "Failed to load.", status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleApplyLeave = async () => {
    if (isAdmin && !selectedEmployeeId) { toast({ title: "Select an employee", status: "warning", duration: 3000, isClosable: true }); return; }
    if (!formData.type || !formData.fromDate || !formData.toDate || !formData.reason) { toast({ title: "Fill all required fields", status: "warning", duration: 3000, isClosable: true }); return; }
    if (new Date(formData.toDate) < new Date(formData.fromDate)) { toast({ title: "To Date cannot be before From Date", status: "error", duration: 3000, isClosable: true }); return; }

    setSubmitting(true);
    try {
      await api.post("/leaves", { employeeId: selectedEmployeeId, ...formData });
      toast({ title: "Leave Added", status: "success", duration: 3000, isClosable: true });
      onClose();
      setFormData({ type: "", fromDate: "", toDate: "", reason: "" });
      setSelectedEmployeeId("");
      fetchLeaves();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed.", status: "error", duration: 3000, isClosable: true });
    } finally { setSubmitting(false); }
  };

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.put(`/leaves/${id}`, { status });
      toast({ title: `Leave ${status}`, status: "success", duration: 3000, isClosable: true });
      fetchLeaves();
    } catch { toast({ title: "Error updating status", status: "error", duration: 3000, isClosable: true }); }
    finally { setActionLoading(null); }
  };

  const summary = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
    paid: leaves.filter((l) => l.paid).length,
    unpaid: leaves.filter((l) => l.paid === false).length,
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (empFilter && leave.employee?._id !== empFilter) return false;
    if (statusFilter !== "All" && leave.status !== statusFilter) return false;
    if (typeFilter !== "All" && leave.type !== typeFilter) return false;
    if (fromFilter && new Date(leave.fromDate) < new Date(fromFilter)) return false;
    if (toFilter && new Date(leave.toDate) > new Date(toFilter)) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const name = (leave.employee?.user?.name || leave.employee?.name || "").toLowerCase();
      const dept = (leave.employee?.department || "").toLowerCase();
      if (!name.includes(q) && !dept.includes(q) && !(leave.type || "").toLowerCase().includes(q) && !(leave.reason || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleExport = () => {
    if (!filteredLeaves.length) { toast({ title: "No data to export", status: "info", duration: 3000, isClosable: true }); return; }
    const rows = filteredLeaves.map((l) => ({
      Employee: l.employee?.user?.name || "", Department: l.employee?.department || "",
      Type: l.type, "From Date": new Date(l.fromDate).toLocaleDateString(),
      "To Date": new Date(l.toDate).toLocaleDateString(), Days: l.totalDays,
      Status: l.status, Paid: l.paid ? "Paid" : "Unpaid", Reason: l.reason || ""
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaves");
    XLSX.writeFile(wb, "leaves.xlsx");
  };

  if (loading) return <Flex justify="center" align="center" h="300px"><Spinner size="xl" color="#065f46" thickness="3px" /></Flex>;

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Leave Management</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Track and manage employee leave requests with approval workflow</Text>
          </Box>
          <Flex gap={2}>
            <Button leftIcon={<FaFileExcel />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} size="sm" borderRadius="xl" onClick={handleExport} isDisabled={!filteredLeaves.length}>Export</Button>
            {isAdmin && (
              <Button leftIcon={<FaPlus />} bg="white" color="#065f46" _hover={{ bg: "gray.100" }} size="sm" fontWeight="bold" borderRadius="xl" onClick={onOpen}>
                Add Leave
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3} mb={4}>
        <StatCard label="Total" value={summary.total} color="#065f46" bg="#f0fdf4" icon={FaCalendarAlt} />
        <StatCard label="Pending" value={summary.pending} color="#d97706" bg="#fffbeb" icon={FaClock} />
        <StatCard label="Approved" value={summary.approved} color="#1d4ed8" bg="#eff6ff" icon={FaCalendarCheck} />
        <StatCard label="Rejected" value={summary.rejected} color="#dc2626" bg="#fef2f2" icon={FaCalendarTimes} />
        <StatCard label="Paid" value={summary.paid} color="#065f46" bg="#f0fdf4" icon={FaMoneyBillWave} />
        <StatCard label="Unpaid" value={summary.unpaid} color="#7c3aed" bg="#f5f3ff" icon={FaCalendarTimes} />
      </Grid>

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} wrap="wrap" align="flex-end">
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="13px" /></InputLeftElement>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, department, type..."
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
          {isAdmin && (
            <Select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)} w="200px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
              <option value="">All Employees</option>
              {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.user?.name || emp.name}</option>)}
            </Select>
          )}
          <Input type="date" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)} w="160px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46" placeholder="From" />
          <Input type="date" value={toFilter} onChange={(e) => setToFilter(e.target.value)} w="160px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46" placeholder="To" />
          {(search || statusFilter !== "All" || typeFilter !== "All" || empFilter || fromFilter || toFilter) && (
            <Button size="sm" variant="ghost" borderRadius="xl" onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); setEmpFilter(""); setFromFilter(""); setToFilter(""); }}>Clear</Button>
          )}
        </Flex>
        <Text mt={2} fontSize="xs" color="gray.400">Showing {filteredLeaves.length} of {leaves.length} requests</Text>
      </Box>

      {/* Table */}
      <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="gray.50">
                {isAdmin && <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>}
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Type</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Period</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Days</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Reason</Th>
                <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                {isAdmin && <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {leaves.length === 0 ? (
                <Tr><Td colSpan={isAdmin ? 7 : 5} textAlign="center" py={12}>
                  <Icon as={FaCalendarAlt} fontSize="40px" color="gray.200" mb={3} display="block" mx="auto" />
                  <Text color="gray.400" fontWeight="medium">No leave records found.</Text>
                </Td></Tr>
              ) : filteredLeaves.length === 0 ? (
                <Tr><Td colSpan={isAdmin ? 7 : 5} textAlign="center" color="gray.400" py={8}>No leaves match the current filters.</Td></Tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const name = leave.employee?.user?.name || leave.employee?.name || "Unknown";
                  return (
                    <Tr key={leave._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      {isAdmin && (
                        <Td py={3}>
                          <Flex align="center" gap={3}>
                            <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                              <Text fontSize="xs" color="gray.400">{leave.employee?.department || "N/A"}</Text>
                            </Box>
                          </Flex>
                        </Td>
                      )}
                      <Td py={3}>
                        <Badge colorScheme={typeColors[leave.type] || "gray"} borderRadius="full" px={2} py={0.5} fontSize="xs">{leave.type}</Badge>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="sm" color="gray.700">{new Date(leave.fromDate).toLocaleDateString()}</Text>
                        <Text fontSize="xs" color="gray.400">to {new Date(leave.toDate).toLocaleDateString()}</Text>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">{leave.totalDays}</Text>
                        <Text fontSize="xs" color={leave.paid ? "green.500" : "purple.500"}>{leave.paid ? "Paid" : "Unpaid"}</Text>
                      </Td>
                      <Td py={3} maxW="200px">
                        <Text fontSize="sm" color="gray.600" noOfLines={2} title={leave.reason}>{leave.reason}</Text>
                      </Td>
                      <Td py={3}>
                        <Badge colorScheme={statusColors[leave.status] || "gray"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{leave.status}</Badge>
                      </Td>
                      {isAdmin && (
                        <Td py={3}>
                          {leave.status === "Pending" && (
                            <HStack spacing={1}>
                              <Button size="xs" colorScheme="green" leftIcon={<FaCheck />} borderRadius="lg"
                                onClick={() => updateStatus(leave._id, "Approved")} isLoading={actionLoading === leave._id}
                                isDisabled={actionLoading && actionLoading !== leave._id}>Approve</Button>
                              <Button size="xs" colorScheme="red" leftIcon={<FaTimes />} borderRadius="lg"
                                onClick={() => updateStatus(leave._id, "Rejected")} isLoading={actionLoading === leave._id}
                                isDisabled={actionLoading && actionLoading !== leave._id}>Reject</Button>
                            </HStack>
                          )}
                        </Td>
                      )}
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Apply Leave Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl" shadow="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">Add Manual Leave</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            {isAdmin && (
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Employee</FormLabel>
                <Select placeholder={employeesLoading ? "Loading..." : "Select employee"} value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)} borderRadius="xl" focusBorderColor="#065f46" isDisabled={employeesLoading}>
                  {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.user?.name || emp.name}</option>)}
                </Select>
              </FormControl>
            )}
            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Leave Type</FormLabel>
              <Select placeholder="Select type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} borderRadius="xl" focusBorderColor="#065f46">
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Annual">Annual Leave</option>
              </Select>
            </FormControl>
            <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">From Date</FormLabel>
                <Input type="date" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })} borderRadius="xl" focusBorderColor="#065f46" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">To Date</FormLabel>
                <Input type="date" value={formData.toDate} onChange={(e) => setFormData({ ...formData, toDate: e.target.value })} borderRadius="xl" focusBorderColor="#065f46" />
              </FormControl>
            </Grid>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Reason</FormLabel>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for leave..." rows={3} borderRadius="xl" focusBorderColor="#065f46" />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
            <Button variant="ghost" onClick={onClose} borderRadius="xl">Cancel</Button>
            <Button bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl" onClick={handleApplyLeave} isLoading={submitting} loadingText="Submitting">Submit Request</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Leaves;
