import { Box, SimpleGrid, Stat, StatLabel, StatNumber, Spinner, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        employees: 0,
        attendance: 0,
        leaves: 0,
        payroll: 0,
    });

    useEffect(() => {
        // TEMP: simulate API call
        const timer = setTimeout(() => {
            setStats({
                employees: 42,
                attendance: 38,
                leaves: 5,
                payroll: 120000,
            });
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Center minH="60vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6">
                <StatCard label="Employees" value={stats.employees} />
                <StatCard label="Attendance Today" value={stats.attendance} />
                <StatCard label="Pending Leaves" value={stats.leaves} />
                <StatCard label="Monthly Payroll" value={`$${stats.payroll}`} />
            </SimpleGrid>
        </Box>
    );
};

const StatCard = ({ label, value }) => (
    <Stat
        p="5"
        bg="white"
        borderRadius="md"
        boxShadow="sm"
    >
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value}</StatNumber>
    </Stat>
);

export default Dashboard;
