import { Flex, Button, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <Flex
            h="60px"
            px="6"
            align="center"
            justify="space-between"
            bg="blue.600"
            color="white"
        >
            <Text fontWeight="bold">HRMS Dashboard</Text>

            <Button size="sm" colorScheme="red" onClick={logout}>
                Logout
            </Button>
        </Flex>
    );
};

export default Navbar;
