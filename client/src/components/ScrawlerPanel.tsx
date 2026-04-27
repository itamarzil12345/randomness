import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import LaunchIcon from "@mui/icons-material/Launch";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  InputBase,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { savePerson } from "../features/people/peopleSlice";
import {
  ENABLED_SCRAPERS_KEY,
  GOOGLE_API_KEY,
  GOOGLE_CSE_ID_KEY,
  parseEnabledScrapers,
  updateSetting,
} from "../features/settings/settingsSlice";
import {
  buildPersonFromWikiResult,
  runWikiPersonScraper,
  SCRAPER_DEFINITIONS,
  type GitHubUser,
  type GoogleHit,
  type ScraperId,
  type WikiPersonResult,
  type WikipediaPart,
} from "../scrapers/wikiPerson";
import { Button } from "./Button";

type ScrawlerStatus =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "result"; result: WikiPersonResult }
  | { kind: "error"; message: string };

const SectionHeader = ({
  icon,
  label,
  source,
}: {
  icon: ReactNode;
  label: string;
  source: string;
}): JSX.Element => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
    <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
    <Chip
      label={source}
      size="small"
      sx={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        height: 20,
      }}
    />
  </Stack>
);

const scraperIcon = (id: ScraperId): ReactNode => {
  if (id === "wikipedia") return <PublicIcon fontSize="small" />;
  if (id === "github") return <GitHubIcon fontSize="small" />;
  if (id === "duckduckgo") return <LightbulbIcon fontSize="small" />;
  return <GoogleIcon fontSize="small" />;
};

