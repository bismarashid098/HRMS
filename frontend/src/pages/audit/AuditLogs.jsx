import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text,
  Badge, Input, Select, InputGroup, InputLeftElement, Icon, Avatar
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import { FaSearch, FaShieldAlt, FaHistory } from "react-icons/fa";

const actionColors = {
  CREATE: "green", UPDATE: "blue", DELETE: "red",
  LOGIN: "purple", LOGOUT: "orange", APPROVE: "teal", REJECT: "red"
};

const getActionColor = (action = "") => {
  const key = Object.keys(actionColors).find((k) => action.toUpperCase().includes(k));
  return actionColors[key] || "gray";
};

const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[(name || "").charCodeAt(0) % avatarBgColors.length];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get("/audit-logs");
        setLogs(data);
      } catch { setError("Failed to load audit logs."); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  const uniqueActions = useMemo(() => Array.from(new Set(logs.map((l) => l.action).filter(Boolean))).sort(), [logs]);

  const filteredLogs = useMemo(() =>
    logs.filter((log) => {
      if (actionFilter !== "All" && log.action !== actionFilter) return false;
      const q = search.trim().toLowerCase();
      if (q) {
        const user = (log.user?.name || "System").toLowerCase();
        const action = (log.action || "").toLowerCase();
        const details = (log.details || "").toLowerCase();
        if (!user.includes(q) && !action.includes(q) && !details.includes(q)) return false;
      }
      return true;
    }), [logs, search, actionFilter]);

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #374151 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" position="relative">
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FaShieldAlt} color="whiteAlpha.700" fontSize="16px" />
              <Text fontSize="sm" color="whiteAlpha.600">System</Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="white">Audit Trail</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Complete log of all system actions and user activities</Text>
          </Box>
          <Flex align="center" gap={2} bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
            <Icon as={FaHistory} color="white" fontSize="14px" />
            <Text fontSize="sm" color="white" fontWeight="semibold">{logs.length} total logs</Text>
          </Flex>
        </Flex>
      </Box>

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} wrap="wrap" align="center">
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="13px" /></InputLeftElement>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user, action or details..."
              borderRadius="xl" bg="gray.50" fontSize="sm" focusBorderColor="#374151" />
          </InputGroup>
          <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} w="200px" borderRadius="xl" fontSize="sm" focusBorderColor="#374151">
            <option value="All">All Actions</option>
            {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          {(search || actionFilter !== "All") && (
            <Text fontSize="xs" color="gray.400" cursor="pointer" onClick={() => { setSearch(""); setActionFilter("All"); }} _hover={{ color: "gray.600" }} textDecor="underline">Clear</Text>
          )}
        </Flex>
        <Text mt={2} fontSize="xs" color="gray.400">Showing {filteredLogs.length} of {logs.length} entries</Text>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#374151" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading audit logs...</Text>
        </Flex>
      ) : error ? (
        <Box bg="red.50" borderRadius="xl" p={6}><Text color="red.500">{error}</Text></Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Timestamp</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">User</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Action</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.length === 0 ? (
                  <Tr><Td colSpan={4} textAlign="center" py={12} color="gray.400">No audit logs found.</Td></Tr>
                ) : filteredLogs.map((log) => {
                  const userName = log.user?.name || "System";
                  const dt = new Date(log.createdAt);
                  return (
                    <Tr key={log._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      <Td py={3} whiteSpace="nowrap">
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">{dt.toLocaleDateString()}</Text>
                        <Text fontSize="xs" color="gray.400">{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                      </Td>
                      <Td py={3}>
                        <Flex align="center" gap={2}>
                          <Avatar size="xs" name={userName} bg={getAvatarBg(userName)} color="white" fontSize="10px" />
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{userName}</Text>
                        </Flex>
                      </Td>
                      <Td py={3}>
                        <Badge colorScheme={getActionColor(log.action)} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{log.action}</Badge>
                      </Td>
                      <Td py={3} maxW="300px">
                        <Text fontSize="sm" color="gray.600" noOfLines={2} title={log.details}>{log.details || "—"}</Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AuditLogs;
