import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  BrowserRouter,
  useNavigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // Import Firebase auth functions
// import { auth } from "./components/firebaseConfig"; // Import Firebase auth
import { ref, get } from "firebase/database";
import { auth, database } from "./components/firebaseConfig.jsx";
import { Toaster } from "react-hot-toast";
import Head from "./components/Head.jsx";
import Body from "./components/Body.jsx";
import CGHM from "./components/Cghm.jsx";
import Monitoring from "./components/Monitor.jsx";
import NewsAndArticles from "./components/NewsandArticle.jsx";
import ConsentForm from "./components/ConsentForm.jsx";
import ContactUs from "./components/Contact.jsx";
import DataLogger from "./components/DataLoger.jsx";
import AboutUs from "./components/AboutUs.jsx";
import Login from "./components/Login.jsx"; // Import Login component
import SignUp from "./components/Signup.jsx"; // Import SignUp component
import Profile from "./components/Profile.jsx";
import TermsandCondition from "./components/TermsandCondition.jsx";
import PrivacyandPolicy from "./components/PrivacyandPolicy.jsx";
import VideoSaver from "./components/VideoSaver.jsx";
import VideoGallery from "./components/VideoGallery.jsx";

const ProtectedRoute = ({ children }) => {
  const [state, setState] = useState("loading");
  const navigate = useNavigate(); // ADD THIS

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState("login");
        return;
      }

      // 🔥 Check localStorage first (faster)
      if (localStorage.getItem("consent_completed") === "true") {
        setState("authenticated");
        return;
      }

      try {
        const snap = await get(ref(database, `users/${user.uid}`));
        console.log(
          "🔍 ProtectedRoute check - UID:",
          user.uid,
          "Data:",
          snap.val(),
        );

        if (!snap.exists() || !snap.val().consentAccepted) {
          setState("consent");
        } else {
          setState("authenticated");
        }
      } catch (err) {
        console.error("ProtectedRoute error:", err);
        setState("consent");
      }
    });

    return () => unsub();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  if (state === "login") return <Login />;
  if (state === "consent") return <ConsentForm />;

  return children;
};

const AppLayout = () => {
  return (
    <div>
      <Toaster position="top-center" />
      <Head />
      <Outlet />
    </div>
  );
};

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Body />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/video-saver",
        element: <VideoSaver />,
      },
      {
        path: "/video-gallery",
        element: <VideoGallery />,
      },
      {
        path: "/CGHM",
        element: <CGHM />,
      },
      {
        path: "/Monitoring", // Protected route with login or signup
        element: (
          <ProtectedRoute>
            <Monitoring />
          </ProtectedRoute>
        ),
      },
      {
        path: "/DataLogger", // Protected route with login or signup
        element: (
          <ProtectedRoute>
            <DataLogger />
          </ProtectedRoute>
        ),
      },
      {
        path: "/NewsAndArticles",
        element: <NewsAndArticles />,
      },
      {
        path: "/ContactUs",
        element: <ContactUs />,
      },
      {
        path: "/login",
        element: <Login />, // Public route for login
      },
      {
        path: "/signup",
        element: <SignUp />, // Public route for sign up
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/termandcondition",
        element: <TermsandCondition />,
      },
      {
        path: "/privacyandpolicy",
        element: <PrivacyandPolicy />,
      },
    ],
  },
]);

export default AppRoutes;