const ScraperToggleRow = ({
  enabled,
  onToggle,
  configOpen,
  onToggleConfig,
}: {
  enabled: ScraperId[];
  onToggle: (id: ScraperId, next: boolean) => void;
  configOpen: boolean;
  onToggleConfig: () => void;
}): JSX.Element => {
  const theme = useTheme();
  const set = new Set(enabled);
  return (
    <Paper sx={{ p: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", mr: 0.5 }}
        >
          Sources
        </Typography>
        {SCRAPER_DEFINITIONS.map((def) => {
          const checked = set.has(def.id);
          return (
            <Box
              key={def.id}
              onClick={() => onToggle(def.id, !checked)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1,
                py: 0.5,
                borderRadius: 1.5,
                cursor: "pointer",
                border: `1px solid ${checked ? alpha(theme.palette.primary.main, 0.45) : theme.palette.divider}`,
                bgcolor: checked ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                color: checked ? "primary.main" : "text.secondary",
                "&:hover": { borderColor: theme.palette.primary.main },
              }}
            >
              <Checkbox
                size="small"
                checked={checked}
                onChange={(e) => onToggle(def.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                sx={{ p: 0 }}
              />
              {scraperIcon(def.id)}
              <Box>
                <Typography
                  sx={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    lineHeight: 1.1,
                  }}
                >
                  {def.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 9,
                    color: "text.secondary",
                    lineHeight: 1.2,
                  }}
                >
                  {def.source}
                  {def.requiresKey ? " · key required" : ""}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <Tooltip title="Configure source keys">
          <IconButton size="small" onClick={onToggleConfig} sx={{ ml: "auto" }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Collapse in={configOpen}>
        <Divider sx={{ my: 1.5 }} />
        <GoogleConfigForm />
      </Collapse>
    </Paper>
  );
};

const GoogleConfigForm = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);
  const [apiKey, setApiKey] = useState(settings.byKey[GOOGLE_API_KEY] ?? "");
  const [cseId, setCseId] = useState(settings.byKey[GOOGLE_CSE_ID_KEY] ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await Promise.all([
        dispatch(updateSetting({ key: GOOGLE_API_KEY, value: apiKey })).unwrap(),
        dispatch(updateSetting({ key: GOOGLE_CSE_ID_KEY, value: cseId })).unwrap(),
      ]);
      toast.success("Google credentials saved.");
    } catch {
      toast.error("Failed to save credentials.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <GoogleIcon fontSize="small" />
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Google Custom Search
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        sx={{ display: "block", color: "text.secondary", mb: 1 }}
      >
        Get a free API key from console.cloud.google.com and a Programmable Search Engine ID
        from programmablesearchengine.google.com. Stored locally in the registry.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { sm: "center" } }}
      >
        <TextField
          size="small"
          label="API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          fullWidth
          slotProps={{ input: { sx: { fontFamily: "JetBrains Mono, monospace", fontSize: 12 } } }}
        />
        <TextField
          size="small"
          label="CSE ID"
          value={cseId}
          onChange={(e) => setCseId(e.target.value)}
          fullWidth
          slotProps={{ input: { sx: { fontFamily: "JetBrains Mono, monospace", fontSize: 12 } } }}
        />
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </Stack>
    </Box>
  );
};

const WikipediaSection = ({ wikipedia }: { wikipedia: WikipediaPart }): JSX.Element => (
  <Paper sx={{ p: 2.5 }}>
    <SectionHeader
      icon={<PublicIcon fontSize="small" />}
      label="Wikipedia + Wikidata"
      source="en.wikipedia.org"
    />
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      {wikipedia.thumbnail ? (
        <Avatar src={wikipedia.thumbnail} variant="rounded" sx={{ width: 88, height: 88 }} />
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{wikipedia.title}</Typography>
        {wikipedia.description ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {wikipedia.description}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.75, mt: 1 }}>
          {wikipedia.gender ? (
            <Chip label={`gender · ${wikipedia.gender}`} size="small" sx={{ fontFamily: "JetBrains Mono, monospace" }} />
          ) : null}
          {wikipedia.birthDate ? (
            <Chip label={`born · ${wikipedia.birthDate}`} size="small" sx={{ fontFamily: "JetBrains Mono, monospace" }} />
          ) : null}
          {wikipedia.birthPlace ? (
            <Chip label={`birthplace · ${wikipedia.birthPlace}`} size="small" sx={{ fontFamily: "JetBrains Mono, monospace" }} />
          ) : null}
          {wikipedia.nationality.map((n) => (
            <Chip key={n} label={`nationality · ${n}`} size="small" sx={{ fontFamily: "JetBrains Mono, monospace" }} />
          ))}
          {wikipedia.wikidataId ? (
            <Chip label={`wikidata · ${wikipedia.wikidataId}`} size="small" variant="outlined" sx={{ fontFamily: "JetBrains Mono, monospace" }} />
          ) : null}
        </Stack>
      </Box>
      {wikipedia.pageUrl ? (
        <Button
          variant="secondary"
          startIcon={<LaunchIcon />}
          onClick={() => window.open(wikipedia.pageUrl!, "_blank", "noopener,noreferrer")}
        >
          Wikipedia
        </Button>
      ) : null}
    </Stack>
    {wikipedia.occupation.length > 0 ? (
      <Box sx={{ mt: 2 }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Occupation
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.75, mt: 0.5 }}>
          {wikipedia.occupation.map((o) => (
            <Chip key={o} label={o} size="small" variant="outlined" />
          ))}
        </Stack>
      </Box>
    ) : null}
    {wikipedia.extract ? (
      <>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>{wikipedia.extract}</Typography>
      </>
    ) : null}
  </Paper>
);

const GithubSection = ({ users }: { users: GitHubUser[] }): JSX.Element => (
  <Paper sx={{ p: 2.5 }}>
    <SectionHeader
      icon={<GitHubIcon fontSize="small" />}
      label="GitHub matches"
      source={`api.github.com · ${users.length}`}
    />
    <Stack divider={<Divider />} spacing={1.5}>
      {users.map((user) => (
        <Stack key={user.login} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar src={user.avatarUrl} sx={{ width: 44, height: 44 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {user.name ?? user.login}
              </Typography>
              <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "text.secondary" }}>
                @{user.login}
              </Typography>
            </Stack>
            {user.bio ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user.bio}
              </Typography>
            ) : null}
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5, mt: 0.5 }}>
              {user.location ? (
                <Chip label={user.location} size="small" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }} />
              ) : null}
              {user.company ? (
                <Chip label={user.company} size="small" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }} />
              ) : null}
              {user.publicRepos != null ? (
                <Chip label={`${user.publicRepos} repos`} size="small" variant="outlined" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }} />
              ) : null}
              {user.followers != null ? (
                <Chip label={`${user.followers} followers`} size="small" variant="outlined" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }} />
              ) : null}
            </Stack>
          </Box>
          <Button
            variant="secondary"
            startIcon={<LaunchIcon />}
            onClick={() => window.open(user.htmlUrl, "_blank", "noopener,noreferrer")}
          >
            GitHub
          </Button>
        </Stack>
      ))}
    </Stack>
  </Paper>
);

