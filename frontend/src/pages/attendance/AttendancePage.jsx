import { useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Select, Input,
  Badge, Spinner, Text, useToast, Grid, GridItem, Icon, InputGroup,
  InputLeftElement, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Textarea, useDisclosure,
  Avatar, Progress
} from "@chakra-ui/react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { punchIn, punchOut, getMonthlyAttendance, requestCorrection } from "../../services/attendanceService";
import * as XLSX from "xlsx";
import {
  FaSearch, FaFilter, FaFileExcel, FaClock, FaUserCheck,
  FaUserTimes, FaExclamationTriangle, FaCalendarAlt, FaPlay, FaStop
} from "react-icons/fa";

const formatDate = (v) => { if (!v) return "-"; const d = new Date(v); return isNaN(d) ? "-" : d.toLocaleDateString("en-PK"); };
const formatTime = (v) => { if (!v) return "-"; const d = new Date(v); return isNaN(d) ? "-" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };

const statusColors = { Present: "green", Late: "orange", "Half Day": "yellow", Absent: "red" };
const statusBg = { Present: "#f0fdf4", Late: "#fff7ed", "Half Day": "#fefce8", Absent: "#fef2f2" };
const statusBorder = { Present: "#065f46", Late: "#ea580c", "Half Day": "#ca8a04", Absent: "#dc2626" };

const buildSummary = (items) =>
  items.reduce((acc, r) => {
    acc.totalDays++;
    if (r.status === "Present") acc.present++;
    else if (r.status === "Absent") acc.absent++;
    else if (r.status === "Late") acc.late++;
    else if (r.status === "Half Day") acc.halfDay++;
    return acc;
  }, { totalDays: 0, present: 0, absent: 0, late: 0, halfDay: 0 });

