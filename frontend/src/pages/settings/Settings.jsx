import { useState, useEffect } from "react";
import {
  Box, Flex, Grid, Text, Input, Button, Spinner, Icon, InputGroup,
  InputLeftElement, VStack
} from "@chakra-ui/react";
import {
  FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaUserClock, FaMoneyBillWave, FaPercentage, FaSave, FaCheckCircle
} from "react-icons/fa";
import api from "../../api/axios";

const SectionCard = ({ title, subtitle, icon, color, bg, children }) => (
  <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
    <Flex align="center" gap={3} px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
      <Flex w={9} h={9} borderRadius="xl" bg={bg} align="center" justify="center" flexShrink={0}>
        <Icon as={icon} color={color} fontSize="15px" />
      </Flex>
      <Box>
        <Text fontWeight="bold" fontSize="sm" color="gray.800">{title}</Text>
        <Text fontSize="xs" color="gray.400">{subtitle}</Text>
      </Box>
    </Flex>
    <Box p={5}>{children}</Box>
  </Box>
);

const FieldLabel = ({ label, required }) => (
  <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5} textTransform="uppercase" letterSpacing="wide">
    {label}{required && <Text as="span" color="red.400" ml={1}>*</Text>}
  </Text>
);

const IconInput = ({ leftIcon, ...props }) => (
  <InputGroup>
    <InputLeftElement pointerEvents="none" h="full">
      <Icon as={leftIcon} color="gray.300" fontSize="13px" />
    </InputLeftElement>
    <Input
      pl={9}
      borderRadius="xl"
      fontSize="sm"
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      focusBorderColor="#065f46"
      _hover={{ borderColor: "gray.300" }}
      {...props}
    />
  </InputGroup>
);

