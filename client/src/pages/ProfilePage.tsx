import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import PublicIcon from "@mui/icons-material/Public";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/Button";
import { EnrichmentResult } from "../components/EnrichmentResult";
import { InfoGrid } from "../components/InfoGrid";
import { PageShell } from "../components/PageShell";
import { ProfileActions } from "../components/ProfileActions";
import { ProfileForm } from "../components/ProfileForm";
import { StatusMessage } from "../components/StatusMessage";
import { AppRoute, PROFILE_ORIGIN_PARAM } from "../constants";
import {
  fetchEnrichments,
  saveEnrichment,
  setRunningScraper,
} from "../features/enrichments/enrichmentsSlice";
import {
  deleteSavedPerson,
  fetchSavedPeople,
  savePerson,
  updateRandomPersonName,
  updateSavedPerson,
} from "../features/people/peopleSlice";
import { scrapers } from "../scrapers";
import type { EnrichmentScraper } from "../types/enrichment";
import type { Person, PersonName, ProfileSourceType } from "../types/person";
import { toFullName } from "../utils/person";
import { findPerson, getProfileItems } from "../utils/profile";

const isProfileSource = (value: string | undefined): value is ProfileSourceType =>
  value === "random" || value === "saved";

const scraperIcon = (id: EnrichmentScraper): ReactNode => {
  if (id === "geo") return <PublicIcon />;
  if (id === "identity") return <FingerprintIcon />;
  return <MailOutlineIcon />;
};

const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
};

