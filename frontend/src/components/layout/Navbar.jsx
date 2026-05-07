import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/profile': 'Profile',
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.includes('/projects/new') ? 'New Project' : null) ||
    (location.pathname.includes('/projects/') && location.pathname.includes('/edit') ? 'Edit Project' : null) ||
    (location.pathname.includes('/projects/') ? 'Project Details' : null) ||
    (location.pathname.includes('/tasks/new') ? 'New Task' : null) ||
    (location.pathname.includes('/tasks/') ? 'Task Details' : null) ||
    'TaskFlow';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="text-lg font-semibold text-slate-900 flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-slate-500">{user?.name}</span>
        <Avatar name={user?.name} size="sm" />
      </div>
    </header>
  );
};

export default Navbar;
