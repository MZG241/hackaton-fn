'use client';

import { motion } from "framer-motion";
import {
    Mail, Phone, MapPin, Briefcase,
    ArrowRight, X, Globe, Share2
} from "lucide-react";
import Link from "next/link";
import CustomIcon from "../ui/CustomIcon";

const Footer = () => {
    const footerLinks = [
        {
            title: "For Candidates",
            links: [
                { label: "Browse Jobs", url: "/find-jobs" },
                { label: "Create Profile", url: "/profile" },
                { label: "Career Advice", url: "/blog" },
            ]
        },
        {
            title: "For Recruiters",
            links: [
                { label: "Post a Job", url: "/post-job" },
                { label: "Browse CVs", url: "/employer-dashboard" },
                { label: "Pricing", url: "/pricing" },
                { label: "HR Solutions", url: "/solutions" },
            ]
        },
        {
            title: "Resources",
            links: [
                { label: "Help", url: "/help" },
                { label: "Blog", url: "/blog" },
                { label: "Webinars", url: "/webinars" },
                { label: "Community", url: "/community" },
            ]
        },
        {
            title: "Company",
            links: [
                { label: "About", url: "/about" },
                { label: "Careers", url: "/careers" },
                { label: "Contact", url: "/contact" },
                { label: "Privacy", url: "/privacy" },
            ]
        }
    ];

    const socialLinks = [
        { icon: Globe, url: "https://akazi.com" },
        { icon: X, url: "https://twitter.com" },
        { icon: Share2, url: "#" },
        { icon: Mail, url: "mailto:hello@akazi.com" }
    ];

    const contactInfo = [
        { icon: Mail, text: "hello@akazi.com" },
        { icon: Phone, text: "+250 786 121 522" },
        { icon: MapPin, text: "Kigali, Rwanda" }
    ];

    return (
        <footer className="bg-gray-950 text-gray-400 pt-24 pb-12 overflow-hidden relative">
            {/* Decorative border top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>

            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-16 mb-20">
                    {/* Logo and Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="xl:col-span-1"
                    >
                        <div className="flex items-center mb-gap-3 gap-3">
                             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-500 border border-white/20">
                                <CustomIcon name="vuesax" size={24} />
                             </div>
                            <span className="text-2xl font-bold text-white tracking-tighter">Akazi</span>
                        </div>
                        <p className="mb-8 leading-relaxed text-gray-400 font-medium">
                            Connecting the best talent with world-class companies. Our platform makes hiring and job hunting effortless.
                        </p>
                        <div className="flex space-x-5">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-all border border-gray-800"
                                >
                                    <social.icon className="h-5 w-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer Links */}
                    {footerLinks.map((column, colIndex) => (
                        <motion.div
                            key={colIndex}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * colIndex, duration: 0.5 }}
                        >
                            <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-widest text-sm">{column.title}</h3>
                            <ul className="space-y-4">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            href={link.url}
                                            className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300 font-medium"
                                        >
                                            <ArrowRight className="h-4 w-4 mr-2 text-blue-500 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Info Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gray-900/50 rounded-2xl border border-gray-800 mb-20 backdrop-blur-sm"
                >
                    {contactInfo.map((item, index) => (
                        <div key={index} className="flex items-center group">
                            <div className="p-4 rounded-2xl bg-gray-800 text-blue-400 mr-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-xl">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <span className="text-lg font-bold text-gray-300">{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Bottom Footer */}
                <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8 font-bold text-sm">
                    <p className="text-gray-500">
                        &copy; {new Date().getFullYear()} Akazi. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <div className="flex items-center text-gray-500">
                            <span className="mr-2">Powered by</span>
                            <span className="text-white">Echolabs</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
