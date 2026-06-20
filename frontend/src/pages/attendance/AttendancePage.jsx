import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Select, Badge, Input,
  Spinner, Text, Grid, Button, useToast, Icon, Avatar, InputGroup,
  InputLeftElement, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Progress,
  Tooltip, IconButton, HStack
} from "@chakra-ui/react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../context/AuthContext";
import { manualAttendance, getMonthlyAttendance } from "../../services/attendanceService";
import {
  FaSearch, FaFileExcel, FaUsers, FaUserCheck, FaClock,
  FaCalendarAlt, FaUserTimes, FaExclamationTriangle, FaEdit,
  FaBook, FaLeaf, FaChevronLeft, FaChevronRight, FaCalendarCheck
} from "react-icons/fa";

/* ─── LIGHT THEME ─── */
const T = {
  bg:       "#F8FAFC",
  surface:  "#FFFFFF",
  surface2: "#F1F5F9",
  border:   "#E2E8F0",
  teal:     "#0891B2",
  tealDim:  "#0E7490",
  blue:     "#1D4ED8",
  red:      "#DC2626",
  amber:    "#D97706",
  green:    "#059669",
  text:     "#0F172A",
  muted:    "#64748B",
};

const fmtTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
};
const calcDuration = (inV, outV) => {
  if (!inV || !outV) return "—";
  const diff = (new Date(outV) - new Date(inV)) / 60000;
  if (diff <= 0) return "—";
  return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m`;
};
const todayStr = () => new Date().toISOString().slice(0, 10);

const avatarColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const STATUS_COLORS = {
  Present: T.green, Late: T.amber, "Half Day": T.amber,
  Absent: T.red, "On Leave": T.teal, "Not Marked": T.muted
};

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ── Stat Card ── */
const StatCard = ({ label, value, color, icon }) => (
  <Box bg={T.surface} borderRadius="14px" p={4} border="1px solid" borderColor={T.border}
    position="relative" overflow="hidden" _hover={{ borderColor: color, transform: "translateY(-2px)" }} transition="all 0.2s"
    boxShadow="0 1px 3px rgba(0,0,0,0.06)">
    <Box position="absolute" top="0" left="0" right="0" h="2px" bg={`linear-gradient(90deg, ${color}, transparent)`} />
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color={T.muted} mb={2}>{label}</Text>
        <Text fontSize="28px" fontWeight="900" color={T.text} lineHeight="1">{value}</Text>
      </Box>
      <Flex w="36px" h="36px" borderRadius="10px" bg={`${color}18`} border="1px solid" borderColor={`${color}30`} align="center" justify="center">
        <Icon as={icon} fontSize="16px" color={color} />
      </Flex>
    </Flex>
  </Box>
);

/* ══════════════════════════════════════════════════════ */
const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const isAdmin = user?.role === "Admin";

  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate]     = useState(todayStr());
  const isRange = fromDate !== toDate;

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(false);

  // manual punch modal
  const { isOpen: isManualOpen, onOpen: openManual, onClose: closeManual } = useDisclosure();
  const [selRecord, setSelRecord]     = useState(null);
  const [manualStatus, setManualStatus] = useState("Present");
  const [manualIn, setManualIn]         = useState("");
  const [manualOut, setManualOut]       = useState("");

  // ledger modal
  const { isOpen: isLedgerOpen, onOpen: openLedger, onClose: closeLedger } = useDisclosure();
  const [ledgerEmp, setLedgerEmp]         = useState(null);
  const [ledgerMonth, setLedgerMonth]     = useState(new Date().getMonth() + 1);
  const [ledgerYear, setLedgerYear]       = useState(new Date().getFullYear());
  const [ledgerRecords, setLedgerRecords] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      if (isRange) {
        const { data } = await api.get("/attendance/range", { params: { from: fromDate, to: toDate } });
        setRecords(data);
      } else {
        const { data } = await api.get("/attendance/daily", { params: { date: fromDate } });
        setRecords(data);
      }
    } catch { setRecords([]); }
    finally { setLoading(false); }
  }, [fromDate, toDate, isRange]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFromChange = (v) => {
    setFromDate(v);
    if (toDate < v) setToDate(v);
  };

  const loadLedger = useCallback(async () => {
    if (!ledgerEmp) return;
    setLedgerLoading(true);
    try {
      const { data } = await getMonthlyAttendance({ employeeId: ledgerEmp.employee, month: ledgerMonth, year: ledgerYear });
      setLedgerRecords(data);
    } catch { setLedgerRecords([]); }
    finally { setLedgerLoading(false); }
  }, [ledgerEmp, ledgerMonth, ledgerYear]);

  useEffect(() => { if (isLedgerOpen) loadLedger(); }, [isLedgerOpen, loadLedger]);

  const changeLedgerMonth = (offset) => {
    let m = ledgerMonth + offset, y = ledgerYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setLedgerMonth(m); setLedgerYear(y);
  };

  const filtered = useMemo(() =>
    records.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q
        || r.name?.toLowerCase().includes(q)
        || r.employeeCode?.toLowerCase().includes(q)
        || r.department?.toLowerCase().includes(q)
        || r.designation?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || r.status === statusFilter
        || (isRange && statusFilter === "All");
      return matchSearch && matchStatus;
    }), [records, search, statusFilter, isRange]);

  const dailySummary = useMemo(() =>
    records.reduce((acc, r) => {
      if (r.status === "Present")       acc.present++;
      else if (r.status === "Late")     acc.late++;
      else if (r.status === "Half Day") acc.halfDay++;
      else if (r.status === "Absent")   acc.absent++;
      else if (r.status === "On Leave") acc.onLeave++;
      else                              acc.notMarked++;
      return acc;
    }, { total: records.length, present: 0, late: 0, halfDay: 0, absent: 0, onLeave: 0, notMarked: 0 }),
  [records]);

  const rangeSummary = useMemo(() => {
    if (!isRange) return null;
    return records.reduce((acc, r) => {
      acc.present   += r.present || 0;
      acc.late      += r.late || 0;
      acc.halfDay   += r.halfDay || 0;
      acc.absent    += r.absent || 0;
      acc.onLeave   += r.onLeave || 0;
      acc.notMarked += r.notMarked || 0;
      return acc;
    }, { present: 0, late: 0, halfDay: 0, absent: 0, onLeave: 0, notMarked: 0 });
  }, [records, isRange]);

  const handleExport = () => {
    if (!filtered.length) return;
    let rows;
    if (isRange) {
      rows = filtered.map((r) => ({
        Code: r.employeeCode, Name: r.name, Department: r.department,
        Designation: r.designation, "Total Days": r.totalDays,
        Present: r.present, Late: r.late, "Half Day": r.halfDay,
        Absent: r.absent, "On Leave": r.onLeave, "Not Marked": r.notMarked,
        "Attendance Rate": `${r.rate}%`
      }));
    } else {
      rows = filtered.map((r) => ({
        Date: fromDate, Code: r.employeeCode, Name: r.name,
        Department: r.department, Designation: r.designation,
        "Punch In": fmtTime(r.punchIn), "Punch Out": fmtTime(r.punchOut),
        Duration: calcDuration(r.punchIn, r.punchOut), Status: r.status || ""
      }));
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance-${fromDate}-to-${toDate}.xlsx`);
  };

  const openManualModal = (record) => {
    setSelRecord(record);
    setManualStatus(record.status && !["Not Marked","On Leave"].includes(record.status) ? record.status : "Present");
    setManualIn(record.punchIn ? new Date(record.punchIn).toISOString().slice(11,16) : "");
    setManualOut(record.punchOut ? new Date(record.punchOut).toISOString().slice(11,16) : "");
    openManual();
  };

  const handleManualSave = async () => {
    if (!selRecord) return;
    const base = new Date(fromDate);
    if (isNaN(base)) return;
    let punchInIso = null, punchOutIso = null;
    if (manualStatus !== "Absent") {
      if (manualIn)  { const [h,m] = manualIn.split(":").map(Number);  const d = new Date(base); d.setHours(h,m,0,0); punchInIso  = d.toISOString(); }
      if (manualOut) { const [h,m] = manualOut.split(":").map(Number); const d = new Date(base); d.setHours(h,m,0,0); punchOutIso = d.toISOString(); }
    }
    try {
      await manualAttendance({ employeeId: selRecord.employee, date: fromDate, status: manualStatus, punchIn: punchInIso, punchOut: punchOutIso }, {});
      toast({ title: "Attendance updated", status: "success", duration: 3000 });
      loadData();
      closeManual();
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed", status: "error", duration: 3000 });
    }
  };

  const openLedgerModal = (record) => {
    setLedgerEmp(record);
    const d = new Date(fromDate);
    setLedgerMonth(d.getMonth() + 1);
    setLedgerYear(d.getFullYear());
    setLedgerRecords([]);
    openLedger();
  };

  const ledgerSummary = useMemo(() =>
    ledgerRecords.reduce((acc, r) => {
      if (r.status === "Present")       acc.present++;
      else if (r.status === "Late")     acc.late++;
      else if (r.status === "Half Day") acc.halfDay++;
      else if (r.status === "Absent")   acc.absent++;
      return acc;
    }, { present: 0, late: 0, halfDay: 0, absent: 0 }), [ledgerRecords]);

  const headerDateLabel = isRange
    ? `${fmtDate(fromDate + "T00:00:00")} — ${fmtDate(toDate + "T00:00:00")} · ${records[0]?.totalDays || 0} days`
    : new Date(fromDate).toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xl" fontWeight="700" color={T.text}>Attendance Management</Text>
            <Text fontSize="sm" color={T.muted}>Track daily attendance and monthly summaries</Text>
          </Box>
          <Button
            leftIcon={<FaFileExcel />}
            variant="outline"
            borderColor={T.border}
            color={T.muted}
            _hover={{ borderColor: T.green, color: T.green }}
            size="sm"
            onClick={handleExport}
            isDisabled={!filtered.length}
            borderRadius="10px"
          >
            Export
          </Button>
        </Flex>

        {/* Date Range & Filters */}
        <Box bg={T.surface} borderRadius="14px" p={4} mb={4} border="1px solid" borderColor={T.border} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
          <Flex gap={3} align="flex-end" wrap="wrap">
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={1}>From Date</Text>
              <Input type="date" value={fromDate} onChange={(e) => handleFromChange(e.target.value)} w="175px"
                borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={1}>To Date</Text>
              <Input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} w="175px"
                borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} />
            </Box>
            <Box flex="1" minW="200px">
              <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={1}>Search</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color={T.muted} /></InputLeftElement>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code, department..."
                  borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }} />
              </InputGroup>
            </Box>
            {!isRange && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={1}>Status</Text>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="170px"
                  borderRadius="10px" bg={T.bg} borderColor={T.border} color={T.text} _focus={{ borderColor: T.teal }}>
                  <option value="All">All Status</option>
                  <option value="Present">Present</option><option value="Late">Late</option>
                  <option value="Half Day">Half Day</option><option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option><option value="Not Marked">Not Marked</option>
                </Select>
              </Box>
            )}
          </Flex>
          {isRange && (
            <Flex mt={2} gap={2} align="center">
              <Badge bg={T.surface2} color={T.muted} px={2} py={1} borderRadius="full">Range View: {fromDate} → {toDate}</Badge>
              <Button size="xs" variant="ghost" color={T.muted} _hover={{ color: T.teal }} onClick={() => setToDate(fromDate)}>Switch to Single Day</Button>
            </Flex>
          )}
        </Box>

        {/* Stats */}
        {!isRange ? (
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)", lg: "repeat(7, 1fr)" }} gap={3} mb={4}>
            <StatCard label="Total" value={dailySummary.total} color={T.teal} icon={FaUsers} />
            <StatCard label="Present" value={dailySummary.present} color={T.green} icon={FaUserCheck} />
            <StatCard label="Late" value={dailySummary.late} color={T.amber} icon={FaClock} />
            <StatCard label="Half Day" value={dailySummary.halfDay} color={T.amber} icon={FaExclamationTriangle} />
            <StatCard label="Absent" value={dailySummary.absent} color={T.red} icon={FaUserTimes} />
            <StatCard label="On Leave" value={dailySummary.onLeave} color={T.teal} icon={FaLeaf} />
            <StatCard label="Not Marked" value={dailySummary.notMarked} color={T.muted} icon={FaCalendarAlt} />
          </Grid>
        ) : rangeSummary && (
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3} mb={4}>
            <StatCard label="Present Days" value={rangeSummary.present} color={T.green} icon={FaUserCheck} />
            <StatCard label="Late Days" value={rangeSummary.late} color={T.amber} icon={FaClock} />
            <StatCard label="Half Days" value={rangeSummary.halfDay} color={T.amber} icon={FaExclamationTriangle} />
            <StatCard label="Absent Days" value={rangeSummary.absent} color={T.red} icon={FaUserTimes} />
            <StatCard label="Leave Days" value={rangeSummary.onLeave} color={T.teal} icon={FaLeaf} />
            <StatCard label="Not Marked" value={rangeSummary.notMarked} color={T.muted} icon={FaCalendarAlt} />
          </Grid>
        )}

        {/* Table */}
        {loading ? (
          <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
            <Spinner size="xl" color={T.teal} thickness="3px" />
            <Text color={T.muted}>Loading attendance...</Text>
          </Flex>
        ) : filtered.length === 0 ? (
          <Box bg={T.surface} borderRadius="14px" p={12} textAlign="center" border="1px solid" borderColor={T.border}>
            <Icon as={FaCalendarAlt} fontSize="48px" color={T.muted} opacity={0.5} mb={4} />
            <Text color={T.muted}>No records found.</Text>
          </Box>
        ) : isRange ? (
          <Box bg={T.surface} borderRadius="14px" border="1px solid" borderColor={T.border} overflow="hidden" boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg={T.surface2}>
                    <Th borderColor={T.border} color={T.muted}>#</Th>
                    <Th borderColor={T.border} color={T.muted}>Employee</Th>
                    <Th borderColor={T.border} color={T.muted}>Designation</Th>
                    <Th borderColor={T.border} color={T.muted} isNumeric>Present</Th>
                    <Th borderColor={T.border} color={T.muted} isNumeric>Late</Th>
                    <Th borderColor={T.border} color={T.muted} isNumeric>Half Day</Th>
                    <Th borderColor={T.border} color={T.muted} isNumeric>Absent</Th>
                    <Th borderColor={T.border} color={T.muted} isNumeric>Leave</Th>
                    <Th borderColor={T.border} color={T.muted}>Rate</Th>
                    <Th borderColor={T.border} color={T.muted}>Ledger</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((r, idx) => (
                    <Tr key={r.employee} _hover={{ bg: T.surface2 }}>
                      <Td borderColor={T.border}><Text fontSize="xs" color={T.muted}>{idx+1}</Text></Td>
                      <Td borderColor={T.border}>
                        <Flex align="center" gap={3}>
                          <Avatar size="sm" name={r.name} bg={getAvatarColor(r.name)} fontSize="xs" />
                          <Box>
                            <Text fontSize="sm" fontWeight="500" color={T.text}>{r.name}</Text>
                            <Text fontSize="xs" color={T.muted}>{r.employeeCode} · {r.department}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td borderColor={T.border}><Text fontSize="sm" color={T.muted}>{r.designation || "—"}</Text></Td>
                      <Td borderColor={T.border} isNumeric><Badge bg="#DCFCE7" color={T.green} px={2} borderRadius="full">{r.present}</Badge></Td>
                      <Td borderColor={T.border} isNumeric><Badge bg="#FEF3C7" color={T.amber} px={2} borderRadius="full">{r.late}</Badge></Td>
                      <Td borderColor={T.border} isNumeric><Badge bg="#FEF3C7" color={T.amber} px={2} borderRadius="full">{r.halfDay}</Badge></Td>
                      <Td borderColor={T.border} isNumeric><Badge bg="#FEE2E2" color={T.red} px={2} borderRadius="full">{r.absent}</Badge></Td>
                      <Td borderColor={T.border} isNumeric><Badge bg="#E0F2FE" color={T.teal} px={2} borderRadius="full">{r.onLeave}</Badge></Td>
                      <Td borderColor={T.border}>
                        <Flex align="center" gap={2}>
                          <Progress value={r.rate} size="xs" w="60px" borderRadius="full" colorScheme={r.rate >= 80 ? "green" : r.rate >= 50 ? "yellow" : "red"} />
                          <Text fontSize="xs" fontWeight="bold" color={r.rate >= 80 ? T.green : r.rate >= 50 ? T.amber : T.red}>{r.rate}%</Text>
                        </Flex>
                      </Td>
                      <Td borderColor={T.border}>
                        <Tooltip label="Monthly Ledger"><IconButton icon={<FaBook />} size="xs" variant="ghost" color={T.muted} _hover={{ color: T.teal }} onClick={() => openLedgerModal(r)} /></Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        ) : (
          <Box bg={T.surface} borderRadius="14px" border="1px solid" borderColor={T.border} overflow="hidden" boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg={T.surface2}>
                    <Th borderColor={T.border} color={T.muted}>#</Th>
                    <Th borderColor={T.border} color={T.muted}>Employee</Th>
                    <Th borderColor={T.border} color={T.muted}>Designation</Th>
                    <Th borderColor={T.border} color={T.muted}>Punch In</Th>
                    <Th borderColor={T.border} color={T.muted}>Punch Out</Th>
                    <Th borderColor={T.border} color={T.muted}>Duration</Th>
                    <Th borderColor={T.border} color={T.muted}>Status</Th>
                    <Th borderColor={T.border} color={T.muted}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((r, idx) => (
                    <Tr key={r.employee} _hover={{ bg: T.surface2 }}>
                      <Td borderColor={T.border}><Text fontSize="xs" color={T.muted}>{idx+1}</Text></Td>
                      <Td borderColor={T.border}>
                        <Flex align="center" gap={3}>
                          <Avatar size="sm" name={r.name} bg={getAvatarColor(r.name)} fontSize="xs" />
                          <Box>
                            <Text fontSize="sm" fontWeight="500" color={T.text}>{r.name}</Text>
                            <Text fontSize="xs" color={T.muted}>{r.employeeCode} · {r.department}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td borderColor={T.border}><Text fontSize="sm" color={T.muted}>{r.designation || "—"}</Text></Td>
                      <Td borderColor={T.border}><Text fontSize="sm" color={r.punchIn ? T.text : T.muted}>{fmtTime(r.punchIn)}</Text></Td>
                      <Td borderColor={T.border}><Text fontSize="sm" color={r.punchOut ? T.text : T.muted}>{fmtTime(r.punchOut)}</Text></Td>
                      <Td borderColor={T.border}><Text fontSize="sm" color={T.muted}>{calcDuration(r.punchIn, r.punchOut)}</Text></Td>
                      <Td borderColor={T.border}>
                        <Badge bg={`${STATUS_COLORS[r.status] || T.muted}20`} color={STATUS_COLORS[r.status] || T.muted} px={2} py={1} borderRadius="full">
                          {r.status === "On Leave" ? `On Leave${r.leaveType ? ` (${r.leaveType})` : ""}` : r.status || "Not Marked"}
                        </Badge>
                      </Td>
                      <Td borderColor={T.border}>
                        <HStack spacing={1}>
                          {isAdmin && (
                            <Tooltip label="Mark / Edit"><IconButton icon={<FaEdit />} size="xs" variant="ghost" color={T.muted} _hover={{ color: T.blue }} onClick={() => openManualModal(r)} /></Tooltip>
                          )}
                          <Tooltip label="Monthly Ledger"><IconButton icon={<FaBook />} size="xs" variant="ghost" color={T.muted} _hover={{ color: T.teal }} onClick={() => openLedgerModal(r)} /></Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex px={5} py={3} borderTop="1px solid" borderColor={T.border}>
              <Text fontSize="xs" color={T.muted}>Showing {filtered.length} of {records.length} employees</Text>
            </Flex>
          </Box>
        )}

        {/* Manual Attendance Modal */}
        <Modal isOpen={isManualOpen} onClose={closeManual} isCentered>
          <ModalOverlay bg="rgba(15,23,42,0.4)" />
          <ModalContent bg={T.surface} borderRadius="14px" border="1px solid" borderColor={T.border}>
            <ModalHeader borderBottom="1px solid" borderColor={T.border} color={T.text}>Manual Attendance</ModalHeader>
            <ModalCloseButton color={T.muted} />
            <ModalBody py={5}>
              <Box bg={T.surface2} borderRadius="10px" p={3} mb={4}>
                <Flex align="center" gap={3}>
                  <Avatar size="sm" name={selRecord?.name} bg={getAvatarColor(selRecord?.name || "")} />
                  <Box>
                    <Text fontWeight="semibold" color={T.text}>{selRecord?.name}</Text>
                    <Text fontSize="xs" color={T.muted}>{selRecord?.employeeCode} · {fromDate}</Text>
                  </Box>
                </Flex>
              </Box>
              <Text fontSize="sm" fontWeight="semibold" color={T.muted} mb={2}>Status</Text>
              <Select mb={4} value={manualStatus} onChange={(e) => setManualStatus(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px">
                <option value="Present">Present</option><option value="Late">Late</option><option value="Half Day">Half Day</option><option value="Absent">Absent</option>
              </Select>
              {manualStatus !== "Absent" && (
                <Grid templateColumns="1fr 1fr" gap={3}>
                  <Box><Text fontSize="sm" fontWeight="semibold" color={T.muted} mb={2}>Punch In</Text><Input type="time" value={manualIn} onChange={(e) => setManualIn(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" /></Box>
                  <Box><Text fontSize="sm" fontWeight="semibold" color={T.muted} mb={2}>Punch Out</Text><Input type="time" value={manualOut} onChange={(e) => setManualOut(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" /></Box>
                </Grid>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={T.border} gap={2}>
              <Button variant="ghost" color={T.muted} _hover={{ bg: T.surface2 }} onClick={closeManual} borderRadius="10px">Cancel</Button>
              <Button bg={T.teal} color="white" _hover={{ bg: T.tealDim }} onClick={handleManualSave} borderRadius="10px">Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Ledger Modal */}
        <Modal isOpen={isLedgerOpen} onClose={closeLedger} size="3xl" isCentered scrollBehavior="inside">
          <ModalOverlay bg="rgba(15,23,42,0.4)" />
          <ModalContent bg={T.surface} borderRadius="14px" maxH="85vh" border="1px solid" borderColor={T.border}>
            <ModalHeader borderBottom="1px solid" borderColor={T.border}>
              <Flex align="center" gap={3}>
                <Avatar size="sm" name={ledgerEmp?.name} bg={getAvatarColor(ledgerEmp?.name || "")} />
                <Box><Text fontSize="md" fontWeight="bold" color={T.text}>{ledgerEmp?.name} — Monthly Ledger</Text><Text fontSize="xs" color={T.muted}>{ledgerEmp?.employeeCode} · {ledgerEmp?.department}</Text></Box>
              </Flex>
            </ModalHeader>
            <ModalCloseButton color={T.muted} />
            <ModalBody py={4}>
              <Flex align="center" justify="space-between" mb={4} bg={T.surface2} borderRadius="10px" p={3}>
                <IconButton icon={<FaChevronLeft />} size="sm" variant="ghost" color={T.muted} onClick={() => changeLedgerMonth(-1)} />
                <Text fontWeight="bold" color={T.text}>{monthNames[ledgerMonth-1]} {ledgerYear}</Text>
                <IconButton icon={<FaChevronRight />} size="sm" variant="ghost" color={T.muted} onClick={() => changeLedgerMonth(1)} />
              </Flex>
              {ledgerRecords.length > 0 && (
                <>
                  <Grid templateColumns="repeat(4,1fr)" gap={3} mb={4}>
                    {[
                      { label: "Present", val: ledgerSummary.present, color: T.green },
                      { label: "Late", val: ledgerSummary.late, color: T.amber },
                      { label: "Half Day", val: ledgerSummary.halfDay, color: T.amber },
                      { label: "Absent", val: ledgerSummary.absent, color: T.red },
                    ].map(s => (
                      <Box key={s.label} bg={T.surface2} borderRadius="10px" p={3} textAlign="center" border="1px solid" borderColor={T.border}>
                        <Text fontSize="xl" fontWeight="bold" color={s.color}>{s.val}</Text>
                        <Text fontSize="xs" color={T.muted}>{s.label}</Text>
                      </Box>
                    ))}
                  </Grid>
                  {(() => {
                    const rate = ledgerRecords.length ? Math.round(((ledgerSummary.present + ledgerSummary.late * 0.5) / ledgerRecords.length)*100) : 0;
                    return (
                      <Box mb={4} bg={T.surface2} borderRadius="10px" p={3}>
                        <Flex justify="space-between" mb={1}><Text fontSize="xs" color={T.muted}>Attendance Rate</Text><Text fontSize="xs" fontWeight="bold" color={T.teal}>{rate}%</Text></Flex>
                        <Progress value={rate} size="sm" borderRadius="full" colorScheme="green" />
                      </Box>
                    );
                  })()}
                </>
              )}
              {ledgerLoading ? (
                <Flex justify="center" py={10}><Spinner color={T.teal} /></Flex>
              ) : ledgerRecords.length === 0 ? (
                <Box textAlign="center" py={10}><Text color={T.muted}>No records</Text></Box>
              ) : (
                <Box borderRadius="10px" overflow="hidden" border="1px solid" borderColor={T.border}>
                  <Table variant="simple" size="sm">
                    <Thead><Tr bg={T.surface2}>
                      <Th borderColor={T.border} color={T.muted}>Date</Th><Th borderColor={T.border} color={T.muted}>Punch In</Th>
                      <Th borderColor={T.border} color={T.muted}>Punch Out</Th><Th borderColor={T.border} color={T.muted}>Duration</Th><Th borderColor={T.border} color={T.muted}>Status</Th>
                    </Tr></Thead>
                    <Tbody>
                      {ledgerRecords.map(r => (
                        <Tr key={r._id} _hover={{ bg: T.surface2 }}>
                          <Td borderColor={T.border}><Text fontSize="sm" color={T.text}>{fmtDate(r.date)}</Text></Td>
                          <Td borderColor={T.border}><Text fontSize="sm" color={r.punchIn ? T.text : T.muted}>{fmtTime(r.punchIn)}</Text></Td>
                          <Td borderColor={T.border}><Text fontSize="sm" color={r.punchOut ? T.text : T.muted}>{fmtTime(r.punchOut)}</Text></Td>
                          <Td borderColor={T.border}><Text fontSize="sm" color={T.muted}>{calcDuration(r.punchIn, r.punchOut)}</Text></Td>
                          <Td borderColor={T.border}><Badge bg={`${STATUS_COLORS[r.status] || T.muted}20`} color={STATUS_COLORS[r.status] || T.muted}>{r.status || "Not Marked"}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={T.border}>
              <Button variant="ghost" color={T.muted} onClick={closeLedger} borderRadius="10px">Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default AttendancePage;
