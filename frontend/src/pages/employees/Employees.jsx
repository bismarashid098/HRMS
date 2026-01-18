import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getEmployees, saveEmployees } from "./employeeData";

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        setEmployees(getEmployees());
    }, []);

    const deleteEmployee = (id) => {
        const updated = employees.filter((e) => e.id !== id);
        saveEmployees(updated);
        setEmployees(updated);
    };

    return (
        <Box>
            <Heading size="md" mb="4">
                Employees
            </Heading>

            <Button
                colorScheme="blue"
                mb="4"
                onClick={() => navigate("/employees/add")}
            >
                Add Employee
            </Button>

            {employees.length === 0 ? (
                <Text>No employees found</Text>
            ) : (
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Role</Th>
                            <Th>Phone</Th>
                            <Th>Status</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {employees.map((emp) => (
                            <Tr key={emp.id}>
                                <Td>{emp.name}</Td>
                                <Td>{emp.role}</Td>
                                <Td>{emp.phone}</Td>
                                <Td>{emp.status}</Td>
                                <Td>
                                    <Button
                                        size="sm"
                                        mr="2"
                                        onClick={() =>
                                            navigate(`/employees/view/${emp.id}`)
                                        }
                                    >
                                        View
                                    </Button>

                                    <Button
                                        size="sm"
                                        mr="2"
                                        onClick={() =>
                                            navigate(`/employees/edit/${emp.id}`)
                                        }
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => deleteEmployee(emp.id)}
                                    >
                                        Delete
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </Box>
    );
};

export default Employees;
