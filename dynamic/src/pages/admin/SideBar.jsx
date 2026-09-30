import React from 'react'
import Logo from "../../assets/logo.png"; 
import { UserPlus,HomeIcon, BadgeCheck, Palette, Settings } from 'lucide-react'; 
import { useLanguage } from "../../Contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
export default function SideBar() {
    const{t,language, toggleLanguage}=useLanguage();
    const navigate = useNavigate();
    const nextLanguage = language === 'en' ? 'am' : 'en';

    return (
    <div>
        
        <div className='flex justify-center mt-5'>
            <img src={Logo} alt="logo" className='w-17 h-17 rounded-full' />
        </div>
        <div className='text-amber-200 capitalize font-serif text-center mt-2'>
            <p>{t.adminSide.title}</p>
        </div>
        <div className='flex justify-center'>
                <button className='bg-amber-200 border text-[#4A1010] font-bold border-yellow-400  px-2 hover:cursor-pointer'
                onClick={()=>toggleLanguage(nextLanguage)}>{nextLanguage==='am'?t.Navbar.Amh:t.Navbar.Eng}
                </button>
        </div>
        <div className='flex justify-center'>
             <div className="h-px bg-amber-200 my-4 w-50 " />
        </div>

        <div className='p-4 m-2 flex-col justify-center font-bold text-amber-200 '>
            <div className='flex gap-3 bg-amber-100/50 px-3 py-1 rounded-lg hover:bg-amber-200 hover:text-[#4A1010] mb-2'>
               <HomeIcon className='w-5 h-5 '/>
                <button className="hover:cursor-pointer" onClick={()=>navigate('/dashboard')} >
                    <p className='capitalize'>{t.adminSide.dashboard}</p>
                </button>
            </div>
            <div className='flex gap-3 bg-amber-100/50 px-3 py-1 rounded-lg hover:bg-amber-200 hover:text-[#4A1010] mb-2'>
               <UserPlus className='w-5 h-5 '/>
                <button className="hover:cursor-pointer" onClick={()=>navigate('/dashboard/registration')} >
                    <p className='capitalize'>{t.adminSide.registration}</p>
                </button>
            </div>
            <div className='flex gap-3 bg-amber-100/50 px-3 py-1 rounded-lg hover:bg-amber-200 hover:text-[#4A1010] mb-2'>
               <BadgeCheck className='w-5 h-5 '/>
                <button className="hover:cursor-pointer" onClick={()=>navigate('/dashboard/roleAssignemet')} >
                    <p className='capitalize'>{t.adminSide.roleAssigned}</p>
                </button>
            </div>
            <div className='flex gap-3 bg-amber-100/50 px-3 py-1 rounded-lg hover:bg-amber-200 hover:text-[#4A1010] mb-2'>
               <Settings className='w-5 h-5 '/>
                <button className="hover:cursor-pointer" onClick={()=>navigate('/dashboard/settings')} >
                    <p className='capitalize'>{t.adminSide.setting}</p>
                </button>
            </div>
        </div>

    </div>
  )
}
