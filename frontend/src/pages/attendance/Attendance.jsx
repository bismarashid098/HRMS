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

/* ─── Dark Theme ─── */
const T = {
  bg: "#0D1117", surface: "#161B22", surface2: "#1C2330", border: "#30363D",
  teal: "#00D4B4", blue: "#58A6FF", red: "#FF6B6B", amber: "#F0A500", green: "#3FB950",
  text: "#E6EDF3", muted: "#8B949E"
};

const statusColors = { Present: T.green, Late: T.amber, "Half Day": T.amber, Absent: T.red };
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
        
        <Box bg={T.surface} p={3} borderRadius="14px" mb={4} display="flex" gap={3} flexWrap="wrap">
          <InputGroup maxW="300px"><InputLeftElement><FaSearch color={T.muted}/></InputLeftElement><Input placeholder="Search name..." value={search} onChange={e=>setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text}/></InputGroup>
          <Select w="150px" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} bg={T.bg} borderColor={T.border}><option>All Status</option><option>Present</option><option>Late</option><option>Half Day</option><option>Absent</option></Select>
        </Box>
        
        {loading ? <Spinner /> : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead><Tr bg={T.surface2}><Th>Employee</Th><Th>Department</Th><Th>Punch In</Th><Th>Punch Out</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
              <Tbody>
                {records.map(rec => (
                  <Tr key={rec._id} _hover={{bg:T.surface2}}>
                    <Td><Flex align="center" gap={2}><Avatar size="xs" name={rec.name} bg={getAvatarColor(rec.name)}/><Text>{rec.name}</Text></Flex></Td>
                    <Td>{rec.department}</Td>
                    <Td>{rec.punchIn ? new Date(rec.punchIn).toLocaleTimeString() : "—"}</Td>
                    <Td>{rec.punchOut ? new Date(rec.punchOut).toLocaleTimeString() : "—"}</Td>
                    <Td><Badge bg={`${statusColors[rec.status]}20`} color={statusColors[rec.status]}>{rec.status || "Not Marked"}</Badge></Td>
                    <Td>{isAdmin && <IconButton icon={<FaEdit/>} size="xs" onClick={()=>{ setSelectedRecord(rec); onOpen(); }} />}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {/* Pagination controls */}
            <Flex justify="space-between" p={3} borderTop={`1px solid ${T.border}`}>
              <HStack><Text fontSize="xs">Rows per page</Text><Select size="xs" w="70px" value={limit} onChange={e=>{setLimit(Number(e.target.value));setPage(1);}}><option>5</option><option>10</option><option>20</option><option>50</option></Select></HStack>
              <Text fontSize="xs">Showing {(page-1)*limit+1} - {Math.min(page*limit,total)} of {total}</Text>
              <HStack><IconButton icon={<FaChevronLeft/>} size="xs" isDisabled={page===1} onClick={()=>setPage(p=>p-1)}/><IconButton icon={<FaChevronRight/>} size="xs" isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)}/></HStack>
            </Flex>
          </Box>
        )}
        {/* Modal for manual entry remains same */}
      </Box>
    </Box>
  );
};

export default DailyAttendance;