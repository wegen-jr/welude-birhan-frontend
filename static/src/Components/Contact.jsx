import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../Contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  return (

    <section id="contact" className="bg-blue-950 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-yellow-500">{t.contact.title}</h2>
          <p className="text-gray-600 mt-3">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="text-yellow-500" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-500 ">{t.contact.address[0]}</h3>
                <p className="text-white capitalize">
                  {t.contact.address[1]}
                  <br />
                  {t.contact.address[2]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-yellow-500" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-500">{t.contact.phone}</h3>
                <p className="text-white">+251 9XX XXX XXX</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="text-yellow-500" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-500">{t.contact.email}</h3>
                <p className="text-white">
                  info@silassiesundayschool.org
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form className="bg-[#501502] text-white p-6 rounded-2xl ">
            <div className="mb-4">
              <label className="block mb-2 font-medium">{t.contact.fullname}</label>
              <input
                type="text"
                placeholder={t.contact.fullname}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">{t.contact.email}</label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">{t.contact.message}</label>
              <textarea
                rows="5"
                placeholder="መልዕክትዎን ይጻፉ..."
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="bg-yellow-300 text-black px-6 py-3 rounded-lg hover:bg-indigo-700 transition hover:cursor-pointer"
            >
              {t.contact.sendMessage}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}