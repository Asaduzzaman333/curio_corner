import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import "./styles.css";

const Login = lazy(() => import("./pages/Login.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const Categories = lazy(() => import("./pages/Categories.jsx"));
const Orders = lazy(() => import("./pages/Orders.jsx"));
const Content = lazy(() => import("./pages/Content.jsx"));

function AdminRoot() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AdminLayout /> : <Login />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Suspense fallback={<div className="p-8">Loading admin...</div>}>
          <Routes>
            <Route path="/" element={<AdminRoot />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="content" element={<Content />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  </React.StrictMode>
);
