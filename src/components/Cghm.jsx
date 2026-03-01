import { useEffect } from "react";
import alert from "../assets/alert.jpg";
import seamless from "../assets/seamless.jpeg";
import energy from "../assets/energy.jpg";
import weather from "../assets/wea.jpeg";

import {
  Cpu,
  ShieldCheck,
  Smartphone,
  Activity,
  Wifi,
  BatteryCharging,
  Thermometer,
  Cloud,
} from "lucide-react";
import Footer from "./Footer";

const CGHM = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: "Smart Monitoring",
      description:
        "Real-time tracking of environmental conditions with high precision sensors.",
      icon: <Activity className="w-6 h-6 text-green-500" />,
      image:alert,
    },
    {
      title: "Seamless Connectivity",
      description:
        "Stay connected with Wi-Fi and Bluetooth support for uninterrupted data transmission.",
      icon: <Wifi className="w-6 h-6 text-green-500" />,
      image: seamless,
    },
    {
      title: "Energy Efficient",
      description:
        "Optimized power consumption ensures longer battery life and sustainability.",
      icon: <BatteryCharging className="w-6 h-6 text-green-500" />,
      image: energy,
    },
    {
      title: "Weather Resistant",
      description:
        "Designed to withstand various environmental conditions for outdoor deployments.",
      icon: <Cloud className="w-6 h-6 text-green-500" />,
      image: weather,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-400">
      <div className="flex-grow flex justify-center items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl p-5 sm:p-8 md:p-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700 flex items-center justify-center gap-2">
            <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
            CGHM Device Overview
          </h2>

          <div className="text-center space-y-2">
            <p className="text-base sm:text-lg font-semibold text-gray-700">
              Introducing <span className="text-emerald-600">CGHM</span> – your
              comprehensive solution for health monitoring and data
              analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 shadow-md space-y-4"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-600 transition shadow-md">
              <Smartphone className="w-5 h-5" />
              Learn More About CGHM
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default CGHM;
