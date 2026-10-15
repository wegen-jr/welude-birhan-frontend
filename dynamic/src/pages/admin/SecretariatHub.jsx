import { useState } from 'react';
import { Search, CheckCircle, XCircle, Key } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';

export function SecretariatHub() {
  const { members, loading, approveMember, rejectMember } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');

  const displayMembers = Array.isArray(members) ? members : [];
  const filtered = displayMembers.filter(m => 
    (m.name || m.fullname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.baptismName || m.christianName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.phone || m.phoneNo || '').includes(searchTerm)
  );


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Secretariat / HR</h1>
        <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2">
          <Key className="w-4 h-4" /> Generate Credentials
        </button>
      </div>

      <div className="bg-surface rounded-3xl p-6 border border-slate-800">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name, Baptism Name, or Phone..."
              className="w-full bg-background border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-4 font-medium">Name</th>
                <th className="py-4 font-medium">Baptism Name</th>
                <th className="py-4 font-medium">Phone</th>
                <th className="py-4 font-medium">Status</th>
                <th className="py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="py-4 text-white">{member.name}</td>
                  <td className="py-4 text-slate-300">{member.baptismName}</td>
                  <td className="py-4 text-slate-300">{member.phone}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 flex items-center justify-end gap-2">
                    {member.status === 'pending' && (
                      <>
                        <button onClick={() => approveMember(member.id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => rejectMember(member.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="py-8 text-center text-slate-400">Loading members...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-8 text-center text-slate-500">No members found</div>
          )}
        </div>
      </div>
    </div>
  );
}