const Settings = () => {
  const [settings, setSettings] = useState({
    company: { name: "", email: "", address: "", phone: "" },
    attendance: { workingHours: { start: "09:00", end: "18:00" }, lateAfterMinutes: 15, halfDayAfterMinutes: 240 },
    payroll: { taxPercentage: 5, overtimeRatePerHour: 0, monthlyOffDays: 3 },
    currency: { code: "PKR", symbol: "₨" },
    advances: { limitType: "PERCENTAGE", limitValue: 30 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        if (data) setSettings(data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [subsection]: { ...prev[section][subsection], [field]: value } }
    }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.put("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <Flex justify="center" align="center" h="400px" direction="column" gap={3}>
      <Spinner size="xl" color="#065f46" thickness="3px" />
      <Text color="gray.400" fontSize="sm">Loading settings...</Text>
    </Flex>
  );

  return (
    <Box>
      {/* Header */}
      <Box bgGradient="linear(135deg, #021024 0%, #065f46 100%)" borderRadius="2xl" p={6} mb={5} position="relative" overflow="hidden">
        <Box position="absolute" top={-8} right={-8} w="140px" h="140px" borderRadius="full" bg="whiteAlpha.100" />
        <Flex justify="space-between" align="center" position="relative">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="white">System Settings</Text>
            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>Configure company info, attendance rules and payroll</Text>
          </Box>
          <Button
            leftIcon={saved ? <FaCheckCircle /> : <FaSave />}
            bg={saved ? "green.400" : "whiteAlpha.200"}
            color="white"
            _hover={{ bg: saved ? "green.500" : "whiteAlpha.300" }}
            borderRadius="xl"
            size="md"
            onClick={save}
            isLoading={saving}
            loadingText="Saving"
            border="1px solid"
            borderColor="whiteAlpha.300"
          >
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </Flex>
      </Box>

      {error && (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={4} mb={4}>
          <Text color="red.600" fontSize="sm">{error}</Text>
        </Box>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        {/* Company Information */}
        <SectionCard title="Company Information" subtitle="Basic company details and contact info" icon={FaBuilding} color="#065f46" bg="#f0fdf4">
          <VStack spacing={4}>
            <Box w="full">
              <FieldLabel label="Company Name" required />
              <IconInput
                leftIcon={FaBuilding}
                placeholder="e.g. WorkSphere Technologies"
                value={settings.company.name}
                onChange={(e) => handleChange("company", "name", e.target.value)}
              />
            </Box>
            <Box w="full">
              <FieldLabel label="Email Address" required />
              <IconInput
                leftIcon={FaEnvelope}
                type="email"
                placeholder="company@example.com"
                value={settings.company.email}
                onChange={(e) => handleChange("company", "email", e.target.value)}
              />
            </Box>
            <Box w="full">
              <FieldLabel label="Phone Number" />
              <IconInput
                leftIcon={FaPhone}
                type="tel"
                placeholder="+92 300 0000000"
                value={settings.company.phone}
                onChange={(e) => handleChange("company", "phone", e.target.value)}
              />
            </Box>
            <Box w="full">
              <FieldLabel label="Address" />
              <IconInput
                leftIcon={FaMapMarkerAlt}
                placeholder="Street, City, Country"
                value={settings.company.address}
                onChange={(e) => handleChange("company", "address", e.target.value)}
              />
            </Box>
          </VStack>
        </SectionCard>

        {/* Attendance Rules */}
        <SectionCard title="Attendance Rules" subtitle="Define working hours and late thresholds" icon={FaUserClock} color="#1d4ed8" bg="#eff6ff">
          <VStack spacing={4}>
            <Grid templateColumns="1fr 1fr" gap={4} w="full">
              <Box>
                <FieldLabel label="Work Start Time" required />
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="full">
                    <Icon as={FaClock} color="gray.300" fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    type="time"
                    pl={9}
                    borderRadius="xl"
                    fontSize="sm"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    focusBorderColor="#1d4ed8"
                    value={settings.attendance.workingHours.start}
                    onChange={(e) => handleNestedChange("attendance", "workingHours", "start", e.target.value)}
                  />
                </InputGroup>
              </Box>
              <Box>
                <FieldLabel label="Work End Time" required />
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="full">
                    <Icon as={FaClock} color="gray.300" fontSize="13px" />
                  </InputLeftElement>
                  <Input
                    type="time"
                    pl={9}
                    borderRadius="xl"
                    fontSize="sm"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    focusBorderColor="#1d4ed8"
                    value={settings.attendance.workingHours.end}
                    onChange={(e) => handleNestedChange("attendance", "workingHours", "end", e.target.value)}
                  />
                </InputGroup>
              </Box>
            </Grid>
            <Box w="full">
              <FieldLabel label="Mark Late After (Minutes)" />
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FaUserClock} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  type="number"
                  pl={9}
                  borderRadius="xl"
                  fontSize="sm"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  focusBorderColor="#1d4ed8"
                  placeholder="e.g. 15"
                  value={settings.attendance.lateAfterMinutes}
                  onChange={(e) => handleChange("attendance", "lateAfterMinutes", Number(e.target.value))}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.400" mt={1}>Employee is marked late if punch-in is {settings.attendance.lateAfterMinutes} min after work start</Text>
            </Box>
            <Box w="full">
              <FieldLabel label="Half Day After (Minutes)" />
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FaUserClock} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  type="number"
                  pl={9}
                  borderRadius="xl"
                  fontSize="sm"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  focusBorderColor="#1d4ed8"
                  placeholder="e.g. 240"
                  value={settings.attendance.halfDayAfterMinutes}
                  onChange={(e) => handleChange("attendance", "halfDayAfterMinutes", Number(e.target.value))}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.400" mt={1}>Marked as half day if present less than {Math.round(settings.attendance.halfDayAfterMinutes / 60)}h</Text>
            </Box>
          </VStack>
        </SectionCard>

        {/* Payroll Configuration */}
        <SectionCard title="Payroll Configuration" subtitle="Tax and overtime salary settings" icon={FaMoneyBillWave} color="#d97706" bg="#fffbeb">
          <VStack spacing={4}>
            <Box w="full">
              <FieldLabel label="Tax Percentage (%)" />
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FaPercentage} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  type="number"
                  pl={9}
                  borderRadius="xl"
                  fontSize="sm"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  focusBorderColor="#d97706"
                  placeholder="e.g. 5"
                  min={0}
                  max={100}
                  value={settings.payroll.taxPercentage}
                  onChange={(e) => handleChange("payroll", "taxPercentage", Number(e.target.value))}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.400" mt={1}>Applied on basic salary during payroll generation</Text>
            </Box>
            <Box w="full">
              <FieldLabel label="Monthly Off Days" />
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FaClock} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  type="number"
                  pl={9}
                  borderRadius="xl"
                  fontSize="sm"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  focusBorderColor="#d97706"
                  placeholder="e.g. 3"
                  min={0}
                  value={settings.payroll.monthlyOffDays}
                  onChange={(e) => handleChange("payroll", "monthlyOffDays", Number(e.target.value))}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.400" mt={1}>Used to calculate working days for payroll deductions</Text>
            </Box>
            <Box w="full">
              <FieldLabel label="Overtime Rate (per hour)" />
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FaMoneyBillWave} color="gray.300" fontSize="13px" />
                </InputLeftElement>
                <Input
                  type="number"
                  pl={9}
                  borderRadius="xl"
                  fontSize="sm"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  focusBorderColor="#d97706"
                  placeholder="e.g. 200"
                  min={0}
                  value={settings.payroll.overtimeRatePerHour}
                  onChange={(e) => handleChange("payroll", "overtimeRatePerHour", Number(e.target.value))}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.400" mt={1}>Rate per hour for overtime work (Rs)</Text>
            </Box>
          </VStack>
        </SectionCard>

        {/* Advance Salary Rules */}
        <SectionCard title="Advance Salary Rules" subtitle="Set how much advance an employee can request per month" icon={FaMoneyBillWave} color="#0f766e" bg="#f0fdfa">
          <VStack spacing={4}>
            <Box w="full">
              <FieldLabel label="Limit Type" />
              <Input
                as="select"
                borderRadius="xl"
                fontSize="sm"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                focusBorderColor="#0f766e"
                value={settings.advances?.limitType || "PERCENTAGE"}
                onChange={(e) => handleChange("advances", "limitType", e.target.value)}
              >
                <option value="PERCENTAGE">Percentage of Basic Salary</option>
                <option value="FIXED">Fixed Amount</option>
              </Input>
            </Box>
            <Box w="full">
              <FieldLabel label={settings.advances?.limitType === "FIXED" ? "Limit Value (Rs)" : "Limit Value (%)"} />
              <Input
                type="number"
                borderRadius="xl"
                fontSize="sm"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                focusBorderColor="#0f766e"
                min={0}
                value={settings.advances?.limitValue ?? 30}
                onChange={(e) => handleChange("advances", "limitValue", Number(e.target.value))}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>
                Enforced on advance requests (Pending/Approved/Paid) within the same month
              </Text>
            </Box>
          </VStack>
        </SectionCard>

        {/* Currency Settings */}
        <SectionCard title="Currency Settings" subtitle="Set the currency used across the system" icon={FaMoneyBillWave} color="#7c3aed" bg="#f5f3ff">
          <VStack spacing={4}>
            <Box w="full">
              <FieldLabel label="Currency Code" />
              <Input
                borderRadius="xl"
                fontSize="sm"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                focusBorderColor="#7c3aed"
                placeholder="e.g. PKR, USD"
                value={settings.currency.code}
                onChange={(e) => handleChange("currency", "code", e.target.value)}
              />
            </Box>
            <Box w="full">
              <FieldLabel label="Currency Symbol" />
              <Input
                borderRadius="xl"
                fontSize="sm"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                focusBorderColor="#7c3aed"
                placeholder="e.g. ₨, $"
                value={settings.currency.symbol}
                onChange={(e) => handleChange("currency", "symbol", e.target.value)}
              />
            </Box>
            <Box bg="purple.50" borderRadius="xl" p={4} w="full">
              <Text fontSize="sm" color="purple.700" fontWeight="semibold">Preview</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.800" mt={1}>
                {settings.currency.symbol} 50,000 {settings.currency.code}
              </Text>
              <Text fontSize="xs" color="purple.500">Sample salary display format</Text>
            </Box>
          </VStack>
        </SectionCard>
      </Grid>

      {/* Bottom Save Button */}
      <Flex justify="flex-end" mt={5}>
        <Button
          leftIcon={saved ? <FaCheckCircle /> : <FaSave />}
          bg={saved ? "#065f46" : "#021024"}
          color="white"
          _hover={{ bg: saved ? "#047857" : "#1a2a4a" }}
          borderRadius="xl"
          size="lg"
          px={8}
          onClick={save}
          isLoading={saving}
          loadingText="Saving Changes"
        >
          {saved ? "Changes Saved!" : "Save All Settings"}
        </Button>
      </Flex>
    </Box>
  );
};

export default Settings;
