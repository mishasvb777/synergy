import { CircularProgress, Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { useAppSelector } from './store';
import type { RoleCode } from './types';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import FeedPage from './pages/FeedPage';
import NewsDetailPage from './pages/NewsDetailPage';
import OperationsPage from './pages/OperationsPage';
import HrServicesPage from './pages/HrServicesPage';
import ItSupportPage from './pages/ItSupportPage';
import NewsManagePage from './pages/NewsManagePage';
import AdminUsersPage from './pages/AdminUsersPage';
import ForbiddenPage from './pages/ForbiddenPage';
import EventsPage from './pages/EventsPage';
import ActivityPage from './pages/ActivityPage';
import ActivityPostPage from './pages/ActivityPostPage';
import KnowledgePage from './pages/KnowledgePage';
import OrgPage from './pages/OrgPage';
import AcademyPage from './pages/AcademyPage';
import CommunitiesPage from './pages/CommunitiesPage';
import BenefitsPage from './pages/BenefitsPage';
import WorkspacePage from './pages/WorkspacePage';
import SupportPage from './pages/SupportPage';
import SearchPage from './pages/SearchPage';

const rank: Record<RoleCode, number> = { user: 1, moderator: 2, admin: 3 };

function PrivateRoute({
  children,
  minRole,
}: {
  children: React.ReactNode;
  minRole?: RoleCode;
}) {
  const { user, bootstrapped } = useAppSelector((s) => s.auth);
  if (!bootstrapped) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (minRole && (rank[user.role] || 0) < (rank[minRole] || 99)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  useAuthBootstrap();
  const { user, bootstrapped } = useAppSelector((s) => s.auth);

  if (!bootstrapped) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
      <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
      <Route path="/activity" element={<PrivateRoute><ActivityPage /></PrivateRoute>} />
      <Route path="/activity/:id" element={<PrivateRoute><ActivityPostPage /></PrivateRoute>} />
      <Route path="/knowledge" element={<PrivateRoute><KnowledgePage /></PrivateRoute>} />
      <Route path="/org" element={<PrivateRoute><OrgPage /></PrivateRoute>} />
      <Route path="/academy" element={<PrivateRoute><AcademyPage /></PrivateRoute>} />
      <Route path="/communities" element={<PrivateRoute><CommunitiesPage /></PrivateRoute>} />
      <Route path="/benefits" element={<PrivateRoute><BenefitsPage /></PrivateRoute>} />
      <Route path="/workspace" element={<PrivateRoute><WorkspacePage /></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
      <Route path="/news/:id" element={<PrivateRoute><NewsDetailPage /></PrivateRoute>} />
      <Route path="/operations" element={<PrivateRoute><OperationsPage /></PrivateRoute>} />
      <Route path="/operations/hr" element={<PrivateRoute><HrServicesPage /></PrivateRoute>} />
      <Route path="/operations/it" element={<PrivateRoute><ItSupportPage /></PrivateRoute>} />
      <Route
        path="/news/manage"
        element={
          <PrivateRoute minRole="moderator">
            <NewsManagePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute minRole="admin">
            <AdminUsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/forbidden"
        element={
          <PrivateRoute>
            <ForbiddenPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
