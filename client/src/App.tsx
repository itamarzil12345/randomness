import { Navigate, Route, Routes } from "react-router-dom";
import { AppRoute } from "./constants";
import { HomePage } from "./pages/HomePage";
import { PeopleListPage } from "./pages/PeopleListPage";
import { ProfilePage } from "./pages/ProfilePage";

export const App = (): JSX.Element => (
  <Routes>
    <Route path={AppRoute.home} element={<HomePage />} />
    <Route path={AppRoute.randomPeople} element={<PeopleListPage source="random" />} />
    <Route path={AppRoute.savedPeople} element={<PeopleListPage source="saved" />} />
    <Route path={AppRoute.profile} element={<ProfilePage />} />
    <Route path="*" element={<Navigate to={AppRoute.home} replace />} />
  </Routes>
);
