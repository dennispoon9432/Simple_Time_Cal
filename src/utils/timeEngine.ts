/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimeOfDay {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CalculationStep {
  id: string;
  operator: '+' | '-';
  rawInput: string;
  durationSeconds: number;
  stepTotalSeconds: number; // cumulative seconds from 00:00 of day 0
  resultTime: TimeOfDay;
  stepDayShift: number; // day shift at this step
}

export interface CalculationResult {
  initialTime: TimeOfDay;
  steps: CalculationStep[];
  finalTime: TimeOfDay;
  totalDeltaSeconds: number;
  dayShift: number; // e.g. 0 (same day), +1 (next day), -1 (previous day), etc.
  formatted24: string;
  formatted12: string;
  formatted24WithSec: string;
  formatted12WithSec: string;
  hasSeconds: boolean;
  baseDate?: Date;
  calculatedDate?: Date;
}

/**
 * Format a number with leading zeros
 */
export function padZero(num: number, size = 2): string {
  let s = Math.abs(num).toString();
  while (s.length < size) s = '0' + s;
  return s;
}

/**
 * Convert TimeOfDay to total seconds from 00:00:00
 */
export function timeToSeconds(time: TimeOfDay): number {
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

/**
 * Convert total seconds into TimeOfDay + Day shift
 */
export function secondsToTime(totalSeconds: number): { time: TimeOfDay; dayShift: number } {
  const SECONDS_IN_DAY = 86400;
  const dayShift = Math.floor(totalSeconds / SECONDS_IN_DAY);
  const remainder = ((totalSeconds % SECONDS_IN_DAY) + SECONDS_IN_DAY) % SECONDS_IN_DAY;

  const hours = Math.floor(remainder / 3600);
  const minutes = Math.floor((remainder % 3600) / 60);
  const seconds = remainder % 60;

  return {
    time: { hours, minutes, seconds },
    dayShift,
  };
}

/**
 * Format TimeOfDay in 24-hour format (HH:MM or HH:MM:SS)
 */
export function formatTime24(time: TimeOfDay, includeSeconds = false): string {
  const h = padZero(time.hours);
  const m = padZero(time.minutes);
  if (includeSeconds) {
    return `${h}:${m}:${padZero(time.seconds)}`;
  }
  return `${h}:${m}`;
}

/**
 * Format TimeOfDay in 12-hour format with AM/PM (h:MM AM/PM)
 */
export function formatTime12(time: TimeOfDay, includeSeconds = false): string {
  const period = time.hours >= 12 ? 'PM' : 'AM';
  let hours12 = time.hours % 12;
  if (hours12 === 0) hours12 = 12;
  const h = padZero(hours12);
  const m = padZero(time.minutes);
  if (includeSeconds) {
    return `${h}:${m}:${padZero(time.seconds)} ${period}`;
  }
  return `${h}:${m} ${period}`;
}

/**
 * Format a duration in seconds into human-readable string (e.g., "1h 13m", "25m", "45s")
 */
export function formatDurationHuman(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const hrs = Math.floor(abs / 3600);
  const mins = Math.floor((abs % 3600) / 60);
  const secs = abs % 60;

  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 || hrs === 0 && secs === 0) parts.push(`${mins}m`);
  if (secs > 0) parts.push(`${secs}s`);

  const formatted = parts.join(' ');
  return totalSeconds < 0 ? `-${formatted}` : formatted;
}

/**
 * Format day shift label
 */
export function formatDayShift(dayShift: number): { label: string; textClass: string; bgClass: string } {
  if (dayShift === 0) {
    return {
      label: 'Same Day',
      textClass: 'text-slate-400',
      bgClass: 'bg-slate-800/60 border-slate-700/50',
    };
  } else if (dayShift === 1) {
    return {
      label: '+1 Day (Next Day)',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-950/40 border-amber-800/50',
    };
  } else if (dayShift > 1) {
    return {
      label: `+${dayShift} Days`,
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-950/40 border-amber-800/50',
    };
  } else if (dayShift === -1) {
    return {
      label: '-1 Day (Prev Day)',
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-950/40 border-rose-800/50',
    };
  } else {
    return {
      label: `${dayShift} Days`,
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-950/40 border-rose-800/50',
    };
  }
}

/**
 * Parse time string:
 * Accepts: "06:27", "6:27", "06:27:15", "6:27 AM", "11:45 PM", "18:20"
 */
export function parseTimeString(str: string): { time: TimeOfDay; hasSeconds: boolean } | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  // Regex for 12-hour or 24-hour time
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] !== undefined ? parseInt(match[3], 10) : 0;
  const ampm = match[4]?.toLowerCase();
  const hasSeconds = match[3] !== undefined;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
  if (minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) return null;

  if (ampm) {
    if (hours < 1 || hours > 12) return null;
    if (ampm === 'am' && hours === 12) hours = 0;
    if (ampm === 'pm' && hours < 12) hours += 12;
  } else {
    if (hours < 0 || hours > 23) return null;
  }

  return {
    time: { hours, minutes, seconds },
    hasSeconds,
  };
}

