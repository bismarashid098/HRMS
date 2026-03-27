import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Select, Badge, Input,
  Spinner, Text, Grid, Button, useToast, Icon, Avatar, InputGroup,
  InputLeftElement, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Progress,
  Tooltip, IconButton
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

/* ── helpers ── */
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
  Present: "green", Late: "orange", "Half Day": "yellow",
  Absent: "red", "On Leave": "teal", "Not Marked": "gray"
};

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ── Stat Card ── */
const StatCard = ({ label, value, color, bg, icon }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid"
    borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
      </Flex>
    </Flex>
  </Box>
);

/* ══════════════════════════════════════════════════════ */
const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const isAdmin = user?.role === "Admin";

  /* ── date range state ── */
  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate]     = useState(todayStr());
  const isRange = fromDate !== toDate;

  /* ── filters ── */
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ── data ── */
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(false);

  /* ── manual punch modal ── */
  const { isOpen: isManualOpen, onOpen: openManual, onClose: closeManual } = useDisclosure();
  const [selRecord, setSelRecord]     = useState(null);
  const [manualStatus, setManualStatus] = useState("Present");
  const [manualIn, setManualIn]         = useState("");
  const [manualOut, setManualOut]       = useState("");

  /* ── ledger modal ── */
  const { isOpen: isLedgerOpen, onOpen: openLedger, onClose: closeLedger } = useDisclosure();
  const [ledgerEmp, setLedgerEmp]         = useState(null);
  const [ledgerMonth, setLedgerMonth]     = useState(new Date().getMonth() + 1);
  const [ledgerYear, setLedgerYear]       = useState(new Date().getFullYear());
  const [ledgerRecords, setLedgerRecords] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  /* ── load data ── */
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── ensure toDate >= fromDate ── */
  const handleFromChange = (v) => {
    setFromDate(v);
    if (toDate < v) setToDate(v);
  };

  /* ── load ledger ── */
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

  /* ── month nav ── */
  const changeLedgerMonth = (offset) => {
    let m = ledgerMonth + offset, y = ledgerYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setLedgerMonth(m); setLedgerYear(y);
  };

  /* ── filtered ── */
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

  /* ── daily summary ── */
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

  /* ── range total summary ── */
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

  /* ── export ── */
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

  /* ── manual modal ── */
  const openManualModal = (record) => {
    setSelRecord(record);
    setManualStatus(
      record.status && !["Not Marked","On Leave"].includes(record.status)
        ? record.status : "Present"
    );
    setManualIn(record.punchIn ? new Date(record.punchIn).toISOString().slice(11, 16) : "");
    setManualOut(record.punchOut ? new Date(record.punchOut).toISOString().slice(11, 16) : "");
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
      toast({ title: "Attendance updated", status: "success", duration: 3000, isClosable: true });
      loadData();
      closeManual();
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed", status: "error", duration: 3000, isClosable: true });
    }
  };

  /* ── open ledger ── */
  const openLedgerModal = (record) => {
    setLedgerEmp(record);
    const d = new Date(fromDate);
    setLedgerMonth(d.getMonth() + 1);
    setLedgerYear(d.getFullYear());
    setLedgerRecords([]);
    openLedger();
  };

  /* ── ledger summary ── */
  const ledgerSummary = useMemo(() =>
    ledgerRecords.reduce((acc, r) => {
      if (r.status === "Present")       acc.present++;
      else if (r.status === "Late")     acc.late++;
      else if (r.status === "Half Day") acc.halfDay++;
      else if (r.status === "Absent")   acc.absent++;
      return acc;
    }, { present: 0, late: 0, halfDay: 0, absent: 0 }), [ledgerRecords]);

  /* ── formatted header date ── */
  const headerDateLabel = isRange
    ? `${fmtDate(fromDate + "T00:00:00")} — ${fmtDate(toDate + "T00:00:00")} · ${records[0]?.totalDays || 0} days`
    : new Date(fromDate).toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  /* ══════════════ RENDER ══════════════ */
  return (
    <Box>
      {/* ── Header Banner ── */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Flex align="center" gap={2}>
              <Icon as={FaCalendarCheck} color="whiteAlpha.800" />
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {isRange ? "Attendance Summary" : "Daily Attendance"}
              </Text>
            </Flex>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>{headerDateLabel}</Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            {!isRange && (
              <>
                <Button size="sm" variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl"
                  leftIcon={<FaChevronLeft />}
                  onClick={() => { const d = new Date(fromDate); d.setDate(d.getDate()-1); const s = d.toISOString().slice(0,10); setFromDate(s); setToDate(s); }}>
                  Prev
                </Button>
                <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} borderRadius="xl"
                  onClick={() => { const t = todayStr(); setFromDate(t); setToDate(t); }} isDisabled={fromDate === todayStr()}>
                  Today
                </Button>
                <Button size="sm" variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl"
                  rightIcon={<FaChevronRight />}
                  onClick={() => { const d = new Date(fromDate); d.setDate(d.getDate()+1); const s = d.toISOString().slice(0,10); setFromDate(s); setToDate(s); }}>
                  Next
                </Button>
              </>
            )}
            <Button size="sm" leftIcon={<FaFileExcel />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl"
              onClick={handleExport} isDisabled={!filtered.length}>Export</Button>
          </Flex>
        </Flex>
      </Box>

      {/* ── Filters ── */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} align="flex-end" wrap="wrap">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">From Date</Text>
            <Input type="date" value={fromDate} onChange={(e) => handleFromChange(e.target.value)}
              w="175px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46" />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">To Date</Text>
            <Input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)}
              w="175px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46" />
          </Box>
          <Box flex="1" minW="200px">
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Search</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="13px" /></InputLeftElement>
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code or department..."
                borderRadius="xl" bg="gray.50" fontSize="sm" focusBorderColor="#065f46" />
            </InputGroup>
          </Box>
          {!isRange && (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Status</Text>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                w="170px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Not Marked">Not Marked</option>
              </Select>
            </Box>
          )}
        </Flex>
        {isRange && (
          <Flex mt={2} gap={2} align="center">
            <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="xs">
              Range View: {fromDate} → {toDate}
            </Badge>
            <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => setToDate(fromDate)}>
              Switch to Single Day
            </Button>
          </Flex>
        )}
      </Box>

      {/* ── Stats ── */}
      {!isRange ? (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)", lg: "repeat(7, 1fr)" }} gap={3} mb={4}>
          <StatCard label="Total" value={dailySummary.total} color="#065f46" bg="#f0fdf4" icon={FaUsers} />
          <StatCard label="Present" value={dailySummary.present} color="#1d4ed8" bg="#eff6ff" icon={FaUserCheck} />
          <StatCard label="Late" value={dailySummary.late} color="#ea580c" bg="#fff7ed" icon={FaClock} />
          <StatCard label="Half Day" value={dailySummary.halfDay} color="#ca8a04" bg="#fefce8" icon={FaExclamationTriangle} />
          <StatCard label="Absent" value={dailySummary.absent} color="#dc2626" bg="#fef2f2" icon={FaUserTimes} />
          <StatCard label="On Leave" value={dailySummary.onLeave} color="#0d9488" bg="#f0fdfa" icon={FaLeaf} />
          <StatCard label="Not Marked" value={dailySummary.notMarked} color="#6b7280" bg="#f9fafb" icon={FaCalendarAlt} />
        </Grid>
      ) : rangeSummary && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3} mb={4}>
          <StatCard label="Present Days" value={rangeSummary.present} color="#065f46" bg="#f0fdf4" icon={FaUserCheck} />
          <StatCard label="Late Days" value={rangeSummary.late} color="#ea580c" bg="#fff7ed" icon={FaClock} />
          <StatCard label="Half Days" value={rangeSummary.halfDay} color="#ca8a04" bg="#fefce8" icon={FaExclamationTriangle} />
          <StatCard label="Absent Days" value={rangeSummary.absent} color="#dc2626" bg="#fef2f2" icon={FaUserTimes} />
          <StatCard label="Leave Days" value={rangeSummary.onLeave} color="#0d9488" bg="#f0fdfa" icon={FaLeaf} />
          <StatCard label="Not Marked" value={rangeSummary.notMarked} color="#6b7280" bg="#f9fafb" icon={FaCalendarAlt} />
        </Grid>
      )}

      {/* ── Table ── */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#065f46" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading attendance...</Text>
        </Flex>
      ) : filtered.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm">
          <Icon as={FaCalendarAlt} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No records found.</Text>
        </Box>
      ) : isRange ? (
        /* ── Range Summary Table ── */
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">#</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Employee</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Designation</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" isNumeric>Present</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" isNumeric>Late</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" isNumeric>Half Day</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" isNumeric>Absent</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" isNumeric>Leave</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Rate</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Ledger</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((r, idx) => (
                  <Tr key={r.employee} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td py={3}><Text fontSize="xs" color="gray.400">{idx + 1}</Text></Td>
                    <Td py={3}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" name={r.name} bg={getAvatarColor(r.name)} color="white" fontSize="xs" />
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{r.name || "—"}</Text>
                          <Text fontSize="xs" color="gray.400">{r.employeeCode} · {r.department || "—"}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td py={3}><Text fontSize="sm" color="gray.600">{r.designation || "—"}</Text></Td>
                    <Td py={3} isNumeric>
                      <Badge colorScheme="green" borderRadius="full" px={2}>{r.present}</Badge>
                    </Td>
                    <Td py={3} isNumeric>
                      <Badge colorScheme="orange" borderRadius="full" px={2}>{r.late}</Badge>
                    </Td>
                    <Td py={3} isNumeric>
                      <Badge colorScheme="yellow" borderRadius="full" px={2}>{r.halfDay}</Badge>
                    </Td>
                    <Td py={3} isNumeric>
                      <Badge colorScheme="red" borderRadius="full" px={2}>{r.absent}</Badge>
                    </Td>
                    <Td py={3} isNumeric>
                      <Badge colorScheme="teal" borderRadius="full" px={2}>{r.onLeave}</Badge>
                    </Td>
                    <Td py={3}>
                      <Flex align="center" gap={2}>
                        <Progress value={r.rate} colorScheme={r.rate >= 80 ? "green" : r.rate >= 50 ? "yellow" : "red"}
                          size="xs" borderRadius="full" w="60px" />
                        <Text fontSize="xs" fontWeight="bold" color={r.rate >= 80 ? "#065f46" : r.rate >= 50 ? "#ca8a04" : "#dc2626"}>
                          {r.rate}%
                        </Text>
                      </Flex>
                    </Td>
                    <Td py={3}>
                      <Tooltip label="View Monthly Ledger" hasArrow>
                        <IconButton icon={<FaBook />} size="xs" colorScheme="green" variant="ghost"
                          borderRadius="lg" aria-label="View ledger" onClick={() => openLedgerModal(r)} />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="xs" color="gray.400">
              <Text as="span" fontWeight="semibold" color="gray.600">{filtered.length}</Text> employees ·{" "}
              <Text as="span" fontWeight="semibold" color="gray.600">{records[0]?.totalDays || 0}</Text> day range
            </Text>
          </Flex>
        </Box>
      ) : (
        /* ── Daily Detail Table ── */
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">#</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Employee</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Designation</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Punch In</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Punch Out</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Duration</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Status</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((r, idx) => (
                  <Tr key={r.employee} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td py={3}><Text fontSize="xs" color="gray.400">{idx + 1}</Text></Td>
                    <Td py={3}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" name={r.name} bg={getAvatarColor(r.name)} color="white" fontSize="xs" />
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{r.name || "—"}</Text>
                          <Text fontSize="xs" color="gray.400">{r.employeeCode} · {r.department || "—"}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td py={3}><Text fontSize="sm" color="gray.600">{r.designation || "—"}</Text></Td>
                    <Td py={3}>
                      <Text fontSize="sm" fontWeight="medium" color={r.punchIn ? "gray.800" : "gray.300"}>{fmtTime(r.punchIn)}</Text>
                    </Td>
                    <Td py={3}>
                      <Text fontSize="sm" color={r.punchOut ? "gray.700" : "gray.300"}>{fmtTime(r.punchOut)}</Text>
                    </Td>
                    <Td py={3}><Text fontSize="sm" color="gray.500">{calcDuration(r.punchIn, r.punchOut)}</Text></Td>
                    <Td py={3}>
                      <Badge colorScheme={STATUS_COLORS[r.status] || "gray"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">
                        {r.status === "On Leave"
                          ? `On Leave${r.leaveType ? ` (${r.leaveType})` : ""}`
                          : r.status || "Not Marked"}
                      </Badge>
                    </Td>
                    <Td py={3}>
                      <Flex gap={2}>
                        {isAdmin && (
                          <Tooltip label="Mark / Edit Attendance" hasArrow>
                            <IconButton icon={<FaEdit />} size="xs" colorScheme="blue" variant="ghost"
                              borderRadius="lg" aria-label="Manual" onClick={() => openManualModal(r)} />
                          </Tooltip>
                        )}
                        <Tooltip label="View Monthly Ledger" hasArrow>
                          <IconButton icon={<FaBook />} size="xs" colorScheme="green" variant="ghost"
                            borderRadius="lg" aria-label="Ledger" onClick={() => openLedgerModal(r)} />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100" align="center" gap={2}>
            <Text fontSize="xs" color="gray.400">
              Showing <Text as="span" fontWeight="semibold" color="gray.600">{filtered.length}</Text> of{" "}
              <Text as="span" fontWeight="semibold" color="gray.600">{records.length}</Text> employees
            </Text>
            {isAdmin && <Text fontSize="xs" color="blue.400" ml={2}>· Click <Icon as={FaEdit} /> to mark attendance</Text>}
          </Flex>
        </Box>
      )}

      {/* ══ MANUAL ATTENDANCE MODAL ══ */}
      {isAdmin && selRecord && (
        <Modal isOpen={isManualOpen} onClose={closeManual} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent borderRadius="2xl" shadow="xl">
            <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">Manual Attendance</ModalHeader>
            <ModalCloseButton />
            <ModalBody py={5}>
              <Box bg="gray.50" borderRadius="xl" p={3} mb={4}>
                <Flex align="center" gap={3}>
                  <Avatar size="sm" name={selRecord.name} bg={getAvatarColor(selRecord.name)} color="white" fontSize="xs" />
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">{selRecord.name}</Text>
                    <Text fontSize="xs" color="gray.400">{selRecord.employeeCode} · {fromDate}</Text>
                  </Box>
                </Flex>
              </Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Status</Text>
              <Select mb={4} value={manualStatus} onChange={(e) => setManualStatus(e.target.value)} borderRadius="xl" focusBorderColor="#065f46">
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </Select>
              {manualStatus !== "Absent" && (
                <Grid templateColumns="1fr 1fr" gap={3}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Punch In</Text>
                    <Input type="time" value={manualIn} onChange={(e) => setManualIn(e.target.value)} borderRadius="xl" focusBorderColor="#065f46" />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Punch Out</Text>
                    <Input type="time" value={manualOut} onChange={(e) => setManualOut(e.target.value)} borderRadius="xl" focusBorderColor="#065f46" />
                  </Box>
                </Grid>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
              <Button variant="ghost" onClick={closeManual} borderRadius="xl">Cancel</Button>
              <Button bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl" onClick={handleManualSave}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* ══ LEDGER MODAL ══ */}
      <Modal isOpen={isLedgerOpen} onClose={closeLedger} size="3xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl" shadow="xl" maxH="85vh">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={3}>
            <Flex align="center" gap={3}>
              <Avatar size="sm" name={ledgerEmp?.name} bg={getAvatarColor(ledgerEmp?.name || "")} color="white" fontSize="xs" />
              <Box>
                <Text fontSize="md" fontWeight="bold">{ledgerEmp?.name} — Monthly Ledger</Text>
                <Text fontSize="xs" color="gray.400">{ledgerEmp?.employeeCode} · {ledgerEmp?.department}</Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            {/* Month Nav */}
            <Flex align="center" justify="space-between" mb={4} bg="gray.50" borderRadius="xl" p={3}>
              <IconButton icon={<FaChevronLeft />} size="sm" variant="ghost" onClick={() => changeLedgerMonth(-1)} aria-label="Prev" />
              <Text fontWeight="bold" color="gray.700">{monthNames[ledgerMonth - 1]} {ledgerYear}</Text>
              <IconButton icon={<FaChevronRight />} size="sm" variant="ghost" onClick={() => changeLedgerMonth(1)} aria-label="Next" />
            </Flex>

            {/* Summary tiles */}
            {ledgerRecords.length > 0 && (
              <>
                <Grid templateColumns="repeat(4, 1fr)" gap={3} mb={4}>
                  {[
                    { label: "Present", value: ledgerSummary.present, color: "#065f46", bg: "#f0fdf4" },
                    { label: "Late",    value: ledgerSummary.late,    color: "#ea580c", bg: "#fff7ed" },
                    { label: "Half Day",value: ledgerSummary.halfDay, color: "#ca8a04", bg: "#fefce8" },
                    { label: "Absent",  value: ledgerSummary.absent,  color: "#dc2626", bg: "#fef2f2" },
                  ].map((s) => (
                    <Box key={s.label} bg={s.bg} borderRadius="xl" p={3} textAlign="center" border="1px solid" borderColor="gray.100">
                      <Text fontSize="xl" fontWeight="bold" color={s.color}>{s.value}</Text>
                      <Text fontSize="xs" color="gray.500" mt={0.5}>{s.label}</Text>
                    </Box>
                  ))}
                </Grid>
                {(() => {
                  const rate = ledgerRecords.length > 0
                    ? Math.round(((ledgerSummary.present + ledgerSummary.late * 0.5) / ledgerRecords.length) * 100) : 0;
                  return (
                    <Box mb={4} bg="white" borderRadius="xl" p={3} border="1px solid" borderColor="gray.100">
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="xs" color="gray.500">Attendance Rate</Text>
                        <Text fontSize="xs" fontWeight="bold" color="#065f46">{rate}%</Text>
                      </Flex>
                      <Progress value={rate} colorScheme="green" borderRadius="full" size="sm" />
                      <Text fontSize="xs" color="gray.400" mt={1}>{ledgerRecords.length} records in {monthNames[ledgerMonth-1]} {ledgerYear}</Text>
                    </Box>
                  );
                })()}
              </>
            )}

            {/* Ledger Table */}
            {ledgerLoading ? (
              <Flex justify="center" py={10} direction="column" align="center" gap={3}>
                <Spinner size="lg" color="#065f46" />
                <Text fontSize="sm" color="gray.400">Loading...</Text>
              </Flex>
            ) : ledgerRecords.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Icon as={FaCalendarAlt} fontSize="40px" color="gray.200" mb={3} />
                <Text color="gray.400" fontSize="sm">No records for {monthNames[ledgerMonth-1]} {ledgerYear}</Text>
              </Box>
            ) : (
              <Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th py={3} fontSize="xs" color="gray.500" textTransform="uppercase">Date</Th>
                      <Th py={3} fontSize="xs" color="gray.500" textTransform="uppercase">Punch In</Th>
                      <Th py={3} fontSize="xs" color="gray.500" textTransform="uppercase">Punch Out</Th>
                      <Th py={3} fontSize="xs" color="gray.500" textTransform="uppercase">Duration</Th>
                      <Th py={3} fontSize="xs" color="gray.500" textTransform="uppercase">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {ledgerRecords.map((r) => (
                      <Tr key={r._id} _hover={{ bg: "gray.50" }}>
                        <Td py={2.5}><Text fontSize="sm" fontWeight="medium" color="gray.700">{fmtDate(r.date)}</Text></Td>
                        <Td py={2.5}><Text fontSize="sm" color={r.punchIn ? "gray.800" : "gray.300"}>{fmtTime(r.punchIn)}</Text></Td>
                        <Td py={2.5}><Text fontSize="sm" color={r.punchOut ? "gray.700" : "gray.300"}>{fmtTime(r.punchOut)}</Text></Td>
                        <Td py={2.5}><Text fontSize="sm" color="gray.500">{calcDuration(r.punchIn, r.punchOut)}</Text></Td>
                        <Td py={2.5}>
                          <Badge colorScheme={STATUS_COLORS[r.status] || "gray"} borderRadius="full" px={3} py={0.5} fontSize="xs">
                            {r.status || "Not Marked"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" onClick={closeLedger} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AttendancePage;
