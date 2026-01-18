import {
    Box,
    Heading,
    Input,
    Button,
    VStack,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import { useState } from "react";

const Settings = () => {
    const [company, setCompany] = useState("HRMS Pvt Ltd");
    const [workHours, setWorkHours] = useState("9 AM - 6 PM");

    const saveSettings = () => {
        alert("Settings Saved ✅ (UI Only)");
    };

    return (
        <Box maxW="400px">
            <Heading size="md" mb="4">
                System Settings
            </Heading>

            <VStack spacing="4">
                <FormControl>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Working Hours</FormLabel>
                    <Input
                        value={workHours}
                        onChange={(e) => setWorkHours(e.target.value)}
                    />
                </FormControl>

                <Button colorScheme="blue" onClick={saveSettings}>
                    Save Settings
                </Button>
            </VStack>
        </Box>
    );
};

export default Settings;
