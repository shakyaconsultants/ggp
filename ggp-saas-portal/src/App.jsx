import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { NutritionistProvider, useNutritionist } from "./context/NutritionistContext";
import { AdminProvider } from "./context/AdminContext";
import { FlashProvider } from "./context/FlashContext";
import FlashStack from "./components/FlashStack";
import DashboardLayout from "./layouts/DashboardLayout";
import { AdminGate } from "./layouts/AdminLayout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Clients from "./pages/dashboard/Clients";
import ClientProfile from "./pages/dashboard/ClientProfile";
import Slots from "./pages/dashboard/Slots";
import Calls from "./pages/dashboard/Calls";
import VideoCall from "./pages/dashboard/VideoCall";
import DietPlans from "./pages/dashboard/DietPlans";
import DietTemplates from "./pages/dashboard/DietTemplates";
import FoodTemplates from "./pages/dashboard/FoodTemplates";
import FoodItems from "./pages/dashboard/FoodItems";
import Exercises from "./pages/dashboard/Exercises";
import GuestRoute from "./components/GuestRoute";
import Profile from "./pages/dashboard/Profile";
import AccountBilling from "./pages/dashboard/AccountBilling";
import Billing from "./pages/Billing";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminCatalog from "./pages/admin/AdminCatalog";
import AdminClients from "./pages/admin/AdminClients";
import AdminNutritionists from "./pages/admin/AdminNutritionists";
import AdminNutritionistDetail from "./pages/admin/AdminNutritionistDetail";

function DashboardGate() {
  const { isAuthenticated, nutritionist, logout, loading, subscriptionActive } = useNutritionist();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "dashboard" }} />;
  }

  if (!subscriptionActive) {
    return <Navigate to="/billing" replace />;
  }

  return (
    <DashboardLayout
      nutritionist={nutritionist}
      onLogout={() => {
        logout();
        navigate("/login");
      }}
    />
  );
}

function BillingGate() {
  const { isAuthenticated, loading, subscriptionActive } = useNutritionist();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (subscriptionActive) {
    return <Navigate to="/dashboard/billing" replace />;
  }

  return <Billing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <FlashProvider>
        <FlashStack />
        <NutritionistProvider>
          <AdminProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/billing" element={<BillingGate />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGate />}>
              <Route index element={<AdminOverview />} />
              <Route path="nutritionists" element={<AdminNutritionists />} />
              <Route path="nutritionists/:id" element={<AdminNutritionistDetail />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="catalog" element={<AdminCatalog />} />
            </Route>
            <Route path="/dashboard" element={<DashboardGate />}>
              <Route index element={<Navigate to="clients" replace />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:clientId" element={<ClientProfile />} />
              <Route path="slots" element={<Slots />} />
              <Route path="calls" element={<Calls />} />
              <Route path="calls/:callId" element={<VideoCall />} />
              <Route path="diet-plans" element={<DietPlans />} />
              <Route path="diet-templates" element={<DietTemplates />} />
              <Route path="food-templates" element={<FoodTemplates />} />
              <Route path="food-items" element={<FoodItems />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="profile" element={<Profile />} />
              <Route path="billing" element={<AccountBilling />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </AdminProvider>
        </NutritionistProvider>
      </FlashProvider>
    </BrowserRouter>
  );
}
