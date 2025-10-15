import React, { useState, useEffect } from "react";
import Map from "./components/Map";
import { availableMaps } from "./config";

function App() {
  const [selectedMap, setSelectedMap] = useState(() => {
    const saved = localStorage.getItem("selectedMap");
    if (!saved) return availableMaps[0].src;
    if (availableMaps.some((m) => m.src === saved)) return saved;
    return availableMaps[0].src;
  });

  useEffect(() => {
    localStorage.setItem("selectedMap", selectedMap);
  }, [selectedMap]);

  return (
    <div>
      <select
        value={selectedMap}
        onChange={(e) => setSelectedMap(e.target.value)}
        className="border rounded p-1"
        style={{ position: "absolute", left: 8, zIndex: 1000 }}
      >
        {availableMaps.map((map) => (
          <option key={map.src} value={map.src}>
            {map.name}
          </option>
        ))}
      </select>
      <Map mapSrc={selectedMap} />
    </div>
  );
}

export default App;
