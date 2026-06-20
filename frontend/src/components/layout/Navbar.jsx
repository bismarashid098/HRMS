import {
  Flex,
  Text,
  HStack,
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";

import {
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiBell,
} from "react-icons/fi";

import { FaShieldAlt } from "react-icons/fa";

import { AuthContext } from "../../context/AuthContext";

/* ───────────────── THEME ───────────────── */

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
  muted: "rgba(255,255,255,0.45)",
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E")`;

const avatarColors = [
  "#065f46",
  "#1d4ed8",
  "#7c3aed",
  "#d97706",
  "#dc2626",
];

const getAvatarBg = (name = "") =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

/* ───────────────── LIVE CLOCK ───────────────── */

const LiveClock = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const pakistanTime = now.toLocaleTimeString("en-PK", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setTime(pakistanTime);
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text
      fontSize="12px"
      fontWeight="700"
      color={C.accent}
      fontFamily="'DM Mono', monospace"
      letterSpacing="0.06em"
    >
      {time}
    </Text>
  );
};/* ───────────────── BREAD PILL ───────────────── */

const BreadPill = ({ children }) => (
  <Box
    px={3}
    py={1}
    borderRadius="8px"
    bg={C.surface}
    border="1px solid"
    borderColor={C.border}
    fontSize="11px"
    fontWeight="600"
    color={C.muted}
    fontFamily="'DM Mono', monospace"
    letterSpacing="0.06em"
  >
    {children}
  </Box>
);

/* ───────────────── ICON BUTTON ───────────────── */

const NavIconBtn = ({ icon, badge }) => (
  <Box position="relative" cursor="pointer">
    <Flex
      w="36px"
      h="36px"
      borderRadius="10px"
      bg={C.surface}
      border="1px solid"
      borderColor={C.border}
      align="center"
      justify="center"
      color={C.muted}
      _hover={{
        bg: C.surfaceHover,
        borderColor: C.accentBorder,
        color: C.text,
        transform: "translateY(-1px)",
      }}
      transition="all 0.18s ease"
    >
      <Icon as={icon} fontSize="14px" />
    </Flex>

    {badge && (
      <Box
        position="absolute"
        top="7px"
        right="7px"
        w="6px"
        h="6px"
        borderRadius="full"
        bg="#FF6B6B"
        border={`1.5px solid ${C.bg}`}
        boxShadow="0 0 6px rgba(255,107,107,0.7)"
      />
    )}
  </Box>
);

