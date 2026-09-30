import React, { useState } from "react";
import { useLanguage } from "../../Contexts/LanguageContext";
import { toast } from "react-toastify";
import PhoneInputModule from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

// Safely unwrap the CommonJS default export for Vite
const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function Registration() {
  const { t } = useLanguage();
  const status = t.registration.status || [];
  const statusLabels = t.registration.statusLabels || {};

  const [formData, setFormData] = useState({
    fullname: "",
    christianName: "",
    Age: "", // Keep as "Age" to match backend
    gender: "MALE",
    phoneNo: "",
    duration: "",
    repentanceName: "",
    repentancePhone: "",
    familyName: "",
    familyPhone: "",
    familyAddress: "",
    currentStatus: "",
  });

  // Validation states for phone inputs
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isRepentancePhoneValid, setIsRepentancePhoneValid] = useState(true);
  const [isFamilyPhoneValid, setIsFamilyPhoneValid] = useState(true);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track which fields have been touched for validation
  const [touchedFields, setTouchedFields] = useState({
    phoneNo: false,
    repentancePhone: false,
    familyPhone: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle field blur for validation
  const handleBlur = (fieldName) => {
    setTouchedFields({
      ...touchedFields,
      [fieldName]: true,
    });
  };

  // Phone input handlers
  const handlePhoneChange = (phoneNumber, countryData) => {
    // Store with + prefix for consistency
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

  const handleRepentancePhoneChange = (phoneNumber, countryData) => {
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setFormData({
      ...formData,
      repentancePhone: fullNumber,
    });
    if (phoneNumber) {
      setIsRepentancePhoneValid(isValidPhoneNumber(fullNumber));
    } else {
      setIsRepentancePhoneValid(true);
    }
    setTouchedFields({
      ...touchedFields,
      repentancePhone: true,
    });
  };

  const handleFamilyPhoneChange = (phoneNumber, countryData) => {
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setFormData({
      ...formData,
      familyPhone: fullNumber,
    });
    if (phoneNumber) {
      setIsFamilyPhoneValid(isValidPhoneNumber(fullNumber));
    } else {
      setIsFamilyPhoneValid(true);
    }
    setTouchedFields({
      ...touchedFields,
      familyPhone: true,
    });
  };

  // ---------------- VALIDATION RULES ----------------

  const validate = () => {
    // Full name validation
    if (!formData.fullname.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (formData.fullname.trim().length < 10) {
      toast.error("Full name must be at least 10 characters");
      return false;
    }

    // Christian name validation
    if (!formData.christianName.trim()) {
      toast.error("Christian name is required");
      return false;
    }

    // Age validation - using "Age" to match backend
    const ageNum = Number(formData.Age);
    if (!formData.Age || isNaN(ageNum) || ageNum < 6 || ageNum > 120) {
      toast.error("Age must be between 6 and 120");
      return false;
    }

    // Phone number validation
    if (!formData.phoneNo) {
      toast.error("Phone number is required");
      return false;
    }
    const phoneFull = formData.phoneNo.startsWith('+') ? formData.phoneNo : `+${formData.phoneNo}`;
    if (!isValidPhoneNumber(phoneFull)) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Duration validation
    const durationNum = Number(formData.duration);
    if (!formData.duration || isNaN(durationNum) || durationNum <= 0) {
      toast.error("Duration must be a positive number");
      return false;
    }

    // Repentance name validation
    if (!formData.repentanceName.trim()) {
      toast.error("Repentance name is required");
      return false;
    }

    // Repentance phone validation
    if (!formData.repentancePhone) {
      toast.error("Repentance phone is required");
      return false;
    }
    const repentanceFull = formData.repentancePhone.startsWith('+') ? 
      formData.repentancePhone : `+${formData.repentancePhone}`;
    if (!isValidPhoneNumber(repentanceFull)) {
      toast.error("Please enter a valid repentance phone number");
      return false;
    }

    // Family name validation
    if (!formData.familyName.trim()) {
      toast.error("Family name is required");
      return false;
    }

    // Family phone validation
    if (!formData.familyPhone) {
      toast.error("Family phone is required");
      return false;
    }
    const familyFull = formData.familyPhone.startsWith('+') ? 
      formData.familyPhone : `+${formData.familyPhone}`;
    if (!isValidPhoneNumber(familyFull)) {
      toast.error("Please enter a valid family phone number");
      return false;
    }

    // Family address validation
    if (!formData.familyAddress.trim()) {
      toast.error("Family address is required");
      return false;
    }

    // Current status validation
    if (!formData.currentStatus) {
      toast.error("Please select current status");
      return false;
    }

    return true;
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Prepare the data to match backend expectations
      const submitData = {
        fullname: formData.fullname,
        christianName: formData.christianName,
        Age: Number(formData.Age), // Ensure Age is a number
        gender: formData.gender,
        phoneNo: formData.phoneNo,
        duration: Number(formData.duration), // Ensure duration is a number
        repentanceName: formData.repentanceName,
        repentancePhone: formData.repentancePhone,
        familyName: formData.familyName,
        familyPhone: formData.familyPhone,
        familyAddress: formData.familyAddress,
        currentStatus: formData.currentStatus,
      };

      console.log("Sending data:", submitData); // Debug log

      

      // Try the first endpoint first
      const response = await fetch("https://welude-birhan-1.onrender.com/member/creat_member", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", response.status); // Debug log

      // Check if response is OK
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (e2) {
            // Ignore
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success(data.message || "Registered successfully!");
      
      // Reset form on success
      setFormData({
        fullname: "",
        christianName: "",
        Age: "",
        gender: "MALE",
        phoneNo: "",
        duration: "",
        repentanceName: "",
        repentancePhone: "",
        familyName: "",
        familyPhone: "",
        familyAddress: "",
        currentStatus: "",
      });
      
      // Reset validation states
      setIsPhoneValid(true);
      setIsRepentancePhoneValid(true);
      setIsFamilyPhoneValid(true);
      setTouchedFields({
        phoneNo: false,
        repentancePhone: false,
        familyPhone: false,
      });

    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-200 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-[#4A1010] text-amber-200 p-6 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          {t.registration.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="fullname"
            placeholder={t.registration.fullname}
            onChange={handleChange}
            value={formData.fullname}
            className="p-3 bg-amber-100 border border-yellow-500 rounded capitalize text-[#4A1010]"
            required
          />

          <input
            name="christianName"
            placeholder={t.registration.christianName}
            onChange={handleChange}
            value={formData.christianName}
            className="p-3 bg-amber-100 border  rounded capitalize text-[#4A1010]"
            required
          />

          <input
            name="Age"
            type="number"
            placeholder={t.registration.age}
            onChange={handleChange}
            value={formData.Age}
            min="6"
            max="120"
            className="p-3 bg-amber-100 rounded capitalize text-[#4A1010]"
            required
          />

          <select
            name="gender"
            onChange={handleChange}
            value={formData.gender}
            className="p-3 bg-amber-100 border rounded capitalize text-[#4A1010]"
            required
          >
            <option value="MALE">{t.registration.sex[0]}</option>
            <option value="FEMALE">{t.registration.sex[1]}</option>
          </select>

          {/* Phone Input 1 - phoneNo */}
          <div className="md:col-span-2 text-amber-200 font-bold capitalize">
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
          </div>

          <input
            name="duration"
            type="number"
            placeholder={t.registration.duration}
            onChange={handleChange}
            value={formData.duration}
            min="1"
            className="p-3 bg-amber-100 rounded capitalize text-[#4A1010]"
            required
          />

          <input
            name="repentanceName"
            placeholder={t.registration.repentanceName}
            onChange={handleChange}
            value={formData.repentanceName}
            className="p-3 bg-amber-100  rounded capitalize text-[#4A1010]"
            required
          />

          {/* Phone Input 2 - repentancePhone */}
          <div className="md:col-span-2 text-amber-200 font-bold capitalize">
            <label>{t.registration.repentancePhone}</label>
            <PhoneInput
              country={"et"}
              value={formData.repentancePhone.replace('+', '')}
              onChange={handleRepentancePhoneChange}
              isValid={isRepentancePhoneValid}
              placeholder={t.registration.repentancePhone}
              inputClass={`p-3 bg-amber-00 border rounded capitalize w-full !text-[#4A1010] !bg-amber-100${
                touchedFields.repentancePhone && !isRepentancePhoneValid ? '!border-red-500' : '!border-yellow-500'
              }`}
              containerClass="w-full"
              buttonClass="!bg-amber-200 !border-yellow-500 rounded-l"
              dropdownClass="!bg-amber-200 !text-[#4A1010]"
            />
            {touchedFields.repentancePhone && !isRepentancePhoneValid && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid phone number</p>
            )}
          </div>

          <input
            name="familyName"
            placeholder={t.registration.familyName}
            onChange={handleChange}
            value={formData.familyName}
            className="p-3 bg-amber-100 rounded capitalize text-[#4A1010]"
            required
          />

          {/* Phone Input 3 - familyPhone */}
          <div className="md:col-span-2 text-amber-200 font-bold capitalize">
            <label>{t.registration.familyPhone}</label>
            <PhoneInput
              country={"et"}
              value={formData.familyPhone.replace('+', '')}
              onChange={handleFamilyPhoneChange}
              isValid={isFamilyPhoneValid}
              placeholder={t.registration.familyPhone}
              inputClass={`p-3 bg-amber-100 border rounded capitalize w-full !text-[#4A1010] !bg-amber-100 ${
                touchedFields.familyPhone && !isFamilyPhoneValid ? '!border-red-500' : '!border-yellow-500'
              }`}
              containerClass="w-full"
              buttonClass="!bg-amber-200 !border-yellow-500 rounded-l"
              dropdownClass="!bg-amber-200 !text-[#4A1010]"
            />
            {touchedFields.familyPhone && !isFamilyPhoneValid && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid phone number</p>
            )}
          </div>

          <input
            name="familyAddress"
            placeholder={t.registration.address}
            onChange={handleChange}
            value={formData.familyAddress}
            className="p-3 bg-amber-100  rounded md:col-span-2 capitalize text-[#4A1010]"
            required
          />

          <select
            name="currentStatus"
            value={formData.currentStatus}
            onChange={handleChange}
            className="p-3 bg-amber-100  rounded md:col-span-2 capitalize text-[#4A1010]"
            required
          >
            <option value="" disabled>
             {t.registration.statusDefault}
            </option>
            {status.map((item) => (
              <option key={item} value={item}>
                 {statusLabels[item] || item}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 bg-amber-200 text-[#4A1010] font-bold py-3 rounded hover:bg-amber-100 hover:cursor-pointer capitalize disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-100"
        >
          {isSubmitting ? "Registering..." : t.registration.register}
        </button>
      </form>
    </div>
  );
}