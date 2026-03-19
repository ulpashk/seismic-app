import { render, screen } from '@testing-library/react';
import SocialObjectsIRIHisto from './SocialObjectsIRIHisto';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ name, children }) => (
    <div data-testid="bar">
      {name}
      {children} 
    </div>
  ),
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  LabelList: ({ dataKey }) => <div data-testid="label-list" data-key={dataKey} />,
}));

describe('SocialObjectsIRIHisto Component', () => {
  const mockChartData = [
    { IRI_cat: 'C - Низкая', total_cnt_ddo: 10, total_cnt_health: 5, total_cnt_pppn: 2 },
    { IRI_cat: 'A - Высокая', total_cnt_ddo: 20, total_cnt_health: 10, total_cnt_pppn: 5 },
    { IRI_cat: 'B - Средняя', total_cnt_ddo: 15, total_cnt_health: 7, total_cnt_pppn: 3 },
  ];

  test('renders loading state', () => {
    render(<SocialObjectsIRIHisto chartData={[]} loading={true} />);
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  test('renders error message', () => {
    render(<SocialObjectsIRIHisto chartData={[]} error="Ошибка" />);
    expect(screen.getByText("Ошибка")).toBeInTheDocument();
  });

  test('renders empty state when no data', () => {
    render(<SocialObjectsIRIHisto chartData={[]} />);
    expect(screen.getByText(/нет данных для отображения/i)).toBeInTheDocument();
  });

  test('sorts data correctly (A -> B -> C)', () => {
    render(<SocialObjectsIRIHisto chartData={mockChartData} />);
    const chart = screen.getByTestId('bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data'));

    expect(data[0].iri).toMatch(/^A/);
    expect(data[1].iri).toMatch(/^B/);
    expect(data[2].iri).toMatch(/^C/);
  });

  test('calculates total correctly', () => {
    render(<SocialObjectsIRIHisto chartData={mockChartData} />);
    const chart = screen.getByTestId('bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data'));

    const itemA = data.find(d => d.iri.startsWith('A'));
    expect(itemA.total).toBe(35);
  });

  test('renders all 4 bars', () => {
    render(<SocialObjectsIRIHisto chartData={mockChartData} />);
    const bars = screen.getAllByTestId('bar');
    expect(bars).toHaveLength(4);
  });

  test('passes total dataKey to LabelList', () => {
    render(<SocialObjectsIRIHisto chartData={mockChartData} />);
    
    const labelList = screen.getByTestId('label-list');
    expect(labelList).toHaveAttribute('data-key', 'total');
  });
});