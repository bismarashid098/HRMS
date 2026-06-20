import { useState, useEffect, useCallback } from "react";
import { Box, Flex, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Input, InputGroup, InputLeftElement, Icon, Spinner, Select, useToast } from "@chakra-ui/react";
import { FaSearch, FaFileExcel, FaUser, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../../api/axios";
import * as XLSX from "xlsx";

const T = { bg:"#F8FAFC", surface:"#FFFFFF", surface2:"#F1F5F9", border:"#E2E8F0", teal:"#0891B2", tealDim:"#0E7490", blue:"#1D4ED8", text:"#0F172A", muted:"#64748B", green:"#059669", red:"#DC2626", amber:"#D97706" };

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const toast = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs", { params: { search: search || undefined, action: actionFilter !== "All" ? actionFilter : undefined, page, limit } });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) { toast({ title: "Error loading logs", status: "error" }); }
    finally { setLoading(false); }
  }, [search, actionFilter, page, limit]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [search, actionFilter]);

  const actionColors = { CREATE: T.green, UPDATE: T.blue, DELETE: T.red, LOGIN: T.teal, LOGOUT: T.amber };
  const actionBg = { CREATE: "#DCFCE7", UPDATE: "#DBEAFE", DELETE: "#FEE2E2", LOGIN: "#E0F2FE", LOGOUT: "#FEF3C7" };

  const handleExport = () => {
    if (!logs.length) return;
    const rows = logs.map(l => ({ User: l.userName, Action: l.action, Details: l.details, IP: l.ipAddress, Timestamp: new Date(l.createdAt).toLocaleString() }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, `audit_logs_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" mb={5}>
          <Box><Text fontSize="xl" fontWeight="bold" color={T.text}>Audit Logs</Text><Text color={T.muted}>Track all system activities</Text></Box>
          <Button leftIcon={<FaFileExcel />} variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.green }} onClick={handleExport}>Export</Button>
        </Flex>

        <Box bg={T.surface} p={4} borderRadius="14px" mb={4} border="1px solid" borderColor={T.border} display="flex" gap={3} flexWrap="wrap" boxShadow="0 1px 3px rgba(0,0,0,0.05)">
          <InputGroup maxW="300px"><InputLeftElement pointerEvents="none"><Icon as={FaSearch} color={T.muted} fontSize="13px" /></InputLeftElement><Input placeholder="Search user/action" value={search} onChange={e=>setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}/></InputGroup>
          <Select value={actionFilter} onChange={e=>setActionFilter(e.target.value)} w="150px" bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}><option>All</option><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>LOGIN</option><option>LOGOUT</option></Select>
        </Box>

        {loading ? <Flex justify="center" py={10}><Spinner color={T.teal} size="xl" /></Flex> : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto" border="1px solid" borderColor={T.border} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Table variant="simple" size="sm">
              <Thead><Tr bg={T.surface2}><Th borderColor={T.border} color={T.muted}>User</Th><Th borderColor={T.border} color={T.muted}>Action</Th><Th borderColor={T.border} color={T.muted}>Details</Th><Th borderColor={T.border} color={T.muted}>IP Address</Th><Th borderColor={T.border} color={T.muted}>Timestamp</Th></Tr></Thead>
              <Tbody>
                {logs.map(l => (
                  <Tr key={l._id} _hover={{bg:T.surface2}}>
                    <Td borderColor={T.border}><Flex align="center" gap={2}><Icon as={FaUser} color={T.muted} fontSize="12px"/><Text fontSize="sm" color={T.text}>{l.userName}</Text></Flex></Td>
                    <Td borderColor={T.border}><Badge bg={actionBg[l.action] || T.surface2} color={actionColors[l.action] || T.muted} borderRadius="full" px={2} fontSize="xs">{l.action}</Badge></Td>
                    <Td borderColor={T.border} maxW="300px"><Text fontSize="sm" noOfLines={1} color={T.muted}>{l.details}</Text></Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted}>{l.ipAddress}</Td>
                    <Td borderColor={T.border}><Flex align="center" gap={1}><Icon as={FaClock} fontSize="10px" color={T.muted}/><Text fontSize="sm" color={T.muted}>{new Date(l.createdAt).toLocaleString()}</Text></Flex></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justify="space-between" align="center" px={5} py={3} borderTop="1px solid" borderColor={T.border} wrap="wrap" gap={3}>
              <Text fontSize="xs" color={T.muted}>{(page-1)*limit+1} - {Math.min(page*limit,total)} of {total}</Text>
              <HStack spacing={1}><Button size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===1} onClick={()=>setPage(p=>p-1)} leftIcon={<FaChevronLeft/>}>Prev</Button><Button size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} rightIcon={<FaChevronRight/>}>Next</Button></HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default AuditLogs;