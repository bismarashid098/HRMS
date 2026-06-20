import React, { useContext, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Icon, VStack, Avatar, Badge, Tooltip, IconButton } from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaChartBar, FaCog, FaHistory, FaFileInvoiceDollar, FaPlus,
  FaUserCircle, FaHandHoldingUsd, FaChevronDown,
  FaSignOutAlt, FaShieldAlt, FaTachometerAlt, FaTimes
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

/* ══════════════════════════════════════
   THEME TOKENS
══════════════════════════════════════ */
const C = {
  accent:       "#00E5C4",
  accentGlow:   "rgba(0,229,196,0.18)",
  accentBorder: "rgba(0,229,196,0.22)",
  accentDim:    "rgba(0,229,196,0.08)",
  gold:         "#F0C040",
  bg:           "#080E1A",
  surface:      "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(255,255,255,0.13)",
  text:         "#E8F0FE",
  muted:        "rgba(255,255,255,0.38)",
  mutedHover:   "rgba(255,255,255,0.72)",
};

const avatarColors = ["#065f46","#1d4ed8","#7c3aed","#d97706","#dc2626"];
const getAvatarBg  = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.045)'/%3E%3C/svg%3E")`;
const HEX_CLIP = "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)";

/* ══════════════════════════════════════
   SECTION LABEL
══════════════════════════════════════ */
const SectionLabel = ({ label }) => (
  <Flex align="center" gap={2} px={4} pt={5} pb={1.5}>
    <Text
      fontSize="8.5px" fontWeight="800" color={C.muted}
      textTransform="uppercase" letterSpacing="0.22em"
      fontFamily="'DM Mono', monospace" flexShrink={0}
    >
      {label}
    </Text>
    <Box flex={1} h="1px" bgGradient={`linear(to-r, ${C.accentBorder}, transparent)`} />
  </Flex>
);

/* ══════════════════════════════════════
   NAV ITEM
══════════════════════════════════════ */
const NavItem = ({ to, icon, label, exact = false, isChild = false, onClose }) => {
  const location = useLocation();
  const isActivePath = (p) => location.pathname === p || location.pathname.startsWith(`${p}/`);
  const active = exact ? location.pathname === to : isActivePath(to);

  return (
    <NavLink to={to} style={{ textDecoration: "none", width: "100%" }} onClick={onClose}>
      <Flex
        align="center"
        py={isChild ? "5px" : "7px"}
        pl={isChild ? 8 : "10px"}
        pr="10px"
        mx={3} mb="2px"
        borderRadius="10px"
        cursor="pointer"
        position="relative"
        bg={active ? C.accentDim : "transparent"}
        border="1px solid"
        borderColor={active ? C.accentBorder : "transparent"}
        color={active ? C.text : C.muted}
        _hover={{ bg: active ? C.accentDim : C.surface, color: C.text, borderColor: active ? C.accentBorder : C.border }}
        transition="all 0.16s ease"
        role="group"
        overflow="hidden"
      >
        {active && (
          <Box
            position="absolute" left={0} top="18%" bottom="18%"
            w="2px" borderRadius="0 3px 3px 0"
            bg={C.accent} boxShadow={`0 0 10px ${C.accent}`}
          />
        )}
        {active && (
          <Box
            position="absolute" right={0} top={0} bottom={0} w="50px"
            bgGradient={`linear(to-l, ${C.accentDim}, transparent)`}
            pointerEvents="none"
          />
        )}
        <Flex
          w={isChild ? "20px" : "26px"} h={isChild ? "20px" : "26px"}
          borderRadius="7px"
          bg={active ? C.accentGlow : C.surface}
          border="1px solid"
          borderColor={active ? C.accentBorder : C.border}
          align="center" justify="center"
          mr="9px" flexShrink={0}
          transition="all 0.16s"
          _groupHover={{ bg: active ? C.accentGlow : C.surfaceHover, borderColor: active ? C.accentBorder : C.borderHover }}
        >
          <Icon
            as={icon}
            fontSize={isChild ? "9px" : "11px"}
            color={active ? C.accent : C.muted}
            _groupHover={{ color: active ? C.accent : C.mutedHover }}
            transition="color 0.16s"
          />
        </Flex>
        <Text
          fontSize={isChild ? "12px" : "13px"}
          fontWeight={active ? "600" : "400"}
          lineHeight="1"
          letterSpacing={active ? "0.005em" : "0.01em"}
          fontFamily="'DM Sans', system-ui, sans-serif"
          flex={1}
        >
          {label}
        </Text>
        {active && (
          <Box
            w="5px" h="5px" borderRadius="full"
            bg={C.accent} boxShadow={`0 0 6px ${C.accent}`}
            flexShrink={0}
          />
        )}
      </Flex>
    </NavLink>
  );
};

