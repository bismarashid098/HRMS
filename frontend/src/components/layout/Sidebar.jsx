import { Box, VStack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
    const [showReports, setShowReports] = useState(false);

    return (
        <Box w="220px" bg="gray.800" color="white" p="5">
            <VStack align="start" spacing="4">
                <Text fontWeight="bold">Menu</Text>

                <Link to="/">
                    <Text cursor="pointer">Dashboard</Text>
                </Link>

                <Link to="/employees">
                    <Text cursor="pointer">Employees</Text>
                </Link>

                <Link to="/attendance">
                    <Text cursor="pointer">Attendance</Text>
                </Link>

                <Link to="/leaves">
                    <Text cursor="pointer">Leaves</Text>
                </Link>

                <Link to="/payroll">
                    <Text cursor="pointer">Payroll</Text>
                </Link>

                {/* REPORTS DROPDOWN */}
                <Text
                    cursor="pointer"
                    fontWeight="bold"
                    onClick={() => setShowReports(!showReports)}
                >
                    Reports
                </Text>

                {showReports && (
                    <VStack align="start" pl="4" spacing="2">
                        <Link to="/reports/attendance">
                            <Text cursor="pointer" fontSize="sm">
                                Attendance Report
                            </Text>
                        </Link>

                        <Link to="/reports/leaves">
                            <Text cursor="pointer" fontSize="sm">
                                Leave Report
                            </Text>
                        </Link>

                        <Link to="/reports/payroll">
                            <Text cursor="pointer" fontSize="sm">
                                Payroll Report
                            </Text>
                        </Link>

                        <Link to="/reports/advance">
                            <Text cursor="pointer" fontSize="sm">
                                Advance Report
                            </Text>
                        </Link>
                    </VStack>
                )}

                <Link to="/settings">
                    <Text cursor="pointer">Settings</Text>
                </Link>

                <Link to="/audit-logs">
                    <Text cursor="pointer">Audit Logs</Text>
                </Link>
            </VStack>
        </Box>
    );
};

export default Sidebar;
