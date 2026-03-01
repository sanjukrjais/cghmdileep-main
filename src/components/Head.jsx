import { Link, useNavigate } from "react-router-dom";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import logo from "../assets/logo1.jpeg";
import { auth } from "../components/firebaseConfig";

const Head = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="shadow-md w-full bg-black rounded-sm">
      <div className="md:px-10 py-4 px-7 md:flex justify-between items-center">
        {/* Logo */}
        {/* <div>
          <Link to="/">
            <img className="w-30 h-full rounded-md" src={logo} alt="logo" />
            <p className="text-green-600 italic text-[10px] mx-10 font-semibold cursor-pointer">
              <a
                href="https://greeninurja.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                -A Brand of Trust-
              </a>
            </p>
          </Link>
        </div> */}

        {/* Logo - FULLY FIXED */}
        <div className="flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <img
              className="w-30 h-12 rounded-md shadow-md"
              src={logo}
              alt="Greenin Urja"
            />
            <span className="text-white font-semibold text-sm hidden md:block">
              Home
            </span>
          </Link>
          <a
            href="https://greeninurja.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 text-xs italic hover:text-green-300 transition-colors"
          >
            - A Brand of Trust -
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden"
        >
          {isOpen ? (
            <XMarkIcon className="text-white" />
          ) : (
            <Bars3BottomRightIcon className="text-white my-2" />
          )}
        </div>

        {/* Nav Links */}
        <ul
          className={`bg-black md:flex md:items-center md:pb-0 pb-12 absolute md:static md:z-auto z-[1000] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${
            isOpen ? "top-20" : "top-[-490px]"
          }`}
        >
          {[
            { name: "Home", path: "/" },
            { name: "About-Us", path: "/about" },
            { name: "CGHM", path: "/CGHM" },
            { name: "Monitoring", path: "/Monitoring" },
            { name: "Data-Logger", path: "/DataLogger" },
            { name: "News and Articles", path: "/NewsAndArticles" },
            { name: "Contact Us", path: "/ContactUs" },
            { name: "Video Saver", path: "/video-saver" },
            { name: "Video Gallery", path: "/video-gallery" },
          ].map((link, index) => (
            <li
              key={index}
              className="text-sm text-white hover:text-green-600 font-semibold my-7 md:my-0 md:ml-8"
            >
              <Link to={link.path} onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}

          {/* Profile Link (with icon) */}
          {isAuthenticated && (
            <li className="text-sm text-white hover:text-green-600 font-semibold my-7 md:my-0 md:ml-8 flex items-center gap-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1"
              >
                <UserCircleIcon className="h-5 w-5 text-green-600" />
                Profile
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Head;
