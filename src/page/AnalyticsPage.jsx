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
  const [districtAverages, setDistrictAverages] = useState({});
  const [totalBuildingsRisk, setTotalBuildingsRisk] = useState(1);
  const [emergencyBuildings, setEmergencyBuildings] = useState(0);
  const [seismicEvalCount, setSeismicEvalCount] = useState(0);
  const [a1Count, setA1Count] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
  const [districtRisk, setDistrictRisk] = useState({});
  const [buildingRiskdata, setBuildingRiskdata] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        // ✅ Base URLs
        const baseSafetyUrl = "https://admin.smartalmaty.kz/api/v1/chs/buildings-seismic-safety/"
        const baseInfraUrl = "https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/"
        const riskUrl = "https://admin.smartalmaty.kz/api/v1/address/clickhouse/geo-risk/stats/"

        // ✅ Determine full district name (with "район"), unless it's "Все районы"
        const isAllDistricts = !selectedDistrict || selectedDistrict === "Все районы"
        const districtFull = !isAllDistricts ? `${selectedDistrict} район` : null

        // ✅ Build URLs dynamically
        const safetyUrl = !isAllDistricts
          ? `${baseSafetyUrl}?district=${encodeURIComponent(districtFull)}&limit=10`
          : `${baseSafetyUrl}?limit=10`

        const infraUrl = !isAllDistricts
          ? `${baseInfraUrl}?district=${encodeURIComponent(districtFull)}&page_size=10000`
          : `${baseInfraUrl}?page_size=10000`

        // --- Fetch all three in parallel ---
        const [safetyRes, infraRes, riskRes] = await Promise.all([
          fetch(safetyUrl),
          fetch(infraUrl),
          fetch(riskUrl),
        ])

        if (!safetyRes.ok || !infraRes.ok || !riskRes.ok) {
          throw new Error("Ошибка при загрузке данных")
        }

        const [safetyJson, infraJson, riskJson] = await Promise.all([
          safetyRes.json(),
          infraRes.json(),
          riskRes.json(),
        ])

        // --- Set seismic safety stats ---
        setTotalBuildings(safetyJson.count)
        setEmergencyBuildings(safetyJson.emergency_buildings_count)
        setSeismicEvalCount(safetyJson.seismic_eval_count)

        // --- Compute averages for readiness ---
        const districtGroups = (infraJson.features || []).reduce((acc, feature) => {
          const props = feature.properties || {}
          const district = props.district_name || "Неизвестный район"
          const iri = Number(props.IRI)
          if (!acc[district]) {
            acc[district] = { sum: 0, count: 0 }
          }
          if (!isNaN(iri)) {
            acc[district].sum += iri
            acc[district].count += 1
          }
          return acc
        }, {})
        const averages = Object.entries(districtGroups).reduce((acc, [district, { sum, count }]) => {
          acc[district] = count > 0 ? sum / count : 0
          return acc
        }, {})
        setDistrictAverages(averages)

        // --- Parse geo-risk data ---
        const riskMap = {}
        riskJson.forEach(item => {
          riskMap[item.district] = item.avg_gri
        })

        // ✅ Filter risk data locally if a specific district is selected
        if (!isAllDistricts) {
          const filteredValue = riskMap[districtFull]
          setDistrictRisk({ [districtFull]: filteredValue ?? 0 })
        } else {
          setDistrictRisk(riskMap)
        }

      } catch (err) {
        console.error("Error fetching data:", err.message)
      }
    }

    fetchData()
  }, [selectedDistrict])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Формируем URL
        let url =
          "https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/stat-by-iri-cat/"
        if (selectedDistrict && selectedDistrict !== "Все районы") {
          const encodedDistrict = encodeURIComponent(`${selectedDistrict} район`)
          url += `?district=${encodedDistrict}`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        const data = await res.json()
        setChartData(data);

      } catch (err) {
        console.error(err)
        setError("Не удалось загрузить данные")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDistrict])

  useEffect(() => {
    async function fetchData() {
      try {
        let url = "https://admin.smartalmaty.kz/api/v1/address/postgis/buildings-risk/count-by-category/"
        if (selectedDistrict && selectedDistrict!=="Все районы") {
          const districtParam = encodeURIComponent(`${selectedDistrict} район`)
          url += `?district=${districtParam}`
        }

        const response = await fetch(url)
        const json = await response.json()

        const processed = json.results.map(item => ({
          category: item.group,
          count: item.count
        }))

        setTotalBuildingsRisk(json.count)
        setBuildingRiskdata(processed)

        const a1 = json.results.find(item =>
          item.group.toLowerCase().includes("аварийное")
        )
        if (a1) setA1Count(a1.count)

      } catch (error) {
        console.error("Error fetching histogram data:", error)
      }
    }

    fetchData()
  }, [selectedDistrict, setA1Count, setTotalBuildingsRisk])

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

        {/* Seismic Resistance Levels */}
        <BuildingRiskCategoryHisto
          data={buildingRiskdata}
        />

        {/* Social Objects by IRI Index */}
        <SocialObjectsIRIHisto
          chartData={chartData}
          loading={loading}
          error={error}
        />

        {/* Population by IRI Index */}
        <PopulationIRIHisto
          chartData={chartData}
        />

        {/* District Readiness Table */}
        <DistrictReadinessTable
          districtAverages={districtAverages}
          districtRisk={districtRisk}
        />

        {/* Population in Critical Zones */}
        <PopulationCriticalHisto
          selectedDistrict={selectedDistrict}
        />
      </div>
    </div>
  );
}
