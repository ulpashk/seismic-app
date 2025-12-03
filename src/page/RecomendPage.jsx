import React from "react";
import Demolition from "../components/RecomendPage/Demolition";
import ClusterMap from "../components/RecomendPage/ClusterMap";
import Certification from "../components/RecomendPage/Certification";
import Reinforcement from "../components/RecomendPage/Reinforcement";

export default function RecomendPage() {
  return (
    <div className="px-6 py-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="space-y-6">
          <Demolition />
          <ClusterMap />
        </div>
        <Certification />
        <Reinforcement />
      </div>
    </div>
  );
}
