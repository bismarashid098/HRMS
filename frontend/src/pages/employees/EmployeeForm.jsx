import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Box, Button, FormControl, FormLabel, Input, Select,
  Grid, GridItem, useToast, VStack, Flex, Text, Spinner,
  InputGroup, InputLeftElement, Badge, Icon, Alert, AlertIcon,
} from "@chakra-ui/react";
import {
  FaSave, FaArrowLeft, FaUser, FaBriefcase, FaPhone,
  FaMoneyBillWave, FaCalendarAlt, FaClock, FaBuilding,
} from "react-icons/fa";

/* ─── Light Theme ─── */
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

/* ─── Helper Components ─── */
const SectionHeader = ({ icon, title, subtitle, color = T.teal }) => (
  <Flex align="center" gap={3} mb={5}>
    <Flex
      w={10} h={10} borderRadius="xl" align="center" justify="center"
      bg={`${color}18`} flexShrink={0}
      border="1px solid"
      borderColor={`${color}30`}
    >
      <Icon as={icon} color={color} fontSize="16px" />
    </Flex>
    <Box>
      <Text fontWeight="bold" fontSize="md" color={T.text}>{title}</Text>
      <Text fontSize="xs" color={T.muted}>{subtitle}</Text>
    </Box>
  </Flex>
);

const FieldLabel = ({ children, required }) => (
  <FormLabel fontSize="sm" fontWeight="semibold" color={T.muted} mb={1}>
    {children}
    {required && <Text as="span" color={T.red} ml={1}>*</Text>}
  </FormLabel>
);

