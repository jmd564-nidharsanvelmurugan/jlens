import React, { useState, useRef, useCallback, useMemo } from "react";
import html2canvas from 'html2canvas';

const COLORS = {
  navy: "#19105B",
  cyan: "#A8EEF9",
  pink: "#FE76A4",
  white: "#FFFFFF",
  lightGray: "#F2F2F2",
  medGray: "#E5E5E5",
  lavender: "#B1AEC6",
  slate: "#6F6B97",
};

const PHASE_COLORS = [
  "#4CAF50", "#2196F3", "#FF9800", "#9C27B0",
  "#F44336", "#00BCD4", "#FF5722", "#8BC34A",
];

const defaultPhases = [
  {
    id: 1,
    name: "Phase 1",
    color: PHASE_COLORS[0],
    tasks: [
      { id: 1, name: "Task 1", start: 3, end: 10 },
      { id: 2, name: "Task 2", start: 12, end: 20 },
    ],
  },
];

const GRANULARITY_MAX = { days: 31, weeks: 52, months: 12 };

function dayToUnit(day, unit) {
  if (unit === "days") return day;
  if (unit === "weeks") return Math.max(1, Math.round(day / 7));
  return Math.max(1, Math.round(day / 30.4));
}

function unitToDay(value, unit) {
  if (unit === "days") return value;
  if (unit === "weeks") return Math.min(31, Math.max(1, Math.round(value * 7)));
  return Math.min(31, Math.max(1, Math.round(value * 30.4)));
}

let idCounter = 1000;
const nextId = () => ++idCounter;

