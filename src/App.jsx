import "katex/dist/katex.min.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/MainPage";
import Header from "./components/HeaderNewV";
import InfraPage from "./page/InfraPage";
import AnalyticsPage from "./page/AnalyticsPage";
import RecomendPage from "./page/RecomendPage";

function App() {
  const [activeLayer, setActiveLayer] = useState("building");

  return (
    <Router>
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-30">
          <Header activeLayer={activeLayer} />
        </div>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/infrastructure"
            element={
              <InfraPage
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <div className="pt-16 h-full overflow-auto">
                <AnalyticsPage />
              </div>
            }
          />
          <Route
            path="/recommendations"
            element={
              <div className="pt-16 h-full overflow-auto">
                <RecomendPage />
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
