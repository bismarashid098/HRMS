import { useState, useEffect, useCallback, useContext } from "react";
import {
  Box, Flex, Grid, Text, Button, useToast, Select, Input,
  Spinner, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack,
  Icon, InputGroup, InputLeftElement, Avatar
} from "@chakra-ui/react";
import {
  FaSearch, FaFileExcel, FaMoneyBillWave, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt
} from "react-icons/fa";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../context/AuthContext";

const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", green: "#059669", red: "#DC2626", amber: "#D97706",
  text: "#0F172A", muted: "#64748B"
};

const StatCard = ({ label, value, color, icon }) => (
  <Box bg={T.surface} p={4} borderRadius="14px" border={`1px solid ${T.border}`} _hover={{ borderColor: color }}>
    <Flex justify="space-between"><Text fontSize="xs" color={T.muted}>{label}</Text><Icon as={icon} color={color} /></Flex>
    <Text fontSize="2xl" fontWeight="bold" color={T.text}>{value}</Text>
  </Box>
);

const AdvanceReport = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const isAdmin = user?.role === "Admin";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalRequests:0, approved:0, rejected:0, pending:0, totalAmount:0 });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/advances", {
        params: {
          search: search || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
          page, limit
        }
      });
      setRequests(res.data.records || []);
      setTotal(res.data.total || 0);
      setSummary(res.data.summary || { totalRequests:0, approved:0, rejected:0, pending:0, totalAmount:0 });
    } catch (err) {
      toast({ title: "Error loading advance report", status: "error" });
    } finally { setLoading(false); }
  }, [search, statusFilter, fromDate, toDate, page, limit]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => { setPage(1); }, [search, statusFilter, fromDate, toDate]);

  const handleExport = () => {
    if (!requests.length) return;
    const rows = requests.map(r => ({
      Employee: r.employeeName,
      Amount: r.amount,
      "Request Date": new Date(r.requestedDate).toLocaleDateString(),
      "Approved Date": r.approvedDate ? new Date(r.approvedDate).toLocaleDateString() : "",
      Reason: r.reason,
      Status: r.status
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Advance Report");
    XLSX.writeFile(wb, `advance_report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" align="center" mb={5}>
          <Box><Text fontSize="xl" fontWeight="700" color={T.text}>Advance Salary Report</Text><Text fontSize="sm" color={T.muted}>Track employee advance requests and approvals</Text></Box>
          <Button leftIcon={<FaFileExcel />} variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.green }} onClick={handleExport} disabled={!requests.length}>Export Excel</Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }} gap={4} mb={5}>
          <StatCard label="Total Requests" value={summary.totalRequests} color={T.teal} icon={FaMoneyBillWave} />
          <StatCard label="Approved" value={summary.approved} color={T.green} icon={FaCheckCircle} />
          <StatCard label="Rejected" value={summary.rejected} color={T.red} icon={FaTimesCircle} />
          <StatCard label="Pending" value={summary.pending} color={T.amber} icon={FaClock} />
        </Grid>

        <Box bg={T.surface} borderRadius="14px" p={4} mb={4} border={`1px solid ${T.border}`}>
          <Flex gap={3} wrap="wrap">
            <InputGroup flex="1" minW="200px"><InputLeftElement><Icon as={FaSearch} color={T.muted} /></InputLeftElement><Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} /></InputGroup>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="150px" bg={T.bg} borderColor={T.border} color={T.text}><option value="All">All Status</option><option value="Approved">Approved</option><option value="Pending">Pending</option><option value="Rejected">Rejected</option></Select>
            <Input type="date" placeholder="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} w="160px" bg={T.bg} borderColor={T.border} color={T.text} />
            <Input type="date" placeholder="To" value={toDate} onChange={(e) => setToDate(e.target.value)} w="160px" bg={T.bg} borderColor={T.border} color={T.text} />
            <Button bg={T.teal} color="white" _hover={{ bg: T.tealDim }} onClick={fetchReport} px={6} borderRadius="10px">Generate</Button>
          </Flex>
        </Box>

        {loading ? (
          <Flex justify="center" py={10}><Spinner size="xl" color={T.teal} /></Flex>
        ) : requests.length === 0 ? (
          <Box bg={T.surface} borderRadius="14px" p={12} textAlign="center"><Text color={T.muted}>No advance requests found</Text></Box>
        ) : (
          <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead><Tr bg={T.surface2}>
                  <Th borderColor={T.border} color={T.muted}>Employee</Th>
                  <Th borderColor={T.border} color={T.muted}>Amount</Th>
                  <Th borderColor={T.border} color={T.muted}>Request Date</Th>
                  <Th borderColor={T.border} color={T.muted}>Approved Date</Th>
                  <Th borderColor={T.border} color={T.muted}>Reason</Th>
                  <Th borderColor={T.border} color={T.muted}>Status</Th>
                </Tr></Thead>
                <Tbody>
                  {requests.map(req => (
                    <Tr key={req._id} _hover={{ bg: T.surface2 }}>
                      <Td borderColor={T.border}><Flex align="center" gap={2}><Avatar size="xs" name={req.employeeName} /><Text color={T.text}>{req.employeeName}</Text></Flex></Td>
                      <Td borderColor={T.border}>Rs {req.amount?.toLocaleString()}</Td>
                      <Td borderColor={T.border}>{new Date(req.requestedDate).toLocaleDateString()}</Td>
                      <Td borderColor={T.border}>{req.approvedDate ? new Date(req.approvedDate).toLocaleDateString() : "—"}</Td>
                      <Td borderColor={T.border} maxW="250px"><Text noOfLines={2} color={T.muted}>{req.reason}</Text></Td>
                      <Td borderColor={T.border}><Badge bg={req.status === "Approved" ? "#DCFCE7" : req.status === "Pending" ? "#FEF3C7" : "#FEE2E2"} color={req.status === "Approved" ? T.green : req.status === "Pending" ? T.amber : T.red} borderRadius="full" px={2}>{req.status}</Badge></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex justify="space-between" align="center" px={5} py={3} borderTop={`1px solid ${T.border}`}>
              <Text fontSize="xs" color={T.muted}>Showing {(page-1)*limit+1} - {Math.min(page*limit, total)} of {total}</Text>
              <HStack><Button size="xs" isDisabled={page===1} onClick={()=>setPage(p=>p-1)} leftIcon={<FaChevronLeft />}>Prev</Button><Button size="xs" isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} rightIcon={<FaChevronRight />}>Next</Button></HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdvanceReport;