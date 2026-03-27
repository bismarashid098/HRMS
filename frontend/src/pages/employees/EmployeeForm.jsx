import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Box, Button, FormControl, FormLabel, Input, Select,
  Grid, GridItem, useToast, VStack, Flex, Text, Spinner,
  InputGroup, InputLeftElement, Badge, Divider, Icon,
} from "@chakra-ui/react";
import {
  FaSave, FaArrowLeft, FaUser, FaBriefcase, FaPhone,
  FaMoneyBillWave, FaCalendarAlt, FaClock, FaBuilding, FaUmbrellaBeach,
} from "react-icons/fa";

const SectionHeader = ({ icon, title, subtitle, color = "#065f46" }) => (
  <Flex align="center" gap={3} mb={5}>
    <Flex
      w={10} h={10} borderRadius="xl" align="center" justify="center"
      bg={`${color}15`} flexShrink={0}
    >
      <Icon as={icon} color={color} fontSize="16px" />
    </Flex>
    <Box>
      <Text fontWeight="bold" fontSize="md" color="gray.800">{title}</Text>
      <Text fontSize="xs" color="gray.400">{subtitle}</Text>
    </Box>
  </Flex>
);

const FieldLabel = ({ children, required }) => (
  <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
    {children}
    {required && <Text as="span" color="red.400" ml={1}>*</Text>}
  </FormLabel>
);

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
        salary:         salaryNumber,
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
        <Spinner size="xl" color="#065f46" thickness="3px" />
        <Text color="gray.500" fontSize="sm">Loading employee data...</Text>
      </Flex>
    );
  }

  return (
    <Box maxW="900px" mx="auto">
      {/* Header Banner */}
      <Box
        bgGradient="linear(135deg, #021024 0%, #065f46 100%)"
        borderRadius="2xl"
        p={6}
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute" top={-8} right={-8} w="150px" h="150px"
          borderRadius="full" bg="whiteAlpha.100"
        />
        <Box
          position="absolute" bottom={-12} right={24} w="100px" h="100px"
          borderRadius="full" bg="whiteAlpha.50"
        />
        <Flex justify="space-between" align="center" position="relative">
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Badge
                bg="whiteAlpha.200" color="white" borderRadius="full"
                px={3} py={1} fontSize="xs" fontWeight="medium"
              >
                {id ? "Edit Mode" : "New Record"}
              </Badge>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {id ? "Edit Employee" : "Add New Employee"}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
              {id ? "Update employee information and employment status." : "Fill in the details to register a new employee."}
            </Text>
          </Box>
          <Flex gap={3}>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="outline"
              borderColor="whiteAlpha.400"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => navigate("/dashboard/employees")}
              size="sm"
            >
              Back
            </Button>
            <Button
              leftIcon={<FaSave />}
              bg="white"
              color="#065f46"
              _hover={{ bg: "gray.100" }}
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Saving..."
              fontWeight="bold"
              size="sm"
            >
              Save Employee
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        {/* Section 1: Personal Information */}
        <GridItem
          bg="white" borderRadius="2xl" p={6}
          shadow="sm" border="1px solid" borderColor="gray.100"
          borderTop="3px solid #065f46"
        >
          <SectionHeader icon={FaUser} title="Personal Information" subtitle="Basic identity details" />
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FieldLabel required>Full Name</FieldLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaUser} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  borderRadius="lg"
                  focusBorderColor="#065f46"
                  _placeholder={{ color: "gray.300" }}
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
                borderRadius="lg"
                focusBorderColor="#065f46"
                _placeholder={{ color: "gray.300" }}
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
                  borderRadius="lg"
                  focusBorderColor="#065f46"
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
                  borderRadius="lg"
                  focusBorderColor="#065f46"
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
          bg="white" borderRadius="2xl" p={6}
          shadow="sm" border="1px solid" borderColor="gray.100"
          borderTop="3px solid #1d4ed8"
        >
          <SectionHeader icon={FaBriefcase} title="Job Details" subtitle="Position and employment information" color="#1d4ed8" />
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FieldLabel>Designation / Role</FieldLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaBriefcase} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  borderRadius="lg"
                  focusBorderColor="#1d4ed8"
                  _placeholder={{ color: "gray.300" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FieldLabel>Department</FieldLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaBuilding} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                  borderRadius="lg"
                  focusBorderColor="#1d4ed8"
                  _placeholder={{ color: "gray.300" }}
                />
              </InputGroup>
            </FormControl>

            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl>
                <FieldLabel>Joining Date</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaCalendarAlt} color="gray.300" fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    borderRadius="lg"
                    focusBorderColor="#1d4ed8"
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FieldLabel>Duty Start Time</FieldLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaClock} color="gray.300" fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    type="time"
                    name="dutyStartTime"
                    value={formData.dutyStartTime}
                    onChange={handleChange}
                    borderRadius="lg"
                    focusBorderColor="#1d4ed8"
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
                  borderRadius="lg"
                  focusBorderColor="#1d4ed8"
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
          bg="white" borderRadius="2xl" p={6}
          shadow="sm" border="1px solid" borderColor="gray.100"
          borderTop="3px solid #d97706"
        >
          <SectionHeader icon={FaMoneyBillWave} title="Compensation" subtitle="Salary and financial details" color="#d97706" />
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FieldLabel required>Basic Monthly Salary (Rs)</FieldLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Text color="gray.400" fontSize="sm" fontWeight="bold">₨</Text>
                </InputLeftElement>
                <Input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  borderRadius="lg"
                  focusBorderColor="#d97706"
                  _placeholder={{ color: "gray.300" }}
                />
              </InputGroup>
              {formData.salary && Number(formData.salary) > 0 && (
                <Text fontSize="xs" color="gray.400" mt={1}>
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
                borderRadius="lg"
                focusBorderColor="#d97706"
              >
                {[0,1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>
                    {n} day{n !== 1 ? "s" : ""} off{n === 3 ? " (default)" : ""}
                  </option>
                ))}
              </Select>
              <Text fontSize="xs" color="gray.400" mt={1}>
                Company-given off days per month. Absent days beyond this are deducted from salary.
              </Text>
            </FormControl>

            <Box bg="amber.50" bgColor="#fffbeb" borderRadius="xl" p={4} border="1px dashed" borderColor="#fcd34d">
              <Text fontSize="xs" color="#92400e" fontWeight="medium">Note</Text>
              <Text fontSize="xs" color="#78350f" mt={1}>
                Additional allowances and deductions can be configured during payroll processing.
              </Text>
            </Box>
          </VStack>
        </GridItem>

        {/* Section 4: Contact Information */}
        <GridItem
          bg="white" borderRadius="2xl" p={6}
          shadow="sm" border="1px solid" borderColor="gray.100"
          borderTop="3px solid #7c3aed"
        >
          <SectionHeader icon={FaPhone} title="Contact Information" subtitle="Phone and address details" color="#7c3aed" />
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FieldLabel>Phone Number</FieldLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaPhone} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0300-1234567"
                  borderRadius="lg"
                  focusBorderColor="#7c3aed"
                  _placeholder={{ color: "gray.300" }}
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
                borderRadius="lg"
                focusBorderColor="#7c3aed"
                _placeholder={{ color: "gray.300" }}
              />
            </FormControl>
          </VStack>
        </GridItem>
      </Grid>

      {/* Footer Actions */}
      <Box bg="white" borderRadius="2xl" p={5} mt={5} shadow="sm" border="1px solid" borderColor="gray.100">
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              {id ? "Review changes before saving" : "All required fields must be filled"}
            </Text>
            <Text fontSize="xs" color="gray.400">
              Fields marked with <Text as="span" color="red.400">*</Text> are mandatory
            </Text>
          </Box>
          <Flex gap={3}>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate("/dashboard/employees")}
              borderRadius="xl"
            >
              Cancel
            </Button>
            <Button
              leftIcon={<FaSave />}
              bg="#065f46"
              color="white"
              _hover={{ bg: "#047857" }}
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Saving..."
              fontWeight="bold"
              borderRadius="xl"
              px={8}
            >
              {id ? "Update Employee" : "Add Employee"}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default EmployeeForm;
