import { useState, useEffect, useCallback, useContext } from "react";
import {
  Box, Flex, Grid, Text, Button, useToast, Select, Input,
  Spinner, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack,
  Icon, InputGroup, InputLeftElement, Avatar, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, FormControl,
  FormLabel, Switch
} from "@chakra-ui/react";
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaUserShield,
  FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", blue: "#1D4ED8", red: "#DC2626", amber: "#D97706", green: "#059669",
  text: "#0F172A", muted: "#64748B"
};

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Employee", isActive: true });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: { search: search || undefined, role: roleFilter !== "All" ? roleFilter : undefined, page, limit }
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast({ title: "Error loading users", status: "error" });
    } finally { setLoading(false); }
  }, [search, roleFilter, page, limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const handleOpenModal = (userData = null) => {
    setEditingUser(userData);
    setForm(userData ? { name: userData.name, email: userData.email, role: userData.role, isActive: userData.isActive } : { name: "", email: "", role: "Employee", isActive: true });
    onOpen();
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast({ title: "Name and email required", status: "warning" });
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, form);
        toast({ title: "User updated", status: "success" });
      } else {
        await api.post("/users", form);
        toast({ title: "User created", status: "success" });
      }
      fetchUsers();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message, status: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "User deleted", status: "success" });
      fetchUsers();
    } catch (err) {
      toast({ title: "Error", status: "error" });
    }
  };

  const roleColors = { Admin: T.teal, Manager: T.blue, Employee: T.green };
  const roleBg = { Admin: "#E0F2FE", Manager: "#DBEAFE", Employee: "#DCFCE7" };

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" mb={5}>
          <Box><Text fontSize="xl" fontWeight="bold" color={T.text}>User Management</Text><Text color={T.muted}>Manage system users and roles</Text></Box>
          <Button leftIcon={<FaPlus />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} borderRadius="10px" onClick={() => handleOpenModal()}>Add User</Button>
        </Flex>

        <Box bg={T.surface} p={4} borderRadius="14px" mb={4} border="1px solid" borderColor={T.border} display="flex" gap={3} flexWrap="wrap" boxShadow="0 1px 3px rgba(0,0,0,0.05)">
          <InputGroup maxW="300px"><InputLeftElement pointerEvents="none"><Icon as={FaSearch} color={T.muted} fontSize="13px" /></InputLeftElement><Input placeholder="Search name/email" value={search} onChange={e=>setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}/></InputGroup>
          <Select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} w="150px" bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}><option>All</option><option>Admin</option><option>Manager</option></Select>
        </Box>

        {loading ? <Flex justify="center" py={10}><Spinner color={T.teal} size="xl" /></Flex> : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto" border="1px solid" borderColor={T.border} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
            <Table variant="simple" size="sm">
              <Thead><Tr bg={T.surface2}><Th borderColor={T.border} color={T.muted}>User</Th><Th borderColor={T.border} color={T.muted}>Email</Th><Th borderColor={T.border} color={T.muted}>Role</Th><Th borderColor={T.border} color={T.muted}>Status</Th><Th borderColor={T.border} color={T.muted}>Actions</Th></Tr></Thead>
              <Tbody>
                {users.map(u => (
                  <Tr key={u._id} _hover={{bg:T.surface2}}>
                    <Td borderColor={T.border}><Flex align="center" gap={2}><Avatar size="xs" name={u.name}/><Text fontSize="sm" color={T.text}>{u.name}</Text></Flex></Td>
                    <Td borderColor={T.border} fontSize="sm" color={T.muted}>{u.email}</Td>
                    <Td><Badge bg={roleBg[u.role] || T.surface2} color={roleColors[u.role] || T.muted} borderRadius="full" px={2}>{u.role}</Badge></Td>
                    <Td><Badge bg={u.isActive ? "#DCFCE7" : "#FEE2E2"} color={u.isActive ? T.green : T.red} borderRadius="full" px={2}>{u.isActive ? "Active" : "Inactive"}</Badge></Td>
                    <Td borderColor={T.border}><HStack spacing={1}><Button size="xs" leftIcon={<FaEdit/>} variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal, color: T.teal }} borderRadius="8px" onClick={()=>handleOpenModal(u)}>Edit</Button><Button size="xs" leftIcon={<FaTrash/>} variant="outline" borderColor="#FECACA" color={T.red} _hover={{ bg: T.red, color: "white" }} borderRadius="8px" onClick={()=>handleDelete(u._id)}>Delete</Button></HStack></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justify="space-between" align="center" px={5} py={3} borderTop="1px solid" borderColor={T.border} wrap="wrap" gap={3}>
              <Text fontSize="xs" color={T.muted}>{(page-1)*limit+1} - {Math.min(page*limit,total)} of {total}</Text>
              <HStack spacing={1}><Button size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===1} onClick={()=>setPage(p=>p-1)} leftIcon={<FaChevronLeft/>}>Prev</Button><Button size="xs" variant="outline" borderColor={T.border} color={T.muted} _hover={{ borderColor: T.teal }} isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} rightIcon={<FaChevronRight/>}>Next</Button></HStack>
            </Flex>
          </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay bg="rgba(15,23,42,0.4)" />
          <ModalContent bg={T.surface} borderRadius="14px" border="1px solid" borderColor={T.border}>
            <ModalHeader borderBottom="1px solid" borderColor={T.border} color={T.text} fontSize="md" fontWeight="bold">{editingUser ? "Edit User" : "Add User"}</ModalHeader>
            <ModalCloseButton color={T.muted} />
            <ModalBody py={5}>
              <FormControl mb={4}><FormLabel fontSize="sm" color={T.muted}>Name</FormLabel><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}/></FormControl>
              <FormControl mb={4}><FormLabel fontSize="sm" color={T.muted}>Email</FormLabel><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}/></FormControl>
              <FormControl mb={4}><FormLabel fontSize="sm" color={T.muted}>Role</FormLabel><Select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} bg={T.bg} borderColor={T.border} color={T.text} borderRadius="10px" _focus={{ borderColor: T.teal }}><option>Admin</option><option>Manager</option></Select></FormControl>
              <FormControl display="flex" alignItems="center"><FormLabel mb="0" fontSize="sm" color={T.muted}>Active</FormLabel><Switch isChecked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} colorScheme="teal"/></FormControl>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor={T.border} gap={2}>
              <Button variant="ghost" color={T.muted} _hover={{ bg: T.surface2 }} borderRadius="10px" onClick={onClose}>Cancel</Button>
              <Button bg={T.teal} color="white" _hover={{ bg: T.tealDim }} borderRadius="10px" onClick={handleSave}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};
export default UserManagement;