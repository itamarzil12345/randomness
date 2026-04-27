import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  InputBase,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { savePerson } from "../features/people/peopleSlice";
import {
  buildPersonFromWikiResult,
  runWikiPersonScraper,
  type GitHubUser,
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
  icon: React.ReactNode;
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

const WikipediaSection = ({ wikipedia }: { wikipedia: WikipediaPart }): JSX.Element => (
  <Paper sx={{ p: 2.5 }}>
    <SectionHeader
      icon={<PublicIcon fontSize="small" />}
      label="Wikipedia + Wikidata"
      source="en.wikipedia.org"
    />
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      {wikipedia.thumbnail ? (
        <Avatar
          src={wikipedia.thumbnail}
          variant="rounded"
          sx={{ width: 88, height: 88 }}
        />
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{wikipedia.title}</Typography>
        {wikipedia.description ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {wikipedia.description}
          </Typography>
        ) : null}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ flexWrap: "wrap", rowGap: 0.75, mt: 1 }}
        >
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
            <Chip
              label={`wikidata · ${wikipedia.wikidataId}`}
              size="small"
              variant="outlined"
              sx={{ fontFamily: "JetBrains Mono, monospace" }}
            />
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
        <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
          {wikipedia.extract}
        </Typography>
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
        <Stack
          key={user.login}
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          <Avatar src={user.avatarUrl} sx={{ width: 44, height: 44 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {user.name ?? user.login}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
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
                <Chip
                  label={user.location}
                  size="small"
                  sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
                />
              ) : null}
              {user.company ? (
                <Chip
                  label={user.company}
                  size="small"
                  sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
                />
              ) : null}
              {user.publicRepos != null ? (
                <Chip
                  label={`${user.publicRepos} repos`}
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
                />
              ) : null}
              {user.followers != null ? (
                <Chip
                  label={`${user.followers} followers`}
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
                />
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
  const title = wiki?.title ?? headGithub?.name ?? headGithub?.login ?? result.query;
  const subtitle =
    wiki?.description ??
    headGithub?.bio ??
    (result.duckDuckGo?.abstract ? "Public web mention found" : "Open-source signals only");
  const picture = wiki?.thumbnail ?? headGithub?.avatarUrl ?? null;

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
              label={`duckduckgo · ${result.duckDuckGo ? "hit" : "no abstract"}`}
              size="small"
              color={result.duckDuckGo ? "primary" : "default"}
              variant={result.duckDuckGo ? "filled" : "outlined"}
              sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, height: 20 }}
            />
          </Stack>
        </Box>
        <Button
          startIcon={<BookmarkAddIcon />}
          onClick={onSave}
          disabled={saving || alreadySaved}
        >
          {alreadySaved ? "Saved" : saving ? "Saving…" : "Save dossier"}
        </Button>
      </Stack>
    </Paper>
  );
};

export const ScrawlerPanel = (): JSX.Element => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { savedPeople, loading } = useAppSelector((state) => state.people);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ScrawlerStatus>({ kind: "idle" });

  const run = async (): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setStatus({ kind: "running" });
    try {
      const result = await runWikiPersonScraper(trimmed);
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
      <Paper
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <TravelExploreIcon sx={{ color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Scrawler · multi-source
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
            Query any name. Pulls signals in parallel from Wikipedia + Wikidata, GitHub, and
            DuckDuckGo. Save the best-matching subject as a dossier in the registry.
          </Typography>
        </Box>
      </Paper>

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
          disabled={status.kind === "running" || query.trim().length === 0}
          startIcon={
            status.kind === "running" ? (
              <CircularProgress size={16} />
            ) : (
              <TravelExploreIcon />
            )
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
              The scrawler queries Wikipedia, GitHub, and DuckDuckGo in parallel.
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
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
};
