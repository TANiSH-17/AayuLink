import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  User, Shield, Building, Hospital as HospitalIcon,
  AlertCircle, CheckCircle, FileText, Clock, AlertTriangle, Zap,
  Heart, CreditCard, ShieldCheck, BadgeCheck, Building2, Dot, Menu, X, 
  Activity, Database, HeartPulse, Biohazard, Microscope
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { scroller, animateScroll as scroll } from "react-scroll";



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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "features", label: "Features" },
    { id: "network", label: "Network" },
    { id: "about", label: "About Us" },
  ];

  const handleScrollTo = (id) => {
    scroller.scrollTo(id, {
      duration: 0,
      smooth: "easeInOutQuart",
      offset: -80,
    });
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled || isMenuOpen
          ? "bg-card/95 backdrop-blur-lg shadow-lg border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleScrollTo("top")}
            className="flex items-center transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/images/aayulink-logo.png"
              alt="AayuLink Logo"
              className="h-10 md:h-12 object-contain"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className="relative text-base font-medium text-muted-foreground transition-all duration-300 group"
              >
                <span className="hover:text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300">
                  {link.label}
                </span>
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            <button
              onClick={onValidatorClick}
              className="relative text-base font-medium text-muted-foreground transition-all duration-300 group"
            >
              <span className="hover:text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300">
                Pharmacist / Lab Portal
              </span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>

          {/* Emergency Login */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => handleScrollTo("auth")}
              className="px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Emergency Login
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground transition-transform duration-300 hover:scale-110"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ease-in-out bg-card/95 border-t border-border ${
          isMenuOpen ? "max-h-screen py-6" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className="text-lg font-medium text-muted-foreground hover:text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              onValidatorClick();
              setIsMenuOpen(false);
            }}
            className="text-lg font-medium text-muted-foreground hover:text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300"
          >
            Pharmacist / Lab Portal
          </button>
          <button
            onClick={() => handleScrollTo("auth")}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            Emergency Login
          </button>
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


