import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundary";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import DashboardHome from "./DashboardHome";

const Dashboard = () => {
  const location = useLocation();
  const isHome = location.pathname === "/dashboard";

  return (
    <Flex h="100vh" bg="#061828" overflow="hidden">
      <Box w="250px" flexShrink={0}>
        <Sidebar />
      </Box>

      <Flex direction="column" flex="1" overflow="hidden">
        <TopNavbar />

        <Box
          flex="1"
          overflowY="auto"
          p={6}
          sx={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { bg: "#1e3a5f", borderRadius: "99px" },
          }}
        >
          <ErrorBoundary routeKey={location.pathname}>
            {isHome ? <DashboardHome /> : <Outlet />}
          </ErrorBoundary>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;
