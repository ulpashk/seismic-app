import React, { useEffect, useState } from "react";
import BuildingPassport from "../components/AnalyticsPage/BuildingPassport";
import Indicators from "../components/AnalyticsPage/Indicators";
import BuildingRiskCategoryHisto from "../components/AnalyticsPage/BuildingRiskCategoryHisto";
import SocialObjectsIRIHisto from "../components/AnalyticsPage/SocialObjectsIRIHisto";
import PopulationIRIHisto from "../components/AnalyticsPage/PopulationIRIHisto";
import DistrictReadinessTable from "../components/AnalyticsPage/DistrictReadinessTable";
import PopulationCriticalHisto from "../components/AnalyticsPage/PopulationCriticalHisto";

export default function AnalyticPage() {
  const [totalBuildings, setTotalBuildings] = useState(0)
  const [infraSummary, setInfraSummary] = useState({});
  const [districtAverages, setDistrictAverages] = useState({});
  const [totalBuildingsRisk, setTotalBuildingsRisk] = useState(1);
  const [emergencyBuildings, setEmergencyBuildings] = useState(0);
  const [seismicEvalCount, setSeismicEvalCount] = useState(0);
  const [a1Count, setA1Count] = useState(0) 
  const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
  const districts = [
    "Все районы",
    "Алатауский",
    "Алмалинский",
    "Ауэзовский",
    "Бостандыкский",
    "Жетысуский",
    "Медеуский",
    "Наурызбайский",
    "Турксибский"
  ];

  useEffect(() => {
    async function fetchData() {
      try {

        const [safetyRes, infraRes] = await Promise.all([
          fetch("https://admin.smartalmaty.kz/api/v1/chs/buildings-seismic-safety/?limit=10"),
          fetch("https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/?page_size=10000"),
        ]);

        if (!safetyRes.ok || !infraRes.ok) {
          throw new Error("Ошибка при загрузке данных");
        }

        const safetyJson = await safetyRes.json();
        const infraJson = await infraRes.json();

        // Save first API
        setTotalBuildings(safetyJson.count);
        setEmergencyBuildings(safetyJson.emergency_buildings_count);
        setSeismicEvalCount(safetyJson.seismic_eval_count);

        // Process infra-readiness data
        const grouped = (infraJson.features || []).reduce((acc, feature) => {
        const props = feature.properties || {};
        const key = props.IRI_cat || "Неизвестно";

        if (!acc[key]) {
            acc[key] = { cnt_ddo: 0, cnt_health: 0, cnt_pppn: 0, cnt_school: 0, bldg_count: 0, gri_pop_sum: 0 };
        }

        acc[key].cnt_ddo += props.cnt_ddo || 0;
        acc[key].cnt_health += props.cnt_health || 0;
        acc[key].cnt_pppn += props.cnt_pppn || 0;
        acc[key].cnt_school += props.cnt_school || 0;
        acc[key].bldg_count += props.bldg_count || 0;
        acc[key].gri_pop_sum += Number(props.gri_pop_sum) || 0;

        return acc;
        }, {});

        setInfraSummary(grouped);

        const districtGroups = (infraJson.features || []).reduce((acc, feature) => {
          const props = feature.properties || {};
          const district = props.district_name || "Неизвестный район";
          const iri = Number(props.IRI);

          if (!acc[district]) {
            acc[district] = { sum: 0, count: 0 };
          }

          if (!isNaN(iri)) {
            acc[district].sum += iri;
            acc[district].count += 1;
          }

          return acc;
        }, {});

        const averages = Object.entries(districtGroups).reduce((acc, [district, { sum, count }]) => {
          acc[district] = count > 0 ? sum / count : 0;
          return acc;
        }, {});

        setDistrictAverages(averages);

      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-3 gap-6 p-6">
        <div className="flex flex-col justify-between">
            {/* District Selector */}
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Выберите район:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <Indicators
              totalBuildings={totalBuildings}
              a1Count={a1Count}
              emergencyBuildings={emergencyBuildings}
              seismicEvalCount={seismicEvalCount}
            />
            <BuildingPassport 
              totalBuildings={totalBuildings}
              totalBuildingsRisk={totalBuildingsRisk}
            />
        </div>
        {/* Buildings Gauge */}

        {/* Seismic Resistance Levels */}
        <BuildingRiskCategoryHisto
            setTotalBuildingsRisk={setTotalBuildingsRisk}
            setA1Count={setA1Count}
        />

        {/* Social Objects by IRI Index */}
        <SocialObjectsIRIHisto
          infraSummary={infraSummary}
        />

        {/* Population by IRI Index */}
        <PopulationIRIHisto
          infraSummary={infraSummary}
        />

        {/* District Readiness Table */}
        <DistrictReadinessTable
            districtAverages={districtAverages}
        />

        {/* Population in Critical Zones */}
        <PopulationCriticalHisto/>
      </div>
    </div>
  );
}
