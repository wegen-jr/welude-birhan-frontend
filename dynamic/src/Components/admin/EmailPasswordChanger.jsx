// components/settings/EmailPasswordChanger.jsx
import React, { useState } from 'react';
import { Mail, Lock, Check, X, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import {  ArrowBigLeft } from 'lucide-react';

export default function EmailPasswordChanger({ currentEmail }) {
    const Navigate=useNavigate();
  
    // Email state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: '',
    password: ''
  });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailLoading, setEmailLoading] = useState(false);

  // Password state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'red-500'
  });

  // ============ EMAIL FUNCTIONS ============
  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!emailData.newEmail) {
      newErrors.newEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      newErrors.newEmail = 'Please enter a valid email';
    }
    
    if (!emailData.confirmEmail) {
      newErrors.confirmEmail = 'Please confirm your email';
    } else if (emailData.newEmail !== emailData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }
    
    if (!emailData.password) {
      newErrors.password = 'Current password is required';
    }

    setEmailErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }

    setEmailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://welude-birhan-1.onrender.com/user/change-email', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change email');
      }

      toast.success('Email changed successfully!');
      handleEmailCancel();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailCancel = () => {
    setIsEditingEmail(false);
    setEmailData({
      newEmail: '',
      confirmEmail: '',
      password: ''
    });
    setEmailErrors({});
  };

  // ============ PASSWORD FUNCTIONS ============
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { label: 'Very Weak', color: 'red-500' },
      1: { label: 'Weak', color: 'red-400' },
      2: { label: 'Fair', color: 'yellow-500' },
      3: { label: 'Good', color: 'green-400' },
      4: { label: 'Strong', color: 'green-500' },
      5: { label: 'Very Strong', color: 'green-600' },
      6: { label: 'Excellent', color: 'green-700' },
    };

    const scoreIndex = Math.min(Math.floor(score / 1.2), 6);
    setPasswordStrength({
      score: scoreIndex,
      label: strengthMap[scoreIndex].label,
      color: strengthMap[scoreIndex].color
    });
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://welude-birhan-1.onrender.com/user/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      handlePasswordCancel();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setPasswordStrength({ score: 0, label: 'Weak', color: 'red-500' });
  };
  const goBack=()=>{
    Navigate(-1);
  }
  return (
    <div className="bg-amber-200  flex justify-center p-2">
      {/* ========== CHANGE EMAIL SECTION ========== */}
        <div className='bg-[#4A1010] w-full md:w-100 h-screen rounded-2xl shadow-2xl shadow-[#4A1010] p-5'>
            <button onClick={goBack} className="hover:cursor-pointer"> 
            <ArrowBigLeft className="w-5 h-5 text-amber-200"/>
          </button>
        <div className="bg-[#4A1010]  p-6 ">
        {!isEditingEmail ? (
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-amber-200 font-medium mb-1 flex items-center gap-2">
                <Mail size={18} />
                Email Address
              </h3>
              <p className="text-amber-200/70">{currentEmail || 'Not set'}</p>
            </div>
            <button
              onClick={() => setIsEditingEmail(true)}
              className="bg-amber-200 text-[#4A1010] px-4 py-2 rounded-lg 
                         hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <Mail size={18} />
              Change Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <h3 className="text-amber-200 font-medium flex items-center gap-2">
              <Mail size={20} />
              Change Email Address
            </h3>
            
            <div>
              <label className="block text-amber-200 text-sm font-medium mb-1">
                New Email Address
              </label>
              <input
                type="email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                placeholder="Enter new email"
                className={`w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                           focus:outline-none focus:ring-2 focus:ring-amber-200
                           ${emailErrors.newEmail ? 'border-2 border-red-500' : ''}`}
              />
              {emailErrors.newEmail && (
                <p className="text-red-400 text-sm mt-1">{emailErrors.newEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-medium mb-1">
                Confirm New Email
              </label>
              <input
                type="email"
                value={emailData.confirmEmail}
                onChange={(e) => setEmailData({...emailData, confirmEmail: e.target.value})}
                placeholder="Confirm new email"
                className={`w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                           focus:outline-none focus:ring-2 focus:ring-amber-200
                           ${emailErrors.confirmEmail ? 'border-2 border-red-500' : ''}`}
              />
              {emailErrors.confirmEmail && (
                <p className="text-red-400 text-sm mt-1">{emailErrors.confirmEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={emailData.password}
                onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                placeholder="Enter current password"
                className={`w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                           focus:outline-none focus:ring-2 focus:ring-amber-200
                           ${emailErrors.password ? 'border-2 border-red-500' : ''}`}
              />
              {emailErrors.password && (
                <p className="text-red-400 text-sm mt-1">{emailErrors.password}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={emailLoading}
                className="bg-amber-200 text-[#4A1010] px-6 py-2 rounded-lg 
                           hover:bg-amber-100 transition-colors flex items-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? (
                  <>
                    <span className="animate-spin">⚪</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Update Email
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleEmailCancel}
                className="bg-red-600 text-white px-6 py-2 rounded-lg 
                           hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========== CHANGE PASSWORD SECTION ========== */}
      <div className="bg-[#4A1010] rounded-2xl p-6">
        {!isEditingPassword ? (
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-amber-200 font-medium mb-1 flex items-center gap-2">
                <Lock size={18} />
                Password
              </h3>
              <p className="text-amber-200/70">••••••••</p>
            </div>
            <button
              onClick={() => setIsEditingPassword(true)}
              className="bg-amber-200 text-[#4A1010] px-4 py-2 rounded-lg 
                         hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <Lock size={18} />
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="text-amber-200 font-medium flex items-center gap-2">
              <Shield size={20} />
              Change Password
            </h3>
            
            <div>
              <label className="block text-amber-200 text-sm font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  className={`w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                             focus:outline-none focus:ring-2 focus:ring-amber-200
                             ${passwordErrors.currentPassword ? 'border-2 border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  className="absolute right-3 top-2.5 text-[#4A1010] hover:text-[#6A2020]"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, newPassword: e.target.value});
                    checkPasswordStrength(e.target.value);
                  }}
                  placeholder="Enter new password (min 8 characters)"
                  className={`w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                             focus:outline-none focus:ring-2 focus:ring-amber-200
                             ${passwordErrors.newPassword ? 'border-2 border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  className="absolute right-3 top-2.5 text-[#4A1010] hover:text-[#6A2020]"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-amber-200/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm text-${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              
              {passwordErrors.newPassword && (
                <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                             focus:outline-none focus:ring-2 focus:ring-amber-200
                             ${passwordErrors.confirmPassword ? 'border-2 border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  className="absolute right-3 top-2.5 text-[#4A1010] hover:text-[#6A2020]"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-amber-200 text-[#4A1010] px-6 py-2 rounded-lg 
                           hover:bg-amber-100 transition-colors flex items-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <span className="animate-spin">⚪</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Update Password
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePasswordCancel}
                className="bg-red-600 text-white px-6 py-2 rounded-lg 
                           hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
        </div>
      
    </div>
  );
}