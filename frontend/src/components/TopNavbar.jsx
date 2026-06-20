import { useContext } from "react";
import {
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Icon,
  Portal,
} from "@chakra-ui/react";

import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import {
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaBars,
  FaShieldAlt,
  FaKey,
} from "react-icons/fa";

import { FiBell } from "react-icons/fi";

/* ── Theme ── */
const C = {
  accent: "#00E5C4",
  accentGlow: "rgba(0,229,196,0.15)",
  accentBorder: "rgba(0,229,196,0.22)",
  accentDim: "rgba(0,229,196,0.08)",

  bg: "#080E1A",

  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",

  border: "rgba(255,255,255,0.08)",

  text: "#E8F0FE",
  muted: "rgba(255,255,255,0.38)",
};

const avatarColors = [
  "#065f46",
  "#1d4ed8",
  "#7c3aed",
  "#d97706",
  "#dc2626",
];

const getAvatarBg = (name = "") =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/employees": "Employees",
  "/dashboard/attendance": "Attendance",
  "/dashboard/leaves": "Leaves",
  "/dashboard/payroll": "Payroll",
  "/dashboard/settings": "Settings",
  "/dashboard/profile": "Profile",
};

const TopNavbar = ({ onMenuOpen }) => {
  const { user, logout } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle =
    pageTitles[location.pathname] ||
    "Dashboard";

  return (
    <Box
      bg={C.bg}
      px={{ base: 4, md: 6 }}
      borderBottom="1px solid"
      borderColor={C.border}
      position="sticky"
      top="0"
      zIndex="999"
      backdropFilter="blur(14px)"
    >
      <Flex
        justify="space-between"
        align="center"
        h="68px"
      >
        {/* LEFT */}
        <Flex align="center" gap={3}>
          {onMenuOpen && (
            <Flex
              w="38px"
              h="38px"
              borderRadius="12px"
              bg={C.surface}
              border="1px solid"
              borderColor={C.border}
              align="center"
              justify="center"
              cursor="pointer"
              color={C.muted}
              transition="0.2s"
              _hover={{
                bg: C.surfaceHover,
                color: C.text,
                borderColor: C.accentBorder,
              }}
              onClick={onMenuOpen}
            >
              <Icon as={FaBars} />
            </Flex>
          )}

          <Box>
            <Text
              color={C.text}
              fontWeight="800"
              fontSize="17px"
            >
              {pageTitle}
            </Text>

            <Text
              color={C.muted}
              fontSize="11px"
            >
              HRMS Management System
            </Text>
          </Box>
        </Flex>

        {/* RIGHT */}
        <Flex align="center" gap={3}>
          {/* Notification */}
          <Box position="relative">
            <Flex
              w="38px"
              h="38px"
              borderRadius="12px"
              bg={C.surface}
              border="1px solid"
              borderColor={C.border}
              align="center"
              justify="center"
              cursor="pointer"
              transition="0.2s"
              _hover={{
                bg: C.surfaceHover,
                borderColor: C.accentBorder,
              }}
            >
              <Icon
                as={FiBell}
                color={C.text}
                fontSize="16px"
              />
            </Flex>

            <Box
              position="absolute"
              top="8px"
              right="8px"
              w="7px"
              h="7px"
              borderRadius="full"
              bg="#ff4d4f"
            />
          </Box>

          {/* USER MENU */}
          {user && (
            <Menu placement="bottom-end">
              <MenuButton>
                <Flex
                  align="center"
                  gap={3}
                  px={3}
                  py={2}
                  borderRadius="14px"
                  bg={C.surface}
                  border="1px solid"
                  borderColor={C.border}
                  cursor="pointer"
                  transition="0.2s"
                  _hover={{
                    bg: C.surfaceHover,
                    borderColor: C.accentBorder,
                  }}
                >
                  <Box position="relative">
                    <Avatar
                      size="sm"
                      name={user.name}
                      bg={getAvatarBg(
                        user.name || ""
                      )}
                    />

                    <Box
                      position="absolute"
                      bottom="0"
                      right="0"
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={C.accent}
                      border={`2px solid ${C.bg}`}
                    />
                  </Box>

                  <Box
                    display={{
                      base: "none",
                      md: "block",
                    }}
                  >
                    <Text
                      color={C.text}
                      fontWeight="700"
                      fontSize="13px"
                      lineHeight="1"
                    >
                      {user.name}
                    </Text>

                    <Flex
                      align="center"
                      gap={1}
                      mt="3px"
                    >
                      <Icon
                        as={FaShieldAlt}
                        fontSize="9px"
                        color={C.accent}
                      />

                      <Text
                        color={C.accent}
                        fontSize="10px"
                        fontWeight="700"
                        textTransform="uppercase"
                      >
                        {user.role}
                      </Text>
                    </Flex>
                  </Box>

                  <Icon
                    as={FaChevronDown}
                    color={C.muted}
                    fontSize="11px"
                  />
                </Flex>
              </MenuButton>

              {/* FIXED DROPDOWN */}
              <Portal>
                <MenuList
                  bg="#111827"
                  border="1px solid"
                  borderColor={C.border}
                  borderRadius="16px"
                  p={2}
                  minW="240px"
                  zIndex="99999"
                  boxShadow="0 25px 60px rgba(0,0,0,0.6)"
                >
                  {/* USER INFO */}
                  <Box
                    p={3}
                    borderRadius="12px"
                    bg={C.accentDim}
                    mb={2}
                  >
                    <Text
                      color={C.text}
                      fontWeight="800"
                      fontSize="14px"
                    >
                      {user.name}
                    </Text>

                    <Text
                      color={C.muted}
                      fontSize="11px"
                      mt={1}
                    >
                      {user.email}
                    </Text>
                  </Box>

                  {/* PROFILE */}
                  <MenuItem
                    icon={<FaUser />}
                    borderRadius="10px"
                    bg="transparent"
                    color={C.text}
                    _hover={{
                      bg: C.surfaceHover,
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/profile"
                      )
                    }
                  >
                    My Profile
                  </MenuItem>

                  {/* CHANGE PASSWORD */}
                  <MenuItem
                    icon={<FaKey />}
                    borderRadius="10px"
                    bg="transparent"
                    color={C.text}
                    _hover={{
                      bg: C.surfaceHover,
                    }}
                    onClick={() =>
                      navigate(
                        "/dashboard/change-password"
                      )
                    }
                  >
                    Change Password
                  </MenuItem>

                  {/* SETTINGS */}
                  {user?.role === "Admin" && (
                    <MenuItem
                      icon={<FaCog />}
                      borderRadius="10px"
                      bg="transparent"
                      color={C.text}
                      _hover={{
                        bg: C.surfaceHover,
                      }}
                      onClick={() =>
                        navigate(
                          "/dashboard/settings"
                        )
                      }
                    >
                      Settings
                    </MenuItem>
                  )}

                  <Box
                    h="1px"
                    bg={C.border}
                    my={2}
                  />

                  {/* LOGOUT */}
                  <MenuItem
                    icon={<FaSignOutAlt />}
                    borderRadius="10px"
                    bg="transparent"
                    color="#f87171"
                    _hover={{
                      bg: "rgba(248,113,113,0.12)",
                    }}
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