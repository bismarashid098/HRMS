import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Badge,
    HStack,
    Spinner,
    Text,
    useToast,
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
    Textarea,
    Flex,
    Select
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa";

const AdvanceSalary = () => {
    const { user } = useContext(AuthContext);
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    // Default to current month/year
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    // Form State
    const [formData, setFormData] = useState({
        amount: "",
        reason: "",
        date: new Date().toISOString().split("T")[0]
    });

    const isEmployee = user?.role === "Employee";
    const isAdmin = user?.role === "Admin" || user?.role === "HR";

    const fetchAdvances = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch advances for selected month/year
            // If employee, backend should filter by user ID (or we pass it)
            // Assuming endpoint handles permissions
            let endpoint = `/advances?month=${month}&year=${year}`;
            if (isEmployee && user?.employeeId) {
                endpoint += `&employeeId=${user.employeeId}`;
            }
            
            const { data } = await api.get(endpoint);
            setAdvances(data);
        } catch (err) {
            console.error(err);
            toast({
                title: "Error fetching advances",
                description: "Failed to load advance salary records.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [month, year, isEmployee, user, toast]);

    useEffect(() => {
        fetchAdvances();
    }, [fetchAdvances]);

    const handleRequestAdvance = async () => {
        if (!formData.amount || !formData.reason || !formData.date) {
            toast({
                title: "Missing Fields",
                description: "Please fill all required fields.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (Number(formData.amount) <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Amount must be greater than 0.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/advances", {
                employeeId: user.employeeId,
                ...formData
            });
            toast({
                title: "Request Submitted",
                description: "Your advance salary request has been submitted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            setFormData({ amount: "", reason: "", date: new Date().toISOString().split("T")[0] });
            fetchAdvances();
        } catch (err) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to submit request.",
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
            await api.put(`/advances/${id}`, { status });
            toast({
                title: `Request ${status}`,
                description: `Advance request has been marked as ${status}.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchAdvances();
        } catch (err) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update status.",
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
            default: return "orange"; // Pending
        }
    };

    return (
        <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.700">Advance Salary</Heading>
                {isEmployee && (
                    <Button 
                        leftIcon={<FaPlus />} 
                        colorScheme="green" 
                        onClick={onOpen}
                    >
                        Request Advance
                    </Button>
                )}
            </Flex>

            <HStack mb={6} spacing={4}>
                <Select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    w="150px"
                    bg="white"
                >
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                </Select>
                <Select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    w="100px"
                    bg="white"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </Select>
                <Button onClick={fetchAdvances} isLoading={loading}>Filter</Button>
            </HStack>

            {loading ? (
                <Flex justify="center" align="center" h="200px"><Spinner size="xl" color="green.500" /></Flex>
            ) : advances.length === 0 ? (
                <Flex justify="center" align="center" direction="column" h="200px" bg="white" borderRadius="lg" border="1px dashed" borderColor="gray.300">
                    <Text color="gray.500">No advance requests found for this period.</Text>
                </Flex>
            ) : (
                <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                {isAdmin && <Th>Employee</Th>}
                                <Th>Date</Th>
                                <Th isNumeric>Amount</Th>
                                <Th>Reason</Th>
                                <Th>Status</Th>
                                {isAdmin && <Th>Actions</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {advances.map((adv) => (
                                <Tr key={adv._id}>
                                    {isAdmin && (
                                        <Td>
                                            <Text fontWeight="medium">{adv.employee?.user?.name || "Unknown"}</Text>
                                            <Text fontSize="xs" color="gray.500">{adv.employee?.department}</Text>
                                        </Td>
                                    )}
                                    <Td>{new Date(adv.date).toLocaleDateString()}</Td>
                                    <Td isNumeric>Rs {adv.amount.toLocaleString()}</Td>
                                    <Td maxW="200px" isTruncated title={adv.reason}>{adv.reason}</Td>
                                    <Td>
                                        <Badge colorScheme={getStatusColor(adv.status)}>
                                            {adv.status || "Pending"}
                                        </Badge>
                                    </Td>
                                    {isAdmin && (
                                        <Td>
                                            {(!adv.status || adv.status === "Pending") && (
                                                <HStack spacing={2}>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="green"
                                                        leftIcon={<FaCheck />}
                                                        onClick={() => updateStatus(adv._id, "Approved")}
                                                        isLoading={actionLoading === adv._id}
                                                        isDisabled={actionLoading && actionLoading !== adv._id}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="red"
                                                        leftIcon={<FaTimes />}
                                                        onClick={() => updateStatus(adv._id, "Rejected")}
                                                        isLoading={actionLoading === adv._id}
                                                        isDisabled={actionLoading && actionLoading !== adv._id}
                                                    >
                                                        Reject
                                                    </Button>
                                                </HStack>
                                            )}
                                        </Td>
                                    )}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* Request Advance Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader borderBottomWidth="1px">Request Advance Salary</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <FormControl mb={4} isRequired>
                            <FormLabel>Amount (Rs)</FormLabel>
                            <Input
                                type="number"
                                placeholder="e.g. 5000"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </FormControl>

                        <FormControl mb={4} isRequired>
                            <FormLabel>Required Date</FormLabel>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Reason</FormLabel>
                            <Textarea
                                placeholder="Reason for advance request..."
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
                            onClick={handleRequestAdvance} 
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

export default AdvanceSalary;
