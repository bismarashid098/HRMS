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
} from "@chakra-ui/react";

import * as XLSX from "xlsx";
import { getEmployees } from "../employees/employeeData";
import { useState } from "react";

const AdvanceReport = () => {
    const [month, setMonth] = useState("2026-01");
    const employees = getEmployees();

    const rows = employees.flatMap((emp) =>
        emp.advanceHistory
            .filter((a) => a.month === month)
            .map((a) => ({
                name: emp.name,
                amount: a.amount,
                reason: a.reason,
                date: a.date,
            }))
    );

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Advance Report");
        XLSX.writeFile(workbook, `Advance-Report-${month}.xlsx`);
    };

    return (
        <Box>
            <Heading mb="5">Advance History Report</Heading>

            <Select
                mb="4"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
            >
                <option value="2026-01">January 2026</option>
                <option value="2026-02">February 2026</option>
            </Select>

            <Button mb="4" colorScheme="purple" onClick={exportExcel}>
                Export Excel
            </Button>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Employee</Th>
                        <Th>Advance Amount</Th>
                        <Th>Reason</Th>
                        <Th>Date</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {rows.length === 0 && (
                        <Tr>
                            <Td colSpan={4}>No advance records</Td>
                        </Tr>
                    )}

                    {rows.map((row, index) => (
                        <Tr key={index}>
                            <Td>{row.name}</Td>
                            <Td>Rs {row.amount}</Td>
                            <Td>{row.reason}</Td>
                            <Td>{row.date}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default AdvanceReport;
