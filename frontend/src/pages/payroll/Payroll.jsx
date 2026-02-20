import { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Select,
  HStack,
  Spinner,
  Text,
  useToast,
  IconButton,
  Tooltip,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Input
} from "@chakra-ui/react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaFilePdf, FaFileExcel, FaSyncAlt, FaMoneyBillWave } from "react-icons/fa";

const Payroll = () => {
  const { user } = useContext(AuthContext);
  
  // Default to current month
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [month, setMonth] = useState(defaultMonth);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]); // For bulk generation
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const isAdmin = user?.role === "Admin" || user?.role === "HR";

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const [year, m] = month.split("-");
      let endpoint = `/payroll?month=${parseInt(m)}&year=${year}`;
      
      const { data } = await api.get(endpoint);
      setPayrolls(data);
    } catch (err) {
      console.error(err);
      toast({ 
          title: "Error fetching payrolls", 
          description: "Could not load payroll records.",
          status: "error",
          duration: 3000,
          isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [month, toast]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await api.put(`/payroll/${id}/approve`);
      toast({
        title: "Payroll approved",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      fetchPayrolls();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve payroll.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Fetch employees for generation modal
  const fetchEmployees = async () => {
      try {
          const { data } = await api.get("/employees");
          setEmployees(data.filter(e => e.employmentStatus === "Active"));
      } catch (err) {
          console.error("Failed to fetch employees", err);
      }
  };

  const handleOpenGenerateModal = () => {
      fetchEmployees();
      onOpen();
  };

  const handleGenerateAll = async () => {
      if (employees.length === 0) {
          toast({ title: "No active employees found", status: "warning" });
          return;
      }

      setGenerating(true);
      setGenerateProgress(0);
      const [year, m] = month.split("-");
      let successCount = 0;

      for (let i = 0; i < employees.length; i++) {
          try {
              await api.post("/payroll/generate", {
                  employeeId: employees[i]._id,
                  month: parseInt(m),
                  year: parseInt(year)
              });
              successCount++;
          } catch (err) {
              console.error(`Failed for ${employees[i].user?.name}`, err);
          }
          setGenerateProgress(Math.round(((i + 1) / employees.length) * 100));
      }

      setGenerating(false);
      onClose();
      toast({
          title: "Generation Complete",
          description: `Generated payroll for ${successCount} / ${employees.length} employees.`,
          status: "success",
          duration: 5000,
          isClosable: true
      });
      fetchPayrolls();
  };

  const exportExcel = () => {
    const data = filteredPayrolls.map((p) => ({
      Employee: p.employee?.user?.name || "Unknown",
      Department: p.employee?.department,
      BasicSalary: p.basicSalary,
      Allowance: p.allowance,
      Deductions: p.deductions,
      NetSalary: p.netSalary,
      Status: p.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
    XLSX.writeFile(workbook, `Payroll-${month}.xlsx`);
  };

  const generatePDF = (payroll) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(6, 95, 70); // Dark Green Theme
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SALARY SLIP", 105, 25, null, "center");
    
    // Company Info
    doc.setFontSize(10);
    doc.text("WorkSphere Inc.", 105, 32, null, "center");

    // Employee Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Employee Name: ${payroll.employee?.user?.name}`, 15, 55);
    doc.text(`Employee ID: ${payroll.employee?.employeeId}`, 15, 62);
    doc.text(`Department: ${payroll.employee?.department}`, 15, 69);
    doc.text(`Designation: ${payroll.employee?.designation}`, 15, 76);

    doc.text(`Payslip Month: ${month}`, 140, 55);
    doc.text(`Generated On: ${new Date(payroll.createdAt).toLocaleDateString()}`, 140, 62);

    // Salary Details Table
    doc.autoTable({
        startY: 85,
        head: [['Description', 'Amount (Rs)']],
        body: [
            ['Basic Salary', payroll.basicSalary.toLocaleString()],
            ['Allowance', payroll.allowance.toLocaleString()],
            ['Gross Salary', (payroll.basicSalary + payroll.allowance).toLocaleString()],
            ['Deductions (Unpaid Leaves)', payroll.deductions.toLocaleString()],
            [{ content: 'NET PAYABLE', styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } }, { content: `Rs ${payroll.netSalary.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } }],
        ],
        theme: 'grid',
        headStyles: { fillColor: [6, 95, 70] },
    });

    // Footer
    doc.setFontSize(10);
    doc.text("This is a computer-generated document and does not require a signature.", 105, 280, null, "center");

    doc.save(`Payslip-${payroll.employee?.user?.name}-${month}.pdf`);
  };

  // Generate Month Options (Last 12 months + Next month)
  const getMonthOptions = () => {
      const options = [];
      const current = new Date();
      current.setMonth(current.getMonth() + 1); // Start from next month
      
      for (let i = 0; i < 13; i++) {
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          const value = `${y}-${m}`;
          const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
          options.push(<option key={value} value={value}>{label}</option>);
          current.setMonth(current.getMonth() - 1);
      }
      return options;
  };

  const departmentOptions = Array.from(
    new Set(
      payrolls
        .map((p) => p.employee?.department)
        .filter((department) => department && department.trim() !== "")
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredPayrolls = payrolls.filter((p) => {
    if (!isAdmin && user?.employeeId && p.employee?._id && p.employee._id !== user.employeeId) {
      return false;
    }

    if (statusFilter !== "All" && p.status !== statusFilter) {
      return false;
    }

    if (departmentFilter !== "All" && p.employee?.department !== departmentFilter) {
      return false;
    }

    const query = search.trim().toLowerCase();
    if (query) {
      const name = p.employee?.user?.name
        ? p.employee.user.name.toLowerCase()
        : "";
      const department = p.employee?.department
        ? p.employee.department.toLowerCase()
        : "";
      const employeeId = p.employee?.employeeId
        ? p.employee.employeeId.toLowerCase()
        : "";

      const matchesQuery =
        name.includes(query) ||
        department.includes(query) ||
        employeeId.includes(query);

      if (!matchesQuery) {
        return false;
      }
    }

    return true;
  });

  const summary = filteredPayrolls.reduce(
    (acc, p) => {
      acc.count += 1;
      if (p.status === "Approved") {
        acc.approved += 1;
      } else {
        acc.pending += 1;
      }
      acc.totalBasic += p.basicSalary || 0;
      acc.totalNet += p.netSalary || 0;
      acc.totalDeductions += p.deductions || 0;
      return acc;
    },
    { count: 0, approved: 0, pending: 0, totalBasic: 0, totalNet: 0, totalDeductions: 0 }
  );

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.700">
            Payroll Management
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Generate, review and export monthly salary payouts.
          </Text>
        </Box>
        {isAdmin && (
          <Button
            leftIcon={<FaMoneyBillWave />}
            colorScheme="green"
            onClick={handleOpenGenerateModal}
          >
            Generate Payroll
          </Button>
        )}
      </Flex>

      {filteredPayrolls.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Total Payslips</StatLabel>
            <StatNumber>{summary.count}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Approved</StatLabel>
            <StatNumber color="green.500">{summary.approved}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Pending</StatLabel>
            <StatNumber color="orange.400">{summary.pending}</StatNumber>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
            <StatLabel>Total Net Salary</StatLabel>
            <StatNumber color="green.600">
              Rs {summary.totalNet.toLocaleString()}
            </StatNumber>
          </Stat>
        </SimpleGrid>
      )}

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
          flexWrap="wrap"
          justify="space-between"
        >
          <HStack>
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              w="220px"
              bg="white"
              borderColor="gray.300"
            >
              {getMonthOptions()}
            </Select>
            <Button
              leftIcon={<FaSyncAlt />}
              onClick={fetchPayrolls}
              isLoading={loading}
            >
              Refresh
            </Button>
          </HStack>
          <Flex gap={4} flexWrap="wrap" align="center">
            <Box minW={{ base: "100%", md: "180px" }}>
              <Text fontSize="sm" mb={1}>
                Status
              </Text>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                bg="white"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </Select>
            </Box>
            {isAdmin && (
              <Box minW={{ base: "100%", md: "180px" }}>
                <Text fontSize="sm" mb={1}>
                  Department
                </Text>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  bg="white"
                >
                  <option value="All">All</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </Select>
              </Box>
            )}
            <Box minW={{ base: "100%", md: "220px" }} flex="1">
              <Text fontSize="sm" mb={1}>
                Search
              </Text>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isAdmin
                    ? "Search by name, department or employee ID"
                    : "Search in your payroll"
                }
              />
            </Box>
            <Button
              colorScheme="blue"
              variant="outline"
              leftIcon={<FaFileExcel />}
              onClick={exportExcel}
              isDisabled={filteredPayrolls.length === 0}
            >
              Export Excel
            </Button>
          </Flex>
        </Flex>
        <Text mt={2} fontSize="xs" color="gray.500">
          Showing {filteredPayrolls.length} of {payrolls.length} records
        </Text>
      </Box>

      {loading ? (
          <Flex justify="center" align="center" h="200px"><Spinner size="xl" color="green.500" /></Flex>
      ) : payrolls.length === 0 ? (
          <Flex justify="center" align="center" direction="column" h="200px" bg="white" borderRadius="lg" border="1px dashed" borderColor="gray.300">
              <Text color="gray.500" mb={4}>No payroll records found for {month}.</Text>
              {isAdmin && (
                  <Button size="sm" colorScheme="green" onClick={handleOpenGenerateModal}>
                      Generate Now
                  </Button>
              )}
          </Flex>
      ) : (
          <Box overflowX="auto" bg="white" shadow="sm" borderRadius="lg">
            <Table variant="simple">
                <Thead bg="gray.50">
                <Tr>
                    <Th>Employee</Th>
                    <Th isNumeric>Basic</Th>
                    <Th isNumeric>Allowance</Th>
                    <Th isNumeric>Deductions</Th>
                    <Th isNumeric>Net Salary</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                </Tr>
                </Thead>
                <Tbody>
                {filteredPayrolls.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" color="gray.500" py={8}>
                      No payrolls match the current filters.
                    </Td>
                  </Tr>
                ) : (
                  filteredPayrolls.map((p) => (
                    <Tr key={p._id}>
                      <Td fontWeight="medium">
                        {p.employee?.user?.name}
                        <Text fontSize="xs" color="gray.500">
                          {p.employee?.department}
                        </Text>
                      </Td>
                      <Td isNumeric>Rs {p.basicSalary.toLocaleString()}</Td>
                      <Td isNumeric>Rs {p.allowance.toLocaleString()}</Td>
                      <Td isNumeric color="red.500">
                        - Rs {p.deductions.toLocaleString()}
                      </Td>
                      <Td isNumeric fontWeight="bold" color="green.600">
                        Rs {p.netSalary.toLocaleString()}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={p.status === "Approved" ? "green" : "orange"}
                        >
                          {p.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {isAdmin && p.status !== "Approved" && (
                            <Button
                              size="xs"
                              colorScheme="green"
                              onClick={() => handleApprove(p._id)}
                              isLoading={actionLoadingId === p._id}
                              isDisabled={
                                actionLoadingId && actionLoadingId !== p._id
                              }
                            >
                              Approve
                            </Button>
                          )}
                          <Tooltip label="Download Payslip PDF">
                            <IconButton
                              icon={<FaFilePdf />}
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => generatePDF(p)}
                              aria-label="Download PDF"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
                </Tbody>
            </Table>
          </Box>
      )}

      {/* Generate Payroll Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
              <ModalHeader>Generate Payroll</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                  <Text mb={4}>
                      You are about to generate payroll for <strong>{month}</strong>.
                  </Text>
                  <Text mb={4} fontSize="sm" color="gray.600">
                      This will calculate salaries for all <strong>{employees.length}</strong> active employees based on their attendance and leaves.
                  </Text>
                  
                  {generating && (
                      <Box mb={4}>
                          <Text fontSize="xs" mb={1} textAlign="right">{generateProgress}%</Text>
                          <Progress value={generateProgress} size="sm" colorScheme="green" borderRadius="md" />
                      </Box>
                  )}
              </ModalBody>
              <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onClose} isDisabled={generating}>Cancel</Button>
                  <Button 
                      colorScheme="green" 
                      onClick={handleGenerateAll} 
                      isLoading={generating}
                      loadingText="Generating..."
                  >
                      Confirm Generate
                  </Button>
              </ModalFooter>
          </ModalContent>
      </Modal>
    </Box>
  );
};

export default Payroll;
