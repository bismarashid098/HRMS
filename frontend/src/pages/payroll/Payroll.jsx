import { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Grid, Text, Button, useToast, Input, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Icon,
  InputGroup, InputLeftElement, Avatar, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, IconButton, VStack, Divider
} from "@chakra-ui/react";
import {
  FaSearch, FaFileExcel, FaMoneyBillWave, FaCheckCircle,
  FaClock, FaEye, FaPlay
} from "react-icons/fa";
import api from "../../api/axios";
import * as XLSX from "xlsx";

const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", blue: "#1D4ED8", red: "#DC2626",
  amber: "#D97706", green: "#059669", text: "#0F172A", muted: "#64748B"
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const StatCard = ({ label, value, color, icon }) => (
  <Box bg={T.surface} p={4} borderRadius="14px" border="1px solid" borderColor={T.border}
    boxShadow="0 1px 3px rgba(0,0,0,0.06)" _hover={{ borderColor: color }}>
    <Flex justify="space-between" mb={1}>
      <Text fontSize="xs" color={T.muted}>{label}</Text>
      <Icon as={icon} color={color} />
    </Flex>
    <Text fontSize="2xl" fontWeight="bold" color={color}>{value}</Text>
  </Box>
);

const statusColor = (s) =>
  s === "Approved" ? T.green : s === "Generated" ? T.blue : T.amber;

const statusBg = (s) =>
  s === "Approved" ? "#DCFCE7" : s === "Generated" ? "#DBEAFE" : "#FEF3C7";

