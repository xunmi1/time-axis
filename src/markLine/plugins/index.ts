import { MarkLineYear1 } from './MarkLineYear1';
import { MarkLineMonth1 } from './MarkLineMonth1';
import { MarkLineDay1 } from './MarkLineDay1';
import { MarkLineHour1 } from './MarkLineHour1';
import { MarkLineMinutes10 } from './MarkLineMinutes10';
import { MarkLineMinute1 } from './MarkLineMinute1';
import { MarkLineSeconds10 } from './MarkLineSeconds10';
import { MarkLineSecond1 } from './MarkLineSecond1';
import { MarkLineMillseconds100 } from './MarkLineMillseconds100';
import { MarkLineMillseconds10 } from './MarkLineMillseconds10';
import { MarkLineMillsecond1 } from './MarkLineMillsecond1';

export const presetMarkLines = [
  MarkLineYear1,
  MarkLineMonth1,
  MarkLineDay1,
  MarkLineHour1,
  MarkLineMinutes10,
  MarkLineMinute1,
  MarkLineSeconds10,
  MarkLineSecond1,
  MarkLineMillseconds100,
  MarkLineMillseconds10,
  MarkLineMillsecond1,
] as const;
