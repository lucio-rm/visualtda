import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  LectureInterval,
  DEFAULT_LECTURES,
  calculateIntervalDepth
} from '../../engine/algorithms/intervalPartitioningTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

interface InstancePreset {
  id: string;
  name: { es: string; en: string };
  lectures: LectureInterval[];
}

const PRESET_INSTANCES: InstancePreset[] = [
  {
    id: 'standard',
    name: { es: 'Instancia Estándar (d = 3)', en: 'Standard Instance (d = 3)' },
    lectures: DEFAULT_LECTURES
  },
  {
    id: 'bottleneck-4',
    name: { es: 'Cuello de Botella Matutino (d = 4)', en: 'Morning Bottleneck (d = 4)' },
    lectures: [
      { id: 'm1', name: 'Algoritmos I', start: 9, end: 11, color: '#38bdf8' },
      { id: 'm2', name: 'Sistemas Operativos', start: 9, end: 12, color: '#f59e0b' },
      { id: 'm3', name: 'Redes de Datos', start: 10, end: 13, color: '#10b981' },
      { id: 'm4', name: 'Bases de Datos', start: 10, end: 11.5, color: '#ec4899' },
      { id: 'm5', name: 'Probabilidad y Estadística', start: 12, end: 14, color: '#a855f7' },
      { id: 'm6', name: 'Taller de Programación', start: 14, end: 17, color: '#06b6d4' }
    ]
  },
  {
    id: 'sequential-1',
    name: { es: 'Secuencial Sin Solapamiento (d = 1)', en: 'Sequential No Overlap (d = 1)' },
    lectures: [
      { id: 's1', name: 'Clase Teórica A', start: 8, end: 10, color: '#38bdf8' },
      { id: 's2', name: 'Clase Práctica B', start: 10, end: 12, color: '#10b981' },
      { id: 's3', name: 'Laboratorio C', start: 13, end: 15, color: '#f59e0b' },
      { id: 's4', name: 'Seminario D', start: 15, end: 17.5, color: '#ec4899' }
    ]
  }
];

