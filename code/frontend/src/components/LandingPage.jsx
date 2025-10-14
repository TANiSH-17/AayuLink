import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  User, Shield, Building, Hospital as HospitalIcon,
  AlertCircle, CheckCircle, FileText, Clock, AlertTriangle, Zap,
  Heart, CreditCard, ShieldCheck, BadgeCheck, Building2, Dot, Search, Menu, X,
  Share2, BrainCircuit, Siren,  Activity, MapPin, Database, Link2, Cloud, HeartPulse, Biohazard, Microscope
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";


function Field({ name, label, type, placeholder, icon: Icon, value, onChange, required = false }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative mt-1">
        <input id={name} name={name} type={type} value={value} onChange={onChange} className="w-full p-3 pl-10 rounded-lg border border-input focus:ring-2 focus:ring-primary bg-card text-foreground" placeholder={placeholder} required={required} />
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}


function HeaderInline({ onValidatorClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'network', label: 'Network' },
    { id: 'about', label: 'About Us' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${isScrolled || isMenuOpen ? 'bg-card/95 backdrop-blur-lg shadow-md border-b border-border' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <a href="#top" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <img src="/images/aayulink-logo.png" alt="AayuLink Logo" className="h-9 object-contain" />
          </a>
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">{link.label}</a>
            ))}
            <button onClick={onValidatorClick} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Pharmacist / Lab Portal</button>
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <a href="#auth" className="px-6 py-2.5 bg-destructive text-destructive-foreground rounded-full font-semibold hover:bg-destructive/90 transition-colors">Emergency Login</a>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-foreground">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div className={`lg:hidden transition-all duration-300 ease-in-out bg-card/95 border-t border-border ${isMenuOpen ? 'max-h-screen py-6' : 'max-h-0'} overflow-hidden`}>
        <nav className="flex flex-col items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">{link.label}</a>
          ))}
          <button onClick={() => { onValidatorClick(); setIsMenuOpen(false); }} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">Pharmacist / Lab Portal</button>
          <a href="#auth" onClick={() => setIsMenuOpen(false)} className="mt-4 px-8 py-3 bg-destructive text-destructive-foreground rounded-full font-semibold">Emergency Login</a>
        </nav>
      </div>
    </header>
  );
}


