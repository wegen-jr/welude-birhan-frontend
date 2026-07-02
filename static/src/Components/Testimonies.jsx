import React from 'react'
import uniform from "../assets/aboutRecap.png";
import { useLanguage } from "../Contexts/LanguageContext";

export default function Testimonies() {
  const {t}= useLanguage();

  return (
    <div>
        <div className='text-4xl text-yellow-300 font-serif font-semibold bg-blue-950 px-5 py-5'>
            <p> {t.testimonials.title}</p>
        </div>
      <div className='md:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2 bg-blue-950 p-5'>
            <div className='flex flex-col items-center  h-100 bg-white py-7 rounded-2xl mb-2 px-3'>
                <img src={uniform} alt="testimonies" className='w-15 h-15 rounded-full mb-2' />
                <div>{t.testimonials.firstTestimonial}</div>
            </div>
            <div className='flex flex-col items-center  h-100 bg-white py-7 rounded-2xl mb-2 px-3'>
                <img src={uniform} alt="testimonies" className='w-15 h-15 rounded-full mb-2' />
                <div>{t.testimonials.secondTestimonial}</div>
            </div>
            <div className='flex flex-col items-center   h-100 bg-white py-7 rounded-2xl mb-2 px-3'>
                <img src={uniform} alt="testimonies" className='w-15 h-15 rounded-full mb-2' />
                <div>{t.testimonials.thirdTestimonial}</div>
            </div>
            <div className='flex flex-col items-center  h-100 bg-white py-7 rounded-2xl mb-2 px-3'>
                <img src={uniform} alt="testimonies" className='w-15 h-15 rounded-full mb-2' />
                <div>{t.testimonials.fourthTestimonial}</div>
            </div>
      </div>
    </div>
  )
}
