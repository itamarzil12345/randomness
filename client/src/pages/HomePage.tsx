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
      await dispatch(fetchRandomPeople()).unwrap();
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
      <section className="home-actions">
        <Button onClick={() => void handleFetch()} disabled={loading.random}>
          {loading.random ? "Fetching..." : "Fetch"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void handleHistory()}
          disabled={loading.saved}
        >
          {loading.saved ? "Loading..." : "History"}
        </Button>
      </section>
      {error ? <StatusMessage message={error} tone="error" /> : null}
    </PageShell>
  );
};
