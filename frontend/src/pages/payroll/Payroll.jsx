import { useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Badge,
  Select,
  HStack,
} from "@chakra-ui/react";

import * as XLSX from "xlsx";

import {
  getEmployees,
  addAdvance,
} from "../employees/employeeData";

const LATE_FINE = 500;

const Payroll = () => {
  const [month, setMonth] = useState("2026-01");
  const [employees, setEmployees] = useState(getEmployees());
  const [locked, setLocked] = useState(false);

  const getLateDeduction = (emp) =>
    (emp.attendance?.late || 0) * LATE_FINE;

  const getFinalSalary = (emp) =>
    emp.salary - (emp.advance || 0) - getLateDeduction(emp);

  const recalculatePayroll = () => {
    setEmployees([...employees]);
    setLocked(false);
  };

  const finalizePayroll = () => {
    setLocked(true);
    alert(`Payroll finalized for ${month}`);
  };

  const exportExcel = () => {
    const data = employees.map((emp) => ({
      Employee: emp.name,
      Salary: emp.salary,
      Advance: emp.advance,
      LateDeduction: getLateDeduction(emp),
      FinalSalary: getFinalSalary(emp),
      Status: locked ? "FINALIZED" : "DRAFT",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
    XLSX.writeFile(workbook, `Payroll-${month}.xlsx`);
  };

  return (
    <Box>
      <Heading mb="6">Payroll – Monthly Salary</Heading>

      <HStack mb="5" spacing={4}>
        <Select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="2026-01">January 2026</option>
          <option value="2026-02">February 2026</option>
        </Select>

        <Button colorScheme="blue" onClick={recalculatePayroll}>
          Recalculate Payroll
        </Button>

        <Button colorScheme="green" onClick={finalizePayroll}>
          Finalize Payroll
        </Button>

        <Button colorScheme="purple" onClick={exportExcel}>
          Export Excel
        </Button>
      </HStack>

      <Table>
        <Thead>
          <Tr>
            <Th>Employee</Th>
            <Th>Salary</Th>
            <Th>Late Days</Th>
            <Th>Advance (Limit)</Th>
            <Th>Final Salary</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>

        <Tbody>
          {employees.map((emp) => (
            <Tr key={emp.id}>
              <Td>{emp.name}</Td>
              <Td>Rs {emp.salary}</Td>
              <Td>{emp.attendance?.late || 0}</Td>

              <Td>
                <Input
                  type="number"
                  value={emp.advance}
                  isDisabled={locked}
                  onBlur={(e) => {
                    const amount = Number(e.target.value);
                    const res = addAdvance({
                      empId: emp.id,
                      month,
                      amount,
                      reason: "Salary Advance",
                    });

                    if (!res.success) {
                      alert(res.message);
                      e.target.value = emp.advance;
                    }

                    setEmployees([...employees]);
                  }}
                />
                <small>
                  Limit: Rs {emp.advanceLimit}
                </small>
              </Td>

              <Td fontWeight="bold">
                Rs {getFinalSalary(emp)}
              </Td>

              <Td>
                <Badge colorScheme={locked ? "green" : "yellow"}>
                  {locked ? "FINALIZED" : "DRAFT"}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Payroll;
