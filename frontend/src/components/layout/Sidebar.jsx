import React, { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Icon, VStack, Avatar, Badge, Tooltip, IconButton } from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaChartBar, FaCog, FaHistory, FaFileInvoiceDollar, FaPlus,
  FaUserCircle, FaHandHoldingUsd, FaChevronDown,
  FaSignOutAlt, FaShieldAlt, FaTachometerAlt, FaTimes
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const avatarColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706", "#dc2626"];
const getAvatarBg = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const ACCENT = "#38bdf8";
const ACCENT_DIM = "rgba(56,189,248,0.13)";
const ACCENT_BORDER = "rgba(56,189,248,0.28)";
const SIDEBAR_BG =
  "linear-gradient(170deg, #070d1a 0%, #0d1f3c 55%, #071527 100%)";

const SectionLabel = ({ label }) => (
  <Flex align="center" gap={2} px={4} pt={5} pb={1.5}>
    <Text
      fontSize="9px"
      fontWeight="700"
      color="whiteAlpha.400"
      textTransform="uppercase"
      letterSpacing="0.20em"
      flexShrink={0}
      fontFamily="'Segoe UI', system-ui, sans-serif"
    >
      {label}
    </Text>
    <Box flex={1} h="1px" bg="whiteAlpha.80" />
  </Flex>
);

const NavItem = ({ to, icon, label, exact = false, isChild = false, onClose }) => {
  const location = useLocation();
  const isActivePath = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const active = exact ? location.pathname === to : isActivePath(to);

  return (
    <NavLink to={to} style={{ textDecoration: "none", width: "100%" }} onClick={onClose}>
      <Flex
        align="center"
        py={isChild ? "6px" : "8px"}
        pl={isChild ? 9 : 3}
        pr={3}
        mx={3}
        mb="2px"
        borderRadius="10px"
        cursor="pointer"
        position="relative"
        bg={active ? ACCENT_DIM : "transparent"}
        border="1px solid"
        borderColor={active ? ACCENT_BORDER : "transparent"}
        color={active ? "white" : "whiteAlpha.550"}
        _hover={{
          bg: active ? ACCENT_DIM : "whiteAlpha.70",
          color: "white",
          borderColor: active ? ACCENT_BORDER : "whiteAlpha.100",
        }}
        transition="all 0.18s ease"
        role="group"
        overflow="hidden"
      >
        {/* Active glow bar */}
        {active && (
          <Box
            position="absolute"
            left={0}
            top="15%"
            bottom="15%"
            w="2.5px"
            borderRadius="0 3px 3px 0"
            bg={ACCENT}
            boxShadow={`0 0 8px ${ACCENT}`}
          />
        )}

        {/* Icon */}
        <Flex
          w={isChild ? "22px" : "28px"}
          h={isChild ? "22px" : "28px"}
          borderRadius="8px"
          bg={active ? "rgba(16,185,129,0.2)" : "whiteAlpha.70"}
          align="center"
          justify="center"
          mr="10px"
          flexShrink={0}
          transition="all 0.18s"
          _groupHover={{ bg: active ? "rgba(16,185,129,0.25)" : "whiteAlpha.100" }}
        >
          <Icon
            as={icon}
            fontSize={isChild ? "10px" : "12px"}
            color={active ? ACCENT : "whiteAlpha.500"}
            _groupHover={{ color: active ? ACCENT : "whiteAlpha.800" }}
            transition="color 0.18s"
          />
        </Flex>

        <Text
          fontSize={isChild ? "12.5px" : "13.5px"}
          fontWeight={active ? "600" : "450"}
          lineHeight="1"
          letterSpacing="0.01em"
          fontFamily="'Segoe UI', system-ui, sans-serif"
        >
          {label}
        </Text>

        {active && (
          <Box
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            w="60px"
            bgGradient="linear(to-l, rgba(16,185,129,0.06), transparent)"
            pointerEvents="none"
          />
        )}
      </Flex>
    </NavLink>
  );
};

