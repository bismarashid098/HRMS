import { useState, useEffect, useContext } from "react";
import { Box, Flex, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Input, InputGroup, InputLeftElement, Icon, Avatar, Spinner, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel, Select, NumberInput, NumberInputField } from "@chakra-ui/react";
import { FaSearch, FaPlus, FaCheck, FaTimes, FaMoneyBillWave, FaEye } from "react-icons/fa";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const T = { bg:"#0D1117", surface:"#161B22", border:"#30363D", teal:"#00D4B4", green:"#3FB950", red:"#FF6B6B", amber:"#F0A500", text:"#E6EDF3", muted:"#8B949E" };

const AdvanceSalary = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({ employeeId:"", amount:"", reason:"", requestedDate: new Date().toISOString().slice(0,10) });

  const fetchRequests = async () => {
    try { const res = await api.get("/advance-salary"); setRequests(res.data); } catch(err){ toast({title:"Error loading"})}
    finally { setLoading(false); }
  };
  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async () => {
    if(!form.employeeId || !form.amount) return toast({title:"Required fields missing", status:"warning"});
    try{ await api.post("/advance-salary", form); toast({title:"Request submitted", status:"success"}); fetchRequests(); onClose(); }
    catch(err){ toast({title:"Error", status:"error"}); }
  };

  const updateStatus = async (id, status) => {
    try{ await api.put(`/advance-salary/${id}`, { status }); toast({title:`Request ${status}`, status:"success"}); fetchRequests(); }
    catch(err){ toast({title:"Error", status:"error"}); }
  };

  const filtered = requests.filter(r => r.employeeName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box bg={T.bg} p={5} minH="100vh">
      <Flex justify="space-between" mb={5}><Box><Text fontSize="xl" fontWeight="bold" color={T.text}>Advance Salary Requests</Text><Text color={T.muted}>Manage employee salary advances</Text></Box><Button leftIcon={<FaPlus />} bg={T.teal} color={T.bg} onClick={onOpen}>New Request</Button></Flex>
      <InputGroup maxW="300px" mb={4}><InputLeftElement><FaSearch color={T.muted}/></InputLeftElement><Input placeholder="Search employee..." value={search} onChange={e=>setSearch(e.target.value)} bg={T.surface} borderColor={T.border} color={T.text}/></InputGroup>
      {loading ? <Spinner /> : (
        <Box bg={T.surface} borderRadius="14px" overflowX="auto">
          <Table variant="simple"><Thead><Tr bg={T.surface2}><Th>Employee</Th><Th>Amount</Th><Th>Date</Th><Th>Reason</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>{filtered.map(req=>(<Tr key={req._id}><Td><Flex align="center" gap={2}><Avatar size="xs" name={req.employeeName}/><Text>{req.employeeName}</Text></Flex></Td><Td>Rs {req.amount?.toLocaleString()}</Td><Td>{new Date(req.requestedDate).toLocaleDateString()}</Td><Td>{req.reason}</Td><Td><Badge bg={req.status==="Approved"?`${T.green}20`:"Pending"?`${T.amber}20`:`${T.red}20`} color={req.status==="Approved"?T.green:req.status==="Pending"?T.amber:T.red}>{req.status}</Badge></Td><Td><HStack>{req.status==="Pending" && <><Button size="xs" leftIcon={<FaCheck/>} onClick={()=>updateStatus(req._id,"Approved")}>Approve</Button><Button size="xs" leftIcon={<FaTimes/>} onClick={()=>updateStatus(req._id,"Rejected")}>Reject</Button></>}</HStack></Td></Tr>))}</Tbody></Table>
        </Box>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered><ModalOverlay/><ModalContent bg={T.surface}><ModalHeader color={T.text}>Advance Request</ModalHeader><ModalCloseButton/><ModalBody><FormControl mb={3}><FormLabel>Employee</FormLabel><Select placeholder="Select employee" onChange={e=>setForm({...form, employeeId:e.target.value})} bg={T.bg} borderColor={T.border}><option value="emp123">John Doe</option></Select></FormControl><FormControl mb={3}><FormLabel>Amount (Rs)</FormLabel><NumberInput><NumberInputField onChange={e=>setForm({...form, amount:e.target.value})} bg={T.bg} borderColor={T.border}/></NumberInput></FormControl><FormControl mb={3}><FormLabel>Reason</FormLabel><Input as="textarea" onChange={e=>setForm({...form, reason:e.target.value})} bg={T.bg} borderColor={T.border}/></FormControl></ModalBody><ModalFooter><Button onClick={onClose}>Cancel</Button><Button bg={T.teal} ml={3} onClick={handleSubmit}>Submit</Button></ModalFooter></ModalContent></Modal>
    </Box>
  );
};
export default AdvanceSalary;