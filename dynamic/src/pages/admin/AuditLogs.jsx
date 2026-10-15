import { useOutletContext } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function AuditLogs() {
  const { isDarkMode } = useOutletContext();
  
  // Dummy audit logs for now
  const logs = [
    { id: 1, action: 'User login', user: 'Admin', time: '2026-10-06 10:00 AM' },
    { id: 2, action: 'Role assigned to User1', user: 'Admin', time: '2026-10-06 10:15 AM' },
    { id: 3, action: 'Choir practice updated', user: 'Choir Leader', time: '2026-10-06 11:30 AM' },
  ];

  return (
    <div className={`p-6 lg:p-10 w-full min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#081226] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-amber-500" />
            <h2 className={`text-3xl font-bold font-serif capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Audit Logs</h2>
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>View and track all activities in the system</p>
        </div>
      </div>
      
      <div className={`rounded-3xl shadow-xl overflow-hidden border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-50 text-slate-500 border-slate-200'} border-b`}>
                <th className="px-6 py-4 font-bold">Time</th>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.map((log) => (
                <tr key={log.id} className={`border-b transition-colors ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.time}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{log.user}</td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
