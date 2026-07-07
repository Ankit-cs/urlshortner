import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code2, Layout, Zap, Smartphone, Mail } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaGithub, FaXTwitter } from 'react-icons/fa6';

export default function About() {
  // Ensure we scroll to the top of the page when the route loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const skills = [
    { icon: <Code2 size={24} />, title: "Web Architecture", desc: "Building scalable, high-performance backends." },
    { icon: <Layout size={24} />, title: "UI/UX Engineering", desc: "Crafting pixel-perfect, intuitive interfaces." },
    { icon: <Zap size={24} />, title: "Optimization", desc: "Maximizing speed and seamless interactions." },
    { icon: <Smartphone size={24} />, title: "Cross-Platform", desc: "Ensuring flawless functionality everywhere." }
  ];

  const rotations = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1'];

  const socialLinks = [
    { label: "E-mail", handle: "priyanshbhatt.dev@gmail.com", href: "mailto:priyanshbhatt.dev@gmail.com" },
    { label: "Phone", handle: "+91 8955623907", href: "tel:+918955623907" },
    { label: "LinkedIn", handle: "/in/thepriyanshbhatt", href: "https://linkedin.com/in/thepriyanshbhatt" },
    { label: "GitHub", handle: "thepriyanshbhatt", href: "https://github.com/thepriyanshbhatt" },
    { label: "X / Twitter", handle: "itspriyanshdev", href: "https://x.com/itspriyanshdev" },
    { label: "Instagram", handle: "thepriyanshbhatt", href: "https://instagram.com/thepriyanshbhatt" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-[#fafafa] dark:bg-[#050505] pt-16 pb-32 px-4 relative z-10 transition-colors duration-300 min-h-screen flex flex-col items-center"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-32">
        
        {/* 1. Hero Section */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left Side: Image */}
          <div className="w-full md:w-5/12 flex justify-center relative">
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-200 dark:bg-[#111] shadow-2xl border border-gray-200 dark:border-white/10">
              <img 
                src="/priyansh.jpg" 
                alt="Priyansh Bhatt" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              {/* Badge */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full whitespace-nowrap shadow-xl">
                Founder & Creator
              </div>
            </div>
          </div>

          {/* Right Side: Text */}
          <div className="w-full md:w-7/12 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block">
              About the Builder
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-8 text-black dark:text-white leading-[1.1]">
              Hi, I'm <br className="hidden md:block" />
              <span className="text-gray-500 dark:text-gray-400">Priyansh Bhatt</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
              I am a passionate software engineer and the creator of shrink. My expertise lies in building dynamic, highly-optimized web applications that solve complex problems with elegant, minimalist design. 
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full">
              <a 
                href="https://priyansh.framer.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 bg-transparent border-2 border-black dark:border-white text-black dark:text-white py-4 px-8 rounded-full font-bold text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none"
              >
                View Portfolio <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <a 
                href="mailto:shrinkly@gmail.com" 
                className="group flex items-center justify-center gap-2 bg-transparent border-2 border-black dark:border-white text-black dark:text-white py-4 px-8 rounded-full font-bold text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>

        {/* 2. What I Do Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white mb-12 text-center">What I Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-2">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className={`relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-sm p-8 pt-12 shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_15px_-3px_rgba(255,255,255,0.05)] transition-all duration-500 origin-top hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_25px_-5px_rgba(255,255,255,0.08)] hover:-translate-y-2 hover:-rotate-1 group ${rotations[index % 4]}`}
              >
                {/* Top Left Pin */}
                <div className="absolute top-4 left-4 z-20 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),_1px_1px_2px_rgba(0,0,0,0.1)]"></div>
                
                {/* Top Right Pin */}
                <div className="absolute top-4 right-4 z-20 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),_1px_1px_2px_rgba(0,0,0,0.1)]"></div>

                {/* The content container that swings up slightly on hover */}
                <div className="transition-transform duration-500 flex flex-col h-full relative z-10">
                  <div className="w-14 h-14 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-black dark:text-white mb-8 border border-gray-100 dark:border-white/5 transition-transform duration-300 relative z-10 group-hover:scale-110">
                    {skill.icon}
                  </div>
                  <h3 className="text-lg font-black text-black dark:text-white mb-3 relative z-10">{skill.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed relative z-10">{skill.desc}</p>
                </div>
                
                {/* Subtle paper texture/gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm"></div>
              </div>
            ))}
          </div>
        </div>



        {/* 4. Let's Connect Section */}
        <div className="flex flex-col items-center w-full pb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white mb-12 text-center">Let's Connect</h2>
          <div className="flex flex-col w-full max-w-2xl mx-auto space-y-3">
            {socialLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-black dark:hover:border-white/50 transition-all duration-300"
              >
                <div className="w-1/3 md:w-1/4">
                  <span className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">{link.label}</span>
                </div>
                
                <div className="w-auto text-right md:text-left flex-1 px-4 truncate">
                  <span className="text-base md:text-lg font-bold text-black dark:text-white truncate">{link.handle}</span>
                </div>

                <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
