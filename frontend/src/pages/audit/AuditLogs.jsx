import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("audit-logs")) || [];
        setLogs(data);
    }, []);

    return (
        <Box>
            <Heading size="md" mb="4">
                Audit Trail (Accounts)
            </Heading>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Time</Th>
                        <Th>Action</Th>
                        <Th>Details</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {logs.map((log) => (
                        <Tr key={log.id}>
                            <Td>{log.time}</Td>
                            <Td>{log.action}</Td>
                            <Td>{log.details}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default AuditLogs;