export const ProfilePage = (): JSX.Element => {
  const { source, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { randomPeople, savedPeople, loading, error } = useAppSelector(
    (state) => state.people,
  );
  const { byPerson, runningScraper } = useAppSelector((state) => state.enrichments);

  const person = useMemo(
    () => findPerson(source, id, randomPeople, savedPeople),
    [id, randomPeople, savedPeople, source],
  );
  const [name, setName] = useState<PersonName | null>(person?.name ?? null);

  useEffect(() => {
    setName(person?.name ?? null);
  }, [person]);

  useEffect(() => {
    if (source === "saved" && savedPeople.length === 0) {
      void dispatch(fetchSavedPeople());
    }
  }, [dispatch, savedPeople.length, source]);

  useEffect(() => {
    if (id && source === "saved") {
      void dispatch(fetchEnrichments(id));
    }
  }, [dispatch, id, source]);

  if (!isProfileSource(source) || !id || !person || !name) {
    if (source === "saved" && loading.saved) {
      return (
        <PageShell title="Loading profile">
          <StatusMessage message="Loading saved profile..." />
        </PageShell>
      );
    }

    return (
      <PageShell title="Profile not found">
        <Stack direction="row">
          <Button variant="secondary" onClick={() => navigate(AppRoute.home)}>
            Back
          </Button>
        </Stack>
      </PageShell>
    );
  }

  const isSavedProfile = source === "saved";
  const origin = searchParams.get(PROFILE_ORIGIN_PARAM);
  const backRoute = origin === "saved" ? AppRoute.savedPeople : AppRoute.randomPeople;
  const isAlreadySaved = savedPeople.some((savedPerson) => savedPerson.id === id);
  const canSave = !isSavedProfile && !isAlreadySaved;
  const isDirty =
    name.title !== person.name.title ||
    name.first !== person.name.first ||
    name.last !== person.name.last;

  const enrichments = byPerson[id] ?? [];
  const enrichmentByScraper = new Map(enrichments.map((e) => [e.scraper, e] as const));
  const activeRun = runningScraper[id] ?? null;

  const handleUpdate = async (): Promise<void> => {
    if (!isDirty) return;
    if (isSavedProfile) {
      try {
        await dispatch(updateSavedPerson({ id, name })).unwrap();
        toast.success("Profile updated on the server.");
      } catch {
        toast.error("Failed to update the profile. Please try again.");
      }
      return;
    }
    dispatch(updateRandomPersonName({ id, name }));
    toast.success("Profile updated in the list.");
  };

  const handleSave = async (): Promise<void> => {
    try {
      await dispatch(savePerson({ ...person, name })).unwrap();
      toast.success("Profile saved.");
    } catch {
      toast.error("Failed to save the profile. Please try again.");
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deleteSavedPerson(id)).unwrap();
      toast.success("Profile deleted.");
      navigate(AppRoute.savedPeople);
    } catch {
      toast.error("Failed to delete the profile. Please try again.");
    }
  };

  const runScraper = async (
    scraperId: EnrichmentScraper,
    runner: (subject: Person) => Promise<unknown>,
    label: string,
  ): Promise<void> => {
    if (!isSavedProfile) {
      toast.error("Save the profile first to persist enrichment results.");
      return;
    }
    dispatch(setRunningScraper({ personId: id, scraper: scraperId }));
    try {
      const payload = await runner(person);
      await dispatch(saveEnrichment({ personId: id, scraper: scraperId, payload })).unwrap();
      toast.success(`${label} complete.`);
    } catch (err) {
      toast.error(`${label} failed: ${(err as Error).message}`);
    } finally {
      dispatch(setRunningScraper({ personId: id, scraper: null }));
    }
  };

  return (
    <PageShell
      title={toFullName(name)}
      subtitle={person.email}
      fullHeight
      topActions={
        <Button
          variant="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backRoute)}
          sx={{ minHeight: 36, fontSize: 13, px: 1.75 }}
        >
          Back to {origin === "saved" ? "Saved" : "People"}
        </Button>
      }
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { lg: "340px minmax(0, 1fr)", xs: "1fr" },
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Left rail — subject card */}
        <Stack spacing={2}>
          <Paper
            sx={{
              overflow: "hidden",
              position: "relative",
              background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.18)}, transparent 40%)`,
            }}
          >
            <Stack spacing={2} sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Avatar
                  src={person.picture.large}
                  alt={toFullName(name)}
                  sx={{
                    width: 80,
                    height: 80,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.45)}`,
                  }}
                />
                <Box>
                  <Typography variant="overline" sx={{ color: "primary.main" }}>
                    Subject
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                    {toFullName(name)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {person.location.city}, {person.location.country}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                <Chip
                  label={isSavedProfile ? "REGISTRY" : "LIVE"}
                  size="small"
                  sx={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    bgcolor: alpha(
                      isSavedProfile ? theme.palette.success.main : theme.palette.primary.main,
                      0.18,
                    ),
                    color: isSavedProfile ? "success.main" : "primary.main",
                  }}
                />
                <Chip
                  label={person.gender}
                  size="small"
                  sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}
                />
                <Chip
                  label={`${person.dob.age}y`}
                  size="small"
                  sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}
                />
              </Stack>
              <Box>
                <Typography variant="overline" sx={{ color: "text.secondary" }}>
                  Subject ID
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    color: "text.secondary",
                    overflowWrap: "anywhere",
                  }}
                >
                  {person.id}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Run intel panel */}
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700 }}>Run intel</Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
              Trigger an enrichment scraper. Results are persisted to the registry.
            </Typography>
            <Stack spacing={1}>
              {scrapers.map((scraper) => {
                const last = enrichmentByScraper.get(scraper.id);
                const isRunning = activeRun === scraper.id;
                const button = (
                  <Button
                    onClick={() => void runScraper(scraper.id, scraper.run, scraper.label)}
                    disabled={!isSavedProfile || activeRun !== null}
                    variant="secondary"
                    startIcon={
                      isRunning ? <CircularProgress size={16} /> : scraperIcon(scraper.id)
                    }
                    sx={{ justifyContent: "flex-start", width: "100%" }}
                  >
                    <Box sx={{ textAlign: "left", flex: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        {scraper.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 10,
                          color: "text.secondary",
                          textTransform: "none",
                        }}
                      >
                        {last
                          ? `last run · ${formatRelative(last.runAt)}`
                          : `source · ${scraper.source}`}
                      </Typography>
                    </Box>
                  </Button>
                );

                if (!isSavedProfile) {
                  return (
                    <Tooltip
                      key={scraper.id}
                      title="Save the profile to enable enrichment scrapers"
                      placement="left"
                    >
                      <Box>{button}</Box>
                    </Tooltip>
                  );
                }
                return <Box key={scraper.id}>{button}</Box>;
              })}
            </Stack>
          </Paper>

          {/* Enrichments panel — left rail */}
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Typography variant="overline" sx={{ color: "text.secondary" }}>
                Enrichments
              </Typography>
              <Chip
                label={`${enrichments.length}`}
                size="small"
                sx={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10,
                  height: 20,
                }}
              />
            </Stack>
            {enrichments.length === 0 ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                No scrapers have run yet.{" "}
                {isSavedProfile ? "Trigger one above." : "Save first to enable scrapers."}
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={2} sx={{ mt: 1 }}>
                {scrapers.map((scraper) => {
                  const enrichment = enrichmentByScraper.get(scraper.id);
                  if (!enrichment) return null;
                  return (
                    <Box key={scraper.id}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", mb: 1 }}
                      >
                        <Box sx={{ color: "primary.main" }}>{scraperIcon(scraper.id)}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 12 }} noWrap>
                            {scraper.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 10,
                              color: "text.secondary",
                            }}
                            noWrap
                          >
                            {formatRelative(enrichment.runAt)}
                          </Typography>
                        </Box>
                      </Stack>
                      <EnrichmentResult enrichment={enrichment} />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Stack>

        {/* Main column */}
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Identification
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <ProfileForm
              name={name}
              onChange={setName}
              onSubmit={() => void handleUpdate()}
            />
          </Box>
          <Divider sx={{ my: 2.5 }} />
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Attributes
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <InfoGrid items={getProfileItems(person)} />
          </Box>
          {error ? (
            <Box sx={{ mt: 2 }}>
              <StatusMessage message={error} tone="error" />
            </Box>
          ) : null}
          <Divider sx={{ my: 2.5 }} />
          <ProfileActions
            canSave={canSave}
            canUpdate={isDirty}
            isLoading={loading.mutation}
            isSavedProfile={isSavedProfile}
            onDelete={() => void handleDelete()}
            onSave={() => void handleSave()}
            onUpdate={() => void handleUpdate()}
          />
        </Paper>
      </Box>
    </PageShell>
  );
};
