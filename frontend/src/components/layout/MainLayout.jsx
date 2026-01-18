import { Box, Flex } from "@chakra-ui/react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
    return (
        <Flex minH="100vh">
            <Sidebar />

            <Box flex="1">
                <Navbar />
                <Box p="6">{children}</Box>
            </Box>
        </Flex>
    );
};

export default MainLayout;
