import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import { Outlet } from "react-router-dom";
import "../../style/dashboard.css";
import { Box, Flex, useMediaQuery } from "@chakra-ui/react";

const Dashboard = () => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  return (
    <Flex h="100vh" overflow="hidden" direction={isMobile ? "column" : "row"}>
      <Box
        w={isMobile ? "100%" : "250px"}
        flexShrink={0}
        borderRight={isMobile ? "none" : "1px solid"}
        borderColor={isMobile ? "transparent" : "green.800"}
      >
        <Sidebar />
      </Box>

      <Flex direction="column" flex="1" overflow="hidden">
        <TopNavbar />

        <Box
          flex="1"
          overflowY="auto"
          bg="#f7f9fc"
          p={{ base: 4, md: 6 }}
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;
