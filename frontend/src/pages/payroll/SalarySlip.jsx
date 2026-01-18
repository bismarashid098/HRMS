import {
    Box,
    Heading,
    Text,
    Table,
    Tr,
    Td,
    Tbody,
    Badge,
    Divider,
    Button,
} from "@chakra-ui/react";

import jsPDF from "jspdf";
import { calculateSalary } from "../../utils/salaryCalculator";

const SalarySlip = ({ employee, attendance, month }) => {
    const salary = calculateSalary(employee, attendance);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Salary Slip", 80, 15);

        doc.setFontSize(11);
        doc.text(`Month: ${month}`, 20, 30);
        doc.text(`Employee Name: ${employee.name}`, 20, 40);
        doc.text(`Role: ${employee.role}`, 20, 48);

        doc.line(20, 55, 190, 55);

        doc.text(`Basic Salary: Rs ${salary.baseSalary}`, 20, 65);
        doc.text(`Deductions: Rs ${salary.deduction}`, 20, 75);
        doc.text(`Net Salary: Rs ${salary.netSalary}`, 20, 85);

        doc.line(20, 95, 190, 95);

        doc.text("This is a system generated salary slip.", 20, 110);
        doc.text("HRMS Payroll Department", 20, 120);

        doc.save(`${employee.name}-Salary-Slip-${month}.pdf`);
    };

    return (
        <Box bg="white" p="6" borderRadius="md" boxShadow="md">
            <Heading size="md" mb="2">
                Salary Slip – {month}
            </Heading>

            <Text><b>Employee:</b> {employee.name}</Text>
            <Text><b>Role:</b> {employee.role}</Text>

            <Divider my="3" />

            <Table size="sm">
                <Tbody>
                    <Tr>
                        <Td>Basic Salary</Td>
                        <Td>Rs {salary.baseSalary}</Td>
                    </Tr>

                    <Tr>
                        <Td>Deductions</Td>
                        <Td color="red.500">- Rs {salary.deduction}</Td>
                    </Tr>

                    <Tr>
                        <Td><b>Net Salary</b></Td>
                        <Td>
                            <Badge colorScheme="green">
                                Rs {salary.netSalary}
                            </Badge>
                        </Td>
                    </Tr>
                </Tbody>
            </Table>

            <Button
                mt="4"
                colorScheme="blue"
                onClick={generatePDF}
            >
                Download PDF
            </Button>
        </Box>
    );
};

export default SalarySlip;
