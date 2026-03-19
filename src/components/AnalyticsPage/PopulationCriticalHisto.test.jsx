import { render, screen, waitFor } from '@testing-library/react';
import PopulationCriticalHisto from './PopulationCriticalHisto';

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

const mockApiResponse = [
  { district: 'Алатауский район', sum: 1000 },
  { district: 'Алмалинский район', sum: 500 },
  { district: 'Бостандыкский район', sum: 100 },
  { district: 'БКАД За пределами города', sum: 5000 },
  { district: 'Пустой район', sum: 0 },
];

describe('PopulationCriticalHisto Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockApiResponse),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders title and fetches data', async () => {
    render(<PopulationCriticalHisto selectedDistrict="Все районы" />);

    expect(screen.getByText(/население в критических зонах по районам/i)).toBeInTheDocument();

    await waitFor(() => {
      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(3);
    });
  });

  test('applies correct colors based on ratio', async () => {
    render(<PopulationCriticalHisto selectedDistrict="Все районы" />);

    await waitFor(() => {
      const cells = screen.getAllByTestId('cell');
      
      expect(cells[0]).toHaveAttribute('data-fill', '#B91C1C'); 
      
      expect(cells[1]).toHaveAttribute('data-fill', '#C49B0B');
      
      expect(cells[2]).toHaveAttribute('data-fill', '#2B6CB0');
    });
  });

  test('filters data by selectedDistrict', async () => {
    render(<PopulationCriticalHisto selectedDistrict="Алатауский" />);

    await waitFor(() => {
      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(1);
    });
  });

  test('renders empty state if fetch fails or no data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );

    render(<PopulationCriticalHisto selectedDistrict="Все районы" />);

    await waitFor(() => {
      expect(screen.getByText(/нет данных для отображения/i)).toBeInTheDocument();
    });
  });

  test('filters out zero sums and specific exclusion districts', async () => {
    render(<PopulationCriticalHisto selectedDistrict="Все районы" />);

    await waitFor(() => {
      expect(screen.queryByText(/БКАД/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Пустой район/)).not.toBeInTheDocument();
    });
  });
});