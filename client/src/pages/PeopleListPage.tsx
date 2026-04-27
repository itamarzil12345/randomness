import { Box, CircularProgress, Pagination, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Filters } from "../components/Filters";
import { PageShell } from "../components/PageShell";
import { PeopleList } from "../components/PeopleList";
import { StatusMessage } from "../components/StatusMessage";
import {
  EMPTY_FILTER_VALUE,
  MAX_RANDOM_USERS,
  RANDOM_USER_PAGE_SIZE,
} from "../constants";
import { fetchRandomPeople, fetchSavedPeople } from "../features/people/peopleSlice";
import { fetchConnections } from "../features/connections/connectionsSlice";
import type { ProfileSourceType } from "../types/person";
import { filterPeople, mergeSavedPeopleFirst } from "../utils/person";

type PeopleListPageProps = {
  source: ProfileSourceType;
};

export const PeopleListPage = ({ source }: PeopleListPageProps): JSX.Element => {
  const [nameFilter, setNameFilter] = useState(EMPTY_FILTER_VALUE);
  const [countryFilter, setCountryFilter] = useState(EMPTY_FILTER_VALUE);
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const { randomPeople, savedPeople, loading, error } = useAppSelector(
    (state) => state.people,
  );
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
    if (savedPeople.length === 0) {
      void dispatch(fetchSavedPeople());
    }
  }, [dispatch, savedPeople.length]);

  useEffect(() => {
    if (
      !isSavedSource &&
      randomPeople.length === 0 &&
      !loading.random
    ) {
      void dispatch(fetchRandomPeople({ append: false }));
      void dispatch(fetchConnections());
    }
  }, [dispatch, isSavedSource, loading.random, randomPeople.length]);

  useEffect(() => {
    setPage(1);
  }, [nameFilter, countryFilter, source]);

  const filteredPeople = useMemo(
    () => filterPeople(people, nameFilter, countryFilter),
    [countryFilter, nameFilter, people],
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

  return (
    <PageShell title={title} subtitle={subtitle} fullHeight>
      <Stack spacing={2} sx={{ flexShrink: 0 }}>
        <Filters
          nameFilter={nameFilter}
          countryFilter={countryFilter}
          onNameChange={setNameFilter}
          onCountryChange={setCountryFilter}
        />
        {error ? <StatusMessage message={error} tone="error" /> : null}
        {showPagination ? (
          <Stack direction="row" sx={{ justifyContent: "center" }}>
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
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, mt: 2, overflow: "auto", position: "relative" }}>
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
              backgroundColor: "rgba(255, 255, 255, 0.6)",
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
      </Box>
    </PageShell>
  );
};
