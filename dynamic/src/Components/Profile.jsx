import React, { useState, useRef, useEffect } from "react";
import { UserPlus, Camera, Save, X, ArrowBigLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import profile from "../assets/account.png";
import camera from "../assets/camera.svg";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate=useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);
const goBack=()=>{
  navigate(-1);
}
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://welude-birhan-1.onrender.com/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || ''
        });
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    await uploadProfileImage(file);
  };

  // Upload profile image
  const uploadProfileImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://welude-birhan-1.onrender.com/user/upload-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setProfileImage(data.imageUrl);
      setPreview(null);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  // Remove profile picture
  const handleRemoveImage = async () => {
    if (!profileImage) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://welude-birhan-1.onrender.com/user/remove-profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove image');
      }

      setProfileImage(null);
      setPreview(null);
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error(error.message || 'Failed to remove image');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save user data
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://welude-birhan-1.onrender.com/user/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-amber-200 min-h-screen flex justify-center p-4">
      <div className="bg-[#4A1010] w-full max-w-2xl rounded-2xl shadow-2xl shadow-[#4A1010] p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={goBack} className="hover:cursor-pointer"> 
            <ArrowBigLeft className="w-5 h-5 text-amber-200"/>
          </button>
          <h2 className="text-2xl font-bold text-amber-200">Profile Settings</h2>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-200 text-[#4A1010] px-4 py-2 rounded-lg 
                     hover:bg-amber-100 transition-colors flex items-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-200 bg-amber-100">
              {(preview || profileImage) ? (
                <img
                  src={preview || profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={profile}
                  alt="Default profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Camera Button Overlay */}
            <button
              onClick={triggerFileInput}
              disabled={loading}
              className="absolute bottom-0 right-0 bg-amber-200 text-[#4A1010] p-2 
                         rounded-full hover:bg-amber-100 transition-colors shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={20} />
            </button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Image Actions */}
          {profileImage && (
            <button
              onClick={handleRemoveImage}
              className="mt-2 text-red-400 text-sm hover:text-red-300 transition-colors"
            >
              Remove Photo
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex justify-center">
          <div className="h-px bg-amber-200 w-full max-w-md" />
        </div>

        {/* User Details Form */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-amber-200 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                         focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                         focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                         focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block text-amber-200 text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows="3"
              className="w-full px-4 py-2 rounded-lg bg-amber-100 text-[#4A1010] 
                         focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
            />
          </div>
        </div>

        {/* Save Button (Mobile) */}
        <div className="mt-6 flex justify-center md:hidden">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-200 text-[#4A1010] px-6 py-2 rounded-lg 
                     hover:bg-amber-100 transition-colors w-full
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}