// import React, { useState } from 'react';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from './firebaseConfig';
// import { useNavigate, Link } from 'react-router-dom';
// import { Mail, Lock, LogIn } from 'lucide-react';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate('/Monitoring');
//     } catch (err) {
//       setError('Invalid email or password');
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-300 p-4">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
//         <div className="text-center">
//           <LogIn className="w-12 h-12 text-green-600 mx-auto mb-2" />
//           <h2 className="text-3xl font-extrabold text-green-700">Login to Your Account</h2>
//           <p className="text-sm text-gray-500">Access your health monitoring dashboard</p>
//         </div>

//         {error && <p className="text-red-500 text-sm text-center">{error}</p>}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div className="relative">
//             <Mail className="absolute left-3 top-2.5 text-green-500 w-5 h-5" />
//             <input
//               type="email"
//               placeholder="Email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
//             />
//           </div>
//           <div className="relative">
//             <Lock className="absolute left-3 top-2.5 text-green-500 w-5 h-5" />
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow-md transition duration-300"
//           >
//             Login
//           </button>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-sm text-gray-600">
//             Are you new here?{' '}
//             <Link to="/signup" className="text-green-600 hover:underline font-medium">
//               Sign up now
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, X } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- NEW: Forgot Password state (kept separate from login state above) ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/Monitoring");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // --- NEW: Forgot Password handler ---
  // Uses Firebase's built-in sendPasswordResetEmail — Firebase itself emails
  // the user a secure reset link; we don't handle passwords or tokens here.
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage(
        "✅ Password reset link bhej diya gaya hai! Apna email inbox (aur spam folder) check karein.",
      );
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setResetError("Iss email se koi account registered nahi hai.");
      } else if (err.code === "auth/invalid-email") {
        setResetError("Please ek valid email address enter karein.");
      } else {
        setResetError("Reset link bhejne mein error aaya. Try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail("");
    setResetMessage("");
    setResetError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-300 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <LogIn className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold text-green-700">
            Login to Your Account
          </h2>
          <p className="text-sm text-gray-500">
            Access your health monitoring dashboard
          </p>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-green-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-green-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* NEW: Forgot Password link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow-md transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Are you new here?{" "}
            <Link
              to="/signup"
              className="text-green-600 hover:underline font-medium"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>

      {/* NEW: Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 relative">
            <button
              type="button"
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <Mail className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-700">
                Reset Password
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Apna registered email enter karein, hum aapko reset link bhej
                denge.
              </p>
            </div>

            {resetMessage && (
              <p className="text-green-600 text-sm text-center bg-green-50 rounded-lg p-2">
                {resetMessage}
              </p>
            )}
            {resetError && (
              <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2">
                {resetError}
              </p>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-green-500 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
