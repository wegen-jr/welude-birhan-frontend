import  react  from "react";
import { User } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import profile from "../assets/account.png";
import { useLanguage } from "../Contexts/LanguageContext";
export default function Settings(){
    const navigate=useNavigate();
    const {t}=useLanguage();
    return(
        <div className="bg-amber-200 h-screen flex justify-center p-2">
            <div className="bg-[#4A1010] w-full md:w-100 h-screen rounded-2xl shadow-2xl shadow-[#4A1010]">
            <div className="flex flex-col justify-center items-center p-2 mt-5 text-amber-200">
                <img src={profile} alt="profile picture" className="w-20 h-20 rounded-full" />
            </div>
            <div className='flex justify-center'>
              <div className="h-px bg-amber-200 my-4 w-50 " />
            </div>
            <div className="flex flex-col px-10 py-5">
                <button onClick={()=>navigate('/dashboard/settings/profile')} className="flex items-center justify-start gap-3 hover:cursor-pointer hover:bg-amber-50/50 px-5 py-2 rounded-lg m-2">
                    <User className="w-7 h-7 text-amber-200"/>
                    <p className="text-amber-200 font-serif font-bold capitalize">{t.setting.profile}</p>
                </button>
                <button onClick={()=>navigate('/dashboard/settings/credentialsChanger')} className="flex items-center justify-start gap-3 hover:cursor-pointer hover:bg-amber-50/50 px-5 py-2 rounded-lg m-2">
                    <User className="w-7 h-7 text-amber-200"/>
                    <p className="text-amber-200 font-serif font-bold capitalize">{t.setting.changer}</p>
                </button>
                <button onClick={()=>navigate('/dashboard/settings/')} className="flex items-center justify-start gap-3 hover:cursor-pointer hover:bg-amber-50/50 px-5 py-2 rounded-lg m-2">
                    <User className="w-7 h-7 text-amber-200"/>
                    <p className="text-amber-200 font-serif font-bold capitalize">{t.setting.language}</p>
                </button>
                <button onClick={()=>navigate('/dashboard/settings/profile')} className="flex items-center justify-start gap-3 hover:cursor-pointer hover:bg-amber-50/50 px-5 py-2 rounded-lg m-2">
                    <User className="w-7 h-7 text-amber-200"/>
                    <p className="text-amber-200 font-serif font-bold capitalize">account</p>
                </button>
                <div className='flex justify-center'>
                    <div className="h-px bg-amber-200 my-4 w-50 " />
                </div>
                <div className="flex flex-col text-amber-200 font-serif justify-center items-center pt-10">
                    <p className="text-center m-2">{t.setting.moto}</p>
                    <p>©{t.setting.copyright}</p>
                </div>
            </div>
            </div>
        </div>
    )
}