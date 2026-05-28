import { getGroundTruthObservations } from "@/lib/validation/ground-truth";

export function ValidationWorkflow() {
  const observations = getGroundTruthObservations(8);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 px-1 mb-1">
        <span>Farm</span>
        <span>NDVI Field / Sat</span>
        <span>Carbon T/ha Field / Model</span>
        <span>Status</span>
      </div>
      {observations.map((obs) => {
        const ndviErr = Math.abs(obs.ndviFieldMeasured - obs.ndviSatelliteEstimate);
        const carbonErr = Math.abs(obs.carbonFieldTonnes - obs.carbonModelledTonnes);
        const good = ndviErr < 0.05 && carbonErr < 0.5;
        return (
          <div key={obs.id} className="grid grid-cols-4 gap-1 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-[10px]">
            <div>
              <p className="text-white font-medium">{obs.farmName}</p>
              <p className="text-slate-500">{obs.district}</p>
            </div>
            <div>
              <p className="text-white">{obs.ndviFieldMeasured} <span className="text-slate-500">/ {obs.ndviSatelliteEstimate}</span></p>
              <p className="text-slate-500">Δ {ndviErr.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-white">{obs.carbonFieldTonnes} <span className="text-slate-500">/ {obs.carbonModelledTonnes}</span></p>
              <p className="text-slate-500">Δ {carbonErr.toFixed(2)} t</p>
            </div>
            <div>
              <span className={`rounded-full px-1.5 py-0.5 border text-[9px] font-medium ${good ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"}`}>
                {good ? "Pass" : "Review"}
              </span>
              <p className="text-slate-500 mt-0.5">{obs.cropStage}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
