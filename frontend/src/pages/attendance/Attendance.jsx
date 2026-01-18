import { useState } from "react";
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
    Select,
    Badge,
    Text,
} from "@chakra-ui/react";

import { markPayrollDirty } from "../../utils/payrollUtils";
import { logAudit } from "../../utils/auditLogger";

const CURRENT_MONTH = "2026-01";

const getStatusColor = (status) => {
    if (status === "PRESENT") return "green";
    if (status === "LATE") return "yellow";
    if (status === "HALF DAY") return "orange";
    return "red";
};

const Attendance = () => {
    const payrollLocked =
        localStorage.getItem(`payroll-lock-${CURRENT_MONTH}`) === "LOCKED";

    const [records, setRecords] = useState([
        { id: 1, date: "16/01/2026", time: "09:05", status: "PRESENT" },
        { id: 2, date: "16/01/2026", time: "09:30", status: "LATE" },
    ]);

    const markAttendance = () => {
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);

        const newRecord = {
            id: Date.now(),
            date: now.toLocaleDateString(),
            time,
            status: "PRESENT",
        };

        setRecords((prev) => [newRecord, ...prev]);

        logAudit("Attendance Marked", `Marked at ${time}`);
    };

    const updateStatus = (id, newStatus) => {
        setRecords((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );

        logAudit("Attendance Updated", `Record ${id} → ${newStatus}`);

        if (payrollLocked) {
            markPayrollDirty(CURRENT_MONTH);
        }
    };

    return (
        <Box>
            <Heading size="md" mb="2">
                Attendance (Accounts Control)
            </Heading>

            {payrollLocked && (
                <Text color="red.500" mb="3" fontSize="sm">
                    Payroll locked. Changes will require recalculation.
                </Text>
            )}

            <Button colorScheme="green" mb="4" onClick={markAttendance}>
                Mark Attendance
            </Button>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>Time</Th>
                        <Th>Status</Th>
                        <Th>Manual Edit</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {records.map((rec) => (
                        <Tr key={rec.id}>
                            <Td>{rec.date}</Td>
                            <Td>{rec.time}</Td>
                            <Td>
                                <Badge colorScheme={getStatusColor(rec.status)}>
                                    {rec.status}
                                </Badge>
                            </Td>
                            <Td>
                                <Select
                                    size="sm"
                                    value={rec.status}
                                    onChange={(e) =>
                                        updateStatus(rec.id, e.target.value)
                                    }
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="LATE">Late</option>
                                    <option value="HALF DAY">Half Day</option>
                                    <option value="ABSENT">Absent</option>
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
