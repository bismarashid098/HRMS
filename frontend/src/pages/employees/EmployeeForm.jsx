import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
  Heading,
  useToast,
  VStack,
  Flex,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { FaSave, FaArrowLeft } from "react-icons/fa";

const EmployeeForm = () => {
  const { id } = useParams(); // Get ID from URL if editing
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "",
    salary: "",
    phone: "",
    address: "",
    joiningDate: new Date().toISOString().split("T")[0],
    employmentStatus: "Active",
    gender: "",
    dutyStartTime: "",
    religion: "",
  });

  const fetchEmployeeData = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    try {
      const { data } = await api.get(`/employees/${id}`);
      setFormData({
        name: data.name || data.user?.name || "",
        role: data.designation || "",
        department: data.department || "",
        salary:
          (typeof data.salary === "number" ? data.salary : data.salary?.basic) ||
          "",
        phone: data.phone || "",
        address: data.address || "",
        joiningDate: data.joiningDate ? data.joiningDate.split("T")[0] : "",
        employmentStatus: data.employmentStatus || "Active",
        gender: data.gender || "",
        dutyStartTime: data.dutyStartTime || "",
        religion: data.religion || "",
      });
    } catch {
      toast({
        title: "Error fetching employee",
        description: "Could not load employee details.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setFetching(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [id, fetchEmployeeData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!formData.name || !formData.salary) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Name and Salary.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    const salaryNumber = Number(formData.salary);
    if (Number.isNaN(salaryNumber) || salaryNumber <= 0) {
      toast({
        title: "Invalid Salary",
        description: "Salary must be a positive number.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        department: formData.department,
        designation: formData.role,
        salary: salaryNumber,
        joiningDate: formData.joiningDate,
        phone: formData.phone,
        address: formData.address,
        employmentStatus: formData.employmentStatus,
        gender: formData.gender,
        dutyStartTime: formData.dutyStartTime,
        religion: formData.religion,
      };

      if (id) {
        // Update existing employee
        await api.put(`/employees/${id}`, payload);
        toast({
          title: "Employee Updated",
          description: "Employee details updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new employee
        await api.post("/employees", payload);
        toast({
          title: "Employee Created",
          description: "New employee added successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      navigate("/dashboard/employees");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save employee.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="900px" mx="auto" bg="white" p={8} borderRadius="lg" shadow="md">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="gray.700">
            {id ? "Edit Employee" : "New Employee"}
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {id ? "Update employee details and status." : "Add a new employee to the system."}
          </Text>
        </VStack>
        
        <Flex gap={3}>
            <Button 
                leftIcon={<FaArrowLeft />} 
                variant="outline" 
                onClick={() => navigate("/dashboard/employees")}
            >
                Back
            </Button>
            <Button
                leftIcon={<FaSave />}
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Saving"
            >
                Save Employee
            </Button>
        </Flex>
      </Flex>

      {/* Form Grid */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        {/* Left Column */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel> Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Full Name "
              />
            </FormControl>
              <FormControl>
                <FormLabel>Father Name</FormLabel>
                <Input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Enter Your Father Name "
                />
              </FormControl>
              

            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                placeholder="Select gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Duty Time Start</FormLabel>
              <Input
                type="time"
                name="dutyStartTime"
                value={formData.dutyStartTime}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Religion</FormLabel>
              <Input
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                placeholder="e.g"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Role / Designation</FormLabel>
              <Input
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter Your Designation"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Department</FormLabel>
              <Input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter Your Department"
              />
            </FormControl>

            {id && (
              <FormControl>
                <FormLabel>Employment Status</FormLabel>
                <Select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </Select>
              </FormControl>
            )}
          </VStack>
        </GridItem>

        {/* Right Column */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Basic Salary (Monthly)</FormLabel>
              <Input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Basic Salary"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Joining Date</FormLabel>
              <Input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" 0300-1234567"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="H-No- 123 Street and City"
              />
            </FormControl>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default EmployeeForm;
