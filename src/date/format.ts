function tailPad(value: unknown, len: number) {
  return String(value).slice(-len).padStart(len, '0');
}

function matchToken(token: string, value: Temporal.ZonedDateTime, locale: string) {
  const first = token[0];
  const len = token.length;
  switch (first) {
    case 'Y':
      return tailPad(value.year, len);
    case 'M':
      if (len <= 2) return tailPad(value.month, len);
      if (len === 3) return value.toLocaleString(locale, { month: 'short' });
      if (len === 4) return value.toLocaleString(locale, { month: 'long' });
      return token;
    case 'D':
      return tailPad(value.day, len);
    case 'd':
      if (len === 1) return String(value.dayOfWeek);
      if (len === 2) return value.toLocaleString(locale, { weekday: 'narrow' });
      if (len === 3) return value.toLocaleString(locale, { weekday: 'short' });
      if (len === 4) return value.toLocaleString(locale, { weekday: 'long' });
      return token;
    case 'H':
      return tailPad(value.hour, len);
    case 'h':
      return tailPad(value.hour % 12 || 12, len);
    case 'a':
      return value.hour < 12 ? 'am' : 'pm';
    case 'A':
      return value.hour < 12 ? 'AM' : 'PM';
    case 'm':
      return tailPad(value.minute, len);
    case 's':
      return tailPad(value.second, len);
    case 'S':
      return value.epochNanoseconds.toString().slice(-9, -9 + len);
    case 'Z':
      if (len === 1) return value.offset;
      if (len === 2) return value.offset.replace(':', '');
      return token;
    default:
      return token;
  }
}

const FORMAT_PATTERN = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|S{1,6}/g;

export function format(value: Temporal.ZonedDateTime, locale: string, template: string) {
  return template.replace(FORMAT_PATTERN, token => matchToken(token, value, locale));
}
