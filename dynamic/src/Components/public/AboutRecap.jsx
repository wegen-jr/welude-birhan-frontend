import React from 'react';
import uniform from "../../assets/aboutRecap.png";
import { Clock, Calendar } from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

export default function AboutRecap() {
    const { t, language } = useLanguage();

    const programs = [
        t.recap.firstProgram,
        t.recap.secondProgram,
        t.recap.thirdProgram,
        t.recap.fourthProgram,
        t.recap.fifthProgram,
        t.recap.sixthProgram
    ];

    return (
        <section className='relative py-20 bg-[#081226] text-slate-100 overflow-hidden'>
            {/* Background Image with Overlay */}
            <div 
                className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                style={{ backgroundImage: `url(${uniform})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#081226] via-[#081226]/95 to-[#081226]/60 backdrop-blur-sm" />

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                    
                    {/* Content Side */}
                    <div className='order-2 lg:order-1 flex flex-col space-y-8'>
                        <div>
                            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-widest mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>{language === 'am' ? 'መርሃ ግብር' : 'Schedule'}</span>
                            </div>
                            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white capitalize leading-tight'>
                                {t.recap.title}
                            </h2>
                            <div className="w-20 h-1.5 bg-amber-500 mt-6 rounded-full" />
                        </div>

                        <div className='space-y-4'>
                            {programs.map((program, index) => (
                                <div 
                                    key={index} 
                                    className='flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300 backdrop-blur-md group'
                                >
                                    <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className='text-slate-200 text-sm md:text-base leading-relaxed font-medium'>
                                        {program}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className='order-1 lg:order-2 relative w-full h-full min-h-[300px] lg:min-h-[500px]'>
                        <div className="absolute -inset-4 bg-amber-500/20 rounded-[2.5rem] blur-2xl transform rotate-3" />
                        <div className="relative rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl h-full">
                            <img 
                                src={uniform} 
                                alt="Sunday School Students" 
                                className='absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700' 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-60 pointer-events-none" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
