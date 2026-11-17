import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { StockPage } from './pages/StockPage.jsx';
import { SuppliersPage } from './pages/SuppliersPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { RoleRoute } from './routes/RoleRoute.jsx';

const ComingSoonPage = ({ title, phase }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
    <h1 className="text-xl font-bold text-slate-900">{title}</h1>
    <p className="mt-2 text-sm text-slate-600">
      This module will be built in <span className="font-medium">{phase}</span>.
    </p>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-4xl font-bold text-slate-900">404</h1>
    <p className="mt-2 text-slate-600">Page not found.</p>
    <Link
      to="/"
      className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
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
        <Route
          path="/sales-orders"
          element={<ComingSoonPage title="Sales Orders" phase="Phase 6" />}
        />
        <Route path="/reports" element={<ComingSoonPage title="Reports" phase="Phase 7" />} />

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