export default function GanttChart() {
  const [phases, setPhases] = useState(defaultPhases);
  const [granularity, setGranularity] = useState("days");
  const [darkMode, setDarkMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef(null);

  const maxUnit = GRANULARITY_MAX[granularity];

  const phaseRanges = useMemo(() => {
    const map = {};
    phases.forEach((p) => {
      if (p.tasks.length === 0) { map[p.id] = null; return; }
      const minStart = Math.min(...p.tasks.map((t) => t.start));
      const maxEnd = Math.max(...p.tasks.map((t) => t.end));
      map[p.id] = { minStart, maxEnd };
    });
    return map;
  }, [phases]);

  const handleGranularityChange = (newUnit) => {
    if (newUnit === granularity) return;
    setGranularity(newUnit);
  };

  const updateTask = (phaseId, taskId, patch) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId ? p : {
          ...p,
          tasks: p.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
        }
      )
    );
  };

  const addTask = (phaseId) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId ? p : {
          ...p,
          tasks: [...p.tasks, { id: nextId(), name: `Task ${p.tasks.length + 1}`, start: 6, end: 18 }],
        }
      )
    );
  };

  const deleteTask = (phaseId, taskId) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase || phase.tasks.length <= 1) { alert("Each phase must keep at least one task."); return; }
    if (!window.confirm("Delete this task?")) return;
    setPhases((prev) =>
      prev.map((p) => p.id !== phaseId ? p : { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) })
    );
  };

  const renameTask = (phaseId, taskId, name) => updateTask(phaseId, taskId, { name });

  const addPhase = () => {
    setPhases((prev) => [
      ...prev,
      {
        id: nextId(),
        name: `Phase ${prev.length + 1}`,
        color: PHASE_COLORS[prev.length % PHASE_COLORS.length],
        tasks: [{ id: nextId(), name: "Task 1", start: 5, end: 15 }],
      },
    ]);
  };

  const deletePhase = (phaseId) => {
    if (phases.length <= 1) { alert("At least one phase must remain."); return; }
    if (!window.confirm("Delete this phase and all its tasks?")) return;
    setPhases((prev) => prev.filter((p) => p.id !== phaseId));
  };

  const renamePhase = (phaseId, name) => {
    setPhases((prev) => prev.map((p) => (p.id === phaseId ? { ...p, name } : p)));
  };

  /* ---------- export as image ---------- */
  const exportImage = async () => {
    const node = containerRef.current;
    if (!node) return;
    setExporting(true);

    const prev = {
      overflow: node.style.overflow,
      width: node.style.width,
      height: node.style.height,
      minWidth: node.style.minWidth,
    };

    try {
      node.style.overflow = "visible";
      node.style.minWidth = "unset";
      node.style.width = "max-content";
      node.style.height = "auto";

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const fullW = node.scrollWidth;
      const fullH = node.scrollHeight;

      node.style.width = fullW + "px";
      node.style.height = fullH + "px";

      await new Promise((r) => requestAnimationFrame(r));

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: darkMode ? "#0E0A33" : "#FFFFFF",
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: fullW,
        height: fullH,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        onclone: (_doc, clonedNode) => {
          // 1. Hide all buttons
          clonedNode.querySelectorAll("button").forEach((el) => {
            el.style.display = "none";
          });

          // 2. Replace every <input> with a styled <span> showing its current value
          clonedNode.querySelectorAll("input").forEach((input) => {
            const span = _doc.createElement("span");
            span.textContent = input.value;
            // Copy computed font styles so text looks identical
            span.style.cssText = [
              `font-size: ${input.style.fontSize || "inherit"}`,
              `font-weight: ${input.style.fontWeight || "inherit"}`,
              `color: ${darkMode ? "#F2F2F2" : "#19105B"}`,
              "display: inline-block",
              "background: transparent",
              "border: none",
              "padding: 0",
            ].join(";");
            // Preserve the computed width so layout doesn't shift
            span.style.width = window.getComputedStyle(input).width;
            input.parentNode.replaceChild(span, input);
          });
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "gantt-chart.png";
      a.click();
    } catch (err) {
      console.error("Image export failed:", err);
      alert("Sorry, the image export failed. Please try again.");
    } finally {
      node.style.overflow = prev.overflow;
      node.style.width = prev.width;
      node.style.height = prev.height;
      node.style.minWidth = prev.minWidth;
      setExporting(false);
    }
  };

  const exportJSON = () => {
    const data = JSON.stringify({ phases, granularity }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gantt-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const rootBg = darkMode ? "bg-[#0E0A33]" : "bg-white";
  const rootText = darkMode ? "text-[#F2F2F2]" : "text-[#19105B]";

  return (
    <div className={`min-h-screen w-full p-4 sm:p-6 ${rootBg} ${rootText} font-sans transition-colors`}>
      <Toolbar
        granularity={granularity}
        onGranularityChange={handleGranularityChange}
        onAddPhase={addPhase}
        onExportJSON={exportJSON}
        onExportImage={exportImage}
        exporting={exporting}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      <div
        ref={containerRef}
        className={`mt-4 rounded-xl border overflow-x-auto ${
          darkMode ? "border-[#6F6B97] bg-[#150F47]" : "border-[#E5E5E5] bg-white"
        }`}
      >
        <TimelineHeader maxUnit={maxUnit} granularity={granularity} darkMode={darkMode} />

        {phases.map((phase, pIdx) => (
          <PhaseRow
            key={phase.id}
            phase={phase}
            phaseIndex={pIdx}
            range={phaseRanges[phase.id]}
            granularity={granularity}
            maxUnit={maxUnit}
            darkMode={darkMode}
            onRenamePhase={renamePhase}
            onDeletePhase={deletePhase}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onRenameTask={renameTask}
            onUpdateTask={updateTask}
          />
        ))}
      </div>

      <p className={`mt-3 text-xs ${darkMode ? "text-[#B1AEC6]" : "text-[#6F6B97]"}`}>
        Drag a bar's edges to resize, or drag its middle to move it. Values stay in sync with the inputs.
      </p>
    </div>
  );
}

function Toolbar({ granularity, onGranularityChange, onAddPhase, onExportJSON, onExportImage, exporting, darkMode, onToggleDark }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl p-4 ${darkMode ? "bg-[#150F47]" : "bg-[#19105B]"}`}>
      <h1 className="text-white font-semibold text-lg mr-auto">Project Timeline</h1>

      <select
        value={granularity}
        onChange={(e) => onGranularityChange(e.target.value)}
        className="rounded-md px-3 py-1.5 text-sm font-medium bg-white text-[#19105B] border border-[#B1AEC6] focus:outline-none focus:ring-2 focus:ring-[#A8EEF9]"
      >
        <option value="days">Days</option>
        <option value="weeks">Weeks</option>
        <option value="months">Months</option>
      </select>

      <button onClick={onAddPhase} className="rounded-md px-3 py-1.5 text-sm font-medium bg-[#FE76A4] text-[#19105B] hover:brightness-95 transition">
        + Add Phase
      </button>

      <button onClick={onExportImage} disabled={exporting} className="rounded-md px-3 py-1.5 text-sm font-medium bg-[#A8EEF9] text-[#19105B] hover:brightness-95 transition disabled:opacity-60 disabled:cursor-wait">
        {exporting ? "Rendering…" : "📸 Save as Image"}
      </button>

      <button onClick={onExportJSON} className="rounded-md px-3 py-1.5 text-sm font-medium bg-[#A8EEF9] text-[#19105B] hover:brightness-95 transition">
        💾 Export Data
      </button>

      <button onClick={onToggleDark} className="rounded-md px-3 py-1.5 text-sm font-medium bg-white/10 text-white border border-white/30 hover:bg-white/20 transition">
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}

function TimelineHeader({ maxUnit, granularity, darkMode }) {
  const unitLabel = granularity === "days" ? "Day" : granularity === "weeks" ? "Wk" : "Mo";
  const step = maxUnit <= 12 ? 1 : maxUnit <= 31 ? 2 : 4;
  const ticks = [];
  for (let i = 1; i <= maxUnit; i += step) ticks.push(i);

  return (
    <div className="flex sticky top-0 z-10">
      <div className="w-48 shrink-0 px-3 py-2 text-xs font-semibold bg-[#19105B] text-white">
        Phase / Task
      </div>
      <div className="relative flex-1 min-w-[600px] bg-[#19105B]">
        <div className="relative h-8">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 h-full flex flex-col items-start justify-center text-[10px] text-[#A8EEF9] border-l border-[#6F6B97]/50 pl-1"
              style={{ left: `${((t - 1) / maxUnit) * 100}%` }}
            >
              {unitLabel} {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseRow({ phase, phaseIndex, range, granularity, maxUnit, darkMode, onRenamePhase, onDeletePhase, onAddTask, onDeleteTask, onRenameTask, onUpdateTask }) {
  const color = phase.color || PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
  const rangeLabel = range && `Phase Gantt: ${dayToUnit(range.minStart, granularity)} → ${dayToUnit(range.maxEnd, granularity)}`;

  return (
    <div className={`border-t ${darkMode ? "border-[#6F6B97]/40" : "border-[#E5E5E5]"}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${darkMode ? "bg-[#1C1660]" : "bg-[#F2F2F2]"}`}>
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
        <EditableText
          value={phase.name}
          onChange={(v) => onRenamePhase(phase.id, v)}
          className={`font-semibold text-sm bg-transparent border-b border-dashed border-transparent focus:border-[#6F6B97] outline-none ${darkMode ? "text-white" : "text-[#19105B]"}`}
        />
        {rangeLabel && (
          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: COLORS.pink, color: COLORS.navy }}>
            {rangeLabel}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => onAddTask(phase.id)} className="text-xs px-2 py-1 rounded bg-[#A8EEF9] text-[#19105B] hover:brightness-95">
            + Task
          </button>
          <button onClick={() => onDeletePhase(phase.id)} className="text-xs px-2 py-1 rounded bg-[#FE76A4] text-[#19105B] hover:brightness-95">
            Delete Phase
          </button>
        </div>
      </div>

      {phase.tasks.map((task, i) => (
        <TaskRow
          key={task.id}
          task={task}
          rowIndex={i}
          color={color}
          granularity={granularity}
          maxUnit={maxUnit}
          darkMode={darkMode}
          onDelete={() => onDeleteTask(phase.id, task.id)}
          onRename={(name) => onRenameTask(phase.id, task.id, name)}
          onUpdate={(patch) => onUpdateTask(phase.id, task.id, patch)}
        />
      ))}
    </div>
  );
}

function EditableText({ value, onChange, className }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{ width: `${Math.max(6, value.length + 1)}ch` }}
    />
  );
}