const StatCard = ({ label, value, color, bg, icon }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
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

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const location = useLocation();
  const employeeIdFromQuery = new URLSearchParams(location.search).get("employeeId") || "";

  const today = new Date();
  const [employeeId, setEmployeeId] = useState(employeeIdFromQuery || user?.employeeId || "");
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);
  const [summary, setSummary] = useState({ totalDays: 0, present: 0, absent: 0, late: 0, halfDay: 0 });
  const [correctionRecord, setCorrectionRecord] = useState(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const { isOpen: isCorrOpen, onOpen: openCorr, onClose: closeCorr } = useDisclosure();

  const isAdmin = user?.role === "Admin" || user?.role === "Manager";
  const effectiveEmployeeId = isAdmin ? employeeId : user?.employeeId || "";
  const canPunch = user?.role === "Admin" && !!effectiveEmployeeId;

  useEffect(() => { if (employeeIdFromQuery) setEmployeeId(employeeIdFromQuery); }, [employeeIdFromQuery]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/employees").then(({ data }) => setEmployees(data)).catch(() => {});
  }, [isAdmin]);

  const loadAttendance = useCallback(async () => {
    if (!effectiveEmployeeId) {
      toast({ title: "Select an employee first", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const { data } = await getMonthlyAttendance({ employeeId: effectiveEmployeeId, month, year });
      setRecords(data);
      setSummary(buildSummary(data));
    } catch {
      toast({ title: "Failed to load attendance", status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [effectiveEmployeeId, month, year, toast]);

  useEffect(() => { if (effectiveEmployeeId) loadAttendance(); }, [effectiveEmployeeId, loadAttendance]);

  const handlePunch = async (type) => {
    if (!effectiveEmployeeId) return;
    setPunchLoading(true);
    try {
      if (type === "in") await punchIn(effectiveEmployeeId);
      else await punchOut(effectiveEmployeeId);
      toast({ title: type === "in" ? "Punched In" : "Punched Out", status: "success", duration: 3000, isClosable: true });
      await loadAttendance();
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || "Punch failed", status: "error", duration: 3000, isClosable: true });
    } finally { setPunchLoading(false); }
  };

  const handleCorrection = async () => {
    if (!correctionRecord || !correctionReason.trim()) return;
    try {
      await requestCorrection(correctionRecord._id, correctionReason.trim());
      toast({ title: "Correction request sent", status: "success", duration: 3000, isClosable: true });
      closeCorr();
      setCorrectionReason("");
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed", status: "error", duration: 3000, isClosable: true });
    }
  };

  const filteredRecords = records.filter((r) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Not Marked") return !r.status;
    return r.status === statusFilter;
  });

  const handleExport = () => {
    if (!filteredRecords.length) { toast({ title: "No data to export", status: "info", duration: 3000, isClosable: true }); return; }
    const rows = filteredRecords.map((r) => ({ Date: formatDate(r.date), "Punch In": formatTime(r.punchIn), "Punch Out": formatTime(r.punchOut), Status: r.status || "" }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance-${month}-${year}.xlsx`);
  };

  const attendanceRate = summary.totalDays > 0 ? Math.round(((summary.present + summary.late * 0.5) / summary.totalDays) * 100) : 0;
  const selectedEmployee = employees.find((e) => e._id === employeeId);
  const empName = selectedEmployee?.name || selectedEmployee?.user?.name || user?.name || "—";

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Attendance Ledger</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
              Monthly punch record · {monthNames[month]} {year}
              {empName !== "—" && ` · ${empName}`}
            </Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            {user?.role === "Admin" && (
              <>
                <Button leftIcon={<FaPlay />} bg="white" color="#065f46" _hover={{ bg: "gray.100" }} size="sm" fontWeight="bold" borderRadius="xl"
                  onClick={() => handlePunch("in")} isLoading={punchLoading} isDisabled={!canPunch}>
                  Punch In
                </Button>
                <Button leftIcon={<FaStop />} bg="red.500" color="white" _hover={{ bg: "red.600" }} size="sm" fontWeight="bold" borderRadius="xl"
                  onClick={() => handlePunch("out")} isLoading={punchLoading} isDisabled={!canPunch}>
                  Punch Out
                </Button>
              </>
            )}
            <Button leftIcon={<FaFileExcel />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} size="sm" borderRadius="xl"
              onClick={handleExport} isDisabled={!records.length}>
              Export
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} wrap="wrap" align="flex-end">
          {isAdmin && (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Employee</Text>
              <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Select Employee" w="200px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name || emp.user?.name}</option>
                ))}
              </Select>
            </Box>
          )}
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Month</Text>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} w="140px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
              {monthNames.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Year</Text>
            <Input type="number" value={year} onChange={(e) => { const v = Number(e.target.value); if (v > 1990 && v < 2100) setYear(v); }}
              w="100px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46" />
          </Box>
          <Button bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl" size="md"
            onClick={loadAttendance} isLoading={loading} leftIcon={<FaCalendarAlt />}>
            Load
          </Button>
        </Flex>
      </Box>

      {/* Summary Cards */}
      {records.length > 0 && (
        <>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(5, 1fr)" }} gap={4} mb={4}>
            <StatCard label="Total Days" value={summary.totalDays} color="#1d4ed8" bg="#eff6ff" icon={FaCalendarAlt} />
            <StatCard label="Present" value={summary.present} color="#065f46" bg="#f0fdf4" icon={FaUserCheck} />
            <StatCard label="Absent" value={summary.absent} color="#dc2626" bg="#fef2f2" icon={FaUserTimes} />
            <StatCard label="Late" value={summary.late} color="#ea580c" bg="#fff7ed" icon={FaClock} />
            <StatCard label="Half Day" value={summary.halfDay} color="#ca8a04" bg="#fefce8" icon={FaExclamationTriangle} />
          </Grid>
          <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">Attendance Rate</Text>
              <Text fontSize="sm" fontWeight="bold" color="#065f46">{attendanceRate}%</Text>
            </Flex>
            <Progress value={attendanceRate} colorScheme="green" borderRadius="full" size="sm" bg="gray.100" />
            <Text fontSize="xs" color="gray.400" mt={1}>Based on {summary.totalDays} working days recorded</Text>
          </Box>
        </>
      )}

      {/* Table */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#065f46" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading attendance records...</Text>
        </Flex>
      ) : records.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm">
          <Icon as={FaCalendarAlt} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No attendance records for this period.</Text>
          <Text fontSize="sm" color="gray.400" mt={1}>Select an employee and month, then click Load.</Text>
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Flex px={5} py={3} align="center" borderBottom="1px solid" borderColor="gray.100" gap={3} wrap="wrap">
            <InputGroup w="200px">
              <InputLeftElement pointerEvents="none"><Icon as={FaFilter} color="gray.300" fontSize="12px" /></InputLeftElement>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} pl={8} borderRadius="xl" fontSize="sm" bg="gray.50">
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Not Marked">Not Marked</option>
              </Select>
            </InputGroup>
            <Text fontSize="xs" color="gray.400" ml="auto">
              {filteredRecords.length} of {records.length} records
            </Text>
          </Flex>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Date</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Punch In</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Punch Out</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Duration</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  {!isAdmin && <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Action</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {filteredRecords.map((record) => {
                  const duration = record.punchIn && record.punchOut
                    ? (() => { const diff = (new Date(record.punchOut) - new Date(record.punchIn)) / 60000; const h = Math.floor(diff / 60); const m = Math.round(diff % 60); return `${h}h ${m}m`; })()
                    : "—";
                  return (
                    <Tr key={record._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      <Td py={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">{formatDate(record.date)}</Text>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="sm" color="gray.600">{formatTime(record.punchIn)}</Text>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="sm" color="gray.600">{formatTime(record.punchOut)}</Text>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="sm" color="gray.500">{duration}</Text>
                      </Td>
                      <Td py={3}>
                        <Badge
                          colorScheme={statusColors[record.status] || "gray"}
                          borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold"
                        >
                          {record.status || "Not Marked"}
                        </Badge>
                      </Td>
                      {!isAdmin && (
                        <Td py={3}>
                          <Button size="xs" variant="outline" colorScheme="orange" borderRadius="lg"
                            onClick={() => { setCorrectionRecord(record); setCorrectionReason(""); openCorr(); }}>
                            Correct
                          </Button>
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Correction Modal */}
      <Modal isOpen={isCorrOpen} onClose={closeCorr} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl" shadow="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">
            Request Attendance Correction
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            {correctionRecord && (
              <Box bg="gray.50" borderRadius="xl" p={3} mb={4}>
                <Text fontSize="sm" color="gray.500">Record</Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  {formatDate(correctionRecord.date)} &nbsp;·&nbsp; {formatTime(correctionRecord.punchIn)} – {formatTime(correctionRecord.punchOut)}
                </Text>
              </Box>
            )}
            <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Reason for correction</Text>
            <Textarea value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="Explain what needs to be corrected..." rows={4} borderRadius="xl" focusBorderColor="#065f46" />
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
            <Button variant="ghost" onClick={closeCorr} borderRadius="xl">Cancel</Button>
            <Button bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl"
              onClick={handleCorrection} isDisabled={!correctionReason.trim()}>
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AttendancePage;
