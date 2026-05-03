import { useContext } from "react";
import {
  Box, Flex, Text, Button, Menu, MenuButton, MenuList, MenuItem,
  Avatar, Badge, Icon, IconButton
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaChevronDown, FaSignOutAlt, FaUser, FaCog, FaBars } from "react-icons/fa";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/employees": "Employees",
  "/dashboard/employees/create": "Add Employee",
  "/dashboard/attendance": "Attendance Ledger",
  "/dashboard/attendance/daily": "Daily Attendance",
  "/dashboard/leaves": "Leave Management",
  "/dashboard/payroll": "Payroll",
  "/dashboard/advance": "Advance Salary",
  "/dashboard/users": "User Management",
  "/dashboard/settings": "Settings",
  "/dashboard/audit": "Audit Logs",
  "/dashboard/profile": "My Profile",
  "/dashboard/reports/attendance": "Attendance Report",
  "/dashboard/reports/leaves": "Leave Report",
  "/dashboard/reports/payroll": "Payroll Report",
  "/dashboard/reports/advances": "Advance Report",
};

const TopNavbar = ({ onMenuOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = pageTitles[location.pathname] || "Dashboard";
  const roleBadgeColor = user?.role === "Admin" ? "green" : "blue";

  return (
    <Box bg="white" px={{ base: 3, md: 6 }} py={3} shadow="sm" borderBottom="1px" borderColor="gray.100" flexShrink={0}>
      <Flex justify="space-between" align="center">
        {/* Left: hamburger (mobile) + Page title */}
        <Flex align="center" gap={2}>
          {onMenuOpen && (
            <IconButton
              icon={<Icon as={FaBars} />}
              variant="ghost"
              onClick={onMenuOpen}
              aria-label="Open navigation"
              size="sm"
              borderRadius="lg"
              color="gray.600"
              _hover={{ bg: "gray.100" }}
            />
          )}
          <Box>
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="gray.800">{pageTitle}</Text>
            <Text fontSize="xs" color="gray.400" display={{ base: "none", sm: "block" }}>
              {new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "short" })}
            </Text>
          </Box>
        </Flex>

        {/* Right: Role badge + user menu */}
        <Flex align="center" gap={3}>
          <Badge colorScheme={roleBadgeColor} borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="semibold">
            {user?.role}
          </Badge>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FaChevronDown fontSize="11px" />}
              variant="ghost"
              borderRadius="xl"
              _hover={{ bg: "gray.50" }}
              px={2}
            >
              <Flex align="center" gap={2}>
                <Avatar size="sm" name={user?.name} bg="#065f46" color="white" />
                <Box display={{ base: "none", md: "block" }} textAlign="left">
                  <Text fontSize="sm" fontWeight="semibold" lineHeight="1.2">{user?.name}</Text>
                  <Text fontSize="10px" color="gray.400" lineHeight="1.2">{user?.email}</Text>
                </Box>
              </Flex>
            </MenuButton>
            <MenuList shadow="xl" borderRadius="xl" border="1px solid" borderColor="gray.100" py={2}>
              <Box px={4} py={2} mb={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">{user?.name}</Text>
                <Text fontSize="xs" color="gray.400">{user?.email}</Text>
              </Box>
              <Box h="1px" bg="gray.100" mx={4} mb={1} />
              <MenuItem
                icon={<FaUser />}
                onClick={() => navigate("/dashboard/profile")}
                borderRadius="lg"
                mx={2}
                fontSize="sm"
              >
                My Profile
              </MenuItem>
              {user?.role === "Admin" && (
                <MenuItem
                  icon={<FaCog />}
                  onClick={() => navigate("/dashboard/settings")}
                  borderRadius="lg"
                  mx={2}
                  fontSize="sm"
                >
                  Settings
                </MenuItem>
              )}
              <Box h="1px" bg="gray.100" mx={4} my={1} />
              <MenuItem
                icon={<FaSignOutAlt />}
                onClick={handleLogout}
                color="red.500"
                borderRadius="lg"
                mx={2}
                fontSize="sm"
                _hover={{ bg: "red.50" }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopNavbar;
