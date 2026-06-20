// 📁 DailyAttendance.jsx (with pagination + dark theme)
import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Select, Badge, Input,
  Spinner, Text, Grid, Button, useToast, Icon, Avatar, InputGroup,
  InputLeftElement, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, HStack, IconButton
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight, FaSearch, FaFileExcel, FaEdit, FaClock, FaCalendarAlt, FaUserCheck, FaUserTimes, FaExclamationTriangle } from "react-icons/fa";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../context/AuthContext";
import { manualAttendance } from "../../services/attendanceService";

/* ─── Light Theme ─── */
const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", blue: "#1D4ED8", red: "#DC2626", amber: "#D97706", green: "#059669",
  text: "#0F172A", muted: "#64748B"
};

const statusColors = { Present: T.green, Late: T.amber, "Half Day": T.amber, Absent: T.red };
const statusBg = { Present: "#DCFCE7", Late: "#FEF3C7", "Half Day": "#FEF3C7", Absent: "#FEE2E2" };
const getAvatarColor = (name) => ["#065f46","#1d4ed8","#7c3aed","#d97706","#dc2626"][(name?.charCodeAt(0)||0)%5];

const StatCard = ({ label, value, color, icon }) => (
  <Box bg={T.surface} p={4} borderRadius="14px" border={`1px solid ${T.border}`} _hover={{ borderColor: color }}>
    <Flex justify="space-between"><Text fontSize="xs" color={T.muted}>{label}</Text><Icon as={icon} color={color} /></Flex>
    <Text fontSize="2xl" fontWeight="bold" color={T.text}>{value}</Text>
  </Box>
);

const DailyAttendance = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const todayStr = new Date().toISOString().slice(0,10);
  const [date, setDate] = useState(todayStr);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState("All");
  const isAdmin = user?.role === "Admin";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [manualStatus, setManualStatus] = useState("Present");
  const [manualIn, setManualIn] = useState("");
  const [manualOut, setManualOut] = useState("");

  // Debounce search — wait 400ms after user stops typing before firing API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/daily", {
        params: { date, page, limit, search: debouncedSearch || undefined, status: statusFilter === "All" ? undefined : statusFilter }
      });
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); toast({ title: "Error loading attendance", status: "error" }); }
    finally { setLoading(false); }
  }, [date, page, limit, debouncedSearch, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const summary = { total: records.length, present: records.filter(r=>r.status==="Present").length, late: records.filter(r=>r.status==="Late").length, halfDay: records.filter(r=>r.status==="Half Day").length, absent: records.filter(r=>r.status==="Absent").length };
  
  const handleExport = () => { /* ... export logic ... */ };
  const handleManualSave = async () => { /* ... existing ... */ };
  const changeDay = (offset) => { const d = new Date(date); d.setDate(d.getDate()+offset); setDate(d.toISOString().slice(0,10)); setPage(1); };
  
  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" align="center" mb={5}>
          <Box><Text fontSize="xl" fontWeight="bold" color={T.text}>Daily Attendance</Text><Text color={T.muted}>{new Date(date).toDateString()}</Text></Box>
          <HStack><Button size="sm" onClick={()=>changeDay(-1)}>← Prev</Button><Button size="sm" onClick={()=>setDate(todayStr)}>Today</Button><Button size="sm" onClick={()=>changeDay(1)}>Next →</Button><Button leftIcon={<FaFileExcel />} variant="outline">Export</Button></HStack>
        </Flex>
        
        <Grid templateColumns="repeat(6,1fr)" gap={3} mb={4}>
          <StatCard label="Total" value={summary.total} color={T.teal} icon={FaCalendarAlt} />
          <StatCard label="Present" value={summary.present} color={T.green} icon={FaUserCheck} />
          <StatCard label="Late" value={summary.late} color={T.amber} icon={FaClock} />
          <StatCard label="Half Day" value={summary.halfDay} color={T.amber} icon={FaExclamationTriangle} />
          <StatCard label="Absent" value={summary.absent} color={T.red} icon={FaUserTimes} />
          <StatCard label="Rate" value={summary.total ? Math.round(summary.present/summary.total*100) : 0} color={T.blue} icon={FaUserCheck} />
        </Grid>
        
        <Box bg={T.surface} p={3} borderRadius="14px" mb={4} border="1px solid" borderColor={T.border} display="flex" gap={3} flexWrap="wrap" boxShadow="0 1px 3px rgba(0,0,0,0.05)">
          <InputGroup maxW="300px"><InputLeftElement pointerEvents="none"><Icon as={FaSearch} color={T.muted} fontSize="13px"/></InputLeftElement><Input placeholder="Search name..." value={search} onChange={e=>setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}/></InputGroup>
          <Select w="150px" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}><option>All Status</option><option>Present</option><option>Late</option><option>Half Day</option><option>Absent</option></Select>
        </Box>

        {loading ? <Flex justify="center" py={10}><Spinner color={T.teal} size="xl" /></Flex> : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto" border="1px solid" borderColor={T.border} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Table variant="simple" size="sm">
              <Thead><Tr bg={T.surface2}><Th borderColor={T.border} color={T.muted}>Employee</Th><Th borderColor={T.border} color={T.muted}>Department</Th><Th borderColor={T.border} color={T.muted}>Punch In</Th><Th borderColor={T.border} color={T.muted}>Punch Out</Th><Th borderColor={T.border} color={T.muted}>Status</Th><Th borderColor={T.border} color={T.muted}>Actions</Th></Tr></Thead>
              <Tbody>
                {records.map(rec => (
                  <Tr key={rec._id} _hover={{bg:T.surface2}}>
                    <Td borderColor={T.border}><Flex align="center" gap={2}><Avatar size="xs" name={rec.name} bg={getAvatarColor(rec.name)}/><Text fontSize="sm" color={T.text}>{rec.name}</Text></Flex></Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted}>{rec.department}</Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted}>{rec.punchIn ? new Date(rec.punchIn).toLocaleTimeString() : "—"}</Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted}>{rec.punchOut ? new Date(rec.punchOut).toLocaleTimeString() : "—"}</Td>
                    <Td borderColor={T.border}><Badge bg={statusBg[rec.status] || T.surface2} color={statusColors[rec.status] || T.muted} borderRadius="full" px={2} fontSize="xs">{rec.status || "Not Marked"}</Badge></Td>
                    <Td borderColor={T.border}>{isAdmin && <IconButton icon={<FaEdit/>} size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal, color: T.teal }} borderRadius="8px" onClick={()=>{ setSelectedRecord(rec); onOpen(); }} />}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {/* Pagination controls */}
            <Flex justify="space-between" align="center" px={5} py={3} borderTop="1px solid" borderColor={T.border} wrap="wrap" gap={3}>
              <HStack><Text fontSize="xs" color={T.muted}>Rows per page</Text><Select size="xs" w="70px" value={limit} onChange={e=>{setLimit(Number(e.target.value));setPage(1);}} bg={T.bg} borderColor={T.border} color={T.text}><option>5</option><option>10</option><option>20</option><option>50</option></Select></HStack>
              <Text fontSize="xs" color={T.muted}>Showing {(page-1)*limit+1} - {Math.min(page*limit,total)} of {total}</Text>
              <HStack spacing={1}><IconButton icon={<FaChevronLeft/>} size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===1} onClick={()=>setPage(p=>p-1)}/><IconButton icon={<FaChevronRight/>} size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)}/></HStack>
            </Flex>
          </Box>
        )}
        {/* Modal for manual entry remains same */}
      </Box>
    </Box>
  );
};

export default DailyAttendance;