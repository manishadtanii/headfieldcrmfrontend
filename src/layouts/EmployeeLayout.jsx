import { Outlet } from 'react-router-dom';
export default function EmployeeLayout() {
  return <div className="app-layout"><main className="main-content" style={{marginLeft:0}}><Outlet /></main></div>;
}
