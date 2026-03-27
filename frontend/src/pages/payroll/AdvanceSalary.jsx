import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, HStack,
  Spinner, Text, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl,
  FormLabel, Input, Textarea, Select, Grid, Icon, Avatar, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { FaCheck, FaTimes, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle, FaPlus, FaSearch } from "react-icons/fa";

const statusColors = { Approved: "green", Rejected: "red", Pending: "orange" };
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

const AdvanceSalary = () => {
  const { user } = useContext(AuthContext);
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [formData, setFormData] = useState({
    employeeId: "",
    amount: "",
    reason: "",
    date: new Date().toISOString().split("T")[0]
  });

  const [search, setSearch] = useState("");
  const isAdmin = user?.role === "Admin";

  const fetchAdvances = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/advances?month=${month}&year=${year}`);
      setAdvances(data);
    } catch {
      toast({ title: "Error fetching advances", status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [month, year, toast]);

  useEffect(() => { fetchAdvances(); }, [fetchAdvances]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/employees").then(({ data }) => setEmployees(data)).catch(() => {});
  }, [isAdmin]);

  const handleRequestAdvance = async () => {
    const empId = isAdmin ? formData.employeeId : user.employeeId;
    if (!empId || !formData.amount || !formData.reason || !formData.date) {
      toast({ title: "Fill all required fields", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast({ title: "Amount must be greater than 0", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/advances", { employeeId: empId, amount: formData.amount, reason: formData.reason, date: formData.date });
      toast({ title: isAdmin ? "Advance Added" : "Request Submitted", description: "Will be deducted from next payroll", status: "success", duration: 3000, isClosable: true });
      onClose();
      setFormData({ employeeId: "", amount: "", reason: "", date: new Date().toISOString().split("T")[0] });
      fetchAdvances();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed.", status: "error", duration: 3000, isClosable: true });
    } finally { setSubmitting(false); }
  };

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.put(`/advances/${id}`, { status });
      toast({ title: `Request ${status}`, status: "success", duration: 3000, isClosable: true });
      fetchAdvances();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed.", status: "error", duration: 3000, isClosable: true });
    } finally { setActionLoading(null); }
  };

  const filteredAdvances = isAdmin && search.trim()
    ? advances.filter((a) => {
        const q = search.trim().toLowerCase();
        const name = (a.employee?.name || a.employee?.user?.name || "").toLowerCase();
        const dept = (a.employee?.department || "").toLowerCase();
        return name.includes(q) || dept.includes(q);
      })
    : advances;

  const totalAmount = advances.reduce((sum, a) => sum + (a.amount || 0), 0);
  const pending  = advances.filter((a) => !a.status || a.status === "Pending").length;
  const approved = advances.filter((a) => a.status === "Approved").length;
  const rejected = advances.filter((a) => a.status === "Rejected").length;

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #7c3aed 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Advance Salary</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Manage advance salary requests — auto deducted from payroll</Text>
          </Box>
          <Button
            leftIcon={<FaPlus />}
            bg="whiteAlpha.200"
            color="white"
            _hover={{ bg: "whiteAlpha.300" }}
            borderRadius="xl"
            size="sm"
            border="1px solid"
            borderColor="whiteAlpha.300"
            onClick={onOpen}
          >
            {isAdmin ? "Add Advance" : "Request Advance"}
          </Button>
        </Flex>
      </Box>

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} align="flex-end" wrap="wrap">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Month</Text>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} w="160px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed">
              {monthNames.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Year</Text>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))} w="110px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed">
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </Select>
          </Box>
          <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl" size="md" onClick={fetchAdvances} isLoading={loading}>Filter</Button>
          {isAdmin && (
            <Box flex={1} minW="200px">
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Search Employee</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FaSearch} color="gray.300" fontSize="12px" />
                </InputLeftElement>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or department..."
                  borderRadius="xl"
                  fontSize="sm"
                  focusBorderColor="#7c3aed"
                  bg="gray.50"
                />
              </InputGroup>
            </Box>
          )}
        </Flex>
        {isAdmin && search && (
          <Text mt={2} fontSize="xs" color="gray.400">
            Showing results for "{search}"
          </Text>
        )}
      </Box>

      {/* Stats */}
      {advances.length > 0 && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={4}>
          <StatCard label="Total Requests" value={advances.length} color="#7c3aed" bg="#f5f3ff" icon={FaMoneyBillWave} />
          <StatCard label="Pending" value={pending} color="#d97706" bg="#fffbeb" icon={FaClock} />
          <StatCard label="Approved" value={approved} color="#065f46" bg="#f0fdf4" icon={FaCheckCircle} />
          <StatCard label="Rejected" value={rejected} color="#dc2626" bg="#fef2f2" icon={FaTimesCircle} />
        </Grid>
      )}

      {/* Info note */}
      <Box bg="purple.50" border="1px solid" borderColor="purple.100" borderRadius="xl" px={4} py={2.5} mb={4}>
        <Text fontSize="xs" color="purple.700">
          <Text as="span" fontWeight="bold">Auto Deduction:</Text> Approved advances are automatically deducted from net salary when payroll is generated.
        </Text>
      </Box>

      {/* Table */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#7c3aed" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading advance requests...</Text>
        </Flex>
      ) : advances.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm" border="1px dashed" borderColor="gray.200">
          <Icon as={FaMoneyBillWave} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No advance requests for {monthNames[month]} {year}.</Text>
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  {isAdmin && <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>}
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Date</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Amount</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Reason</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  {isAdmin && <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Actions</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {filteredAdvances.length === 0 ? (
                  <Tr><Td colSpan={6} textAlign="center" color="gray.400" py={8}>
                    No results found for "{search}"
                  </Td></Tr>
                ) : filteredAdvances.map((adv) => {
                  const name = adv.employee?.name || adv.employee?.user?.name || "Unknown";
                  return (
                    <Tr key={adv._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      {isAdmin && (
                        <Td py={3}>
                          <Flex align="center" gap={3}>
                            <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                              <Text fontSize="xs" color="gray.400">{adv.employee?.department}</Text>
                            </Box>
                          </Flex>
                        </Td>
                      )}
                      <Td py={3}><Text fontSize="sm" color="gray.700">{new Date(adv.date).toLocaleDateString()}</Text></Td>
                      <Td py={3} isNumeric><Text fontSize="sm" fontWeight="bold" color="#7c3aed">Rs {adv.amount?.toLocaleString()}</Text></Td>
                      <Td py={3} maxW="200px">
                        <Text fontSize="sm" color="gray.600" noOfLines={2} title={adv.reason}>{adv.reason}</Text>
                      </Td>
                      <Td py={3}>
                        <Badge colorScheme={statusColors[adv.status] || "orange"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{adv.status || "Pending"}</Badge>
                      </Td>
                      {isAdmin && (
                        <Td py={3}>
                          {(!adv.status || adv.status === "Pending") && (
                            <HStack spacing={1}>
                              <Button size="xs" colorScheme="green" leftIcon={<FaCheck />} borderRadius="lg"
                                onClick={() => updateStatus(adv._id, "Approved")} isLoading={actionLoading === adv._id}
                                isDisabled={actionLoading && actionLoading !== adv._id}>Approve</Button>
                              <Button size="xs" colorScheme="red" leftIcon={<FaTimes />} borderRadius="lg"
                                onClick={() => updateStatus(adv._id, "Rejected")} isLoading={actionLoading === adv._id}
                                isDisabled={actionLoading && actionLoading !== adv._id}>Reject</Button>
                            </HStack>
                          )}
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
          {totalAmount > 0 && (
            <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100" justify="flex-end">
              <Text fontSize="sm" color="gray.500">Total Amount: <Text as="span" fontWeight="bold" color="#7c3aed">Rs {totalAmount.toLocaleString()}</Text></Text>
            </Flex>
          )}
        </Box>
      )}

      {/* Add/Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl" shadow="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">
            {isAdmin ? "Add Advance Salary" : "Request Advance Salary"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <Box bg="purple.50" borderRadius="xl" p={3} mb={4}>
              <Text fontSize="xs" color="purple.700">
                <Text as="span" fontWeight="bold">Auto Deduction:</Text> Advance will be deducted from payroll automatically.
              </Text>
            </Box>
            {isAdmin && (
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
            )}
            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Amount (Rs)</FormLabel>
              <Input type="number" placeholder="e.g. 5000" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} borderRadius="xl" focusBorderColor="#7c3aed" />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Required Date</FormLabel>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} borderRadius="xl" focusBorderColor="#7c3aed" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Reason</FormLabel>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for advance request..." rows={3} borderRadius="xl" focusBorderColor="#7c3aed" />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
            <Button variant="ghost" onClick={onClose} borderRadius="xl">Cancel</Button>
            <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl" onClick={handleRequestAdvance} isLoading={submitting} loadingText="Submitting">
              {isAdmin ? "Add Advance" : "Submit Request"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvanceSalary;
