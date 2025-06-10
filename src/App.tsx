import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import MapPage from "./pages/map";

export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route
          path="/map"
          element={
            <Layout>
              <MapPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
      </Routes>
    
  );
}
