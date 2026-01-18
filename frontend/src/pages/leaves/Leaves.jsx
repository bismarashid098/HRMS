import {
    Box,
    Button,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Heading,
    HStack,
    Select,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";

const Leaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [type, setType] = useState("");
    const [reason, setReason] = useState("");

    const applyLeave = () => {
        if (!type || !reason) return;

        setLeaves([
            {
                id: Date.now(),
                type,
                reason,
                status: "Pending",
            },
            ...leaves,
        ]);

        setType("");
        setReason("");
    };

    const updateStatus = (id, status) => {
        setLeaves(
            leaves.map((l) =>
                l.id === id ? { ...l, status } : l
            )
        );
    };

    const badgeColor = (status) => {
        if (status === "Approved") return "green";
        if (status === "Rejected") return "red";
        return "yellow";
    };

    return (
        <Box>
            <Heading size="md" mb="4">
                Leave Management
            </Heading>

            {/* Apply Leave */}
            <VStack align="start" spacing="3" mb="6">
                <HStack>
                    <Select
                        placeholder="Leave Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option>Casual</option>
                        <option>Sick</option>
                        <option>Annual</option>
                    </Select>

                    <Input
                        placeholder="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />

                    <Button colorScheme="blue" onClick={applyLeave}>
                        Apply
                    </Button>
                </HStack>
            </VStack>

            {/* Leave List */}
            <Table bg="white" borderRadius="md">
                <Thead>
                    <Tr>
                        <Th>Type</Th>
                        <Th>Reason</Th>
                        <Th>Status</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {leaves.map((leave) => (
                        <Tr key={leave.id}>
                            <Td>{leave.type}</Td>
                            <Td>{leave.reason}</Td>
                            <Td>
                                <Badge colorScheme={badgeColor(leave.status)}>
                                    {leave.status}
                                </Badge>
                            </Td>
                            <Td>
                                <HStack>
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        onClick={() => updateStatus(leave.id, "Approved")}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => updateStatus(leave.id, "Rejected")}
                                    >
                                        Reject
                                    </Button>
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default Leaves;