/* ══════════════════════════════════════
   PARENT ITEM (collapsible)
══════════════════════════════════════ */
const ParentItem = ({ icon, label, active, isOpen, onToggle }) => (
  <Flex
    align="center"
    py="7px" pl="10px" pr="10px"
    mx={3} mb="2px"
    borderRadius="10px"
    cursor="pointer"
    position="relative"
    bg={active ? C.accentDim : "transparent"}
    border="1px solid"
    borderColor={active ? C.accentBorder : "transparent"}
    color={active ? C.text : C.muted}
    _hover={{ bg: active ? C.accentDim : C.surface, color: C.text, borderColor: active ? C.accentBorder : C.border }}
    transition="all 0.16s ease"
    onClick={onToggle}
    role="group"
    overflow="hidden"
  >
    {active && (
      <Box
        position="absolute" left={0} top="18%" bottom="18%"
        w="2px" borderRadius="0 3px 3px 0"
        bg={C.accent} boxShadow={`0 0 10px ${C.accent}`}
      />
    )}
    <Flex
      w="26px" h="26px" borderRadius="7px"
      bg={active ? C.accentGlow : C.surface}
      border="1px solid"
      borderColor={active ? C.accentBorder : C.border}
      align="center" justify="center"
      mr="9px" flexShrink={0}
      transition="all 0.16s"
      _groupHover={{ bg: active ? C.accentGlow : C.surfaceHover, borderColor: active ? C.accentBorder : C.borderHover }}
    >
      <Icon
        as={icon} fontSize="11px"
        color={active ? C.accent : C.muted}
        _groupHover={{ color: active ? C.accent : C.mutedHover }}
        transition="color 0.16s"
      />
    </Flex>
    <Text
      fontSize="13px" fontWeight={active ? "600" : "400"}
      flex={1} lineHeight="1" letterSpacing="0.01em"
      fontFamily="'DM Sans', system-ui, sans-serif"
    >
      {label}
    </Text>
    <Flex
      w="16px" h="16px" borderRadius="5px"
      bg={C.surface} border="1px solid" borderColor={C.border}
      align="center" justify="center"
      transition="transform 0.2s"
      transform={isOpen ? "rotate(0deg)" : "rotate(-90deg)"}
      flexShrink={0}
    >
      <Icon as={FaChevronDown} fontSize="7px" color={C.muted} />
    </Flex>
  </Flex>
);

