import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';

const PrivacyandPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-white to-green-50 text-gray-800 px-4 md:px-12 py-10 md:py-20 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-green-700 flex items-center gap-2 mb-6">
          <ShieldCheck className="text-green-600" /> Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-4">Effective Date: July 17, 2025</p>

        <p className="mb-6">
          This Privacy Policy describes how Greenin Urja ("the Company," "We," "Us," or "Our") collects,
          uses, and discloses your personal information when you use our website at
          <a href="https://cghm.greenin.in/" className="text-green-600 underline ml-1 hover:text-green-800 transition-colors">https://cghm.greenin.in/</a>
          and our Android application, collectively referred to as "CGHM - monitor Health Smartly" or the "Service."
        </p>

        <p className="mb-6">
          By accessing or using our Service, you agree to the collection, use, and disclosure of your
          information in accordance with this Privacy Policy. If you do not agree with the terms of this
          Privacy Policy, please do not access or use the Service.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-green-700">1. Eligibility</h2>
            <p className="mt-2 text-gray-700">
              Our Service is intended for users who are 18 years of age or older. We do not knowingly collect
              personal information from individuals under the age of 18. If you are under 18, please do not use or
              provide any information on this Service or through any of its features. If we learn we have collected or
              received personal information from a child under 18 without verification of parental consent, we will
              delete that information. If you believe we might have any information from or about a child under 18,
              please contact us at <a href="mailto:info@greenin.in" className="text-green-600 underline hover:text-green-800">info@greenin.in</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">2. Information We Collect</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
              <li><strong>Full Name:</strong> To personalize your experience and identify you within the Service.</li>
              <li><strong>Email Address:</strong> Used for account verification, password recovery, and important communications regarding your account or the Service.</li>
              <li><strong>Password:</strong> Stored in an encrypted format to secure your account. We do not have access to your raw password.</li>
              <li>
                We do not collect sensitive health data directly through the sign-up process. Any health-related data
                collected will be processed only when you explicitly input or sync it within the smart health monitoring
                features after signing up.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
              <li>To Provide and Maintain the Service</li>
              <li>To Communicate with You</li>
              <li>For Security and Fraud Prevention</li>
              <li>To Improve Our Service</li>
              <li>To Comply with Legal Obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">4. How We Share Your Information</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
              <li>With Your Consent</li>
              <li>Service Providers (Hosting, Email, Storage, etc.)</li>
              <li>Legal Requirements</li>
              <li>Business Transfers</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">5. Data Security</h2>
            <p className="mt-2 text-gray-700">
              We implement reasonable security measures like encryption, SSL/TLS, and restricted access to protect your
              information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">6. Your Choices and Rights</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
              <li>Access and Update Your Account Info</li>
              <li>Request Account Deletion via <a href="mailto:info@greenin.in" className="text-green-600 underline hover:text-green-800">info@greenin.in</a></li>
              <li>Opt-Out of Promotional Emails</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">7. Third-Party Links</h2>
            <p className="mt-2 text-gray-700">
              Our Service may contain links to third-party sites. We are not responsible for their privacy practices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">8. Changes to This Privacy Policy</h2>
            <p className="mt-2 text-gray-700">
              We may update this policy periodically. Continued use of our Service means you accept the changes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700">9. Contact Us</h2>
            <ul className="text-gray-700 space-y-2 mt-2">
              <li className="flex items-center gap-2"><Mail className="text-green-600" /> info@greenin.in</li>
              <li className="flex items-center gap-2"><Globe className="text-green-600" /> <a href="https://cghm.greenin.in/ContactUs" className="hover:text-green-800">https://cghm.greenin.in/ContactUs</a></li>
              <li className="flex items-center gap-2"><Phone className="text-green-600" /> +91 85338 89855</li>
              <li className="flex items-center gap-2"><MapPin className="text-green-600" /> Greenin Urja Electronics Store Lehman Pul, 698, Near Heritage Wedding Point Babugarh, Uttarakhand 248198, India</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyandPolicy;
