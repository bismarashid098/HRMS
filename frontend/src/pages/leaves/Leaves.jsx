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
  FaPlus, FaCheck, FaTimes, FaSearch, FaFileExcel,
  FaCalendarCheck, FaClock, FaCalendarTimes, FaCalendarAlt, FaMoneyBillWave
} from "react-icons/fa";

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

/* ── Stat Card (Dark) ── */
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
      const name = (leave.employee?.name || leave.employee?.user?.name || "").toLowerCase();
      const dept = (leave.employee?.department || "").toLowerCase();
      if (!name.includes(q) && !dept.includes(q) && !(leave.type || "").toLowerCase().includes(q) && !(leave.reason || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleExport = () => {
    if (!filteredLeaves.length) { toast({ title: "No data to export", status: "info", duration: 3000, isClosable: true }); return; }
    const rows = filteredLeaves.map((l) => ({
      Employee: l.employee?.name || l.employee?.user?.name || "", Department: l.employee?.department || "",
      Type: l.type, "From Date": new Date(l.fromDate).toLocaleDateString(),
      "To Date": new Date(l.toDate).toLocaleDateString(), Days: l.totalDays,
      Status: l.status, Paid: l.paid ? "Paid" : "Unpaid", Reason: l.reason || ""
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaves");
    XLSX.writeFile(wb, "leaves.xlsx");
  };

  if (loading) return <Flex justify="center" align="center" h="300px"><Spinner size="xl" color={T.teal} thickness="3px" /></Flex>;

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        {/* Header Banner */}
        <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xl" fontWeight="700" color={T.text}>Leave Management</Text>
            <Text fontSize="sm" color={T.muted}>Track and manage employee leave requests with approval workflow</Text>
          </Box>
          <Flex gap={2}>
            <Button leftIcon={<FaFileExcel />} variant="outline" borderColor={T.border} color={T.muted}
              _hover={{ borderColor: T.green, color: T.green }} size="sm" borderRadius="10px"
              onClick={handleExport} isDisabled={!filteredLeaves.length}>Export</Button>
            {isAdmin && (
              <Button leftIcon={<FaPlus />} bg={T.teal} color={T.bg} _hover={{ bg: T.tealDim }}
                size="sm" fontWeight="bold" borderRadius="10px" onClick={onOpen}>Add Leave</Button>
            )}
          </Flex>
        </Flex>

        {/* Stats */}
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3} mb={4}>
          <StatCard label="Total" value={summary.total} color={T.teal} icon={FaCalendarAlt} />
          <StatCard label="Pending" value={summary.pending} color={T.amber} icon={FaClock} />
          <StatCard label="Approved" value={summary.approved} color={T.green} icon={FaCalendarCheck} />
          <StatCard label="Rejected" value={summary.rejected} color={T.red} icon={FaCalendarTimes} />
          <StatCard label="Paid" value={summary.paid} color={T.green} icon={FaMoneyBillWave} />
          <StatCard label="Unpaid" value={summary.unpaid} color={T.blue} icon={FaCalendarTimes} />
        </Grid>

        {/* Filters */}
        <Box bg={T.surface} borderRadius="14px" p={4} mb={4} border={`1px solid ${T.border}`}>
          <Flex gap={3} wrap="wrap" align="flex-end">
            <InputGroup flex="1" minW="200px">
              <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color={T.muted} fontSize="13px" /></InputLeftElement>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, department, type..."
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
            {isAdmin && (
              <Select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)} w="200px" borderRadius="10px"
                bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm">
                <option value="">All Employees</option>
                {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </Select>
            )}
            <Input type="date" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)} w="160px" borderRadius="10px"
              bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm" />
            <Input type="date" value={toFilter} onChange={(e) => setToFilter(e.target.value)} w="160px" borderRadius="10px"
              bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} fontSize="sm" />
            {(search || statusFilter !== "All" || typeFilter !== "All" || empFilter || fromFilter || toFilter) && (
              <Button size="sm" variant="ghost" color={T.muted} _hover={{ color: T.text, bg: T.surface2 }} borderRadius="10px"
                onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); setEmpFilter(""); setFromFilter(""); setToFilter(""); }}>Clear</Button>
            )}
          </Flex>
          <Text mt={2} fontSize="xs" color={T.muted}>Showing {filteredLeaves.length} of {leaves.length} requests</Text>
        </Box>

        {/* Table */}
        <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg={T.surface2}>
                  {isAdmin && <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Employee</Th>}
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Type</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Period</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Days</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Reason</Th>
                  <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Status</Th>
                  {isAdmin && <Th borderColor={T.border} color={T.muted} py={3} fontSize="xs" fontWeight="semibold" textTransform="uppercase">Actions</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {leaves.length === 0 ? (
                  <Tr><Td colSpan={isAdmin ? 7 : 5} textAlign="center" py={12}>
                    <Icon as={FaCalendarAlt} fontSize="40px" color={T.muted} opacity={0.5} mb={3} display="block" mx="auto" />
                    <Text color={T.muted}>No leave records found.</Text>
                  </Td></Tr>
                ) : filteredLeaves.length === 0 ? (
                  <Tr><Td colSpan={isAdmin ? 7 : 5} textAlign="center" color={T.muted} py={8}>No leaves match the current filters.</Td></Tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const name = leave.employee?.name || leave.employee?.user?.name || "Unknown";
                    return (
                      <Tr key={leave._id} _hover={{ bg: T.surface2 }} transition="background 0.15s">
                        {isAdmin && (
                          <Td borderColor={T.border} py={3}>
                            <Flex align="center" gap={3}>
                              <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                              <Box>
                                <Text fontSize="sm" fontWeight="semibold" color={T.text}>{name}</Text>
                                <Text fontSize="xs" color={T.muted}>{leave.employee?.department || "N/A"}</Text>
                              </Box>
                            </Flex>
                          </Td>
                        )}
                        <Td borderColor={T.border} py={3}>
                          <Badge bg={`${typeColors[leave.type] || T.muted}20`} color={typeColors[leave.type] || T.muted} borderRadius="full" px={2} py={0.5} fontSize="xs">{leave.type}</Badge>
                        </Td>
                        <Td borderColor={T.border} py={3}>
                          <Text fontSize="sm" color={T.text}>{new Date(leave.fromDate).toLocaleDateString()}</Text>
                          <Text fontSize="xs" color={T.muted}>to {new Date(leave.toDate).toLocaleDateString()}</Text>
                        </Td>
                        <Td borderColor={T.border} py={3}>
                          <Text fontSize="sm" fontWeight="bold" color={T.text}>{leave.totalDays}</Text>
                          <Text fontSize="xs" color={leave.paid ? T.green : T.blue}>{leave.paid ? "Paid" : "Unpaid"}</Text>
                        </Td>
                        <Td borderColor={T.border} py={3} maxW="200px">
                          <Text fontSize="sm" color={T.muted} noOfLines={2} title={leave.reason}>{leave.reason}</Text>
                        </Td>
                        <Td borderColor={T.border} py={3}>
                          <Badge bg={`${statusColors[leave.status] || T.muted}20`} color={statusColors[leave.status] || T.muted} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{leave.status}</Badge>
                        </Td>
                        {isAdmin && (
                          <Td borderColor={T.border} py={3}>
                            {leave.status === "Pending" && (
                              <HStack spacing={1}>
                                <Button size="xs" bg={`${T.green}20`} color={T.green} border={`1px solid ${T.green}30`}
                                  _hover={{ bg: T.green, color: T.bg }} leftIcon={<FaCheck />} borderRadius="8px"
                                  onClick={() => updateStatus(leave._id, "Approved")} isLoading={actionLoading === leave._id}
                                  isDisabled={actionLoading && actionLoading !== leave._id}>Approve</Button>
                                <Button size="xs" bg={`${T.red}20`} color={T.red} border={`1px solid ${T.red}30`}
                                  _hover={{ bg: T.red, color: T.bg }} leftIcon={<FaTimes />} borderRadius="8px"
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

        {/* Apply Leave Modal (Dark) */}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent bg={T.surface} borderRadius="14px">
            <ModalHeader borderBottom={`1px solid ${T.border}`} fontSize="md" fontWeight="bold" color={T.text}>Add Manual Leave</ModalHeader>
            <ModalCloseButton color={T.muted} />
            <ModalBody py={5}>
              {isAdmin && (
                <FormControl mb={4} isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>Employee</FormLabel>
                  <Select placeholder={employeesLoading ? "Loading..." : "Select employee"} value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)} borderRadius="10px"
                    bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }}
                    isDisabled={employeesLoading}>
                    {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                  </Select>
                </FormControl>
              )}
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>Leave Type</FormLabel>
                <Select placeholder="Select type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }}>
                  <option value="Casual">Casual Leave</option><option value="Sick">Sick Leave</option><option value="Annual">Annual Leave</option>
                </Select>
              </FormControl>
              <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>From Date</FormLabel>
                  <Input type="date" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>To Date</FormLabel>
                  <Input type="date" value={formData.toDate} onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} />
                </FormControl>
              </Grid>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>Reason</FormLabel>
                <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for leave..." rows={3} borderRadius="10px"
                  bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} />
              </FormControl>
            </ModalBody>
            <ModalFooter borderTop={`1px solid ${T.border}`} gap={2}>
              <Button variant="ghost" color={T.muted} _hover={{ bg: T.surface2 }} onClick={onClose} borderRadius="10px">Cancel</Button>
              <Button bg={T.teal} color={T.bg} _hover={{ bg: T.tealDim }} borderRadius="10px" onClick={handleApplyLeave} isLoading={submitting} loadingText="Submitting">Submit Request</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default Leaves;