/* ══════════════════════════════════════
   MAIN SIDEBAR
══════════════════════════════════════ */
const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const role = user?.role;

  const isActivePath = (p) => location.pathname === p || location.pathname.startsWith(`${p}/`);

  /* ── Menu config ── */
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
            { to: "/dashboard/employees",        label: "Employee List", icon: FaUsers },
            { to: "/dashboard/employees/create", label: "Add Employee",  icon: FaPlus  }
          ]
        },
        {
          key: "attendance", type: "group", label: "Attendance", icon: FaCalendarCheck,
          children: [
            { to: "/dashboard/attendance",         label: "Daily Attendance",  icon: FaCalendarCheck },
            { to: "/dashboard/reports/attendance", label: "Attendance Report", icon: FaChartBar      }
          ]
        },
        {
          key: "leaves", type: "group", label: "Leaves", icon: FaClipboardList,
          children: [
            { to: "/dashboard/leaves",         label: "Leave Management", icon: FaClipboardList },
            { to: "/dashboard/reports/leaves", label: "Leave Report",     icon: FaChartBar      }
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
            { to: "/dashboard/payroll",           label: "Payroll Processing", icon: FaMoneyBillWave     },
            { to: "/dashboard/advance",           label: "Advance Salary",     icon: FaHandHoldingUsd    },
            { to: "/dashboard/reports/payroll",   label: "Payroll Report",     icon: FaFileInvoiceDollar },
            { to: "/dashboard/reports/advances",  label: "Advance Report",     icon: FaFileInvoiceDollar }
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
            { to: "/dashboard/users",    label: "User Management", icon: FaUsers      },
            { to: "/dashboard/profile",  label: "My Profile",      icon: FaUserCircle },
            { to: "/dashboard/audit",    label: "Audit Logs",      icon: FaHistory    },
            { to: "/dashboard/settings", label: "Settings",        icon: FaCog        }
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
          children: [{ to: "/dashboard/employees", label: "Employee List", icon: FaUsers }]
        },
        {
          key: "attendance", type: "group", label: "Attendance", icon: FaCalendarCheck,
          children: [
            { to: "/dashboard/attendance",         label: "Daily Attendance",  icon: FaCalendarCheck },
            { to: "/dashboard/reports/attendance", label: "Attendance Report", icon: FaChartBar      }
          ]
        },
        {
          key: "leaves", type: "group", label: "Leaves", icon: FaClipboardList,
          children: [
            { to: "/dashboard/leaves",         label: "Leave Management", icon: FaClipboardList },
            { to: "/dashboard/reports/leaves", label: "Leave Report",     icon: FaChartBar      }
          ]
        }
      ]
    },
    {
      section: "ACCOUNT",
      items: [
        {
          key: "account", type: "group", label: "Account", icon: FaUserCircle,
          children: [{ to: "/dashboard/profile", label: "My Profile", icon: FaUserCircle }]
        }
      ]
    }
  ];

  const menuSections = role === "Manager" ? managerMenu : baseMenu;

  // ✅ FIX: useEffect se openGroups initialize hoga jab role/menuSections ready ho
  const [openGroups, setOpenGroups] = React.useState({});

  useEffect(() => {
    const allGroups = {};
    menuSections.forEach((sec) =>
      sec.items.forEach((item) => {
        if (item.type === "group") allGroups[item.key] = true;
      })
    );
    setOpenGroups(allGroups);
  }, [role]); // ✅ role change hone par re-initialize

  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => { logout?.(); navigate("/login"); };

  return (
    <Box
      w="100%" h="100%"
      bg={C.bg}
      backgroundImage={DOT_BG}
      backgroundSize="24px 24px"
      color={C.text}
      display="flex"
      flexDirection="column"
      position="relative"
      borderRight="1px solid"
      borderColor={C.border}
      fontFamily="'DM Sans', system-ui, sans-serif"
      overflow="hidden"
    >
      {/* Ambient top glow */}
      <Box
        position="absolute" top="-60px" left="50%"
        transform="translateX(-50%)"
        w="200px" h="120px"
        borderRadius="full"
        bg={C.accentGlow}
        filter="blur(40px)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Corner accent lines */}
      <Box position="absolute" top={0} left={0} w="60px" h="1px" bg={`linear-gradient(to-r, ${C.accent}, transparent)`} zIndex={1} />
      <Box position="absolute" top={0} left={0} w="1px" h="60px" bg={`linear-gradient(to-b, ${C.accent}, transparent)`} zIndex={1} />

      {/* ════ LOGO ════ */}
      <Box px={4} pt={5} pb={3} position="relative" zIndex={1}>
        <Flex
          align="center" gap={3} p={3}
          borderRadius="14px"
          bg="rgba(255,255,255,0.035)"
          border="1px solid"
          borderColor={C.border}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute" top={0} left={0} right={0} h="1px"
            bgGradient={`linear(to-r, transparent, ${C.accentBorder}, transparent)`}
          />
          <Flex w="38px" h="38px" flexShrink={0} align="center" justify="center" position="relative">
            <Box
              position="absolute" inset={0}
              bg={`linear-gradient(135deg, ${C.accent}, #0EA5E9)`}
              style={{ clipPath: HEX_CLIP }}
              opacity={0.15}
            />
            <Box
              position="absolute" inset="1px"
              border="1px solid" borderColor={C.accentBorder}
              style={{ clipPath: HEX_CLIP }}
            />
            <Text
              fontSize="15px" fontWeight="900"
              color={C.accent} lineHeight="1"
              fontFamily="'DM Mono', monospace"
              style={{ textShadow: `0 0 12px ${C.accent}` }}
            >
              W
            </Text>
          </Flex>
          <Box flex={1}>
            <Text
              fontSize="14.5px" fontWeight="700" color="white"
              letterSpacing="-0.02em" lineHeight="1.1"
              fontFamily="'DM Sans', system-ui, sans-serif"
            >
              WorkSphere
            </Text>
            <Flex align="center" gap={1.5} mt="3px">
              <Box w="4px" h="4px" borderRadius="full" bg={C.accent} boxShadow={`0 0 5px ${C.accent}`} />
              <Text
                fontSize="8.5px" color={C.muted} fontWeight="700"
                textTransform="uppercase" letterSpacing="0.18em"
                fontFamily="'DM Mono', monospace"
              >
                HRMS Platform
              </Text>
            </Flex>
          </Box>
          {onClose && (
            <IconButton
              icon={<Icon as={FaTimes} />}
              size="xs" variant="ghost"
              color={C.muted}
              _hover={{ color: "white", bg: C.surface }}
              onClick={onClose}
              aria-label="Close sidebar"
              borderRadius="8px"
              flexShrink={0}
            />
          )}
        </Flex>
      </Box>

      {/* ════ NAVIGATION ════ */}
      <VStack
        spacing={0} align="stretch"
        overflowY="auto" flex={1} pb={3}
        position="relative" zIndex={1}
        css={{
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(0,229,196,0.15)", borderRadius: "24px" }
        }}
      >
        {menuSections.map((section, si) => (
          <Box key={si}>
            <SectionLabel label={section.section} />
            {section.items.map((item) => {
              if (item.type === "single") {
                return (
                  <NavItem
                    key={item.key} to={item.to} icon={item.icon}
                    label={item.label} exact={item.exact} onClose={onClose}
                  />
                );
              }

              const isGroupActive = item.children.some((c) => isActivePath(c.to));
              const isOpen = openGroups[item.key];

              return (
                <Box key={item.key}>
                  <ParentItem
                    icon={item.icon} label={item.label}
                    active={isGroupActive} isOpen={isOpen}
                    onToggle={() => toggleGroup(item.key)}
                  />
                  {isOpen && (
                    <Box ml={6} mr={3} mb={1} pl={3} borderLeft="1px solid" borderColor={C.accentBorder} opacity={0.9}>
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

      {/* ════ USER CARD ════ */}
      <Box px={3} pb={4} pt={2} position="relative" zIndex={1}>
        <Box h="1px" mb={3} bgGradient={`linear(to-r, transparent, ${C.accentBorder}, transparent)`} />
        <Flex
          align="center" gap={3} p="10px"
          borderRadius="13px"
          bg="rgba(255,255,255,0.03)"
          border="1px solid" borderColor={C.border}
          cursor="pointer"
          _hover={{ bg: C.surfaceHover, borderColor: C.accentBorder }}
          transition="all 0.18s"
          onClick={() => navigate("/dashboard/profile")}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute" top={0} left={0} right={0} h="1px"
            bgGradient="linear(to-r, transparent, rgba(255,255,255,0.06), transparent)"
          />
          <Box position="relative">
            <Avatar
              size="sm" name={user?.name}
              bg={getAvatarBg(user?.name || "")}
              color="white" fontSize="xs"
              boxShadow={`0 0 10px rgba(0,229,196,0.2)`}
            />
            <Box
              position="absolute" bottom="0" right="0"
              w="8px" h="8px" borderRadius="full"
              bg={C.accent} border="1.5px solid" borderColor={C.bg}
              boxShadow={`0 0 6px ${C.accent}`}
            />
          </Box>
          <Box flex={1} minW={0}>
            <Text
              fontSize="13px" fontWeight="600" color="white"
              noOfLines={1} lineHeight="1.2"
              fontFamily="'DM Sans', system-ui, sans-serif"
            >
              {user?.name || "User"}
            </Text>
            <Badge
              mt="3px" fontSize="7px" px={1.5} py={0.5}
              borderRadius="full"
              bg={role === "Admin" ? C.accentDim : "rgba(96,165,250,0.12)"}
              color={role === "Admin" ? C.accent : "#60a5fa"}
              border="1px solid"
              borderColor={role === "Admin" ? C.accentBorder : "rgba(96,165,250,0.25)"}
              fontWeight="700" textTransform="uppercase" letterSpacing="0.1em"
              fontFamily="'DM Mono', monospace"
            >
              {role}
            </Badge>
          </Box>
          <Tooltip label="Logout" placement="top" hasArrow>
            <Flex
              w="28px" h="28px" borderRadius="8px"
              align="center" justify="center"
              color={C.muted}
              border="1px solid" borderColor="transparent"
              _hover={{ color: "#f87171", bg: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.22)" }}
              transition="all 0.18s" flexShrink={0}
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            >
              <Icon as={FaSignOutAlt} fontSize="10px" />
            </Flex>
          </Tooltip>
        </Flex>
      </Box>
    </Box>
  );
};

export default Sidebar;