const ParentItem = ({ icon, label, active, isOpen, onToggle }) => (
  <Flex
    align="center"
    py="8px"
    pl={3}
    pr={3}
    mx={3}
    mb="2px"
    borderRadius="10px"
    cursor="pointer"
    position="relative"
    bg={active ? ACCENT_DIM : "transparent"}
    border="1px solid"
    borderColor={active ? ACCENT_BORDER : "transparent"}
    color={active ? "white" : "whiteAlpha.550"}
    _hover={{
      bg: active ? ACCENT_DIM : "whiteAlpha.70",
      color: "white",
      borderColor: active ? ACCENT_BORDER : "whiteAlpha.100",
    }}
    transition="all 0.18s ease"
    onClick={onToggle}
    role="group"
    overflow="hidden"
  >
    {active && (
      <Box
        position="absolute"
        left={0}
        top="15%"
        bottom="15%"
        w="2.5px"
        borderRadius="0 3px 3px 0"
        bg={ACCENT}
        boxShadow={`0 0 8px ${ACCENT}`}
      />
    )}
    <Flex
      w="28px" h="28px" borderRadius="8px"
      bg={active ? "rgba(16,185,129,0.2)" : "whiteAlpha.70"}
      align="center" justify="center"
      mr="10px" flexShrink={0}
      transition="all 0.18s"
      _groupHover={{ bg: active ? "rgba(16,185,129,0.25)" : "whiteAlpha.100" }}
    >
      <Icon
        as={icon}
        fontSize="12px"
        color={active ? ACCENT : "whiteAlpha.500"}
        _groupHover={{ color: active ? ACCENT : "whiteAlpha.800" }}
        transition="color 0.18s"
      />
    </Flex>
    <Text fontSize="13.5px" fontWeight={active ? "600" : "450"} flex={1} lineHeight="1" letterSpacing="0.01em" fontFamily="'Segoe UI', system-ui, sans-serif">
      {label}
    </Text>
    <Flex
      w="18px" h="18px" borderRadius="5px"
      bg="whiteAlpha.70"
      align="center" justify="center"
      transition="all 0.2s"
      transform={isOpen ? "rotate(0deg)" : "rotate(-90deg)"}
    >
      <Icon as={FaChevronDown} fontSize="8px" color="whiteAlpha.400" />
    </Flex>
  </Flex>
);

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const role = user?.role;

  const isActivePath = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const baseMenu = [
    {
      section: "MAIN",
      items: [
        { key: "dashboard", type: "single", label: "Dashboard", icon: FaTachometerAlt, to: "/dashboard", exact: true }
      ]
    },
    {
      section: "HR MANAGEMENT",
      items: [
        {
          key: "employees", type: "group", label: "Employees", icon: FaUsers,
          children: [
            { to: "/dashboard/employees", label: "Employee List", icon: FaUsers },
            { to: "/dashboard/employees/create", label: "Add Employee", icon: FaPlus }
          ]
        },
        {
          key: "attendance", type: "group", label: "Attendance", icon: FaCalendarCheck,
          children: [
            { to: "/dashboard/attendance", label: "Daily Attendance", icon: FaCalendarCheck },
            { to: "/dashboard/reports/attendance", label: "Attendance Report", icon: FaChartBar }
          ]
        },
        {
          key: "leaves", type: "group", label: "Leaves", icon: FaClipboardList,
          children: [
            { to: "/dashboard/leaves", label: "Leave Management", icon: FaClipboardList },
            { to: "/dashboard/reports/leaves", label: "Leave Report", icon: FaChartBar }
          ]
        }
      ]
    },
    {
      section: "PAYROLL",
      items: [
        {
          key: "payroll", type: "group", label: "Payroll", icon: FaMoneyBillWave,
          children: [
            { to: "/dashboard/payroll", label: "Payroll Processing", icon: FaMoneyBillWave },
            { to: "/dashboard/advance", label: "Advance Salary", icon: FaHandHoldingUsd },
            { to: "/dashboard/reports/payroll", label: "Payroll Report", icon: FaFileInvoiceDollar },
            { to: "/dashboard/reports/advances", label: "Advance Report", icon: FaFileInvoiceDollar }
          ]
        }
      ]
    },
    {
      section: "SYSTEM",
      items: [
        {
          key: "system", type: "group", label: "System", icon: FaShieldAlt,
          children: [
            { to: "/dashboard/users", label: "User Management", icon: FaUsers },
            { to: "/dashboard/profile", label: "My Profile", icon: FaUserCircle },
            { to: "/dashboard/audit", label: "Audit Logs", icon: FaHistory },
            { to: "/dashboard/settings", label: "Settings", icon: FaCog }
          ]
        }
      ]
    }
  ];

  const managerMenu = [
    {
      section: "HR MANAGEMENT",
      items: [
        {
          key: "employees", type: "group", label: "Employees", icon: FaUsers,
          children: [
            { to: "/dashboard/employees", label: "Employee List", icon: FaUsers }
          ]
        },
        {
          key: "attendance", type: "group", label: "Attendance", icon: FaCalendarCheck,
          children: [
            { to: "/dashboard/attendance", label: "Daily Attendance", icon: FaCalendarCheck },
            { to: "/dashboard/reports/attendance", label: "Attendance Report", icon: FaChartBar }
          ]
        },
        {
          key: "leaves", type: "group", label: "Leaves", icon: FaClipboardList,
          children: [
            { to: "/dashboard/leaves", label: "Leave Management", icon: FaClipboardList },
            { to: "/dashboard/reports/leaves", label: "Leave Report", icon: FaChartBar }
          ]
        }
      ]
    },
    {
      section: "ACCOUNT",
      items: [
        {
          key: "account", type: "group", label: "Account", icon: FaUserCircle,
          children: [
            { to: "/dashboard/profile", label: "My Profile", icon: FaUserCircle }
          ]
        }
      ]
    }
  ];

  const menuSections = role === "Manager" ? managerMenu : baseMenu;

  const allGroups = {};
  menuSections.forEach((sec) => sec.items.forEach((item) => {
    if (item.type === "group") allGroups[item.key] = true;
  }));
  const [openGroups, setOpenGroups] = React.useState(allGroups);

  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => { logout?.(); navigate("/login"); };

  return (
    <Box
      w="100%"
      h="100%"
      bgImage={SIDEBAR_BG}
      bgSize="cover"
      bgPos="center"
      color="white"
      display="flex"
      flexDirection="column"
      position="relative"
      borderRight="1px solid"
      borderColor="rgba(255,255,255,0.06)"
      fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif"
      style={{
        backgroundImage: `${SIDEBAR_BG}, radial-gradient(circle, rgba(56,189,248,0.03) 1px, transparent 1px)`,
        backgroundSize: "cover, 28px 28px",
      }}
    >
      {/* ── Logo ── */}
      <Box px={4} pt={5} pb={4}>
        <Flex
          align="center"
          gap={3}
          p={3}
          borderRadius="12px"
          bg="rgba(255,255,255,0.06)"
          border="1px solid"
          borderColor="rgba(255,255,255,0.10)"
        >
          {/* Icon badge */}
          <Flex
            w={9} h={9}
            borderRadius="10px"
            bg="rgba(56,189,248,0.15)"
            border="1px solid"
            borderColor="rgba(56,189,248,0.28)"
            align="center"
            justify="center"
            flexShrink={0}
            boxShadow={`0 0 16px rgba(56,189,248,0.18)`}
          >
            <Text fontSize="15px" fontWeight="800" color={ACCENT} lineHeight="1">W</Text>
          </Flex>
          <Box flex={1}>
            <Text fontSize="14px" fontWeight="700" color="white" letterSpacing="-0.01em" lineHeight="1.1" fontFamily="'Segoe UI', system-ui, sans-serif">
              WorkSphere
            </Text>
            <Flex align="center" gap={1.5} mt={0.5}>
              <Box w="5px" h="5px" borderRadius="full" bg={ACCENT} boxShadow={`0 0 6px ${ACCENT}`} />
              <Text fontSize="9px" color="whiteAlpha.500" fontWeight="600" textTransform="uppercase" letterSpacing="0.16em" fontFamily="'Segoe UI', system-ui, sans-serif">
                HRMS Platform
              </Text>
            </Flex>
          </Box>
          {onClose && (
            <IconButton
              icon={<Icon as={FaTimes} />}
              size="xs"
              variant="ghost"
              color="whiteAlpha.500"
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              onClick={onClose}
              aria-label="Close sidebar"
              borderRadius="8px"
              flexShrink={0}
            />
          )}
        </Flex>
      </Box>

      {/* ── Navigation ── */}
      <VStack
        spacing={0}
        align="stretch"
        overflowY="auto"
        flex={1}
        pb={3}
        css={{
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.08)", borderRadius: "24px" }
        }}
      >
        {menuSections.map((section, si) => (
          <Box key={si}>
            <SectionLabel label={section.section} />
            {section.items.map((item) => {
              if (item.type === "single") {
                return <NavItem key={item.key} to={item.to} icon={item.icon} label={item.label} exact={item.exact} onClose={onClose} />;
              }

              const isGroupActive = item.children.some((child) => isActivePath(child.to));
              const isOpen = openGroups[item.key];

              return (
                <Box key={item.key}>
                  <ParentItem
                    icon={item.icon}
                    label={item.label}
                    active={isGroupActive}
                    isOpen={isOpen}
                    onToggle={() => toggleGroup(item.key)}
                  />
                  {isOpen && (
                    <Box
                      ml={6}
                      mr={3}
                      mb={1}
                      pl={3}
                      borderLeft="1px solid"
                      borderColor="whiteAlpha.100"
                    >
                      {item.children.map((child) => (
                        <NavItem key={child.to} to={child.to} icon={child.icon} label={child.label} isChild onClose={onClose} />
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </VStack>

      {/* ── User Card ── */}
      <Box px={3} pb={4} pt={2}>
        <Box h="1px" bg="rgba(255,255,255,0.06)" mb={3} />
        <Flex
          align="center"
          gap={3}
          p="10px"
          borderRadius="12px"
          bg="rgba(255,255,255,0.04)"
          border="1px solid"
          borderColor="rgba(255,255,255,0.08)"
          cursor="pointer"
          _hover={{ bg: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" }}
          transition="all 0.18s"
          onClick={() => navigate("/dashboard/profile")}
        >
          <Box position="relative">
            <Avatar size="sm" name={user?.name} bg={getAvatarBg(user?.name || "")} color="white" fontSize="xs" />
            <Box
              position="absolute"
              bottom="0"
              right="0"
              w="8px"
              h="8px"
              borderRadius="full"
              bg={ACCENT}
              border="1.5px solid"
              borderColor="#021024"
              boxShadow={`0 0 5px ${ACCENT}`}
            />
          </Box>

          <Box flex={1} minW={0}>
            <Text fontSize="13px" fontWeight="600" color="white" noOfLines={1} lineHeight="1.2" fontFamily="'Segoe UI', system-ui, sans-serif">
              {user?.name || "User"}
            </Text>
            <Badge
              mt={0.5}
              fontSize="7px"
              px={1.5}
              py={0.5}
              borderRadius="full"
              bg={role === "Admin" ? "rgba(16,185,129,0.15)" : "rgba(96,165,250,0.15)"}
              color={role === "Admin" ? ACCENT : "#60a5fa"}
              border="1px solid"
              borderColor={role === "Admin" ? "rgba(16,185,129,0.25)" : "rgba(96,165,250,0.25)"}
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              {role}
            </Badge>
          </Box>

          <Tooltip label="Logout" placement="top" hasArrow>
            <Flex
              w="30px" h="30px"
              borderRadius="8px"
              align="center"
              justify="center"
              color="whiteAlpha.400"
              border="1px solid"
              borderColor="transparent"
              _hover={{ color: "#f87171", bg: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.2)" }}
              transition="all 0.18s"
              flexShrink={0}
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            >
              <Icon as={FaSignOutAlt} fontSize="11px" />
            </Flex>
          </Tooltip>
        </Flex>
      </Box>
    </Box>
  );
};

export default Sidebar;
