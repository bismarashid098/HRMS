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

import { getEmployeeById } from "./employeeData";

const EmployeeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const employee = getEmployeeById(id);

    // ❌ SAFETY CHECK
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

    const statusColor = employee.status === "Active" ? "green" : "red";

    const attendance = employee.attendance || {
        totalDays: 0,
        present: 0,
        late: 0,
    };

    return (
        <Box>
            <Heading size="md" mb="4">
                Employee Profile
            </Heading>

            {/* ================= BASIC INFO ================= */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={2}>
                    <Text><b>Employee ID:</b> {employee.id}</Text>
                    <Text><b>Name:</b> {employee.name}</Text>
                    <Text><b>Role:</b> {employee.role}</Text>
                    <Text><b>Department:</b> {employee.department}</Text>
                    <Text>
                        <b>Status:</b>{" "}
                        <Badge colorScheme={statusColor}>
                            {employee.status}
                        </Badge>
                    </Text>
                </VStack>

                <VStack align="start" spacing={2}>
                    <Text><b>Monthly Salary:</b> Rs {employee.salary}</Text>
                    <Text><b>Phone:</b> {employee.phone}</Text>
                    <Text><b>Address:</b> {employee.address}</Text>
                    <Text><b>Email:</b> {employee.email || "—"}</Text>
                    <Text><b>Joining Date:</b> {employee.joiningDate}</Text>
                </VStack>
            </SimpleGrid>

            <Divider my="6" />

            {/* ================= ATTENDANCE ================= */}
            <Heading size="sm" mb="3">
                Attendance Summary
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box borderWidth="1px" p="4" borderRadius="md">
                    <Text fontWeight="bold">Total Working Days</Text>
                    <Text>{attendance.totalDays}</Text>
                </Box>

                <Box borderWidth="1px" p="4" borderRadius="md">
                    <Text fontWeight="bold">Present Days</Text>
                    <Text>{attendance.present}</Text>
                </Box>

                <Box borderWidth="1px" p="4" borderRadius="md">
                    <Text fontWeight="bold">Late Days</Text>
                    <Text>{attendance.late}</Text>
                </Box>
            </SimpleGrid>

            <Divider my="6" />

            {/* ================= ACTIONS ================= */}
            <Button
                colorScheme="blue"
                mr="3"
                onClick={() => navigate(`/employees/edit/${employee.id}`)}
            >
                Edit Employee
            </Button>

            <Button
                variant="outline"
                onClick={() => navigate("/employees")}
            >
                Back to List
            </Button>
        </Box>
    );
};

export default EmployeeView;
