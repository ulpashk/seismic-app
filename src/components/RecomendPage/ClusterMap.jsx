export default function ClusterMap() {
  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Карта кластеров
      </h3>

      <div className="bg-white rounded-md p-4 h-64 flex items-center justify-center">
        <div className="w-full h-full bg-green-100 rounded flex items-center justify-center">
          <span className="text-gray-600 text-sm">Карта кластеров</span>
        </div>
      </div>
    </div>
  );
}
