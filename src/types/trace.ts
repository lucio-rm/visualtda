import { LocalizedString } from './category';

export interface TraceEvent<T = Record<string, unknown>> {
  step: number;
  type: string;
  message?: LocalizedString;
  data: T;
}

export interface TraceTimeline<T = Record<string, unknown>> {
  events: TraceEvent<T>[];
  totalSteps: number;
}
