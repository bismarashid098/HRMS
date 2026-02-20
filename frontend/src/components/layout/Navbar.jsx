import {
    Flex,
    Button,
    Text,
    HStack,
    Avatar,
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton
} from "@chakra-ui/react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
        : "WS";

    return (
        <Flex
            h="64px"
            px="8"
            align="center"
            justify="space-between"
            bg="green.900"
            color="white"
            borderBottomWidth="1px"
            borderColor="green.800"
            shadow="sm"
        >
            <Box>
                <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
                    WorkSphere HRMS
                </Text>
                <Text fontSize="xs" color="green.100">
                    Dashboard
                </Text>
            </Box>

            <HStack spacing="4">
                {user && (
                    <HStack spacing="3" display={{ base: "none", md: "flex" }} align="center">
                        <Box textAlign="right">
                            <Text fontSize="sm" fontWeight="medium">
                                {user.name}
                            </Text>
                            <Text fontSize="xs" color="green.100">
                                {user.role}
                            </Text>
                        </Box>
                        <Avatar
                            size="sm"
                            name={user.name}
                            bg="green.500"
                            color="white"
                            fontSize="xs"
                            showBorder
                            borderColor="green.500"
                        >
                            {initials}
                        </Avatar>
                    </HStack>
                )}

                <Menu>
                    <MenuButton
                        as={Button}
                        variant="outline"
                        size="sm"
                        colorScheme="green"
                        rightIcon={<FiUser />}
                    >
                        Account
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => navigate("/dashboard/profile")}>
                            My Profile
                        </MenuItem>
                        <MenuItem icon={<FiLogOut />} onClick={logout}>
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>

                <IconButton
                    aria-label="Logout"
                    icon={<FiLogOut />}
                    size="sm"
                    colorScheme="red"
                    variant="solid"
                    display={{ base: "flex", md: "none" }}
                    onClick={logout}
                />
            </HStack>
        </Flex>
    );
};

export default Navbar;
