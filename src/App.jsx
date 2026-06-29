import { useMemo, useRef, useState } from "react";
import { api, normalizeDetections, dedupeByTrack } from "./services/api";
import { speciesSamples } from "./data/species";

const navItems = ["Dashboard", "Video", "Live Camera", "Underwater", "History"];

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
    video: "M4 6h11a2 2 0 0 1 2 2v1.5l4-2.5v10l-4-2.5V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
    camera: "M7 7l1.4-2h7.2L17 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2Zm5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    radio: "M4.9 19.1a10 10 0 1 1 14.2 0l-1.4-1.4a8 8 0 1 0-11.4 0l-1.4 1.4Zm2.8-2.8a6 6 0 1 1 8.6 0l-1.5-1.5a4 4 0 1 0-5.6 0l-1.5 1.5ZM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z",
    history: "M12 8v5l4 2 .8-1.8-2.8-1.4V8h-2ZM4 4v5h5L7 7a7 7 0 1 1-1.8 6.7H3.1A9 9 0 1 0 9 3.5L6.5 1 4 3.5V4Z",
    upload: "M12 3l5 5h-3v6h-4V8H7l5-5Zm-7 13h2v3h10v-3h2v5H5v-5Z",
    play: "M8 5v14l11-7L8 5Z",
    fish: "M3 12s3.5-5 9-5c3.2 0 5.7 1.5 8 5-2.3 3.5-4.8 5-8 5-5.5 0-9-5-9-5Zm15.5 0 2.5-2.5v5L18.5 12ZM8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
    alert: "M12 3 2 21h20L12 3Zm1 14h-2v2h2v-2Zm0-7h-2v5h2v-5Z",
  };

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

function StatCard({ label, value, note, icon, color }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={classNames("grid h-11 w-11 place-items-center rounded-lg text-white", color)}>
          <Icon name={icon} />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function SpeciesCard({ item, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={classNames(
        "w-full rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        selected?.id === item.id ? "border-ocean ring-2 ring-sky-100" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{item.species}</p>
          <p className="mt-1 text-sm text-slate-500">{item.common}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
          {Math.round(item.confidence * 100)}%
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{item.status}</span>
        <span>{item.timestamp}</span>
      </div>
    </button>
  );
}

function UploadPanel({ onDetections }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Ready for MP4, AVI, MOV, or a single image.");

  async function detectVideo() {
    if (!file) {
      setMessage("Choose a video or image first.");
      return;
    }

    setBusy(true);
    setMessage("Sending media to FastAPI microservice...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const isImage = file.type.startsWith("image/");
      const endpoint = isImage ? "/detect/image" : "/detect/video";
      const { data } = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: isImage ? 12000 : 0, // video runs synchronously server-side and can take minutes
      });
      const detections = isImage ? data.detections : dedupeByTrack(data.detections);
      onDetections(normalizeDetections(detections));
      setMessage("Detection completed by microservice.");
    } catch {
      onDetections(speciesSamples);
      setMessage("Microservice not reachable, showing realistic demo detections.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="Video" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Video Or Image Detection</h2>
          <p className="text-sm text-slate-500">Upload media and send it to /detect/video or /detect/image.</p>
        </div>
        <button
          type="button"
          onClick={detectVideo}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="upload" className="h-4 w-4" />
          {busy ? "Processing" : "Run Detection"}
        </button>
      </div>

      <label className="mt-5 grid min-h-48 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-sky-200 bg-sky-50/60 p-6 text-center transition hover:border-ocean hover:bg-sky-50">
        <input
          type="file"
          accept="video/*,image/*"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-white text-ocean shadow-sm">
            <Icon name="upload" />
          </div>
          <p className="mt-3 font-semibold text-slate-950">{file ? file.name : "Drop video here or browse files"}</p>
          <p className="mt-1 text-sm text-slate-500">Supported: MP4, AVI, MOV, JPG, PNG</p>
        </div>
      </label>

      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </section>
  );
}

function LiveCamera({ onDetections }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState("Camera inactive.");

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
      setStatus("Camera connected. Capture a frame to detect.");
    } catch {
      setStatus("Camera access failed or was blocked by the browser.");
    }
  }

  async function captureFrame() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "camera-frame.jpg");

      try {
        const { data } = await api.post("/detect/frame", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onDetections(normalizeDetections(data));
        setStatus("Frame detected by microservice.");
      } catch {
        onDetections(speciesSamples.slice(0, 2));
        setStatus("Microservice not reachable, showing demo frame detections.");
      }
    }, "image/jpeg", 0.9);
  }

  return (
    <section id="Live Camera" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Device Webcam</h2>
          <p className="text-sm text-slate-500">Uses getUserMedia, then posts frames to /detect/frame.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Icon name="camera" className="h-4 w-4" />
            Start
          </button>
          <button
            type="button"
            onClick={captureFrame}
            disabled={!streaming}
            className="inline-flex items-center gap-2 rounded-md bg-reef px-3 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="play" className="h-4 w-4" />
            Detect
          </button>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-lg bg-slate-950">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-3 text-sm text-slate-500">{status}</p>
    </section>
  );
}

