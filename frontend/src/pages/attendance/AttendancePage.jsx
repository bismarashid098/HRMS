import { useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Heading,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  Badge,
  Spinner,
  Text,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useDisclosure
} from "@chakra-ui/react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  punchIn,
  punchOut,
  getMonthlyAttendance,
  requestCorrection
} from "../../services/attendanceService";
import * as XLSX from "xlsx";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getStatusColor = (status) => {
  if (status === "Present") return "green";
  if (status === "Late") return "orange";
  if (status === "Half Day") return "yellow";
  if (status === "Absent") return "red";
  return "gray";
};

const buildSummary = (items) => {
  return items.reduce(
    (acc, record) => {
      acc.totalDays += 1;
      if (record.status === "Present") acc.present += 1;
      else if (record.status === "Absent") acc.absent += 1;
      else if (record.status === "Late") acc.late += 1;
      else if (record.status === "Half Day") acc.halfDay += 1;
      return acc;
    },
    { totalDays: 0, present: 0, absent: 0, late: 0, halfDay: 0 }
  );
};

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const employeeIdFromQuery = searchParams.get("employeeId") || "";

  const today = new Date();
  const [employeeId, setEmployeeId] = useState(
    employeeIdFromQuery || user?.employeeId || ""
  );
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0
  });
  const [correctionRecord, setCorrectionRecord] = useState(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const {
    isOpen: isCorrectionOpen,
    onOpen: openCorrection,
    onClose: closeCorrection
  } = useDisclosure();

  const isAdmin = user?.role === "Admin" || user?.role === "HR";
  const effectiveEmployeeId = isAdmin
    ? employeeId
    : user?.employeeId || employeeId || "";
  const canPunch = !!effectiveEmployeeId;

  useEffect(() => {
    if (employeeIdFromQuery) {
      setEmployeeId(employeeIdFromQuery);
    }
  }, [employeeIdFromQuery]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!isAdmin) {
        return;
      }
      setEmployeesLoading(true);
      try {
        const { data } = await api.get("/employees");
        setEmployees(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load employees.",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, [isAdmin, toast]);

  useEffect(() => {
    if (!isAdmin || !employeeSearch.trim() || employees.length === 0) {
      return;
    }
    const search = employeeSearch.trim().toLowerCase();
    const found = employees.find(
      (emp) =>
        (emp.user?.name && emp.user.name.toLowerCase().includes(search)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(search))
    );
    if (found) {
      setEmployeeId(found._id);
    }
  }, [employeeSearch, employees, isAdmin]);

  const handleDateChange = (value) => {
    setSelectedDate(value);
    if (!value) {
      return;
    }
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      setMonth(d.getMonth() + 1);
      setYear(d.getFullYear());
    }
  };

  const loadAttendance = useCallback(async () => {
    if (!effectiveEmployeeId) {
      toast({
        title: "Employee required",
        description: "Please select or enter an employee first.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setLoading(true);
    try {
      const params = {
        employeeId: effectiveEmployeeId,
        month,
        year
      };

      if (selectedDate) {
        const d = new Date(selectedDate);
        if (!Number.isNaN(d.getTime())) {
          params.day = d.getDate();
        }
      }

      const { data } = await getMonthlyAttendance(params);
      setRecords(data);
      setSummary(buildSummary(data));
    } catch {
      toast({
        title: "Error",
        description: "Failed to load attendance records.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [effectiveEmployeeId, month, year, selectedDate, toast]);

  const handlePunch = async (type) => {
    if (!effectiveEmployeeId) {
      toast({
        title: "Employee required",
        description: "Please select or enter an employee first.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setPunchLoading(true);
    try {
      if (type === "in") {
        await punchIn(effectiveEmployeeId);
        toast({
          title: "Punch in",
          description: "Punch in successful.",
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } else {
        await punchOut(effectiveEmployeeId);
        toast({
          title: "Punch out",
          description: "Punch out successful.",
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
      await loadAttendance();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (type === "in" ? "Punch in failed." : "Punch out failed.");
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleSubmitCorrection = async () => {
    if (!correctionRecord || !correctionReason.trim()) {
      return;
    }
    try {
      await requestCorrection(correctionRecord._id, correctionReason.trim());
      toast({
        title: "Request sent",
        description: "Your correction request has been submitted.",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      closeCorrection();
      setCorrectionReason("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to submit correction request.";
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    if (effectiveEmployeeId) {
      loadAttendance();
    }
  }, [effectiveEmployeeId, loadAttendance]);

  const filteredRecords = records.filter((record) => {
    if (statusFilter === "All") {
      return true;
    }
    if (statusFilter === "Not Marked") {
      return !record.status;
    }
    return record.status === statusFilter;
  });

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "No data",
        description: "There are no attendance records to export.",
        status: "info",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const rows = filteredRecords.map((record) => ({
      Date: formatDate(record.date),
      "Punch In": formatTime(record.punchIn),
      "Punch Out": formatTime(record.punchOut),
      Status: record.status || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(
      workbook,
      `attendance-${month}-${year}-${effectiveEmployeeId || "employee"}.xlsx`
    );
  };

  return (
    <Box p={6}>
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        gap={3}
        wrap="wrap"
      >
        <Box>
          <Heading size="lg" color="gray.700">
            Attendance
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Monthly attendance ledger with punch in/out and smart summary.
          </Text>
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          isDisabled={records.length === 0}
        >
          Export Excel
        </Button>
      </Flex>

      <Box
        mb={6}
        bg="white"
        p={4}
        borderRadius="lg"
        shadow="sm"
      >
        <Flex
          gap={4}
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
        >
          <Box>
            <Text fontSize="sm" mb={1}>
              Employee
            </Text>
            {isAdmin ? (
              <Flex gap={2}>
                <Select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={
                    employeesLoading ? "Loading employees..." : "Select Employee"
                  }
                  maxW="220px"
                  isDisabled={employeesLoading}
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.user?.name || "N/A"} ({emp.employeeId})
                    </option>
                  ))}
                </Select>
                <Input
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Type name or ID"
                  maxW="220px"
                />
              </Flex>
            ) : (
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Your Employee ID"
                maxW="260px"
                isDisabled
              />
            )}
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Date (optional)
            </Text>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              maxW="180px"
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Month
            </Text>
            <Select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              maxW="140px"
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Year
            </Text>
            <Input
              type="number"
              value={year}
              onChange={(e) => {
                const inputYear = Number(e.target.value);
                if (
                  !Number.isNaN(inputYear) &&
                  inputYear > 1990 &&
                  inputYear < 2100
                ) {
                  setYear(inputYear);
                }
              }}
              maxW="120px"
            />
          </Box>

          <Flex gap={3} mt={{ base: 2, md: 6 }}>
            <Button
              colorScheme="green"
              onClick={loadAttendance}
              isLoading={loading}
            >
              Load Attendance
            </Button>
            <Button
              colorScheme="green"
              onClick={() => handlePunch("in")}
              isLoading={punchLoading}
              isDisabled={!canPunch}
            >
              Punch In
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handlePunch("out")}
              isLoading={punchLoading}
              isDisabled={!canPunch}
            >
              Punch Out
            </Button>
          </Flex>
        </Flex>
      </Box>

      {records.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Total Days</StatLabel>
            <StatNumber>{summary.totalDays}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Present</StatLabel>
            <StatNumber color="green.500">{summary.present}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Absent</StatLabel>
            <StatNumber color="red.500">{summary.absent}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Late</StatLabel>
            <StatNumber color="orange.400">{summary.late}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Half Day</StatLabel>
            <StatNumber color="yellow.500">{summary.halfDay}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="green.400" />
        </Flex>
      ) : records.length === 0 ? (
        <Text color="gray.500">No attendance records for this period.</Text>
      ) : (
        <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
          <Box p={4} borderBottomWidth="1px" borderColor="gray.100">
            <Flex
              gap={4}
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "center" }}
            >
              <Box maxW={{ base: "100%", md: "220px" }}>
                <Text fontSize="sm" mb={1}>
                  Filter by Status
                </Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  bg="white"
                >
                  <option value="All">All</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Not Marked">Not Marked</option>
                </Select>
              </Box>
              <Text fontSize="sm" color="gray.500">
                Showing {filteredRecords.length} of {records.length} records
              </Text>
            </Flex>
          </Box>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Date</Th>
                <Th>Punch In</Th>
                <Th>Punch Out</Th>
                <Th>Status</Th>
                {!isAdmin && <Th>Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {filteredRecords.map((record) => (
                <Tr key={record._id}>
                  <Td>{formatDate(record.date)}</Td>
                  <Td>{formatTime(record.punchIn)}</Td>
                  <Td>{formatTime(record.punchOut)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(record.status)}>
                      {record.status || "-"}
                    </Badge>
                  </Td>
                  {!isAdmin && (
                    <Td>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setCorrectionRecord(record);
                          setCorrectionReason("");
                          openCorrection();
                        }}
                      >
                        Request Correction
                      </Button>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isCorrectionOpen} onClose={closeCorrection} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Attendance Correction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3} fontSize="sm" color="gray.600">
              {correctionRecord
                ? `${formatDate(correctionRecord.date)} • ${formatTime(
                    correctionRecord.punchIn
                  )} - ${formatTime(correctionRecord.punchOut)}`
                : ""}
            </Text>
            <Textarea
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="Explain what needs to be corrected (time, status, etc.)"
              rows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={closeCorrection}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitCorrection}
              isDisabled={!correctionReason.trim()}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AttendancePage;
