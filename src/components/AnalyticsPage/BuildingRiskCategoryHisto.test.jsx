import { render, screen } from '@testing-library/react';
import BuildingRiskCategoryHisto from './BuildingRiskCategoryHisto';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: ({ children }) => <div>{children}</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  LabelList: () => <div />,
  Cell: ({ fill }) => <div data-testid="cell" data-fill={fill} />,
}));

describe('BuildingRiskCategoryHisto Component', () => {

  const mockData = [
    { category: 'Аварийное', count: 10 },
    { category: 'Средний риск', count: 20 },
    { category: 'Высокая устойчивость', count: 30 },
  ];

  test('renders title', () => {
    render(<BuildingRiskCategoryHisto data={mockData} />);
    
    expect(
      screen.getByText(/здания по уровням сейсмостойкости/i)
    ).toBeInTheDocument();
  });

  test('renders chart when data is provided', () => {
    render(<BuildingRiskCategoryHisto data={mockData} />);
    
    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(3);
  });

  test('renders empty state when no data', () => {
    render(<BuildingRiskCategoryHisto data={[]} />);
    
    expect(
      screen.getByText(/нет данных для отображения/i)
    ).toBeInTheDocument();
  });

  test('applies correct colors to bars', () => {
    render(<BuildingRiskCategoryHisto data={mockData} />);
    
    const cells = screen.getAllByTestId('cell');

    expect(cells[0]).toHaveAttribute('data-fill', '#B91C1C');
    expect(cells[1]).toHaveAttribute('data-fill', '#C49B0B');
    expect(cells[2]).toHaveAttribute('data-fill', '#2B6CB0');
  });

  test('uses default color for invalid category', () => {
    const invalidData = [{ category: null, count: 5 }];
    
    render(<BuildingRiskCategoryHisto data={invalidData} />);
    
    const cell = screen.getByTestId('cell');
    expect(cell).toHaveAttribute('data-fill', '#6B7280');
  });

});