function UnderwaterStream({ onDetections }) {
  const [url, setUrl] = useState("rtsp://camera-ip:554/live");
  const [status, setStatus] = useState("Waiting for RTSP stream URL.");
  const [connected, setConnected] = useState(false);

  async function connectStream() {
    setStatus("Connecting to underwater camera stream...");
    try {
      const { data } = await api.post("/detect/stream", { rtsp_url: url });
      onDetections(normalizeDetections(data));
      setConnected(true);
      setStatus("RTSP stream connected through backend.");
    } catch {
      onDetections(speciesSamples);
      setConnected(true);
      setStatus("Microservice not reachable, previewing demo underwater detections.");
    }
  }

  return (
    <section id="Underwater" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Underwater RTSP Camera</h2>
          <p className="text-sm text-slate-500">Backend reads the stream with OpenCV and YOLO.</p>
        </div>
        <button
          type="button"
          onClick={connectStream}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-abyss px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Icon name="radio" className="h-4 w-4" />
          Connect
        </button>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-ocean/20 transition focus:border-ocean focus:ring-4"
          placeholder="rtsp://camera-ip:554/live"
        />
        <span className={classNames("rounded-md px-3 py-2 text-sm font-semibold", connected ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600")}>
          {connected ? "Active stream" : "Offline"}
        </span>
      </div>
      <div className="video-placeholder mt-5 min-h-60 rounded-lg p-4">
        <div className="flex h-full min-h-52 items-end">
          <div className="rounded-lg bg-slate-950/72 p-4 text-white backdrop-blur">
            <p className="text-sm font-semibold">Live detection overlay</p>
            <p className="mt-1 text-xs text-slate-200">{status}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetectionTable({ detections, onSelect }) {
  return (
    <section id="History" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Detection History</h2>
          <p className="text-sm text-slate-500">Latest species returned by the AI microservice.</p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">{detections.length} records</span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-4 font-semibold">Species</th>
              <th className="py-3 pr-4 font-semibold">Scientific Name</th>
              <th className="py-3 pr-4 font-semibold">Confidence</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Timestamp</th>
              <th className="py-3 pr-4 font-semibold">BBox</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                <td className="py-3 pr-4 font-medium text-slate-950">
                  <button type="button" onClick={() => onSelect(item)} className="text-left hover:text-ocean">
                    {item.common}
                  </button>
                </td>
                <td className="py-3 pr-4 italic">{item.species}</td>
                <td className="py-3 pr-4">{Math.round(item.confidence * 100)}%</td>
                <td className="py-3 pr-4">{item.status}</td>
                <td className="py-3 pr-4">{item.timestamp}</td>
                <td className="py-3 pr-4 font-mono text-xs">[{item.bbox.join(", ")}]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetectionModal({ detection, onClose }) {
  if (!detection) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{detection.species}</h2>
            <p className="mt-1 text-sm text-slate-500">{detection.common}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Close modal">
            X
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Detail label="Type" value={detection.type} />
          <Detail label="Status" value={detection.status} />
          <Detail label="Confidence" value={`${Math.round(detection.confidence * 100)}%`} />
          <Detail label="Detected" value={detection.timestamp} />
          <Detail label="Tracking ID" value={`TRK-${String(detection.id).padStart(3, "0")}`} />
          <Detail label="Bounding Box" value={`[${detection.bbox.join(", ")}]`} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [detections, setDetections] = useState(speciesSamples);
  const [selected, setSelected] = useState(speciesSamples[0]);
  const [modal, setModal] = useState(null);

  const stats = useMemo(() => {
    const avg = detections.reduce((sum, item) => sum + item.confidence, 0) / Math.max(detections.length, 1);
    return [
      { label: "Species Detected", value: "245", note: `${detections.length} shown in current batch`, icon: "fish", color: "bg-ocean" },
      { label: "Active Streams", value: "3", note: "Webcam, RTSP, upload queue", icon: "radio", color: "bg-reef" },
      { label: "Today's Detections", value: "84", note: "Updated from microservice history", icon: "history", color: "bg-coral" },
      { label: "Average Confidence", value: `${Math.round(avg * 100)}%`, note: "Across current detection batch", icon: "dashboard", color: "bg-abyss" },
    ];
  }, [detections]);

  function jumpTo(section) {
    setActive(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setDetectionBatch(items) {
    setDetections(items);
    setSelected(items[0]);
  }

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-abyss text-white">
              <Icon name="fish" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950 sm:text-base">MARINE BIODIVERSITY DETECTION SYSTEM</p>
              <p className="hidden text-xs text-slate-500 sm:block">React + Tailwind + axios interface for YOLO microservice</p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => jumpTo(item)}
                className={classNames(
                  "rounded-md px-3 py-2 text-sm font-semibold transition",
                  active === item ? "bg-sky-50 text-ocean" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section id="Dashboard" className="ocean-photo">
          <div className="mx-auto grid min-h-[430px] max-w-7xl content-end px-4 py-10 sm:px-6 lg:px-8">
            <div className="max-w-3xl pb-4 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">AI-powered marine species detection</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Real-time monitoring of underwater biodiversity</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100">
                Upload video, detect from a device webcam, or connect an underwater RTSP camera to a FastAPI YOLO microservice.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => jumpTo("Video")} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100">
                  <Icon name="upload" className="h-4 w-4" />
                  Upload Media
                </button>
                <button type="button" onClick={() => jumpTo("Live Camera")} className="inline-flex items-center gap-2 rounded-md border border-white/50 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
                  <Icon name="camera" className="h-4 w-4" />
                  Use Camera
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="subtle-grid">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8">
            <aside className="hidden lg:block">
              <div className="sticky top-20 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                {navItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => jumpTo(item)}
                    className={classNames(
                      "mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition last:mb-0",
                      active === item ? "bg-sky-50 text-ocean" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    )}
                  >
                    <Icon name={item === "Dashboard" ? "dashboard" : item === "Video" ? "video" : item === "Live Camera" ? "camera" : item === "Underwater" ? "radio" : "history"} className="h-4 w-4" />
                    {item}
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <StatCard key={item.label} {...item} />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
                <div className="space-y-6">
                  <UploadPanel onDetections={setDetectionBatch} />
                  <LiveCamera onDetections={setDetectionBatch} />
                  <UnderwaterStream onDetections={setDetectionBatch} />
                </div>
                <aside className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-950">Detection Results</h2>
                      <Icon name="fish" className="h-5 w-5 text-ocean" />
                    </div>
                    <div className="mt-4 space-y-3">
                      {detections.map((item) => (
                        <SpeciesCard
                          key={item.id}
                          item={item}
                          selected={selected}
                          onClick={(next) => {
                            setSelected(next);
                            setModal(next);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <div className="flex gap-3">
                      <Icon name="alert" className="mt-0.5 h-5 w-5 flex-none" />
                      <p className="text-sm">
                        API calls are wired to http://localhost:8000. Start your FastAPI YOLO service there to replace demo detections with real results.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <DetectionTable detections={detections} onSelect={setModal} />
            </div>
          </div>
        </section>
      </main>

      <DetectionModal detection={modal} onClose={() => setModal(null)} />
    </div>
  );
}
