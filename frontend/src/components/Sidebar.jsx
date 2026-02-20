import { NavLink } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUsers,
    FaClock,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaFileAlt,
    FaCog,
} from "react-icons/fa";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2 className="sidebar-title">WorkSphere</h2>

            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/dashboard" className="sidebar-link">
                        <FaTachometerAlt className="icon" />
                        Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/employees" className="sidebar-link">
                        <FaUsers className="icon" />
                        Employees
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/attendance" className="sidebar-link">
                        <FaClock className="icon" />
                        Attendance
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/leaves" className="sidebar-link">
                        <FaCalendarAlt className="icon" />
                        Leaves
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/payroll" className="sidebar-link">
                        <FaMoneyBillWave className="icon" />
                        Payroll
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/reports" className="sidebar-link">
                        <FaFileAlt className="icon" />
                        Reports
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/settings" className="sidebar-link">
                        <FaCog className="icon" />
                        Settings
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
