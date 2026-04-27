import BookmarkIcon from "@mui/icons-material/Bookmark";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import HubIcon from "@mui/icons-material/Hub";
import InsightsIcon from "@mui/icons-material/Insights";
import LightModeIcon from "@mui/icons-material/LightMode";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useColorMode } from "../app/colorMode";
import { useAppSelector } from "../app/hooks";
import { useSidebar } from "../app/sidebar";
import { APP_BRAND, AppRoute, PROFILE_ORIGIN_PARAM } from "../constants";
import type { Person } from "../types/person";
import { toFullName } from "../utils/person";

const NAV_WIDTH = 256;
const NAV_WIDTH_COLLAPSED = 64;
const TOPBAR_HEIGHT = 60;

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  caption?: string;
  disabled?: boolean;
};

const workspaceItems: NavItem[] = [
  { to: AppRoute.home, label: "People", icon: <PeopleAltIcon />, caption: "Stream" },
  { to: AppRoute.savedPeople, label: "Saved", icon: <BookmarkIcon />, caption: "Registry" },
];

const intelligenceItems: NavItem[] = [
  { to: AppRoute.graph, label: "Graph", icon: <HubIcon />, caption: "Network" },
  { to: "#search", label: "Deep Search", icon: <SearchIcon />, caption: "Soon", disabled: true },
  { to: "#timeline", label: "Timeline", icon: <TimelineIcon />, caption: "Soon", disabled: true },
];

const agentItems: NavItem[] = [
  { to: "#crawler", label: "Agentic Crawler", icon: <SmartToyIcon />, caption: "Soon", disabled: true },
  { to: "#schedule", label: "Scheduled Jobs", icon: <ScheduleIcon />, caption: "Soon", disabled: true },
];

type SectionProps = {
  title: string;
  items: NavItem[];
  collapsed: boolean;
};

