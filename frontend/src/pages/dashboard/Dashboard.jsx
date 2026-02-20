import Sidebar from "../../components/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import "../../style/dashboard.css";

const Dashboard = () => {
    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <TopNavbar />

                <div className="dashboard-content">
                    <div className="dashboard-cards">
                        <div className="card">
                            <h4>Employees</h4>
                            <h2>42</h2>
                        </div>

                        <div className="card">
                            <h4>Attendance Today</h4>
                            <h2>38</h2>
                        </div>

                        <div className="card">
                            <h4>Pending Leaves</h4>
                            <h2>5</h2>
                        </div>

                        <div className="card">
                            <h4>Monthly Payroll</h4>
                            <h2>$120,000</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
