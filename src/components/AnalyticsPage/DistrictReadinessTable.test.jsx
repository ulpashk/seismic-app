import { render, screen } from '@testing-library/react';
import DistrictReadinessTable from './DistrictReadinessTable';

describe('DistrictReadinessTable Component', () => {
  const mockAverages = {
    'Алатауский': 0.850,
    'Алмалинский': 0.550,
    'Ауэзовский': 0.200,
  };

  const mockRisk = {
    'Алатауский': 0.150,
    'Алмалинский': 0.450,
    'Ауэзовский': 0.750,
  };

  test('renders title and table headers', () => {
    render(<DistrictReadinessTable districtAverages={mockAverages} districtRisk={mockRisk} />);
    
    expect(screen.getByText(/уровень готовности по районам/i)).toBeInTheDocument();
    expect(screen.getByText('Район')).toBeInTheDocument();
    expect(screen.getByText('Средний уровень готовности')).toBeInTheDocument();
    expect(screen.getByText('Средний уровень риска')).toBeInTheDocument();
  });

  test('renders rows with formatted data (3 decimal places)', () => {
    render(<DistrictReadinessTable districtAverages={mockAverages} districtRisk={mockRisk} />);
    
    expect(screen.getByText('Алатауский')).toBeInTheDocument();
    expect(screen.getByText('0.850')).toBeInTheDocument();
    expect(screen.getByText('0.150')).toBeInTheDocument();
  });

  test('applies correct colors for Readiness levels', () => {
    render(<DistrictReadinessTable districtAverages={mockAverages} districtRisk={mockRisk} />);
    
    expect(screen.getByText('0.850')).toHaveClass('text-status-high');
    
    expect(screen.getByText('0.550')).toHaveClass('text-status-medium');
    
    expect(screen.getByText('0.200')).toHaveClass('text-status-low');
  });

  test('applies correct colors for Risk levels', () => {
    render(<DistrictReadinessTable districtAverages={mockAverages} districtRisk={mockRisk} />);
    
    expect(screen.getByText('0.150')).toHaveClass('text-status-high');
    
    expect(screen.getByText('0.450')).toHaveClass('text-status-medium');
    
    expect(screen.getByText('0.750')).toHaveClass('text-status-low');
  });

  test('handles missing risk data with dash and secondary color', () => {
    const incompleteRisk = { 'Алатауский': 0.850 };
    render(<DistrictReadinessTable districtAverages={mockAverages} districtRisk={incompleteRisk} />);
    
    const dashes = screen.getAllByText('—');
    expect(dashes[0]).toBeInTheDocument();
    expect(dashes[0]).toHaveClass('text-gov-text-secondary');
  });

  test('renders empty state when no data provided', () => {
    render(<DistrictReadinessTable districtAverages={{}} districtRisk={{}} />);
    
    expect(screen.getByText(/нет данных для отображения/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});