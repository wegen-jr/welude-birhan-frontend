import React from 'react'
import logo from "../assets/logo.png";
import trinity from "../assets/selassieChurch.png";
import { useLanguage } from "../Contexts/LanguageContext";
export default function LandingPage() {
  const {t}=useLanguage();
  return (
   <div
  className="relative h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${trinity})` }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[2px]" />

  {/* Content */}
  <div className="relative z-10 h-full pt-3">
      <div>
        <img src={logo} alt="cross section" className='w-32 h-32 rounded-full mx-auto' />
      </div>
      <div>
        <h1 className="text-4xl md:text-6xl font-bold text-center text-yellow-300 mt-4 capitalize font-serif">{t.home.title}</h1>
      </div>
      <div className="flex items-center justify-center gap-2 mt-5">
          <div className="h-px w-20 bg-[#B8872A] " />
          <span className="text-[#B8872A] tracking-wider">
            ✝️
          </span>
          <div className="h-px w-20 bg-[#B8872A] " />
        </div>
        <div>
                  <p className="text-4xl text-center text-white font-bold font-serif tracking-widest uppercase">{t.home.subtitle}</p>
                  <p className='text-lg text-center text-gray-400 font-serif font-bold tracking-widest uppercase'>{t.home.tagName}</p>
        </div>
        <div className='mt-5'>
          <p className='text-lg text-center text-gray-400 font-serif font-bold tracking-widest '>{t.home.description} </p>
        </div>
        <div className='flex items-center justify-center mt-2 gap-4 font-serif'>
                <button className='text-white font-bold capitalize rounded-full border-1 border-yellow-500 px-6 py-2 hover:bg-yellow-500 hover:cursor-pointer  '>{t.home.programs}</button>
                <button className='text-white font-bold capitalize rounded-full border-1 border-yellow-500 px-6 py-2 hover:bg-yellow-500 hover:cursor-pointer'>{t.home.learnMore}</button>
        </div>
        <div className='flex items-center justify-center gap-10 mt-4'>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-yellow-500 font-serif text-2xl font-bold'>200+</span>
            <span className='text-gray-400 font-serif capitalize tracking-wide'>{t.home.students}</span>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-yellow-500 font-serif text-2xl font-bold'>15+</span>
            <span className='text-gray-400 font-serif capitalize tracking-wide'>{t.home.teachers}</span>
          </div><div className='flex flex-col items-center justify-center'>
            <span className='text-yellow-500 font-serif text-2xl font-bold'>10+</span>
            <span className='text-gray-400 font-serif capitalize tracking-wide'>{t.home.yearsOfService}</span>
          </div><div className='flex flex-col items-center justify-center'>
            <span className='text-yellow-500 font-serif text-2xl font-bold'>+</span>
            <span className='text-gray-400 font-serif capitalize tracking-wide'>{t.home.orthodoxFaith}</span>
          </div>
        </div>
  </div>
</div>
  )
}
