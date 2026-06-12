import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AiToolsPage } from "./pages/AiToolsPage";
import { BuildWithAIPage } from "./pages/BuildWithAIPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResumeDetailPage } from "./pages/ResumeDetailPage";
import { ResumeEditorPage } from "./pages/ResumeEditorPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="resumes/new" element={<ResumeEditorPage />} />
        <Route path="resumes/:id" element={<ResumeDetailPage />} />
        <Route path="resumes/:id/edit" element={<ResumeEditorPage />} />
        <Route path="ai-tools" element={<AiToolsPage />} />
        <Route path="build-with-ai" element={<BuildWithAIPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
