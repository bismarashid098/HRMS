import { useState } from "react";
import {
    Box,
    Heading,
    Select,
    Input,
    Button,
    VStack,
} from "@chakra-ui/react";

import {
    getAdvanceSettings,
    saveAdvanceSettings,
} from "../../utils/advanceSettings";

const Settings = () => {
    const [settings, setSettings] = useState(getAdvanceSettings());

    const save = () => {
        saveAdvanceSettings(settings);
        alert("Advance settings saved");
    };

    return (
        <Box maxW="400px">
            <Heading mb="4">Advance Settings</Heading>

            <VStack spacing="3">
                <Select
                    value={settings.type}
                    onChange={(e) =>
                        setSettings({
                            ...settings,
                            type: e.target.value,
                        })
                    }
                >
                    <option value="PERCENTAGE">
                        Percentage of Salary
                    </option>
                    <option value="FIXED">
                        Fixed Amount (Rs)
                    </option>
                </Select>

                <Input
                    type="number"
                    placeholder={
                        settings.type === "PERCENTAGE"
                            ? "Percentage (%)"
                            : "Amount (Rs)"
                    }
                    value={settings.value}
                    onChange={(e) =>
                        setSettings({
                            ...settings,
                            value: Number(e.target.value),
                        })
                    }
                />

                <Button colorScheme="blue" onClick={save}>
                    Save Settings
                </Button>
            </VStack>
        </Box>
    );
};

export default Settings;
