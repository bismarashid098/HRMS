import { useState, useEffect, useCallback, useContext } from "react";
import {
  Box, Flex, Grid, Text, Button, useToast, Select, Input,
  Spinner, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack,
  Icon, InputGroup, InputLeftElement, Avatar,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure
} from "@chakra-ui/react";
import {
  FaSearch, FaFileExcel, FaMoneyBillWave, FaEye,
  FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../context/AuthContext";

/* ─── Light Theme ─── */
const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", blue: "#1D4ED8", red: "#DC2626", amber: "#D97706", green: "#059669",
  text: "#0F172A", muted: "#64748B"
};

const StatCard = ({ label, value, color, icon }) => (
  <Box bg={T.surface} p={4} borderRadius="14px" border={`1px solid ${T.border}`} _hover={{ borderColor: color }}>
    <Flex justify="space-between"><Text fontSize="xs" color={T.muted}>{label}</Text><Icon as={icon} color={color} /></Flex>
    <Text fontSize="2xl" fontWeight="bold" color={T.text}>{value}</Text>
  </Box>
);

const PayrollReport = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const isAdmin = user?.role === "Admin";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0,7));
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalProcessed:0, totalPaid:0, totalAmount:0 });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/payroll", {
        params: { month: monthFilter, search: search || undefined, status: statusFilter !== "All" ? statusFilter : undefined, page, limit }
      });
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
      setSummary(res.data.summary || { totalProcessed:0, totalPaid:0, totalAmount:0 });
    } catch (err) {
      toast({ title: "Error loading report", status: "error" });
    } finally { setLoading(false); }
  }, [monthFilter, search, statusFilter, page, limit]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [monthFilter, search, statusFilter]);

  const handleExport = () => {
    if (!records.length) return;
    const rows = records.map(r => ({
      Employee: r.employeeName,
      Month: r.month,
      "Basic Salary": r.basicSalary,
      Allowances: r.allowances,
      Deductions: r.deductions,
      "Net Pay": r.netPay,
      Status: r.status,
      "Payment Date": r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : ""
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Report");
    XLSX.writeFile(wb, `payroll_report_${monthFilter}.xlsx`);
  };

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
          <Box><Text fontSize="xl" fontWeight="700" color={T.text}>Payroll Report</Text><Text fontSize="sm" color={T.muted}>Monthly salary summary and payment status</Text></Box>
          <Button leftIcon={<FaFileExcel />} variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.green, color: T.green }} onClick={handleExport} disabled={!records.length}>Export Excel</Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }} gap={4} mb={5}>
          <StatCard label="Total Processed" value={summary.totalProcessed} color={T.teal} icon={FaMoneyBillWave} />
          <StatCard label="Total Paid" value={summary.totalPaid} color={T.green} icon={FaCheckCircle} />
          <StatCard label="Pending" value={summary.totalProcessed - summary.totalPaid} color={T.amber} icon={FaCalendarAlt} />
          <StatCard label="Total Amount" value={`Rs ${summary.totalAmount?.toLocaleString() || 0}`} color={T.blue} icon={FaMoneyBillWave} />
        </Grid>

        <Box bg={T.surface} borderRadius="14px" p={4} mb={4} border={`1px solid ${T.border}`}>
          <Flex gap={3} wrap="wrap" align="flex-end">
            <Box><Text fontSize="xs" color={T.muted} mb={1}>Month</Text><Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} w="180px" bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" /></Box>
            <InputGroup flex="1" minW="200px"><InputLeftElement><Icon as={FaSearch} color={T.muted} /></InputLeftElement><Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" /></InputGroup>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="150px" bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px"><option value="All">All Status</option><option value="Paid">Paid</option><option value="Pending">Pending</option></Select>
            <Button bg={T.teal} color="white" _hover={{ bg: T.tealDim }} onClick={fetchReport} borderRadius="10px">Generate</Button>
          </Flex>
        </Box>

        {loading ? (
          <Flex justify="center" py={10}><Spinner size="xl" color={T.teal} /></Flex>
        ) : records.length === 0 ? (
          <Box bg={T.surface} borderRadius="14px" p={12} textAlign="center"><Text color={T.muted}>No payroll records found</Text></Box>
        ) : (
          <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead><Tr bg={T.surface2}>
                  <Th borderColor={T.border} color={T.muted}>Employee</Th>
                  <Th borderColor={T.border} color={T.muted}>Basic Salary</Th>
                  <Th borderColor={T.border} color={T.muted}>Allowances</Th>
                  <Th borderColor={T.border} color={T.muted}>Deductions</Th>
                  <Th borderColor={T.border} color={T.muted}>Net Pay</Th>
                  <Th borderColor={T.border} color={T.muted}>Status</Th>
                  <Th borderColor={T.border} color={T.muted}>Actions</Th>
                </Tr></Thead>
                <Tbody>
                  {records.map(rec => (
                    <Tr key={rec._id} _hover={{ bg: T.surface2 }}>
                      <Td borderColor={T.border}><Flex align="center" gap={2}><Avatar size="xs" name={rec.employeeName} /><Text fontSize="sm" color={T.text}>{rec.employeeName}</Text></Flex></Td>
                      <Td borderColor={T.border}>Rs {rec.basicSalary?.toLocaleString()}</Td>
                      <Td borderColor={T.border}>Rs {rec.allowances?.toLocaleString()}</Td>
                      <Td borderColor={T.border}>Rs {rec.deductions?.toLocaleString()}</Td>
                      <Td borderColor={T.border}><Text fontWeight="bold" color={T.teal} fontSize="sm">Rs {rec.netPay?.toLocaleString()}</Text></Td>
                      <Td borderColor={T.border}><Badge bg={rec.status === "Paid" ? "#DCFCE7" : "#FEF3C7"} color={rec.status === "Paid" ? T.green : T.amber} borderRadius="full" px={2}>{rec.status}</Badge></Td>
                      <Td borderColor={T.border}><Button size="xs" variant="ghost" color={T.muted} _hover={{ color: T.teal }} onClick={() => {}}><Icon as={FaEye} /></Button></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex justify="space-between" align="center" px={5} py={3} borderTop={`1px solid ${T.border}`} wrap="wrap" gap={3}>
              <Text fontSize="xs" color={T.muted}>Showing {(page-1)*limit+1} - {Math.min(page*limit, total)} of {total}</Text>
              <HStack spacing={1}>
                <Button size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===1} onClick={() => setPage(p=>p-1)} leftIcon={<FaChevronLeft />}>Prev</Button>
                <Text fontSize="xs" color={T.text}>Page {page} of {Math.ceil(total/limit)}</Text>
                <Button size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===Math.ceil(total/limit)} onClick={() => setPage(p=>p+1)} rightIcon={<FaChevronRight />}>Next</Button>
              </HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PayrollReport;