function TaskRow({ task, rowIndex, color, granularity, maxUnit, darkMode, onDelete, onRename, onUpdate }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const dispStart = dayToUnit(task.start, granularity);
  const dispEnd = dayToUnit(task.end, granularity);

  const startInputRange = granularity === "days" ? [1, 30] : [1, maxUnit - 1];
  const endInputRange = granularity === "days" ? [2, 31] : [2, maxUnit];

  const dayFromClientX = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track) return null;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const unitVal = ratio * maxUnit + 1;
      return unitToDay(unitVal, granularity);
    },
    [maxUnit, granularity]
  );

  const startDrag = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);

    const startClientX = e.clientX;
    const origStart = task.start;
    const origEnd = task.end;

    const onMove = (ev) => {
      const day = dayFromClientX(ev.clientX);
      if (day == null) return;

      if (type === "left") {
        const newStart = Math.min(Math.max(1, day), origEnd - 1);
        onUpdate({ start: newStart });
      } else if (type === "right") {
        const newEnd = Math.max(Math.min(31, day), origStart + 1);
        onUpdate({ end: newEnd });
      } else if (type === "move") {
        const track = trackRef.current;
        const rect = track.getBoundingClientRect();
        const deltaPx = ev.clientX - startClientX;
        const deltaUnit = (deltaPx / rect.width) * maxUnit;
        const deltaDay =
          granularity === "days"
            ? Math.round(deltaUnit)
            : unitToDay(deltaUnit, granularity) - unitToDay(0, granularity);
        let newStart = origStart + deltaDay;
        let newEnd = origEnd + deltaDay;
        if (newStart < 1) { newEnd += 1 - newStart; newStart = 1; }
        if (newEnd > 31) { newStart -= newEnd - 31; newEnd = 31; }
        onUpdate({ start: newStart, end: newEnd });
      }
    };

    const onUp = () => {
      setDragging(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleStartInput = (val) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    const newDay = unitToDay(num, granularity);
    if (newDay < task.end) onUpdate({ start: newDay });
  };

  const handleEndInput = (val) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    const newDay = unitToDay(num, granularity);
    if (newDay > task.start) onUpdate({ end: newDay });
  };

  const leftPct = ((task.start - 1) / 31) * 100;
  const widthPct = ((task.end - task.start) / 31) * 100;

  const rowBg = rowIndex % 2 === 0
    ? darkMode ? "bg-[#150F47]" : "bg-white"
    : darkMode ? "bg-[#1A1450]" : "bg-[#F2F2F2]";

  return (
    <div className={`flex items-center ${rowBg} border-t ${darkMode ? "border-[#6F6B97]/20" : "border-[#E5E5E5]"}`}>
      <div className="w-48 shrink-0 px-3 py-2 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <EditableText
            value={task.name}
            onChange={onRename}
            className={`text-xs font-medium bg-transparent border-b border-dashed border-transparent focus:border-[#6F6B97] outline-none ${darkMode ? "text-[#F2F2F2]" : "text-[#19105B]"}`}
          />
          <button
            onClick={onDelete}
            title="Delete task"
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#FE76A4]/80 text-[#19105B] hover:bg-[#FE76A4]"
          >
            ✕
          </button>
        </div>
        {/* Number inputs — shown in UI, replaced with text spans during export via onclone */}
        <div className="flex items-center gap-1 text-[10px]">
          <input
            type="number"
            value={dispStart}
            min={startInputRange[0]}
            max={startInputRange[1]}
            onChange={(e) => handleStartInput(e.target.value)}
            className={`w-12 rounded px-1 py-0.5 border ${darkMode ? "bg-[#0E0A33] border-[#6F6B97] text-white" : "bg-white border-[#B1AEC6] text-[#19105B]"}`}
          />
          <span className={darkMode ? "text-[#B1AEC6]" : "text-[#6F6B97]"}>→</span>
          <input
            type="number"
            value={dispEnd}
            min={endInputRange[0]}
            max={endInputRange[1]}
            onChange={(e) => handleEndInput(e.target.value)}
            className={`w-12 rounded px-1 py-0.5 border ${darkMode ? "bg-[#0E0A33] border-[#6F6B97] text-white" : "bg-white border-[#B1AEC6] text-[#19105B]"}`}
          />
        </div>
      </div>

      <div ref={trackRef} className="relative flex-1 min-w-[600px] h-12">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: maxUnit }).map((_, i) => (
            <div
              key={i}
              className={`absolute top-0 bottom-0 border-l ${darkMode ? "border-[#6F6B97]/15" : "border-[#E5E5E5]"}`}
              style={{ left: `${(i / maxUnit) * 100}%` }}
            />
          ))}
        </div>

        <div
          className="absolute top-2 bottom-2 rounded-md shadow-sm select-none flex items-center"
          style={{
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            backgroundColor: COLORS.cyan,
            border: `2px solid ${color}`,
            cursor: dragging === "move" ? "grabbing" : "grab",
            boxShadow: dragging ? "0 0 0 2px rgba(254,118,164,0.6)" : undefined,
          }}
          onMouseDown={(e) => startDrag("move", e)}
        >
          <div className="absolute left-0 top-0 h-full w-2 cursor-ew-resize" onMouseDown={(e) => startDrag("left", e)} />
          <div className="absolute right-0 top-0 h-full w-2 cursor-ew-resize" onMouseDown={(e) => startDrag("right", e)} />
          <span className="px-2 text-[10px] font-medium text-[#19105B] truncate pointer-events-none">
            {task.name}
          </span>
        </div>
      </div>
    </div>
  );
}