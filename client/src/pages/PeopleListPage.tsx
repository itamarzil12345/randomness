import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/Button";
import { Filters } from "../components/Filters";
import { PageShell } from "../components/PageShell";
import { PeopleList } from "../components/PeopleList";
import { StatusMessage } from "../components/StatusMessage";
import { AppRoute, EMPTY_FILTER_VALUE } from "../constants";
import { fetchSavedPeople } from "../features/people/peopleSlice";
import type { ProfileSourceType } from "../types/person";
import { filterPeople, mergeSavedPeopleFirst } from "../utils/person";

type PeopleListPageProps = {
  source: ProfileSourceType;
};

export const PeopleListPage = ({ source }: PeopleListPageProps): JSX.Element => {
  const [nameFilter, setNameFilter] = useState(EMPTY_FILTER_VALUE);
  const [countryFilter, setCountryFilter] = useState(EMPTY_FILTER_VALUE);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { randomPeople, savedPeople, loading, error } = useAppSelector(
    (state) => state.people,
  );
  const isSavedSource = source === "saved";
  const title = isSavedSource ? "Saved Profiles" : "Random Profiles";
  const people = useMemo(() => {
    if (isSavedSource) {
      return savedPeople;
    }

    return mergeSavedPeopleFirst(randomPeople, savedPeople);
  }, [isSavedSource, randomPeople, savedPeople]);

  useEffect(() => {
    if (savedPeople.length === 0) {
      void dispatch(fetchSavedPeople());
    }
  }, [dispatch, savedPeople.length]);

  const filteredPeople = useMemo(
    () => filterPeople(people, nameFilter, countryFilter),
    [countryFilter, nameFilter, people],
  );

  return (
    <PageShell title={title} subtitle="Filter profiles and open a row for details.">
      <div className="toolbar">
        <Button variant="secondary" onClick={() => navigate(AppRoute.home)}>
          Back
        </Button>
      </div>
      <Filters
        nameFilter={nameFilter}
        countryFilter={countryFilter}
        onNameChange={setNameFilter}
        onCountryChange={setCountryFilter}
      />
      {error ? <StatusMessage message={error} tone="error" /> : null}
      {loading.saved && isSavedSource ? (
        <StatusMessage message="Loading saved profiles..." />
      ) : null}
      {!loading.saved && filteredPeople.length === 0 ? (
        <StatusMessage message="No profiles to display." />
      ) : (
        <PeopleList people={filteredPeople} origin={source} />
      )}
    </PageShell>
  );
};
