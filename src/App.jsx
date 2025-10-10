import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/MainPage";
import Header from "./components/HeaderNewV";
import InfraPage from "./page/InfraPage";
import AnalyticsPage from "./page/AnalyticsPage";

function App() {
  return (
    <Router>
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-30">
          <Header />
        </div>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/infrastructure" element={<InfraPage />} />
          <Route 
            path="/analytics" 
            element={
              <div className="pt-16 h-full overflow-auto">
                <AnalyticsPage />
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
    // <Router>
    //   <div className="min-h-screen bg-gray-50">
    //     <Header/>
    //     <Routes>
    //       <Route path="/" element={<MainPage/>} />
    //       <Route path="/infrastructure" element={<InfraPage/>} />
    //       <Route path="/analytics" element={<AnalyticsPage/>} />
    //     </Routes>
    //   </div>
    // </Router>
  );
}

export default App;