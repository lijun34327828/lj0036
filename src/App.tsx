import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Trends from "@/pages/Trends";
import Ranking from "@/pages/Ranking";
import ContentDetail from "@/pages/ContentDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/content/:id" element={<ContentDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