/**
 * Parse a duration string.
 * Supports:
 * - Pure number: "20", "5" -> treated as minutes by time calculator convention (e.g. 06:27 + 20 + 5)
 * - Time format: "1:13" -> 1 hr 13 min, "01:13:30" -> 1 hr 13 min 30 sec
 * - Unit string: "2h", "45m", "30s", "1h 30m", "1.5h", "90min", "2 hrs 15 mins"
 */
export function parseDurationString(str: string): { seconds: number; hasSeconds: boolean } | null {
  const trimmed = str.trim().toLowerCase();
  if (!trimmed) return null;

  // Case 1: HH:MM or HH:MM:SS format e.g. "1:13" or "01:13" or "01:13:20"
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if (colonMatch) {
    const hrs = parseInt(colonMatch[1], 10);
    const mins = parseInt(colonMatch[2], 10);
    const secs = colonMatch[3] !== undefined ? parseInt(colonMatch[3], 10) : 0;
    if (mins >= 60 || secs >= 60) return null;
    return {
      seconds: hrs * 3600 + mins * 60 + secs,
      hasSeconds: colonMatch[3] !== undefined,
    };
  }

  // Case 2: Unit notation e.g. "2h 30m", "1.5h", "45m", "10s", "2 hrs 15 mins"
  let hasUnit = false;
  let totalSecs = 0;
  let unitHasSec = false;

  // Regex patterns for units
  const hourMatch = trimmed.match(/([\d.]+)\s*(?:h|hr|hrs|hours?)/);
  if (hourMatch) {
    hasUnit = true;
    totalSecs += Math.round(parseFloat(hourMatch[1]) * 3600);
  }

  const minMatch = trimmed.match(/([\d.]+)\s*(?:m|min|mins|minutes?)/);
  if (minMatch) {
    hasUnit = true;
    totalSecs += Math.round(parseFloat(minMatch[1]) * 60);
  }

  const secMatch = trimmed.match(/([\d.]+)\s*(?:s|sec|secs|seconds?)/);
  if (secMatch) {
    hasUnit = true;
    unitHasSec = true;
    totalSecs += Math.round(parseFloat(secMatch[1]));
  }

  if (hasUnit) {
    return {
      seconds: totalSecs,
      hasSeconds: unitHasSec,
    };
  }

  // Case 3: Pure number: "20", "5" -> by prompt definition, this is minutes (e.g. 06:27+20+5 = 06:52)
  const numMatch = trimmed.match(/^([\d.]+)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    if (!isNaN(val)) {
      return {
        seconds: Math.round(val * 60), // standard minutes
        hasSeconds: false,
      };
    }
  }

  return null;
}

/**
 * Tokenize and parse a full time calculation expression:
 * e.g. "06:27 + 20 + 5" or "06:27 + 1:13" or "23:45 + 30 - 10"
 */