function HealthcareNetworkUnified() {
  const problems = [
    {
      icon: FileText,
      title: "Scattered Medical Records",
      description:
        "Your health data is fragmented across hospitals, delaying critical access during emergencies.",
    },
    {
      icon: Clock,
      title: "Time-Critical Delays",
      description:
        "Doctors waste precious minutes retrieving past reports, impacting urgent care decisions.",
    },
    {
      icon: AlertTriangle,
      title: "Hidden MDR Risks",
      description:
        "Multi-drug resistant (MDR) infections go unnoticed without unified cross-provider data.",
    },
  ];

  const solutions = [
    {
      icon: User,
      title: "Unified Health Identity",
      description:
        "Your ABHA-powered health ID links medical history and MDR insights in one secure record.",
    },
    {
      icon: Zap,
      title: "Faster Emergency Access",
      description:
        "With consent, doctors instantly access your verified records and MDR indicators for faster care.",
    },
    {
      icon: Heart,
      title: "Smarter, Safer Care",
      description:
        "Each visit updates your digital health twin — reducing duplicate prescriptions and MDR risks.",
    },
  ];

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
  const [activePulse, setActivePulse] = useState(null);

  const filteredHospitals = useMemo(() => {
    if (selectedCity === "All") return mockHospitals;
    return mockHospitals.filter((h) => h.city === selectedCity);
  }, [selectedCity, mockHospitals]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setActivePulse(idx);
      idx = (idx + 1) % filteredHospitals.length;
    }, 800);
    return () => clearInterval(interval);
  }, [filteredHospitals]);

  const StatCard = ({ value, label }) => (
    <div className="bg-card border border-border p-4 rounded-xl text-center transition-all hover:shadow-lg hover:scale-105">
      <p className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );

  const HospitalCard = ({ hospital, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
    >
      <div className="bg-primary/10 p-3 rounded-lg">
        <Building2 className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-foreground">{hospital.name}</h4>
        <p className="text-sm text-muted-foreground">
          {hospital.city} • {hospital.specialty}
        </p>
        <p className="text-sm font-semibold text-primary mt-1">
          {hospital.patientsServed} patients served
        </p>
      </div>
      <Dot size={40} className="text-green-500" />
    </motion.div>
  );

  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Shared glowing network background */}
      <div className="absolute inset-0 opacity-60">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="unifiedGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[...Array(40)].map((_, i) => {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r={activePulse === i % filteredHospitals.length ? 20 : 10}
                fill="url(#unifiedGradient)"
                className={`transition-all duration-700 ${
                  activePulse === i % filteredHospitals.length ? "opacity-100" : "opacity-40"
                }`}
              />
            );
          })}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* 1️⃣ Healthcare Challenge Section */}
        <motion.div
          id="network" 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            The Healthcare &{" "}
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              MDR
            </span>{" "}
            Challenge
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AayuLink bridges fragmented healthcare and MDR awareness through connected data intelligence.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-28">
          {/* Problems */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-2xl font-semibold text-red-500">Current Problems</h3>
            </div>
            <div className="space-y-6">
              {problems.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={i}
                    className="bg-card border border-red-200/50 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl">
                        <Icon className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{p.title}</h4>
                        <p className="text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-2xl font-semibold text-green-500">AayuLink Solutions</h3>
            </div>
            <div className="space-y-6">
              {solutions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    className="bg-card border border-green-200/50 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-50 w-12 h-12 flex items-center justify-center rounded-xl">
                        <Icon className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{s.title}</h4>
                        <p className="text-muted-foreground">{s.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2️⃣ Connected Network Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-4 text-sm">
            Real-Time Healthcare Connectivity
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            AayuLink{" "}
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Network Grid
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A living ecosystem of connected hospitals, clinics, and patients — synchronizing real-time medical and MDR insights across India.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative bg-slate-900/90 border border-teal-700/30 rounded-2xl p-6 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-transparent animate-pulse" />
            <div className="relative z-10">
            {/* Header with subtle gradient glow */}
            <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
              Live Data Sync <span className="inline-block animate-pulse-dot">•</span>
            </h3>

            {/* Description */}
            <p className="text-sm md:text-base text-blue-100 mb-6 leading-relaxed">
              Each node in the AayuLink grid represents a verified healthcare provider, exchanging real-time patient data and MDR intelligence securely, ensuring faster, safer, and smarter care.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <StatCard value="5,247" label="Connected Hospitals" />
              <StatCard value="99.9%" label="Uptime" />
              <StatCard value="2.4M+" label="Records Synced" />
              <StatCard value="24/7" label="Emergency Access" />
            </div>

            <style>
              {`
                .animate-pulse-dot {
                  display: inline-block;
                  width: 0.5rem;
                  height: 0.5rem;
                  border-radius: 9999px;
                  background-color: #22c55e;
                  margin-left: 0.5rem;
                  animation: pulse 1.2s infinite;
                }

                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.5); opacity: 0.5; }
                }
              `}
            </style>
          </div>

          </div>

          <div>
            <div className="relative mb-4">
              <label
                htmlFor="city-filter"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Filter by City
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-card text-foreground appearance-none pr-10"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3 h-[340px] overflow-y-auto pr-2">
              {filteredHospitals.map((hospital, index) => (
                <HospitalCard key={hospital.name} hospital={hospital} index={index} />
              ))}
            </div>
          </div>
        </div>
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
    <section id="auth" className="py-24 bg-gradient-to-b from-background/95 via-muted/10 to-background">
      <div className="max-w-xl mx-auto px-6 relative z-10">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              {t.oneNationOneHealth.split(", ")[0]},
            </span>{" "}
            {t.oneNationOneHealth.split(", ")[1]}
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-prose mx-auto">{t.tagline}</p>
        </motion.div>

        {/* Glassmorphic Panel */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/10 p-8">
          {/* Role Selector */}
          <div className="flex bg-white/10 rounded-full p-1 mb-6 shadow-inner">
            {["individual", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); cleanUpState(); }}
                className={`flex-1 text-center py-2 font-semibold rounded-full text-sm transition-colors
                  ${role === r 
                    ? "bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-lg scale-105" 
                    : "text-gray-400 hover:text-black"
                  }`}
              >
                {r === "individual" ? t.individual : t.admin}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              name="username"
              label="Username"
              type="text"
              placeholder="Enter your username"
              icon={User}
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <Field
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={Shield}
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {mode === "signup" && (
              <Field
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                icon={Shield}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            )}
            {role === "admin" && mode === "signup" && (
              <>
                <Field
                  name="hospitalName"
                  label="Hospital Name"
                  type="text"
                  placeholder="e.g., Apollo Hospital, Mumbai"
                  icon={HospitalIcon}
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  required
                />
                <Field
                  name="specialCode"
                  label="Special Hospital Code"
                  type="text"
                  placeholder="e.g., APOLLO-MUM-01"
                  icon={Building}
                  value={formData.specialCode}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}

            {/* Feedback */}
            {successMessage && <p className="text-center text-green-400 font-medium">{successMessage}</p>}
            {(authError || formError) && <p className="text-center text-red-500 font-medium">{authError || formError}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 font-bold bg-gradient-to-r from-teal-400 to-blue-500 text-white hover:from-teal-500 hover:to-blue-600 disabled:opacity-60 shadow-lg transition-all transform hover:scale-105"
            >
              {isLoading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>

          {/* Switch Mode */}
          <p className="text-xs text-gray-400 text-center mt-4">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); cleanUpState(); }}
              className="ml-1 font-semibold text-gradient bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
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

          <HealthcareNetworkUnified  />
         
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