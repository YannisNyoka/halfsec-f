import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/layout/Navbar';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Footer from './components/layout/Footer';
import PageErrorBoundary from './components/common/PageErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import ScrollProgressBar from './components/common/ScrollProgressBar';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ShopPage from './pages/shop/ShopPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import ReturnsPage from './pages/legal/ReturnsPage';
import NotFoundPage from './pages/NotFoundPage';


// Customer protected pages
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import WishlistPage from './pages/wishlist/WishlistPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStock from './pages/admin/AdminStock';
import AdminCoupons from './pages/admin/AdminCoupons';
import { WishlistProvider } from './context/WishlistContext.jsx';


// ── AppContent lives inside BrowserRouter so useLocation works ───────────────
const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {/* Hide the main navbar inside admin — admin has its own sidebar */}
      {!isAdmin && <ScrollProgressBar />}
      {!isAdmin && <Navbar />}

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/returns" element={<ReturnsPage />} />

        {/* ── Customer protected ── */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <CartPage />
            </PageErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <CheckoutPage />
            </PageErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <OrdersPage />
            </PageErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
           <ProtectedRoute>
             <PageErrorBoundary>
               <ProfilePage />
             </PageErrorBoundary>
           </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <OrderDetailPage />
            </PageErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <WishlistPage />
            </PageErrorBoundary>
          </ProtectedRoute>
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
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={
          <NotFoundPage />
        } />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </>
  );
};

// ── App wraps everything in providers + BrowserRouter ────────────────────────
const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;