import { useState, useEffect, useContext } from "react";
import { Box, Flex, Text, Button, Avatar, VStack, HStack, Badge, Divider, Input, FormControl, FormLabel, useToast, Spinner, Icon, Grid } from "@chakra-ui/react";
import { FaUser, FaEnvelope, FaBriefcase, FaBuilding, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const T = { bg:"#0D1117", surface:"#161B22", surface2:"#1C2330", border:"#30363D", teal:"#00D4B4", text:"#E6EDF3", muted:"#8B949E" };

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", designation: "", department: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setProfile(res.data);
        setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone || "", address: res.data.address || "", designation: res.data.designation || "", department: res.data.department || "" });
      } catch (err) { toast({ title: "Error loading profile", status: "error" }); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put("/users/profile", form);
      setProfile(res.data);
      setUser({ ...user, name: res.data.name, email: res.data.email });
      toast({ title: "Profile updated", status: "success" });
      setEditing(false);
    } catch (err) { toast({ title: "Error", status: "error" }); }
  };

  if (loading) return <Flex justify="center" align="center" h="300px"><Spinner size="xl" color={T.teal} /></Flex>;

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="800px" mx="auto">
        <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} p={6}>
          <Flex justify="space-between" align="center" mb={6}>
            <Flex align="center" gap={4}>
              <Avatar size="xl" name={profile?.name} bg={T.teal} color="white" />
              <Box><Text fontSize="2xl" fontWeight="bold" color={T.text}>{profile?.name}</Text><Badge bg={`${T.teal}20`} color={T.teal} px={2} py={1} borderRadius="full">{user?.role}</Badge></Box>
            </Flex>
            <Button leftIcon={editing ? <FaSave/> : <FaEdit/>} bg={editing ? T.green : T.teal} color={T.bg} onClick={editing ? handleSave : () => setEditing(true)}>{editing ? "Save" : "Edit"}</Button>
          </Flex>
          <Divider borderColor={T.border} my={4} />
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
            <InfoField label="Name" value={form.name} editing={editing} onChange={(v)=>setForm({...form,name:v})} />
            <InfoField label="Email" value={form.email} editing={editing} onChange={(v)=>setForm({...form,email:v})} type="email" />
            <InfoField label="Phone" value={form.phone} editing={editing} onChange={(v)=>setForm({...form,phone:v})} />
            <InfoField label="Address" value={form.address} editing={editing} onChange={(v)=>setForm({...form,address:v})} />
            <InfoField label="Designation" value={form.designation} editing={editing} onChange={(v)=>setForm({...form,designation:v})} />
            <InfoField label="Department" value={form.department} editing={editing} onChange={(v)=>setForm({...form,department:v})} />
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

const InfoField = ({ label, value, editing, onChange, type = "text" }) => (
  <Box>
    <Text fontSize="xs" color={T.muted} mb={1}>{label}</Text>
    {editing ? <Input type={type} value={value} onChange={(e)=>onChange(e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} size="sm" /> : <Text color={T.text} fontSize="sm">{value || "—"}</Text>}
  </Box>
);
export default Profile;