import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from "react-toastify";
import { useLanguage } from '../../Contexts/LanguageContext'
import PhoneInputModule from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useOutletContext } from "react-router-dom";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function RoleAssignment() {
  const { isDarkMode } = useOutletContext();
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    phoneNo: false,
  });
  const roleOptions = ['User','Member', 'Admin'];
  const [formData, setFormData] = useState({
    phoneNo: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const handlePhoneChange = (phoneNumber, countryData) => {
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setFormData({
      ...formData,
      phoneNo: fullNumber,
    });
    if (phoneNumber) {
      setIsPhoneValid(isValidPhoneNumber(fullNumber));
    } else {
      setIsPhoneValid(true);
    }
    setTouchedFields({
      ...touchedFields,
      phoneNo: true,
    });
  };

  // Handle input changes for role assignment form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch all members on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("No token found. Please login.");
          setLoading(false);
          return;
        }

        const res = await fetch("https://welude-birhan-1.onrender.com/member/all_member", {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Session expired. Please login again.");
          } else if (res.status === 403) {
            toast.error("You don't have permission to view this data.");
          } else if (res.status === 404) {
            toast.error("Endpoint not found. Please check the URL.");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        let membersData = [];
        if (Array.isArray(data) && data.length > 0) {
          membersData = data;
          toast.success("Data retrieved successfully");
        } else if (Array.isArray(data) && data.length === 0) {
          toast.info("No members found");
          membersData = [];
        } else if (data.data && Array.isArray(data.data)) {
          membersData = data.data;
        } else if (typeof data === 'object' && data !== null) {
          membersData = [data];
        }
        
        setMembers(membersData);
        setFilteredMembers(membersData);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        toast.error(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Search function to filter members by phone number
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!formData.phoneNo) {
      toast.warning("Please enter a phone number to search");
      return;
    }

    if (!isPhoneValid) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSearching(true);
    
    const searchPhone = formData.phoneNo.replace(/\+/g, '').replace(/\s/g, '');
    
    const results = members.filter(member => {
      const memberPhone = (member.phoneNo || member.phone || member.phone_number || '')
        .replace(/\+/g, '')
        .replace(/\s/g, '');
      return memberPhone.includes(searchPhone) || memberPhone === searchPhone;
    });

    if (results.length > 0) {
      setFilteredMembers(results);
      toast.success(`Found ${results.length} member(s)`);
    } else {
      setFilteredMembers([]);
      toast.info("No members found with this phone number");
    }
    
    setSearching(false);
  };

  // Reset to show all members
  const handleReset = () => {
    setFilteredMembers(members);
    setFormData({ ...formData, phoneNo: '' });
    setIsPhoneValid(true);
    setTouchedFields({ ...touchedFields, phoneNo: false });
    setSelectedMember(null);
    toast.info("Showing all members");
  };

  // Handle role assignment
  const handleRoleAssignment = async(e) => {
    e.preventDefault();
    
    // Check if a member is selected
    if (!selectedMember) {
      toast.warning("Please search and select a member first");
      return;
    }

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    toast.success(`Role assigned to ${selectedMember.fullname || selectedMember.name}`);
    
    // Reset form after assignment
    setFormData({
      ...formData,
      email: '',
      password: '',
      confirmPassword: ''
    });
    setSelectedMember(null);
  };

  // Select a member from search results
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setFormData({
      ...formData,
      email: member.email || '',
    });
    toast.info(`Selected: ${member.fullname || member.name}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`h-screen flex justify-center items-center ${isDarkMode ? 'bg-[#081226] text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className="text-xl font-medium animate-pulse">Loading members...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:p-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#081226]' : 'bg-slate-50'}`}>
      <div className={`mb-8 p-8 rounded-3xl shadow-xl transition-colors duration-300 border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
        <h1 className={`text-3xl font-bold text-center mb-8 font-serif capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {t.roleAssign.title}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Search Section */}
          <div>
            <h2 className={`text-xl mb-6 font-bold capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Search Member</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.registration.phoneNumber}</label>
                <PhoneInput
                  country={"et"}
                  value={formData.phoneNo.replace('+', '')}
                  onChange={handlePhoneChange}
                  isValid={isPhoneValid}
                  inputClass={`!w-full !px-5 !py-3.5 !rounded-xl !transition-all focus:!outline-none focus:!ring-2 focus:!ring-amber-500/50 focus:!border-amber-500 ${isDarkMode ? '!bg-white/5 !text-white' : '!bg-slate-50 !text-slate-900'} ${
                    touchedFields.phoneNo && !isPhoneValid ? '!border-red-500' : (isDarkMode ? '!border-white/10' : '!border-slate-200')
                  }`}
                  containerClass="w-full"
                  buttonClass={`!rounded-l-xl ${isDarkMode ? '!bg-white/5 !border-white/10' : '!bg-slate-100 !border-slate-200'}`}
                  dropdownClass={isDarkMode ? '!bg-[#0b1b3d] !text-white !border-white/10' : '!bg-white !text-slate-900 !border-slate-200'}
                />
                {touchedFields.phoneNo && !isPhoneValid && (
                  <p className="text-red-400 text-sm mt-1">Please enter a valid phone number</p>
                )}
              </div>
              <div className='flex gap-3 pt-2'>
                <button 
                  type='submit'
                  disabled={searching}
                  className='flex-1 bg-amber-500 text-slate-900 font-bold px-6 py-3.5 capitalize rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors disabled:opacity-50'
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
                <button 
                  type='button'
                  onClick={handleReset}
                  className={`flex-1 font-bold px-6 py-3.5 capitalize rounded-xl transition-colors border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                >
                  Reset
                </button>
              </div>
            </form>
            
            {/* Selected Member Display */}
            {selectedMember && (
              <div className={`mt-6 p-5 rounded-2xl border ${isDarkMode ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                <p className="font-bold mb-2 text-sm uppercase tracking-wider opacity-80">Selected Member</p>
                <p className="text-lg font-medium">{selectedMember.fullname || selectedMember.name || '-'}</p>
                <p className="opacity-90">{selectedMember.phoneNo || selectedMember.phone || '-'}</p>
              </div>
            )}
          </div>

          {/* Role Assignment Section */}
          <div>
            <h2 className={`text-xl mb-6 font-bold capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Assign Role</h2>
            <form onSubmit={handleRoleAssignment} className="space-y-4">
              <input
                name="email"
                type="email"
                placeholder={t.roleAssign.email}
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 border ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
                required
              />

              <input
                name="password"
                type="password"
                placeholder={t.roleAssign.password}
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 border ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder={t.roleAssign.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 border ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                required
              >
                <option value="" disabled>Select Role</option>
                {roleOptions.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
              <div className='pt-2'>
                <button type='submit'
                  className='w-full bg-amber-500 text-slate-900 font-bold px-6 py-3.5 capitalize rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors'
                >
                  {t.roleAssign.assign}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Results Table */}
      <div className={`rounded-3xl shadow-xl overflow-hidden border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <h2 className={`text-xl font-bold capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Members List</h2>
          <span className={`text-sm px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            Showing {filteredMembers.length} of {members.length} members
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className='w-full text-left'>
            <thead className={`border-b ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
              <tr>
                <th className={`p-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.roleAssign.fullname}</th>
                <th className={`p-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.roleAssign.chrstianName}</th>
                <th className={`p-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.roleAssign.status}</th>
                <th className={`p-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.roleAssign.phone}</th>
                <th className={`p-4 font-medium text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`text-center p-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {members.length === 0 ? 'No members found' : 'No members match your search'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`border-b transition-colors ${
                      selectedMember === item 
                        ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200') 
                        : (isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50')
                    }`}
                  >
                    <td className={`p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {item.fullname || item.fullName || item.name || '-'}
                    </td>
                    <td className={`p-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.christianName || item.christian_name || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {item.currentStatus || item.status || '-'}
                      </span>
                    </td>
                    <td className={`p-4 font-mono text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.phoneNo || item.phone || item.phone_number || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleSelectMember(item)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${
                          selectedMember === item 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : (isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')
                        }`}
                      >
                        {selectedMember === item ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? "dark" : "light"} />
    </div>
  );
}
