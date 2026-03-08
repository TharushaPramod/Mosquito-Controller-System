import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#1A3D37] text-white px-8 py-6 mt-auto border-t border-white/10 font-sans">
            <div className="flex flex-wrap items-center justify-between max-w-[1400px] mx-auto gap-4 md:flex-row flex-col text-center md:text-left">
                
                {/* Left Side: Copyright */}
                <div className="text-sm opacity-80">
                    <p>&copy; {currentYear} Smart Mosquito Control System. All rights reserved.</p>
                </div>

                {/* Right Side: Links & Version */}
                <div>
                    <ul className="flex flex-wrap items-center justify-center gap-6 p-0 m-0 list-none md:justify-end">
                        <li>
                            <a href="#privacy" className="text-sm text-white transition-opacity duration-200 opacity-80 hover:opacity-100">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="#terms" className="text-sm text-white transition-opacity duration-200 opacity-80 hover:opacity-100">
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="text-sm text-white transition-opacity duration-200 opacity-80 hover:opacity-100">
                                Contact Us
                            </a>
                        </li>
                        <li className="text-xs font-semibold bg-[#64B49F]/20 text-[#64B49F] px-2.5 py-1 rounded-full">
                            v1.2.0
                        </li>
                    </ul>
                </div>

            </div>
        </footer>
    );
};

export default Footer;