import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  IconButton,
  Flex,
  Spinner,
  Text,
  useToast,
  Switch,
  Tooltip
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

const roleOptions = ["Admin", "HR", "Employee"];

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
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to load users. Only admins/HR can view users.";
      setError(message);
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id, newRole) => {
    const previousUsers = [...users];
    setUsers((current) =>
      current.map((user) => (user._id === id ? { ...user, role: newRole } : user))
    );

    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      toast({
        title: "Role updated",
        description: "User role has been updated.",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch {
      setUsers(previousUsers);
      toast({
        title: "Error",
        description: "Failed to update role.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleStatusToggle = async (id) => {
    const previousUsers = [...users];
    setUsers((current) =>
      current.map((user) =>
        user._id === id ? { ...user, isActive: !user.isActive } : user
      )
    );

    try {
      const { data } = await api.put(`/users/${id}/status`);
      toast({
        title: "Status updated",
        description: data?.message || "User status has been updated.",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch {
      setUsers(previousUsers);
      toast({
        title: "Error",
        description: "Failed to update status.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const previousUsers = [...users];
    setUsers((current) => current.filter((user) => user._id !== id));

    try {
      const { data } = await api.delete(`/users/${id}`);
      toast({
        title: "User deleted",
        description: data?.message || "User has been deleted (soft delete).",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch {
      setUsers(previousUsers);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const getStatusBadgeColor = (isActive) => (isActive ? "green" : "red");

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.50">
          User Management
        </Heading>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="green.400" />
        </Flex>
      ) : error ? (
        <Text color="red.300">{error}</Text>
      ) : users.length === 0 ? (
        <Text color="gray.200">No users found.</Text>
      ) : (
        <Box overflowX="auto" bg="rgba(15,23,42,0.6)" borderRadius="lg" borderWidth="1px" borderColor="whiteAlpha.200">
          <Table variant="simple" size="sm">
            <Thead bg="whiteAlpha.100">
              <Tr>
                <Th color="green.50">Name</Th>
                <Th color="green.50">Email</Th>
                <Th color="green.50">Role</Th>
                <Th color="green.50">Status</Th>
                <Th color="green.50" textAlign="center">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user._id}>
                  <Td color="gray.50" fontWeight="medium">
                    {user.name}
                  </Td>
                  <Td color="gray.200">{user.email}</Td>
                  <Td>
                    <Select
                      size="sm"
                      value={user.role}
                      maxW="150px"
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      bg="green.900"
                      borderColor="green.700"
                      color="green.100"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Flex align="center" gap={2}>
                      <Badge colorScheme={getStatusBadgeColor(user.isActive)}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        size="sm"
                        colorScheme="green"
                        isChecked={user.isActive}
                        onChange={() => handleStatusToggle(user._id)}
                      />
                    </Flex>
                  </Td>
                  <Td textAlign="center">
                    <Tooltip label="Delete user" hasArrow>
                      <IconButton
                        aria-label="Delete user"
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(user._id)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default UserManagement;
