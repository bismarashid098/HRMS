import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Text,
    Flex,
    Select,
    HStack,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const PayrollReport = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Assuming backend supports year param, otherwise it returns all time/current year
                const { data } = await api.get(`/dashboard/payroll-stats?year=${year}`);
                setStats(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching payroll stats:", err);
                setError("Failed to load payroll stats.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [year]);

    if (loading) return <Flex justify="center" align="center" h="400px"><Spinner size="xl" color="green.500" /></Flex>;
    if (error) return <Text color="red.500">{error}</Text>;

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const totalPaid = stats.reduce((sum, item) => sum + item.totalPaid, 0);
    const monthsWithPayroll = stats.length;
    const maxMonth = stats.reduce(
        (max, item) => (item.totalPaid > max ? item.totalPaid : max),
        0
    );
    const averageMonthly =
        monthsWithPayroll > 0 ? Math.round(totalPaid / monthsWithPayroll) : 0;

    // Format data for chart
    const chartData = stats.map(item => ({
        name: monthNames[item._id],
        amount: item.totalPaid
    }));

    return (
        <Box p={6}>
            <Heading size="lg" mb={2} color="gray.700">
                Payroll Report
            </Heading>
            <Text mb={6} color="gray.500" fontSize="sm">
                Overview of salary payouts and deductions for the selected year.
            </Text>

            <HStack mb={6} spacing={4}>
                <Select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    w="140px"
                    bg="white"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </Select>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
                <Box bg="#ECFDF5" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="green.700">
                            Total Payroll Paid
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="green.900">
                            Rs {totalPaid.toLocaleString()}
                        </StatNumber>
                        <Text fontSize="xs" color="green.700">
                            Across {monthsWithPayroll} months
                        </Text>
                    </Stat>
                </Box>

                <Box bg="#FEF9C3" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="yellow.800">
                            Average Monthly
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="yellow.900">
                            Rs {averageMonthly.toLocaleString()}
                        </StatNumber>
                        <Text fontSize="xs" color="yellow.800">
                            Based on recorded months
                        </Text>
                    </Stat>
                </Box>

                <Box bg="#E0F2FE" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="blue.800">
                            Highest Monthly Payout
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="blue.900">
                            Rs {maxMonth.toLocaleString()}
                        </StatNumber>
                        <Text fontSize="xs" color="blue.800">
                            Peak payout in {year}
                        </Text>
                    </Stat>
                </Box>

                <Box bg="#FEE2E2" borderRadius="lg" p={4}>
                    <Stat>
                        <StatLabel fontSize="xs" textTransform="uppercase" color="red.800">
                            Months Without Payroll
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="red.900">
                            {12 - monthsWithPayroll}
                        </StatNumber>
                        <Text fontSize="xs" color="red.800">
                            Months with no records
                        </Text>
                    </Stat>
                </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                {/* Chart Section */}
                <Box bg="white" p={4} borderRadius="lg" shadow="sm" h="400px">
                    <Heading size="md" mb={4} color="gray.600">Monthly Payout Trend</Heading>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                            <Area type="monotone" dataKey="amount" stroke="#48BB78" fill="#C6F6D5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>

                {/* Table Section */}
                <Box bg="white" p={4} borderRadius="lg" shadow="sm">
                    <Heading size="md" mb={4} color="gray.600">Monthly Breakdown</Heading>
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Month</Th>
                                <Th isNumeric>Total Paid</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {stats.length === 0 ? (
                                <Tr>
                                    <Td colSpan={2} textAlign="center" py={4}>No payroll data found for this year.</Td>
                                </Tr>
                            ) : (
                                stats.map((item) => (
                                    <Tr key={item._id}>
                                        <Td>{monthNames[item._id]}</Td>
                                        <Td isNumeric fontWeight="bold" color="green.600">Rs. {item.totalPaid.toLocaleString()}</Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default PayrollReport;
