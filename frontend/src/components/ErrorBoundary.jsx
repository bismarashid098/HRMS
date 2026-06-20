import { Component } from "react";
import { Navigate } from "react-router-dom";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { crashed: false };
    }

    static getDerivedStateFromError() {
        return { crashed: true };
    }

    componentDidCatch(error) {
        console.error("[ErrorBoundary] caught:", error);
    }

    // Reset when the route changes so re-entering a fixed page works
    componentDidUpdate(prevProps) {
        if (this.state.crashed && prevProps.routeKey !== this.props.routeKey) {
            this.setState({ crashed: false });
        }
    }

    render() {
        if (this.state.crashed) {
            return <Navigate to="/dashboard" replace />;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
