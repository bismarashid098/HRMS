import { useContext, useState } from "react";
import {
    Box,
    Heading,
    VStack,
    Input,
    Button,
    Text,
    Divider,
    Stack
} from "@chakra-ui/react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
    const { user, updateUserProfile } = useContext(AuthContext);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const handleProfileSave = async () => {
        setProfileMessage("");
        setProfileError("");
        setSavingProfile(true);
        try {
            const { data } = await api.put("/auth/profile", {
                name,
                email
            });
            updateUserProfile(data);
            setProfileMessage("Profile updated successfully");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0]?.msg ||
                "Failed to update profile";
            setProfileError(message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordMessage("");
        setPasswordError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All password fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirm password do not match");
            return;
        }

        setSavingPassword(true);
        try {
            await api.put("/auth/change-password", {
                currentPassword,
                newPassword
            });
            setPasswordMessage("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0]?.msg ||
                "Failed to change password";
            setPasswordError(message);
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <Box maxW="700px" bg="white" p="6" borderRadius="md" shadow="sm">
            <Heading mb="6" size="lg">
                My Profile
            </Heading>

            <Stack direction={{ base: "column", md: "row" }} spacing="8">
                <Box flex="1">
                    <Heading size="md" mb="4">
                        Account Information
                    </Heading>
                    <VStack spacing="4" align="stretch">
                        <Input
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {profileError && (
                            <Text color="red.500" fontSize="sm">
                                {profileError}
                            </Text>
                        )}
                        {profileMessage && (
                            <Text color="green.500" fontSize="sm">
                                {profileMessage}
                            </Text>
                        )}
                        <Button
                            colorScheme="blue"
                            onClick={handleProfileSave}
                            isLoading={savingProfile}
                        >
                            Save Profile
                        </Button>
                    </VStack>
                </Box>

                <Divider orientation="vertical" display={{ base: "none", md: "block" }} />

                <Box flex="1">
                    <Heading size="md" mb="4">
                        Change Password
                    </Heading>
                    <VStack spacing="4" align="stretch">
                        <Input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {passwordError && (
                            <Text color="red.500" fontSize="sm">
                                {passwordError}
                            </Text>
                        )}
                        {passwordMessage && (
                            <Text color="green.500" fontSize="sm">
                                {passwordMessage}
                            </Text>
                        )}
                        <Button
                            colorScheme="blue"
                            variant="outline"
                            onClick={handlePasswordChange}
                            isLoading={savingPassword}
                        >
                            Update Password
                        </Button>
                    </VStack>
                </Box>
            </Stack>
        </Box>
    );
};

export default Profile;

