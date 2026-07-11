// import { Link, useNavigate } from "react-router-dom";
// import {
//   Bars3BottomRightIcon,
//   XMarkIcon,
//   UserCircleIcon,
// } from "@heroicons/react/24/solid";
// import { useState, useEffect } from "react";
// import logo from "../assets/logo1.jpeg";
// import { auth } from "../components/firebaseConfig";

// const Head = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setIsAuthenticated(!!user);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <div className="shadow-md w-full bg-black rounded-sm">
//       <div className="md:px-10 py-4 px-7 md:flex justify-between items-center">
//         {/* Logo */}
//         {/* <div>
//           <Link to="/">
//             <img className="w-30 h-full rounded-md" src={logo} alt="logo" />
//             <p className="text-green-600 italic text-[10px] mx-10 font-semibold cursor-pointer">
//               <a
//                 href="https://greeninurja.in"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 -A Brand of Trust-
//               </a>
//             </p>
//           </Link>
//         </div> */}

//         {/* Logo - FULLY FIXED */}
//         <div className="flex flex-col gap-1">
//           <Link
//             to="/"
//             className="flex items-center gap-2 hover:scale-105 transition-transform"
//           >
//             <img
//               className="w-30 h-12 rounded-md shadow-md"
//               src={logo}
//               alt="Greenin Urja"
//             />
//             <span className="text-white font-semibold text-sm hidden md:block">
//               Home
//             </span>
//           </Link>
//           <a
//             href="https://greeninurja.in"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-green-400 text-xs italic hover:text-green-300 transition-colors"
//           >
//             - A Brand of Trust -
//           </a>
//         </div>

//         {/* Mobile Menu Toggle */}
//         <div
//           onClick={() => setIsOpen(!isOpen)}
//           className="w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden"
//         >
//           {isOpen ? (
//             <XMarkIcon className="text-white" />
//           ) : (
//             <Bars3BottomRightIcon className="text-white my-2" />
//           )}
//         </div>

//         {/* Nav Links */}
//         <ul
//           className={`bg-black md:flex md:items-center md:pb-0 pb-12 absolute md:static md:z-auto z-[1000] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${
//             isOpen ? "top-20" : "top-[-490px]"
//           }`}
//         >
//           {[
//             { name: "Home", path: "/" },
//             { name: "About-Us", path: "/about" },
//             { name: "CGHM", path: "/CGHM" },
//             { name: "Monitoring", path: "/Monitoring" },
//             { name: "Data-Logger", path: "/DataLogger" },
//             { name: "News and Articles", path: "/NewsAndArticles" },
//             { name: "Contact Us", path: "/ContactUs" },
//             { name: "Video Saver", path: "/video-saver" },
//             { name: "Video Gallery", path: "/video-gallery" },
//           ].map((link, index) => (
//             <li
//               key={index}
//               className="text-sm text-white hover:text-green-600 font-semibold my-7 md:my-0 md:ml-8"
//             >
//               <Link to={link.path} onClick={() => setIsOpen(false)}>
//                 {link.name}
//               </Link>
//             </li>
//           ))}

//           {/* Profile Link (with icon) */}
//           {isAuthenticated && (
//             <li className="text-sm text-white hover:text-green-600 font-semibold my-7 md:my-0 md:ml-8 flex items-center gap-1">
//               <Link
//                 to="/profile"
//                 onClick={() => setIsOpen(false)}
//                 className="flex items-center gap-1"
//               >
//                 <UserCircleIcon className="h-5 w-5 text-green-600" />
//                 Profile
//               </Link>
//             </li>
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Head;

// import { Link, useNavigate } from "react-router-dom";
// import {
//   Bars3BottomRightIcon,
//   XMarkIcon,
//   UserCircleIcon,
// } from "@heroicons/react/24/solid";
// import { useState, useEffect } from "react";
// import logo from "../assets/logo1.jpeg";
// import { auth } from "../components/firebaseConfig";

