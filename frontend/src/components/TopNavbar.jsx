import { useContext } from "react";
import {
  Box, Flex, Text, Menu, MenuButton, MenuList, MenuItem,
  Avatar, Icon, Portal,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaChevronDown, FaSignOutAlt, FaUser, FaCog, FaBars,
  FaShieldAlt, FaKey,
} from "react-icons/fa";
import { FiBell } from "react-icons/fi";

/* ── Dark theme tokens ── */
const C = {
  accent:       "#10b981",
  accentBorder: "rgba(16,185,129,0.35)",
  accentDim:    "rgba(16,185,129,0.1)",
  bg:           "#061828",
  surface:      "rgba(255,255,255,0.05)",
  surfaceHover: "rgba(255,255,255,0.09)",
  border:       "rgba(255,255,255,0.07)",
  text:         "#d0dce8",
  textMd:       "#94a3b8",
  muted:        "#4a6080",
  menuBg:       "#0a1f35",
  menuBorder:   "rgba(255,255,255,0.1)",
};

const avatarColors = ["#065f46","#1d4ed8","#7c3aed","#d97706","#dc2626"];
const getAvatarBg  = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const pageTitles = {
  "/dashboard":                    "Dashboard",
  "/dashboard/employees":          "Employees",
  "/dashboard/attendance":         "Attendance",
  "/dashboard/leaves":             "Leaves",
  "/dashboard/payroll":            "Payroll",
  "/dashboard/advance":            "Advance Salary",
  "/dashboard/users":              "User Management",
  "/dashboard/settings":           "Settings",
  "/dashboard/profile":            "My Profile",
  "/dashboard/audit":              "Audit Logs",
  "/dashboard/reports/attendance": "Attendance Report",
  "/dashboard/reports/leaves":     "Leave Report",
  "/dashboard/reports/payroll":    "Payroll Report",
  "/dashboard/reports/advances":   "Advance Report",
};

const TopNavbar = ({ onMenuOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <Box
      bg={C.bg}
      px={{ base: 4, md: 5 }}
      borderBottom="1px solid"
      borderColor={C.border}
      position="sticky"
      top="0"
      zIndex="999"
      boxShadow="0 1px 0 rgba(255,255,255,0.04)"
      flexShrink={0}
    >
      <Flex justify="space-between" align="center" h="64px">

        {/* LEFT */}
        <Flex align="center" gap={3}>
          {onMenuOpen && (
            <Flex
              w="36px" h="36px" borderRadius="10px"
              bg={C.surface} border="1px solid" borderColor={C.border}
              align="center" justify="center"
              cursor="pointer" color={C.muted}
              _hover={{ bg: C.surfaceHover, color: C.text, borderColor: C.accentBorder }}
              transition="0.18s"
              onClick={onMenuOpen}
            >
              <Icon as={FaBars} />
            </Flex>
          )}
          <Box>
            <Text color={C.text} fontWeight="800" fontSize="16px" letterSpacing="-0.02em">
              {pageTitle}
            </Text>
            <Text color={C.muted} fontSize="11px">HRMS Management System</Text>
          </Box>
        </Flex>

        {/* RIGHT */}
        <Flex align="center" gap={3}>

          {/* Notification bell */}
          <Box position="relative">
            <Flex
              w="36px" h="36px" borderRadius="10px"
              bg={C.surface} border="1px solid" borderColor={C.border}
              align="center" justify="center"
              cursor="pointer" transition="0.18s"
              _hover={{ bg: C.surfaceHover, borderColor: C.accentBorder }}
            >
              <Icon as={FiBell} color={C.textMd} fontSize="15px" />
            </Flex>
            <Box
              position="absolute" top="9px" right="9px"
              w="6px" h="6px" borderRadius="full" bg="#ef4444"
              boxShadow="0 0 0 2px #061828"
            />
          </Box>

          {/* User menu */}
          {user && (
            <Menu placement="bottom-end">
              <MenuButton>
                <Flex
                  align="center" gap={3} px={3} py={2}
                  borderRadius="12px"
                  bg={C.surface}
                  border="1px solid" borderColor={C.border}
                  cursor="pointer" transition="0.18s"
                  _hover={{ bg: C.surfaceHover, borderColor: C.accentBorder }}
                >
                  <Box position="relative">
                    <Avatar size="sm" name={user.name} bg={getAvatarBg(user.name || "")} />
                    <Box
                      position="absolute" bottom="0" right="0"
                      w="9px" h="9px" borderRadius="full"
                      bg={C.accent} border={`2px solid ${C.bg}`}
                    />
                  </Box>
                  <Box display={{ base: "none", md: "block" }}>
                    <Text color={C.text} fontWeight="700" fontSize="13px" lineHeight="1">
                      {user.name}
                    </Text>
                    <Flex align="center" gap={1} mt="3px">
                      <Icon as={FaShieldAlt} fontSize="9px" color={C.accent} />
                      <Text color={C.accent} fontSize="10px" fontWeight="700" textTransform="uppercase">
                        {user.role}
                      </Text>
                    </Flex>
                  </Box>
                  <Icon as={FaChevronDown} color={C.muted} fontSize="10px" />
                </Flex>
              </MenuButton>

              <Portal>
                <MenuList
                  bg={C.menuBg}
                  border="1px solid"
                  borderColor={C.menuBorder}
                  borderRadius="18px"
                  p={2}
                  minW="240px"
                  zIndex="99999"
                  boxShadow="0 16px 50px rgba(0,0,0,0.6)"
                >
                  {/* User info */}
                  <Box p={3} borderRadius="12px" bg="rgba(16,185,129,0.08)"
                    border="1px solid rgba(16,185,129,0.15)" mb={2}>
                    <Text color={C.text} fontWeight="800" fontSize="14px">{user.name}</Text>
                    <Text color={C.muted} fontSize="11px" mt={1}>{user.email}</Text>
                  </Box>

                  <MenuItem
                    icon={<FaUser />} borderRadius="10px"
                    bg="transparent" color={C.text}
                    _hover={{ bg: C.surfaceHover }}
                    onClick={() => navigate("/dashboard/profile")}
                  >
                    My Profile
                  </MenuItem>

                  <MenuItem
                    icon={<FaKey />} borderRadius="10px"
                    bg="transparent" color={C.text}
                    _hover={{ bg: C.surfaceHover }}
                    onClick={() => navigate("/dashboard/change-password")}
                  >
                    Change Password
                  </MenuItem>

                  {user?.role === "Admin" && (
                    <MenuItem
                      icon={<FaCog />} borderRadius="10px"
                      bg="transparent" color={C.text}
                      _hover={{ bg: C.surfaceHover }}
                      onClick={() => navigate("/dashboard/settings")}
                    >
                      Settings
                    </MenuItem>
                  )}

                  <Box h="1px" bg={C.border} my={2} />

                  <MenuItem
                    icon={<FaSignOutAlt />} borderRadius="10px"
                    bg="transparent" color="#f87171"
                    _hover={{ bg: "rgba(239,68,68,0.1)" }}
                    onClick={handleLogout}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopNavbar;
