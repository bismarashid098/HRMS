import { Box, Heading } from "@chakra-ui/react";
import SalarySlip from "./SalarySlip";

const Payroll = () => {
  const month = "January 2026";

  // Dummy employee (abhi frontend ke liye)
  const employee = {
    id: 1,
    name: "Bisma",
    role: "Cashier",
    baseSalary: 30000,
  };

  // Dummy attendance summary
  const attendance = {
    present: 24,
    late: 2,
    absent: 1,
  };

  return (
    <Box>
      <Heading size="lg" mb="4">
        Payroll – {month}
      </Heading>

      <SalarySlip
        employee={employee}
        attendance={attendance}
        month={month}
      />
    </Box>
  );
};

export default Payroll;
