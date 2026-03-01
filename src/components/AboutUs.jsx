import React from "react";
import {
  UserCircle,
  BadgeInfo,
  MonitorSmartphone,
  Info,
  Users,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import Footer from "../components/Footer.jsx";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-400 font-sans text-gray-800">
      {/* About Us Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-green-800 mb-4 flex justify-center items-center gap-2">
          <Users className="w-8 h-8 text-green-600 transition-transform transform hover:scale-110" />
          About Us
        </h2>
        <p className="text-md sm:text-lg text-center text-green-700 font-bold mb-12">
          This project is developed by the Research Scholars of N.I.T.
          Kurukshetra.
        </p>

        {/* Big Highlight Card*/}
        <div className="mb-12 bg-white/90 rounded-3xl p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Info className="w-8 h-8 text-green-600 transition-transform transform hover:scale-110" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-green-700">
              About Monitar Project
            </h3>
          </div>
          <p className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed">
            <Thermometer className="inline-block w-5 h-5 text-teal-500 mr-1" />
            Monitar is an innovative initiative aimed at smartly monitoring
            environmental parameters such as temperature and humidity. Developed
            by a dedicated team of research scholars, institute assistants, and
            technical developers from Greeninurja, this project integrates
            IoT-based hardware with modern web and mobile applications.
            <br />
            <br />
            <ShieldCheck className="inline-block w-5 h-5 text-green-500 mr-1" />
            Our mission is to empower users with real-time environmental
            insights that promote health and safety in various settings.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Research Team */}
          <div className="rounded-2xl p-6 bg-white/90 shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <UserCircle className="w-7 h-7 text-green-600 transition-transform transform hover:scale-110" />
              <h3 className="text-xl font-semibold text-green-700">
                Research Team (ECE Department N.I.T Kurukshetra)
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-700 font-medium">
              <li>1. Dileep Kumar,PhD (Project Research Scholar)</li>
              <li>
                2. Dr. N.P. Singh, Associate Professor (Project Supervisor)
              </li>
              <li>
                3. Dr. Gaurav Verma, Assistant Professor (Project Co-Supervisor)
              </li>
            </ul>
          </div>

          {/* Institute Assistant Team */}
          <div className="rounded-2xl p-6 bg-white/90 shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <BadgeInfo className="w-7 h-7 text-emerald-600 transition-transform transform hover:scale-110" />
              <h3 className="text-xl font-semibold text-emerald-700">
                Institute Assistant Team
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-700 font-medium">
              <li>1. Nisha Yadav, PhD(Research Scholar)</li>
            </ul>
          </div>

          {/* Technical Team */}
          <div className="rounded-2xl p-6 bg-white/90 shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <MonitorSmartphone className="w-7 h-7 text-teal-600 transition-transform transform hover:scale-110" />
              <h3 className="text-xl font-semibold text-teal-700">
                Technical Team of Greeninurja
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-700 font-medium">
              <li>1. Nitin Kumar (Full Stack Developer, IoT)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}

      <Footer />
    </div>
  );
};

export default AboutUs;
