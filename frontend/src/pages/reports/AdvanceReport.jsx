import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Select, Button, Spinner,
  Text, Grid, Icon, Badge, Avatar, InputGroup, InputLeftElement, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Textarea, useDisclosure, useToast
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { FaHandHoldingUsd, FaClock, FaCheckCircle, FaTimesCircle, FaFileExcel, FaPlus, FaSearch } from "react-icons/fa";

const statusColors = { Approved: "green", Rejected: "red", Pending: "orange", Paid: "blue" };
const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

const StatCard = ({ label, value, color, bg, icon, sub }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
        {sub && <Text fontSize="xs" color="gray.400" mt={0.5}>{sub}</Text>}
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
      </Flex>
    </Flex>
  </Box>
);

// Generate last 24 months options
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label });
  }
  return options;
};
const monthOptions = generateMonthOptions();

const AdvanceReport = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isAdmin = user?.role === "Admin";

  const curVal = monthOptions[0]?.value || "";
  const [month, setMonth] = useState(curVal);
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    amount: "",
    reason: "",
    date: new Date().toISOString().split("T")[0]
  });

  const fetchAdvances = useCallback(async () => {
    setLoading(true);
    try {
      const [yr, m] = month.split("-");
      const { data } = await api.get(`/advances?month=${parseInt(m)}&year=${yr}`);
      setAdvances(data);
    } catch {
      toast({ title: "Failed to load advance report", status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [month, toast]);

  useEffect(() => { fetchAdvances(); }, [fetchAdvances]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/employees").then(({ data }) => setEmployees(data)).catch(() => {});
  }, [isAdmin]);

  const handleAddAdvance = async () => {
    if (!formData.employeeId || !formData.amount || !formData.reason || !formData.date) {
      toast({ title: "Fill all required fields", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast({ title: "Amount must be greater than 0", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/advances", { employeeId: formData.employeeId, amount: formData.amount, reason: formData.reason, date: formData.date });
      toast({ title: "Advance Added", description: "Advance will be deducted in next payroll", status: "success", duration: 3000, isClosable: true });
      onClose();
      setFormData({ employeeId: "", amount: "", reason: "", date: new Date().toISOString().split("T")[0] });
      fetchAdvances();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add advance", status: "error", duration: 3000, isClosable: true });
    } finally { setSubmitting(false); }
  };

  const filteredAdvances = advances.filter((a) => {
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || (a.employee?.name || a.employee?.user?.name || "").toLowerCase().includes(q) || (a.employee?.department || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalAmount = advances.reduce((sum, a) => sum + (a.amount || 0), 0);
  const pendingCount = advances.filter((a) => !a.status || a.status === "Pending").length;
  const approvedCount = advances.filter((a) => a.status === "Approved").length;
  const paidCount = advances.filter((a) => a.status === "Paid").length;
  const paidAmount = advances.filter((a) => a.status === "Paid").reduce((sum, a) => sum + (a.amount || 0), 0);

  const exportExcel = () => {
    const rows = filteredAdvances.map((a) => ({
      Employee: a.employee?.name || a.employee?.user?.name || "Unknown",
      Department: a.employee?.department || "N/A",
      Amount: a.amount,
      Reason: a.reason,
      Date: new Date(a.date).toLocaleDateString(),
      Status: a.status || "Pending"
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Advance Report");
    XLSX.writeFile(wb, `Advance-Report-${month}.xlsx`);
  };

  const selectedMonthLabel = monthOptions.find((o) => o.value === month)?.label || "";

  return (
    <Box>
      {/* Header */}
      <Box bgGradient="linear(135deg, #021024 0%, #7c3aed 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Advance Report</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>{selectedMonthLabel} — Advance salary requests & deductions</Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            {isAdmin && (
              <Button size="sm" leftIcon={<FaPlus />} bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} borderRadius="xl" onClick={onOpen} border="1px solid" borderColor="whiteAlpha.300">
                Add Advance
              </Button>
            )}
            <Button size="sm" leftIcon={<FaFileExcel />} bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} borderRadius="xl" onClick={exportExcel} isDisabled={filteredAdvances.length === 0} border="1px solid" borderColor="whiteAlpha.300">
              Export Excel
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Total Requests" value={advances.length} color="#7c3aed" bg="#f5f3ff" icon={FaHandHoldingUsd} sub={`Rs ${totalAmount.toLocaleString()}`} />
        <StatCard label="Pending" value={pendingCount} color="#d97706" bg="#fffbeb" icon={FaClock} sub="awaiting approval" />
        <StatCard label="Approved" value={approvedCount} color="#065f46" bg="#f0fdf4" icon={FaCheckCircle} sub="pending payroll deduction" />
        <StatCard label="Deducted via Payroll" value={paidCount} color="#dc2626" bg="#fef2f2" icon={FaTimesCircle} sub={`Rs ${paidAmount.toLocaleString()}`} />
      </Grid>

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} align="flex-end" wrap="wrap">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Month</Text>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} w="200px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed">
              {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Status</Text>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="160px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Deducted (Paid)</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </Box>
          <Box flex="1" minW="200px">
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Search</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="12px" /></InputLeftElement>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or department..." borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed" />
            </InputGroup>
          </Box>
          <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl" onClick={fetchAdvances} isLoading={loading}>Refresh</Button>
        </Flex>
      </Box>

      {/* Info note */}
      <Box bg="purple.50" border="1px solid" borderColor="purple.100" borderRadius="xl" px={4} py={3} mb={4}>
        <Text fontSize="xs" color="purple.700">
          <Text as="span" fontWeight="bold">Note:</Text> Approved advances are automatically deducted from net salary during payroll generation. Status changes to "Deducted" once payroll is processed.
        </Text>
      </Box>

      {/* Table */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#7c3aed" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading advance records...</Text>
        </Flex>
      ) : filteredAdvances.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm" border="1px dashed" borderColor="gray.200">
          <Icon as={FaHandHoldingUsd} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No advance records for this period.</Text>
          {isAdmin && <Text fontSize="sm" color="gray.400" mt={1}>Click "Add Advance" to manually add one.</Text>}
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Date</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Amount</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Reason</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAdvances.map((adv) => {
                  const name = adv.employee?.name || adv.employee?.user?.name || "Unknown";
                  return (
                    <Tr key={adv._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      <Td py={3}>
                        <Flex align="center" gap={3}>
                          <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                            <Text fontSize="xs" color="gray.400">{adv.employee?.department || "—"}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={3}><Text fontSize="sm" color="gray.700">{new Date(adv.date).toLocaleDateString()}</Text></Td>
                      <Td py={3} isNumeric><Text fontSize="sm" fontWeight="bold" color="#7c3aed">Rs {adv.amount?.toLocaleString()}</Text></Td>
                      <Td py={3} maxW="220px">
                        <Text fontSize="sm" color="gray.600" noOfLines={2} title={adv.reason}>{adv.reason}</Text>
                      </Td>
                      <Td py={3}>
                        <Badge colorScheme={statusColors[adv.status] || "orange"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">
                          {adv.status === "Paid" ? "Deducted" : (adv.status || "Pending")}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
          {totalAmount > 0 && (
            <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100" justify="space-between" align="center">
              <Text fontSize="xs" color="gray.400">
                Showing <Text as="span" fontWeight="semibold" color="gray.600">{filteredAdvances.length}</Text> of <Text as="span" fontWeight="semibold" color="gray.600">{advances.length}</Text> records
              </Text>
              <Text fontSize="sm" color="gray.500">
                Total: <Text as="span" fontWeight="bold" color="#7c3aed">Rs {filteredAdvances.reduce((s, a) => s + (a.amount || 0), 0).toLocaleString()}</Text>
              </Text>
            </Flex>
          )}
        </Box>
      )}

      {/* Add Advance Modal (Admin Only) */}
      {isAdmin && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent borderRadius="2xl" shadow="xl">
            <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">
              Add Advance Salary
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={5}>
              <Box bg="purple.50" borderRadius="xl" p={3} mb={4}>
                <Text fontSize="xs" color="purple.700">
                  <Text as="span" fontWeight="bold">Auto Deduction:</Text> This advance will be automatically deducted from the employee's next payroll.
                </Text>
              </Box>
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Employee</FormLabel>
                <Select
                  placeholder="Select employee..."
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="#7c3aed"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.department}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Amount (Rs)</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="#7c3aed"
                />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Date</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="#7c3aed"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Reason</FormLabel>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for advance..."
                  rows={3}
                  borderRadius="xl"
                  focusBorderColor="#7c3aed"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
              <Button variant="ghost" onClick={onClose} borderRadius="xl">Cancel</Button>
              <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl" onClick={handleAddAdvance} isLoading={submitting} loadingText="Adding">
                Add Advance
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AdvanceReport;
