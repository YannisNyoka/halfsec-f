import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import PageErrorBoundary from './components/common/PageErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import ScrollProgressBar from './components/common/ScrollProgressBar';
import CompareBar from './components/common/CompareBar';
import PushPermissionPrompt from './components/common/PushPermissionPrompt';
import InstallPrompt from './components/common/InstallPrompt';

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
import ComparePage from './pages/compare/ComparePage';

// Customer protected pages
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OfferCheckoutPage from './pages/offers/OfferCheckoutPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import WishlistPage from './pages/wishlist/WishlistPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import WatchlistPage from './pages/profile/WatchlistPage';

// Seller pages
import BecomeSellerPage from './pages/seller/BecomeSellerPage';
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerProductForm from './pages/seller/SellerProductForm';
import SellerOrders from './pages/seller/SellerOrders';
import SellerProfile from './pages/seller/SellerProfile';
import SellerStorefrontPage from './pages/seller/SellerStorefrontPage';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerOffers from './pages/seller/SellerOffers';

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
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminPayoutDetail from './pages/admin/AdminPayoutDetail';
import AdminModeration from './pages/admin/AdminModeration';
import AdminSellers from './pages/admin/AdminSellers';

// ── AppContent lives inside BrowserRouter so router hooks work ───────────────
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  // Handle navigation when a push notification is clicked
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event) => {
      if (event.data?.type === 'NAVIGATE' && event.data?.url) {
        navigate(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [navigate]);

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
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/seller-profile/:sellerId" element={<SellerStorefrontPage />} />

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
        <Route path="/offers/:id/checkout" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <OfferCheckoutPage />
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
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <OrderDetailPage />
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
        <Route path="/notifications" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <NotificationsPage />
            </PageErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/watchlist" element={
          <ProtectedRoute>
            <PageErrorBoundary>
              <WatchlistPage />
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

        {/* ── Seller (nested routes inside SellerLayout) ── */}
        <Route path="/sell" element={
          <ProtectedRoute><BecomeSellerPage /></ProtectedRoute>
        } />
        <Route path="/seller" element={
          <ProtectedRoute><SellerLayout /></ProtectedRoute>
        }>
          <Route index element={<SellerDashboard />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<SellerProductForm />} />
          <Route path="products/edit/:id" element={<SellerProductForm />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="offers" element={<SellerOffers />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>

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
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="payouts/:sellerId" element={<AdminPayoutDetail />} />
          <Route path="moderation" element={<AdminModeration />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isAdmin && <Footer />}
      {!isAdmin && <CompareBar />}
      {!isAdmin && <BackToTop />}

      {/* PWA prompts — render on all non-admin pages */}
      {!isAdmin && <InstallPrompt />}
      {!isAdmin && <PushPermissionPrompt />}
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
            <CompareProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;