/* ═══════════════════════════════════
                NAVBAR
═══════════════════════════════════ */

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Flex
      h="68px"
      px={{ base: 4, md: 6 }}
      align="center"
      justify="space-between"
      bg={C.bg}
      backgroundImage={DOT_BG}
      backgroundSize="24px 24px"
      borderBottom="1px solid"
      borderColor={C.border}
      position="relative"
      overflow="hidden"
      zIndex={20}
    >
      {/* Bottom Glow Line */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="1px"
        bgGradient={`linear(to-r, transparent, ${C.accentBorder}, transparent)`}
      />

      {/* ───────────────── LEFT ───────────────── */}

      <HStack spacing={4} align="center">
        <Box>
          <HStack spacing={2} align="center">
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="800"
              color={C.text}
              letterSpacing="-0.02em"
            >
              Dashboard
            </Text>

            <Box
              w="5px"
              h="5px"
              borderRadius="full"
              bg={C.accent}
              boxShadow={`0 0 8px ${C.accent}`}
            />
          </HStack>

          <Text
            fontSize="10px"
            color={C.muted}
            mt="2px"
            fontFamily="'DM Mono', monospace"
            letterSpacing="0.05em"
          >
            {today}
          </Text>
        </Box>

        {!isMobile && (
          <BreadPill>WorkSphere HRMS</BreadPill>
        )}
      </HStack>

      {/* ───────────────── RIGHT ───────────────── */}

      <HStack spacing={3} align="center">

        {/* LIVE CLOCK */}
        {!isMobile && (
          <Box
            px={3}
            py={1.5}
            borderRadius="10px"
            bg={C.surface}
            border="1px solid"
            borderColor={C.border}
          >
            <LiveClock />
          </Box>
        )}

        {/* Notifications */}
        <NavIconBtn icon={FiBell} badge />

        {/* Divider */}
        <Box
          w="1px"
          h="24px"
          bg={C.border}
          display={{ base: "none", md: "block" }}
        />

        {/* USER MENU */}
        {user && (
          <Menu placement="bottom-end" autoSelect={false}>
            <MenuButton>
              <Flex
                align="center"
                gap={3}
                px={3}
                py="7px"
                borderRadius="12px"
                bg={C.surface}
                border="1px solid"
                borderColor={C.border}
                cursor="pointer"
                _hover={{
                  bg: C.surfaceHover,
                  borderColor: C.accentBorder,
                  transform: "translateY(-1px)",
                }}
                transition="all 0.18s ease"
                position="relative"
                overflow="hidden"
              >
                {/* Shine */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="1px"
                  bgGradient="linear(to-r, transparent, rgba(255,255,255,0.08), transparent)"
                />

                {/* Avatar */}
                <Box position="relative">
                  <Avatar
                    size="sm"
                    name={user.name}
                    bg={getAvatarBg(user.name || "")}
                    color="white"
                    fontSize="11px"
                    boxShadow={`0 0 10px ${C.accentGlow}`}
                  />

                  <Box
                    position="absolute"
                    bottom="0px"
                    right="0px"
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={C.accent}
                    border={`2px solid ${C.bg}`}
                    boxShadow={`0 0 6px ${C.accent}`}
                  />
                </Box>

                {/* USER INFO */}
                {!isMobile && (
                  <Box textAlign="left">
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color={C.text}
                      lineHeight="1.1"
                    >
                      {user.name}
                    </Text>

                    <Flex align="center" gap={1} mt="2px">
                      <Icon
                        as={FaShieldAlt}
                        fontSize="8px"
                        color={C.accent}
                      />

                      <Text
                        fontSize="9px"
                        color={C.accent}
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                        fontFamily="'DM Mono', monospace"
                      >
                        {user.role}
                      </Text>
                    </Flex>
                  </Box>
                )}

                <Icon
                  as={FiChevronDown}
                  fontSize="12px"
                  color={C.muted}
                />
              </Flex>
            </MenuButton>

            {/* ───────────────── DROPDOWN ───────────────── */}

            <MenuList
              bg="#0F1623"
              border="1px solid"
              borderColor={C.border}
              borderRadius="14px"
              p={2}
              minW="230px"
              mt={3}
              zIndex={9999}
              boxShadow="
                0 24px 60px rgba(0,0,0,0.65),
                0 0 0 1px rgba(255,255,255,0.05)
              "
            >
              {/* HEADER */}
              <Box
                px={3}
                py={3}
                mb={2}
                borderRadius="10px"
                bg={C.accentDim}
                border="1px solid"
                borderColor={C.accentBorder}
              >
                <Text
                  fontSize="13px"
                  fontWeight="700"
                  color={C.text}
                >
                  {user.name}
                </Text>

                <Text
                  fontSize="10px"
                  color={C.muted}
                  mt="2px"
                  fontFamily="'DM Mono', monospace"
                >
                  {user.email}
                </Text>
              </Box>

              {/* PROFILE */}
              <MenuItem
                icon={<Icon as={FiUser} fontSize="13px" />}
                onClick={() => navigate("/dashboard/profile")}
                borderRadius="10px"
                fontSize="13px"
                fontWeight="500"
                color={C.muted}
                bg="transparent"
                _hover={{
                  bg: C.surface,
                  color: C.text,
                }}
              >
                My Profile
              </MenuItem>

              {/* LOGOUT */}
              <MenuItem
                icon={<Icon as={FiLogOut} fontSize="13px" />}
                onClick={handleLogout}
                borderRadius="10px"
                fontSize="13px"
                fontWeight="500"
                color="rgba(248,113,113,0.75)"
                bg="transparent"
                _hover={{
                  bg: "rgba(248,113,113,0.08)",
                  color: "#f87171",
                }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Flex>
  );
};

export default Navbar;