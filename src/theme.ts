export interface Theme {
  backgroundColor: string;
  textColor: string;
  lineColor: string;
  font: string;
}

export const defaultTheme: Theme = {
  backgroundColor: '#fff',
  textColor: '#232323',
  lineColor: '#232323',
  font: '14px system-ui',
  axis: {
    tickColor: '#232323',
    labelColor: '#232323',
  },
  indicator: {
    backgroundColor: '#40aaff',
    lineColor: '#4096ff',
    labelColor: '#fff',
  },
};
