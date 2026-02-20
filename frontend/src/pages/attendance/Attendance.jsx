import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Badge,
  Input,
  Flex,
  Spinner,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../context/AuthContext";
import { manualAttendance } from "../../services/attendanceService";

const getStatusColor = (status) => {
  if (status === "Present") return "green";
  if (status === "Late") return "orange";
  if (status === "Half Day") return "yellow";
  if (status === "Absent") return "red";
  return "gray";
};

const DailyAttendance = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");

  const todayString = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayString);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(
    view === "late" ? "Late" : "All"
  );
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "Admin" || user?.role === "HR";
  const {
    isOpen: isManualOpen,
    onOpen: openManual,
    onClose: closeManual
  } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [manualStatus, setManualStatus] = useState("Present");
  const [manualIn, setManualIn] = useState("");
  const [manualOut, setManualOut] = useState("");

  const loadDaily = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/attendance/daily", {
        params: { date }
      });
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadDaily();
  }, [loadDaily]);

  useEffect(() => {
    if (view === "late") {
      setStatusFilter("Late");
    }
  }, [view]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "LateOnly"
          ? record.status === "Late" || record.status === "Half Day"
          : record.status === statusFilter;

      const query = search.trim().toLowerCase();
      const matchSearch = !query
        ? true
        : (record.name && record.name.toLowerCase().includes(query)) ||
          (record.employeeCode &&
            record.employeeCode.toLowerCase().includes(query)) ||
          (record.department &&
            record.department.toLowerCase().includes(query));

      return matchStatus && matchSearch;
    });
  }, [records, statusFilter, search]);

  const summary = useMemo(() => {
    return records.reduce(
      (acc, r) => {
        if (r.status === "Present") acc.present += 1;
        else if (r.status === "Late") acc.late += 1;
        else if (r.status === "Half Day") acc.halfDay += 1;
        else if (r.status === "Absent") acc.absent += 1;
        else acc.notMarked += 1;
        return acc;
      },
      { total: records.length, present: 0, late: 0, halfDay: 0, absent: 0, notMarked: 0 }
    );
  }, [records]);

  const handleChangeDate = (value) => {
    setDate(value);
  };

  const changeDay = (offset) => {
    if (!date) {
      return;
    }
    const current = new Date(date);
    if (Number.isNaN(current.getTime())) {
      return;
    }
    current.setDate(current.getDate() + offset);
    const next = current.toISOString().slice(0, 10);
    setDate(next);
  };

  const goToToday = () => {
    setDate(todayString);
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      return;
    }

    const rows = filteredRecords.map((record) => ({
      Date: date,
      Code: record.employeeCode || "",
      Name: record.name || "",
      Department: record.department || "",
      Designation: record.designation || "",
      "Punch In": record.punchIn
        ? new Date(record.punchIn).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "",
      "Punch Out": record.punchOut
        ? new Date(record.punchOut).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "",
      Status: record.status || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Attendance");
    XLSX.writeFile(workbook, `attendance-daily-${date || todayString}.xlsx`);
  };

  const handleOpenManual = (record) => {
    setSelectedRecord(record);
    setManualStatus(record.status && record.status !== "Not Marked" ? record.status : "Present");
    setManualIn(
      record.punchIn
        ? new Date(record.punchIn).toISOString().slice(11, 16)
        : ""
    );
    setManualOut(
      record.punchOut
        ? new Date(record.punchOut).toISOString().slice(11, 16)
        : ""
    );
    openManual();
  };

  const handleManualSave = async () => {
    if (!selectedRecord) return;

    const base = new Date(date || todayString);
    if (Number.isNaN(base.getTime())) {
      toast({
        title: "Invalid date",
        description: "Please select a valid date.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    let punchInIso = null;
    let punchOutIso = null;

    if (manualStatus !== "Absent") {
      if (manualIn) {
        const [h, m] = manualIn.split(":").map(Number);
        const d = new Date(base);
        d.setHours(h || 0, m || 0, 0, 0);
        punchInIso = d.toISOString();
      }
      if (manualOut) {
        const [h, m] = manualOut.split(":").map(Number);
        const d = new Date(base);
        d.setHours(h || 0, m || 0, 0, 0);
        punchOutIso = d.toISOString();
      }
    }

    try {
      await manualAttendance(
        {
          employeeId: selectedRecord.employee,
          date,
          status: manualStatus,
          punchIn: punchInIso,
          punchOut: punchOutIso
        },
        {}
      );
      toast({
        title: "Attendance updated",
        description: "Manual attendance saved.",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      loadDaily();
      closeManual();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update attendance manually.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6} gap={4} wrap="wrap">
        <Box>
          <Heading size="lg" color="gray.700">
            Daily Attendance
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Total staff list with present, late, half day and absent status.
          </Text>
        </Box>
        <Flex gap={2} wrap="wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            isDisabled={filteredRecords.length === 0}
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="green"
            onClick={() => navigate("/dashboard/attendance")}
          >
            Switch to Employee Ledger View
          </Button>
        </Flex>
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
              Date
            </Text>
            <Input
              type="date"
              value={date}
              onChange={(e) => handleChangeDate(e.target.value)}
              maxW="200px"
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Status
            </Text>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW="200px"
            >
              <option value="All">All</option>
              <option value="Present">Present</option>
              <option value="LateOnly">Late Comers</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
              <option value="Not Marked">Not Marked</option>
            </Select>
          </Box>

          <Box flex="1">
            <Text fontSize="sm" mb={1}>
              Search
            </Text>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code or department"
            />
          </Box>
          <Flex gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeDay(-1)}
            >
              Previous Day
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeDay(1)}
            >
              Next Day
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={goToToday}
              isDisabled={date === todayString}
            >
              Today
            </Button>
          </Flex>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 5, lg: 6 }} spacing={4} mb={6}>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total Staff</StatLabel>
          <StatNumber>{summary.total}</StatNumber>
        </Stat>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Present</StatLabel>
          <StatNumber color="green.500">{summary.present}</StatNumber>
        </Stat>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Late</StatLabel>
          <StatNumber color="orange.400">{summary.late}</StatNumber>
        </Stat>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Half Day</StatLabel>
          <StatNumber color="yellow.500">{summary.halfDay}</StatNumber>
        </Stat>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Absent</StatLabel>
          <StatNumber color="red.500">{summary.absent}</StatNumber>
        </Stat>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Not Marked</StatLabel>
          <StatNumber color="gray.600">{summary.notMarked}</StatNumber>
        </Stat>
      </SimpleGrid>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="green.400" />
        </Flex>
      ) : filteredRecords.length === 0 ? (
        <Text color="gray.500">No records for this day.</Text>
      ) : (
        <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Code</Th>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Designation</Th>
                <Th>Punch In</Th>
                <Th>Punch Out</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRecords.map((record) => (
                <Tr
                  key={record.employee}
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                  onClick={() => {
                    if (isAdmin) {
                      handleOpenManual(record);
                    } else {
                      navigate(`/dashboard/employees/${record.employee}`);
                    }
                  }}
                >
                  <Td>{record.employeeCode}</Td>
                  <Td>{record.name}</Td>
                  <Td>{record.department}</Td>
                  <Td>{record.designation}</Td>
                  <Td>
                    {record.punchIn
                      ? new Date(record.punchIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </Td>
                  <Td>
                    {record.punchOut
                      ? new Date(record.punchOut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {isAdmin && selectedRecord && (
        <Modal isOpen={isManualOpen} onClose={closeManual} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Manual Attendance</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontSize="sm" mb={1}>
                Employee
              </Text>
              <Text mb={3} fontWeight="medium">
                {selectedRecord.name} ({selectedRecord.employeeCode})
              </Text>

              <Text fontSize="sm" mb={1}>
                Date
              </Text>
              <Input value={date} isReadOnly mb={3} />

              <Text fontSize="sm" mb={1}>
                Status
              </Text>
              <Select
                mb={3}
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </Select>

              {manualStatus !== "Absent" && (
                <>
                  <Text fontSize="sm" mb={1}>
                    Punch In
                  </Text>
                  <Input
                    type="time"
                    mb={3}
                    value={manualIn}
                    onChange={(e) => setManualIn(e.target.value)}
                  />

                  <Text fontSize="sm" mb={1}>
                    Punch Out
                  </Text>
                  <Input
                    type="time"
                    mb={1}
                    value={manualOut}
                    onChange={(e) => setManualOut(e.target.value)}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={closeManual} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleManualSave}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default DailyAttendance;
