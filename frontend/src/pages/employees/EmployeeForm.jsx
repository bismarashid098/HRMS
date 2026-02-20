import { useState } from "react";

const EmployeeForm = ({ onAdd }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !email || !role) return;

        onAdd({
            id: Date.now(),
            name,
            email,
            role,
        });

        setName("");
        setEmail("");
        setRole("");
    };

    return (
        <form className="employee-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Employee Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="text"
                placeholder="Role / Designation"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            />

            <button type="submit">Add Employee</button>
        </form>
    );
};

export default EmployeeForm;
