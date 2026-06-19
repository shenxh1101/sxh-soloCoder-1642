import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ToastContainer from "@/components/Toast";
import Dashboard from "@/pages/Dashboard";
import ClientList from "@/pages/clients/ClientList";
import ClientDetail from "@/pages/clients/ClientDetail";
import ClientForm from "@/pages/clients/ClientForm";
import CaseList from "@/pages/cases/CaseList";
import CaseDetail from "@/pages/cases/CaseDetail";
import CaseForm from "@/pages/cases/CaseForm";
import DocumentList from "@/pages/documents/DocumentList";
import DocumentGenerate from "@/pages/documents/DocumentGenerate";
import DocumentEditor from "@/pages/documents/DocumentEditor";
import SchedulePage from "@/pages/schedule/SchedulePage";
import StatisticsPage from "@/pages/statistics/StatisticsPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/cases" element={<CaseList />} />
          <Route path="/cases/new" element={<CaseForm />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/generate" element={<DocumentGenerate />} />
          <Route path="/documents/edit/:id" element={<DocumentEditor />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </Router>
  );
}
