import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AppRoute } from "./constants";
import { GraphPage } from "./pages/GraphPage";
import { PeopleListPage } from "./pages/PeopleListPage";
import { ProfilePage } from "./pages/ProfilePage";

export const App = (): JSX.Element => (
  <AppShell>
    <Routes>
      <Route path={AppRoute.home} element={<PeopleListPage source="random" />} />
      <Route path={AppRoute.savedPeople} element={<PeopleListPage source="saved" />} />
      <Route path={AppRoute.graph} element={<GraphPage />} />
      <Route path={AppRoute.profile} element={<ProfilePage />} />
      <Route path="*" element={<Navigate to={AppRoute.home} replace />} />
    </Routes>
  </AppShell>
);
