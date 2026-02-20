import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import api from "../../api/axios";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get("/audit-logs");
                setLogs(data);
            } catch (err) {
                console.error("Error fetching audit logs:", err);
                setError("Failed to load audit logs.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <Spinner size="xl" />;
    if (error) return <Text color="red.500">{error}</Text>;

    return (
        <Box>
            <Heading size="md" mb="4">
                Audit Trail (System)
            </Heading>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Time</Th>
                        <Th>User</Th>
                        <Th>Action</Th>
                        <Th>Details</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {logs.map((log) => (
                        <Tr key={log._id}>
                            <Td>{new Date(log.createdAt).toLocaleString()}</Td>
                            <Td>{log.user?.name || "System"}</Td>
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