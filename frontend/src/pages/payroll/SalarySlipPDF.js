import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateSalarySlipPDF = (employees, month) => {
    const doc = new jsPDF();

    employees.forEach((emp, index) => {
        if (index !== 0) doc.addPage();

        const finalSalary =
            emp.salary -
            (emp.advance || 0) -
            ((emp.attendance?.late || 0) * 500);

        doc.setFontSize(16);
        doc.text("SALARY SLIP", 105, 15, { align: "center" });

        doc.setFontSize(11);
        doc.text(`Month: ${month}`, 14, 30);

        doc.autoTable({
            startY: 40,
            theme: "grid",
            body: [
                ["Employee Name", emp.name],
                ["Basic Salary", `Rs ${emp.salary}`],
                ["Late Days", emp.attendance?.late || 0],
                ["Late Deduction", `Rs ${(emp.attendance?.late || 0) * 500}`],
                ["Advance", `Rs ${emp.advance || 0}`],
                ["Final Salary", `Rs ${finalSalary}`],
                ["Status", "PAYABLE"],
            ],
        });

        doc.text(
            "This is a system generated salary slip.",
            14,
            doc.lastAutoTable.finalY + 15
        );
    });

    doc.save(`Salary-Slips-${month}.pdf`);
};
