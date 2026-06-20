import { useState, useEffect, useContext } from "react";
import {
  Box, Flex, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack,
  Input, InputGroup, InputLeftElement, Icon, Avatar, Spinner, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Select,
  NumberInput, NumberInputField
} from "@chakra-ui/react";
import { FaSearch, FaPlus, FaCheck, FaTimes, FaMoneyBillWave } from "react-icons/fa";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", green: "#059669", red: "#DC2626",
  amber: "#D97706", text: "#0F172A", muted: "#64748B"
};

const statusBg = (s) =>
  s === "Approved" ? "#DCFCE7" : s === "Pending" ? "#FEF3C7" : "#FEE2E2";
const statusColor = (s) =>
  s === "Approved" ? T.green : s === "Pending" ? T.amber : T.red;

const AdvanceSalary = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({
    employeeId: "", amount: "", reason: "",
    requestedDate: new Date().toISOString().slice(0, 10)
  });

  const fetchRequests = async () => {
    try {
      const res = await api.get("/advance-salary");
      setRequests(res.data);
    } catch {
      toast({ title: "Error loading", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.amount) return toast({ title: "Required fields missing", status: "warning" });
    try {
      await api.post("/advance-salary", form);
      toast({ title: "Request submitted", status: "success" });
      fetchRequests();
      onClose();
    } catch {
      toast({ title: "Error", status: "error" });
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/advance-salary/${id}`, { status });
      toast({ title: `Request ${status}`, status: "success" });
      fetchRequests();
    } catch {
      toast({ title: "Error", status: "error" });
    }
  };

  const filtered = requests.filter(r =>
    r.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box bg={T.bg} p={5} minH="100vh">
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Flex justify="space-between" mb={5} align="center" wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color={T.text}>Advance Salary Requests</Text>
            <Text color={T.muted} fontSize="sm">Manage employee salary advances</Text>
          </Box>
          <Button leftIcon={<FaPlus />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }}
            borderRadius="10px" onClick={onOpen}>
            New Request
          </Button>
        </Flex>

        {/* Search */}
        <InputGroup maxW="300px" mb={4}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color={T.muted} fontSize="13px" />
          </InputLeftElement>
          <Input
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            bg={T.surface} borderColor={T.border} color={T.text}
            _focus={{ borderColor: T.teal }} borderRadius="10px"
          />
        </InputGroup>

        {/* Table */}
        {loading ? (
          <Flex justify="center" py={10}><Spinner color={T.teal} size="xl" /></Flex>
        ) : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto" border="1px solid" borderColor={T.border}
            boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg={T.surface2}>
                  <Th borderColor={T.border} color={T.muted}>Employee</Th>
                  <Th borderColor={T.border} color={T.muted}>Amount</Th>
                  <Th borderColor={T.border} color={T.muted}>Date</Th>
                  <Th borderColor={T.border} color={T.muted}>Reason</Th>
                  <Th borderColor={T.border} color={T.muted}>Status</Th>
                  <Th borderColor={T.border} color={T.muted}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10} color={T.muted} borderColor={T.border}>
                      No advance requests found
                    </Td>
                  </Tr>
                ) : filtered.map(req => (
                  <Tr key={req._id} _hover={{ bg: T.surface2 }}>
                    <Td borderColor={T.border}>
                      <Flex align="center" gap={2}>
                        <Avatar size="xs" name={req.employeeName} />
                        <Text fontSize="sm" color={T.text}>{req.employeeName}</Text>
                      </Flex>
                    </Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.text}>
                      Rs {req.amount?.toLocaleString()}
                    </Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted}>
                      {new Date(req.requestedDate).toLocaleDateString()}
                    </Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted} maxW="200px">
                      <Text noOfLines={2}>{req.reason}</Text>
                    </Td>
                    <Td borderColor={T.border}>
                      <Badge bg={statusBg(req.status)} color={statusColor(req.status)} borderRadius="full" px={2} py={0.5} fontSize="xs">
                        {req.status}
                      </Badge>
                    </Td>
                    <Td borderColor={T.border}>
                      <HStack spacing={1}>
                        {req.status === "Pending" && (
                          <>
                            <Button size="xs" leftIcon={<FaCheck />} bg="#DCFCE7" color={T.green}
                              border="1px solid" borderColor="#BBF7D0"
                              _hover={{ bg: T.green, color: "white" }} borderRadius="8px"
                              onClick={() => updateStatus(req._id, "Approved")}>
                              Approve
                            </Button>
                            <Button size="xs" leftIcon={<FaTimes />} bg="#FEE2E2" color={T.red}
                              border="1px solid" borderColor="#FECACA"
                              _hover={{ bg: T.red, color: "white" }} borderRadius="8px"
                              onClick={() => updateStatus(req._id, "Rejected")}>
                              Reject
                            </Button>
                          </>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay bg="rgba(15,23,42,0.4)" />
          <ModalContent bg={T.surface} borderRadius="14px" border="1px solid" borderColor={T.border}>
            <ModalHeader borderBottom="1px solid" borderColor={T.border} color={T.text} fontSize="md" fontWeight="bold">
              Advance Request
            </ModalHeader>
            <ModalCloseButton color={T.muted} />
            <ModalBody py={5}>
              <FormControl mb={4}>
                <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>Employee</FormLabel>
                <Select placeholder="Select employee" onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}>
                  <option value="emp123">John Doe</option>
                </Select>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>Amount (Rs)</FormLabel>
                <NumberInput>
                  <NumberInputField
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px"
                    _focus={{ borderColor: T.teal }}
                  />
                </NumberInput>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted}>Reason</FormLabel>
                <Input
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px"
                  _focus={{ borderColor: T.teal }} placeholder="Reason for advance..."
                />
              </FormControl>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={T.border} gap={2}>
              <Button variant="ghost" color={T.muted} _hover={{ bg: T.surface2 }} borderRadius="10px" onClick={onClose}>
                Cancel
              </Button>
              <Button bg={T.teal} color="white" _hover={{ bg: T.tealDim }} borderRadius="10px" onClick={handleSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default AdvanceSalary;
