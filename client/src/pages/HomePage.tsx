import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import { Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/Button";
import { PageShell } from "../components/PageShell";
import { StatusMessage } from "../components/StatusMessage";
import { AppRoute } from "../constants";
import { fetchRandomPeople, fetchSavedPeople } from "../features/people/peopleSlice";

export const HomePage = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.people);

  const handleFetch = async (): Promise<void> => {
    try {
      await dispatch(fetchRandomPeople({ append: false })).unwrap();
      navigate(AppRoute.randomPeople);
    } catch {
      return;
    }
  };

  const handleHistory = async (): Promise<void> => {
    try {
      await dispatch(fetchSavedPeople()).unwrap();
      navigate(AppRoute.savedPeople);
    } catch {
      return;
    }
  };

  return (
    <PageShell title="People Browser" subtitle="Fetch random people or view history.">
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
          <Button
            disabled={loading.random}
            onClick={() => void handleFetch()}
            startIcon={<DownloadIcon />}
          >
          {loading.random ? "Fetching..." : "Fetch"}
        </Button>
          <Button
            variant="secondary"
            onClick={() => void handleHistory()}
            disabled={loading.saved}
            startIcon={<HistoryIcon />}
          >
          {loading.saved ? "Loading..." : "History"}
        </Button>
        </Stack>
      </Paper>
      {error ? <StatusMessage message={error} tone="error" /> : null}
    </PageShell>
  );
};
