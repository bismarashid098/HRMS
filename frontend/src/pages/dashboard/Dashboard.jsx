import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import { Outlet } from "react-router-dom";
import { Box, Flex, useDisclosure, useBreakpointValue } from "@chakra-ui/react";

const Dashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false }, { ssr: false });

  return (
    <Flex h="100vh" overflow="hidden" position="relative" bg="#0b0f1a">
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box w="260px" flexShrink={0} h="100vh" borderRight="1px solid rgba(255,255,255,0.05)">
          <Sidebar />
        </Box>
      )}

      {/* Mobile sidebar logic */}
      {isMobile && isOpen && (
        <Box position="fixed" inset={0} bg="blackAlpha.800" zIndex={20} onClick={onClose} />
      )}
      {isMobile && (
        <Box
          position="fixed" top={0} left={0} bottom={0} w="260px" zIndex={21}
          transform={isOpen ? "translateX(0)" : "translateX(-100%)"}
          transition="transform 0.3s ease"
          bg="#151b2d"
        >
          <Sidebar onClose={onClose} />
        </Box>
      )}

      {/* Main Content */}
      <Flex direction="column" flex="1" overflow="hidden" minW={0}>
        <TopNavbar onMenuOpen={isMobile ? onOpen : undefined} />
        <Box
          flex="1"
          overflowY="auto"
          className="dashboard-grid"
          p={{ base: 4, md: 8 }}
          sx={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        >
          {/* Outlet render DashboardHome here */}
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;