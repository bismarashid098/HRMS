import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
    Box,
    Heading,
    Text,
    Badge,
    Button,
    Divider,
    SimpleGrid,
    VStack,
    Spinner,
    Center,
    HStack
} from "@chakra-ui/react";
import api from "../../api/axios";

const EmployeeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isManager = user?.role === "Manager";
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const { data } = await api.get(`/employees/${id}`);
                setEmployee(data);
            } catch {
                setError("Failed to fetch employee details");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <Center h="200px">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (error || !employee) {
        return (
            <Box p={5}>
                <Heading size="md" color="red.500">
                    {error || "Employee Not Found"}
                </Heading>
                <Button mt="4" onClick={() => navigate("/dashboard/employees")}>
                    Back to Employees
                </Button>
            </Box>
        );
    }

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

    return (
        <Box p={5} bg="white" shadow="md" borderRadius="md">
            <Heading size="lg" mb="6">
                Employee Profile
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <VStack align="start" spacing={4}>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Employee ID</Text>
                        <Text fontSize="lg">{employee.employeeId}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Name</Text>
                        <Text fontSize="lg">{employee.user?.name}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Role</Text>
                        <Text fontSize="lg">{employee.designation}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Department</Text>
                        <Text fontSize="lg">{employee.department}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Status</Text>
                        <Badge colorScheme={getStatusColor(employee.employmentStatus)} fontSize="md" px={2} py={1} borderRadius="md">
                            {employee.employmentStatus}
                        </Badge>
                    </Box>
                </VStack>

                <VStack align="start" spacing={4}>
                    {!isManager && (
                        <Box>
                            <Text fontWeight="bold" color="gray.500">Basic Salary</Text>
                            <Text fontSize="lg">Rs {employee.salary?.basic}</Text>
                        </Box>
                    )}
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Phone</Text>
                        <Text fontSize="lg">{employee.phone || "N/A"}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Address</Text>
                        <Text fontSize="lg">{employee.address || "N/A"}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Email</Text>
                        <Text fontSize="lg">{employee.user?.email || "N/A"}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" color="gray.500">Joining Date</Text>
                        <Text fontSize="lg">
                            {new Date(employee.joiningDate).toLocaleDateString()}
                        </Text>
                    </Box>
                </VStack>
            </SimpleGrid>

            <Divider my="8" />

            <Box mb="6">
                <Heading size="md" mb="4">
                    Linked Modules
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>
                            Attendance
                        </Text>
                        <HStack spacing={3}>
                            <Button
                                size="sm"
                                colorScheme="green"
                                variant="solid"
                                onClick={() =>
                                    navigate(`/dashboard/attendance?employeeId=${employee._id}`)
                                }
                            >
                                Attendance Ledger
                            </Button>
                        </HStack>
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>
                            Leaves
                        </Text>
                        <HStack spacing={3}>
                            <Button
                                size="sm"
                                variant="outline"
                                colorScheme="green"
                                onClick={() => navigate("/dashboard/leaves")}
                            >
                                Leave Records
                            </Button>
                        </HStack>
                    </Box>
                    {!isManager && (
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                Advances and Payroll
                            </Text>
                            <HStack spacing={3}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => navigate("/dashboard/reports/advances")}
                                >
                                    Advance / Loan Ledger
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => navigate("/dashboard/reports/payroll")}
                                >
                                    Payroll History
                                </Button>
                            </HStack>
                        </Box>
                    )}
                </SimpleGrid>
            </Box>

            <Box>
                {!isManager && (
                    <Button
                        colorScheme="blue"
                        mr="3"
                        onClick={() => navigate(`/dashboard/employees/edit/${employee._id}`)}
                    >
                        Edit Employee
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/employees")}
                >
                    Back to List
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeView;
