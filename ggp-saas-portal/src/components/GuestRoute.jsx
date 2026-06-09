import { Navigate } from "react-router-dom";
import { useNutritionist } from "../context/NutritionistContext";

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useNutritionist();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
