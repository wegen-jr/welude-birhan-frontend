import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import PhoneInputModule from 'react-phone-input-2';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { 
  X, 
  User, 
  Phone, 
  Edit3, 
  HeartHandshake, 
  Shield, 
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
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
    updateLocalMember,
    removeMember,
  } = useMembers();

  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Edit Modal State - full 12 registration fields
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    fullname: '',
    christianName: '',
    Age: '',
    gender: 'MALE',
    phoneNo: '',
    durationMonth: '',
    repentanceName: '',
    repentancePhone: '',
    familyFullname: '',
    familyPhone: '',
    familyAddress: '',
    currentStatus: 'ACTIVE',
  });
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
      role: member.role ? member.role : 'USER',
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
      await memberService.updateMember(memberId, { phoneNo: dbPhone, phone: dbPhone });
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
      await memberService.updateMember(memberId, { currentStatus: newStatus });
      updateLocalMember(memberId, { currentStatus: newStatus, status: newStatus });
      if (selectedMember && (selectedMember._id || selectedMember.id) === memberId) {
        setSelectedMember({ ...selectedMember, currentStatus: newStatus, status: newStatus });
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Open modal and populate all 12 registration fields
  const openEditModal = (member) => {
    setEditFormData({
      id: member._id || member.id,
      fullname: member.fullname || member.fullName || member.name || '',
      christianName: member.christianName || member.christian_name || '',
      Age: member.Age ?? member.age ?? '',
      gender: member.gender || member.sex || 'MALE',
      phoneNo: member.phoneNo || member.phone || member.phone_number || '',
      durationMonth: member.durationMonth ?? member.duration ?? '',
      repentanceName: member.repentanceName || '',
      repentancePhone: member.repentancePhone || '',
      familyFullname: member.familyFullname || member.familyName || '',
      familyPhone: member.familyPhone || '',
      familyAddress: member.familyAddress || '',
      currentStatus: member.currentStatus || member.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  // Submit all 12 registration fields via PATCH /member/:id
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdatingMember(true);
    try {
      const updateData = {
        fullname: editFormData.fullname?.trim(),
        christianName: editFormData.christianName?.trim(),
        Age: editFormData.Age !== '' ? Number(editFormData.Age) : undefined,
        gender: editFormData.gender,
        phoneNo: editFormData.phoneNo?.trim(),
        duration: editFormData.durationMonth !== '' ? Number(editFormData.durationMonth) : undefined,
        repentanceName: editFormData.repentanceName?.trim(),
        repentancePhone: editFormData.repentancePhone?.trim(),
        familyName: editFormData.familyFullname?.trim(),
        familyPhone: editFormData.familyPhone?.trim(),
        familyAddress: editFormData.familyAddress?.trim(),
        currentStatus: editFormData.currentStatus,
      };

      // Strip out undefined values to avoid schema validation rejections
      const cleanPayload = {};
      Object.entries(updateData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          cleanPayload[key] = val;
        }
      });

      console.log("[RoleAssignment] Submitting PATCH /member/:id payload:", cleanPayload);
      await memberService.updateMember(editFormData.id, cleanPayload);

      // Local state update with synchronized aliases
      const localUpdate = {
        ...cleanPayload,
        age: cleanPayload.Age,
        sex: cleanPayload.gender,
        phone: cleanPayload.phoneNo,
        durationMonth: cleanPayload.duration,
        familyFullname: cleanPayload.familyName,
        status: cleanPayload.currentStatus,
      };

      updateLocalMember(editFormData.id, localUpdate);

      if (selectedMember && (selectedMember._id || selectedMember.id) === editFormData.id) {
        setSelectedMember(prev => ({ ...prev, ...localUpdate }));
      }

      toast.success('Member profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update member:", err);
      toast.error(err.message || 'Failed to update member');
    } finally {
      setUpdatingMember(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const memberId = deleteTarget._id || deleteTarget.id;
    setIsDeleting(true);
    try {
      const success = await removeMember(memberId);
      if (success) {
        if (selectedMember && (selectedMember._id || selectedMember.id) === memberId) {
          setSelectedMember(null);
        }
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
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
                    <p className="text-xs text-slate-500 uppercase font-bold">Age</p>
                    <p className="font-medium font-mono">{selectedMember.Age ?? selectedMember.age ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Sex (Gender)</p>
                    <p className="font-medium capitalize">{selectedMember.gender || selectedMember.sex || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Current Status</p>
                    <span className={`px-2 py-1 text-xs rounded-md font-bold mt-1 inline-block ${selectedMember.currentStatus === 'ACTIVE' || selectedMember.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {selectedMember.currentStatus || selectedMember.status || '-'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Phone</p>
                    <p className="font-medium font-mono text-xs mt-1">{selectedMember.phoneNo || selectedMember.phone || '-'}</p>
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
                <option value="MEMBER_USER">MEMBER_USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
                <option value="CHOIR_LEADER">CHOIR_LEADER</option>
                <option value="EDUCATION_LEADER">EDUCATION_LEADER</option>
                <option value="FINANCE_LEADER">FINANCE_LEADER</option>
                <option value="PR_LEADER">PR_LEADER</option>
                <option value="SECRETARIAT_LEADER">SECRETARIAT_LEADER</option>
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
                <th className="p-4 font-medium">Age</th>
                <th className="p-4 font-medium">Sex</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Phone Number</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-400">No members found</td>
                </tr>
              ) : (
                filteredMembers.map((item) => {
                  const itemId = item._id || item.id;
                  const isCurrent = (selectedMember?._id || selectedMember?.id) === itemId;
                  const currentStatus = item.currentStatus || item.status;
                  const ageValue = item.Age ?? item.age ?? '-';
                  const genderValue = item.gender || item.sex || '-';

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
                      <td className="p-4 font-mono text-sm text-slate-400">{ageValue}</td>
                      <td className="p-4 text-sm text-slate-400 capitalize">{genderValue}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                          currentStatus === 'ACTIVE' 
                            ? 'bg-green-500/20 text-green-500' 
                            : currentStatus === 'STUDENT' 
                            ? 'bg-blue-500/20 text-blue-500' 
                            : 'bg-slate-500/20 text-slate-500'
                        }`}>
                          {currentStatus || '-'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-400">
                        {item.phoneNo || item.phone || item.phone_number || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center items-center">
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
                            <option value="STUDENT">STUDENT</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>

                          <button
                            onClick={() => setDeleteTarget(item)}
                            title="Delete Member"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Comprehensive Edit Member Details Modal (All 12 Registration Fields) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all ${
            isDarkMode ? 'bg-[#0b1b3d] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-6 pb-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif">Edit Member Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update all 12 church registration profile attributes via PATCH /member/:id
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Section 1: Personal Identification */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <User className="w-4 h-4" />
                  <span>1. Personal Identification</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Full Legal Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nahom Ketema"
                      value={editFormData.fullname}
                      onChange={(e) => setEditFormData({ ...editFormData, fullname: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Christian / Baptism Name */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Christian / Baptism Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Haile Mariam"
                      value={editFormData.christianName}
                      onChange={(e) => setEditFormData({ ...editFormData, christianName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Age <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="130"
                      required
                      placeholder="e.g. 24"
                      value={editFormData.Age}
                      onChange={(e) => setEditFormData({ ...editFormData, Age: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Sex / Gender */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Sex / Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="MALE" className="bg-slate-900 text-white">Male (ወንድ)</option>
                      <option value="FEMALE" className="bg-slate-900 text-white">Female (ሴት)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Church Service */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <Phone className="w-4 h-4" />
                  <span>2. Contact & Church Status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Phone Number */}
                  <div className="sm:col-span-1">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Primary Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0911223344 or +251..."
                      value={editFormData.phoneNo}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneNo: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Duration in Months */}
                  <div className="sm:col-span-1">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Duration in Months
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 12"
                      value={editFormData.durationMonth}
                      onChange={(e) => setEditFormData({ ...editFormData, durationMonth: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Current Status */}
                  <div className="sm:col-span-1">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Current Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editFormData.currentStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, currentStatus: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="ACTIVE" className="bg-slate-900 text-white">ACTIVE</option>
                      <option value="STUDENT" className="bg-slate-900 text-white">STUDENT</option>
                      <option value="TEACHER" className="bg-slate-900 text-white">TEACHER</option>
                      <option value="INACTIVE" className="bg-slate-900 text-white">INACTIVE</option>
                      <option value="YOUNG" className="bg-slate-900 text-white">YOUNG</option>
                      <option value="FIRST_CLASS" className="bg-slate-900 text-white">FIRST_CLASS</option>
                      <option value="SECOND_CLASS" className="bg-slate-900 text-white">SECOND_CLASS</option>
                      <option value="THIRD_CLASS" className="bg-slate-900 text-white">THIRD_CLASS</option>
                      <option value="SPECIAL_STANDARD" className="bg-slate-900 text-white">SPECIAL_STANDARD</option>
                      <option value="HONORARY_MEMBER" className="bg-slate-900 text-white">HONORARY_MEMBER</option>
                      <option value="OUT_OF_TOWN" className="bg-slate-900 text-white">OUT_OF_TOWN</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Spiritual Guidance (Abba Neseha) */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <Shield className="w-4 h-4" />
                  <span>3. Spiritual Guidance (የንስሐ አባት)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Repentance Father Name */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Repentance Father Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gibre Kidan"
                      value={editFormData.repentanceName}
                      onChange={(e) => setEditFormData({ ...editFormData, repentanceName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Repentance Phone */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Repentance Father Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +251911223344"
                      value={editFormData.repentancePhone}
                      onChange={(e) => setEditFormData({ ...editFormData, repentancePhone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Family & Emergency Contact */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <HeartHandshake className="w-4 h-4" />
                  <span>4. Family & Emergency Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Family Full Name */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Family / Contact Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abebe Ketema"
                      value={editFormData.familyFullname}
                      onChange={(e) => setEditFormData({ ...editFormData, familyFullname: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Family Phone */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Family Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0912556677"
                      value={editFormData.familyPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, familyPhone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Family Address */}
                  <div className="sm:col-span-2">
                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">
                      Family Living Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dire Dawa, Kebele 02"
                      value={editFormData.familyAddress}
                      onChange={(e) => setEditFormData({ ...editFormData, familyAddress: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingMember}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingMember ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border transition-all ${
            isDarkMode ? 'bg-[#0b1b3d] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Member</h3>
                <p className="text-xs text-slate-400">Permanent removal confirmation</p>
              </div>
            </div>

            <p className="text-sm mb-6 leading-relaxed opacity-90">
              Are you sure you want to delete <span className="font-bold underline decoration-red-500/50">{deleteTarget.fullname || deleteTarget.name || 'this member'}</span>? This will permanently remove their record from the database.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isDarkMode ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
}