function HeroInline({ onGetStartedClick }) {
  const canvasRef = useRef(null);

  // === Particle network animation ===
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 75; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(100, 200, 255, 0.4)";
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(120, 200, 255, 0.15)";
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-primary/10"
    >
      {/* === Animated particle background === */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* === Floating glow orbs === */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/20 blur-[140px] animate-pulse delay-700" />

      {/* === Foreground content === */}
      <div className="relative max-w-7xl mx-auto px-8 pt-0 pb-24 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mb-10"
        >
          <motion.img
            src="/images/aayulink-logo.png"
            alt="AayuLink Logo"
            className="w-4/5 md:w-1/2 mx-auto object-contain drop-shadow-2xl"
            whileHover={{ scale: 1.04, rotate: 1 }}
            transition={{ type: "spring", stiffness: 150 }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-foreground"
        >
          The{" "}
          <span className="text-accent bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
            Aadhaar
          </span>{" "}
          for your{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Health
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12"
        >
          A unified digital front door for citizens, providers, and administrators —
          securely connecting hospitals, health IDs, and healthcare services across India.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <button
            onClick={onGetStartedClick}
            className="px-12 py-4 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary to-accent text-white hover:shadow-primary/50"
          >
            Get Started
          </button>
          <a
            href="#about"
            className="px-12 py-4 text-lg font-semibold rounded-full border-2 border-primary/30 text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  );
}
  
   
function WhatIsAayulinkInline() {
  const [activeCard, setActiveCard] = useState("aadhaar");
  const aadhaarRef = useRef(null);
  const panRef = useRef(null);
  const abhaRef = useRef(null);

  const cardData = {
    aadhaar: {
      icon: User,
      title: "Aadhaar",
      subtitle: "Your Digital Identity",
      color: "text-sky-300",
      imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2940&auto=format&fit=crop",
    },
    pan: {
      icon: CreditCard,
      title: "PAN",
      subtitle: "Your Financial Identity",
      color: "text-blue-300",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop",
    },
    abha: {
      icon: Heart,
      title: "ABHA",
      subtitle: "Your Health Identity",
      color: "text-emerald-300",
      imageUrl: "/images/abha.jpg",
    },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCard(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );

    const refs = [aadhaarRef, panRef, abhaRef];
    refs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);
  
  const ImageCard = ({ cardKey }) => {
    const card = cardData[cardKey];
    const CardIcon = card.icon;
    
    return (
      <div
        key={card.title}
        className="w-full h-full rounded-3xl p-10 flex flex-col justify-between shadow-xl transition-all duration-700 ease-in-out bg-cover bg-center animate-fade-in"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${card.imageUrl})`,
        }}
      >
        <div>
          <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <CardIcon className={`w-10 h-10 ${card.color}`} />
          </div>
          <h3 className="text-5xl font-bold text-white leading-tight">
            {card.title}
          </h3>
        </div>
        <p className="text-white/80 text-2xl leading-relaxed">
          {card.subtitle}
        </p>
      </div>
    );
  };

  return (
    // ✅ CORRECTION: Removed 'py-24' from this line
    <section id="features" className="bg-background-gradient">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          <div className="hidden lg:block lg:sticky top-0 h-screen">
            <div className="flex items-center h-full">
              <div className="w-full h-[500px]">
                <ImageCard cardKey={activeCard} />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div ref={aadhaarRef} id="aadhaar" className="min-h-[80vh] flex flex-col justify-center space-y-4">
              <div className="lg:hidden w-full h-[400px] mb-8">
                 <ImageCard cardKey="aadhaar" />
              </div>
              <h2 className="text-5xl font-bold text-foreground leading-tight">
                We have an Aadhaar card for our{" "}
                <span className="text-primary">identification.</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                It's the foundational identity for every citizen, unlocking services and benefits nationwide.
              </p>
            </div>

            <div ref={panRef} id="pan" className="min-h-[80vh] flex flex-col justify-center space-y-4">
              <div className="lg:hidden w-full h-[400px] mb-8">
                 <ImageCard cardKey="pan" />
              </div>
              <h2 className="text-5xl font-bold text-foreground leading-tight">
                A PAN card for our <span className="text-accent">finances.</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                The key to our financial lives, from taxes to investments, unified under one digital roof.
              </p>
            </div>
            
            <div ref={abhaRef} id="abha" className="space-y-4 pt-[30vh] pb-[50vh]">
              <div className="lg:hidden w-full h-[400px] mb-8">
                <ImageCard cardKey="abha" />
              </div>

              <h2 className="text-5xl font-bold text-foreground leading-tight">
                But for our health?
              </h2>

              <div className="text-xl text-muted-foreground space-y-4 pt-4">
                <p>
                  The missing piece is here. Introducing the{" "}
                  <b className="text-foreground">Aadhaar of your Health</b>.
                </p>

                <p>
                  <span className="bg-hero-gradient bg-clip-text text-transparent font-bold">
                    AayuLink
                  </span>{" "}
                  provides your ABHA ID — a secure, unified health account linking your entire medical history, with your consent. 
                  It also helps track and monitor <b className="text-foreground">Multi-Drug Resistant (MDR)</b> infections, 
                  enabling healthcare providers to take timely and informed actions.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


function HealthcareChallengeInline() {
  const problems = [
    {
      icon: FileText,
      title: "Scattered Medical Records",
      description:
        "Your health data is fragmented across multiple hospitals, making emergency access difficult.",
    },
    {
      icon: Clock,
      title: "Time-Critical Delays",
      description:
        "Emergency care can be slowed down by lengthy processes to gather medical history.",
    },
    {
      icon: AlertTriangle,
      title: "Hidden MDR Risks",
      description:
        "Multi-drug resistant (MDR) infections can go unnoticed without unified tracking across providers.",
    },
  ];

  const solutions = [
    {
      icon: User,
      title: "Unified Health Identity",
      description:
        "A single health ID linking your entire medical history and MDR insights securely in one place.",
    },
    {
      icon: Zap,
      title: "Faster Emergency Access",
      description:
        "Critical health data and MDR indicators are instantly accessible to doctors with your consent.",
    },
    {
      icon: Heart,
      title: "Smarter, Safer Care",
      description:
        "Each visit updates your records, helping prevent duplicate prescriptions and reduce MDR risks.",
    },
  ];

  return (
    <section className="pt-24 bg-gradient-to-b from-background/95 via-muted/20 to-background relative overflow-hidden">
      {/* Enhanced particle-like background */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="particleGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {[...Array(35)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 100 + "%"}
              cy={Math.random() * 100 + "%"}
              r={Math.random() * 50 + 15}
              fill="url(#particleGradient)"
            />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Healthcare &{" "}
            <span className="bg-hero-gradient bg-clip-text text-transparent">
              MDR
            </span>{" "}
            Challenge We’re Solving
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AayuLink bridges the healthcare gap — uniting your medical records,
            MDR awareness, and trusted care under one digital identity.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Problems */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-2xl font-bold text-red-600">
                Current Problems
              </h3>
            </div>
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  className="bg-card border border-red-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex gap-4 items-center">
                    <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">
                        {p.title}
                      </h4>
                      <p className="text-muted-foreground">{p.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-bold text-green-600">
                AayuLink Solutions
              </h3>
            </div>
            {solutions.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  className="bg-card border border-green-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <div className="flex gap-4 items-center">
                    <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">
                        {s.title}
                      </h4>
                      <p className="text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


function NetworkSectionInline() {
  const mockHospitals = [
    { name: "Fortis Healthcare", city: "Mumbai", specialty: "Oncology", patientsServed: "22,000+" },
    { name: "Kokilaben Hospital", city: "Mumbai", specialty: "Multi-specialty", patientsServed: "15,000+" },
    { name: "Apollo Hospitals", city: "Delhi", specialty: "Cardiology", patientsServed: "35,000+" },
    { name: "Max Healthcare", city: "Delhi", specialty: "Neurology", patientsServed: "28,000+" },
    { name: "Manipal Hospital", city: "Bengaluru", specialty: "Transplants", patientsServed: "18,000+" },
    { name: "Narayana Health", city: "Bengaluru", specialty: "Cardiac Sciences", patientsServed: "40,000+" },
    { name: "Gleneagles Global", city: "Chennai", specialty: "Hepatology", patientsServed: "12,000+" },
    { name: "MIOT International", city: "Chennai", specialty: "Orthopaedics", patientsServed: "16,000+" },
  ];

  const cities = useMemo(() => ["All", ...new Set(mockHospitals.map((h) => h.city))], []);
  const [selectedCity, setSelectedCity] = useState("All");
  const filteredHospitals = useMemo(() => {
    if (selectedCity === "All") return mockHospitals;
    return mockHospitals.filter((h) => h.city === selectedCity);
  }, [selectedCity, mockHospitals]);

  const HospitalCard = ({ hospital, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/70 backdrop-blur-lg border border-accent/10 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="bg-accent/10 p-3 rounded-xl">
          <Building2 className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-foreground">{hospital.name}</h4>
          <p className="text-sm text-muted-foreground">
            {hospital.city} • {hospital.specialty}
          </p>
          <p className="text-sm font-medium text-accent mt-1">
            {hospital.patientsServed} patients served
          </p>
        </div>
        <Dot className="text-green-500 w-10 h-10 -m-3 animate-pulse" />
      </div>
    </motion.div>
  );

  const StatCard = ({ value, label }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/70 backdrop-blur-lg border border-accent/10 rounded-xl p-5 text-center shadow-sm"
    >
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Soft floating background blobs */}
      <div className="absolute -top-40 -left-32 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[180px] opacity-60 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[160px] opacity-50 animate-pulse delay-500" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4 text-sm">
            <MapPin className="w-4 h-4" /> Pan-India Coverage
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Connected{" "}
            <span className="bg-hero-gradient bg-clip-text text-transparent">
              Hospital Network
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            AayuLink connects over <span className="font-semibold text-primary">5,000+ hospitals</span> across India, enabling instant, secure health data sharing and emergency readiness.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* India Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-lg border border-accent/20 bg-white/60 backdrop-blur-md"
          >
            <img
              src="/images/indiamap.jpg"
              alt="India network map"
              className="w-full object-cover opacity-90"
            />
            <div className="absolute top-6 left-6 bg-white/90 text-slate-800 px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-semibold">5,247 Hospitals Connected</span>
            </div>
            <div className="absolute bottom-6 right-6 bg-white/90 px-4 py-3 rounded-xl shadow-md text-center">
              <p className="text-4xl font-bold text-primary">99.9%</p>
              <p className="text-xs text-muted-foreground font-medium">
                Network Uptime
              </p>
            </div>

            {/* Subtle glowing connection points */}
            <div className="absolute inset-0">
              <div className="absolute top-[40%] left-[45%] w-3 h-3 bg-green-400 rounded-full animate-ping opacity-70" />
              <div className="absolute top-[55%] left-[60%] w-3 h-3 bg-accent rounded-full animate-ping delay-200 opacity-60" />
              <div className="absolute top-[30%] left-[70%] w-3 h-3 bg-primary rounded-full animate-ping delay-500 opacity-60" />
            </div>
          </motion.div>

          {/* Hospital list + stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Filter by City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-3 rounded-lg border border-accent/20 bg-white/70 backdrop-blur-md text-foreground focus:ring-2 focus:ring-accent outline-none transition-all"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <div className="space-y-4 h-[330px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/40 mt-4">
              {filteredHospitals.length ? (
                filteredHospitals.map((hospital, i) => (
                  <HospitalCard key={hospital.name} hospital={hospital} index={i} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                  <Search className="w-10 h-10 mb-3" />
                  <p className="font-semibold text-lg">No Hospitals Found</p>
                  <p className="text-sm">
                    No hospitals listed for “{selectedCity}”.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <StatCard value="24/7" label="Emergency Access" />
              <StatCard value="5,247+" label="Connected Hospitals" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function AboutAndMDRSection() {
  const mdrStats = [
    {
      icon: Microscope,
      title: "AI-Driven MDR Detection",
      desc: "AayuLink continuously analyzes hospital microbiology data to identify multi-drug-resistant patterns early.",
      color: "from-rose-500 to-pink-400",
    },
    {
      icon: Biohazard,
      title: "Real-Time Genomic Insights",
      desc: "Genomic and phenotypic resistance data converge for rapid identification of high-risk pathogen clusters.",
      color: "from-red-500 to-orange-400",
    },
    {
      icon: Activity,
      title: "Predictive Epidemiology",
      desc: "Machine-learning models forecast outbreak hotspots, enabling proactive infection control.",
      color: "from-blue-500 to-sky-400",
    },
    {
      icon: Database,
      title: "Unified Data Network",
      desc: "AayuLink synchronizes hospital, pharmacy, and lab intelligence into a secure national health backbone.",
      color: "from-emerald-500 to-teal-400",
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-28 bg-gradient-to-br from-background via-background to-muted/50">
      {/* Floating glow orbs */}
      <div className="absolute -top-40 left-20 w-72 h-72 bg-primary/20 blur-3xl rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full animate-pulse-slow"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* About AayuLink Section */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium">
            <HeartPulse className="w-4 h-4" /> About AayuLink
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Redefining India’s Digital Health Infrastructure
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AayuLink is building the unified health identity layer for every citizen — connecting hospitals, labs, and
            patients into a secure ecosystem where data empowers care.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          {/* Left: Text */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-foreground">Our Vision</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AayuLink aims to empower every individual with complete control over their health records. By aligning with
              India’s Ayushman Bharat Digital Mission, we’re creating a unified framework for healthcare continuity.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-xl backdrop-blur-sm">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">ISO 27001 Certified</h4>
                  <p className="text-sm text-muted-foreground">Enterprise-grade Security Standards</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-100/10 p-4 rounded-xl backdrop-blur-sm">
                  <BadgeCheck className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">ABDM Compliant</h4>
                  <p className="text-sm text-muted-foreground">National Digital Health Stack</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Floating Image */}
          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-2xl w-[85%] mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1600&auto=format&fit=crop"
              alt="Doctor using digital health dashboard"
              className="rounded-3xl object-cover w-full h-[400px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
          </motion.div>
        </div>

       
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-500 text-sm font-medium">
            <Biohazard className="w-4 h-4" /> MDR Surveillance
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Combatting Multi-Drug-Resistant Pathogens with Intelligence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AayuLink integrates pathogen genomics, hospital microbiology, and AI analytics to track and predict emerging
            resistance — making every hospital a sentinel node in India’s fight against MDR.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {mdrStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-transparent via-border to-transparent hover:via-primary/40"
              >
                <div className="relative bg-background/60 backdrop-blur-xl p-6 rounded-2xl h-full transition-all duration-500 group-hover:bg-background/80">
                  <div className={`w-12 h-12 rounded-xl mb-5 bg-gradient-to-r ${s.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Closing Callout */}
        <motion.div
          className="mt-24 text-center bg-gradient-to-r from-rose-500/10 via-primary/10 to-transparent border border-primary/20 rounded-3xl p-10 max-w-4xl mx-auto backdrop-blur-md shadow-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-2xl font-semibold mb-3 text-foreground">AayuLink: Data That Heals, Insights That Protect</h4>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            By merging digital health identities with pathogen intelligence, AayuLink bridges the gap between healthcare
            delivery and global biosurveillance — redefining how nations respond to invisible threats.
          </p>
        </motion.div>
      </div>
    </section>
  );
}


function AuthPanelInline({ onLogin, onSignUp, authError }) {
    const { t } = useLanguage(); 
    const [role, setRole] = useState("individual");
    const [mode, setMode] = useState("login");
    const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "", hospitalName: "", specialCode: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setFormError(""); 
      setSuccessMessage("");

      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          setFormError("Passwords do not match. Please try again.");
          setIsLoading(false);
          return;
        }
        
        const isSuccess = await onSignUp(formData.username, formData.password, role, formData.hospitalName, formData.specialCode);
        
        if (isSuccess) {
          setSuccessMessage("Registration successful! Redirecting to login...");
          setTimeout(() => {
            setMode("login");
            setSuccessMessage("");
            setFormData({ ...formData, password: '', confirmPassword: '' });
            setIsLoading(false); 
          }, 2000);
        } else {
          setIsLoading(false); 
        }
      } else { 
        await onLogin(formData.username, formData.password, role);
        setIsLoading(false);
      }
    };

    const cleanUpState = () => {
        setFormError("");
        setSuccessMessage("");
    };

    return (
      <section id="auth" className="py-24 bg-gray-50">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-green-600">{t.oneNationOneHealth.split(", ")[0]},</span>{" "}
            {t.oneNationOneHealth.split(", ")[1]}
          </h2>
          <p className="text-gray-500 leading-relaxed max-w-prose mx-auto mb-10">{t.tagline}</p>
          <div className="bg-white p-6 rounded-2xl shadow-lg border text-left">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button 
                onClick={() => { setRole("individual"); cleanUpState(); }} 
                className={`flex-1 text-center p-2 rounded-md font-semibold text-sm transition-colors ${role === "individual" ? "bg-white shadow" : "text-gray-500"}`}
              >
                {t.individual}
              </button>
              <button 
                onClick={() => { setRole("admin"); cleanUpState(); }} 
                className={`flex-1 text-center p-2 rounded-md font-semibold text-sm transition-colors ${role === "admin" ? "bg-white shadow" : "text-gray-500"}`}
              >
                {t.admin}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field name="username" label="Username" type="text" placeholder="Enter your username" icon={User} value={formData.username} onChange={handleInputChange} required />
              <Field name="password" label="Password" type="password" placeholder="Enter your password" icon={Shield} value={formData.password} onChange={handleInputChange} required />
              {mode === 'signup' && (
                <Field name="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter your password" icon={Shield} value={formData.confirmPassword} onChange={handleInputChange} required />
              )}
              {role === "admin" && mode === "signup" && (
                <>
                  <Field name="hospitalName" label="Hospital Name" type="text" placeholder="e.g., Apollo Hospital, Mumbai" icon={HospitalIcon} value={formData.hospitalName} onChange={handleInputChange} required />
                  <Field name="specialCode" label="Special Hospital Code" type="text" placeholder="e.g., APOLLO-MUM-01" icon={Building} value={formData.specialCode} onChange={handleInputChange} required />
                </>
              )}
              {successMessage && <p className="text-sm text-green-600 text-center pt-2">{successMessage}</p>}
              {(authError || formError) && <p className="text-sm text-red-600 text-center pt-2">{authError || formError}</p>}
              <button type="submit" disabled={isLoading} className="w-full rounded-lg font-bold py-3 px-4 bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors mt-4">
                {isLoading ? "Processing..." : (mode === "login" ? "Login" : "Sign Up")}
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-4">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); cleanUpState(); }} className="font-semibold text-green-600 hover:underline ml-1">{mode === "login" ? "Sign Up" : "Login"}</button>
            </p>
          </div>
        </div>
      </section>
    );
}


export default function LandingPage(props) {
  const { onLogin, onSignUp, authError, onValidatorClick } = props;

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);
  
  const particleOptions = useMemo(() => ({
    fullScreen: {
      enable: false
    },
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ["#3b82f6", "#10b981", "#8b5cf6"],
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.6,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 5,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 1,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          line_opacity: 0.5,
        },
        push: {
          particles_nb: 4,
        },
      },
    },
    retina_detect: true,
    background: {
      color: "transparent",
    }
  }), []);

  return (
    <div className="bg-background text-foreground relative">
      
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
      
      <div className="relative z-10">
        <HeaderInline onValidatorClick={onValidatorClick} />
        <main>
          <HeroInline onGetStartedClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })} />

          <WhatIsAayulinkInline />
          
          <AboutAndMDRSection />

          <HealthcareChallengeInline />
          
          <NetworkSectionInline />
         
          <AuthPanelInline 
            onLogin={onLogin} 
            onSignUp={onSignUp} 
            authError={authError} 
          />
        </main>
      </div>
    </div>
  );
}