import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Select, Button, Spinner,
  Text, Grid, Icon, Badge, Avatar, InputGroup, InputLeftElement, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Textarea, useDisclosure, useToast,
  Tabs, TabList, TabPanels, Tab, TabPanel, Collapse,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import {
  FaHandHoldingUsd, FaClock, FaCheckCircle, FaTimesCircle, FaFileExcel,
  FaPlus, FaSearch, FaChevronDown, FaChevronUp, FaUserCircle,
} from "react-icons/fa";

const statusColors = { Approved: "green", Rejected: "red", Pending: "orange", Paid: "blue" };
const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

const StatCard = ({ label, value, color, bg, icon, sub }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100"
    borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
        {sub && <Text fontSize="xs" color="gray.400" mt={0.5}>{sub}</Text>}
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
      </Flex>
    </Flex>
  </Box>
);


/* ── Per-employee ledger row (collapsible) ── */
const EmployeeLedgerRow = ({ entry }) => {
  const [open, setOpen] = useState(false);
  const name = entry.employee?.name || "Unknown";

  return (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
      overflow="hidden" shadow="sm" mb={3}>
      {/* Header row — clickable */}
      <Flex
        px={5} py={3.5} align="center" gap={3} cursor="pointer"
        _hover={{ bg: "gray.50" }} onClick={() => setOpen(!open)}
        transition="background 0.15s"
      >
        <Avatar size="sm" name={name} bg={getAvatarBg(name)} color="white" />
        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="700" color="gray.800">{name}</Text>
          <Text fontSize="xs" color="gray.400">{entry.employee?.department} · {entry.employee?.designation || ""}</Text>
        </Box>

        {/* Summary pills */}
        <Flex gap={2} flexWrap="wrap" flexShrink={0}>
          <Flex align="center" gap={1.5} px={2.5} py={1} bg="purple.50" borderRadius="lg">
            <Text fontSize="11px" color="purple.600" fontWeight="700">Total</Text>
            <Text fontSize="12px" fontWeight="800" color="purple.800">Rs {entry.totalAmount.toLocaleString()}</Text>
          </Flex>
          {entry.paidAmount > 0 && (
            <Flex align="center" gap={1.5} px={2.5} py={1} bg="blue.50" borderRadius="lg">
              <Text fontSize="11px" color="blue.600" fontWeight="700">Deducted</Text>
              <Text fontSize="12px" fontWeight="800" color="blue.800">Rs {entry.paidAmount.toLocaleString()}</Text>
            </Flex>
          )}
          {entry.approvedAmount > 0 && (
            <Flex align="center" gap={1.5} px={2.5} py={1} bg="green.50" borderRadius="lg">
              <Text fontSize="11px" color="green.600" fontWeight="700">Pending Payroll</Text>
              <Text fontSize="12px" fontWeight="800" color="green.800">Rs {entry.approvedAmount.toLocaleString()}</Text>
            </Flex>
          )}
          {entry.pendingAmount > 0 && (
            <Flex align="center" gap={1.5} px={2.5} py={1} bg="orange.50" borderRadius="lg">
              <Text fontSize="11px" color="orange.600" fontWeight="700">Pending Approval</Text>
              <Text fontSize="12px" fontWeight="800" color="orange.700">Rs {entry.pendingAmount.toLocaleString()}</Text>
            </Flex>
          )}
          <Badge borderRadius="full" fontSize="xs" colorScheme="gray" px={2}>{entry.advances.length} records</Badge>
        </Flex>

        <Icon as={open ? FaChevronUp : FaChevronDown} color="gray.400" boxSize={3} ml={1} />
      </Flex>

      {/* Expandable detail table */}
      <Collapse in={open} animateOpacity>
        <Box borderTop="1px solid" borderColor="gray.100">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr bg="gray.50">
                <Th py={2.5} fontSize="xs" color="gray.400" textTransform="uppercase">Month</Th>
                <Th py={2.5} fontSize="xs" color="gray.400" textTransform="uppercase">Date</Th>
                <Th py={2.5} fontSize="xs" color="gray.400" textTransform="uppercase" isNumeric>Amount</Th>
                <Th py={2.5} fontSize="xs" color="gray.400" textTransform="uppercase">Reason</Th>
                <Th py={2.5} fontSize="xs" color="gray.400" textTransform="uppercase">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {entry.advances.map((adv, idx) => {
                const d = new Date(adv.date);
                const monthLabel = d.toLocaleString("default", { month: "short", year: "numeric" });
                return (
                  <Tr key={adv._id || idx} _hover={{ bg: "gray.50" }}>
                    <Td py={2.5}>
                      <Text fontSize="sm" color="gray.600" fontWeight="600">{monthLabel}</Text>
                    </Td>
                    <Td py={2.5}>
                      <Text fontSize="sm" color="gray.500">{d.toLocaleDateString()}</Text>
                    </Td>
                    <Td py={2.5} isNumeric>
                      <Text fontSize="sm" fontWeight="700" color="#7c3aed">Rs {adv.amount?.toLocaleString()}</Text>
                    </Td>
                    <Td py={2.5} maxW="220px">
                      <Text fontSize="sm" color="gray.600" noOfLines={1} title={adv.reason}>{adv.reason}</Text>
                    </Td>
                    <Td py={2.5}>
                      <Badge colorScheme={statusColors[adv.status] || "orange"} borderRadius="full"
                        px={2.5} py={0.5} fontSize="xs" fontWeight="semibold">
                        {adv.status === "Paid" ? "Deducted" : (adv.status || "Pending")}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {/* Employee total footer */}
          <Flex px={5} py={2.5} bg="gray.50" borderTop="1px solid" borderColor="gray.100"
            justify="flex-end" align="center" gap={6}>
            <Text fontSize="xs" color="gray.500">
              Deducted via Payroll:{" "}
              <Text as="span" fontWeight="700" color="blue.600">Rs {entry.paidAmount.toLocaleString()}</Text>
            </Text>
            <Text fontSize="xs" color="gray.500">
              Total Advance Taken:{" "}
              <Text as="span" fontWeight="700" color="#7c3aed">Rs {entry.totalAmount.toLocaleString()}</Text>
            </Text>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const AdvanceReport = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isAdmin = user?.role === "Admin";

  // Monthly Report state
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.slice(0, 7) + "-01";
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Employee Ledger state
  const [ledgerYear, setLedgerYear] = useState(new Date().getFullYear());
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "", amount: "", reason: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchAdvances = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/advances?fromDate=${fromDate}&toDate=${toDate}`);
      setAdvances(data);
    } catch {
      toast({ title: "Failed to load advance report", status: "error", duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [fromDate, toDate, toast]);

  const fetchLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const { data } = await api.get(`/advances/ledger?year=${ledgerYear}`);
      setLedgerData(data);
    } catch {
      toast({ title: "Failed to load ledger", status: "error", duration: 3000, isClosable: true });
    } finally { setLedgerLoading(false); }
  }, [ledgerYear, toast]);

  useEffect(() => { fetchAdvances(); }, [fetchAdvances]);
  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/employees").then(({ data }) => setEmployees(data)).catch(() => {});
  }, [isAdmin]);

  const handleAddAdvance = async () => {
    if (!formData.employeeId || !formData.amount || !formData.reason || !formData.date) {
      toast({ title: "Fill all required fields", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast({ title: "Amount must be greater than 0", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/advances", {
        employeeId: formData.employeeId, amount: formData.amount,
        reason: formData.reason, date: formData.date,
      });
      toast({ title: "Advance Added", description: "Will be deducted in next payroll", status: "success", duration: 3000, isClosable: true });
      onClose();
      setFormData({ employeeId: "", amount: "", reason: "", date: new Date().toISOString().split("T")[0] });
      fetchAdvances();
      fetchLedger();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error", duration: 3000, isClosable: true });
    } finally { setSubmitting(false); }
  };

  const filteredAdvances = advances.filter((a) => {
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || (a.employee?.name || a.employee?.user?.name || "").toLowerCase().includes(q)
      || (a.employee?.department || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filteredLedger = ledgerSearch.trim()
    ? ledgerData.filter((e) => {
        const q = ledgerSearch.toLowerCase();
        return (e.employee?.name || "").toLowerCase().includes(q)
          || (e.employee?.department || "").toLowerCase().includes(q);
      })
    : ledgerData;

  const totalAmount    = advances.reduce((s, a) => s + (a.amount || 0), 0);
  const pendingCount   = advances.filter((a) => !a.status || a.status === "Pending").length;
  const approvedCount  = advances.filter((a) => a.status === "Approved").length;
  const paidCount      = advances.filter((a) => a.status === "Paid").length;
  const paidAmount     = advances.filter((a) => a.status === "Paid").reduce((s, a) => s + (a.amount || 0), 0);

  const ledgerTotalAll   = ledgerData.reduce((s, e) => s + e.totalAmount, 0);
  const ledgerDeducted   = ledgerData.reduce((s, e) => s + e.paidAmount, 0);
  const ledgerPending    = ledgerData.reduce((s, e) => s + e.approvedAmount + e.pendingAmount, 0);

  const exportMonthly = () => {
    const rows = filteredAdvances.map((a) => ({
      Employee:   a.employee?.name || a.employee?.user?.name || "Unknown",
      Department: a.employee?.department || "N/A",
      Amount:     a.amount,
      Reason:     a.reason,
      Date:       new Date(a.date).toLocaleDateString(),
      Status:     a.status || "Pending",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Advance Report");
    XLSX.writeFile(wb, `Advance-Report-${month}.xlsx`);
  };

  const exportLedger = () => {
    const rows = [];
    filteredLedger.forEach((entry) => {
      entry.advances.forEach((adv) => {
        rows.push({
          Employee:   entry.employee?.name || "Unknown",
          Department: entry.employee?.department || "N/A",
          "Advance Date": new Date(adv.date).toLocaleDateString(),
          "Month":        `${adv.month}/${adv.year}`,
          Amount:         adv.amount,
          Reason:         adv.reason,
          Status:         adv.status === "Paid" ? "Deducted" : adv.status,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Advance Ledger");
    XLSX.writeFile(wb, `Advance-Ledger-${ledgerYear}.xlsx`);
  };

  const dateRangeLabel = fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`;

  return (
    <Box>
      {/* ── Header ── */}
      <Box bgGradient="linear(135deg, #021024 0%, #7c3aed 100%)" borderRadius="2xl" p={6} mb={5}
        position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Advance Report</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>{dateRangeLabel} — Advance salary requests, deductions & employee ledger</Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            {isAdmin && (
              <Button size="sm" leftIcon={<FaPlus />} bg="whiteAlpha.200" color="white"
                _hover={{ bg: "whiteAlpha.300" }} borderRadius="xl" onClick={onOpen}
                border="1px solid" borderColor="whiteAlpha.300">
                Add Advance
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* ── Tabs ── */}
      <Tabs variant="unstyled">
        <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" mb={5} px={2} py={2}>
          <TabList gap={1}>
            {["Monthly Report", "Employee Ledger"].map((tab) => (
              <Tab key={tab} borderRadius="xl" fontSize="sm" fontWeight="medium" color="gray.500"
                px={4} py={2} _selected={{ bg: "#7c3aed", color: "white", fontWeight: "semibold" }}>
                {tab}
              </Tab>
            ))}
          </TabList>
        </Box>

        <TabPanels>
          {/* ═══ TAB 1: Monthly Report ═══ */}
          <TabPanel p={0}>
            {/* Stats */}
            <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
              <StatCard label="Total Requests" value={advances.length} color="#7c3aed" bg="#f5f3ff" icon={FaHandHoldingUsd} sub={`Rs ${totalAmount.toLocaleString()}`} />
              <StatCard label="Pending Approval" value={pendingCount} color="#d97706" bg="#fffbeb" icon={FaClock} sub="awaiting review" />
              <StatCard label="Approved" value={approvedCount} color="#065f46" bg="#f0fdf4" icon={FaCheckCircle} sub="pending payroll deduction" />
              <StatCard label="Deducted via Payroll" value={paidCount} color="#dc2626" bg="#fef2f2" icon={FaTimesCircle} sub={`Rs ${paidAmount.toLocaleString()}`} />
            </Grid>

            {/* Filters */}
            <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
              <Flex gap={3} align="flex-end" wrap="wrap">
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">From Date</Text>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                    w="165px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed" />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">To Date</Text>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                    w="165px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed" />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Status</Text>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="160px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed">
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Deducted (Paid)</option>
                    <option value="Rejected">Rejected</option>
                  </Select>
                </Box>
                <Box flex="1" minW="180px">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Search</Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="12px" /></InputLeftElement>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search employee or department..." borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed" />
                  </InputGroup>
                </Box>
                <Flex gap={2}>
                  <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl" onClick={fetchAdvances} isLoading={loading}>Filter</Button>
                  <Button leftIcon={<FaFileExcel />} variant="outline" borderColor="gray.200" borderRadius="xl"
                    onClick={exportMonthly} isDisabled={filteredAdvances.length === 0}>Export</Button>
                </Flex>
              </Flex>
              <Text mt={2} fontSize="xs" color="gray.400">
                Showing records from <Text as="span" fontWeight="600" color="gray.600">{fromDate}</Text> to <Text as="span" fontWeight="600" color="gray.600">{toDate}</Text>
              </Text>
            </Box>

            {/* Info note */}
            <Box bg="purple.50" border="1px solid" borderColor="purple.100" borderRadius="xl" px={4} py={3} mb={4}>
              <Text fontSize="xs" color="purple.700">
                <Text as="span" fontWeight="bold">Auto Deduction:</Text> Approved advances are deducted from net salary during payroll generation. Status becomes "Deducted" once payroll is processed.
              </Text>
            </Box>

            {/* Table */}
            {loading ? (
              <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
                <Spinner size="xl" color="#7c3aed" thickness="3px" />
                <Text color="gray.400" fontSize="sm">Loading advance records...</Text>
              </Flex>
            ) : filteredAdvances.length === 0 ? (
              <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm" border="1px dashed" borderColor="gray.200">
                <Icon as={FaHandHoldingUsd} fontSize="48px" color="gray.200" mb={4} />
                <Text color="gray.500" fontWeight="medium">No advance records for the selected date range.</Text>
              </Box>
            ) : (
              <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Date</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Amount</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Reason</Th>
                        <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAdvances.map((adv) => {
                        const name = adv.employee?.name || adv.employee?.user?.name || "Unknown";
                        return (
                          <Tr key={adv._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                            <Td py={3}>
                              <Flex align="center" gap={3}>
                                <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                                <Box>
                                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                                  <Text fontSize="xs" color="gray.400">{adv.employee?.department || "—"}</Text>
                                </Box>
                              </Flex>
                            </Td>
                            <Td py={3}><Text fontSize="sm" color="gray.700">{new Date(adv.date).toLocaleDateString()}</Text></Td>
                            <Td py={3} isNumeric>
                              <Text fontSize="sm" fontWeight="bold" color="#7c3aed">Rs {adv.amount?.toLocaleString()}</Text>
                            </Td>
                            <Td py={3} maxW="220px">
                              <Text fontSize="sm" color="gray.600" noOfLines={2} title={adv.reason}>{adv.reason}</Text>
                            </Td>
                            <Td py={3}>
                              <Badge colorScheme={statusColors[adv.status] || "orange"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">
                                {adv.status === "Paid" ? "Deducted" : (adv.status || "Pending")}
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
                <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100" justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.400">
                    Showing <Text as="span" fontWeight="semibold" color="gray.600">{filteredAdvances.length}</Text> of{" "}
                    <Text as="span" fontWeight="semibold" color="gray.600">{advances.length}</Text> records
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Total: <Text as="span" fontWeight="bold" color="#7c3aed">
                      Rs {filteredAdvances.reduce((s, a) => s + (a.amount || 0), 0).toLocaleString()}
                    </Text>
                  </Text>
                </Flex>
              </Box>
            )}
          </TabPanel>

          {/* ═══ TAB 2: Employee Ledger ═══ */}
          <TabPanel p={0}>
            {/* Ledger Summary Banner */}
            {ledgerData.length > 0 && (
              <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={4} mb={5}>
                <StatCard label="Total Advance Taken" value={`Rs ${ledgerTotalAll.toLocaleString()}`}
                  color="#7c3aed" bg="#f5f3ff" icon={FaHandHoldingUsd}
                  sub={`${ledgerData.length} employees — ${ledgerYear}`} />
                <StatCard label="Deducted via Payroll" value={`Rs ${ledgerDeducted.toLocaleString()}`}
                  color="#065f46" bg="#f0fdf4" icon={FaCheckCircle} sub="already recovered" />
                <StatCard label="Remaining / Pending" value={`Rs ${ledgerPending.toLocaleString()}`}
                  color="#d97706" bg="#fffbeb" icon={FaClock} sub="pending deduction" />
              </Grid>
            )}

            {/* Ledger Filters */}
            <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
              <Flex gap={3} align="flex-end" wrap="wrap">
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Year</Text>
                  <Select value={ledgerYear} onChange={(e) => setLedgerYear(Number(e.target.value))}
                    w="110px" borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed">
                    {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </Box>
                <Box flex="1" minW="200px">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Search Employee</Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="12px" /></InputLeftElement>
                    <Input value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)}
                      placeholder="Search by name or department..." borderRadius="xl" fontSize="sm" focusBorderColor="#7c3aed" />
                  </InputGroup>
                </Box>
                <Flex gap={2}>
                  <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl"
                    onClick={fetchLedger} isLoading={ledgerLoading}>Refresh</Button>
                  <Button leftIcon={<FaFileExcel />} variant="outline" borderColor="gray.200" borderRadius="xl"
                    onClick={exportLedger} isDisabled={filteredLedger.length === 0}>Export</Button>
                </Flex>
              </Flex>
            </Box>

            <Box bg="purple.50" border="1px solid" borderColor="purple.100" borderRadius="xl" px={4} py={2.5} mb={4}>
              <Text fontSize="xs" color="purple.700">
                <Text as="span" fontWeight="bold">Employee Ledger:</Text> Each employee's complete advance history for {ledgerYear}. Click a row to see individual advance entries.
              </Text>
            </Box>

            {ledgerLoading ? (
              <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
                <Spinner size="xl" color="#7c3aed" thickness="3px" />
                <Text color="gray.400" fontSize="sm">Loading employee ledger...</Text>
              </Flex>
            ) : filteredLedger.length === 0 ? (
              <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm" border="1px dashed" borderColor="gray.200">
                <Icon as={FaUserCircle} fontSize="48px" color="gray.200" mb={4} />
                <Text color="gray.500" fontWeight="medium">No advance records for {ledgerYear}.</Text>
              </Box>
            ) : (
              <Box>
                {filteredLedger.map((entry, i) => (
                  <EmployeeLedgerRow key={entry.employee?._id || i} entry={entry} />
                ))}
                {/* Grand total footer */}
                <Box bg="white" borderRadius="xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100">
                  <Flex justify="flex-end" align="center" gap={6}>
                    <Text fontSize="sm" color="gray.500">
                      {filteredLedger.length} employees
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Deducted: <Text as="span" fontWeight="700" color="blue.600">
                        Rs {filteredLedger.reduce((s, e) => s + e.paidAmount, 0).toLocaleString()}
                      </Text>
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Total Advance: <Text as="span" fontWeight="700" color="#7c3aed">
                        Rs {filteredLedger.reduce((s, e) => s + e.totalAmount, 0).toLocaleString()}
                      </Text>
                    </Text>
                  </Flex>
                </Box>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ── Add Advance Modal (Admin Only) ── */}
      {isAdmin && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent borderRadius="2xl" shadow="xl">
            <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">
              Add Advance Salary
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={5}>
              <Box bg="purple.50" borderRadius="xl" p={3} mb={4}>
                <Text fontSize="xs" color="purple.700">
                  <Text as="span" fontWeight="bold">Auto Deduction:</Text> This advance will be automatically deducted from the employee's payroll.
                </Text>
              </Box>
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Employee</FormLabel>
                <Select placeholder="Select employee..." value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  borderRadius="xl" focusBorderColor="#7c3aed">
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Amount (Rs)</FormLabel>
                <Input type="number" placeholder="e.g. 5000" value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  borderRadius="xl" focusBorderColor="#7c3aed" />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Date</FormLabel>
                <Input type="date" value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  borderRadius="xl" focusBorderColor="#7c3aed" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Reason</FormLabel>
                <Textarea value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for advance..." rows={3} borderRadius="xl" focusBorderColor="#7c3aed" />
              </FormControl>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
              <Button variant="ghost" onClick={onClose} borderRadius="xl">Cancel</Button>
              <Button bg="#7c3aed" color="white" _hover={{ bg: "#6d28d9" }} borderRadius="xl"
                onClick={handleAddAdvance} isLoading={submitting} loadingText="Adding">
                Add Advance
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AdvanceReport;
