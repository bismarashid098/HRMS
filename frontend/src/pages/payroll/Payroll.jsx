import { useState, useEffect, useContext, useCallback } from "react";
import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Select,
  HStack, Spinner, Text, useToast, IconButton, Tooltip, Grid, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, useDisclosure, Progress, Input, InputGroup, InputLeftElement, Avatar
} from "@chakra-ui/react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  FaFilePdf, FaFileExcel, FaSyncAlt, FaMoneyBillWave, FaSearch,
  FaFilter, FaUsers, FaCheckCircle, FaClock, FaWallet, FaBookOpen
} from "react-icons/fa";

const StatCard = ({ label, value, color, bg, icon }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
      </Flex>
    </Flex>
  </Box>
);

const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

const Payroll = () => {
  const { user } = useContext(AuthContext);
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [payrolls, setPayrolls] = useState([]);
  const [overview, setOverview] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [ledger, setLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isLedgerOpen, onOpen: onLedgerOpen, onClose: onLedgerClose } = useDisclosure();
  const isAdmin = user?.role === "Admin";

  const handleOpenLedger = async (payrollId) => {
    setLedger(null);
    onLedgerOpen();
    setLedgerLoading(true);
    try {
      const { data } = await api.get(`/payroll/${payrollId}/breakdown`);
      setLedger(data);
    } catch {
      toast({ title: "Failed to load ledger", status: "error", duration: 3000, isClosable: true });
      onLedgerClose();
    } finally {
      setLedgerLoading(false);
    }
  };

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const [year, m] = month.split("-");
      const { data } = await api.get(`/payroll?month=${parseInt(m)}&year=${year}`);
      setPayrolls(data);
    } catch { toast({ title: "Error fetching payrolls", status: "error", duration: 3000, isClosable: true }); }
    finally { setLoading(false); }
  }, [month, toast]);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [year, m] = month.split("-");
      const { data } = await api.get(`/payroll/overview?month=${parseInt(m)}&year=${year}`);
      setOverview(data);
    } catch {}
    finally { setOverviewLoading(false); }
  }, [month]);

  useEffect(() => { fetchPayrolls(); }, [fetchPayrolls]);
  useEffect(() => { if (isAdmin) fetchOverview(); }, [fetchOverview, isAdmin]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await api.put(`/payroll/${id}/approve`);
      toast({ title: "Payroll approved", status: "success", duration: 3000, isClosable: true });
      fetchPayrolls();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error", duration: 3000, isClosable: true });
    } finally { setActionLoadingId(null); }
  };

  const handleOpenGenerateModal = () => {
    api.get("/employees").then(({ data }) => setEmployees(data.filter((e) => e.employmentStatus === "Active"))).catch(() => {});
    onOpen();
  };

  const handleGenerateAll = async () => {
    if (!employees.length) { toast({ title: "No active employees", status: "warning" }); return; }
    setGenerating(true);
    setGenerateProgress(0);
    const [year, m] = month.split("-");
    let successCount = 0;
    for (let i = 0; i < employees.length; i++) {
      try {
        await api.post("/payroll/generate", { employeeId: employees[i]._id, month: parseInt(m), year: parseInt(year) });
        successCount++;
      } catch {}
      setGenerateProgress(Math.round(((i + 1) / employees.length) * 100));
    }
    setGenerating(false);
    onClose();
    toast({ title: "Generation Complete", description: `Generated for ${successCount}/${employees.length} employees.`, status: "success", duration: 5000, isClosable: true });
    fetchPayrolls();
  };

  const exportExcel = () => {
    const rows = filteredPayrolls.map((p) => ({
      Employee:          p.employee?.name || p.employee?.user?.name || "",
      Department:        p.employee?.department || "",
      Basic:             p.basicSalary,
      Allowance:         p.allowance,
      "Advance Deducted":  p.advanceDeduction  || 0,
      "Leave Deduction":   p.leaveDeduction    || 0,
      "Extra Off Deduction": p.extraOffDeduction || 0,
      "Total Deductions": p.deductions || 0,
      "Net Salary":       p.netSalary,
      Status:             p.status
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `Payroll-${month}.xlsx`);
  };

  const generatePDF = (payroll) => {
    const doc = new jsPDF();
    doc.setFillColor(6, 95, 70);
    doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SALARY SLIP", 105, 22, null, "center");
    doc.setFontSize(11);
    doc.text("WorkSphere HRMS", 105, 32, null, "center");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Employee: ${payroll.employee?.name || payroll.employee?.user?.name}`, 15, 58);
    doc.text(`ID: ${payroll.employee?.employeeId}`, 15, 66);
    doc.text(`Department: ${payroll.employee?.department}`, 15, 74);
    doc.text(`Designation: ${payroll.employee?.designation}`, 15, 82);
    doc.text(`Month: ${month}`, 130, 58);
    doc.text(`Generated: ${new Date(payroll.createdAt).toLocaleDateString()}`, 130, 66);
    const pdfBody = [
      ["Basic Salary",  payroll.basicSalary.toLocaleString()],
      ["Allowance",     payroll.allowance.toLocaleString()],
      ["Gross Salary",  (payroll.basicSalary + payroll.allowance).toLocaleString()],
      ["", ""],
      ["Advance Deduction",         payroll.advanceDeduction  > 0 ? `- Rs ${Math.round(payroll.advanceDeduction).toLocaleString()}`  : "—"],
      ["Unpaid Leave Deduction",   payroll.leaveDeduction    > 0 ? `- Rs ${Math.round(payroll.leaveDeduction).toLocaleString()}`   : "—"],
      ["Extra Off (Absent Days)",  payroll.extraOffDeduction > 0 ? `- Rs ${Math.round(payroll.extraOffDeduction).toLocaleString()}` : "—"],
      ["Total Deductions",        `- Rs ${Math.round(payroll.deductions).toLocaleString()}`],
      [{ content: "NET PAYABLE", styles: { fontStyle: "bold", fillColor: [220, 252, 231] } },
       { content: `Rs ${payroll.netSalary.toLocaleString()}`, styles: { fontStyle: "bold", fillColor: [220, 252, 231] } }],
    ];
    doc.autoTable({
      startY: 92,
      head: [["Description", "Amount (Rs)"]],
      body: pdfBody,
      theme: "grid",
      headStyles: { fillColor: [6, 95, 70] },
    });
    doc.setFontSize(9);
    doc.text("This is a computer-generated document and does not require a signature.", 105, 282, null, "center");
    doc.save(`Payslip-${payroll.employee?.name || payroll.employee?.user?.name}-${month}.pdf`);
  };

  const getMonthOptions = () => {
    const options = [];
    const current = new Date();
    current.setMonth(current.getMonth() + 1);
    for (let i = 0; i < 13; i++) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      options.push(<option key={`${y}-${m}`} value={`${y}-${m}`}>{current.toLocaleString("default", { month: "long", year: "numeric" })}</option>);
      current.setMonth(current.getMonth() - 1);
    }
    return options;
  };

  const departmentOptions = Array.from(new Set(payrolls.map((p) => p.employee?.department).filter(Boolean))).sort();

  const filteredPayrolls = payrolls.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (departmentFilter !== "All" && p.employee?.department !== departmentFilter) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const name = (p.employee?.name || p.employee?.user?.name || "").toLowerCase();
      const dept = (p.employee?.department || "").toLowerCase();
      const eid = (p.employee?.employeeId || "").toLowerCase();
      if (!name.includes(q) && !dept.includes(q) && !eid.includes(q)) return false;
    }
    return true;
  });

  const summary = filteredPayrolls.reduce((acc, p) => {
    acc.count++;
    if (p.status === "Approved") acc.approved++;
    else acc.pending++;
    acc.totalNet += p.netSalary || 0;
    acc.totalDeductions += p.deductions || 0;
    acc.totalAdvance += p.advanceDeduction || 0;
    return acc;
  }, { count: 0, approved: 0, pending: 0, totalNet: 0, totalDeductions: 0, totalAdvance: 0 });

  const fmtMoney = (n) => n >= 1000000 ? `Rs ${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `Rs ${(n / 1000).toFixed(0)}K` : `Rs ${n}`;

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">Payroll Management</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Generate, review and approve monthly salary payouts</Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            <Button leftIcon={<FaFileExcel />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} size="sm" borderRadius="xl" onClick={exportExcel} isDisabled={!filteredPayrolls.length}>Export</Button>
            <Button leftIcon={<FaSyncAlt />} variant="outline" borderColor="whiteAlpha.400" color="white" _hover={{ bg: "whiteAlpha.200" }} size="sm" borderRadius="xl" isLoading={loading} onClick={() => { fetchPayrolls(); if (isAdmin) fetchOverview(); }}>Refresh</Button>
            {isAdmin && (
              <Button leftIcon={<FaMoneyBillWave />} bg="white" color="#065f46" _hover={{ bg: "gray.100" }} size="sm" fontWeight="bold" borderRadius="xl" onClick={handleOpenGenerateModal}>Generate Payroll</Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Stats */}
      {filteredPayrolls.length > 0 && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(5, 1fr)" }} gap={4} mb={4}>
          <StatCard label="Total Payslips"     value={summary.count}                    color="#065f46" bg="#f0fdf4" icon={FaUsers}       />
          <StatCard label="Approved"           value={summary.approved}                 color="#1d4ed8" bg="#eff6ff" icon={FaCheckCircle}  />
          <StatCard label="Pending"            value={summary.pending}                  color="#d97706" bg="#fffbeb" icon={FaClock}        />
          <StatCard label="Advance Deductions" value={fmtMoney(summary.totalAdvance)}   color="#dc2626" bg="#fef2f2" icon={FaMoneyBillWave}/>
          <StatCard label="Total Net Salary"   value={fmtMoney(summary.totalNet)}       color="#7c3aed" bg="#f5f3ff" icon={FaWallet}       />
        </Grid>
      )}

      {/* Salary Overview (Admin) */}
      {isAdmin && (
        <Box bg="white" borderRadius="2xl" p={5} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontWeight="bold" fontSize="md" color="gray.800">Employee Salary Overview</Text>
              <Text fontSize="xs" color="gray.400">Active employees with expected net salary for {month}</Text>
            </Box>
          </Flex>
          {overviewLoading ? (
            <Flex justify="center" h="120px" align="center"><Spinner color="#065f46" /></Flex>
          ) : overview.length === 0 ? (
            <Text fontSize="sm" color="gray.400">No active employees found.</Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr bg="gray.50">
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Department</Th>
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Fixed Salary</Th>
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Unpaid Days</Th>
                    <Th py={3} fontSize="xs" color="orange.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Advance</Th>
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Other Deductions</Th>
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Net Salary</Th>
                    <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {overview.map((item) => (
                    <Tr key={item.employeeId} _hover={{ bg: "gray.50" }}>
                      <Td py={3}>
                        <Flex align="center" gap={2}>
                          <Avatar size="xs" name={item.name} bg={getAvatarBg(item.name)} color="white" fontSize="10px" />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">{item.name}</Text>
                            <Text fontSize="xs" color="gray.400">{item.employeeCode}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={3}><Badge bg="gray.100" color="gray.600" borderRadius="full" px={2} fontSize="xs">{item.department}</Badge></Td>
                      <Td py={3} isNumeric><Text fontSize="sm" color="gray.700">Rs {Number(item.basicSalary || 0).toLocaleString()}</Text></Td>
                      <Td py={3} isNumeric><Text fontSize="sm" color={item.unpaidLeaveDays > 0 ? "red.500" : "gray.500"}>{item.unpaidLeaveDays || 0}</Text></Td>
                      <Td py={3} isNumeric>
                        {item.advanceDeduction > 0 ? (
                          <Text fontSize="sm" fontWeight="semibold" color="orange.500">- Rs {Number(item.advanceDeduction).toLocaleString()}</Text>
                        ) : (
                          <Text fontSize="sm" color="gray.300">—</Text>
                        )}
                      </Td>
                      <Td py={3} isNumeric>
                        <Text fontSize="sm" color="red.500">
                          {(item.totalDeductions - (item.advanceDeduction || 0)) > 0
                            ? `- Rs ${Math.round(item.totalDeductions - (item.advanceDeduction || 0)).toLocaleString()}`
                            : "—"}
                        </Text>
                      </Td>
                      <Td py={3} isNumeric><Text fontSize="sm" fontWeight="bold" color="#065f46">Rs {Number(item.netSalary || 0).toLocaleString()}</Text></Td>
                      <Td py={3}>
                        <Badge colorScheme={item.payrollStatus === "Approved" ? "green" : item.payrollStatus === "Generated" ? "orange" : "gray"}
                          borderRadius="full" px={2} fontSize="xs">{item.payrollStatus || "Pending"}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      )}

      {/* Filters */}
      <Box bg="white" borderRadius="2xl" p={4} mb={4} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex gap={3} wrap="wrap" align="flex-end">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1} textTransform="uppercase">Month</Text>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} w="220px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">{getMonthOptions()}</Select>
          </Box>
          <InputGroup flex="1" minW="200px">
            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="gray.300" fontSize="13px" /></InputLeftElement>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, department or ID..."
              borderRadius="xl" bg="gray.50" fontSize="sm" focusBorderColor="#065f46" />
          </InputGroup>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="150px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </Select>
          {isAdmin && (
            <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} w="180px" borderRadius="xl" fontSize="sm" focusBorderColor="#065f46">
              <option value="All">All Departments</option>
              {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          )}
        </Flex>
        <Text mt={2} fontSize="xs" color="gray.400">Showing {filteredPayrolls.length} of {payrolls.length} payslips</Text>
      </Box>

      {/* Table */}
      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#065f46" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading payroll records...</Text>
        </Flex>
      ) : payrolls.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm" border="1px dashed" borderColor="gray.200">
          <Icon as={FaWallet} fontSize="48px" color="gray.200" mb={4} />
          <Text color="gray.500" fontWeight="medium">No payroll records for {month}.</Text>
          {isAdmin && <Button mt={4} size="sm" bg="#065f46" color="white" borderRadius="xl" onClick={handleOpenGenerateModal}>Generate Now</Button>}
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Employee</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Basic</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Allowance</Th>
                  <Th py={3} fontSize="xs" color="orange.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Advance Deducted</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Other Deductions</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" isNumeric>Net Salary</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPayrolls.length === 0 ? (
                  <Tr><Td colSpan={9} textAlign="center" color="gray.400" py={8}>No payrolls match the current filters.</Td></Tr>
                ) : filteredPayrolls.map((p) => {
                  const name = p.employee?.name || p.employee?.user?.name || "Unknown";
                  return (
                    <Tr key={p._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                      <Td py={3}>
                        <Flex align="center" gap={3}>
                          <Avatar size="xs" name={name} bg={getAvatarBg(name)} color="white" fontSize="10px" />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">{name}</Text>
                            <Text fontSize="xs" color="gray.400">{p.employee?.department}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py={3} isNumeric><Text fontSize="sm" color="gray.700">Rs {p.basicSalary?.toLocaleString()}</Text></Td>
                      <Td py={3} isNumeric><Text fontSize="sm" color="gray.700">Rs {p.allowance?.toLocaleString()}</Text></Td>
                      <Td py={3} isNumeric>
                        {p.advanceDeduction > 0 ? (
                          <Tooltip label={`Advance salary deducted`} hasArrow>
                            <Text fontSize="sm" fontWeight="semibold" color="orange.500" cursor="default">
                              - Rs {p.advanceDeduction?.toLocaleString()}
                            </Text>
                          </Tooltip>
                        ) : (
                          <Text fontSize="sm" color="gray.300">—</Text>
                        )}
                      </Td>
                      <Td py={3} isNumeric>
                        <Text fontSize="sm" color="red.500">
                          {(p.deductions - (p.advanceDeduction || 0)) > 0
                            ? `- Rs ${Math.round(p.deductions - (p.advanceDeduction || 0)).toLocaleString()}`
                            : "—"}
                        </Text>
                      </Td>
                      <Td py={3} isNumeric><Text fontSize="sm" fontWeight="bold" color="#065f46">Rs {p.netSalary?.toLocaleString()}</Text></Td>
                      <Td py={3}>
                        <Badge colorScheme={p.status === "Approved" ? "green" : "orange"} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="semibold">{p.status}</Badge>
                      </Td>
                      <Td py={3}>
                        <HStack spacing={1}>
                          {isAdmin && p.status !== "Approved" && (
                            <Button size="xs" colorScheme="green" borderRadius="lg" onClick={() => handleApprove(p._id)}
                              isLoading={actionLoadingId === p._id} isDisabled={actionLoadingId && actionLoadingId !== p._id}>Approve</Button>
                          )}
                          <Tooltip label="Salary Ledger" hasArrow>
                            <IconButton icon={<FaBookOpen />} colorScheme="blue" variant="ghost" size="sm" borderRadius="lg"
                              onClick={() => handleOpenLedger(p._id)} aria-label="Ledger" />
                          </Tooltip>
                          <Tooltip label="Download Payslip PDF" hasArrow>
                            <IconButton icon={<FaFilePdf />} colorScheme="red" variant="ghost" size="sm" borderRadius="lg"
                              onClick={() => generatePDF(p)} aria-label="PDF" />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* ── Ledger Modal ── */}
      <Modal isOpen={isLedgerOpen} onClose={onLedgerClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" shadow="2xl" overflow="hidden">
          {/* Header */}
          <Box bgGradient="linear(135deg, #021024, #065f46)" px={6} py={5}>
            <Flex align="center" gap={3}>
              <Flex w={10} h={10} borderRadius="xl" bg="whiteAlpha.200" align="center" justify="center">
                <Icon as={FaBookOpen} color="white" fontSize="16px" />
              </Flex>
              <Box>
                <Text fontWeight="bold" fontSize="md" color="white">Salary Ledger</Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {ledger ? `${ledger.employeeName} — ${new Date(ledger.year, ledger.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}` : "Loading..."}
                </Text>
              </Box>
            </Flex>
            <ModalCloseButton color="white" top={4} right={4} />
          </Box>

          <ModalBody px={6} py={5}>
            {ledgerLoading ? (
              <Flex justify="center" align="center" h="200px" direction="column" gap={3}>
                <Spinner color="#065f46" size="lg" thickness="3px" />
                <Text fontSize="sm" color="gray.400">Loading ledger...</Text>
              </Flex>
            ) : ledger && (
              <Box>
                {/* Employee Info */}
                <Flex align="center" gap={3} mb={5} p={3} bg="gray.50" borderRadius="xl">
                  <Avatar size="sm" name={ledger.employeeName} bg={getAvatarBg(ledger.employeeName)} color="white" />
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.800">{ledger.employeeName}</Text>
                    <Text fontSize="xs" color="gray.400">{ledger.designation} · {ledger.department}</Text>
                  </Box>
                  <Badge ml="auto" colorScheme={ledger.status === "Approved" ? "green" : "orange"} borderRadius="full" px={3} fontSize="xs">{ledger.status}</Badge>
                </Flex>

                {/* Earnings */}
                <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>Earnings</Text>
                <Box bg="green.50" border="1px solid" borderColor="green.100" borderRadius="xl" overflow="hidden" mb={4}>
                  <Flex justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="green.100">
                    <Text fontSize="sm" color="gray.600">Basic Salary</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">Rs {ledger.basicSalary.toLocaleString()}</Text>
                  </Flex>
                  <Flex justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="green.100">
                    <Text fontSize="sm" color="gray.600">Allowance</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">Rs {ledger.allowance.toLocaleString()}</Text>
                  </Flex>
                  <Flex justify="space-between" px={4} py={3} bg="green.100">
                    <Text fontSize="sm" fontWeight="bold" color="green.800">Gross Total</Text>
                    <Text fontSize="sm" fontWeight="bold" color="green.800">Rs {ledger.grossSalary.toLocaleString()}</Text>
                  </Flex>
                </Box>

                {/* Attendance Info */}
                <Flex gap={3} mb={4}>
                  <Flex flex={1} direction="column" align="center" bg="green.50" borderRadius="xl" py={3} border="1px solid" borderColor="green.100">
                    <Text fontSize="xl" fontWeight="800" color="green.600">{ledger.presentDays || 0}</Text>
                    <Text fontSize="10px" color="gray.500" textTransform="uppercase">Present Days</Text>
                  </Flex>
                  <Flex flex={1} direction="column" align="center" bg="blue.50" borderRadius="xl" py={3} border="1px solid" borderColor="blue.100">
                    <Text fontSize="xl" fontWeight="800" color="blue.600">{ledger.workingDays || 0}</Text>
                    <Text fontSize="10px" color="gray.500" textTransform="uppercase">Working Days</Text>
                  </Flex>
                  <Flex flex={1} direction="column" align="center" bg="orange.50" borderRadius="xl" py={3} border="1px solid" borderColor="orange.100">
                    <Text fontSize="xl" fontWeight="800" color="orange.500">{ledger.extraOffDays || 0}</Text>
                    <Text fontSize="10px" color="gray.500" textTransform="uppercase">Extra Absent</Text>
                  </Flex>
                  <Flex flex={1} direction="column" align="center" bg="gray.50" borderRadius="xl" py={3} border="1px solid" borderColor="gray.100">
                    <Text fontSize="xl" fontWeight="800" color="gray.600">{ledger.monthlyOffDays || 3}</Text>
                    <Text fontSize="10px" color="gray.500" textTransform="uppercase">Company Off</Text>
                  </Flex>
                </Flex>

                {/* Deductions */}
                <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>Deductions</Text>
                <Box bg="red.50" border="1px solid" borderColor="red.100" borderRadius="xl" overflow="hidden" mb={4}>
                  <Flex justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="red.100">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Advance Deduction</Text>
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="red.600">
                      {ledger.advanceDeduction > 0 ? `- Rs ${Math.round(ledger.advanceDeduction).toLocaleString()}` : "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="red.100">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Unpaid Leave Deduction</Text>
                      {ledger.unpaidDays > 0 && (
                        <Text fontSize="xs" color="gray.400">{ledger.unpaidDays} unpaid day{ledger.unpaidDays !== 1 ? "s" : ""}</Text>
                      )}
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="red.600">
                      {ledger.leaveDeduction > 0 ? `- Rs ${Math.round(ledger.leaveDeduction).toLocaleString()}` : "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="red.100">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Extra Off (Absent Days)</Text>
                      {ledger.extraOffDays > 0 && (
                        <Text fontSize="xs" color="gray.400">
                          {ledger.extraOffDays} day{ledger.extraOffDays !== 1 ? "s" : ""} × Rs {Math.round((ledger.basicSalary || 0) / (ledger.workingDays || 1)).toLocaleString()}/day
                        </Text>
                      )}
                    </Box>
                    <Text fontSize="sm" fontWeight="semibold" color="red.600">
                      {ledger.extraOffDeduction > 0 ? `- Rs ${Math.round(ledger.extraOffDeduction).toLocaleString()}` : "—"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" px={4} py={3} bg="red.100">
                    <Text fontSize="sm" fontWeight="bold" color="red.800">Total Deductions</Text>
                    <Text fontSize="sm" fontWeight="bold" color="red.800">- Rs {Math.round(ledger.totalDeductions).toLocaleString()}</Text>
                  </Flex>
                </Box>

                {/* Net Pay */}
                <Box bgGradient="linear(135deg, #021024, #065f46)" borderRadius="xl" px={5} py={4}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="wider">Net Remaining Pay</Text>
                      <Text fontSize="xs" color="whiteAlpha.500" mt={0.5}>Gross − All Deductions</Text>
                    </Box>
                    <Text fontSize="2xl" fontWeight="extrabold" color="white">
                      Rs {Math.round(ledger.netSalary).toLocaleString()}
                    </Text>
                  </Flex>
                </Box>
              </Box>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" onClick={onLedgerClose} borderRadius="xl" size="sm">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Generate Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl" shadow="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md" fontWeight="bold">Generate Payroll — {month}</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <Box bg="green.50" borderRadius="xl" p={4} mb={4}>
              <Text fontSize="sm" color="green.800" fontWeight="medium">Ready to generate</Text>
              <Text fontSize="sm" color="green.700" mt={1}>
                Payroll will be calculated for <Text as="span" fontWeight="bold">{employees.length} active employees</Text> based on attendance and leaves.
              </Text>
            </Box>
            {generating && (
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.500">Processing...</Text>
                  <Text fontSize="xs" fontWeight="bold" color="#065f46">{generateProgress}%</Text>
                </Flex>
                <Progress value={generateProgress} size="sm" colorScheme="green" borderRadius="full" bg="gray.100" />
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
            <Button variant="ghost" onClick={onClose} isDisabled={generating} borderRadius="xl">Cancel</Button>
            <Button bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl"
              onClick={handleGenerateAll} isLoading={generating} loadingText="Generating...">Confirm Generate</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Payroll;
