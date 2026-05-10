import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext.jsx";
import { SiteProvider } from "./context/SiteContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./styles.css";

const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SiteProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<div className="min-h-screen bg-paper p-8 text-ink">Loading collection...</div>}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" />
        </CartProvider>
      </SiteProvider>
    </ThemeProvider>
  </React.StrictMode>
);
