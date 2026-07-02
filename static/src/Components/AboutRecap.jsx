import React from 'react'
import uniform from "../assets/aboutRecap.png";
import { Code, Brush, Smartphone, Icon } from "lucide-react";
import {useLanguage} from "../Contexts/LanguageContext";
export default function AboutRecap() {
    const {t} = useLanguage();

  return (
    <div className='bg-blue-950 relative bg-cover bg-center bg-no-repeat  '
            style={{ backgroundImage: `url(${uniform})` }}>
     <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[2px]" />
      <div className='relative sm:grid sm:grid-cols-2 bg-transparent p-5'>
            <div className='bg-[#e73306] bg-transparent border-1 border-yellow-300 px-2'>
                <div className='relative text-xl md:text-4xl lg:text-6xl font-bold font-serif text-center text-yellow-300 mt-4'>{t.recap.title}</div>
                <div className='mt-10'>
                    <div className='text-white flex items-center justify-start gap-2 mt-5 text-lg md:text-2xl '>
                    <Brush />
                    <p>{t.recap.firstProgram}</p>
                </div>
                <div className='text-white flex items-center justify-start gap-2 mt-5 text-lg md:text-2xl '>
                    <Brush />
                    <p>{t.recap.secondProgram}</p>
                </div><div className='text-white flex items-center justify-start gap-2 mt-5 text-lg md:text-2xl '>
                    <Brush />
                    <p>{t.recap.thirdProgram}</p>
                </div><div className='text-white flex items-center justify-start gap-2 mt-5 text-lg md:text-2xl '>
                    <Brush />
                    <p>{t.recap.fourthProgram}</p>
                </div><div className='text-white flex items-center justify-start gap-2 mt-5 text-lg md:text-2xl '>
                    <Brush />
                    <p>{t.recap.fifthProgram}</p>
                </div><div className='text-white flex items-center justify-start gap-2 mt-5 text-lg md:text-2xl '>
                    <Brush />
                    <p>{t.recap.sixthProgram}</p>
                </div>
                </div>
            </div>
            <div className='w-ful h-ful'>
                <img src={uniform} alt="senbet temariwoch" className='w-cover' />
            </div>
      </div>
    </div>
  )
}
