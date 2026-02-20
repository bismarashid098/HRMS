import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Icon,
  VStack,
  Divider,
  Collapse
} from "@chakra-ui/react";
import {
  FaHome,
  FaUsers,
  FaCalendarCheck,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaHistory,
  FaFileInvoiceDollar,
  FaPlus,
  FaUserCircle,
  FaHandHoldingUsd,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const NavItem = ({ to, icon, label, exact = false, isChild = false }) => {
  const location = useLocation();

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const active = exact ? location.pathname === to : isActivePath(to);

  return (
    <NavLink to={to} style={{ textDecoration: "none", width: "100%" }}>
      <Flex
        align="center"
        py="2.5"
        pl={isChild ? 9 : 4}
        pr={4}
        mx="3"
        borderRadius="full"
        cursor="pointer"
        bg={active ? "whiteAlpha.200" : "transparent"}
        color={active ? "white" : "gray.100"}
        _hover={{
          bg: "whiteAlpha.200",
          color: "white"
        }}
        transition="all 0.2s"
      >
        <Icon
          mr="3"
          fontSize="17"
          as={icon}
          color={active ? "green.200" : "gray.300"}
        />
        <Text fontSize="sm" fontWeight={active ? "semibold" : "medium"}>
          {label}
        </Text>
      </Flex>
    </NavLink>
  );
};

const ParentItem = ({ icon, label, active, isOpen, onToggle }) => {
  return (
    <Flex
      align="center"
      py="2.5"
      pl={4}
      pr={3}
      mx="3"
      borderRadius="full"
      cursor="pointer"
      bg={active ? "whiteAlpha.200" : "transparent"}
      color={active ? "white" : "gray.100"}
      _hover={{
        bg: "whiteAlpha.200",
        color: "white"
      }}
      transition="all 0.2s"
      onClick={onToggle}
    >
      <Icon
        mr="3"
        fontSize="17"
        as={icon}
        color={active ? "green.200" : "gray.300"}
      />
      <Text fontSize="sm" fontWeight={active ? "semibold" : "medium"}>
        {label}
      </Text>
      <Icon
        as={isOpen ? FaChevronDown : FaChevronRight}
        ml="auto"
        fontSize="14"
        color={active ? "green.200" : "gray.400"}
      />
    </Flex>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const baseMenu = [
    {
      key: "dashboard",
      type: "single",
      label: "Dashboard",
      icon: FaHome,
      to: "/dashboard"
    },
    {
      key: "employees",
      type: "group",
      label: "Employees",
      icon: FaUsers,
      children: [
        { to: "/dashboard/employees", label: "Employee List", icon: FaUsers },
        { to: "/dashboard/employees/create", label: "Add Employee", icon: FaPlus }
      ]
    },
    {
      key: "attendance",
      type: "group",
      label: "Attendance",
      icon: FaCalendarCheck,
      children: [
        { to: "/dashboard/attendance", label: "Attendance", icon: FaCalendarCheck },
        { to: "/dashboard/reports/attendance", label: "Attendance Report", icon: FaChartBar }
      ]
    },
    {
      key: "leaves",
      type: "group",
      label: "Leaves",
      icon: FaClipboardList,
      children: [
        { to: "/dashboard/leaves", label: "Leaves", icon: FaClipboardList },
        { to: "/dashboard/reports/leaves", label: "Leave Report", icon: FaChartBar }
      ]
    },
    {
      key: "payroll",
      type: "group",
      label: "Payroll",
      icon: FaMoneyBillWave,
      children: [
        { to: "/dashboard/payroll", label: "Payroll", icon: FaMoneyBillWave },
        { to: "/dashboard/advance", label: "Advance Salary", icon: FaHandHoldingUsd },
        { to: "/dashboard/reports/payroll", label: "Payroll Report", icon: FaFileInvoiceDollar },
        { to: "/dashboard/reports/advances", label: "Advance Report", icon: FaFileInvoiceDollar }
      ]
    },
    {
      key: "system",
      type: "group",
      label: "System",
      icon: FaCog,
      children: [
        { to: "/dashboard/users", label: "Users", icon: FaUsers },
        { to: "/dashboard/profile", label: "My Profile", icon: FaUserCircle },
        { to: "/dashboard/audit", label: "Audit Logs", icon: FaHistory },
        { to: "/dashboard/settings", label: "Settings", icon: FaCog }
      ]
    }
  ];

  const menu =
    role === "Manager"
      ? [
          {
            key: "employees",
            type: "group",
            label: "Employees",
            icon: FaUsers,
            children: [
              {
                to: "/dashboard/employees",
                label: "Employee List",
                icon: FaUsers
              }
            ]
          },
          {
            key: "attendance",
            type: "group",
            label: "Attendance",
            icon: FaCalendarCheck,
            children: [
              {
                to: "/dashboard/attendance/daily",
                label: "Attendance Report",
                icon: FaCalendarCheck
              }
            ]
          },
          {
            key: "leaves",
            type: "group",
            label: "Leaves",
            icon: FaClipboardList,
            children: [
              {
                to: "/dashboard/leaves",
                label: "Leave Module",
                icon: FaClipboardList
              }
            ]
          }
        ]
      : baseMenu;

  const initialOpenState = {};
  menu.forEach((item) => {
    if (item.type === "group") {
      initialOpenState[item.key] = true;
    }
  });

  const [openGroups, setOpenGroups] = React.useState(initialOpenState);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Box
      w="100%"
      h="100%"
      bgGradient="linear(to-b, #021024, #065f46)"
      color="white"
      display="flex"
      flexDirection="column"
      borderRight="1px"
      borderColor="green.800"
    >
      <Flex h="24" alignItems="center" px="6" mb="2">
        <Box
          bg="whiteAlpha.100"
          borderRadius="xl"
          px="4"
          py="3"
        >
          <Text
            fontSize="2xl"
            fontFamily="heading"
            fontWeight="extrabold"
            letterSpacing="tight"
            bgGradient="linear(to-r, green.200, emerald.300)"
            bgClip="text"
          >
            WorkSphere
          </Text>
          <Text fontSize="xs" mt="1" color="whiteAlpha.800">
            WorkSphere HRMS
          </Text>
        </Box>
      </Flex>

      <VStack
        spacing="1"
        align="stretch"
        overflowY="auto"
        flex="1"
        px="2"
        pb="6"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#4b5563", borderRadius: "24px" }
        }}
      >
        {menu.map((item) => {
          if (item.type === "single") {
            return (
              <Box key={item.key}>
                <Text
                  px="6"
                  fontSize="xs"
                  fontWeight="bold"
                  color="green.100"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb="1"
                  mt="2"
                >
                  {item.label}
                </Text>
                <NavItem to={item.to} icon={item.icon} label="Overview" exact />
                <Divider my="3" borderColor="whiteAlpha.200" />
              </Box>
            );
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
              <Collapse in={isOpen} animateOpacity>
                <VStack spacing="0.5" align="stretch" mt="1" mb="1">
                  {item.children.map((child) => (
                    <NavItem
                      key={child.to}
                      to={child.to}
                      icon={child.icon}
                      label={child.label}
                      isChild
                    />
                  ))}
                </VStack>
              </Collapse>
              <Divider my="3" borderColor="whiteAlpha.200" />
            </Box>
          );
        })}
      </VStack>

      <Box p="4" borderTop="1px" borderColor="whiteAlpha.200" bg="blackAlpha.200">
        <Text fontSize="xs" color="gray.300" textAlign="center">
          © 2026 WorkSphere v2.0
        </Text>
      </Box>
    </Box>
  );
};

export default Sidebar;