/* ─── Main Component ─── */
const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    gender: "",
    religion: "",
    role: "",
    department: "",
    dutyStartTime: "",
    employmentStatus: "Active",
    salary: "",
    monthlyOffDays: "3",
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
    address: "",
  });

  const fetchEmployeeData = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    try {
      const { data } = await api.get(`/employees/${id}`);
      setFormData({
        name: data.name || data.user?.name || "",
        fatherName: data.fatherName || "",
        gender: data.gender || "",
        religion: data.religion || "",
        role: data.designation || "",
        department: data.department || "",
        dutyStartTime: data.dutyStartTime || "",
        employmentStatus: data.employmentStatus || "Active",
        salary: (typeof data.salary === "number" ? data.salary : data.salary?.basic) || "",
        monthlyOffDays: String(data.monthlyOffDays ?? 3),
        joiningDate: data.joiningDate ? data.joiningDate.split("T")[0] : "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch {
      toast({ title: "Error fetching employee", status: "error", duration: 4000, isClosable: true });
    } finally {
      setFetching(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) fetchEmployeeData();
  }, [id, fetchEmployeeData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.salary) {
      toast({ title: "Missing Fields", description: "Name and Salary are required.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    const salaryNumber = Number(formData.salary);
    if (Number.isNaN(salaryNumber) || salaryNumber <= 0) {
      toast({ title: "Invalid Salary", description: "Salary must be a positive number.", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        fatherName: formData.fatherName,
        gender: formData.gender,
        religion: formData.religion,
        designation: formData.role,
        department: formData.department,
        dutyStartTime: formData.dutyStartTime,
        employmentStatus: formData.employmentStatus,
        salary: salaryNumber,
        monthlyOffDays: Number(formData.monthlyOffDays) || 3,
        joiningDate: formData.joiningDate,
        phone: formData.phone,
        address: formData.address,
      };

      if (id) {
        await api.put(`/employees/${id}`, payload);
        toast({ title: "Employee Updated", description: "Changes saved successfully.", status: "success", duration: 3000, isClosable: true });
      } else {
        await api.post("/employees", payload);
        toast({ title: "Employee Added", description: "New employee created successfully.", status: "success", duration: 3000, isClosable: true });
      }
      navigate("/dashboard/employees");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save employee.", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Flex justify="center" align="center" h="400px" direction="column" gap={3}>
        <Spinner size="xl" color={T.teal} thickness="3px" />
        <Text color={T.muted} fontSize="sm">Loading employee data...</Text>
      </Flex>
    );
  }

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1000px" mx="auto">
        {/* Header Banner */}
        <Box
          bg={`linear-gradient(135deg, #F0F9FF 0%, #F8FAFC 100%)`}
          borderRadius="14px"
          p={6}
          mb={6}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor={T.border}
          boxShadow="0 1px 3px rgba(0,0,0,0.05)"
        >
          <Box
            position="absolute" top={-8} right={-8} w="150px" h="150px"
            borderRadius="full" bg={`${T.teal}08`}
          />
          <Flex justify="space-between" align="center" position="relative" wrap="wrap" gap={3}>
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Badge
                  bg={T.surface2}
                  color={T.muted}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="medium"
                  border="1px solid"
                  borderColor={T.border}
                >
                  {id ? "Edit Mode" : "New Record"}
                </Badge>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color={T.text}>
                {id ? "Edit Employee" : "Add New Employee"}
              </Text>
              <Text fontSize="sm" color={T.muted} mt={1}>
                {id ? "Update employee information and employment status." : "Fill in the details to register a new employee."}
              </Text>
            </Box>
            <Flex gap={3}>
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                borderColor={T.border}
                color={T.muted}
                _hover={{ bg: T.surface2, color: T.text, borderColor: T.teal }}
                onClick={() => navigate("/dashboard/employees")}
                size="sm"
                borderRadius="10px"
              >
                Back
              </Button>
              <Button
                leftIcon={<FaSave />}
                bg={T.teal}
                color="white"
                _hover={{ bg: T.tealDim }}
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Saving..."
                fontWeight="bold"
                size="sm"
                borderRadius="10px"
              >
                Save Employee
              </Button>
            </Flex>
          </Flex>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
          {/* Section 1: Personal Information */}
          <GridItem
            bg={T.surface}
            borderRadius="14px"
            p={6}
            border="1px solid"
            borderColor={T.border}
            transition="all 0.2s"
            _hover={{ borderColor: T.teal }}
            boxShadow="0 1px 3px rgba(0,0,0,0.05)"
          >
            <SectionHeader icon={FaUser} title="Personal Information" subtitle="Basic identity details" />
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FieldLabel required>Full Name</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUser} color={T.muted} fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.teal }}
                    _hover={{ borderColor: "#CBD5E1" }}
                    _placeholder={{ color: T.muted }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FieldLabel>Father's Name</FieldLabel>
                <Input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                  borderRadius="10px"
                  bg={T.bg}
                  borderColor={T.border}
                  color={T.text}
                  _focus={{ borderColor: T.teal }}
                  _hover={{ borderColor: "#CBD5E1" }}
                  _placeholder={{ color: T.muted }}
                />
              </FormControl>

              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormControl>
                  <FieldLabel>Gender</FieldLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    placeholder="Select"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.teal }}
                    _hover={{ borderColor: "#CBD5E1" }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FieldLabel>Religion</FieldLabel>
                  <Select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    placeholder="Select"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.teal }}
                    _hover={{ borderColor: "#CBD5E1" }}
                  >
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
              </Grid>
            </VStack>
          </GridItem>

          {/* Section 2: Job Details */}
          <GridItem
            bg={T.surface}
            borderRadius="14px"
            p={6}
            border="1px solid"
            borderColor={T.border}
            transition="all 0.2s"
            _hover={{ borderColor: T.blue }}
            boxShadow="0 1px 3px rgba(0,0,0,0.05)"
          >
            <SectionHeader icon={FaBriefcase} title="Job Details" subtitle="Position and employment information" color={T.blue} />
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FieldLabel>Designation / Role</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaBriefcase} color={T.muted} fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.blue }}
                    _hover={{ borderColor: "#CBD5E1" }}
                    _placeholder={{ color: T.muted }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FieldLabel>Department</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaBuilding} color={T.muted} fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.blue }}
                    _hover={{ borderColor: "#CBD5E1" }}
                    _placeholder={{ color: T.muted }}
                  />
                </InputGroup>
              </FormControl>

              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormControl>
                  <FieldLabel>Joining Date</FieldLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaCalendarAlt} color={T.muted} fontSize="13px" />
                    </InputLeftElement>
                    <Input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      borderRadius="10px"
                      bg={T.bg}
                      borderColor={T.border}
                      color={T.text}
                      _focus={{ borderColor: T.blue }}
                      _hover={{ borderColor: "#CBD5E1" }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FieldLabel>Duty Start Time</FieldLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaClock} color={T.muted} fontSize="13px" />
                    </InputLeftElement>
                    <Input
                      type="time"
                      name="dutyStartTime"
                      value={formData.dutyStartTime}
                      onChange={handleChange}
                      borderRadius="10px"
                      bg={T.bg}
                      borderColor={T.border}
                      color={T.text}
                      _focus={{ borderColor: T.blue }}
                      _hover={{ borderColor: "#CBD5E1" }}
                    />
                  </InputGroup>
                </FormControl>
              </Grid>

              {id && (
                <FormControl>
                  <FieldLabel>Employment Status</FieldLabel>
                  <Select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.blue }}
                    _hover={{ borderColor: "#CBD5E1" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </Select>
                </FormControl>
              )}
            </VStack>
          </GridItem>

          {/* Section 3: Salary */}
          <GridItem
            bg={T.surface}
            borderRadius="14px"
            p={6}
            border="1px solid"
            borderColor={T.border}
            transition="all 0.2s"
            _hover={{ borderColor: T.amber }}
            boxShadow="0 1px 3px rgba(0,0,0,0.05)"
          >
            <SectionHeader icon={FaMoneyBillWave} title="Compensation" subtitle="Salary and financial details" color={T.amber} />
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FieldLabel required>Basic Monthly Salary (Rs)</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Text color={T.muted} fontSize="sm" fontWeight="bold">₨</Text>
                  </InputLeftElement>
                  <Input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.amber }}
                    _hover={{ borderColor: "#CBD5E1" }}
                    _placeholder={{ color: T.muted }}
                  />
                </InputGroup>
                {formData.salary && Number(formData.salary) > 0 && (
                  <Text fontSize="xs" color={T.muted} mt={1}>
                    ≈ Rs {Number(formData.salary).toLocaleString()} / month
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FieldLabel>Monthly Company Off Days</FieldLabel>
                <Select
                  name="monthlyOffDays"
                  value={formData.monthlyOffDays}
                  onChange={handleChange}
                  borderRadius="10px"
                  bg={T.bg}
                  borderColor={T.border}
                  color={T.text}
                  _focus={{ borderColor: T.amber }}
                  _hover={{ borderColor: "#CBD5E1" }}
                >
                  {[0,1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>
                      {n} day{n !== 1 ? "s" : ""} off{n === 3 ? " (default)" : ""}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color={T.muted} mt={1}>
                  Company-given off days per month. Absent days beyond this are deducted from salary.
                </Text>
              </FormControl>

              <Alert status="info" bg="#FEF3C7" border="1px solid" borderColor="#FDE68A" borderRadius="10px">
                <AlertIcon color={T.amber} />
                <Text fontSize="xs" color={T.muted}>
                  Additional allowances and deductions can be configured during payroll processing.
                </Text>
              </Alert>
            </VStack>
          </GridItem>

          {/* Section 4: Contact Information */}
          <GridItem
            bg={T.surface}
            borderRadius="14px"
            p={6}
            border="1px solid"
            borderColor={T.border}
            transition="all 0.2s"
            _hover={{ borderColor: T.teal }}
            boxShadow="0 1px 3px rgba(0,0,0,0.05)"
          >
            <SectionHeader icon={FaPhone} title="Contact Information" subtitle="Phone and address details" />
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FieldLabel>Phone Number</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaPhone} color={T.muted} fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    borderRadius="10px"
                    bg={T.bg}
                    borderColor={T.border}
                    color={T.text}
                    _focus={{ borderColor: T.teal }}
                    _hover={{ borderColor: "#CBD5E1" }}
                    _placeholder={{ color: T.muted }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FieldLabel>Home Address</FieldLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House No, Street, City"
                  borderRadius="10px"
                  bg={T.bg}
                  borderColor={T.border}
                  color={T.text}
                  _focus={{ borderColor: T.teal }}
                  _hover={{ borderColor: "#CBD5E1" }}
                  _placeholder={{ color: T.muted }}
                />
              </FormControl>
            </VStack>
          </GridItem>
        </Grid>

        {/* Footer Actions */}
        <Box
          bg={T.surface}
          borderRadius="14px"
          p={5}
          mt={5}
          border="1px solid"
          borderColor={T.border}
          boxShadow="0 1px 3px rgba(0,0,0,0.05)"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={T.text}>
                {id ? "Review changes before saving" : "All required fields must be filled"}
              </Text>
              <Text fontSize="xs" color={T.muted}>
                Fields marked with <Text as="span" color={T.red}>*</Text> are mandatory
              </Text>
            </Box>
            <Flex gap={3}>
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                borderColor={T.border}
                color={T.muted}
                _hover={{ bg: T.surface2, color: T.text, borderColor: T.teal }}
                onClick={() => navigate("/dashboard/employees")}
                borderRadius="10px"
              >
                Cancel
              </Button>
              <Button
                leftIcon={<FaSave />}
                bg={T.teal}
                color="white"
                _hover={{ bg: T.tealDim }}
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Saving..."
                fontWeight="bold"
                borderRadius="10px"
                px={8}
              >
                {id ? "Update Employee" : "Add Employee"}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeForm;
