const TopNavbar = () => {
    const handleLogout = () => {
        alert("Logged out successfully");
        window.location.href = "/"; // login page
    };

    return (
        <div className="top-navbar">
            <h2 className="page-title">Dashboard</h2>

            <div className="navbar-right">
                <span className="profile-name">Admin</span>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default TopNavbar;
