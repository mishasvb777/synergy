import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { locale } from '../locale';
import type { RoleCode } from '../types';

const t = locale.appShell;
const SIDEBAR_WIDTH = 268;

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  minRole?: RoleCode;
  expandable?: boolean;
  match?: 'exact' | 'prefix';
};

const rank: Record<RoleCode, number> = { user: 1, moderator: 2, admin: 3 };

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user)!;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearch(searchParams.get('q') || '');
    }
  }, [location.pathname, searchParams]);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: t.nav.news, path: '/', icon: <ArticleOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.events, path: '/events', icon: <EventOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.activity, path: '/activity', icon: <MonitorHeartOutlinedIcon fontSize="small" />, match: 'prefix' },
      { label: t.nav.knowledge, path: '/knowledge', icon: <MenuBookOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.org, path: '/org', icon: <AccountTreeOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.academy, path: '/academy', icon: <SchoolOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.communities, path: '/communities', icon: <GroupsOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.benefits, path: '/benefits', icon: <CardGiftcardOutlinedIcon fontSize="small" />, match: 'exact' },
      {
        label: t.nav.services,
        path: '/operations',
        icon: <TravelExploreOutlinedIcon fontSize="small" />,
        expandable: true,
        match: 'exact',
      },
      { label: t.nav.hr, path: '/operations/hr', icon: <BadgeOutlinedIcon fontSize="small" />, match: 'exact' },
      { label: t.nav.it, path: '/operations/it', icon: <SupportAgentOutlinedIcon fontSize="small" />, match: 'exact' },
      {
        label: t.nav.newsManage,
        path: '/news/manage',
        icon: <EditNoteOutlinedIcon fontSize="small" />,
        minRole: 'moderator',
        match: 'prefix',
      },
      {
        label: t.nav.admin,
        path: '/admin/users',
        icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
        minRole: 'admin',
        match: 'prefix',
      },
      {
        label: t.nav.workspace,
        path: '/workspace',
        icon: <LaptopMacOutlinedIcon fontSize="small" />,
        expandable: true,
        match: 'exact',
      },
    ],
    []
  );

  const visibleNav = navItems.filter(
    (item) => !item.minRole || rank[user.role] >= rank[item.minRole]
  );

  function onLogout() {
    dispatch(logout());
    navigate('/login');
  }

  function isActive(item: NavItem) {
    const mode = item.match ?? 'exact';
    if (mode === 'exact') return location.pathname === item.path;
    if (item.path === '/') return location.pathname === '/';
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  }

  function runSearch(value?: string) {
    const q = (value ?? search).trim();
    if (!q) {
      navigate('/search');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  const sidebar = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 2, py: 2.25 }}>
        <AppsOutlinedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '6px',
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            +
          </Box>
          <Typography fontWeight={800} letterSpacing="-0.03em">
            {t.brand}
          </Typography>
        </Stack>
      </Stack>

      <List sx={{ flex: 1, px: 1, py: 0.5, overflowY: 'auto' }}>
        {visibleNav.map((item) => {
          const active = isActive(item);
          return (
            <ListItemButton
              key={`${item.label}-${item.path}`}
              component={RouterLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2.5,
                mb: 0.35,
                py: 1.1,
                px: 1.25,
                color: active ? 'primary.main' : 'text.primary',
                bgcolor: active ? 'primary.light' : 'transparent',
                borderLeft: active ? '3px solid' : '3px solid transparent',
                borderColor: active ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: active ? 'primary.light' : 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 550 }}
              />
              {item.expandable && <ChevronRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          component={RouterLink}
          to="/support"
          onClick={() => setMobileOpen(false)}
          sx={{ mb: 1.25, borderRadius: 3 }}
        >
          {t.support}
        </Button>
        <Button fullWidth variant="outlined" onClick={onLogout}>
          {t.logout}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
          {sidebar}
        </Box>
      )}

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' },
        }}
      >
        {sidebar}
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 8,
            bgcolor: 'rgba(243,246,244,0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: { xs: 1.5, md: 3 },
            py: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder={t.searchPlaceholder}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', cursor: 'pointer' }} onClick={() => runSearch()} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 720,
                mx: 'auto',
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 999,
                  height: 44,
                },
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 'fit-content' }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                  {user.fullName}
                </Typography>
                <Typography variant="caption">{user.roleName}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontWeight: 700 }}>
                {user.fullName.slice(0, 1)}
              </Avatar>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
