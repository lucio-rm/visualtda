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
  for (const [rId, list] of Object.entries(classrooms)) {
    const roomNum = Number(rId);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
          conflicts.push({ room: roomNum, lec1: a.name, lec2: b.name });
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

  return (
    <div className="algorithm-playground interval-partitioning-playground" role="region" aria-label="Laboratorio de Partición de Intervalos">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button type="button" className="btn-preset active" onClick={() => setLectures(DEFAULT_LECTURES)}>
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
              return (
                <tr key={lec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>{lec.name}</td>
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
