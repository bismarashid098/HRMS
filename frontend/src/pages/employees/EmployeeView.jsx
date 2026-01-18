import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Heading,
    Text,
    Badge,
    Button,
    Divider,
    SimpleGrid,
    VStack,
} from "@chakra-ui/react";
import employeeData from "./employeeData";

const EmployeeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const employee = employeeData.find(
        (emp) => emp.id === Number(id)
    );

    if (!employee) {
        return (
            <Box>
                <Heading size="md" color="red.500">
                    Employee Not Found
                </Heading>
                <Button mt="4" onClick={() => navigate("/employees")}>
                    Back to Employees
                </Button>
            </Box>
        );
    }

    const getStatusColor = (status) => {
        if (status === "Active") return "green";
        if (status === "Inactive") return "red";
        return "gray";
    };

    return (
        <Box>
            <Heading size="md" mb="4">
                Employee Details
            </Heading>

            <SimpleGrid columns={2} spacing={6}>
                <VStack align="start">
                    <Text>
                        <strong>Employee ID:</strong> {employee.id}
                    </Text>
                    <Text>
                        <strong>Name:</strong> {employee.name}
                    </Text>
                    <Text>
                        <strong>Role:</strong> {employee.role}
                    </Text>
                    <Text>
                        <strong>Department:</strong> {employee.department}
                    </Text>
                    <Text>
                        <strong>Status:</strong>{" "}
                        <Badge colorScheme={getStatusColor(employee.status)}>
                            {employee.status}
                        </Badge>
                    </Text>
                </VStack>

                <VStack align="start">
                    <Text>
                        <strong>Salary Type:</strong> {employee.salaryType}
                    </Text>
                    <Text>
                        <strong>Monthly Salary:</strong> Rs. {employee.salary}
                    </Text>
                    <Text>
                        <strong>Joining Date:</strong> {employee.joiningDate}
                    </Text>
                    <Text>
                        <strong>Contact:</strong> {employee.contact}
                    </Text>
                    <Text>
                        <strong>Email:</strong> {employee.email}
                    </Text>
                </VStack>
            </SimpleGrid>

            <Divider my="6" />

            <Heading size="sm" mb="3">
                Attendance & Payroll Summary
            </Heading>

            <SimpleGrid columns={3} spacing={6}>
                <Box p="4" borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">Total Working Days</Text>
                    <Text>{employee.attendance.totalDays}</Text>
                </Box>

                <Box p="4" borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">Present Days</Text>
                    <Text>{employee.attendance.present}</Text>
                </Box>

                <Box p="4" borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">Late Days</Text>
                    <Text>{employee.attendance.late}</Text>
                </Box>
            </SimpleGrid>

            <Divider my="6" />

            <Button colorScheme="blue" onClick={() => navigate("/employees")}>
                Back to Employees
            </Button>
        </Box>
    );
};

export default EmployeeView;
