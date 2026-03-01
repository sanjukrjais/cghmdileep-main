import {Link} from "react-router-dom";
const Footer = () => {
    return (
        <div>
            {/* Footer */}
            <footer className="bg-gradient-to-br from-green-100 via-green-200 to-emerald-100 text-green-900 mt-16 px-4 sm:px-8 md:px-20 py-14 shadow-inner">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center md:text-left">
                    {/* Brand Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-emerald-700 mb-4">Greenin Urja</h2>
                        <p className="text-sm text-green-800 leading-relaxed">
                            Smart C.G.H.M<br />
                            Real-time insights for a healthier life. Monitor. Analyze. Live better.
                        </p>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-xl font-semibold text-emerald-700 mb-3">Legal</h3>
                        <ul className="text-green-800 text-sm space-y-2">
                            <li><Link to="/termandcondition" className="hover:text-green-600 transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacyandpolicy" className="hover:text-green-600 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-semibold text-emerald-700 mb-3">Quick Links</h3>
                        <ul className="text-green-800 text-sm space-y-2">
                            <li><Link to="/" className="hover:text-green-600 transition-colors">Home</Link></li>
                            <li><Link to="/ContactUs" className="hover:text-green-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-xl font-semibold text-emerald-700 mb-3">Follow Us</h3>
                        <div className="flex justify-center md:justify-start gap-4 text-2xl">
                            <Link to="#" className="hover:text-pink-500 transition-all" aria-label="Instagram">
                                <i className="fab fa-instagram text-green-700"></i>
                            </Link>
                            <Link to="#" className="hover:text-blue-500 transition-all" aria-label="Facebook">
                                <i className="fab fa-facebook-f text-green-700"></i>
                            </Link>
                            <Link to="#" className="hover:text-sky-500 transition-all" aria-label="LinkedIn">
                                <i className="fab fa-linkedin-in text-green-700"></i>
                            </Link>
                            <Link to="#" className="hover:text-red-500 transition-all" aria-label="YouTube">
                                <i className="fab fa-youtube text-green-700"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-10 border-t border-emerald-300"></div>

                {/* Bottom */}
                <div className="mt-6 text-center text-sm text-green-700">
                    &copy; 2025 <span className="text-emerald-800 font-semibold">Greenin Urja</span> | All Rights Reserved
                </div>
            </footer>
        </div>
    )
}

export default Footer;