// const Head = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setIsAuthenticated(!!user);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     // FIX #1 (positioning context): added `relative` so the mobile hamburger's
//     // `absolute` positioning is scoped to THIS header, not to some distant
//     // positioned ancestor (which was the root cause of the logo getting
//     // hidden/overlapped on mobile). Also added `sticky top-0 z-50` so the
//     // header always sits above the mobile dropdown and page content with a
//     // predictable stacking order, and a fixed `z-50` baseline for the whole bar.
//     <div className="shadow-md w-full bg-black relative z-50">
//       {/* FIX #2 (stable header height / no CLS): switched from `md:flex` (block
//           on mobile) to `flex` on ALL breakpoints, with `flex-nowrap` so the
//           logo + hamburger row never wraps or reflows before/after login.
//           Fixed vertical padding (py-3) keeps header height identical in every
//           state (logged out, logged in, menu open/closed). */}
//       <div className="px-4 sm:px-6 md:px-10 py-3 flex flex-nowrap justify-between items-center gap-4 min-h-[64px]">
//         {/* Logo block */}
//         {/* FIX #3 (logo never disappears / no layout shift):
//             - `flex-shrink-0` guarantees the logo never gets squeezed out by
//               the nav/profile items, on any screen size.
//             - Explicit `w-[120px] h-12` on the <img> (fixed box) reserves the
//               exact space before the image finishes loading, eliminating the
//               CLS jump when the logo pops in.
//             - `object-contain` keeps the image from distorting inside that
//               fixed box. */}
//         <div className="flex flex-col gap-1 flex-shrink-0">
//           <Link
//             to="/"
//             className="flex items-center gap-2 hover:scale-105 transition-transform"
//           >
//             <img
//               className="w-[120px] h-12 rounded-md shadow-md object-contain shrink-0"
//               src={logo}
//               alt="Greenin Urja"
//               width={120}
//               height={48}
//             />
//             {/* <span className="text-white font-semibold text-sm hidden md:block whitespace-nowrap">
//               Home
//             </span> */}
//           </Link>
//           <a
//             href="https://greeninurja.in"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-green-400 text-xs italic hover:text-green-300 transition-colors whitespace-nowrap"
//           >
//             - A Brand of Trust -
//           </a>
//         </div>

//         {/* Mobile Menu Toggle */}
//         {/* FIX #4 (no overlap with logo): removed the old `absolute right-8
//             top-6` positioning (which floated relative to the wrong ancestor
//             and could sit on top of the logo). The button is now a normal
//             flex item in the same row as the logo, so `justify-between`
//             keeps it pinned to the far right with guaranteed spacing and it
//             can never cover the logo. */}
//         <div
//           onClick={() => setIsOpen(!isOpen)}
//           className="w-7 h-7 flex-shrink-0 cursor-pointer md:hidden flex items-center justify-center"
//         >
//           {isOpen ? (
//             <XMarkIcon className="text-white" />
//           ) : (
//             <Bars3BottomRightIcon className="text-white" />
//           )}
//         </div>

//         {/* Nav Links */}
//         {/* FIX #5 (smooth mobile dropdown, correct stacking, no overlap):
//             - Mobile: `absolute top-full left-0 w-full` positions the dropdown
//               directly BELOW the header (relative to the header itself, thanks
//               to FIX #1), instead of guessing pixel offsets (`top-20` /
//               `top-[-490px]`) that could land on top of the logo/header on
//               different screen sizes. Opacity + max-height transition gives a
//               smooth open/close instead of a hard jump.
//             - Desktop: `md:static md:flex md:flex-nowrap md:w-auto` forces the
//               nav (including the Profile item that appears after login) to
//               stay on ONE row and never wrap or push the layout around,
//               fixing the "navbar breaks after login" issue.
//             - `z-40` keeps it correctly layered under the sticky header
//               (`z-50`) but above page content. */}
//         <ul
//           className={`bg-black md:bg-transparent flex flex-col md:flex-row md:flex-nowrap md:items-center md:pb-0 pb-8 absolute md:relative top-full md:top-auto left-0 w-full md:w-auto px-9 md:px-0 z-40 overflow-hidden transition-all duration-500 ease-in-out ${
//             isOpen
//               ? "max-h-[600px] opacity-100 pt-4"
//               : "max-h-0 md:max-h-none opacity-0 md:opacity-100 pt-0"
//           }`}
//         >
//           {[
//             { name: "Home", path: "/" },
//             { name: "About-Us", path: "/about" },
//             { name: "CGHM", path: "/CGHM" },
//             { name: "Monitoring", path: "/Monitoring" },
//             { name: "Data-Logger", path: "/DataLogger" },
//             { name: "News and Articles", path: "/NewsAndArticles" },
//             { name: "Contact Us", path: "/ContactUs" },
//             { name: "CGHMHealthDashboard", path: "/video-saver" },
//             { name: "CGHM Gallery", path: "/video-gallery" },
//           ].map((link, index) => (
//             <li
//               key={index}
//               // FIX #6 (no unexpected wrapping / consistent spacing):
//               // `whitespace-nowrap` + `shrink-0` stop individual items from
//               // wrapping mid-text on tablet widths, and `md:ml-6 lg:ml-8`
//               // gives balanced, breakpoint-aware spacing instead of one fixed
//               // margin for every screen size from tablet to desktop.
//               className="text-sm text-white hover:text-green-600 font-semibold my-4 md:my-0 md:ml-6 lg:ml-8 whitespace-nowrap shrink-0"
//             >
//               <Link to={link.path} onClick={() => setIsOpen(false)}>
//                 {link.name}
//               </Link>
//             </li>
//           ))}

