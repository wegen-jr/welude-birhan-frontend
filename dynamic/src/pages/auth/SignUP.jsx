import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../Components/auth/AuthCard";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../Contexts/LanguageContext";
import PhoneInputModule from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

export default function SignUp() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const { t } = useLanguage();

  const [isPhoneValid, setIsPhoneValid] = useState(true);


  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [formData,setFormData]=useState({
    email:"",
    phone:"",
    password:""
  })
 const [touchedFields, setTouchedFields] = useState({
    phoneNo: false,
    repentancePhone: false,
    familyPhone: false,
  });
  const handlePhoneChange = (phoneNumber, countryData) => {
    // Store with + prefix for consistency
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setFormData({
      ...formData,
      phone: fullNumber
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.email || !formData.phone || !formData.password || !confirmPassword){
      toast.error("Please fill all fields");
      return;
    }
    if(formData.password !== confirmPassword){
      toast.error("Passwords do not match");
      return;
    }
    const res = await register(formData);

    if (!res.success) {
      toast.error(res.data?.message || "Signup failed");
      return;
    }

    toast.success("Account created");

    setTimeout(() => navigate("/"), 500);
  };

  return (
    <AuthCard
      title={t.signUp.title}
      subtitle={t.signUp.subtitle}
      haveAccount={t.signUp.haveAccount}
      signIn={t.signUp.signIn}
    >
      <ToastContainer />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="email"
            type="email"
            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all backdrop-blur-sm"
            placeholder={t.signUp.emailHolder}
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="font-medium text-slate-300">
            <PhoneInput
              country={"et"}
              value={formData.phone.replace('+', '')}
              placeholder={t.signUp.phoneHolder}
              onChange={handlePhoneChange}
              isValid={isPhoneValid}
              inputClass={`!w-full !px-5 !py-3.5 !rounded-xl !text-white !bg-white/5 !transition-all !backdrop-blur-sm focus:!outline-none focus:!ring-2 focus:!ring-amber-500/50 focus:!border-amber-500 ${
                touchedFields.phoneNo && !isPhoneValid ? '!border-red-500' : '!border-white/10'
              }`}
              containerClass="w-full"
              buttonClass="!bg-white/5 !border-white/10 !rounded-l-xl"
              dropdownClass="!bg-[#0b1b3d] !text-white !border-white/10"
            />
            {touchedFields.phoneNo && !isPhoneValid && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid phone number</p>
            )}
        </div>

        <div>
          <input
            name="password"
            type="password"
            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all backdrop-blur-sm"
            placeholder={t.signUp.passwordHolder}
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            name="confirmPassword"
            type="password"
            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all backdrop-blur-sm"
            placeholder={t.signUp.confirmPasswordHolder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-[#081226] py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </AuthCard>
  );
}