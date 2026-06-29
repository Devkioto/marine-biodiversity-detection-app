import axios from "axios";

export const api = axios.create({
  baseURL: "https://backfire-cloning-factsheet.ngrok-free.dev/",
  timeout: 12000,
});

const STATUS_LABEL = {
  native: { display: "Native", type: "Native species" },
  protected: { display: "Protected", type: "Protected species" },
  invasive: { display: "Invasive", type: "Invasive species" },
};

let nextFallbackId = 1;

// Video detections repeat the same tracked individual across many frames.
// Keeps only the highest-confidence sighting per track_id; detections with
// no track_id (e.g. single-image calls) are always kept individually.
export function dedupeByTrack(rawDetections = []) {
  const bestByTrack = new Map();
  const untracked = [];

  rawDetections.forEach((item) => {
    if (item.track_id == null) {
      untracked.push(item);
      return;
    }
    const existing = bestByTrack.get(item.track_id);
    if (!existing || item.classification_confidence > existing.classification_confidence) {
      bestByTrack.set(item.track_id, item);
    }
  });

  return [...untracked, ...bestByTrack.values()];
}

// Maps the FastAPI service's actual response shape
// ({ species, status, detection_confidence, classification_confidence, bbox, track_id })
// onto the fields the UI components expect (id, common, confidence, type, timestamp).
// Note: the model returns common species names directly (e.g. "Grouper"), not separate
// scientific/common pairs, so `species` and `common` end up showing the same text here.
export function normalizeDetections(rawDetections = []) {
  return rawDetections.map((item) => {
    const statusInfo = STATUS_LABEL[item.status] || { display: item.status, type: "Detected species" };

    return {
      id: item.track_id ?? nextFallbackId++,
      species: item.species,
      common: item.species,
      confidence: item.classification_confidence,
      status: statusInfo.display,
      type: statusInfo.type,
      bbox: item.bbox,
      timestamp: new Date().toLocaleString(),
    };
  });
}
