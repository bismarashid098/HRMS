import { useContext, useState } from "react";
import {
  Box, Flex, Grid, GridItem, VStack, Input, Button, Text,
  Avatar, Badge, Icon, InputGroup, InputRightElement, IconButton
} from "@chakra-ui/react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSave, FaKey } from "react-icons/fa";

const SectionCard = ({ icon, title, subtitle, color = "#065f46", children }) => (
  <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" borderTop="3px solid" borderTopColor={color} overflow="hidden">
    <Flex align="center" gap={3} px={6} py={4} borderBottom="1px solid" borderColor="gray.50">
      <Flex w={9} h={9} borderRadius="xl" bg={`${color}15`} align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color={color} fontSize="15px" />
      </Flex>
      <Box>
        <Text fontWeight="bold" fontSize="sm" color="gray.800">{title}</Text>
        <Text fontSize="xs" color="gray.400">{subtitle}</Text>
      </Box>
    </Flex>
    <Box px={6} py={5}>{children}</Box>
  </Box>
);

const FieldLabel = ({ children }) => (
  <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>{children}</Text>
);

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleProfileSave = async () => {
    setProfileMsg({ text: "", type: "" });
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", { name, email });
      updateUserProfile(data);
      setProfileMsg({ text: "Profile updated successfully", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err?.response?.data?.message || "Failed to update profile", type: "error" });
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async () => {
    setPasswordMsg({ text: "", type: "" });
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordMsg({ text: "All password fields are required", type: "error" }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ text: "New passwords do not match", type: "error" }); return; }
    setSavingPassword(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setPasswordMsg({ text: "Password changed successfully", type: "success" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ text: err?.response?.data?.message || "Failed to change password", type: "error" });
    } finally { setSavingPassword(false); }
  };

  const roleBadgeColor = user?.role === "Admin" ? "green" : "blue";

  return (
    <Box maxW="860px" mx="auto">
      {/* Header Banner */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex align="center" gap={5} position="relative">
          <Avatar size="xl" name={user?.name} bg="white" color="#065f46" fontWeight="bold" fontSize="2xl" shadow="lg" />
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">{user?.name}</Text>
            <Text fontSize="sm" color="whiteAlpha.700">{user?.email}</Text>
            <Flex align="center" gap={2} mt={2}>
              <Badge colorScheme={roleBadgeColor} borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="semibold">{user?.role}</Badge>
            </Flex>
          </Box>
        </Flex>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
        {/* Account Info */}
        <SectionCard icon={FaUser} title="Account Information" subtitle="Update your name and email address">
          <VStack spacing={4} align="stretch">
            <Box>
              <FieldLabel>Full Name</FieldLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} borderRadius="xl" focusBorderColor="#065f46" placeholder="Enter your full name" />
            </Box>
            <Box>
              <FieldLabel>Email Address</FieldLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} borderRadius="xl" focusBorderColor="#065f46" placeholder="Enter your email" />
            </Box>
            {profileMsg.text && (
              <Box bg={profileMsg.type === "success" ? "green.50" : "red.50"} borderRadius="xl" p={3}>
                <Text fontSize="sm" color={profileMsg.type === "success" ? "green.600" : "red.500"} fontWeight="medium">{profileMsg.text}</Text>
              </Box>
            )}
            <Button leftIcon={<FaSave />} bg="#065f46" color="white" _hover={{ bg: "#047857" }} borderRadius="xl"
              onClick={handleProfileSave} isLoading={savingProfile} loadingText="Saving...">
              Save Profile
            </Button>
          </VStack>
        </SectionCard>

        {/* Change Password */}
        <SectionCard icon={FaLock} title="Change Password" subtitle="Update your account password" color="#1d4ed8">
          <VStack spacing={4} align="stretch">
            <Box>
              <FieldLabel>Current Password</FieldLabel>
              <InputGroup>
                <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  borderRadius="xl" focusBorderColor="#1d4ed8" placeholder="Enter current password" />
                <InputRightElement>
                  <IconButton icon={showCurrent ? <FaEyeSlash /> : <FaEye />} size="sm" variant="ghost" aria-label="Toggle"
                    onClick={() => setShowCurrent(!showCurrent)} color="gray.400" />
                </InputRightElement>
              </InputGroup>
            </Box>
            <Box>
              <FieldLabel>New Password</FieldLabel>
              <InputGroup>
                <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  borderRadius="xl" focusBorderColor="#1d4ed8" placeholder="Enter new password" />
                <InputRightElement>
                  <IconButton icon={showNew ? <FaEyeSlash /> : <FaEye />} size="sm" variant="ghost" aria-label="Toggle"
                    onClick={() => setShowNew(!showNew)} color="gray.400" />
                </InputRightElement>
              </InputGroup>
            </Box>
            <Box>
              <FieldLabel>Confirm New Password</FieldLabel>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                borderRadius="xl" focusBorderColor="#1d4ed8" placeholder="Confirm new password" />
            </Box>
            {passwordMsg.text && (
              <Box bg={passwordMsg.type === "success" ? "green.50" : "red.50"} borderRadius="xl" p={3}>
                <Text fontSize="sm" color={passwordMsg.type === "success" ? "green.600" : "red.500"} fontWeight="medium">{passwordMsg.text}</Text>
              </Box>
            )}
            <Button leftIcon={<FaKey />} bg="#1d4ed8" color="white" _hover={{ bg: "#1e40af" }} borderRadius="xl"
              onClick={handlePasswordChange} isLoading={savingPassword} loadingText="Updating...">
              Update Password
            </Button>
          </VStack>
        </SectionCard>
      </Grid>
    </Box>
  );
};

export default Profile;
