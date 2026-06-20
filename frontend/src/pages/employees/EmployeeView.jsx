import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
    Box,
    Heading,
    Text,
    Badge,
    Button,
    Divider,
    SimpleGrid,
    VStack,
    Spinner,
    Center,
    HStack,
    Flex,
    Icon,
} from "@chakra-ui/react";
import { FaArrowLeft, FaEdit, FaCalendarCheck, FaClipboardList, FaMoneyBillWave, FaUser } from "react-icons/fa";
import api from "../../api/axios";

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

const getStatusColor = (status) => {
    switch (status) {
        case "Active": return T.green;
        case "Resigned": return T.amber;
        case "Terminated": return T.red;
        default: return T.muted;
    }
};

const getStatusBg = (status) => {
    switch (status) {
        case "Active": return "#DCFCE7";
        case "Resigned": return "#FEF3C7";
        case "Terminated": return "#FEE2E2";
        default: return T.surface2;
    }
};

const InfoRow = ({ label, value, icon }) => (
    <Flex direction="column" gap={1}>
        <Flex align="center" gap={2}>
            {icon && <Icon as={icon} fontSize="12px" color={T.muted} />}
            <Text fontSize="xs" fontWeight="semibold" color={T.muted} textTransform="uppercase" letterSpacing="0.05em">
                {label}
            </Text>
        </Flex>
        <Text fontSize="md" fontWeight="500" color={T.text}>
            {value || "—"}
        </Text>
    </Flex>
);

const EmployeeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isManager = user?.role === "Manager";
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const { data } = await api.get(`/employees/${id}`);
                setEmployee(data);
            } catch {
                setError("Failed to fetch employee details");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <Center h="200px" bg={T.bg}>
                <Spinner size="xl" color={T.teal} thickness="3px" />
            </Center>
        );
    }

    if (error || !employee) {
        return (
            <Box bg={T.bg} minH="100vh" p={5}>
                <Box bg={T.surface} borderRadius="14px" p={6} textAlign="center" border="1px solid" borderColor={T.border}>
                    <Heading size="md" color={T.red} mb={4}>
                        {error || "Employee Not Found"}
                    </Heading>
                    <Button
                        leftIcon={<FaArrowLeft />}
                        bg={T.teal}
                        color="white"
                        _hover={{ bg: T.tealDim }}
                        onClick={() => navigate("/dashboard/employees")}
                        borderRadius="10px"
                    >
                        Back to Employees
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box bg={T.bg} minH="100vh" p={5}>
            <Box maxW="1000px" mx="auto">
                {/* Header Card */}
                <Box
                    bg={T.surface}
                    borderRadius="14px"
                    p={6}
                    mb={6}
                    border="1px solid"
                    borderColor={T.border}
                    position="relative"
                    overflow="hidden"
                    boxShadow="0 1px 3px rgba(0,0,0,0.06)"
                >
                    <Box
                        position="absolute"
                        top={-8}
                        right={-8}
                        w="150px"
                        h="150px"
                        borderRadius="full"
                        bg={`${T.teal}08`}
                    />
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <Flex align="center" gap={4}>
                            <Flex
                                w="60px"
                                h="60px"
                                borderRadius="full"
                                bg="#E0F2FE"
                                border="2px solid"
                                borderColor={T.teal}
                                align="center"
                                justify="center"
                            >
                                <Icon as={FaUser} fontSize="24px" color={T.teal} />
                            </Flex>
                            <Box>
                                <Heading size="lg" color={T.text} mb={1}>
                                    {employee.user?.name || employee.name || "N/A"}
                                </Heading>
                                <HStack spacing={3}>
                                    <Badge
                                        bg={T.surface2}
                                        color={T.muted}
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="medium"
                                    >
                                        ID: {employee.employeeId}
                                    </Badge>
                                    <Badge
                                        bg={getStatusBg(employee.employmentStatus)}
                                        color={getStatusColor(employee.employmentStatus)}
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {employee.employmentStatus || "—"}
                                    </Badge>
                                </HStack>
                            </Box>
                        </Flex>
                        <Flex gap={3}>
                            {!isManager && (
                                <Button
                                    leftIcon={<FaEdit />}
                                    bg={T.blue}
                                    color="white"
                                    _hover={{ bg: "#1E40AF" }}
                                    size="sm"
                                    borderRadius="10px"
                                    onClick={() => navigate(`/dashboard/employees/edit/${employee._id}`)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                            <Button
                                leftIcon={<FaArrowLeft />}
                                variant="outline"
                                borderColor={T.border}
                                color={T.muted}
                                _hover={{ bg: T.surface2, color: T.text, borderColor: T.teal }}
                                size="sm"
                                borderRadius="10px"
                                onClick={() => navigate("/dashboard/employees")}
                            >
                                Back
                            </Button>
                        </Flex>
                    </Flex>
                </Box>

                {/* Information Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={6}>
                    {/* Left Column */}
                    <Box
                        bg={T.surface}
                        borderRadius="14px"
                        p={6}
                        border="1px solid"
                        borderColor={T.border}
                        transition="all 0.2s"
                        _hover={{ borderColor: T.teal }}
                        boxShadow="0 1px 3px rgba(0,0,0,0.05)"
                    >
                        <Heading size="sm" color={T.teal} mb={4} textTransform="uppercase" letterSpacing="0.1em">
                            Personal Details
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                            <InfoRow label="Employee ID" value={employee.employeeId} icon={FaUser} />
                            <InfoRow label="Full Name" value={employee.user?.name || employee.name} icon={FaUser} />
                            <InfoRow label="Father's Name" value={employee.fatherName} />
                            <InfoRow label="Gender" value={employee.gender} />
                            <InfoRow label="Religion" value={employee.religion} />
                            <InfoRow label="Email" value={employee.user?.email} />
                            <InfoRow label="Phone" value={employee.phone} />
                            <InfoRow label="Address" value={employee.address} />
                        </VStack>
                    </Box>

                    {/* Right Column */}
                    <Box
                        bg={T.surface}
                        borderRadius="14px"
                        p={6}
                        border="1px solid"
                        borderColor={T.border}
                        transition="all 0.2s"
                        _hover={{ borderColor: T.blue }}
                        boxShadow="0 1px 3px rgba(0,0,0,0.05)"
                    >
                        <Heading size="sm" color={T.blue} mb={4} textTransform="uppercase" letterSpacing="0.1em">
                            Employment Details
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                            <InfoRow label="Designation" value={employee.designation} icon={FaUser} />
                            <InfoRow label="Department" value={employee.department} />
                            <InfoRow label="Joining Date" value={new Date(employee.joiningDate).toLocaleDateString()} />
                            <InfoRow label="Duty Start Time" value={employee.dutyStartTime || "—"} />
                            {!isManager && (
                                <>
                                    <Divider borderColor={T.border} />
                                    <InfoRow label="Basic Salary" value={`Rs ${employee.salary?.basic?.toLocaleString() || employee.salary?.toLocaleString() || "—"}`} icon={FaMoneyBillWave} />
                                    <InfoRow label="Monthly Off Days" value={employee.monthlyOffDays || "3"} />
                                </>
                            )}
                        </VStack>
                    </Box>
                </SimpleGrid>

                {/* Linked Modules */}
                <Box
                    bg={T.surface}
                    borderRadius="14px"
                    p={6}
                    border="1px solid"
                    borderColor={T.border}
                    mb={6}
                    boxShadow="0 1px 3px rgba(0,0,0,0.05)"
                >
                    <Heading size="sm" color={T.teal} mb={4} textTransform="uppercase" letterSpacing="0.1em">
                        Linked Modules
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        <Box>
                            <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={2}>
                                Attendance
                            </Text>
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor={T.border}
                                color={T.text}
                                _hover={{ bg: T.surface2, borderColor: T.teal, color: T.teal }}
                                leftIcon={<FaCalendarCheck />}
                                onClick={() => navigate(`/dashboard/attendance?employeeId=${employee._id}`)}
                                borderRadius="10px"
                                w="full"
                            >
                                Attendance Ledger
                            </Button>
                        </Box>
                        <Box>
                            <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={2}>
                                Leaves
                            </Text>
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor={T.border}
                                color={T.text}
                                _hover={{ bg: T.surface2, borderColor: T.teal, color: T.teal }}
                                leftIcon={<FaClipboardList />}
                                onClick={() => navigate("/dashboard/leaves")}
                                borderRadius="10px"
                                w="full"
                            >
                                Leave Records
                            </Button>
                        </Box>
                        {!isManager && (
                            <>
                                <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={2}>
                                        Advances
                                    </Text>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        borderColor={T.border}
                                        color={T.text}
                                        _hover={{ bg: T.surface2, borderColor: T.teal, color: T.teal }}
                                        leftIcon={<FaMoneyBillWave />}
                                        onClick={() => navigate("/dashboard/reports/advances")}
                                        borderRadius="10px"
                                        w="full"
                                    >
                                        Advance Ledger
                                    </Button>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color={T.muted} mb={2}>
                                        Payroll
                                    </Text>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        borderColor={T.border}
                                        color={T.text}
                                        _hover={{ bg: T.surface2, borderColor: T.teal, color: T.teal }}
                                        leftIcon={<FaMoneyBillWave />}
                                        onClick={() => navigate("/dashboard/reports/payroll")}
                                        borderRadius="10px"
                                        w="full"
                                    >
                                        Payroll History
                                    </Button>
                                </Box>
                            </>
                        )}
                    </SimpleGrid>
                </Box>

                {/* Additional Actions */}
                <Box textAlign="center">
                    <Button
                        variant="ghost"
                        size="sm"
                        color={T.muted}
                        _hover={{ color: T.red, bg: T.surface2 }}
                        onClick={() => navigate("/dashboard/employees")}
                    >
                        ← Return to Employee List
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default EmployeeView;
