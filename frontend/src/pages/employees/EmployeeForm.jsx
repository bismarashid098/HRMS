import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Heading,
    VStack,
} from "@chakra-ui/react";

import {
    getEmployees,
    saveEmployees,
    getEmployeeById,
} from "./employeeData";

const EmployeeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const [employee, setEmployee] = useState({
        name: "",
        role: "",
        phone: "",
        address: "",
        salary: "",
        status: "Active",
    });

    useEffect(() => {
        if (isEdit) {
            const emp = getEmployeeById(Number(id));
            if (emp) setEmployee(emp);
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    const handleSubmit = () => {
        const employees = getEmployees();

        if (isEdit) {
            const updated = employees.map((e) =>
                e.id === Number(id) ? employee : e
            );
            saveEmployees(updated);
        } else {
            const newEmployee = {
                ...employee,
                id: Date.now(),
            };
            saveEmployees([...employees, newEmployee]);
        }

        navigate("/employees");
    };

    return (
        <Box maxW="600px">
            <Heading size="md" mb="4">
                {isEdit ? "Edit Employee" : "Add Employee"}
            </Heading>

            <VStack spacing="4">
                <FormControl isRequired>
                    <FormLabel>Employee Name</FormLabel>
                    <Input
                        name="name"
                        value={employee.name}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select
                        name="role"
                        value={employee.role}
                        onChange={handleChange}
                    >
                        <option value="">Select Role</option>
                        <option value="Account">Account</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR</option>
                        <option value="Staff">Staff</option>
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                        name="phone"
                        value={employee.phone}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input
                        name="address"
                        value={employee.address}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Monthly Salary</FormLabel>
                    <Input
                        type="number"
                        name="salary"
                        value={employee.salary}
                        onChange={handleChange}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                        name="status"
                        value={employee.status}
                        onChange={handleChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </Select>
                </FormControl>

                <Button colorScheme="blue" onClick={handleSubmit} width="full">
                    Save Employee
                </Button>
            </VStack>
        </Box>
    );
};

export default EmployeeForm;
