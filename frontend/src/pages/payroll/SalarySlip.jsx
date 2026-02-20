import { Box, Button, Heading, Text, Divider, VStack } from "@chakra-ui/react";
import jsPDF from "jspdf";

const SalarySlip = ({ employee, month }) => {
    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("SALARY SLIP", 80, 15);

        doc.setFontSize(11);
        doc.text(`Month: ${month}`, 14, 25);

        doc.line(14, 28, 196, 28);

        doc.text(`Employee Name: ${employee.name}`, 14, 38);
        doc.text(`Role: ${employee.role}`, 14, 46);
        doc.text(`Department: ${employee.department}`, 14, 54);

        doc.line(14, 58, 196, 58);

        doc.text(`Basic Salary: Rs ${employee.basicSalary}`, 14, 68);
        doc.text(`Advance Deduction: Rs ${employee.advance}`, 14, 76);
        doc.text(`Late Deduction: Rs ${employee.lateDeduction}`, 14, 84);

        doc.line(14, 90, 196, 90);

        doc.setFontSize(13);
        doc.text(
            `Final Salary: Rs ${employee.finalSalary}`,
            14,
            102
        );

        doc.line(14, 108, 196, 108);

        doc.setFontSize(10);
        doc.text("This is a system generated salary slip.", 14, 118);

        doc.save(`${employee.name}-SalarySlip-${month}.pdf`);
    };

    return (
        <Box borderWidth="1px" p="4" borderRadius="md">
            <VStack align="start" spacing="2">
                <Heading size="sm">Salary Slip</Heading>
                <Text><b>Name:</b> {employee.name}</Text>
                <Text><b>Month:</b> {month}</Text>
                <Text><b>Final Salary:</b> Rs {employee.finalSalary}</Text>

                <Divider />

                <Button colorScheme="blue" onClick={generatePDF}>
                    Download PDF
                </Button>
            </VStack>
        </Box>
    );
};

export default SalarySlip;
