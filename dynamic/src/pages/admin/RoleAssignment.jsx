import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import PhoneInputModule from 'react-phone-input-2';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useLanguage } from '../../Contexts/LanguageContext';
import { useMembers } from '../../hooks/useMembers';
import { useRoleAssign } from '../../hooks/useRoleAssign';
import { memberService } from '../../services/memberService';

import 'react-phone-input-2/lib/style.css';
import 'react-toastify/dist/ReactToastify.css';

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function RoleAssignment() {
  const { isDarkMode } = useOutletContext();
  const { t } = useLanguage();

  const {
    members,
    filteredMembers,
    loading,
    searchMembers,
    updateLocalMember
  } = useMembers();

  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile card phone state
  const [dbPhone, setDbPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [updatingPhone, setUpdatingPhone] = useState(false);

  // Role Assignment form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });

  const { assignRole, submitting } = useRoleAssign((memberId, updatedFields) => {
    updateLocalMember(memberId, updatedFields);
    setFormData({ email: '', password: '', confirmPassword: '', role: 'USER' });
    setSelectedMember(null);
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updatingMember, setUpdatingMember] = useState(false);

  useEffect(() => {
    searchMembers(searchQuery);
  }, [searchQuery, searchMembers]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);

    const rawPhone = member.phoneNo || member.phone || member.phone_number || '';
    setDbPhone(rawPhone);

    // validate initial phone
    const fullNumber = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    try {
      setIsPhoneValid(isValidPhoneNumber(fullNumber));
    } catch {
      setIsPhoneValid(false);
    }

    setFormData((prev) => ({
      ...prev,
      email: member.email || '',
      role: member.role ? member.role.toUpperCase() : 'USER',
    }));
    toast.info(`Selected: ${member.fullname || member.name || 'Member'}`);
  };

  const handleDbPhoneChange = (phone) => {
    setDbPhone(phone);
    if (!phone) {
      setIsPhoneValid(true);
      return;
    }
    const fullNumber = phone.startsWith('+') ? phone : `+${phone}`;
    try {
      setIsPhoneValid(isValidPhoneNumber(fullNumber));
    } catch {
      setIsPhoneValid(false);
    }
  };

  const handleUpdateDbPhone = async () => {
    if (!selectedMember) return;
    const memberId = selectedMember._id || selectedMember.id;
    setUpdatingPhone(true);
    try {
      await memberService.updateMember(memberId, { phone: dbPhone });
      updateLocalMember(memberId, { phone: dbPhone, phoneNo: dbPhone });
      // Update selected member locally so UI reflects change
      setSelectedMember({ ...selectedMember, phone: dbPhone, phoneNo: dbPhone });
      toast.success('Database phone updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update phone');
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.warning('Please select a member from the list first');
      return;
    }
    if (!formData.email) {
      toast.error('Email address is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    await assignRole({
      member: selectedMember,
      phone: selectedMember.phoneNo || selectedMember.phone,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });
  };

  const handleStatusToggle = async (member, newStatus) => {
    const memberId = member._id || member.id;
    try {
      await memberService.updateMember(memberId, { currentStatus: newStatus, status: newStatus });
      updateLocalMember(memberId, { currentStatus: newStatus, status: newStatus });
      if (selectedMember && (selectedMember._id || selectedMember.id) === memberId) {
        setSelectedMember({ ...selectedMember, currentStatus: newStatus, status: newStatus });
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const openEditModal = (member) => {
    setEditFormData({
      id: member._id || member.id,
      fullname: member.fullname || member.fullName || member.name || '',
      christianName: member.christianName || member.christian_name || '',
      phone: member.phoneNo || member.phone || member.phone_number || '',
      age: member.age || '',
      sex: member.sex || member.gender || '',
      status: member.currentStatus || member.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdatingMember(true);
    try {
      const updateData = {
        fullname: editFormData.fullname,
        christianName: editFormData.christianName,
        phone: editFormData.phone,
        age: editFormData.age,
        sex: editFormData.sex,
        currentStatus: editFormData.status,
        status: editFormData.status
      };
      await memberService.updateMember(editFormData.id, updateData);
      updateLocalMember(editFormData.id, updateData);
      if (selectedMember && (selectedMember._id || selectedMember.id) === editFormData.id) {
        setSelectedMember({ ...selectedMember, ...updateData });
      }
      toast.success('Member details updated successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update member');
    } finally {
      setUpdatingMember(false);
    }
  };

  if (loading) {
    return (
      <div className={`h-screen flex justify-center items-center ${isDarkMode ? 'bg-[#081226] text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className="text-xl font-medium animate-pulse">Loading members registry...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:p-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#081226]' : 'bg-slate-50'}`}>
      <div className={`mb-8 p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
        <h1 className={`text-3xl font-bold text-center mb-8 font-serif capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {t?.roleAssign?.title || 'Role Assignment'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Selected Member Profile & DB Phone Sync */}
          <div>
            <h2 className={`text-xl mb-6 font-bold capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Selected Member Profile</h2>
            {selectedMember ? (
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Full Name</p>
                    <p className="font-medium">{selectedMember.fullname || selectedMember.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Christian Name</p>
                    <p className="font-medium">{selectedMember.christianName || selectedMember.christian_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Age / Gender</p>
                    <p className="font-medium">{selectedMember.age || '-'} / {selectedMember.sex || selectedMember.gender || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Current Status</p>
                    <span className={`px-2 py-1 text-xs rounded-md font-bold mt-1 inline-block ${selectedMember.currentStatus === 'ACTIVE' || selectedMember.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {selectedMember.currentStatus || selectedMember.status || '-'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 border-slate-200 dark:border-white/10">
                  <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Registered Phone Number (DB Sync)</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <PhoneInput
                        country="et"
                        value={dbPhone}
                        onChange={handleDbPhoneChange}
                        isValid={isPhoneValid}
                        inputClass={`!w-full !px-4 !py-2.5 !rounded-lg !transition-all focus:!outline-none focus:!ring-2 focus:!ring-amber-500/50 ${isDarkMode ? '!bg-white/5 !text-white' : '!bg-white !text-slate-900'} ${!isPhoneValid ? '!border-red-500' : (isDarkMode ? '!border-white/10' : '!border-slate-200')}`}
                        containerClass="w-full"
                        buttonClass={`!rounded-l-lg ${isDarkMode ? '!bg-white/5 !border-white/10' : '!bg-slate-100 !border-slate-200'}`}
                        dropdownClass={isDarkMode ? '!bg-[#0b1b3d] !text-white !border-white/10' : '!bg-white !text-slate-900 !border-slate-200'}
                      />
                    </div>
                    <button
                      onClick={handleUpdateDbPhone}
                      disabled={updatingPhone || !dbPhone || dbPhone === (selectedMember.phoneNo || selectedMember.phone)}
                      className="bg-blue-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      {updatingPhone ? 'Updating...' : 'Update DB Phone'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-10 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-50'}`}>
                <div className="text-4xl mb-4 opacity-50">👤</div>
                <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Select a member from the directory below to view their profile and update their database record.</p>
              </div>
            )}
          </div>

          {/* Role & Credentials Form */}
          <div>
            <h2 className={`text-xl mb-6 font-bold capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Assign Role & Credentials</h2>
            <form onSubmit={handleSubmitRole} className="space-y-4" noValidate>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-5 py-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
              />

              <input
                type="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-5 py-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-5 py-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
              />

              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`w-full px-5 py-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              >
                <option value="USER">USER</option>
                <option value="MEMBER">MEMBER_USER</option>
                <option value="ADMIN">ADMIN</option>

              </select>

              <button
                type="submit"
                disabled={submitting || !selectedMember}
                className="w-full bg-amber-500 text-slate-900 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Assigning Role...' : 'Assign Role'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className={`rounded-3xl shadow-xl overflow-hidden border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <h2 className="text-xl font-bold">Members Directory</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name, christian name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full md:w-80 px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
            />
            <span className={`text-sm px-4 py-2 rounded-full whitespace-nowrap ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
              {filteredMembers.length} of {members.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b ${isDarkMode ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <tr>
                <th className="p-4 font-medium">Full Name</th>
                <th className="p-4 font-medium">Christian Name</th>
                <th className="p-4 font-medium">Age / Sex</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Phone Number</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-400">No members found</td>
                </tr>
              ) : (
                filteredMembers.map((item) => {
                  const itemId = item._id || item.id;
                  const isCurrent = (selectedMember?._id || selectedMember?.id) === itemId;
                  const currentStatus = item.currentStatus || item.status;

                  return (
                    <tr
                      key={itemId}
                      className={`border-b transition-colors ${isCurrent
                        ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200')
                        : (isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50')
                        }`}
                    >
                      <td className="p-4 font-medium">{item.fullname || item.fullName || item.name || '-'}</td>
                      <td className="p-4 text-slate-400">{item.christianName || item.christian_name || '-'}</td>
                      <td className="p-4 text-slate-400">{item.age || '-'} / {item.sex || item.gender || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${currentStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : currentStatus === 'STUDENT' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-500/20 text-slate-500'}`}>
                          {currentStatus || '-'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-400">
                        {item.phoneNo || item.phone || item.phone_number || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleSelectMember(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isCurrent ? 'bg-amber-500 text-slate-900' : (isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')}`}
                          >
                            {isCurrent ? 'Selected' : 'Select'}
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                          >
                            Edit
                          </button>

                          <select
                            value={currentStatus || ''}
                            onChange={(e) => handleStatusToggle(item, e.target.value)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer ${isDarkMode ? 'bg-white/10 text-white border-none' : 'bg-slate-200 text-slate-800 border-none'}`}
                          >
                            <option value="" disabled>Status</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="STUDENT">STUDENT</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-[#0b1b3d] border border-white/10' : 'bg-white border border-slate-200'}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Edit Member Details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullname}
                    onChange={(e) => setEditFormData({ ...editFormData, fullname: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Christian Name</label>
                  <input
                    type="text"
                    value={editFormData.christianName}
                    onChange={(e) => setEditFormData({ ...editFormData, christianName: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Age</label>
                  <input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sex</label>
                  <select
                    value={editFormData.sex}
                    onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingMember}
                  className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {updatingMember ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
}
