import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./shared/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import JoinRoomPage from "./pages/JoinRoomPage";
import StorePage from "./pages/StorePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<AuthPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="create-room" element={<CreateRoomPage />} />
          <Route path="join-room" element={<JoinRoomPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
