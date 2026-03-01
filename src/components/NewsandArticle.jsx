'use client';
import React from 'react';
import { Newspaper } from 'lucide-react';
import Footer from './Footer';

const NewsAndArticles = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-emerald-200 to-green-400">
      <div className="flex-grow px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center bg-white text-green-700 py-12 px-6 sm:px-8 lg:px-10 rounded-3xl shadow-xl w-full max-w-5xl space-y-8 mx-auto">
          <Newspaper className="w-16 h-16 text-green-500 hover:text-green-700 transition-colors duration-300 transform hover:scale-110" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700">Our News and Articles</h1>

          {/* Highlights */}
          <div className="w-full bg-gradient-to-r from-green-100 to-green-200 rounded-xl py-6 px-4 sm:px-6 lg:px-8 shadow-md space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-center text-green-800 hover:text-green-900 transition-colors duration-300 cursor-pointer">✅ Non-Invasive Glucose Monitoring</h2>
            <h2 className="text-lg sm:text-xl font-semibold text-center text-green-800 hover:text-green-900 transition-colors duration-300 cursor-pointer">✅ Continuous Glucose Monitor</h2>
            <h2 className="text-lg sm:text-xl font-semibold text-center text-green-800 hover:text-green-900 transition-colors duration-300 cursor-pointer">✅ Accurate Blood Glucose Readings</h2>
          </div>

          {/* Articles Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">Press Release – 09/02/2023</h3>
                <p className="text-green-900">Funding to drive growth at MedTech firm.</p>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read about the article here.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">Desang Magazine – 29-06-21</h3>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read the full article here.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">Asian Sunday – 25-06-21</h3>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read the full article here.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">South Wales Argus – 13-12-19</h3>
                <p className="text-green-900">Afon Technology has been featured for their blood glucose monitoring technology and development plans.</p>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read the full article here.</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">Diabetes.co.uk – 14-01-21</h3>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read the full article here.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">Business News Wales – 08-03-20</h3>
                <p className="text-green-900">Business News Wales features the Afon developments…</p>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read the full article here.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-1 hover:text-green-900 transition-colors duration-300">Diabetes Times – 31-12-19</h3>
                <p className="text-green-900">The Afon story is picked up by Diabetes Times.</p>
                <p className="text-green-600 underline hover:text-green-900 cursor-pointer transition-colors duration-300">Read the full article here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <Footer/>
    </div>
  );
};

export default NewsAndArticles;
