import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/layout/Navbar';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ShopPage from './pages/shop/ShopPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';

// Customer protected pages
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCategories from './pages/admin/AdminCategories';


// ── AppContent lives inside BrowserRouter so useLocation works ───────────────
const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Hide the main navbar inside admin — admin has its own sidebar */}
      {!isAdmin && <Navbar />}

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />

        {/* ── Customer protected ── */}
        <Route path="/cart" element={
          <ProtectedRoute><CartPage /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
           <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
        } />

        {/* ── Admin (nested routes inside AdminLayout) ── */}
        <Route path="/admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <h1 style={{ fontSize: 48, fontWeight: 700, color: 'var(--color-text)' }}>404</h1>
            <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Page not found.</p>
          </div>
        } />
      </Routes>
    </>
  );
};

// ── App wraps everything in providers + BrowserRouter ────────────────────────
const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;