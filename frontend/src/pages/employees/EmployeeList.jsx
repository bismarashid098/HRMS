const EmployeeList = ({ employees }) => {
    if (employees.length === 0) {
        return <p style={{ marginTop: "12px" }}>No employees added yet.</p>;
    }

    return (
        <table className="employee-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
            </thead>

            <tbody>
                {employees.map((emp) => (
                    <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.role}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default EmployeeList;
