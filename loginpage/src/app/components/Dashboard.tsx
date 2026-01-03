import { User } from '../App';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-900">DayFlow</h1>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
            Welcome back!
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                <p className="text-neutral-600 mb-1">Employee ID</p>
                <p className="font-medium text-neutral-900">{user.employeeId}</p>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                <p className="text-neutral-600 mb-1">Email</p>
                <p className="font-medium text-neutral-900">{user.email}</p>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                <p className="text-neutral-600 mb-1">Role</p>
                <p className="font-medium text-neutral-900">
                  {user.role === 'HR' ? 'Admin / HR Officer' : 'Employee'}
                </p>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                <p className="text-neutral-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-medium text-neutral-900">Active</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">Dashboard</h3>
              <p className="text-blue-800">
                You have successfully logged in to DayFlow. This is your personalized dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