export function evaluateTimeExpression(
  expression: string,
  baseDate: Date = new Date()
): { success: true; result: CalculationResult } | { success: false; error: string } {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter a time expression (e.g. 06:27 + 20 + 5)' };
  }

  // Split into tokens: first token is the time, subsequent tokens are operators and durations.
  // We need to carefully split by operators + and - without breaking time tokens.
  // Note: the initial time might be followed immediately by + or -
  // We can scan character by character or use a regex tokenizer.
  
  let i = 0;
  // First, find where initial time ends. Initial time cannot contain '+' or '-' unless it's within AM/PM (which doesn't have +/-).
  // Find first unescaped '+' or '-'
  const firstOpIndex = trimmed.search(/[+-]/);

  let initialTimeStr = '';
  let rest = '';

  if (firstOpIndex === -1) {
    // Only initial time was entered
    initialTimeStr = trimmed;
    rest = '';
  } else {
    initialTimeStr = trimmed.slice(0, firstOpIndex).trim();
    rest = trimmed.slice(firstOpIndex).trim();
  }

  const parsedInitial = parseTimeString(initialTimeStr);
  if (!parsedInitial) {
    return {
      success: false,
      error: `Invalid initial time "${initialTimeStr}". Expected format like 06:27, 6:27 AM, or 18:45.`,
    };
  }

  let hasSecondsGlobal = parsedInitial.hasSeconds;
  let currentTotalSeconds = timeToSeconds(parsedInitial.time);
  let initialTotalSeconds = currentTotalSeconds;
  const steps: CalculationStep[] = [];

  // Parse remaining operations: e.g. "+ 20", "+ 5", "+ 1:13", "- 30"
  if (rest) {
    // Match tokens: ([+-])\s*([^+-]+)
    const opRegex = /([+-])\s*([^+-]+)/g;
    let match: RegExpExecArray | null;
    let stepCount = 0;

    while ((match = opRegex.exec(rest)) !== null) {
      stepCount++;
      const operator = match[1] as '+' | '-';
      const durationRaw = match[2].trim();

      if (!durationRaw) {
        return {
          success: false,
          error: `Missing duration after "${operator}". Example: +20 or +1:13`,
        };
      }

      const parsedDuration = parseDurationString(durationRaw);
      if (!parsedDuration) {
        return {
          success: false,
          error: `Unrecognized duration "${durationRaw}". Use minutes (e.g. 20), hours:minutes (1:13), or units (2h 30m).`,
        };
      }

      if (parsedDuration.hasSeconds) {
        hasSecondsGlobal = true;
      }

      const delta = operator === '+' ? parsedDuration.seconds : -parsedDuration.seconds;
      currentTotalSeconds += delta;

      const { time: stepTime, dayShift: stepDayShift } = secondsToTime(currentTotalSeconds);

      steps.push({
        id: `step-${stepCount}-${Date.now()}`,
        operator,
        rawInput: durationRaw,
        durationSeconds: parsedDuration.seconds,
        stepTotalSeconds: currentTotalSeconds,
        resultTime: stepTime,
        stepDayShift,
      });
    }
  }

  const { time: finalTime, dayShift } = secondsToTime(currentTotalSeconds);
  const totalDeltaSeconds = currentTotalSeconds - initialTotalSeconds;

  // Calculate actual Date object if baseDate is provided
  const calculatedDate = new Date(baseDate);
  calculatedDate.setDate(calculatedDate.getDate() + dayShift);
  calculatedDate.setHours(finalTime.hours, finalTime.minutes, finalTime.seconds, 0);

  return {
    success: true,
    result: {
      initialTime: parsedInitial.time,
      steps,
      finalTime,
      totalDeltaSeconds,
      dayShift,
      formatted24: formatTime24(finalTime, false),
      formatted12: formatTime12(finalTime, false),
      formatted24WithSec: formatTime24(finalTime, true),
      formatted12WithSec: formatTime12(finalTime, true),
      hasSeconds: hasSecondsGlobal,
      baseDate,
      calculatedDate,
    },
  };
}

/**
 * Calculate difference between two times
 */
export function calculateTimeDifference(
  startTimeStr: string,
  endTimeStr: string,
  endIsNextDay: boolean = false
): {
  success: boolean;
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isNegative: boolean;
  error?: string;
} {
  const start = parseTimeString(startTimeStr);
  if (!start) return { success: false, totalSeconds: 0, hours: 0, minutes: 0, seconds: 0, formatted: '', isNegative: false, error: 'Invalid start time' };

  const end = parseTimeString(endTimeStr);
  if (!end) return { success: false, totalSeconds: 0, hours: 0, minutes: 0, seconds: 0, formatted: '', isNegative: false, error: 'Invalid end time' };

  let startSec = timeToSeconds(start.time);
  let endSec = timeToSeconds(end.time);

  if (endIsNextDay) {
    endSec += 86400;
  } else if (endSec < startSec) {
    // If end is earlier than start and user hasn't explicitly toggled, assume next day automatically
    endSec += 86400;
  }

  const diffSec = endSec - startSec;
  const isNeg = diffSec < 0;
  const absSec = Math.abs(diffSec);

  const hours = Math.floor(absSec / 3600);
  const minutes = Math.floor((absSec % 3600) / 60);
  const seconds = absSec % 60;

  return {
    success: true,
    totalSeconds: diffSec,
    hours,
    minutes,
    seconds,
    formatted: formatDurationHuman(diffSec),
    isNegative: isNeg,
  };
}
