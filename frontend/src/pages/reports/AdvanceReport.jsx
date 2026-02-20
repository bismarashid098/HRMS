import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    Button,
    Spinner,
    Text,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Badge,
    Flex,
    HStack
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdvanceReport = () => {
    const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchAdvances = async () => {
            setLoading(true);
            setError(null);
            try {
                const [year, m] = month.split("-");
                const { data } = await api.get(`/advances?month=${parseInt(m)}&year=${year}`);
                setAdvances(data);
            } catch (err) {
                console.error("Error fetching advance report:", err);
                setError("Failed to load advance report.");
            } finally {
                setLoading(false);
            }
        };

        if (month) {
            fetchAdvances();
        }
    }, [month]);

    const filteredAdvances =
        statusFilter === "All"
            ? advances
            : advances.filter(a => a.status === statusFilter);

    const totalRequests = advances.length;
    const pendingCount = advances.filter(a => a.status === "Pending").length;
    const approvedCount = advances.filter(a => a.status === "Approved").length;
    const paidCount = advances.filter(a => a.status === "Paid").length;

    const totalAmount = advances.reduce((sum, a) => sum + a.amount, 0);
    const totalPaidAmount = advances
        .filter(a => a.status === "Paid")
        .reduce((sum, a) => sum + a.amount, 0);
    const totalPendingAmount = advances
        .filter(a => a.status === "Pending" || a.status === "Approved")
        .reduce((sum, a) => sum + a.amount, 0);

    const getStatusColor = (status) => {
        if (status === "Paid") return "green";
        if (status === "Approved") return "blue";
        if (status === "Rejected") return "red";
        return "orange";
    };

    const exportExcel = () => {
        const rows = filteredAdvances.map(a => ({
            Employee: a.employee?.user?.name || "Unknown",
            Department: a.employee?.department || "N/A",
            Amount: a.amount,
            Reason: a.reason,
            Date: new Date(a.date).toLocaleDateString(),
            Status: a.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Advance Report");
        XLSX.writeFile(workbook, `Advance-Report-${month}.xlsx`);
    };

    return (
        <Box p={4}>
            <Heading mb={2} color="gray.700">
                Payroll Advance Report
            </Heading>
            <Text mb={6} color="gray.500" fontSize="sm">
                Streamlines employee financial requests by automating approvals, enforcing limits, and integrating with payroll for automatic deductions.
            </Text>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Box bg="#ECFDF5" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="green.700">
                            Total Requests
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="green.900">
                            {totalRequests}
                        </StatNumber>
                        <Text fontSize="xs" color="green.700">
                            Rs {totalAmount.toLocaleString()}
                        </Text>
                    </Stat>
                </Box>

                <Box bg="#FEF9C3" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="yellow.800">
                            Pending Approvals
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="yellow.900">
                            {pendingCount}
                        </StatNumber>
                        <Text fontSize="xs" color="yellow.800">
                            Rs {totalPendingAmount.toLocaleString()}
                        </Text>
                    </Stat>
                </Box>

                <Box bg="#E0F2FE" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="blue.800">
                            Approved
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="blue.900">
                            {approvedCount}
                        </StatNumber>
                        <Text fontSize="xs" color="blue.800">
                            Awaiting payroll deduction
                        </Text>
                    </Stat>
                </Box>

                <Box bg="#FEE2E2" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="red.800">
                            Deducted Via Payroll
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="red.900">
                            {paidCount}
                        </StatNumber>
                        <Text fontSize="xs" color="red.800">
                            Rs {totalPaidAmount.toLocaleString()}
                        </Text>
                    </Stat>
                </Box>
            </SimpleGrid>

            <Flex justify="space-between" align="center" mb={4} gap={4} wrap="wrap">
                <HStack spacing={3}>
                    <Select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        maxW="220px"
                        bg="white"
                    >
                        <option value="2026-01">January 2026</option>
                        <option value="2026-02">February 2026</option>
                        <option value="2026-03">March 2026</option>
                        <option value="2026-04">April 2026</option>
                        <option value="2026-05">May 2026</option>
                        <option value="2026-06">June 2026</option>
                    </Select>

                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        maxW="180px"
                        bg="white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                        <option value="Rejected">Rejected</option>
                    </Select>
                </HStack>

                <Button
                    colorScheme="purple"
                    onClick={exportExcel}
                    isDisabled={filteredAdvances.length === 0}
                >
                    Export Excel
                </Button>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" h="200px">
                    <Spinner size="xl" color="green.500" />
                </Flex>
            ) : error ? (
                <Text color="red.500">{error}</Text>
            ) : (
                <Box bg="white" borderRadius="lg" shadow="sm" overflowX="auto">
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Employee</Th>
                                <Th>Department</Th>
                                <Th isNumeric>Amount</Th>
                                <Th>Reason</Th>
                                <Th>Date</Th>
                                <Th>Status</Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {filteredAdvances.length === 0 ? (
                                <Tr>
                                    <Td colSpan={6} textAlign="center" py={6}>
                                        No advance records found for this filter.
                                    </Td>
                                </Tr>
                            ) : (
                                filteredAdvances.map((advance) => (
                                    <Tr key={advance._id}>
                                        <Td>{advance.employee?.user?.name}</Td>
                                        <Td>{advance.employee?.department}</Td>
                                        <Td isNumeric>Rs {advance.amount.toLocaleString()}</Td>
                                        <Td maxW="260px" isTruncated title={advance.reason}>
                                            {advance.reason}
                                        </Td>
                                        <Td>{new Date(advance.date).toLocaleDateString()}</Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(advance.status)}>
                                                {advance.status || "Pending"}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};

export default AdvanceReport;
