import { useAuth } from '../../context/AuthContext';
import { formatDate, getInitials } from '../../utils';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Your account information</p>
      </div>

      <Card>
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-slate-500">{user?.email}</p>
            <span className={`mt-1.5 inline-block text-xs px-2.5 py-1 rounded-full font-medium ${user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.role}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</label>
              <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Permissions</h3>
        <div className="space-y-2 text-sm">
          {user?.role === 'ADMIN' ? (
            [
              'Create & manage projects',
              'Add/remove team members',
              'Create & assign tasks',
              'Delete projects and tasks',
              'View analytics dashboard',
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-2 text-slate-700">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {perm}
              </div>
            ))
          ) : (
            [
              { label: 'View assigned projects', allowed: true },
              { label: 'View assigned tasks', allowed: true },
              { label: 'Update task status (assigned tasks)', allowed: true },
              { label: 'Create projects', allowed: false },
              { label: 'Create & assign tasks', allowed: false },
              { label: 'Delete tasks or projects', allowed: false },
            ].map(({ label, allowed }) => (
              <div key={label} className="flex items-center gap-2 text-slate-700">
                {allowed ? (
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={allowed ? '' : 'text-slate-400'}>{label}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