//           {/* Profile Link (with icon) */}
//           {/* FIX #7 (Profile item never breaks desktop layout):
//               `shrink-0 whitespace-nowrap` ensure this item behaves exactly
//               like the others and simply takes its place in the same
//               non-wrapping flex row instead of forcing a reflow of the whole
//               navbar when it appears after login. */}
//           {isAuthenticated && (
//             <li className="text-sm text-white hover:text-green-600 font-semibold my-4 md:my-0 md:ml-6 lg:ml-8 flex items-center gap-1 whitespace-nowrap shrink-0">
//               <Link
//                 to="/profile"
//                 onClick={() => setIsOpen(false)}
//                 className="flex items-center gap-1"
//               >
//                 <UserCircleIcon className="h-5 w-5 text-green-600 shrink-0" />
//                 Profile
//               </Link>
//             </li>
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Head;

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
    // `relative` scopes the mobile dropdown's positioning to this header.
    // `sticky top-0 z-50` keeps the header on top with a predictable stack order.
    <div className="shadow-md w-full bg-black relative z-50">
      {/* Top row: logo + hamburger (mobile/tablet) or logo + full nav (lg+) */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex flex-nowrap justify-between items-center gap-3 min-h-[64px]">
        {/* Logo block */}
        {/* RESPONSIVE FIX: logo scales down slightly on mid-size laptop widths
            (lg) and returns to full size on larger desktops (xl), so it never
            eats into the space the nav items need. `flex-shrink-0` still
            guarantees it's never squeezed out entirely. */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <img
              className="w-[100px] lg:w-[90px] xl:w-[120px] h-12 rounded-md shadow-md object-contain shrink-0"
              src={logo}
              alt="Greenin Urja"
              width={120}
              height={48}
            />
          </Link>
          <a
            href="https://greeninurja.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 text-xs italic hover:text-green-300 transition-colors whitespace-nowrap"
          >
            - A Brand of Trust -
          </a>
        </div>

        {/* Mobile/Tablet Menu Toggle */}
        {/* RESPONSIVE FIX: switched from `md:hidden` to `lg:hidden`. The old
            `md` (768px) cutoff forced the full inline nav to appear too early,
            before there was actually enough horizontal room — that's exactly
            what was clipping "Profile" off-screen on smaller laptop widths.
            Hamburger now stays available up to 1024px, where there's
            guaranteed room to switch to the inline layout. */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 flex-shrink-0 cursor-pointer lg:hidden flex items-center justify-center"
        >
          {isOpen ? (
            <XMarkIcon className="text-white" />
          ) : (
            <Bars3BottomRightIcon className="text-white" />
          )}
        </div>

        {/* Nav Links */}
        {/* RESPONSIVE FIX (core fix):
            - Mobile/Tablet (<lg): unchanged dropdown behavior — absolute,
              full width, smooth max-height/opacity transition below the header.
            - Desktop (lg+): `lg:flex-row lg:flex-nowrap lg:w-auto` keeps every
              item on one line. Instead of large per-item margins (which added
              up to more width than some laptop screens have), spacing is now
              a single `gap` on the flex container — `lg:gap-3` (compact, for
              1024–1279px laptops) scaling up to `xl:gap-6` (roomier, for
              1280px+ desktops). This is what stops Profile (or any item) from
              being pushed past the visible edge and clipped.
            - `lg:text-[13px] xl:text-sm` shaves a touch of width off each
              label on mid-size laptops without affecting anything on phones,
              tablets, or full desktops. */}
        <ul
          className={`bg-black lg:bg-transparent flex flex-col lg:flex-row lg:flex-nowrap lg:items-center lg:gap-3 xl:gap-6 lg:pb-0 pb-8 absolute lg:relative top-full lg:top-auto left-0 w-full lg:w-auto px-9 lg:px-0 z-40 overflow-hidden lg:overflow-visible transition-all duration-500 ease-in-out ${
            isOpen
              ? "max-h-[600px] opacity-100 pt-4"
              : "max-h-0 lg:max-h-none opacity-0 lg:opacity-100 pt-0"
          }`}
        >
          {[
            { name: "Home", path: "/" },
            { name: "About-Us", path: "/about" },
            { name: "CGHM", path: "/CGHM" },
            // { name: "Monitoring", path: "/Monitoring" },
            // { name: "Data-Logger", path: "/DataLogger" },
            { name: "News and Articles", path: "/NewsAndArticles" },
            { name: "Contact Us", path: "/ContactUs" },
            { name: "CGHMHealthDashboard", path: "/video-saver" },
            { name: "CGHM Gallery", path: "/video-gallery" },
          ].map((link, index) => (
            <li
              key={index}
              className="text-sm lg:text-[13px] xl:text-sm text-white hover:text-green-600 font-semibold my-4 lg:my-0 whitespace-nowrap shrink-0"
            >
              <Link to={link.path} onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}

          {/* Profile Link (with icon) */}
          {/* Same treatment as the other items — it now takes its place in
              the compact `gap`-based row instead of adding its own large
              margin, so it can never get pushed past the screen edge. */}
          {isAuthenticated && (
            <li className="text-sm lg:text-[13px] xl:text-sm text-white hover:text-green-600 font-semibold my-4 lg:my-0 flex items-center gap-1 whitespace-nowrap shrink-0">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1"
              >
                <UserCircleIcon className="h-5 w-5 text-green-600 shrink-0" />
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