export const IntervalPartitioningPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [lectures, setLectures] = useState<LectureInterval[]>(DEFAULT_LECTURES);
  const [userAssignments, setUserAssignments] = useState<Record<string, number>>({});
  const [activePresetId, setActivePresetId] = useState<string>('standard');

  // Custom lecture inputs
  const [newName, setNewName] = useState('Taller Python');
  const [newStart, setNewStart] = useState(10);
  const [newEnd, setNewEnd] = useState(12);

  // Dragging state: dragging lecture block vertically (room) and horizontally (start/end)
  const [draggingLectureId, setDraggingLectureId] = useState<string | null>(null);
  const [dragOffsetTime, setDragOffsetTime] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const depth = useMemo(() => calculateIntervalDepth(lectures), [lectures]);

  // Find the exact bottleneck timestamp t* where depth is maximized
  const bottleneckInfo = useMemo(() => {
    const times = new Set<number>();
    for (const l of lectures) {
      times.add(l.start);
      times.add(l.start + 0.1);
    }
    let maxCount = 0;
    let bottleneckTime = 10;
    for (const t of times) {
      let count = 0;
      for (const l of lectures) {
        if (l.start <= t && t < l.end) count++;
      }
      if (count > maxCount) {
        maxCount = count;
        bottleneckTime = t;
      }
    }
    return { time: bottleneckTime, depth: maxCount };
  }, [lectures]);

  // Group lectures by assigned classroom
  const classrooms: Record<number, LectureInterval[]> = {};
  for (const lec of lectures) {
    const roomId = userAssignments[lec.id] ?? 1;
    if (!classrooms[roomId]) classrooms[roomId] = [];
    classrooms[roomId].push(lec);
  }

  // Detect conflicts: two lectures in the same room overlapping in time
  const conflicts: Array<{ room: number; lec1: string; lec2: string }> = [];
  const conflictingLectureIds = new Set<string>();

  for (const [rId, list] of Object.entries(classrooms)) {
    const roomNum = Number(rId);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
          conflicts.push({ room: roomNum, lec1: a.name, lec2: b.name });
          conflictingLectureIds.add(a.id);
          conflictingLectureIds.add(b.id);
        }
      }
    }
  }

  const assignedRooms = new Set(Object.values(userAssignments));
  // If some lectures unassigned, they default to room 1
  if (lectures.some((l) => userAssignments[l.id] === undefined)) {
    assignedRooms.add(1);
  }
  const assignedRoomsCount = assignedRooms.size;
  const isOptimalValid = conflicts.length === 0 && assignedRoomsCount <= depth;

  const handleAssign = (lectureId: string, roomId: number) => {
    const next = { ...userAssignments, [lectureId]: roomId };
    setUserAssignments(next);

    const nextRooms = new Set(Object.values(next));
    if (conflicts.length === 0 && nextRooms.size <= depth) {
      markAttempted('interval-partitioning-greedy');
    }
  };

  const handleCycleRoom = (lectureId: string) => {
    const curr = userAssignments[lectureId] ?? 1;
    const next = (curr % 5) + 1;
    handleAssign(lectureId, next);
  };

  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStart >= newEnd) return;
    const newLec: LectureInterval = {
      id: `custom-${Date.now()}`,
      name: newName || 'Clase',
      start: newStart,
      end: newEnd,
      color: '#38bdf8'
    };
    setLectures([...lectures, newLec]);
    setActivePresetId('custom');
  };

  const handleRemoveLecture = (lectureId: string) => {
    if (lectures.length <= 1) return;
    setLectures(lectures.filter((l) => l.id !== lectureId));
    const next = { ...userAssignments };
    delete next[lectureId];
    setUserAssignments(next);
  };



  const handleSelectPreset = (preset: InstancePreset) => {
    setActivePresetId(preset.id);
    setLectures(preset.lectures);
    setUserAssignments({});
  };

  // SVG coordinate conversions
  const minHour = 8;
  const maxHour = 18;
  const svgWidth = 560;
  const marginLeft = 60;
  const marginRight = 20;
  const marginTop = 30;
  const rowHeight = 36;
  const numRooms = 5;
  const svgHeight = marginTop + numRooms * rowHeight + 15;
  const chartWidth = svgWidth - marginLeft - marginRight;

  const timeToX = (t: number) => marginLeft + ((t - minHour) / (maxHour - minHour)) * chartWidth;
  const xToTime = (x: number) => minHour + ((x - marginLeft) / chartWidth) * (maxHour - minHour);

  // Dragging event handlers
  const handlePointerDown = (lectureId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingLectureId(lectureId);

    const lec = lectures.find((l) => l.id === lectureId);
    if (lec && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const pointerX = ((e.clientX - rect.left) / rect.width) * svgWidth;
      const pointerTime = xToTime(pointerX);
      setDragOffsetTime(pointerTime - lec.start);
    }
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingLectureId || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * svgWidth;
      const rawY = ((e.clientY - rect.top) / rect.height) * svgHeight;

      // Determine target classroom row (1 to 5)
      const targetRoom = Math.max(
        1,
        Math.min(numRooms, Math.floor((rawY - marginTop) / rowHeight) + 1)
      );

      // Determine target start time snapped to 0.5 hour
      const rawTime = xToTime(rawX) - dragOffsetTime;
      const snappedStart = Math.max(minHour, Math.min(maxHour - 1, Math.round(rawTime * 2) / 2));

      // Update assignment
      setUserAssignments((prev) => ({
        ...prev,
        [draggingLectureId]: targetRoom
      }));

      // Update lecture start/end maintaining duration
      setLectures((prev) =>
        prev.map((l) => {
          if (l.id === draggingLectureId) {
            const duration = l.end - l.start;
            const newStartVal = Math.min(maxHour - duration, Math.max(minHour, snappedStart));
            return {
              ...l,
              start: newStartVal,
              end: Math.min(maxHour, newStartVal + duration)
            };
          }
          return l;
        })
      );
    },
    [draggingLectureId, dragOffsetTime, svgHeight]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingLectureId) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      setDraggingLectureId(null);
      if (conflicts.length === 0 && assignedRoomsCount <= depth) {
        markAttempted('interval-partitioning-greedy');
      }
    }
  };

  return (
    <div
      className="algorithm-playground interval-partitioning-playground"
      role="region"
      aria-label="Laboratorio de Partición de Intervalos"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Controls & Instance Presets */}
      <div className="sdk-pg-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRESET_INSTANCES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn-preset ${activePresetId === p.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p)}
              >
                {p.name[language]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-preset"
              onClick={() => setUserAssignments({})}
            >
              ↺ {language === 'es' ? 'Restablecer Asignaciones' : 'Reset Assignments'}
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--surface)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span>
              {language === 'es' ? 'Cota Mínima Teórica (Profundidad):' : 'Theoretical Minimum Bound (Depth):'}{' '}
              <strong style={{ color: 'var(--accent)' }}>d = {depth}</strong>
            </span>
            <span>
              {language === 'es' ? 'Aulas Asignadas:' : 'Classrooms Used:'}{' '}
              <strong style={{ color: assignedRoomsCount <= depth ? '#10b981' : '#f59e0b' }}>
                {assignedRoomsCount} / 5
              </strong>
            </span>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {language === 'es'
              ? 'Teorema: Ningún cronograma válido puede usar menos de d aulas.'
              : 'Theorem: No valid schedule can use fewer than d classrooms.'}
          </span>
        </div>
      </div>

      {/* Status banner */}
      {conflicts.length > 0 ? (
        <div
          className="sdk-conflict-banner"
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444'
          }}
        >
          <strong>{language === 'es' ? 'Conflicto de Horario Detectado' : 'Schedule Conflict'}:</strong>{' '}
          {language === 'es'
            ? `En Aula A${conflicts[0].room}, "${conflicts[0].lec1}" y "${conflicts[0].lec2}" se superponen en el tiempo. Arrastrá uno de los bloques a otra aula para subsanar el conflicto.`
            : `Classroom A${conflicts[0].room} has overlap between "${conflicts[0].lec1}" and "${conflicts[0].lec2}". Drag one block to another classroom.`}
        </div>
      ) : isOptimalValid ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            color: '#10b981',
            fontSize: '0.9rem'
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Configuración Óptima Alcanzada' : 'Optimal Configuration Reached'}</strong>:{' '}
          {language === 'es'
            ? `Todas las tareas fueron asignadas sin conflictos utilizando exactamente d = ${depth} aulas (cota mínima teórica demostrada por Kleinberg & Tardos).`
            : `All tasks assigned with zero conflicts using exactly d = ${depth} classrooms (theoretical minimum bound).`}
        </div>
      ) : (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem'
          }}
        >
          {language === 'es'
            ? `Sin conflictos, pero estás usando ${assignedRoomsCount} aulas. Podes compactar el cronograma en d = ${depth} aulas.`
            : `Zero conflicts, but using ${assignedRoomsCount} classrooms. You can pack into d = ${depth} classrooms.`}
        </div>
      )}

      {/* SVG Interactive Classroom Gantt Timeline with Drag and Drop */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          padding: '0.5rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem',
            padding: '0 0.5rem'
          }}
        >
          <span>
            {language === 'es'
              ? 'Arrastrá los rectángulos verticalmente para moverlos de aula, u horizontalmente para reprogramar sus horas.'
              : 'Drag rectangles vertically across classrooms or horizontally to reschedule.'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>8:00 → 18:00</span>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            maxWidth: '580px',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          aria-label={language === 'es' ? 'Cronograma interactivo con arrastre 2D' : 'Interactive schedule with 2D dragging'}
        >
          {/* Hour grid lines */}
          {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => {
            const x = timeToX(h);
            return (
              <g key={`grid-h-${h}`}>
                <line
                  x1={x}
                  y1={marginTop - 8}
                  x2={x}
                  y2={marginTop + numRooms * rowHeight}
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  strokeWidth={0.8}
                  opacity={0.5}
                />
                <text
                  x={x}
                  y={marginTop - 12}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="9px"
                  fontFamily="var(--font-mono)"
                >
                  {h}:00
                </text>
              </g>
            );
          })}

          {/* Classroom Tracks */}
          {[1, 2, 3, 4, 5].map((rNum) => {
            const rowY = marginTop + (rNum - 1) * rowHeight;
            const isBoundExceeded = rNum > depth;
            return (
              <g key={`room-track-${rNum}`}>
                {/* Track background */}
                <rect
                  x={marginLeft}
                  y={rowY}
                  width={chartWidth}
                  height={rowHeight - 4}
                  rx={4}
                  fill={isBoundExceeded ? 'rgba(239, 68, 68, 0.03)' : 'var(--surface)'}
                  stroke={isBoundExceeded ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}
                  strokeWidth={1}
                />
                {/* Room label */}
                <text
                  x={marginLeft - 10}
                  y={rowY + rowHeight / 2 + 1}
                  textAnchor="end"
                  fill={isBoundExceeded ? '#ef4444' : 'var(--text)'}
                  fontSize="11px"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  A{rNum}
                </text>
              </g>
            );
          })}

          {/* Bottleneck sweep-line at t* */}
          <line
            x1={timeToX(bottleneckInfo.time)}
            y1={marginTop - 8}
            x2={timeToX(bottleneckInfo.time)}
            y2={marginTop + numRooms * rowHeight}
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.8}
          />
          <text
            x={timeToX(bottleneckInfo.time)}
            y={marginTop + numRooms * rowHeight + 12}
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="8.5px"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {language === 'es' ? `Cuello de botella d = ${bottleneckInfo.depth}` : `Bottleneck d = ${bottleneckInfo.depth}`}
          </text>

          {/* Lecture Blocks with Drag & Drop */}
          {lectures.map((lec) => {
            const assignedRoom = userAssignments[lec.id] ?? 1;
            const rowY = marginTop + (assignedRoom - 1) * rowHeight;
            const x = timeToX(lec.start);
            const w = Math.max(12, timeToX(lec.end) - x);
            const isConflicted = conflictingLectureIds.has(lec.id);
            const isDragging = draggingLectureId === lec.id;

            return (
              <g
                key={`lec-rect-${lec.id}`}
                onPointerDown={(e) => handlePointerDown(lec.id, e)}
                onClick={() => handleCycleRoom(lec.id)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* Drag shadow */}
                {isDragging && (
                  <rect
                    x={x + 3}
                    y={rowY + 4}
                    width={w - 2}
                    height={rowHeight - 8}
                    rx={4}
                    fill="rgba(0, 0, 0, 0.25)"
                  />
                )}

                <rect
                  x={x + 1}
                  y={rowY + 2}
                  width={w - 2}
                  height={rowHeight - 8}
                  rx={4}
                  fill={isConflicted ? '#ef4444' : isDragging ? '#38bdf8' : lec.color || 'var(--accent)'}
                  fillOpacity={isConflicted ? 0.4 : isDragging ? 0.95 : 0.85}
                  stroke={isConflicted ? '#ef4444' : isDragging ? '#ffffff' : lec.color || 'var(--accent)'}
                  strokeWidth={isDragging ? 2.5 : isConflicted ? 2 : 1}
                />
                <text
                  x={x + w / 2}
                  y={rowY + rowHeight / 2 + 1}
                  textAnchor="middle"
                  fill={isDragging ? '#0f172a' : '#ffffff'}
                  fontSize="10px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  {lec.name} ({lec.start}h - {lec.end}h)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Custom Lecture Builder */}
      <form
        onSubmit={handleAddLecture}
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ fontWeight: '600' }}>
          {language === 'es' ? 'Agregar clase propia:' : 'Add custom class:'}
        </span>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre"
          style={{
            padding: '0.3rem 0.5rem',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '0.85rem',
            width: '140px'
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>{language === 'es' ? 'Inicio:' : 'Start:'}</span>
          <input
            type="number"
            min={8}
            max={17}
            step={0.5}
            value={newStart}
            onChange={(e) => setNewStart(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.4rem',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              width: '60px',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span>h</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>{language === 'es' ? 'Fin:' : 'End:'}</span>
          <input
            type="number"
            min={newStart + 0.5}
            max={18}
            step={0.5}
            value={newEnd}
            onChange={(e) => setNewEnd(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.4rem',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              width: '60px',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span>h</span>
        </label>
        <button type="submit" className="btn-preset active">
          + {language === 'es' ? 'Insertar Clase' : 'Add Class'}
        </button>
      </form>

      {/* Active Lectures Chip List with Delete */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Clases activas:' : 'Active classes:'}
        </span>
        {lectures.map((lec) => (
          <span
            key={`chip-${lec.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '0.15rem 0.45rem',
              fontSize: '0.75rem'
            }}
          >
            <strong>{lec.name}</strong> ({lec.start}h-{lec.end}h)
            {lectures.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveLecture(lec.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontWeight: '700'
                }}
                title={language === 'es' ? 'Eliminar clase' : 'Remove class'}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
