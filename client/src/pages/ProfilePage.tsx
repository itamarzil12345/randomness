import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/Button";
import { InfoGrid } from "../components/InfoGrid";
import { PageShell } from "../components/PageShell";
import { ProfileForm } from "../components/ProfileForm";
import { StatusMessage } from "../components/StatusMessage";
import { AppRoute, PROFILE_ORIGIN_PARAM } from "../constants";
import {
  deleteSavedPerson,
  fetchSavedPeople,
  savePerson,
  updateRandomPersonName,
  updateSavedPerson,
} from "../features/people/peopleSlice";
import type { PersonName, ProfileSourceType } from "../types/person";
import { toFullName } from "../utils/person";
import { findPerson, getProfileItems } from "../utils/profile";

const isProfileSource = (value: string | undefined): value is ProfileSourceType =>
  value === "random" || value === "saved";

export const ProfilePage = (): JSX.Element => {
  const { source, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { randomPeople, savedPeople, loading, error } = useAppSelector(
    (state) => state.people,
  );
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
        <Button variant="secondary" onClick={() => navigate(AppRoute.home)}>
          Back
        </Button>
      </PageShell>
    );
  }

  const isSavedProfile = source === "saved";
  const origin = searchParams.get(PROFILE_ORIGIN_PARAM);
  const backRoute = origin === "saved" ? AppRoute.savedPeople : AppRoute.randomPeople;
  const isAlreadySaved = savedPeople.some((savedPerson) => savedPerson.id === id);
  const canSave = !isSavedProfile && !isAlreadySaved;

  const handleUpdate = async (): Promise<void> => {
    if (isSavedProfile) {
      try {
        await dispatch(updateSavedPerson({ id, name })).unwrap();
      } catch {
        return;
      }

      return;
    }

    dispatch(updateRandomPersonName({ id, name }));
  };

  const handleSave = async (): Promise<void> => {
    try {
      await dispatch(savePerson({ ...person, name })).unwrap();
    } catch {
      return;
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deleteSavedPerson(id)).unwrap();
      navigate(AppRoute.savedPeople);
    } catch {
      return;
    }
  };

  return (
    <PageShell title={toFullName(name)} subtitle={person.email}>
      <section className="profile-layout">
        <img className="profile-image" src={person.picture.large} alt={toFullName(name)} />
        <div className="profile-panel">
          <ProfileForm name={name} onChange={setName} onSubmit={() => void handleUpdate()} />
          <InfoGrid items={getProfileItems(person)} />
          {error ? <StatusMessage message={error} tone="error" /> : null}
          <div className="profile-actions">
            {canSave ? (
              <Button onClick={() => void handleSave()} disabled={loading.mutation}>
                Save
              </Button>
            ) : null}
            {isSavedProfile ? (
              <Button
                variant="danger"
                onClick={() => void handleDelete()}
                disabled={loading.mutation}
              >
                Delete
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => void handleUpdate()}
              disabled={loading.mutation}
            >
              Update
            </Button>
            <Button variant="secondary" onClick={() => navigate(backRoute)}>
              Back
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
};
