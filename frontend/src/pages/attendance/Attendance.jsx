import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Select, Badge, Input,
  Spinner, Text, Grid, Button, useToast, Icon, Avatar, InputGroup,
  InputLeftElement, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure
} from "@chakra-ui/react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../context/AuthContext";
import { manualAttendance } from "../../services/attendanceService";
import {
  FaSearch, FaFilter, FaFileExcel, FaUsers, FaUserCheck,
  FaClock, FaCalendarAlt, FaUserTimes, FaExclamationTriangle, FaEdit
} from "react-icons/fa";

const statusColors = { Present: "green", Late: "orange", "Half Day": "yellow", Absent: "red" };

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

const avatarColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const DailyAttendance = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const location = useLocation();
  const view = new URLSearchParams(location.search).get("view");
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(view === "late" ? "Late" : "All");
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "Admin";
  const canView = user?.role === "Admin" || user?.role === "Manager";

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [manualStatus, setManualStatus] = useState("Present");
  const [manualIn, setManualIn] = useState("");
  const [manualOut, setManualOut] = useState("");

  const loadDaily = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/attendance/daily", { params: { date } });
      setRecords(data);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { loadDaily(); }, [loadDaily]);
  useEffect(() => { if (view === "late") setStatusFilter("Late"); }, [view]);

  const filteredRecords = useMemo(() =>
    records.filter((r) => {
      const matchStatus = statusFilter === "All" ? true
        : statusFilter === "LateOnly" ? r.status === "Late" || r.status === "Half Day"
        : r.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || (r.name && r.name.toLowerCase().includes(q))
        || (r.employeeCode && r.employeeCode.toLowerCase().includes(q))
        || (r.department && r.department.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    }), [records, statusFilter, search]);

  const summary = useMemo(() =>
    records.reduce((acc, r) => {
      if (r.status === "Present") acc.present++;
      else if (r.status === "Late") acc.late++;
      else if (r.status === "Half Day") acc.halfDay++;
      else if (r.status === "Absent") acc.absent++;
      else acc.notMarked++;
      return acc;
    }, { total: records.length, present: 0, late: 0, halfDay: 0, absent: 0, notMarked: 0 }), [records]);

  const changeDay = (offset) => {
    const d = new Date(date);
    if (isNaN(d)) return;
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleExport = () => {
    if (!filteredRecords.length) return;
    const rows = filteredRecords.map((r) => ({
      Date: date, Code: r.employeeCode || "", Name: r.name || "",
      Department: r.department || "", Designation: r.designation || "",
      "Punch In": r.punchIn ? new Date(r.punchIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      "Punch Out": r.punchOut ? new Date(r.punchOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      Status: r.status || ""
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Attendance");
    XLSX.writeFile(wb, `daily-attendance-${date}.xlsx`);
  };

  const handleOpenManual = (record) => {
    setSelectedRecord(record);
    setManualStatus(record.status && record.status !== "Not Marked" ? record.status : "Present");
    setManualIn(record.punchIn ? new Date(record.punchIn).toISOString().slice(11, 16) : "");
    setManualOut(record.punchOut ? new Date(record.punchOut).toISOString().slice(11, 16) : "");
    onOpen();
  };

  const handleManualSave = async () => {
    if (!selectedRecord) return;
    const base = new Date(date || todayStr);
    if (isNaN(base)) return;
    let punchInIso = null, punchOutIso = null;
    if (manualStatus !== "Absent") {
      if (manualIn) { const [h, m] = manualIn.split(":").map(Number); const d = new Date(base); d.setHours(h, m, 0, 0); punchInIso = d.toISOString(); }
      if (manualOut) { const [h, m] = manualOut.split(":").map(Number); const d = new Date(base); d.setHours(h, m, 0, 0); punchOutIso = d.toISOString(); }
    }
    try {
      await manualAttendance({ employeeId: selectedRecord.employee, date, status: manualStatus, punchIn: punchInIso, punchOut: punchOutIso }, {});
      toast({ title: "Attendance updated", status: "success", duration: 3000, isClosable: true });
      loadDaily();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update", status: "error", duration: 3000, isClosable: true });
    }
  };

  const formattedDate = new Date(date).toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #1d4ed8 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Daily Attendance</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>{formattedDate}</Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            <Button size="sm" variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl" onClick={() => changeDay(-1)}>← Prev</Button>
            <Button size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} borderRadius="xl" onClick={() => setDate(todayStr)} isDisabled={date === todayStr}>Today</Button>
            <Button size="sm" variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl" onClick={() => changeDay(1)}>Next →</Button>
            <Button size="sm" leftIcon={<FaFileExcel />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl" onClick={handleExport} isDisabled={!filteredRecords.length}>Export</Button>
            <Button size="sm" variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} borderRadius="xl" onClick={() => navigate("/dashboard/attendance")}>Ledger View</Button>
          </Flex>
        </Flex>
      </Box>

      {/* Date Picker */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} align="center" wrap="wrap">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Date</Text>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} w="180px" borderRadius="xl" fontSize="sm" focusBorderColor="#1d4ed8" />
          </Box>
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="13px" /></InputLeftElement>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code or department..."
              borderRadius="xl" bg="gray.50" fontSize="sm" focusBorderColor="#1d4ed8" />
          </InputGroup>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="180px" borderRadius="xl" fontSize="sm" focusBorderColor="#1d4ed8">
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="LateOnly">Late Comers</option>
            <option value="Half Day">Half Day</option>
            <option value="Absent">Absent</option>
            <option value="Not Marked">Not Marked</option>
          </Select>
        </Flex>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3} mb={4}>
        <StatCard label="Total Staff" value={summary.total} color="#065f46" bg="#f0fdf4" icon={FaUsers} />
        <StatCard label="Present" value={summary.present} color="#1d4ed8" bg="#eff6ff" icon={FaUserCheck} />
        <StatCard label="Late" value={summary.late} color="#ea580c" bg="#fff7ed" icon={FaClock} />
        <StatCard label="Half Day" value={summary.halfDay} color="#ca8a04" bg="#fefce8" icon={FaExclamationTriangle} />
        <StatCard label="Absent" value={summary.absent} color="#dc2626" bg="#fef2f2" icon={FaUserTimes} />
        <StatCard label="Not Marked" value={summary.notMarked} color="#6b7280" bg="#f9fafb" icon={FaCalendarAlt} />
      </Grid>

      {/* Table */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#1d4ed8" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading daily records...</Text>
        </Flex>
      ) : filteredRecords.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm">
          <Icon as={FaCalendarAlt} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No records for this day.</Text>
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Department</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Punch In</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Punch Out</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRecords.map((record) => (
                  <Tr key={record.employee}
                    _hover={{ bg: isAdmin ? "blue.50" : "gray.50", cursor: isAdmin ? "pointer" : "default" }}
                    transition="background 0.15s"
                    onClick={() => {
                      if (isAdmin) handleOpenManual(record);
                      else if (canView) navigate(`/dashboard/attendance?employeeId=${record.employee}`);
                    }}
                  >
                    <Td py={3}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" name={record.name} bg={getAvatarColor(record.name)} color="white" fontSize="xs" />
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{record.name}</Text>
                          <Text fontSize="xs" color="gray.400">{record.employeeCode}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td py={3}>
                      <Badge bg="gray.100" color="gray.600" borderRadius="full" px={2} py={0.5} fontSize="xs">{record.department || "—"}</Badge>
                    </Td>
                    <Td py={3}>
                      <Text fontSize="sm" color="gray.700" fontWeight="medium">
                        {record.punchIn ? new Date(record.punchIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </Text>
                    </Td>
                    <Td py={3}>
                      <Text fontSize="sm" color="gray.700">
                        {record.punchOut ? new Date(record.punchOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </Text>
                    </Td>
                    <Td py={3}>
                      <Flex align="center" gap={2}>
                        <Badge colorScheme={statusColors[record.status] || "gray"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">
                          {record.status || "Not Marked"}
                        </Badge>
                        {isAdmin && <Icon as={FaEdit} color="gray.300" fontSize="11px" />}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="xs" color="gray.400">
              Showing <Text as="span" fontWeight="semibold" color="gray.600">{filteredRecords.length}</Text> of <Text as="span" fontWeight="semibold" color="gray.600">{records.length}</Text> employees
              {isAdmin && <Text as="span" color="blue.400"> · Click any row to mark/edit attendance</Text>}
            </Text>
          </Flex>
        </Box>
      )}

      {/* Manual Attendance Modal */}
      {isAdmin && selectedRecord && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent borderRadius="2xl" shadow="xl">
            <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">Manual Attendance</ModalHeader>
            <ModalCloseButton />
            <ModalBody py={5}>
              <Box bg="gray.50" borderRadius="xl" p={3} mb={4}>
                <Flex align="center" gap={3}>
                  <Avatar size="sm" name={selectedRecord.name} bg={getAvatarColor(selectedRecord.name)} color="white" fontSize="xs" />
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.800">{selectedRecord.name}</Text>
                    <Text fontSize="xs" color="gray.400">{selectedRecord.employeeCode} · {date}</Text>
                  </Box>
                </Flex>
              </Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Status</Text>
              <Select mb={4} value={manualStatus} onChange={(e) => setManualStatus(e.target.value)} borderRadius="xl" focusBorderColor="#1d4ed8">
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </Select>
              {manualStatus !== "Absent" && (
                <Grid templateColumns="1fr 1fr" gap={3}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Punch In</Text>
                    <Input type="time" value={manualIn} onChange={(e) => setManualIn(e.target.value)} borderRadius="xl" focusBorderColor="#1d4ed8" />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Punch Out</Text>
                    <Input type="time" value={manualOut} onChange={(e) => setManualOut(e.target.value)} borderRadius="xl" focusBorderColor="#1d4ed8" />
                  </Box>
                </Grid>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
              <Button variant="ghost" onClick={onClose} borderRadius="xl">Cancel</Button>
              <Button bg="#1d4ed8" color="white" _hover={{ bg: "#1e40af" }} borderRadius="xl" onClick={handleManualSave}>Save Attendance</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default DailyAttendance;
