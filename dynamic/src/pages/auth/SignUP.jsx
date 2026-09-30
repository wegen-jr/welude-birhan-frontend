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

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="email"
          type="email"
          className="w-full px-4 py-3 rounded-lg bg-blue-950 border border-yellow-500 text-white "
          placeholder={t.signUp.emailHolder}
          value={formData.email}
          onChange={handleChange}
        />

       <div className="md:col-span-2 font-bold capitalize">
            <PhoneInput
              country={"et"}
              value={formData.phone.replace('+', '')}
              placeholder={t.signUp.phoneHolder}
              onChange={handlePhoneChange}
              isValid={isPhoneValid}
              inputClass={`p-3 bg-blue-950 w-full border rounded capitalize w-full !text-white !bg-blue-950 ${
                touchedFields.phoneNo && !isPhoneValid ? '!border-red-500' : '!border-yellow-500'
              }`}
              containerClass="w-full"
              buttonClass="!bg-blue-900 !border-yellow-500 rounded-l"
              dropdownClass="!bg-blue-900 !text-white"
            />
            {touchedFields.phoneNo && !isPhoneValid && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid phone number</p>
            )}
          </div>

        <input
          name="password"
          type="password"
          className="w-full px-4 py-3 rounded-lg bg-blue-950 border border-yellow-500 text-white capitalize"
          placeholder={t.signUp.passwordHolder}
          value={formData.password}
          onChange={handleChange}
        />
        <input
          name="confirmPassword"
          type="password"
          className="w-full px-4 py-3 rounded-lg bg-blue-950 border border-yellow-500 text-white capitalize"
          placeholder={t.signUp.confirmPasswordHolder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-yellow-500 py-3 rounded-lg font-semibold hover:cursor-pointer hover:bg-yellow-600 transition-colors duration-300"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </AuthCard>
  );
}