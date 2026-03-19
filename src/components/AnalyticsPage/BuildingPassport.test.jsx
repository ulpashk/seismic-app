import { render, screen } from '@testing-library/react';
import BuildingPassport from './BuildingPassport';

describe('BuildingPassport Component', () => {
  
  test('renders correct total buildings risk value', () => {
    render(<BuildingPassport totalBuildings={50} totalBuildingsRisk={200} />);
    
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  test('renders formatted number with locale', () => {
    render(<BuildingPassport totalBuildings={1000} totalBuildingsRisk={10000} />);
    
    expect(screen.getByText('10 000')).toBeInTheDocument();
  });

  test('calculates and displays correct ratio', () => {
    render(<BuildingPassport totalBuildings={50} totalBuildingsRisk={200} />);
    
    expect(screen.getByText('25.00%')).toBeInTheDocument();
  });

  test('shows 0% when totalBuildingsRisk is 0', () => {
    render(<BuildingPassport totalBuildings={50} totalBuildingsRisk={0} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('shows dash when totalBuildingsRisk is 0', () => {
    render(<BuildingPassport totalBuildings={50} totalBuildingsRisk={0} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('shows dash when totalBuildingsRisk is undefined', () => {
    render(<BuildingPassport totalBuildings={50} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('renders static labels', () => {
    render(<BuildingPassport totalBuildings={50} totalBuildingsRisk={200} />);
    
    expect(screen.getByText(/здания в г. Алматы/i)).toBeInTheDocument();
    expect(screen.getByText(/прошли паспортизацию/i)).toBeInTheDocument();
    expect(screen.getByText('2018')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

});