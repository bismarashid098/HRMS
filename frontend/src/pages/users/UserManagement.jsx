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
  bg: "#0D1117", surface: "#161B22", surface2: "#1C2330", border: "#30363D",
  teal: "#00D4B4", blue: "#58A6FF", red: "#FF6B6B", amber: "#F0A500", green: "#3FB950",
  text: "#E6EDF3", muted: "#8B949E"
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

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" mb={5}>
          <Box><Text fontSize="xl" fontWeight="bold" color={T.text}>User Management</Text><Text color={T.muted}>Manage system users and roles</Text></Box>
          <Button leftIcon={<FaPlus />} bg={T.teal} color={T.bg} onClick={() => handleOpenModal()}>Add User</Button>
        </Flex>

        <Box bg={T.surface} p={4} borderRadius="14px" mb={4} display="flex" gap={3} flexWrap="wrap">
          <InputGroup maxW="300px"><InputLeftElement><FaSearch color={T.muted}/></InputLeftElement><Input placeholder="Search name/email" value={search} onChange={e=>setSearch(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text}/></InputGroup>
          <Select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} w="150px" bg={T.bg} borderColor={T.border} color={T.text}><option>All</option><option>Admin</option><option>Manager</option><option>Employee</option></Select>
        </Box>

        {loading ? <Spinner /> : (
          <Box bg={T.surface} borderRadius="14px" overflowX="auto">
            <Table variant="simple">
              <Thead><Tr bg={T.surface2}><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
              <Tbody>
                {users.map(u => (
                  <Tr key={u._id} _hover={{bg:T.surface2}}>
                    <Td><Flex align="center" gap={2}><Avatar size="xs" name={u.name}/><Text>{u.name}</Text></Flex></Td>
                    <Td>{u.email}</Td>
                    <Td><Badge bg={`${roleColors[u.role]}20`} color={roleColors[u.role]}>{u.role}</Badge></Td>
                    <Td><Badge bg={u.isActive ? `${T.green}20` : `${T.red}20`} color={u.isActive ? T.green : T.red}>{u.isActive ? "Active" : "Inactive"}</Badge></Td>
                    <Td><HStack><Button size="xs" leftIcon={<FaEdit/>} onClick={()=>handleOpenModal(u)}>Edit</Button><Button size="xs" leftIcon={<FaTrash/>} colorScheme="red" onClick={()=>handleDelete(u._id)}>Delete</Button></HStack></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justify="space-between" p={3} borderTop={`1px solid ${T.border}`}>
              <Text fontSize="xs" color={T.muted}>{(page-1)*limit+1} - {Math.min(page*limit,total)} of {total}</Text>
              <HStack><Button size="xs" isDisabled={page===1} onClick={()=>setPage(p=>p-1)} leftIcon={<FaChevronLeft/>}>Prev</Button><Button size="xs" isDisabled={page===Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} rightIcon={<FaChevronRight/>}>Next</Button></HStack>
            </Flex>
          </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose} isCentered><ModalOverlay/><ModalContent bg={T.surface}><ModalHeader>{editingUser ? "Edit User" : "Add User"}</ModalHeader><ModalCloseButton/><ModalBody><FormControl mb={3}><FormLabel>Name</FormLabel><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} bg={T.bg} borderColor={T.border} color={T.text}/></FormControl><FormControl mb={3}><FormLabel>Email</FormLabel><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} bg={T.bg} borderColor={T.border} color={T.text}/></FormControl><FormControl mb={3}><FormLabel>Role</FormLabel><Select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} bg={T.bg} borderColor={T.border}><option>Admin</option><option>Manager</option><option>Employee</option></Select></FormControl><FormControl display="flex" alignItems="center"><FormLabel mb="0">Active</FormLabel><Switch isChecked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} colorScheme="green"/></FormControl></ModalBody><ModalFooter><Button onClick={onClose}>Cancel</Button><Button bg={T.teal} ml={3} onClick={handleSave}>Save</Button></ModalFooter></ModalContent></Modal>
      </Box>
    </Box>
  );
};
export default UserManagement;