import React from "react";
import image1 from "../assets/img1.jpg";
import temp from "../assets/temp1.jpg";
import humidity from "../assets/humidity.jpg";
import alert from "../assets/alert.jpg";
import {
  Thermometer,
  Droplets,
  BellRing,
  ArrowRightCircle,
} from "lucide-react";
import { Link } from "react-router-dom"
import Footer from "./Footer";

const Home = () => {
  return (
    <div className="font-sans text-gray-800">
      <section className="bg-gradient-to-br from-green-100 via-emerald-200 to-green-400 min-h-screen flex flex-col md:flex-row items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="max-w-xl md:w-1/2 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-red-900 mb-4">
            Health Monitoring System
          </h1>
          <p className="text-lg sm:text-xl mb-6 text-green-900">
            Smart Health Monitoring System provides real-time Data logging and health parameters data to keep you updated about your health and well-being. Designed for research about health monitoring accuracy, and ease of use.
          </p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition duration-300 shadow-md flex items-center gap-2 mx-auto sm:mx-0">
            Learn More <ArrowRightCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <img
            src={image1}
            alt="Health Monitoring Device"
            className="rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>
      <section className="bg-white py-16 px-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700 mb-12">
          Why Choose Our System?
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Real-Time Temperature Card */}
          <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <Thermometer className="w-10 h-10 text-green-800 mx-auto mb-3" />
            <img
              src={temp}
              alt="Temperature"
              className="mx-auto mb-4 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl sm:text-2xl font-semibold text-green-800 mb-2">
              Real-Time Temperature
            </h3>
            <p className="text-sm sm:text-base text-gray-700">
              Instant temperature updates for health safety monitoring.
            </p>
          </div>

          {/* Humidity Tracking Card */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-200 p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <Droplets className="w-10 h-10 text-teal-700 mx-auto mb-3" />
            <img
              src={humidity}
              alt="Humidity"
              className="mx-auto mb-4 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl sm:text-2xl font-semibold text-green-800 mb-2">
              Humidity Tracking
            </h3>
            <p className="text-sm sm:text-base text-gray-700">
              Monitor humidity to prevent respiratory and skin issues.
            </p>
          </div>

          {/* Smart Alerts Card */}
          <div className="bg-gradient-to-r from-teal-100 to-green-200 p-6 rounded-3xl shadow-xl text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <BellRing className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <img
              src={alert}
              alt="Smart Alerts"
              className="mx-auto mb-4 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl sm:text-2xl font-semibold text-green-800 mb-2">
              Smart Alerts
            </h3>
            <p className="text-sm sm:text-base text-gray-700">
              Get notified when conditions go out of healthy ranges.
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Home;
