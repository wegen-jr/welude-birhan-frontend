import React from 'react'
import { Outlet } from "react-router-dom";
import HomeNavBar from '../Components/HomeNavBar';
import Footer from '../Components/Footer';
export default function HomeLayout() {
  return (
    <div className='flex flex-col'>
        <div className='w-full h-14 bg-blue-950 border-y border-yellow-300 sticky top-0 z-50'>
            <HomeNavBar/>
        </div>
        <div className='flex-1 overflow-y-auto '>
           
            <Outlet/>
            <Footer />
        </div>
    </div>
  )
}
