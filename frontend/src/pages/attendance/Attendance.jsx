import { useState } from "react";
import {
    Box,
    Heading,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    Badge,
} from "@chakra-ui/react";

import { getEmployees } from "../employees/employeeData";

const Attendance = () => {
    const employees = getEmployees();

    const [records, setRecords] = useState(
        employees.map((emp) => ({
            employeeId: emp.id,
            name: emp.name,
            date: "18/01/2026",
            status: "PRESENT",
        }))
    );

    const updateStatus = (id, status) => {
        const updated = records.map((r) =>
            r.employeeId === id ? { ...r, status } : r
        );
        setRecords(updated);

        // 🔥 Payroll dirty mark
        localStorage.setItem("payroll-dirty", "true");
        localStorage.setItem("attendance-records", JSON.stringify(updated));
    };

    const color = (status) => {
        if (status === "PRESENT") return "green";
        if (status === "LATE") return "yellow";
        if (status === "HALF DAY") return "orange";
        return "red";
    };

    return (
        <Box>
            <Heading size="md" mb="4">
                Attendance (Accounts Control)
            </Heading>

            <Table>
                <Thead>
                    <Tr>
                        <Th>Employee</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Edit</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {records.map((r) => (
                        <Tr key={r.employeeId}>
                            <Td>{r.name}</Td>
                            <Td>{r.date}</Td>
                            <Td>
                                <Badge colorScheme={color(r.status)}>{r.status}</Badge>
                            </Td>
                            <Td>
                                <Select
                                    value={r.status}
                                    onChange={(e) =>
                                        updateStatus(r.employeeId, e.target.value)
                                    }
                                >
                                    <option>PRESENT</option>
                                    <option>LATE</option>
                                    <option>HALF DAY</option>
                                    <option>ABSENT</option>
                                </Select>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default Attendance;
