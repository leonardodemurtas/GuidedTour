import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Map,
  Eye,
  LayoutList,
} from "lucide-react";
import journeyMapImage from "./assets/journey-map-1.svg";
import flowDefinitionImage from "./assets/journey-map-2.svg";

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm hover:bg-neutral-50 active:translate-y-[1px]"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#49695B] px-5 py-3 text-sm font-medium text-white shadow-sm hover:opacity-95 active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}

const BOARD_CONFIG = {
  journey: {
    id: "journey",
    title: "Journey map (guided)",
    description: "Blueprint with phases, roles, and line of visibility.",
    image: journeyMapImage,
    steps: [
      {
        id: "s1",
        title: "Blueprint structure",
        body: "Phases, roles, and the line of visibility.",
        center: { x: 0.12, y: 0.16 },
        zoom: 1.4,
      },
      {
        id: "s2",
        title: "Assess the case",
        body: "Analysis outputs: entity info, symptoms, and signals.",
        center: { x: 0.18, y: 0.3 },
        zoom: 2.1,
      },
      {
        id: "s3",
        title: "Choose a strategy",
        body: "Decision plus rationale captured as evidence.",
        center: { x: 0.3, y: 0.3 },
        zoom: 2.1,
      },
      {
        id: "s4",
        title: "Prioritize root causes",
        body: "Select two main drivers, then drill into causes.",
        center: { x: 0.47, y: 0.3 },
        zoom: 2.0,
      },
      {
        id: "s5",
        title: "Constraints and checks",
        body: "Covenants/guarantees, attachments, and always-on preview.",
        center: { x: 0.74, y: 0.28 },
        zoom: 2.0,
      },
      {
        id: "s6",
        title: "Produce the deliverable",
        body: "Assemble the delibera, review, iterate, then submit.",
        center: { x: 0.9, y: 0.33 },
        zoom: 2.1,
      },
    ],
  },
  flow: {
    id: "flow",
    title: "Flow definition",
    description: "Strategy selection to document production flow.",
    image: flowDefinitionImage,
    steps: [
      {
        id: "f1",
        title: "Scelta strategia",
        body: "Start from the strategy decision and branch paths.",
        center: { x: 0.12, y: 0.55 },
        zoom: 1.8,
      },
      {
        id: "f2",
        title: "Modalità di azione",
        body: "Focus on negotiation or legal instruments.",
        center: { x: 0.45, y: 0.48 },
        zoom: 2.0,
      },
      {
        id: "f3",
        title: "Risultato atteso",
        body: "Expected outcomes and key risks captured.",
        center: { x: 0.63, y: 0.58 },
        zoom: 2.0,
      },
      {
        id: "f4",
        title: "Soluzione alternativa",
        body: "Compare alternatives before producing the document.",
        center: { x: 0.78, y: 0.42 },
        zoom: 1.7,
      },
    ],
  },
};

