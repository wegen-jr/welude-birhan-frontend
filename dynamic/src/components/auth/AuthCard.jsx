import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/selassieChurch.png";
import { ArrowBigLeftIcon } from "lucide-react";

export default function AuthCard({ title, subtitle, haveAccount, signIn, children }) {
  return (
    <div className="min-h-screen bg-[#081226] flex font-sans">
      {/* Left side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0b1b3d] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-[#081226]/80 to-[#081226]/40" />
        
        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <div className="mb-8">
            <img 
              src={logo} 
              alt="Welude Birhan Logo" 
              className="w-28 h-28 object-contain bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl" 
            />
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
            Welcome to <br/><span className="text-amber-400">Welude Birhan</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            Holy Trinity Sunday School - working for the spiritual growth of children and youth based on the Orthodox Tewahdo faith.
          </p>
        </div>
      </div>

      {/* Right side - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile background effect */}
        <div className="absolute inset-0 lg:hidden bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgImage})` }} />
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#081226] via-[#081226]/95 to-[#081226]" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
             <img 
                src={logo} 
                alt="Welude Birhan Logo" 
                className="w-20 h-20 object-contain bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-xl" 
              />
          </div>

          <div className="bg-[#0b1b3d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <Link to='/' className="text-amber-500 hover:text-amber-400 transition-colors">
                  <ArrowBigLeftIcon />
                </Link>
                  <h1 className="text-3xl font-bold text-amber-500 mb-3 font-serif tracking-wide">
                    {title}
                  </h1>
              </div>
              <p className="text-slate-400 text-sm">
                {subtitle}
              </p>
            </div>

            {children}

            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              {haveAccount && signIn && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <p>{haveAccount}</p>
                  <Link to='/' className="text-amber-400 font-semibold hover:text-amber-300 transition-colors hover:underline">
                    {signIn}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}