import React from "react";
import logo from "../../assets/logo.png";
import  ChurchImage  from "../../assets/selassieChurch.png";
export default function Home() {
  return (
    <main
      className="relative min-h-[calc(100vh)] bg-cover bg-center bg-no-repeat"
    >
      <div 
        className="absolute inset-0"
      >
        <img
          src={ChurchImage}
          alt="Background"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#050b18]/70" />
      </div>
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl">

          {/* Logo */}
          <img
            src={logo}
            alt="Welude Birhan"
            className="mx-auto mb-8 h-28 w-28 rounded-full object-cover shadow-2xl"
          />

          {/* Institution */}
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.35em] text-[#d4af5a]">
            Ethiopian Orthodox Tewahedo Church Sunday School
          </p>

          {/* Main title */}
          <h1 className="font-serif text-6xl font-semibold tracking-wide text-white md:text-8xl">
            Welude Birhan
          </h1>

          {/* Divider */}
          <div className="my-7 flex items-center justify-center gap-4 text-[#d4af5a]">
            <span className="h-px w-16 bg-[#d4af5a]/70" />
            <span className="text-2xl">†</span>
            <span className="h-px w-16 bg-[#d4af5a]/70" />
          </div>

          {/* Subtitle */}
          <h2 className="font-serif text-2xl text-[#e4c978] md:text-3xl">
            Holy Trinity Sunday School
          </h2>

          {/* Location */}
          <p className="mt-5 text-sm tracking-wide text-[#d4af5a]">
            Holy Trinity Cathedral, Dire Dawa, Ethiopia
          </p>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
            Nurturing the next generation in the ancient, living faith,
            holy liturgy, and sacred apostolic tradition of the Ethiopian
            Orthodox Tewahedo Church.
          </p>

        </div>
      </div>
    </main>
  );
}
