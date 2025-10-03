import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/MainPage";
import Header from "./components/HeaderNewV";
import InfraPage from "./page/InfraPage";
import AnalyticsPage from "./page/AnalyticsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header/>
        <Routes>
          <Route path="/" element={<MainPage/>} />
          <Route path="/infrastructure" element={<InfraPage/>} />
          <Route path="/analytics" element={<AnalyticsPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;