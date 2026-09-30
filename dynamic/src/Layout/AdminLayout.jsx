import React from 'react'
import { Outlet } from "react-router-dom";
import SideBar from "../pages/admin/SideBar";
export default function AdminLayout() {
  return (
    
    <div className='flex h-screen  overflow-hidden'>
      
          <aside className='w-84 border-r bg-[#4A1010] overflow-y-auto'>
                <SideBar />
          </aside>
        
        <div className='flex-1 overflow-y-auto'> 
            <Outlet />
        </div>
    </div>
  )
}