const DuckSection = ({
  hit,
}: {
  hit: { abstract: string; abstractSource: string | null; abstractUrl: string | null };
}): JSX.Element => (
  <Paper sx={{ p: 2.5 }}>
    <SectionHeader
      icon={<LightbulbIcon fontSize="small" />}
      label="Web abstract"
      source={`duckduckgo · ${hit.abstractSource ?? "open"}`}
    />
    <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>{hit.abstract}</Typography>
    {hit.abstractUrl ? (
      <Box sx={{ mt: 1.5 }}>
        <Button
          variant="secondary"
          startIcon={<LaunchIcon />}
          onClick={() => window.open(hit.abstractUrl!, "_blank", "noopener,noreferrer")}
        >
          Open source
        </Button>
      </Box>
    ) : null}
  </Paper>
);

const GoogleSection = ({ hits }: { hits: GoogleHit[] }): JSX.Element => (
  <Paper sx={{ p: 2.5 }}>
    <SectionHeader
      icon={<GoogleIcon fontSize="small" />}
      label="Google results"
      source={`customsearch · ${hits.length}`}
    />
    <Stack divider={<Divider />} spacing={1.5}>
      {hits.map((hit) => (
        <Stack key={hit.link} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {hit.thumbnail ? (
            <Avatar src={hit.thumbnail} variant="rounded" sx={{ width: 48, height: 48 }} />
          ) : (
            <Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
              <GoogleIcon fontSize="small" />
            </Avatar>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
              {hit.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                color: "text.secondary",
              }}
              noWrap
            >
              {hit.displayLink}
            </Typography>
            {hit.snippet ? (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                {hit.snippet}
              </Typography>
            ) : null}
          </Box>
          <Button
            variant="secondary"
            startIcon={<LaunchIcon />}
            onClick={() => window.open(hit.link, "_blank", "noopener,noreferrer")}
          >
            Open
          </Button>
        </Stack>
      ))}
    </Stack>
  </Paper>
);

const SubjectHeader = ({
  result,
  onSave,
  saving,
  alreadySaved,
}: {
  result: WikiPersonResult;
  onSave: () => void;
  saving: boolean;
  alreadySaved: boolean;
}): JSX.Element => {
  const theme = useTheme();
  const wiki = result.wikipedia;
  const headGithub = result.github[0] ?? null;
  const headGoogle = result.google?.[0] ?? null;
  const title =
    wiki?.title ?? headGithub?.name ?? headGithub?.login ?? headGoogle?.title ?? result.query;
  const subtitle =
    wiki?.description ??
    headGithub?.bio ??
    headGoogle?.snippet ??
    (result.duckDuckGo?.abstract ? "Public web mention found" : "Open-source signals only");
  const picture = wiki?.thumbnail ?? headGithub?.avatarUrl ?? headGoogle?.thumbnail ?? null;

  return (
    <Paper
      sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, transparent 70%)`,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Avatar
          src={picture ?? undefined}
          sx={{
            width: 64,
            height: 64,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 14px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        >
          {title.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: "primary.main" }}>
            Subject
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {subtitle}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.75 }}>
            <Chip
              label={`wikipedia · ${wiki ? "match" : "miss"}`}
              size="small"
              color={wiki ? "primary" : "default"}
              variant={wiki ? "filled" : "outlined"}
              sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
            />
            <Chip
              label={`github · ${result.github.length}`}
              size="small"
              color={result.github.length > 0 ? "primary" : "default"}
              variant={result.github.length > 0 ? "filled" : "outlined"}
              sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
            />
            <Chip
              label={`duckduckgo · ${result.duckDuckGo ? "hit" : "miss"}`}
              size="small"
              color={result.duckDuckGo ? "primary" : "default"}
              variant={result.duckDuckGo ? "filled" : "outlined"}
              sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
            />
            <Chip
              label={`google · ${result.google ? result.google.length : "off"}`}
              size="small"
              color={result.google && result.google.length > 0 ? "primary" : "default"}
              variant={result.google && result.google.length > 0 ? "filled" : "outlined"}
              sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
            />
          </Stack>
        </Box>
        <Button startIcon={<BookmarkAddIcon />} onClick={onSave} disabled={saving || alreadySaved}>
          {alreadySaved ? "Saved" : saving ? "Saving…" : "Save dossier"}
        </Button>
      </Stack>
    </Paper>
  );
};

export const ScrawlerPanel = (): JSX.Element => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);
  const { savedPeople, loading } = useAppSelector((state) => state.people);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ScrawlerStatus>({ kind: "idle" });
  const [configOpen, setConfigOpen] = useState(false);

  const enabled = useMemo<ScraperId[]>(() => {
    const parsed = parseEnabledScrapers(settings.byKey[ENABLED_SCRAPERS_KEY]);
    return parsed.filter((p): p is ScraperId =>
      ["wikipedia", "github", "duckduckgo", "google"].includes(p),
    );
  }, [settings.byKey]);

  const handleToggle = (id: ScraperId, next: boolean): void => {
    const set = new Set(enabled);
    if (next) set.add(id);
    else set.delete(id);
    void dispatch(
      updateSetting({
        key: ENABLED_SCRAPERS_KEY,
        value: JSON.stringify(Array.from(set)),
      }),
    );
  };

  const run = async (): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setStatus({ kind: "running" });
    try {
      const result = await runWikiPersonScraper(trimmed, {
        enabled,
        googleApiKey: settings.byKey[GOOGLE_API_KEY],
        googleCseId: settings.byKey[GOOGLE_CSE_ID_KEY],
      });
      setStatus({ kind: "result", result });
    } catch (error) {
      setStatus({ kind: "error", message: (error as Error).message });
    }
  };

  const handleSave = async (): Promise<void> => {
    if (status.kind !== "result") return;
    const person = buildPersonFromWikiResult(status.result);
    try {
      await dispatch(savePerson(person)).unwrap();
      toast.success(`${person.name.first} ${person.name.last} saved as dossier.`);
    } catch {
      toast.error("Failed to save dossier.");
    }
  };

  const builtPerson =
    status.kind === "result" ? buildPersonFromWikiResult(status.result) : null;
  const alreadySaved = builtPerson
    ? savedPeople.some((p) => p.id === builtPerson.id)
    : false;

  return (
    <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
      <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        <TravelExploreIcon sx={{ color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Scrawler · multi-source
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
            Query any name. Toggle which sources to query, configure credentials, then save the
            best-matching subject as a dossier.
          </Typography>
        </Box>
      </Paper>

      <ScraperToggleRow
        enabled={enabled}
        onToggle={handleToggle}
        configOpen={configOpen}
        onToggleConfig={() => setConfigOpen((v) => !v)}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: 1.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <InputBase
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void run();
          }}
          placeholder="Enter any name — public figure or otherwise"
          sx={{ flex: 1, fontSize: 14 }}
          autoFocus
        />
        <Button
          onClick={() => void run()}
          disabled={status.kind === "running" || query.trim().length === 0 || enabled.length === 0}
          startIcon={
            status.kind === "running" ? <CircularProgress size={16} /> : <TravelExploreIcon />
          }
        >
          {status.kind === "running" ? "Scrawling…" : "Run scrawler"}
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {status.kind === "idle" ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <TravelExploreIcon sx={{ color: "text.secondary", fontSize: 40, mb: 1 }} />
            <Typography variant="h2" sx={{ fontSize: 18, mb: 1 }}>
              Search any person
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {enabled.length === 0
                ? "Enable at least one source above to begin."
                : `Enabled sources: ${enabled.join(", ")}`}
            </Typography>
          </Paper>
        ) : null}
        {status.kind === "error" ? (
          <Paper sx={{ p: 3, borderColor: "error.main" }}>
            <Typography variant="overline" sx={{ color: "error.main" }}>
              Scrawler failed
            </Typography>
            <Typography sx={{ mt: 0.5 }}>{status.message}</Typography>
          </Paper>
        ) : null}
        {status.kind === "result" ? (
          <Stack spacing={2}>
            <SubjectHeader
              result={status.result}
              onSave={() => void handleSave()}
              saving={loading.mutation}
              alreadySaved={alreadySaved}
            />
            {status.result.wikipedia ? (
              <WikipediaSection wikipedia={status.result.wikipedia} />
            ) : null}
            {status.result.github.length > 0 ? (
              <GithubSection users={status.result.github} />
            ) : null}
            {status.result.duckDuckGo ? (
              <DuckSection hit={status.result.duckDuckGo} />
            ) : null}
            {status.result.google && status.result.google.length > 0 ? (
              <GoogleSection hits={status.result.google} />
            ) : null}
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
};
