import { useState, useEffect, useCallback } from "react";
import { Box, Flex, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Input, InputGroup, InputLeftElement, Icon, Spinner, Select, useToast } from "@chakra-ui/react";
import { FaSearch, FaFileExcel, FaUser, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../../api/axios";
import * as XLSX from "xlsx";

const T = { bg:"#0D1117", surface:"#161B22", surface2:"#1C2330", border:"#30363D", teal:"#00D4B4", text:"#E6EDF3", muted:"#8B949E", green:"#3FB950", red:"#FF6B6B", amber:"#F0A500" };

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

        <Box bg={T.surface} p={4} borderRadius="14px" mb={4} display="flex" gap={3} flexWrap="wrap">
          <InputGroup maxW="300px"><InputLeftElement><FaSearch color={T.muted}/></InputLeftElement><Input placeholder="Search user/action" value={search} onChange={e=>setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text}/></InputGroup>
          <Select value={actionFilter} onChange={e=>setActionFilter(e.target.value)} w="150px" bg={T.bg} borderColor={T.border} color={T.text}><option>All</option><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>LOGIN</option><option>LOGOUT</option></Select>
        </Box>

        {loading ? <Spinner /> : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto">
            <Table variant="simple">
              <Thead><Tr bg={T.surface2}><Th>User</Th><Th>Action</Th><Th>Details</Th><Th>IP Address</Th><Th>Timestamp</Th></Tr></Thead>
              <Tbody>
                {logs.map(l => (
                  <Tr key={l._id} _hover={{bg:T.surface2}}>
                    <Td><Flex align="center" gap={2}><Icon as={FaUser} color={T.muted}/><Text>{l.userName}</Text></Flex></Td>
                    <Td><Badge bg={`${actionColors[l.action] || T.muted}20`} color={actionColors[l.action] || T.muted}>{l.action}</Badge></Td>
                    <Td maxW="300px"><Text noOfLines={1} color={T.muted}>{l.details}</Text></Td>
                    <Td>{l.ipAddress}</Td>
                    <Td><Flex align="center" gap={1}><Icon as={FaClock} fontSize="10px" color={T.muted}/>{new Date(l.createdAt).toLocaleString()}</Flex></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justify="space-between" p={3} borderTop={`1px solid ${T.border}`}>
              <Text fontSize="xs" color={T.muted}>{(page-1)*limit+1} - {Math.min(page*limit,total)} of {total}</Text>
              <HStack><Button size="xs" isDisabled={page===1} onClick={()=>setPage(p=>p-1)} leftIcon={<FaChevronLeft/>}>Prev</Button><Button size="xs" isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} rightIcon={<FaChevronRight/>}>Next</Button></HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default AuditLogs;