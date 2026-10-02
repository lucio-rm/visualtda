import { TraceTimeline, TraceEvent } from '../../types';

export interface LectureInterval {
  id: string;
  name: string;
  start: number;
  end: number;
  classroomId?: number;
  color: string;
}

export interface Classroom {
  id: number;
  label: string;
  lastEndTime: number;
  assignedIds: string[];
  color: string;
}

export interface IntervalPartitioningStepData {
  intervals: LectureInterval[];
  sortedIntervals: LectureInterval[];
  currentIndex: number;
  currentInterval: LectureInterval | null;
  classrooms: Classroom[];
  depth: number;
  currentTimeMarker: number | null;
  action: 'INIT' | 'SORT_INTERVALS' | 'EXAMINE_INTERVAL' | 'REUSE_CLASSROOM' | 'OPEN_NEW_CLASSROOM' | 'COMPLETE';
  description: { es: string; en: string };
}

const PALETTE = [
  '#38bdf8', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316'  // orange
];

export const DEFAULT_LECTURES: LectureInterval[] = [
  { id: 'c1', name: 'Algoritmos I', start: 9, end: 11.5, color: PALETTE[0] },
  { id: 'c2', name: 'Álgebra Lineal', start: 10, end: 12.5, color: PALETTE[1] },
  { id: 'c3', name: 'Física I', start: 11, end: 13, color: PALETTE[2] },
  { id: 'c4', name: 'Estructuras', start: 12, end: 14.5, color: PALETTE[3] },
  { id: 'c5', name: 'Bases de Datos', start: 13, end: 16, color: PALETTE[4] },
  { id: 'c6', name: 'Sistemas Op.', start: 14.5, end: 17, color: PALETTE[5] },
  { id: 'c7', name: 'Redes', start: 15.5, end: 18, color: PALETTE[6] }
];

export function calculateIntervalDepth(intervals: LectureInterval[]): number {
  const events: Array<{ time: number; type: 'start' | 'end' }> = [];
  for (const iv of intervals) {
    events.push({ time: iv.start, type: 'start' });
    events.push({ time: iv.end, type: 'end' });
  }
  // Sort: if times are equal, end comes before start so touching endpoints [9,11] and [11,13] do not overlap
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.type === 'end' ? -1 : 1;
  });

  let maxDepth = 0;
  let currentActive = 0;
  for (const e of events) {
    if (e.type === 'start') {
      currentActive++;
      if (currentActive > maxDepth) maxDepth = currentActive;
    } else {
      currentActive--;
    }
  }
  return maxDepth;
}

