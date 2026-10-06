import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Music, 
  Megaphone, 
  DollarSign,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Sidebar({ role }) {
  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/secretariat', icon: Users, label: 'Secretariat / HR' },
    { to: '/admin/education', icon: BookOpen, label: 'Education' },
    { to: '/admin/choir', icon: Music, label: 'Choir & Arts' },
    { to: '/admin/pr', icon: Megaphone, label: 'PR & Comms' },
    { to: '/admin/finance', icon: DollarSign, label: 'Finance' },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/classes', icon: BookOpen, label: 'My Classes' },
  ];

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/progress', icon: GraduationCap, label: 'My Progress' },
    { to: '/student/schedule', icon: ClipboardList, label: 'Schedule' },
  ];

  let links = studentLinks;
  if (role === 'admin') links = adminLinks;
  if (role === 'teacher') links = teacherLinks;

  return (
    <div className="w-64 bg-surface border-r border-slate-800 h-full flex flex-col p-4">
      <div className="flex items-center gap-3 mb-8 px-2 text-accent">
        <div className="p-2 bg-accent/10 rounded-xl">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-lg leading-tight text-white">Welude Birhan</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/teacher' || link.to === '/student'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium',
                isActive 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              )
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
