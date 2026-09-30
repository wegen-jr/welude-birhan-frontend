import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from "react-toastify";
import { useLanguage } from '../../Contexts/LanguageContext'
import PhoneInputModule from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function RoleAssignment() {
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
      <div className="bg-amber-200 h-screen p-5 flex justify-center items-center">
        <div className="text-[#4A1010] text-xl">Loading members...</div>
      </div>
    );
  }

  return (
    <div className='bg-amber-200 min-h-screen p-5'>
      <div className="bg-[#4A1010] gap-4 mb-8 p-5 rounded-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-200 capitalize">
          {t.roleAssign.title}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Search Section */}
          <div className="text-amber-200 font-bold capitalize">
            <h2 className="text-xl mb-4 text-amber-100">Search Member</h2>
            <form onSubmit={handleSearch}>
              <label>{t.registration.phoneNumber}</label>
              <PhoneInput
                country={"et"}
                value={formData.phoneNo.replace('+', '')}
                onChange={handlePhoneChange}
                isValid={isPhoneValid}
                inputClass={`p-3 bg-amber-100 border rounded capitalize w-full !text-[#4A1010] !bg-amber-100 ${
                  touchedFields.phoneNo && !isPhoneValid ? '!border-red-500' : '!border-yellow-500'
                }`}
                containerClass="w-full"
                buttonClass="!bg-amber-200 !border-yellow-500 rounded-l"
                dropdownClass="!bg-amber-200 !text-[#4A1010]"
              />
              {touchedFields.phoneNo && !isPhoneValid && (
                <p className="text-red-400 text-sm mt-1">Please enter a valid phone number</p>
              )}
              <div className='my-4 flex gap-2'>
                <button 
                  type='submit'
                  disabled={searching}
                  className='bg-amber-100 text-[#4A1010] font-bold px-6 py-2 capitalize rounded-lg shadow-2xl shadow-amber-200 hover:cursor-pointer hover:bg-amber-200 disabled:opacity-50'
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
                <button 
                  type='button'
                  onClick={handleReset}
                  className='bg-gray-300 text-[#4A1010] font-bold px-6 py-2 capitalize rounded-lg hover:bg-gray-400'
                >
                  Reset
                </button>
              </div>
            </form>
            
            {/* Selected Member Display */}
            {selectedMember && (
              <div className="mt-4 p-3 bg-amber-100 rounded-lg text-[#4A1010]">
                <p className="font-bold">Selected Member:</p>
                <p>Name: {selectedMember.fullname || selectedMember.name || '-'}</p>
                <p>Phone: {selectedMember.phoneNo || selectedMember.phone || '-'}</p>
              </div>
            )}
          </div>

          {/* Role Assignment Section */}
          <div className='flex flex-col gap-2'>
            <h2 className="text-xl text-amber-100 font-bold capitalize">Assign Role</h2>
            <form onSubmit={handleRoleAssignment}>
              <input
                name="email"
                type="email"
                placeholder={t.roleAssign.email}
                value={formData.email}
                onChange={handleInputChange}
                className="p-3 bg-amber-100 border border-[#4A1010] rounded  text-[#4A1010] w-full mb-2"
                required
              />

              <input
                name="password"
                type="password"
                placeholder={t.roleAssign.password}
                value={formData.password}
                onChange={handleInputChange}
                className="p-3 bg-amber-100 border border-[#4A1010] rounded  text-[#4A1010] w-full mb-2"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder={t.roleAssign.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="p-3 bg-amber-100 border border-[#4A1010] rounded  text-[#4A1010] w-full mb-2"
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="p-3 bg-amber-100 border border-[#4A1010] rounded  text-[#4A1010] w-full mb-2"
                required
              >
                <option value="" disabled>Select Role</option>
                {roleOptions.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
              <div className='text-center mt-4'>
                <button type='submit'
                  className='bg-amber-100 text-[#4A1010] font-bold px-8 py-2 capitalize rounded-lg shadow-2xl shadow-amber-200 hover:cursor-pointer hover:bg-amber-200'
                >
                  {t.roleAssign.assign}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Results Table */}
      <div className='bg-[#4A1010] rounded-lg overflow-hidden'>
        <div className='bg-amber-100'>
          <div className="flex justify-between items-center p-3 bg-[#4A1010] text-amber-100">
            <span>Members List</span>
            <span className="text-sm">
              Showing {filteredMembers.length} of {members.length} members
            </span>
          </div>
          <table className='w-full'>
            <thead className='bg-[#4A1010] text-amber-100'>
              <tr>
                <th className="p-3">{t.roleAssign.fullname}</th>
                <th className="p-3">{t.roleAssign.chrstianName}</th>
                <th className="p-3">{t.roleAssign.status}</th>
                <th className="p-3">{t.roleAssign.phone}</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-[#4A1010]">
                    {members.length === 0 ? 'No members found' : 'No members match your search'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-[#4A1010] hover:bg-amber-200 transition-colors ${
                      selectedMember === item ? 'bg-amber-200' : ''
                    }`}
                  >
                    <td className="p-3 text-center text-[#4A1010]">
                      {item.fullname || item.fullName || item.name || '-'}
                    </td>
                    <td className="p-3 text-center text-[#4A1010]">
                      {item.christianName || item.christian_name || '-'}
                    </td>
                    <td className="p-3 text-center text-[#4A1010]">
                      {item.currentStatus || item.status || '-'}
                    </td>
                    <td className="p-3 text-center text-[#4A1010]">
                      {item.phoneNo || item.phone || item.phone_number || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleSelectMember(item)}
                        className={`px-3 py-1 rounded text-sm font-bold ${
                          selectedMember === item 
                            ? 'bg-green-600 text-white' 
                            : 'bg-[#4A1010] text-amber-100 hover:bg-[#6B2020]'
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
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}