import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Box, Flex, Table, Thead, Tbody, Tr, Th, Td, Badge, Select,
  IconButton, Spinner, Text, useToast, Switch, Tooltip, Avatar, Grid, Icon
} from "@chakra-ui/react";
import { FaTrash, FaUsers, FaUserShield, FaUserCheck, FaUserTimes } from "react-icons/fa";

const roleOptions = ["Admin", "Manager"];
const avatarBgColors = ["#065f46", "#1d4ed8", "#7c3aed", "#d97706"];
const getAvatarBg = (name = "") => avatarBgColors[name.charCodeAt(0) % avatarBgColors.length];

const StatCard = ({ label, value, color, bg, icon }) => (
  <Box bg="white" borderRadius="2xl" p={4} shadow="sm" border="1px solid" borderColor="gray.100" borderLeft="4px solid" borderLeftColor={color}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>{value}</Text>
      </Box>
      <Flex w={10} h={10} borderRadius="xl" bg={bg} align="center" justify="center">
        <Icon as={icon} color={color} fontSize="16px" />
      </Flex>
    </Flex>
  </Box>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load users.";
      setError(message);
      toast({ title: "Error", description: message, status: "error", duration: 4000, isClosable: true });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id, newRole) => {
    const prev = [...users];
    setUsers((cur) => cur.map((u) => u._id === id ? { ...u, role: newRole } : u));
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      toast({ title: "Role updated", status: "success", duration: 3000, isClosable: true });
    } catch { setUsers(prev); toast({ title: "Error updating role", status: "error", duration: 3000, isClosable: true }); }
  };

  const handleStatusToggle = async (id) => {
    const prev = [...users];
    setUsers((cur) => cur.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
    try {
      const { data } = await api.put(`/users/${id}/status`);
      toast({ title: "Status updated", description: data?.message, status: "success", duration: 3000, isClosable: true });
    } catch { setUsers(prev); toast({ title: "Error updating status", status: "error", duration: 3000, isClosable: true }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const prev = [...users];
    setUsers((cur) => cur.filter((u) => u._id !== id));
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "User deleted", status: "success", duration: 3000, isClosable: true });
    } catch { setUsers(prev); toast({ title: "Error deleting user", status: "error", duration: 3000, isClosable: true }); }
  };

  const total = users.length;
  const admins = users.filter((u) => u.role === "Admin").length;
  const active = users.filter((u) => u.isActive).length;
  const inactive = users.filter((u) => !u.isActive).length;

  return (
    <Box>
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #1d4ed8 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">User Management</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Manage system users, roles and access control</Text>
          </Box>
        </Flex>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={5}>
        <StatCard label="Total Users" value={total} color="#1d4ed8" bg="#eff6ff" icon={FaUsers} />
        <StatCard label="Admins" value={admins} color="#7c3aed" bg="#f5f3ff" icon={FaUserShield} />
        <StatCard label="Active" value={active} color="#065f46" bg="#f0fdf4" icon={FaUserCheck} />
        <StatCard label="Inactive" value={inactive} color="#dc2626" bg="#fef2f2" icon={FaUserTimes} />
      </Grid>

      {loading ? (
        <Flex justify="center" align="center" h="250px" direction="column" gap={3}>
          <Spinner size="xl" color="#1d4ed8" thickness="3px" />
          <Text color="gray.400" fontSize="sm">Loading users...</Text>
        </Flex>
      ) : error ? (
        <Box bg="red.50" borderRadius="xl" p={6}><Text color="red.500">{error}</Text></Box>
      ) : users.length === 0 ? (
        <Box bg="white" borderRadius="2xl" p={12} textAlign="center" shadow="sm">
          <Text color="gray.400">No users found.</Text>
        </Box>
      ) : (
        <Box bg="white" shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">User</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Role</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  <Th py={3} fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user._id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                    <Td py={3}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" name={user.name} bg={getAvatarBg(user.name)} color="white" fontSize="xs" fontWeight="bold" />
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{user.name}</Text>
                          <Text fontSize="xs" color="gray.400">{user.email}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td py={3}>
                      <Select size="sm" value={user.role} maxW="140px" borderRadius="lg" focusBorderColor="#1d4ed8"
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}>
                        {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                      </Select>
                    </Td>
                    <Td py={3}>
                      <Flex align="center" gap={3}>
                        <Switch size="sm" colorScheme="green" isChecked={user.isActive} onChange={() => handleStatusToggle(user._id)} />
                        <Badge colorScheme={user.isActive ? "green" : "red"} borderRadius="full" px={2} py={0.5} fontSize="xs" fontWeight="semibold">
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Flex>
                    </Td>
                    <Td py={3} textAlign="center">
                      <Tooltip label="Delete user" hasArrow>
                        <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" borderRadius="lg" onClick={() => handleDelete(user._id)} />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserManagement;
