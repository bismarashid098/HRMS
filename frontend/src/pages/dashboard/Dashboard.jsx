import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import { Outlet } from "react-router-dom";
import "../../style/dashboard.css";
import { Box, Flex, useDisclosure, useBreakpointValue } from "@chakra-ui/react";

const Dashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false }, { ssr: false });

  return (
    <Flex h="100vh" overflow="hidden" position="relative">
      {/* Desktop sidebar — always visible */}
      {!isMobile && (
        <Box w="250px" flexShrink={0} h="100vh">
          <Sidebar />
        </Box>
      )}

      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          zIndex={20}
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <Box
          position="fixed"
          top={0}
          left={0}
          bottom={0}
          w="260px"
          zIndex={21}
          transform={isOpen ? "translateX(0)" : "translateX(-100%)"}
          transition="transform 0.25s cubic-bezier(0.4,0,0.2,1)"
          boxShadow="2xl"
        >
          <Sidebar onClose={onClose} />
        </Box>
      )}

      {/* Main content area */}
      <Flex direction="column" flex="1" overflow="hidden" minW={0}>
        <TopNavbar onMenuOpen={isMobile ? onOpen : undefined} />
        <Box
          flex="1"
          overflowY="auto"
          bg="#f7f9fc"
          p={{ base: 3, sm: 4, md: 6 }}
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;
