import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Select,
    Input,
    Button,
    VStack,
    Text,
    Spinner,
} from "@chakra-ui/react";
import api from "../../api/axios";

const Settings = () => {
    const [settings, setSettings] = useState({
        company: { name: "", email: "", address: "", phone: "" },
        attendance: { workingHours: { start: "09:00", end: "18:00" }, lateAfterMinutes: 15, halfDayAfterMinutes: 240 },
        payroll: { taxPercentage: 5, overtimeRatePerHour: 0 },
        currency: { code: "PKR", symbol: "₨" }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get("/settings");
                if (data) setSettings(data);
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (section, field, value) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedChange = (section, subsection, field, value) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }));
    };

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.put("/settings", settings);
            setMessage("Settings saved successfully!");
        } catch (err) {
            console.error("Error saving settings:", err);
            setMessage("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <Box maxW="600px" bg="white" p="6" borderRadius="md" shadow="sm">
            <Heading mb="6" size="lg">System Settings</Heading>

            <VStack spacing="6" align="stretch">
                
                {/* Company Info */}
                <Box>
                    <Heading size="md" mb="3">Company Information</Heading>
                    <VStack spacing="3">
                        <Input 
                            placeholder="Company Name" 
                            value={settings.company.name} 
                            onChange={(e) => handleChange("company", "name", e.target.value)} 
                        />
                        <Input 
                            placeholder="Email" 
                            value={settings.company.email} 
                            onChange={(e) => handleChange("company", "email", e.target.value)} 
                        />
                         <Input 
                            placeholder="Phone" 
                            value={settings.company.phone} 
                            onChange={(e) => handleChange("company", "phone", e.target.value)} 
                        />
                        <Input 
                            placeholder="Address" 
                            value={settings.company.address} 
                            onChange={(e) => handleChange("company", "address", e.target.value)} 
                        />
                    </VStack>
                </Box>

                {/* Attendance Settings */}
                <Box>
                    <Heading size="md" mb="3">Attendance Rules</Heading>
                    <VStack spacing="3">
                        <Box w="100%">
                            <Text mb="1">Working Hours Start</Text>
                            <Input 
                                type="time"
                                value={settings.attendance.workingHours.start} 
                                onChange={(e) => handleNestedChange("attendance", "workingHours", "start", e.target.value)} 
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb="1">Working Hours End</Text>
                            <Input 
                                type="time"
                                value={settings.attendance.workingHours.end} 
                                onChange={(e) => handleNestedChange("attendance", "workingHours", "end", e.target.value)} 
                            />
                        </Box>
                        <Box w="100%">
                            <Text mb="1">Late After (Minutes)</Text>
                            <Input 
                                type="number"
                                value={settings.attendance.lateAfterMinutes} 
                                onChange={(e) => handleChange("attendance", "lateAfterMinutes", Number(e.target.value))} 
                            />
                        </Box>
                    </VStack>
                </Box>

                {/* Payroll Settings */}
                <Box>
                    <Heading size="md" mb="3">Payroll Configuration</Heading>
                    <VStack spacing="3">
                        <Box w="100%">
                            <Text mb="1">Tax Percentage (%)</Text>
                            <Input 
                                type="number"
                                value={settings.payroll.taxPercentage} 
                                onChange={(e) => handleChange("payroll", "taxPercentage", Number(e.target.value))} 
                            />
                        </Box>
                         <Box w="100%">
                            <Text mb="1">Currency Symbol</Text>
                            <Input 
                                value={settings.currency.symbol} 
                                onChange={(e) => handleChange("currency", "symbol", e.target.value)} 
                            />
                        </Box>
                    </VStack>
                </Box>

                {message && (
                    <Text color={message.includes("success") ? "green.500" : "red.500"} fontWeight="bold">
                        {message}
                    </Text>
                )}

                <Button colorScheme="blue" onClick={save} isLoading={saving} size="lg">
                    Save Changes
                </Button>
            </VStack>
        </Box>
    );
};

export default Settings;