const NavSection = ({ title, items, collapsed }: SectionProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
      {!collapsed ? (
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", px: 1.25, display: "block", mb: 0.5 }}
        >
          {title}
        </Typography>
      ) : null}
      <List disablePadding>
        {items.map((item) => {
          const button = (
            <ListItemButton
              {...(item.disabled
                ? { disabled: true }
                : { component: NavLink, to: item.to, end: item.to === AppRoute.home })}
              sx={{
                borderRadius: 1.5,
                py: 0.75,
                position: "relative",
                opacity: item.disabled ? 0.5 : 1,
                justifyContent: collapsed ? "center" : "flex-start",
                "&.active": {
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
                "&.active::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 0,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 34,
                  color: "text.secondary",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed ? (
                <>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
                  />
                  {item.caption ? (
                    <Chip
                      label={item.caption}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontFamily: "JetBrains Mono, monospace",
                        bgcolor: item.disabled
                          ? alpha(theme.palette.text.primary, 0.06)
                          : alpha(theme.palette.primary.main, 0.1),
                        color: item.disabled ? "text.secondary" : "primary.main",
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </ListItemButton>
          );

          if (item.disabled || collapsed) {
            return (
              <Tooltip
                key={item.label}
                title={item.disabled ? "Coming soon" : item.label}
                placement="right"
              >
                <Box>{button}</Box>
              </Tooltip>
            );
          }
          return <Box key={item.to}>{button}</Box>;
        })}
      </List>
    </Box>
  );
};

const Brand = ({
  textColor,
  collapsed,
}: {
  textColor: string;
  collapsed: boolean;
}): JSX.Element => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontWeight: 800,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13,
          boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.55)}`,
        }}
      >
        <InsightsIcon sx={{ fontSize: 18 }} />
      </Box>
      {!collapsed ? (
        <Box>
          <Typography
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13,
              fontWeight: 700,
              color: textColor,
              letterSpacing: "0.18em",
              lineHeight: 1.1,
            }}
          >
            {APP_BRAND.shortName}
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              color: alpha(textColor, 0.6),
              letterSpacing: "0.05em",
              lineHeight: 1.1,
            }}
          >
            {APP_BRAND.fullName}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
};

const GlobalSearch = ({ textColor }: { textColor: string }): JSX.Element => {
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const { randomPeople, savedPeople } = useAppSelector((state) => state.people);
  const enrichmentsByPerson = useAppSelector((state) => state.enrichments.byPerson);

  const inspectedIds = useMemo(
    () => new Set(Object.keys(enrichmentsByPerson).filter((id) => (enrichmentsByPerson[id] ?? []).length > 0)),
    [enrichmentsByPerson],
  );

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      return { history: [] as Person[], live: [] as Person[], inspected: [] as Person[] };
    }
    const matchPerson = (person: Person): boolean => {
      const name = toFullName(person.name).toLowerCase();
      return (
        name.includes(query) ||
        person.location.country.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query)
      );
    };
    const savedMatches = savedPeople.filter(matchPerson);
    const savedIds = new Set(savedMatches.map((p) => p.id));
    const liveMatches = randomPeople.filter(
      (p) => !savedIds.has(p.id) && matchPerson(p),
    );
    const inspectedMatches = savedMatches.filter((p) => inspectedIds.has(p.id));
    return {
      history: savedMatches.slice(0, 6),
      live: liveMatches.slice(0, 6),
      inspected: inspectedMatches.slice(0, 6),
    };
  }, [inspectedIds, randomPeople, savedPeople, value]);

  const totalCount = matches.history.length + matches.live.length + matches.inspected.length;
  const showDropdown = open && value.trim().length > 0;

  const handleSelect = (person: Person): void => {
    setOpen(false);
    setValue("");
    navigate(
      `/profile/${person.source}/${person.id}?${PROFILE_ORIGIN_PARAM}=${person.source}`,
    );
  };

  const renderRow = (person: Person, badge: ReactNode): JSX.Element => (
    <ListItemButton
      key={`${person.source}-${person.id}-${badge?.toString() ?? ""}`}
      onClick={() => handleSelect(person)}
      sx={{ py: 0.75 }}
    >
      <ListItemAvatar>
        <Avatar src={person.picture.thumbnail} sx={{ width: 32, height: 32 }} />
      </ListItemAvatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
          {toFullName(person.name)}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
          {person.location.country} · {person.email}
        </Typography>
      </Box>
      {badge}
    </ListItemButton>
  );

  const sectionHeader = (label: string, count: number): JSX.Element => (
    <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontFamily: "JetBrains Mono, monospace" }}
        >
          {count}
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative" }}>
        <Box
          ref={anchorRef}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: alpha(textColor, 0.08),
            border: `1px solid ${alpha(textColor, 0.12)}`,
            borderRadius: 1.5,
            px: 1.25,
            py: 0.5,
            width: 420,
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: alpha(textColor, 0.6) }} />
          <Typography
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: alpha(textColor, 0.6),
              borderRight: `1px solid ${alpha(textColor, 0.18)}`,
              pr: 1,
            }}
          >
            PIP
          </Typography>
          <InputBase
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search people, history, inspected…"
            sx={{
              color: textColor,
              fontSize: 13,
              flex: 1,
              "& input::placeholder": {
                color: alpha(textColor, 0.5),
                opacity: 1,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: alpha(textColor, 0.5),
              border: `1px solid ${alpha(textColor, 0.18)}`,
              borderRadius: 0.5,
              px: 0.5,
              fontSize: 10,
            }}
          >
            ⌘K
          </Typography>
        </Box>
        <Popper
          open={showDropdown}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1, width: 420, mt: 0.5 }}
        >
          <Paper
            sx={{
              boxShadow: 6,
              maxHeight: 480,
              overflow: "auto",
            }}
          >
            {totalCount === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  No matches across people, history, or inspected.
                </Typography>
              </Box>
            ) : (
              <Box>
                {matches.inspected.length > 0 ? (
                  <>
                    {sectionHeader("Inspected", matches.inspected.length)}
                    <List disablePadding>
                      {matches.inspected.map((p) =>
                        renderRow(
                          p,
                          <Chip
                            label="Inspected"
                            size="small"
                            sx={{
                              ml: 1,
                              fontSize: 10,
                              fontFamily: "JetBrains Mono, monospace",
                              height: 20,
                            }}
                            color="primary"
                            variant="outlined"
                          />,
                        ),
                      )}
                    </List>
                    <Divider />
                  </>
                ) : null}
                {matches.history.length > 0 ? (
                  <>
                    {sectionHeader("History", matches.history.length)}
                    <List disablePadding>
                      {matches.history.map((p) =>
                        renderRow(
                          p,
                          <Chip
                            label="Saved"
                            size="small"
                            sx={{
                              ml: 1,
                              fontSize: 10,
                              fontFamily: "JetBrains Mono, monospace",
                              height: 20,
                            }}
                            color="success"
                          />,
                        ),
                      )}
                    </List>
                    <Divider />
                  </>
                ) : null}
                {matches.live.length > 0 ? (
                  <>
                    {sectionHeader("People", matches.live.length)}
                    <List disablePadding>
                      {matches.live.map((p) =>
                        renderRow(
                          p,
                          <Chip
                            label="Live"
                            size="small"
                            sx={{
                              ml: 1,
                              fontSize: 10,
                              fontFamily: "JetBrains Mono, monospace",
                              height: 20,
                            }}
                            variant="outlined"
                          />,
                        ),
                      )}
                    </List>
                  </>
                ) : null}
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

const TopBar = (): JSX.Element => {
  const { mode, toggle } = useColorMode();
  const theme = useTheme();
  const { collapsed } = useSidebar();
  const navTextColor = mode === "light" ? "#0f172a" : "#e2e8f0";
  const navWidth = collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ height: TOPBAR_HEIGHT, zIndex: theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, gap: 3 }}>
        <Box sx={{ width: navWidth - 24 }}>
          <Brand textColor={navTextColor} collapsed={collapsed} />
        </Box>
        <Box sx={{ ml: "auto" }}>
          <GlobalSearch textColor={navTextColor} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip
            label="LIVE"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.18),
              color: mode === "light" ? theme.palette.success.dark : theme.palette.success.light,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              letterSpacing: "0.14em",
              border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
              "&::before": {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: theme.palette.success.main,
                display: "inline-block",
                ml: 1,
                mr: -0.25,
                boxShadow: `0 0 6px ${theme.palette.success.main}`,
              },
            }}
          />
          <Tooltip title={mode === "dark" ? "Switch to light" : "Switch to dark"}>
            <IconButton onClick={toggle} sx={{ color: navTextColor }}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 12,
              color: "#0b1120",
            }}
          >
            IS
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

const sectionLabelFor = (pathname: string): string => {
  if (pathname.startsWith("/profile/")) return "Profile";
  if (pathname.startsWith("/saved")) return "Saved";
  if (pathname.startsWith("/graph")) return "Graph";
  return "People";
};

const Sidebar = (): JSX.Element => {
  const location = useLocation();
  const { collapsed, toggle } = useSidebar();
  const sectionLabel = sectionLabelFor(location.pathname);
  const width = collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          top: TOPBAR_HEIGHT,
          height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          overflowX: "hidden",
          transition: "width 0.18s ease",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {!collapsed ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              Workspace
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>People Registry</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {sectionLabel}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 12 }} />
        )}
        <Divider />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <NavSection title="Workspaces" items={workspaceItems} collapsed={collapsed} />
          <Divider sx={{ mx: collapsed ? 1 : 2 }} />
          <NavSection title="Intelligence" items={intelligenceItems} collapsed={collapsed} />
          <Divider sx={{ mx: collapsed ? 1 : 2 }} />
          <NavSection title="Agents" items={agentItems} collapsed={collapsed} />
        </Box>
        <Divider />
        {!collapsed ? (
          <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
              >
                Source · randomuser.me
              </Typography>
              <Typography
                sx={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10,
                  color: "text.secondary",
                  opacity: 0.7,
                }}
              >
                v0.4.2 · build 4f3a
              </Typography>
            </Box>
            <Tooltip title="Collapse sidebar">
              <IconButton size="small" onClick={toggle}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
            <Tooltip title="Expand sidebar" placement="right">
              <IconButton size="small" onClick={toggle}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export const AppShell = ({ children }: { children: ReactNode }): JSX.Element => {
  const { collapsed } = useSidebar();
  const navWidth = collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH;
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <TopBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${navWidth}px`,
          mt: `${TOPBAR_HEIGHT}px`,
          minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.18s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