export function generateIntervalPartitioningTrace(
  inputIntervals: LectureInterval[] = DEFAULT_LECTURES
): TraceTimeline<IntervalPartitioningStepData> {
  const events: TraceEvent<IntervalPartitioningStepData>[] = [];
  const intervals = inputIntervals.map((iv) => ({ ...iv }));
  const depth = calculateIntervalDepth(intervals);

  let eventCounter = 0;
  const classrooms: Classroom[] = [];

  function pushEvent(
    action: IntervalPartitioningStepData['action'],
    idx: number,
    currentIv: LectureInterval | null,
    timeMarker: number | null,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        intervals: intervals.map((iv) => ({ ...iv })),
        sortedIntervals: sorted.map((iv) => ({ ...iv })),
        currentIndex: idx,
        currentInterval: currentIv ? { ...currentIv } : null,
        classrooms: classrooms.map((cr) => ({ ...cr, assignedIds: [...cr.assignedIds] })),
        depth,
        currentTimeMarker: timeMarker,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // Step 1: Initial state
  const sorted: LectureInterval[] = [...intervals];
  pushEvent(
    'INIT',
    -1,
    null,
    null,
    `Instancia inicial: ${intervals.length} clases a programar. Profundidad máxima del conjunto de intervalos: d = ${depth} (cota inferior de aulas necesarias).`,
    `Initial instance: ${intervals.length} lectures to schedule. Maximum depth: d = ${depth} (theoretical lower bound on classrooms).`
  );

  // Step 2: Sort by start time
  sorted.sort((a, b) => a.start - b.start || a.end - b.end);
  pushEvent(
    'SORT_INTERVALS',
    -1,
    null,
    null,
    `Ordenamiento Greedy por tiempo de inicio (s_i creciente). Los intervalos se procesarán cronológicamente para evitar decisiones retroactivas.`,
    `Greedy sorting by start time (ascending s_i). Lectures will be processed chronologically to prevent retroactive conflicts.`
  );

  // Step 3: Process each interval
  for (let i = 0; i < sorted.length; i++) {
    const lecture = sorted[i];

    pushEvent(
      'EXAMINE_INTERVAL',
      i,
      lecture,
      lecture.start,
      `Examinando clase "${lecture.name}" [${lecture.start}:00 - ${lecture.end}:00]. Buscando un aula libre en t = ${lecture.start}:00.`,
      `Inspecting lecture "${lecture.name}" [${lecture.start}:00 - ${lecture.end}:00]. Looking for a classroom free at t = ${lecture.start}:00.`
    );

    // Find compatible classroom: min-heap property (earliest lastEndTime)
    let chosenRoom: Classroom | null = null;
    let minFinish = Infinity;

    for (const room of classrooms) {
      if (room.lastEndTime <= lecture.start && room.lastEndTime < minFinish) {
        minFinish = room.lastEndTime;
        chosenRoom = room;
      }
    }

    if (chosenRoom) {
      chosenRoom.lastEndTime = lecture.end;
      chosenRoom.assignedIds.push(lecture.id);
      lecture.classroomId = chosenRoom.id;

      // Update in main list
      const orig = intervals.find((iv) => iv.id === lecture.id);
      if (orig) orig.classroomId = chosenRoom.id;

      pushEvent(
        'REUSE_CLASSROOM',
        i,
        lecture,
        lecture.start,
        `Aula reutilizada: ${chosenRoom.label} finalizó a las ${minFinish}:00 ≤ ${lecture.start}:00. Se asigna "${lecture.name}" sin solapamiento.`,
        `Classroom reused: ${chosenRoom.label} was free since ${minFinish}:00 ≤ ${lecture.start}:00. Assigned "${lecture.name}" with zero conflicts.`
      );
    } else {
      const newId = classrooms.length + 1;
      const newRoom: Classroom = {
        id: newId,
        label: `Aula ${newId}`,
        lastEndTime: lecture.end,
        assignedIds: [lecture.id],
        color: PALETTE[(newId - 1) % PALETTE.length]
      };
      classrooms.push(newRoom);
      lecture.classroomId = newId;

      const orig = intervals.find((iv) => iv.id === lecture.id);
      if (orig) orig.classroomId = newId;

      pushEvent(
        'OPEN_NEW_CLASSROOM',
        i,
        lecture,
        lecture.start,
        `Todas las ${classrooms.length - 1} aulas existentes están ocupadas en t = ${lecture.start}:00. Se abre nueva ${newRoom.label}. Total aulas abiertas: ${classrooms.length} ≤ d (${depth}).`,
        `All ${classrooms.length - 1} existing classrooms occupied at t = ${lecture.start}:00. Opening new ${newRoom.label}. Total classrooms: ${classrooms.length} ≤ d (${depth}).`
      );
    }
  }

  // Final step
  pushEvent(
    'COMPLETE',
    sorted.length,
    null,
    null,
    `Partición óptima completada. Cantidad final de aulas = ${classrooms.length}, exactamente igual a la profundidad d = ${depth}. Invariante demostrado: ninguna partición válida puede usar menos de d aulas.`,
    `Optimal partitioning complete. Total classrooms = ${classrooms.length}, matching depth d = ${depth}. Invariant proven: no valid schedule can use fewer than d classrooms.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
