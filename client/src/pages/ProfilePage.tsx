import { Box, Paper, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/Button";
import { InfoGrid } from "../components/InfoGrid";
import { PageShell } from "../components/PageShell";
import { ProfileActions } from "../components/ProfileActions";
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

  const handleUpdate = async (): Promise<void> => {
    if (!isDirty) {
      return;
    }

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

  return (
    <PageShell title={toFullName(name)} subtitle={person.email}>
      <Box
        component="section"
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { md: "280px 1fr", xs: "1fr" },
        }}
      >
        <Paper sx={{ alignSelf: "start", overflow: "hidden" }}>
          <Box
            alt={toFullName(name)}
            component="img"
            src={person.picture.large}
            sx={{ display: "block", width: "100%" }}
          />
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <ProfileForm name={name} onChange={setName} onSubmit={() => void handleUpdate()} />
            <InfoGrid items={getProfileItems(person)} />
            {error ? <StatusMessage message={error} tone="error" /> : null}
            <ProfileActions
              canSave={canSave}
              canUpdate={isDirty}
              isLoading={loading.mutation}
              isSavedProfile={isSavedProfile}
              onBack={() => navigate(backRoute)}
              onDelete={() => void handleDelete()}
              onSave={() => void handleSave()}
              onUpdate={() => void handleUpdate()}
            />
          </Stack>
        </Paper>
      </Box>
    </PageShell>
  );
};
