import React, { useState } from 'react';
import {
  LectureInterval,
  DEFAULT_LECTURES,
  calculateIntervalDepth
} from '../../engine/algorithms/intervalPartitioningTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const IntervalPartitioningPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [lectures, setLectures] = useState<LectureInterval[]>(DEFAULT_LECTURES);
  const [userAssignments, setUserAssignments] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState('Taller Python');
  const [newStart, setNewStart] = useState(10);
  const [newEnd, setNewEnd] = useState(12);

  const depth = calculateIntervalDepth(lectures);

  // Group lectures by assigned classroom
  const classrooms: Record<number, LectureInterval[]> = {};
  for (const lec of lectures) {
    const roomId = userAssignments[lec.id] ?? 1;
    if (!classrooms[roomId]) classrooms[roomId] = [];
    classrooms[roomId].push(lec);
  }

  // Detect conflicts: two lectures in the same room overlapping
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

  const assignedRoomsCount = Object.keys(classrooms).length;
  const isOptimalValid = conflicts.length === 0 && assignedRoomsCount <= depth;

  const handleAssign = (lectureId: string, roomId: number) => {
    const next = { ...userAssignments, [lectureId]: roomId };
    setUserAssignments(next);

    // Check if optimal valid schedule achieved
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
  };

  const handleAutoGreedy = () => {
    // Run greedy earliest start time
    const sorted = [...lectures].sort((a, b) => a.start - b.start);
    const roomEnds: number[] = [];
    const assignments: Record<string, number> = {};

    for (const lec of sorted) {
      let chosen = -1;
      for (let r = 0; r < roomEnds.length; r++) {
        if (roomEnds[r] <= lec.start) {
          chosen = r;
          break;
        }
      }
      if (chosen >= 0) {
        roomEnds[chosen] = lec.end;
        assignments[lec.id] = chosen + 1;
      } else {
        roomEnds.push(lec.end);
        assignments[lec.id] = roomEnds.length;
      }
    }
    setUserAssignments(assignments);
    markAttempted('interval-partitioning-greedy');
  };

  // SVG dimensions
  const minHour = 8;
  const maxHour = 18;
  const svgWidth = 560;
  const marginLeft = 60;
  const marginRight = 20;
  const marginTop = 30;
  const rowHeight = 34;
  const numRooms = 5;
  const svgHeight = marginTop + numRooms * rowHeight + 15;
  const chartWidth = svgWidth - marginLeft - marginRight;

  const timeToX = (t: number) => marginLeft + ((t - minHour) / (maxHour - minHour)) * chartWidth;

  return (
    <div className="algorithm-playground interval-partitioning-playground" role="region" aria-label="Laboratorio de Partición de Intervalos">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button type="button" className="btn-preset active" onClick={() => { setLectures(DEFAULT_LECTURES); setUserAssignments({}); }}>
            {language === 'es' ? 'Instancia Estándar (d = 3)' : 'Standard Instance (d = 3)'}
          </button>
          <button type="button" className="btn-preset" onClick={handleAutoGreedy}>
            {language === 'es' ? 'Resolver con Greedy (s_i creciente)' : 'Solve with Greedy (s_i ascending)'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Cota teórica (Profundidad):' : 'Theoretical bound (Depth):'}{' '}
            <strong style={{ color: 'var(--accent)' }}>d = {depth}</strong>
          </span>
          <span>
            {language === 'es' ? 'Aulas asignadas:' : 'Classrooms used:'}{' '}
            <strong style={{ color: assignedRoomsCount <= depth ? '#10b981' : '#f59e0b' }}>
              {assignedRoomsCount}
            </strong>
          </span>
        </div>
      </div>

      {conflicts.length > 0 ? (
        <div className="sdk-conflict-banner" role="alert">
          <strong>{language === 'es' ? 'Conflicto de Horario' : 'Schedule Conflict'}:</strong>{' '}
          {language === 'es'
            ? `Aula ${conflicts[0].room} tiene superposición entre "${conflicts[0].lec1}" y "${conflicts[0].lec2}". Dos clases no pueden ocupar la misma aula al mismo tiempo.`
            : `Classroom ${conflicts[0].room} has overlap between "${conflicts[0].lec1}" and "${conflicts[0].lec2}".`}
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
            ? `Todas las tareas fueron asignadas sin conflictos utilizando exactamente d = ${depth} aulas (cota mínima teórica).`
            : `All tasks assigned with zero conflicts using exactly d = ${depth} classrooms (theoretical minimum bound).`}
        </div>
      ) : null}

      {/* SVG Interactive Classroom Gantt Timeline */}
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.35rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {language === 'es'
              ? 'Línea de tiempo de aulas: Hacé clic sobre cualquier bloque para moverlo a otra aula'
              : 'Classroom timeline: Click any lecture block to move it to another classroom'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>8:00 → 18:00</span>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: '560px', height: 'auto', display: 'block', margin: '0 auto' }}
          role="img"
          aria-label={language === 'es' ? 'Cronograma de asignación de aulas' : 'Classroom assignment schedule'}
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
                  opacity={0.6}
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

          {/* Lecture Blocks */}
          {lectures.map((lec) => {
            const assignedRoom = userAssignments[lec.id] ?? 1;
            const rowY = marginTop + (assignedRoom - 1) * rowHeight;
            const x = timeToX(lec.start);
            const w = Math.max(8, timeToX(lec.end) - x);
            const isConflicted = conflictingLectureIds.has(lec.id);

            return (
              <g
                key={`lec-rect-${lec.id}`}
                onClick={() => handleCycleRoom(lec.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x + 1}
                  y={rowY + 2}
                  width={w - 2}
                  height={rowHeight - 8}
                  rx={4}
                  fill={isConflicted ? '#ef4444' : 'var(--accent)'}
                  fillOpacity={isConflicted ? 0.35 : 0.85}
                  stroke={isConflicted ? '#ef4444' : 'var(--accent)'}
                  strokeWidth={isConflicted ? 2 : 1}
                />
                <text
                  x={x + w / 2}
                  y={rowY + rowHeight / 2 + 1}
                  textAnchor="middle"
                  fill={isConflicted ? '#ffffff' : 'var(--accent-contrast)'}
                  fontSize="10px"
                  fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                >
                  {w > 35 ? lec.name : lec.name.slice(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Lecture Assignment Table */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>{language === 'es' ? 'Clase' : 'Lecture'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Inicio' : 'Start'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Fin' : 'End'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Duración' : 'Duration'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Aula Asignada' : 'Assigned Classroom'}</th>
            </tr>
          </thead>
          <tbody>
            {lectures.map((lec) => {
              const currentRoom = userAssignments[lec.id] ?? 1;
              const hasConflict = conflictingLectureIds.has(lec.id);
              return (
                <tr key={lec.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: hasConflict ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>
                    {lec.name}
                    {hasConflict && <span style={{ color: '#ef4444', marginLeft: '6px', fontSize: '0.75rem' }}>[Conflicto]</span>}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{lec.start}:00</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{lec.end}:00</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{lec.end - lec.start}h</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map((rNum) => (
                        <button
                          key={rNum}
                          type="button"
                          onClick={() => handleAssign(lec.id, rNum)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            backgroundColor: currentRoom === rNum ? 'var(--accent)' : 'var(--bg)',
                            color: currentRoom === rNum ? 'var(--accent-contrast)' : 'var(--text)',
                            fontWeight: currentRoom === rNum ? '700' : '400',
                            cursor: 'pointer'
                          }}
                        >
                          A{rNum}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Lecture Form */}
      <form
        onSubmit={handleAddLecture}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          border: '1px solid var(--border)'
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
          {language === 'es' ? 'Añadir clase:' : 'Add lecture:'}
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
            borderRadius: '4px'
          }}
        />
        <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {language === 'es' ? 'Inicio:' : 'Start:'}
          <input
            type="number"
            min={8}
            max={20}
            value={newStart}
            onChange={(e) => setNewStart(Number(e.target.value))}
            style={{ width: '55px', padding: '0.2rem 0.4rem', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </label>
        <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {language === 'es' ? 'Fin:' : 'End:'}
          <input
            type="number"
            min={9}
            max={22}
            value={newEnd}
            onChange={(e) => setNewEnd(Number(e.target.value))}
            style={{ width: '55px', padding: '0.2rem 0.4rem', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </label>
        <button
          type="submit"
          className="btn-control"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          + {language === 'es' ? 'Agregar Intervalo' : 'Add Interval'}
        </button>
      </form>
    </div>
  );
};