function TourViewer({ open, onClose, board }) {
  const steps = useMemo(() => board.steps, [board.steps]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showRail, setShowRail] = useState(true);

  const [stageRef, stageSize] = useElementSize();
  const imgRef = useRef(null);
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });

  const [zoom, setZoom] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const fitScale = useMemo(() => {
    const { width: cw, height: ch } = stageSize;
    const { w, h } = imgNatural;
    if (!cw || !ch || !w || !h) return 1;
    return Math.min(cw / w, ch / h);
  }, [stageSize, imgNatural]);

  const effectiveScale = fitScale * zoom;

  const activeStep = steps[activeIndex];

  const goToStep = (index) => {
    const step = steps[index];
    if (!step) return;

    const { width: cw, height: ch } = stageSize;
    const { w, h } = imgNatural;
    if (!cw || !ch || !w || !h) return;

    const nextZoom = step.zoom;
    const nextScale = fitScale * nextZoom;

    const cx = step.center.x * w;
    const cy = step.center.y * h;

    const nextTx = cw / 2 - cx * nextScale;
    const nextTy = ch / 2 - cy * nextScale;

    setZoom(nextZoom);
    setTx(nextTx);
    setTy(nextTy);
  };

  const fitToView = () => {
    const { width: cw, height: ch } = stageSize;
    const { w, h } = imgNatural;
    if (!cw || !ch || !w || !h) return;

    setZoom(1);
    const s = fitScale;
    setTx(cw / 2 - (w * s) / 2);
    setTy(ch / 2 - (h * s) / 2);
  };

  const resetTour = () => {
    setActiveIndex(0);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      fitToView();
      goToStep(activeIndex);
    }, 40);
    return () => clearTimeout(t);
  }, [open, stageSize.width, stageSize.height, imgNatural.w, imgNatural.h]);

  useEffect(() => {
    if (!open) return;
    goToStep(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [board.id, open]);

  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
  });

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startTx: tx,
      startTy: ty,
    };
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setTx(drag.current.startTx + dx);
    setTy(drag.current.startTy + dy);
  };

  const onPointerUp = () => {
    drag.current.active = false;
  };

  const onWheel = (e) => {
    e.preventDefault();
    const { width: cw, height: ch } = stageSize;
    const { w, h } = imgNatural;
    if (!cw || !ch || !w || !h) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const ix = (px - tx) / effectiveScale;
    const iy = (py - ty) / effectiveScale;

    const dir = e.deltaY > 0 ? -1 : 1;
    const factor = dir > 0 ? 1.12 : 0.9;
    const nextZoom = clamp(zoom * factor, 0.9, 4);
    const nextScale = fitScale * nextZoom;

    const nextTx = px - ix * nextScale;
    const nextTy = py - iy * nextScale;

    setZoom(nextZoom);
    setTx(nextTx);
    setTy(nextTy);
  };

  const zoomIn = () => setZoom((z) => clamp(z * 1.15, 0.9, 4));
  const zoomOut = () => setZoom((z) => clamp(z * 0.87, 0.9, 4));

  const spotlight = useMemo(() => {
    const { width: cw, height: ch } = stageSize;
    const { w, h } = imgNatural;
    if (!cw || !ch || !w || !h) return null;

    const cxImg = activeStep.center.x * w;
    const cyImg = activeStep.center.y * h;

    const cx = cxImg * effectiveScale + tx;
    const cy = cyImg * effectiveScale + ty;

    const r = Math.max(110, Math.min(cw, ch) * 0.22);
    return { cx, cy, r };
  }, [stageSize, imgNatural, activeStep, effectiveScale, tx, ty]);

  const next = () => setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal
          role="dialog"
        >
          <motion.div
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ y: 12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Map className="h-4 w-4" />
                  <span>{board.title}</span>
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-900">
                  Make the work visible
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  {steps.length} highlights. Scan the workflow in under a minute.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRail((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm hover:bg-neutral-50"
                >
                  {showRail ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <LayoutList className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {showRail ? "Open full board" : "Show tour"}
                  </span>
                </button>

                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid h-[70vh] min-h-[520px] grid-cols-1 md:grid-cols-[1fr_380px]">
              <div className="relative border-r border-neutral-200 bg-neutral-50">
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  <IconButton label="Zoom in" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Zoom out" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Fit" onClick={fitToView}>
                    <Maximize2 className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Reset tour" onClick={resetTour}>
                    <RotateCcw className="h-4 w-4" />
                  </IconButton>
                </div>

                <div
                  ref={stageRef}
                  className="absolute inset-0 overflow-hidden"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onWheel={onWheel}
                  style={{ cursor: drag.current.active ? "grabbing" : "grab" }}
                >
                  <motion.div
                    className="absolute left-0 top-0 will-change-transform"
                    animate={{ x: tx, y: ty, scale: effectiveScale }}
                    transition={{ type: "spring", stiffness: 240, damping: 28 }}
                    style={{ transformOrigin: "top left" }}
                  >
                    <img
                      ref={imgRef}
                      src={board.image}
                      alt={board.title}
                      className="select-none"
                      draggable={false}
                      onLoad={(e) => {
                        const el = e.currentTarget;
                        setImgNatural({ w: el.naturalWidth || 1, h: el.naturalHeight || 1 });
                      }}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {showRail && spotlight && (
                      <motion.div
                        className="pointer-events-none absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          background: "rgba(0,0,0,0.45)",
                          WebkitMaskImage: `radial-gradient(circle at ${spotlight.cx}px ${spotlight.cy}px, transparent 0px, transparent ${spotlight.r}px, black ${spotlight.r + 2}px)` ,
                          maskImage: `radial-gradient(circle at ${spotlight.cx}px ${spotlight.cy}px, transparent 0px, transparent ${spotlight.r}px, black ${spotlight.r + 2}px)` ,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {showRail && spotlight && (
                    <motion.div
                      className="pointer-events-none absolute"
                      style={{ left: spotlight.cx - 14, top: spotlight.cy - 14 }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B2C7AD] text-xs font-semibold text-neutral-900 shadow-sm">
                        {activeIndex + 1}
                      </div>
                    </motion.div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
                    <div className="rounded-2xl border border-neutral-200 bg-white/90 px-3 py-2 text-xs text-neutral-600 shadow-sm backdrop-blur">
                      Drag to pan. Scroll to zoom.
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prev}
                        disabled={activeIndex === 0}
                        className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </button>
                      <button
                        onClick={next}
                        disabled={activeIndex === steps.length - 1}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#49695B] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <AnimatePresence mode="wait">
                  {showRail ? (
                    <motion.div
                      key="rail"
                      className="flex h-full flex-col"
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 16, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-b border-neutral-200 px-5 py-4">
                        <div className="text-sm font-semibold text-neutral-900">Guided tour</div>
                        <div className="mt-1 text-sm text-neutral-600">
                          Click a step to jump. The viewer will pan and zoom automatically.
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto p-3">
                        <div className="space-y-2">
                          {steps.map((s, idx) => {
                            const active = idx === activeIndex;
                            return (
                              <button
                                key={s.id}
                                onClick={() => setActiveIndex(idx)}
                                className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                                  active
                                    ? "border-[#B2C7AD] bg-[#B2C7AD]/20"
                                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                      active
                                        ? "bg-[#B2C7AD] text-neutral-900"
                                        : "bg-neutral-100 text-neutral-700"
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-neutral-900">
                                      {s.title}
                                    </div>
                                    <div className="mt-1 text-sm text-neutral-600">
                                      {s.body}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-neutral-200 px-5 py-4">
                        <div className="text-sm font-semibold text-neutral-900">
                          Current highlight
                        </div>
                        <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4">
                          <div className="text-sm font-semibold text-neutral-900">
                            {activeStep.title}
                          </div>
                          <div className="mt-1 text-sm text-neutral-600">{activeStep.body}</div>
                          <div className="mt-3 text-xs text-neutral-500">
                            Tip: you can still pan/zoom manually, then click a step to re-center.
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="full"
                      className="flex h-full flex-col"
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 16, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-b border-neutral-200 px-5 py-4">
                        <div className="text-sm font-semibold text-neutral-900">Full board</div>
                        <div className="mt-1 text-sm text-neutral-600">
                          Pan and zoom freely. Re-open the tour anytime.
                        </div>
                      </div>
                      <div className="flex-1 p-5">
                        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700">
                          Use this mode when you want to inspect the entire board without guidance.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GuidedTourPreview() {
  const [open, setOpen] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState("journey");

  const activeBoard = BOARD_CONFIG[activeBoardId];

  const openBoard = (id) => {
    setActiveBoardId(id);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-neutral-500">CPM</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Make the work visible
          </h1>
          <p className="mt-4 text-base text-neutral-700">
            I mapped the end-to-end user journeys to make the workflow visible, align the team on
            what “done” means, and define MVP scope and priorities.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={() => openBoard("journey")}> 
              <Map className="h-4 w-4" />
              View journey map (guided)
            </PrimaryButton>
            <SecondaryButton onClick={() => openBoard("flow")}> 
              <Eye className="h-4 w-4" />
              Open flow definition
            </SecondaryButton>
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="text-sm font-semibold text-neutral-900">How it works</div>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li>• Pick a board to open the full-screen viewer.</li>
              <li>• The right rail lists highlights (your narrative).</li>
              <li>• Clicking a highlight pans/zooms the board and spotlights the area.</li>
              <li>• Toggle “Open full board” to inspect without guidance.</li>
            </ul>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Object.values(BOARD_CONFIG).map((board) => (
              <button
                key={board.id}
                onClick={() => openBoard(board.id)}
                className="rounded-3xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-neutral-900">{board.title}</div>
                <div className="mt-1 text-sm text-neutral-600">{board.description}</div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                  <img src={board.image} alt={board.title} className="h-40 w-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <TourViewer open={open} onClose={() => setOpen(false)} board={activeBoard} />
    </div>
  );
}
