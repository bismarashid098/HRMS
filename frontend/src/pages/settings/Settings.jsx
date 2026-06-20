import { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Switch, useToast, Spinner, Divider,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Select, Grid, GridItem, Alert, AlertIcon,
  Icon, Tooltip, SimpleGrid, Card, CardBody, Heading, VStack
} from "@chakra-ui/react";
import {
  FaSave, FaBuilding, FaClock, FaShieldAlt, FaEnvelope, FaBell,
  FaMoneyBillWave, FaUmbrellaBeach, FaDatabase, FaSyncAlt
} from "react-icons/fa";
import api from "../../api/axios";

const T = {
  bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", border: "#E2E8F0",
  teal: "#0891B2", tealDim: "#0E7490", blue: "#1D4ED8", red: "#DC2626", amber: "#D97706", green: "#059669",
  text: "#0F172A", muted: "#64748B"
};

const Settings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General
    companyName: "WorkSphere",
    companyEmail: "admin@worksphere.com",
    companyPhone: "+92 123 4567890",
    companyAddress: "Karachi, Pakistan",
    logoUrl: "",
    timezone: "Asia/Karachi",
    dateFormat: "DD/MM/YYYY",
    // Attendance
    attendance: {
      workingHours: { start: "09:00", end: "17:00" },
      lateAfterMinutes: 15,
      halfDayAfterMinutes: 240,
      allowRemotePunch: true,
      requirePhoto: false,
      geoFencing: false
    },
    // Leave
    leave: {
      casualDaysPerYear: 12,
      sickDaysPerYear: 10,
      annualDaysPerYear: 14,
      carryForward: true,
      maxCarryForwardDays: 10,
      approvalRequired: true
    },
    // Payroll
    payroll: {
      salaryDay: 28,
      enableOvertime: true,
      overtimeRate: 1.5,
      loanLimit: 50000,
      advanceSalaryLimit: 30000,
      taxDeduction: true
    },
    // Security
    security: {
      sessionTimeout: 60,
      twoFactorAuth: false,
      passwordExpiryDays: 90,
      maxLoginAttempts: 5,
      lockoutDuration: 30
    },
    // Notifications
    notifications: {
      emailOnLeave: true,
      emailOnAttendance: false,
      emailOnPayroll: true,
      slackWebhook: "",
      whatsappEnabled: false
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        setSettings(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        toast({ title: "Error loading settings", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (section) => {
    setSaving(true);
    try {
      await api.put("/settings", settings);
      toast({ title: `${section} settings saved`, status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Error saving settings", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) return <Flex justify="center" align="center" h="300px"><Spinner size="xl" color={T.teal} /></Flex>;

  return (
    <Box bg={T.bg} minH="100vh" p={5}>
      <Box maxW="1200px" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5}>
          <Box>
            <Text fontSize="xl" fontWeight="700" color={T.text}>System Settings</Text>
            <Text fontSize="sm" color={T.muted}>Configure company policies, attendance rules, payroll and security</Text>
          </Box>
          <Button
            leftIcon={<FaSyncAlt />}
            variant="outline"
            borderColor={T.border}
            color={T.muted}
            _hover={{ borderColor: T.teal, color: T.teal }}
            onClick={() => window.location.reload()}
            size="sm"
          >
            Refresh
          </Button>
        </Flex>

        {/* Main Card */}
        <Box bg={T.surface} borderRadius="14px" border={`1px solid ${T.border}`} p={6}>
          <Tabs variant="soft-rounded" colorScheme="teal">
            <TabList overflowX="auto" pb={2}>
              <Tab _selected={{ bg: T.teal, color: "white" }} color={T.muted}>General</Tab>
              <Tab _selected={{ bg: T.teal, color: "white" }} color={T.muted}>Attendance</Tab>
              <Tab _selected={{ bg: T.teal, color: "white" }} color={T.muted}>Leave</Tab>
              <Tab _selected={{ bg: T.teal, color: "white" }} color={T.muted}>Payroll</Tab>
              <Tab _selected={{ bg: T.teal, color: "white" }} color={T.muted}>Security</Tab>
              <Tab _selected={{ bg: T.teal, color: "white" }} color={T.muted}>Notifications</Tab>
            </TabList>

            <TabPanels pt={6}>
              {/* ────────────────── General Settings ────────────────── */}
              <TabPanel px={0}>
                <SettingsSection title="Company Information" icon={FaBuilding}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                    <FormControl>
                      <FormLabel fontSize="sm" color={T.muted}>Company Name</FormLabel>
                      <Input value={settings.companyName} onChange={(e) => updateSetting('companyName', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color={T.muted}>Company Email</FormLabel>
                      <Input type="email" value={settings.companyEmail} onChange={(e) => updateSetting('companyEmail', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color={T.muted}>Company Phone</FormLabel>
                      <Input value={settings.companyPhone} onChange={(e) => updateSetting('companyPhone', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color={T.muted}>Company Address</FormLabel>
                      <Input value={settings.companyAddress} onChange={(e) => updateSetting('companyAddress', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color={T.muted}>Timezone</FormLabel>
                      <Select value={settings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text}>
                        <option>Asia/Karachi</option><option>Asia/Dubai</option><option>America/New_York</option><option>Europe/London</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color={T.muted}>Date Format</FormLabel>
                      <Select value={settings.dateFormat} onChange={(e) => updateSetting('dateFormat', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text}>
                        <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Button leftIcon={<FaSave />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} mt={5} onClick={() => handleSave("General")} isLoading={saving}>Save General</Button>
                </SettingsSection>
              </TabPanel>

              {/* ────────────────── Attendance Settings ────────────────── */}
              <TabPanel px={0}>
                <SettingsSection title="Working Hours & Attendance Rules" icon={FaClock}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                    <FormControl><FormLabel>Start Time</FormLabel><Input type="time" value={settings.attendance.workingHours.start} onChange={(e) => updateSetting('attendance.workingHours.start', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} /></FormControl>
                    <FormControl><FormLabel>End Time</FormLabel><Input type="time" value={settings.attendance.workingHours.end} onChange={(e) => updateSetting('attendance.workingHours.end', e.target.value)} bg={T.bg} borderColor={T.border} color={T.text} /></FormControl>
                    <FormControl><FormLabel>Late After (minutes)</FormLabel><NumberInput min={0} value={settings.attendance.lateAfterMinutes} onChange={(v) => updateSetting('attendance.lateAfterMinutes', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /><NumberInputStepper><NumberIncrementStepper/><NumberDecrementStepper/></NumberInputStepper></NumberInput></FormControl>
                    <FormControl><FormLabel>Half‑Day After (minutes)</FormLabel><NumberInput min={0} value={settings.attendance.halfDayAfterMinutes} onChange={(v) => updateSetting('attendance.halfDayAfterMinutes', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /><NumberInputStepper><NumberIncrementStepper/><NumberDecrementStepper/></NumberInputStepper></NumberInput></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Allow Remote Punch</FormLabel><Switch isChecked={settings.attendance.allowRemotePunch} onChange={(e) => updateSetting('attendance.allowRemotePunch', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Require Photo on Punch</FormLabel><Switch isChecked={settings.attendance.requirePhoto} onChange={(e) => updateSetting('attendance.requirePhoto', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Geo‑fencing (location based)</FormLabel><Switch isChecked={settings.attendance.geoFencing} onChange={(e) => updateSetting('attendance.geoFencing', e.target.checked)} colorScheme="green" /></FormControl>
                  </Grid>
                  <Button leftIcon={<FaSave />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} mt={5} onClick={() => handleSave("Attendance")} isLoading={saving}>Save Attendance</Button>
                </SettingsSection>
              </TabPanel>

              {/* ────────────────── Leave Settings ────────────────── */}
              <TabPanel px={0}>
                <SettingsSection title="Leave Policies" icon={FaUmbrellaBeach}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                    <FormControl><FormLabel>Casual Leaves per Year</FormLabel><NumberInput min={0} value={settings.leave.casualDaysPerYear} onChange={(v) => updateSetting('leave.casualDaysPerYear', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl><FormLabel>Sick Leaves per Year</FormLabel><NumberInput min={0} value={settings.leave.sickDaysPerYear} onChange={(v) => updateSetting('leave.sickDaysPerYear', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl><FormLabel>Annual Leaves per Year</FormLabel><NumberInput min={0} value={settings.leave.annualDaysPerYear} onChange={(v) => updateSetting('leave.annualDaysPerYear', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Carry‑forward unused leaves</FormLabel><Switch isChecked={settings.leave.carryForward} onChange={(e) => updateSetting('leave.carryForward', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl><FormLabel>Max Carry‑forward Days</FormLabel><NumberInput min={0} isDisabled={!settings.leave.carryForward} value={settings.leave.maxCarryForwardDays} onChange={(v) => updateSetting('leave.maxCarryForwardDays', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Approval required for leaves</FormLabel><Switch isChecked={settings.leave.approvalRequired} onChange={(e) => updateSetting('leave.approvalRequired', e.target.checked)} colorScheme="green" /></FormControl>
                  </Grid>
                  <Button leftIcon={<FaSave />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} mt={5} onClick={() => handleSave("Leave")} isLoading={saving}>Save Leave Policies</Button>
                </SettingsSection>
              </TabPanel>

              {/* ────────────────── Payroll Settings ────────────────── */}
              <TabPanel px={0}>
                <SettingsSection title="Payroll & Salary" icon={FaMoneyBillWave}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                    <FormControl><FormLabel>Salary Processing Day (of month)</FormLabel><NumberInput min={1} max={31} value={settings.payroll.salaryDay} onChange={(v) => updateSetting('payroll.salaryDay', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Enable Overtime</FormLabel><Switch isChecked={settings.payroll.enableOvertime} onChange={(e) => updateSetting('payroll.enableOvertime', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl><FormLabel>Overtime Rate (x hourly)</FormLabel><NumberInput min={1} max={3} step={0.1} value={settings.payroll.overtimeRate} onChange={(v) => updateSetting('payroll.overtimeRate', parseFloat(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl><FormLabel>Loan Limit (Rs)</FormLabel><NumberInput min={0} value={settings.payroll.loanLimit} onChange={(v) => updateSetting('payroll.loanLimit', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl><FormLabel>Advance Salary Limit (Rs)</FormLabel><NumberInput min={0} value={settings.payroll.advanceSalaryLimit} onChange={(v) => updateSetting('payroll.advanceSalaryLimit', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Enable Tax Deduction</FormLabel><Switch isChecked={settings.payroll.taxDeduction} onChange={(e) => updateSetting('payroll.taxDeduction', e.target.checked)} colorScheme="green" /></FormControl>
                  </Grid>
                  <Alert status="info" bg="#DBEAFE" borderRadius="10px" mt={4} border="1px solid #BFDBFE">
                    <AlertIcon color={T.blue} /><Text fontSize="xs" color={T.muted}>Tax rules and loan deductions will be applied during payroll processing as per these limits.</Text>
                  </Alert>
                  <Button leftIcon={<FaSave />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} mt={5} onClick={() => handleSave("Payroll")} isLoading={saving}>Save Payroll Settings</Button>
                </SettingsSection>
              </TabPanel>

              {/* ────────────────── Security Settings ────────────────── */}
              <TabPanel px={0}>
                <SettingsSection title="Security & Authentication" icon={FaShieldAlt}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                    <FormControl><FormLabel>Session Timeout (minutes)</FormLabel><NumberInput min={5} max={480} value={settings.security.sessionTimeout} onChange={(v) => updateSetting('security.sessionTimeout', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Two‑Factor Authentication</FormLabel><Switch isChecked={settings.security.twoFactorAuth} onChange={(e) => updateSetting('security.twoFactorAuth', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl><FormLabel>Password Expiry (days)</FormLabel><NumberInput min={30} max={365} value={settings.security.passwordExpiryDays} onChange={(v) => updateSetting('security.passwordExpiryDays', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl><FormLabel>Max Login Attempts</FormLabel><NumberInput min={3} max={10} value={settings.security.maxLoginAttempts} onChange={(v) => updateSetting('security.maxLoginAttempts', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                    <FormControl><FormLabel>Account Lockout Duration (minutes)</FormLabel><NumberInput min={5} max={1440} value={settings.security.lockoutDuration} onChange={(v) => updateSetting('security.lockoutDuration', parseInt(v))}><NumberInputField bg={T.bg} borderColor={T.border} color={T.text} /></NumberInput></FormControl>
                  </Grid>
                  <Button leftIcon={<FaSave />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} mt={5} onClick={() => handleSave("Security")} isLoading={saving}>Save Security</Button>
                </SettingsSection>
              </TabPanel>

              {/* ────────────────── Notifications Settings ────────────────── */}
              <TabPanel px={0}>
                <SettingsSection title="Email & Alerts" icon={FaBell}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Email on Leave Request</FormLabel><Switch isChecked={settings.notifications.emailOnLeave} onChange={(e) => updateSetting('notifications.emailOnLeave', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Email on Attendance Mark</FormLabel><Switch isChecked={settings.notifications.emailOnAttendance} onChange={(e) => updateSetting('notifications.emailOnAttendance', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">Email on Payroll Generation</FormLabel><Switch isChecked={settings.notifications.emailOnPayroll} onChange={(e) => updateSetting('notifications.emailOnPayroll', e.target.checked)} colorScheme="green" /></FormControl>
                    <FormControl><FormLabel>Slack Webhook (optional)</FormLabel><Input value={settings.notifications.slackWebhook} onChange={(e) => updateSetting('notifications.slackWebhook', e.target.value)} placeholder="https://hooks.slack.com/..." bg={T.bg} borderColor={T.border} color={T.text} /></FormControl>
                    <FormControl display="flex" alignItems="center"><FormLabel mb="0">WhatsApp Alerts</FormLabel><Switch isChecked={settings.notifications.whatsappEnabled} onChange={(e) => updateSetting('notifications.whatsappEnabled', e.target.checked)} colorScheme="green" /></FormControl>
                  </Grid>
                  <Button leftIcon={<FaSave />} bg={T.teal} color="white" _hover={{ bg: T.tealDim }} mt={5} onClick={() => handleSave("Notifications")} isLoading={saving}>Save Notifications</Button>
                </SettingsSection>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
};

const SettingsSection = ({ title, icon, children }) => (
  <Box>
    <Flex align="center" gap={2} mb={4}>
      <Icon as={icon} color={T.teal} fontSize="18px" />
      <Text fontWeight="600" color={T.text}>{title}</Text>
    </Flex>
    <Divider borderColor={T.border} mb={5} />
    {children}
  </Box>
);

export default Settings;