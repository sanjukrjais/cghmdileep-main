import { Mail, Phone, MapPin, Newspaper, Users } from 'lucide-react';
import Footer from './Footer';

const ContactUs = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-300  p-6">
            <div className="flex-grow max-w-screen-xl mx-auto">

                {/* Section 1 */}
                <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start justify-center gap-10 mb-10 mt-10">
                    {/* Join Our Team Card */}
                    <div className="group w-full sm:w-2/5 bg-white rounded-2xl shadow-xl p-6 text-gray-800 hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-500 border-t-4 border-green-400">
                        <div className="flex items-center gap-3 mb-4 text-green-700">
                            <Users className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                            <h1 className="text-2xl sm:text-3xl font-semibold">
                                Interested in Joining Our Team?
                            </h1>
                        </div>
                        <p className="mb-4 text-lg text-gray-700">
                            If you're passionate about working with us or would like to learn more about our devices, please send us an email.
                        </p>
                        <a
                            className="text-green-600 hover:text-green-800 font-bold transition duration-300 inline-block"
                            href="mailto:info@greeninurja.in"
                        >
                            info@greeninurja.in
                        </a>
                    </div>

                    {/* Office Location Card */}
                    <div className="group w-full sm:w-2/5 bg-white rounded-2xl shadow-xl p-6 text-gray-800 hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-500 border-t-4 border-emerald-400">
                        <div className="flex items-center gap-3 mb-4 text-green-700">
                            <MapPin className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                            <h1 className="text-2xl sm:text-3xl font-semibold">
                                Office Location
                            </h1>
                        </div>
                        <p className="text-lg text-gray-700">
                            Greenin Urja, Lehman Pul, 698, near Heritage Wedding Point, Babugarh, Uttarakhand 248198
                        </p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start justify-center gap-10">
                    {/* Press Enquiries Card */}
                    <div className="group w-full sm:w-2/5 bg-white rounded-2xl shadow-xl p-6 text-gray-800 hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-500 border-t-4 border-teal-400">
                        <div className="flex items-center gap-3 mb-4 text-green-700">
                            <Newspaper className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                            <h1 className="text-2xl sm:text-3xl font-semibold">
                                Press Enquiries – Contact Us
                            </h1>
                        </div>
                        <p className="mb-4 text-lg text-gray-700">
                            For press-related inquiries, feel free to reach us anytime!
                        </p>
                        <a
                            className="text-green-600 hover:text-green-800 font-bold transition duration-300 inline-block"
                            href="tel:+918533889855"
                        >
                            +91 8533889855
                        </a>
                    </div>

                    {/* Contact Details Card */}
                    <div className="group w-full sm:w-2/5 bg-white rounded-2xl shadow-xl p-6 text-gray-800 hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-500 border-t-4 border-green-300">
                        <div className="flex items-center gap-3 mb-4 text-green-700">
                            <Phone className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                            <h1 className="text-2xl sm:text-3xl font-semibold">
                                Contact Details
                            </h1>
                        </div>
                        <p className="text-lg text-gray-700">
                            Phone: <a className="text-green-600 hover:text-green-800 transition duration-300" href="tel:+918533889855">+91 8533889855</a>
                        </p>
                        <p className="text-lg text-gray-700">
                            Email: <a className="text-green-600 hover:text-green-800 transition duration-300" href="mailto:info@greeninurja.in">info@greeninurja.in</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Google Map Embed */}
            <div className="w-full max-w-4xl mx-auto p-4 mt-10">
                <div className="relative w-full pt-[56.25%] bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3439.3567466140335!2d77.75033277458769!3d30.454331999035954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f2f03f0107209%3A0xc4cfe463a0f4b96f!2sGreenin%20Urja!5e0!3m2!1sen!2sin!4v1744954966653!5m2!1sen!2sin"
                        className="absolute top-0 left-0 w-full h-full rounded-xl transition-transform duration-300 hover:scale-105"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>

            {/* Footer */}
            <Footer/>
        </div>
    );
};

export default ContactUs;