const Payroll = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [search,   setSearch]   = useState("");
  const [overview, setOverview] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [generating, setGenerating] = useState({});
  const [approving,  setApproving]  = useState({});
  const [genAllLoading, setGenAllLoading] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/payroll/overview", {
        params: { month: selMonth, year: selYear }
      });
      setOverview(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast({ title: "Error loading payroll data", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [selMonth, selYear]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const doGenerate = async (emp) => {
    await api.post("/payroll/generate", {
      employeeId: emp.employeeId,
      month: selMonth,
      year:  selYear
    });
  };

  const handleGenerate = async (emp) => {
    setGenerating(g => ({ ...g, [emp.employeeId]: true }));
    try {
      await doGenerate(emp);
      toast({ title: `Payroll generated for ${emp.name}`, status: "success", duration: 2500 });
      fetchOverview();
    } catch (err) {
      toast({ title: err.response?.data?.message || "Generate failed", status: "error", duration: 3000 });
    } finally {
      setGenerating(g => ({ ...g, [emp.employeeId]: false }));
    }
  };

  const handleGenerateAll = async () => {
    const pending = filtered.filter(e => e.payrollStatus === "Not Generated");
    if (!pending.length) return;
    setGenAllLoading(true);
    let success = 0, failed = 0;
    for (const emp of pending) {
      setGenerating(g => ({ ...g, [emp.employeeId]: true }));
      try {
        await doGenerate(emp);
        success++;
      } catch {
        failed++;
      } finally {
        setGenerating(g => ({ ...g, [emp.employeeId]: false }));
      }
    }
    setGenAllLoading(false);
    fetchOverview();
    toast({
      title: `Generated ${success} payrolls${failed ? `, ${failed} failed` : ""}`,
      status: failed && !success ? "error" : "success",
      duration: 3000
    });
  };

  const handleApprove = async (emp) => {
    if (!emp.payrollId) return;
    setApproving(a => ({ ...a, [emp.payrollId]: true }));
    try {
      await api.put(`/payroll/${emp.payrollId}/approve`);
      toast({ title: `Payroll approved for ${emp.name}`, status: "success", duration: 2500 });
      fetchOverview();
    } catch {
      toast({ title: "Approve failed", status: "error", duration: 3000 });
    } finally {
      setApproving(a => ({ ...a, [emp.payrollId]: false }));
    }
  };

  const handleViewBreakdown = async (emp) => {
    if (!emp.payrollId) return;
    setBreakdown(null);
    onOpen();
    setBreakdownLoading(true);
    try {
      const res = await api.get(`/payroll/${emp.payrollId}/breakdown`);
      setBreakdown(res.data);
    } catch {
      toast({ title: "Could not load breakdown", status: "error", duration: 3000 });
      onClose();
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleExport = () => {
    if (!filtered.length) return;
    const rows = filtered.map(e => ({
      Employee:         e.name,
      "Employee Code":  e.employeeCode,
      Department:       e.department,
      "Basic Salary":   e.basicSalary,
      Allowance:        e.allowance || 0,
      "Total Deductions": (e.totalDeductions || 0) + (e.taxDeduction || 0),
      "Net Salary":     Math.max(0, e.netSalary || 0),
      "Present Days":   e.presentDays,
      "Working Days":   e.workingDays,
      Status:           e.payrollStatus
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `payroll_${selYear}_${String(selMonth).padStart(2,"0")}.xlsx`);
  };

  const filtered = overview.filter(e =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalNet   = filtered.reduce((s, e) => s + Math.max(0, e.netSalary || 0), 0);
  const generated  = filtered.filter(e => e.payrollStatus !== "Not Generated").length;
  const approved   = filtered.filter(e => e.payrollStatus === "Approved").length;
  const notGenerated = filtered.filter(e => e.payrollStatus === "Not Generated").length;

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">

        {/* Header */}
        <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color={T.text}>Payroll Management</Text>
            <Text color={T.muted} fontSize="sm">
              {MONTHS[selMonth - 1]} {selYear}
            </Text>
          </Box>
          <HStack>
            <Button
              size="sm" leftIcon={<FaFileExcel />} variant="outline"
              borderColor={T.border} color={T.muted}
              _hover={{ borderColor: T.green, color: T.green }}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              size="sm" leftIcon={<FaPlay />}
              bg={T.teal} color="white"
              _hover={{ bg: T.tealDim }}
              isLoading={genAllLoading}
              isDisabled={notGenerated === 0}
              onClick={handleGenerateAll}
            >
              Generate All ({notGenerated})
            </Button>
          </HStack>
        </Flex>

        {/* Stats */}
        <Grid templateColumns="repeat(4,1fr)" gap={4} mb={5}>
          <StatCard label="Total Employees" value={filtered.length}         color={T.teal}  icon={FaMoneyBillWave} />
          <StatCard label="Generated"        value={generated}               color={T.blue}  icon={FaClock} />
          <StatCard label="Approved"         value={approved}                color={T.green} icon={FaCheckCircle} />
          <StatCard label="Total Net Pay"    value={`Rs ${totalNet.toLocaleString()}`} color={T.amber} icon={FaMoneyBillWave} />
        </Grid>

        {/* Filters */}
        <Box bg={T.surface} p={4} borderRadius="14px" mb={4} display="flex" gap={3} flexWrap="wrap" alignItems="center"
          border="1px solid" borderColor={T.border} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color={T.muted} />
            </InputLeftElement>
            <Input
              placeholder="Search employee, department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              bg={T.bg} borderColor={T.border} color={T.text}
              _placeholder={{ color: T.muted }}
            />
          </InputGroup>
          <Input
            type="month"
            value={`${selYear}-${String(selMonth).padStart(2, "0")}`}
            onChange={e => {
              const [y, m] = e.target.value.split("-");
              setSelYear(+y);
              setSelMonth(+m);
            }}
            w="180px" bg={T.bg} borderColor={T.border} color={T.text}
          />
        </Box>

        {/* Table */}
        {loading ? (
          <Flex justify="center" p={10}>
            <Spinner color={T.teal} size="xl" />
          </Flex>
        ) : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto" border="1px solid" borderColor={T.border}
            boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Table variant="simple">
              <Thead>
                <Tr bg={T.surface2}>
                  {["Employee","Department","Basic","Allowance","Deductions","Net Pay","Days","Status","Actions"].map(h => (
                    <Th key={h} color={T.muted} borderColor={T.border} fontSize="xs">{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" color={T.muted} py={10} borderColor={T.border}>
                      No employees found
                    </Td>
                  </Tr>
                ) : filtered.map(emp => {
                  const totalDed = (emp.totalDeductions || 0) + (emp.taxDeduction || 0);
                  return (
                    <Tr key={emp.employeeId} _hover={{ bg: T.surface2 }} color={T.text}>
                      <Td borderColor={T.border}>
                        <Flex align="center" gap={2}>
                          <Avatar size="xs" name={emp.name} />
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">{emp.name}</Text>
                            <Text fontSize="xs" color={T.muted}>{emp.employeeCode}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td borderColor={T.border} color={T.muted} fontSize="sm">{emp.department}</Td>
                      <Td borderColor={T.border} fontSize="sm">
                        Rs {(emp.basicSalary || 0).toLocaleString()}
                      </Td>
                      <Td borderColor={T.border} fontSize="sm">
                        Rs {(emp.allowance || 0).toLocaleString()}
                      </Td>
                      <Td borderColor={T.border} fontSize="sm" color={T.red}>
                        {totalDed > 0 ? `- Rs ${totalDed.toLocaleString()}` : "—"}
                      </Td>
                      <Td borderColor={T.border} fontSize="sm" fontWeight="bold" color={T.green}>
                        Rs {Math.max(0, emp.netSalary || 0).toLocaleString()}
                      </Td>
                      <Td borderColor={T.border} fontSize="xs" color={T.muted}>
                        {emp.presentDays}/{emp.workingDays}
                      </Td>
                      <Td borderColor={T.border}>
                        <Badge
                          px={2} py={1} borderRadius="full" fontSize="xs"
                          bg={statusBg(emp.payrollStatus)}
                          color={statusColor(emp.payrollStatus)}
                        >
                          {emp.payrollStatus}
                        </Badge>
                      </Td>
                      <Td borderColor={T.border}>
                        <HStack spacing={1}>
                          {emp.payrollStatus === "Not Generated" && (
                            <Button
                              size="xs" bg={T.teal} color="white"
                              _hover={{ bg: T.tealDim }}
                              isLoading={!!generating[emp.employeeId]}
                              onClick={() => handleGenerate(emp)}
                            >
                              Generate
                            </Button>
                          )}
                          {emp.payrollStatus === "Generated" && (
                            <Button
                              size="xs" bg={T.green} color="white"
                              _hover={{ opacity: 0.85 }}
                              isLoading={!!approving[emp.payrollId]}
                              onClick={() => handleApprove(emp)}
                            >
                              Approve
                            </Button>
                          )}
                          {emp.payrollId && (
                            <IconButton
                              size="xs" variant="ghost" icon={<FaEye />}
                              color={T.blue} aria-label="View breakdown"
                              onClick={() => handleViewBreakdown(emp)}
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Breakdown Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay bg="rgba(15,23,42,0.4)" />
        <ModalContent bg={T.surface} color={T.text} border="1px solid" borderColor={T.border}
          boxShadow="0 20px 60px rgba(0,0,0,0.12)">
          <ModalHeader borderBottom="1px solid" borderColor={T.border} fontSize="md" color={T.text}>
            {breakdown
              ? `${breakdown.employeeName} — ${MONTHS[(breakdown.month || 1) - 1]} ${breakdown.year}`
              : "Payroll Breakdown"}
          </ModalHeader>
          <ModalCloseButton color={T.muted} />
          <ModalBody py={5}>
            {breakdownLoading ? (
              <Flex justify="center" p={6}><Spinner color={T.teal} /></Flex>
            ) : breakdown ? (
              <VStack align="stretch" spacing={3}>
                <Grid templateColumns="1fr 1fr" gap={2} fontSize="sm">
                  <Text color={T.muted}>Department</Text><Text color={T.text}>{breakdown.department}</Text>
                  <Text color={T.muted}>Designation</Text><Text color={T.text}>{breakdown.designation}</Text>
                  <Text color={T.muted}>Working Days</Text><Text color={T.text}>{breakdown.workingDays}</Text>
                  <Text color={T.muted}>Present Days</Text><Text color={T.text}>{breakdown.presentDays}</Text>
                  <Text color={T.muted}>Monthly Off Days</Text><Text color={T.text}>{breakdown.monthlyOffDays}</Text>
                  <Text color={T.muted}>Status</Text>
                  <Badge w="fit-content" px={2} bg={statusBg(breakdown.status)} color={statusColor(breakdown.status)}>
                    {breakdown.status}
                  </Badge>
                </Grid>

                <Divider borderColor={T.border} />

                <VStack align="stretch" spacing={2} fontSize="sm">
                  <Flex justify="space-between">
                    <Text color={T.muted}>Basic Salary</Text>
                    <Text color={T.text}>Rs {(breakdown.basicSalary || 0).toLocaleString()}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color={T.muted}>Allowance</Text>
                    <Text color={T.text}>Rs {(breakdown.allowance || 0).toLocaleString()}</Text>
                  </Flex>
                  <Flex justify="space-between" fontWeight="medium">
                    <Text color={T.muted}>Gross Salary</Text>
                    <Text color={T.text}>Rs {(breakdown.grossSalary || 0).toLocaleString()}</Text>
                  </Flex>
                </VStack>

                <Divider borderColor={T.border} />

                <VStack align="stretch" spacing={2} fontSize="sm">
                  {breakdown.leaveDeduction > 0 && (
                    <Flex justify="space-between">
                      <Text color={T.red}>Unpaid Leave ({breakdown.unpaidDays} days)</Text>
                      <Text color={T.red}>- Rs {breakdown.leaveDeduction.toLocaleString()}</Text>
                    </Flex>
                  )}
                  {breakdown.extraOffDeduction > 0 && (
                    <Flex justify="space-between">
                      <Text color={T.red}>Absent ({breakdown.extraOffDays} days)</Text>
                      <Text color={T.red}>- Rs {breakdown.extraOffDeduction.toLocaleString()}</Text>
                    </Flex>
                  )}
                  {breakdown.advanceDeduction > 0 && (
                    <Flex justify="space-between">
                      <Text color={T.red}>Advance Deduction</Text>
                      <Text color={T.red}>- Rs {breakdown.advanceDeduction.toLocaleString()}</Text>
                    </Flex>
                  )}
                  {breakdown.taxDeduction > 0 && (
                    <Flex justify="space-between">
                      <Text color={T.red}>Tax ({breakdown.taxPercentage}%)</Text>
                      <Text color={T.red}>- Rs {breakdown.taxDeduction.toLocaleString()}</Text>
                    </Flex>
                  )}
                  {(breakdown.leaveDeduction || breakdown.extraOffDeduction ||
                    breakdown.advanceDeduction || breakdown.taxDeduction) ? null : (
                    <Text color={T.muted} fontSize="xs">No deductions this month</Text>
                  )}
                </VStack>

                <Divider borderColor={T.border} />

                <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text color={T.text}>Net Salary</Text>
                  <Text color={T.green}>
                    Rs {Math.max(0, breakdown.netSalary || 0).toLocaleString()}
                  </Text>
                </Flex>
              </VStack>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Payroll;
