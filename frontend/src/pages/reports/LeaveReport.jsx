import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const LeaveReport = () => {
    return (
        <Box>
            <Heading size="md" mb="4">
                Leave Report
            </Heading>

            <Table bg="white" borderRadius="md">
                <Thead>
                    <Tr>
                        <Th>Type</Th>
                        <Th>Total</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>Casual</Td>
                        <Td>5</Td>
                    </Tr>
                    <Tr>
                        <Td>Sick</Td>
                        <Td>2</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    );
};

export default LeaveReport;
