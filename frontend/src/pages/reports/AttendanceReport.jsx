import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const AttendanceReport = () => {
    return (
        <Box>
            <Heading size="md" mb="4">
                Attendance Report
            </Heading>

            <Table bg="white" borderRadius="md">
                <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>Present</Th>
                        <Th>Absent</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>January 2026</Td>
                        <Td>22</Td>
                        <Td>3</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    );
};

export default AttendanceReport;
