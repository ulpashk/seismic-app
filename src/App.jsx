import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import MainDashboard from "./page/MainDashboard";
import MainPage from "./page/MainPage";
import RiskPage from "./page/RiskPage";
import Header from "./components/Header";
import InfraPage from "./page/InfraPage";

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
  const [openDropDown, setOpenDropDown] = useState(false);
  const [infoDropDown, setInfoDropDown] = useState(false);
  const districts = [
      "Все районы",
      "Алатауский",
      "Алмалинский",
      "Ауэзовский",
      "Бостандыкский",
      "Жетысуский",
      "Медеуский",
      "Наурызбайский",
      "Турксибский",
  ];
  
  const selectDistrict = (district) => {
      setSelectedDistrict(district);
      setOpenDropDown(false);
  };
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
            openDropDown={openDropDown} 
            setOpenDropDown={setOpenDropDown}
            selectedDistrict={selectedDistrict} 
            districts={districts} 
            selectDistrict={selectDistrict} 
            infoDropDown={infoDropDown} 
            setInfoDropDown={setInfoDropDown}
        />
        <Routes>
          <Route 
            path="/" 
            element={
              <MainPage
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
              />
            } 
          />
          <Route 
            path="/dash" 
            element={
              <MainDashboard
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
              />
            } 
          />
          <Route path="/risk" element={<RiskPage selectedDistrict={selectedDistrict}/>} />
          <Route path="/infra" element={<InfraPage selectedDistrict={selectedDistrict}/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;