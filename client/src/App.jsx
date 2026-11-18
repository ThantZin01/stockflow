import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SalesOrdersPage } from './pages/SalesOrdersPage.jsx';
import { StockPage } from './pages/StockPage.jsx';
import { SuppliersPage } from './pages/SuppliersPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { RoleRoute } from './routes/RoleRoute.jsx';

const NotFoundPage = () => (
  <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-4xl font-bold text-slate-900">404</h1>
    <p className="mt-2 text-slate-600">Page not found.</p>
    <Link
      to="/"
      className="mt-4 inline-flex items-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-500"
    >
      Back to Dashboard
    </Link>
  </div>
);

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/sales-orders" element={<SalesOrdersPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
