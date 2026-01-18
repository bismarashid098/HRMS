import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const PayrollReport = () => {
    return (
        <Box>
            <Heading size="md" mb="4">
                Payroll Report
            </Heading>

            <Table bg="white" borderRadius="md">
                <Thead>
                    <Tr>
                        <Th>Month</Th>
                        <Th>Total Paid</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>January 2026</Td>
                        <Td>Rs. 120,000</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    );
};

export default PayrollReport;
