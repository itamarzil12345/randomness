import { Box, CircularProgress, Pagination, Paper, Stack, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Filters } from "../components/Filters";
import { PageShell } from "../components/PageShell";
import { PeopleList } from "../components/PeopleList";
import { ScrawlerPanel } from "../components/ScrawlerPanel";
import { SourceStrip } from "../components/SourceStrip";
import { StatusMessage } from "../components/StatusMessage";
import {
  MAX_RANDOM_USERS,
  RANDOM_USER_PAGE_SIZE,
} from "../constants";
import { fetchConnections } from "../features/connections/connectionsSlice";
import {
  fetchRandomPeople,
  fetchSavedPeople,
  resetRandomPeople,
} from "../features/people/peopleSlice";
import {
  RANDOM_USER_API_KEY,
  fetchSettings,
  updateSetting,
} from "../features/settings/settingsSlice";
import type { ProfileSourceType } from "../types/person";
import {
  applyPeopleFilters,
  collectFacetValues,
  defaultFilters,
} from "../utils/filters";
import { mergeSavedPeopleFirst } from "../utils/person";

type PeopleListPageProps = {
  source: ProfileSourceType;
};

type PeopleTab = "search" | "scrawler";

export const PeopleListPage = ({ source }: PeopleListPageProps): JSX.Element => {
  const [filters, setFilters] = useState(defaultFilters);
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<PeopleTab>("search");
  const [savingApi, setSavingApi] = useState(false);
  const { randomPeople, savedPeople, loading, error } = useAppSelector(
    (state) => state.people,
  );
  const settings = useAppSelector((state) => state.settings);
  const apiUrl =
    settings.byKey[RANDOM_USER_API_KEY] ?? "https://randomuser.me/api/";

  const isSavedSource = source === "saved";
  const title = isSavedSource ? "Saved" : "People";
  const subtitle = isSavedSource
    ? "Profiles you've saved."
    : "Browse people. Open a profile to view details or save.";
  const people = useMemo(
    () =>
      isSavedSource ? savedPeople : mergeSavedPeopleFirst(randomPeople, savedPeople),
    [isSavedSource, randomPeople, savedPeople],
  );

  useEffect(() => {
    if (!settings.loaded) {
      void dispatch(fetchSettings());
    }
  }, [dispatch, settings.loaded]);

  useEffect(() => {
    if (savedPeople.length === 0) {
      void dispatch(fetchSavedPeople());
    }
  }, [dispatch, savedPeople.length]);

  useEffect(() => {
    if (
      !isSavedSource &&
      tab === "search" &&
      randomPeople.length === 0 &&
      !loading.random
    ) {
      void dispatch(fetchRandomPeople({ append: false }));
      void dispatch(fetchConnections());
    }
  }, [dispatch, isSavedSource, loading.random, randomPeople.length, tab]);

  useEffect(() => {
    setPage(1);
  }, [filters, source]);

  const facets = useMemo(() => collectFacetValues(people), [people]);
  const filteredPeople = useMemo(
    () => applyPeopleFilters(people, filters, source),
    [filters, people, source],
  );

  const canFetchMore = !isSavedSource && randomPeople.length < MAX_RANDOM_USERS;
  const remainingFetchableRandom = isSavedSource
    ? 0
    : MAX_RANDOM_USERS - randomPeople.length;
  const projectedItemCount = filteredPeople.length + remainingFetchableRandom;
  const totalPages = Math.max(
    1,
    Math.ceil(projectedItemCount / RANDOM_USER_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * RANDOM_USER_PAGE_SIZE;
  const visiblePeople = filteredPeople.slice(start, start + RANDOM_USER_PAGE_SIZE);
  const showPagination = totalPages > 1;

  const handlePageChange = async (
    _: React.ChangeEvent<unknown>,
    value: number,
  ): Promise<void> => {
    const targetItemCount = value * RANDOM_USER_PAGE_SIZE;
    const deficit = targetItemCount - filteredPeople.length;
    if (deficit > 0 && canFetchMore) {
      const fetchesNeeded = Math.ceil(deficit / RANDOM_USER_PAGE_SIZE);
      const maxFetches = Math.ceil(
        (MAX_RANDOM_USERS - randomPeople.length) / RANDOM_USER_PAGE_SIZE,
      );
      const fetches = Math.min(fetchesNeeded, maxFetches);
      for (let i = 0; i < fetches; i += 1) {
        try {
          await dispatch(fetchRandomPeople({ append: true })).unwrap();
        } catch {
          return;
        }
      }
    }
    setPage(value);
  };

  const handleApiSave = async (next: string): Promise<void> => {
    setSavingApi(true);
    try {
      await dispatch(updateSetting({ key: RANDOM_USER_API_KEY, value: next })).unwrap();
      dispatch(resetRandomPeople());
      setPage(1);
      await dispatch(fetchRandomPeople({ append: false })).unwrap();
      toast.success("People API endpoint updated.");
    } catch {
      toast.error("Failed to update endpoint.");
    } finally {
      setSavingApi(false);
    }
  };

  const handleApiRefresh = (): void => {
    dispatch(resetRandomPeople());
    setPage(1);
    void dispatch(fetchRandomPeople({ append: false }));
  };

  const renderSearchPane = (): JSX.Element => (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      {!isSavedSource ? (
        <SourceStrip
          label="API · randomuser"
          value={apiUrl}
          saving={savingApi}
          onSave={handleApiSave}
          onRefresh={handleApiRefresh}
          status={`${randomPeople.length}/${MAX_RANDOM_USERS} loaded`}
        />
      ) : null}
      <Filters
        filters={filters}
        onChange={setFilters}
        facets={facets}
        resultCount={filteredPeople.length}
        totalCount={people.length}
        showSourceFilter={!isSavedSource}
      />
      {error ? <StatusMessage message={error} tone="error" /> : null}
      {showPagination ? (
        <Stack direction="row" sx={{ justifyContent: "center", flexShrink: 0 }}>
          <Pagination
            count={totalPages}
            page={safePage}
            onChange={(event, value) => void handlePageChange(event, value)}
            disabled={loading.random}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Stack>
      ) : null}
      <Paper
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          position: "relative",
        }}
      >
        {loading.saved && isSavedSource ? (
          <StatusMessage message="Loading saved profiles..." />
        ) : null}
        {!loading.saved && filteredPeople.length === 0 ? (
          <StatusMessage message="No profiles to display." />
        ) : (
          <PeopleList people={visiblePeople} origin={source} />
        )}
        {loading.random ? (
          <Box
            sx={{
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.18)",
              display: "flex",
              inset: 0,
              justifyContent: "center",
              position: "absolute",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}
      </Paper>
    </Stack>
  );

  return (
    <PageShell title={title} subtitle={subtitle} fullHeight>
      {!isSavedSource ? (
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value as PeopleTab)}
          sx={{ flexShrink: 0, mb: 1.5, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="search" label="People Search" />
          <Tab value="scrawler" label="Scrawler" />
        </Tabs>
      ) : null}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {isSavedSource || tab === "search" ? renderSearchPane() : <ScrawlerPanel />}
      </Box>
    </PageShell>
  );
};
