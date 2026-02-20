import { useContext } from "react";
import { Box, Flex, Text, Button, Menu, MenuButton, MenuList, MenuItem, Avatar } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaChevronDown, FaSignOutAlt, FaUser } from "react-icons/fa";

const TopNavbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Box bg="white" px={6} py={3} shadow="sm" borderBottom="1px" borderColor="gray.100">
            <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    Welcome, {user?.name?.split(" ")[0]}! 👋
                </Text>

                <Menu>
                    <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost">
                        <Flex align="center" gap={2}>
                            <Avatar size="sm" name={user?.name} bg="#065f46" color="white" />
                            <Text display={{ base: "none", md: "block" }}>{user?.name}</Text>
                        </Flex>
                    </MenuButton>
                    <MenuList>
                        <MenuItem icon={<FaUser />} onClick={() => navigate("/dashboard/settings")}>
                            Profile Settings
                        </MenuItem>
                        <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout} color="red.500">
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
        </Box>
    );
};

export default TopNavbar;
