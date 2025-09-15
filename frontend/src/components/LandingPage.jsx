import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  User, Shield, Building, Hospital as HospitalIcon, Globe, MapPin,
  AlertCircle, CheckCircle, FileText, Clock, AlertTriangle, Zap,
  Heart, CreditCard, Smartphone, ShieldCheck, BadgeCheck, Building2, Dot, Search, Menu, X
} from "lucide-react";
import LeafletMap from "./LeafletMap.jsx";
import { useLanguage } from "../contexts/LanguageContext.jsx";

/* ==========================================================================
   Reusable Field
   ========================================================================== */
function Field({ name, label, type, placeholder, icon: Icon, value, onChange, required = false }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative mt-1">
        <input
          id={name} name={name} type={type}
          value={value} onChange={onChange}
          className="w-full p-3 pl-10 rounded-lg border border-input focus:ring-2 focus:ring-primary bg-card text-foreground"
          placeholder={placeholder} required={required}
        />
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}

/* ==========================================================================
   Header
   ========================================================================== */
function HeaderInline({ onValidatorClick, onToggleLanguage, langLabel, onEmergencyLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

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
              <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
                {link.label}
              </button>
            ))}
            <button onClick={onValidatorClick} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
              Pharmacist / Lab Portal
            </button>
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            {/* <button onClick={onToggleLanguage} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">{langLabel}</button> */}
            <button onClick={onEmergencyLogin} className="px-6 py-2.5 bg-destructive text-destructive-foreground rounded-full font-semibold hover:bg-destructive/90 transition-colors">
              Emergency Login
            </button>
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
            <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">{link.label}</button>
          ))}
          <button onClick={onValidatorClick} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">Pharmacist / Lab Portal</button>
          {/* <button onClick={onToggleLanguage} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">{langLabel}</button> */}
          <button onClick={onEmergencyLogin} className="mt-4 px-8 py-3 bg-destructive text-destructive-foreground rounded-full font-semibold">
            Emergency Login
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ==========================================================================
   Hero
   ========================================================================== */
function HeroInline() {
  return (
    <section id="top" className="relative min-h-[70vh] md:min-h-screen flex justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="absolute inset-0 z-0 opacity-80">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-accent/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-green-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
      </div>
      <div className="max-w-7xl mx-auto px-8 pt-16 md:pt-24 relative z-10 text-center animate-fade-in">
        <div className="animate-slide-up mb-10" style={{ animationDelay: "0.1s" }}>
          <img src="/images/aayulink-logo.png" alt="AayuLink Logo" className="w-4/5 md:w-1/2 mx-auto object-contain drop-shadow-lg animate-glow-light" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter text-foreground animate-slide-up" style={{ animationDelay: "0.3s" }}>
          The <span className="text-accent">Aadhaar</span> for your <span className="text-primary">Health</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          A unified digital front door for citizens, providers, and administrators—securely connecting hospitals, health IDs, and services across India.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{ animationDelay: "0.7s" }}>
          <button onClick={() => document.getElementById("auth")?.scrollIntoView({ behavior: "smooth" })} className="px-12 py-4 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary to-accent text-white hover:shadow-primary/50">
            Get Started
          </button>
          <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} className="px-12 py-4 text-lg font-semibold rounded-full border-2 border-primary/30 text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Interactive "What is AayuLink?" Section
   ========================================================================== */
function WhatIsAayulinkInline() {
  const [activeCard, setActiveCard] = useState('aadhaar');
  const aadhaarRef = useRef(null);
  const panRef = useRef(null);
  const abhaRef = useRef(null);
  const cardData = {
    aadhaar: { icon: User, title: "Aadhaar", subtitle: "Your Digital Identity", color: "text-sky-300", imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2940&auto=format&fit=crop' },
    pan: { icon: CreditCard, title: "PAN", subtitle: "Your Financial Identity", color: "text-blue-300", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop" },
    abha: { icon: Heart, title: "ABHA", subtitle: "Your Health Identity", color: "text-emerald-300", imageUrl: "/images/abha.jpg" },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { setActiveCard(entry.target.id); } });
      }, { rootMargin: "-40% 0px -60% 0px" }
    );
    const refs = [aadhaarRef, panRef, abhaRef];
    refs.forEach(ref => { if (ref.current) observer.observe(ref.current); });
    return () => { refs.forEach(ref => { if (ref.current) observer.unobserve(ref.current); }); };
  }, []);

  const currentCard = cardData[activeCard];
  const CardIcon = currentCard.icon;

  return (
    <section id="features" className="py-24 bg-background-gradient">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="lg:sticky top-24 h-[500px]">
            <div key={activeCard} className="w-full h-full rounded-3xl p-10 flex flex-col justify-between shadow-xl transition-all duration-700 ease-in-out bg-cover bg-center animate-fade-in" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentCard.imageUrl})` }}>
              <div>
                <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm"><CardIcon className={`w-10 h-10 ${currentCard.color}`} /></div>
                <h3 className="text-5xl font-bold text-white leading-tight">{currentCard.title}</h3>
              </div>
              <p className="text-white/80 text-2xl leading-relaxed">{currentCard.subtitle}</p>
            </div>
          </div>
          <div className="space-y-[60vh] py-20">
            <div ref={aadhaarRef} id="aadhaar" className="space-y-4">
              <h2 className="text-5xl font-bold text-foreground leading-tight">We have an Aadhaar card for our <span className="text-primary">identification.</span></h2>
              <p className="text-xl text-muted-foreground">It's the foundational identity for every citizen, unlocking services and benefits nationwide.</p>
            </div>
            <div ref={panRef} id="pan" className="space-y-4">
              <h2 className="text-5xl font-bold text-foreground leading-tight">A PAN card for our <span className="text-accent">finances.</span></h2>
              <p className="text-xl text-muted-foreground">The key to our financial lives, from taxes to investments, unified under one digital roof.</p>
            </div>
            <div ref={abhaRef} id="abha" className="space-y-4">
              <h2 className="text-5xl font-bold text-foreground leading-tight">But for our health?</h2>
              <div className="text-xl text-muted-foreground space-y-4 pt-4">
                <p>The missing piece is here. Introducing the <b className="text-foreground">Aadhaar of your Health</b>.</p>
                <p><span className="bg-hero-gradient bg-clip-text text-transparent font-bold">AayuLink</span> provides your ABHA ID—a secure, unified health account linking your entire medical history, with your consent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Healthcare Challenge
   ========================================================================== */
function HealthcareChallengeInline() {
  const problems = [{ icon: FileText, title: "Scattered Medical Records", description: "Your health data is fragmented across multiple hospitals." },{ icon: Clock, title: "Time-Consuming Process", description: "Emergency situations are delayed by lengthy processes to gather medical history." },{ icon: AlertTriangle, title: "Critical Information Loss", description: "Important allergies and previous treatments are often missed, leading to risks." },];
  const solutions = [{ icon: User, title: "Unified Patient Profile", description: "One comprehensive profile with your complete medical history, instantly accessible." },{ icon: Zap, title: "Instant Emergency Access", description: "Doctors can access critical health information immediately with proper consent." },{ icon: Heart, title: "Complete Care Continuity", description: "Every consultation and treatment is automatically updated across your network." },];
  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">The Healthcare Challenge We&apos;re <span className="bg-hero-gradient bg-clip-text text-transparent">Solving</span></h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">AayuLink creates a connected ecosystem where your medical history follows you seamlessly.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8"><AlertCircle className="w-6 h-6 text-red-600" /><h3 className="text-2xl font-bold text-red-600">Current Problems</h3></div>
            {problems.map((p, i) => { const Icon = p.icon; return (<div key={i} className="bg-card border border-red-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-slide-up p-6" style={{ animationDelay: `${i * 0.1}s` }}><div className="flex gap-4 items-center"><div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-6 h-6 text-red-600" /></div><div><h4 className="font-semibold text-lg text-foreground">{p.title}</h4><p className="text-muted-foreground">{p.description}</p></div></div></div>);})}
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8"><CheckCircle className="w-6 h-6 text-green-600" /><h3 className="text-2xl font-bold text-green-600">AayuLink Solutions</h3></div>
            {solutions.map((s, i) => { const Icon = s.icon; return (<div key={i} className="bg-card border border-green-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-slide-up p-6" style={{ animationDelay: `${i * 0.1 + 0.3}s` }}><div className="flex gap-4 items-center"><div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-6 h-6 text-green-600" /></div><div><h4 className="font-semibold text-lg text-foreground">{s.title}</h4><p className="text-muted-foreground">{s.description}</p></div></div></div>);})}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Why Choose AyuLink
   ========================================================================== */

  /* ==========================================================================
   Why Choose AyuLink (with Enhanced Zoom Effect)
   ========================================================================== */
function WhyChooseAayulinkInline() {
  const stats = [ { icon: Heart, number: "500+", label: "Connected Hospitals", color: "text-blue-600", bg: "bg-blue-50" }, { icon: Zap, number: "99.9%", label: "Uptime Guarantee", color: "text-green-600", bg: "bg-green-50" }, { icon: Shield, number: "10M+", label: "Records Secured", color: "text-purple-600", bg: "bg-purple-50" }, { icon: Clock, number: "<3s", label: "Average Access Time", color: "text-orange-600", bg: "bg-orange-50" },];
  const features = [ { icon: Shield, title: "Bank-Level Security", description: "Military-grade encryption with HIPAA compliance for complete data protection.", color: "text-blue-600", bg: "bg-blue-50" }, { icon: Zap, title: "Lightning Fast", description: "Access complete medical history in under 3 seconds during emergencies.", color: "text-yellow-600", bg: "bg-yellow-50" }, { icon: Smartphone, title: "Always Available", description: "24/7 mobile access with biometric authentication and offline capabilities.", color: "text-green-600", bg: "bg-green-50" },];
  
  return (
    <section className="py-24 bg-background-gradient">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">Healthcare Made <span className="text-primary">Simple</span> & <span className="text-green-600">Secure</span></h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Join millions who trust AayuLink to keep their health data safe, accessible, and under their complete control.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => {
            const IconComp = s.icon;
            return (
              // ✅ ZOOM EFFECT IMPROVED: Changed scale-105 to scale-110 and slowed duration to 500ms
              <div key={i} className="bg-card p-8 text-center rounded-2xl shadow-lg hover:shadow-dark-hover hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-in-out animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`${s.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}><IconComp className={`w-8 h-8 ${s.color}`} /></div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{s.number}</div>
                <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const IconComp = f.icon;
            return (
              // ✅ ZOOM EFFECT IMPROVED: Changed scale-105 to scale-110 and slowed duration to 500ms
              <div key={i} className="bg-card p-10 text-center rounded-2xl shadow-lg hover:shadow-dark-hover hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-in-out group animate-slide-up" style={{ animationDelay: `${i * 0.2 + 0.4}s` }}>
                <div className={`${f.bg} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComp className={`w-10 h-10 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
/* ==========================================================================
   Improved Network Section
   ========================================================================== */
function NetworkSectionInline() {
  const mockHospitals = [ { name: 'Fortis Healthcare', city: 'Mumbai', specialty: 'Oncology', patientsServed: '22,000+' }, { name: 'Kokilaben Hospital', city: 'Mumbai', specialty: 'Multi-specialty', patientsServed: '15,000+' }, { name: 'Apollo Hospitals', city: 'Delhi', specialty: 'Cardiology', patientsServed: '35,000+' }, { name: 'Max Healthcare', city: 'Delhi', specialty: 'Neurology', patientsServed: '28,000+' }, { name: 'Manipal Hospital', city: 'Bengaluru', specialty: 'Transplants', patientsServed: '18,000+' }, { name: 'Narayana Health', city: 'Bengaluru', specialty: 'Cardiac Sciences', patientsServed: '40,000+' }, { name: 'Gleneagles Global', city: 'Chennai', specialty: 'Hepatology', patientsServed: '12,000+' }, { name: 'MIOT International', city: 'Chennai', specialty: 'Orthopaedics', patientsServed: '16,000+' },];
  const cities = useMemo(() => ['All', ...new Set(mockHospitals.map(h => h.city))], []);
  const [selectedCity, setSelectedCity] = useState('All');
  const filteredHospitals = useMemo(() => {
    if (selectedCity === 'All') { return mockHospitals; }
    return mockHospitals.filter(h => h.city === selectedCity);
  }, [selectedCity]);

  const HospitalCard = ({ hospital, index }) => (
    <div className="bg-card hover:bg-muted/50 border border-border p-4 rounded-xl flex items-center gap-4 transition-all duration-200 animate-slide-up" style={{ animationDelay: `${index * 50}ms`, animationDuration: '300ms' }}>
      <div className="bg-primary/10 p-3 rounded-lg"><Building2 className="w-6 h-6 text-primary" /></div>
      <div className="flex-grow">
        <h4 className="font-bold text-foreground">{hospital.name}</h4>
        <p className="text-sm text-muted-foreground">{hospital.city} • {hospital.specialty}</p>
        <p className="text-sm font-semibold text-primary mt-1">{hospital.patientsServed} patients served</p>
      </div>
      <div className="text-green-500"><Dot size={48} className="-m-4" /></div>
    </div>
  );

  const StatCard = ({ value, label }) => (
     <div className="bg-card border border-border p-4 rounded-xl text-center transition-all hover:shadow-lg hover:scale-105">
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
     </div>
  );

  return (
    <section id="network" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-4 text-sm">Pan-India Coverage</div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Connected Hospital Network</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">AayuLink connects over 5,000 hospitals across India, ensuring your health data is accessible wherever you need medical care.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative animate-slide-up bg-slate-900 rounded-2xl shadow-xl p-4">
            <img src="/images/indiamap.jpg" alt="Glowing network map of India" className="w-full h-full object-contain opacity-90"/>
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in"><div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div><span className="font-semibold">5,247 Hospitals Connected</span></div>
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center animate-fade-in" style={{animationDelay: '200ms'}}><p className="text-4xl font-bold text-primary">99.9%</p><p className="text-sm font-medium text-muted-foreground">Uptime</p></div>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative mb-4">
              <label htmlFor="city-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by City</label>
              <select id="city-filter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full p-3 rounded-lg border border-input bg-card text-foreground appearance-none pr-10">
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <MapPin className="w-5 h-5 text-muted-foreground absolute right-3 top-[37px] pointer-events-none" />
            </div>
            <div className="space-y-3 h-[320px] overflow-y-auto pr-2">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map((hospital, index) => <HospitalCard key={hospital.name} hospital={hospital} index={index} />)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                  <Search className="w-12 h-12 mb-4" />
                  <p className="font-semibold text-lg">No Hospitals Found</p>
                  <p className="text-sm">There are no hospitals listed for "{selectedCity}".</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <StatCard value="24/7" label="Emergency Access" />
              <StatCard value="5,247" label="Connected Hospitals" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   New "About" Section
   ========================================================================== */
function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">About AayuLink</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">We're on a mission to revolutionize healthcare in India by creating a unified, secure, and patient-controlled health data ecosystem.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 animate-slide-up">
            <h3 className="text-3xl font-bold text-foreground">Our Vision</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">Our vision is to empower every Indian with complete control over their health data through accessible and secure records. We believe this is fundamental to enabling seamless, high-quality healthcare across the nation.</p>
            <p className="text-lg text-muted-foreground leading-relaxed">Aligned with the Ayushman Bharat Digital Mission (ABDM), we are collaborating with hospitals and technology providers to build a truly unified digital health platform for India.</p>
            <div className="flex flex-col sm:flex-row gap-8 pt-6">
              <div className="flex items-center gap-4"><div className="bg-primary/10 p-4 rounded-xl"><ShieldCheck className="w-8 h-8 text-primary" /></div><div><h4 className="font-semibold text-foreground text-lg">ISO 27001 Certified</h4><p className="text-sm text-muted-foreground">Security Standards</p></div></div>
              <div className="flex items-center gap-4"><div className="bg-green-100 p-4 rounded-xl"><BadgeCheck className="w-8 h-8 text-green-600" /></div><div><h4 className="font-semibold text-foreground text-lg">ABDM Compliant</h4><p className="text-sm text-muted-foreground">Government Approved</p></div></div>
            </div>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2832&auto=format&fit=crop" alt="Doctor showing patient data on a tablet" className="rounded-2xl shadow-xl w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Redesigned Centered Auth Panel
   ========================================================================== */
function AuthPanelInline({ onLogin, onSignUp, authError }) {
    const { t } = useLanguage();
    const [role, setRole] = useState("individual");
    const [mode, setMode] = useState("login");
    const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "", hospitalName: "", specialCode: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setFormError(""); 
      if (mode === "signup" && formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match. Please try again.");
        setIsLoading(false);
        return;
      }
      await (mode === "login" ? onLogin(formData.username, formData.password, role) : onSignUp(formData.username, formData.password, role, formData.hospitalName, formData.specialCode));
      setIsLoading(false);
    };
    return (
      <section id="auth" className="py-24 bg-background-gradient">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-primary">{t.oneNationOneHealth.split(", ")[0]},</span>{" "}
            {t.oneNationOneHealth.split(", ")[1]}
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-prose mx-auto mb-10">{t.tagline}</p>
          <div className="bg-card p-6 rounded-2xl shadow-card border text-left">
            <div className="flex bg-secondary rounded-lg p-1 mb-6">
              <button onClick={() => { setRole("individual"); setFormError(""); }} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${role === "individual" ? "bg-background shadow" : "text-muted-foreground"}`}>{t.individual}</button>
              <button onClick={() => { setRole("admin"); setFormError(""); }} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${role === "admin" ? "bg-background shadow" : "text-muted-foreground"}`}>{t.admin}</button>
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
              {(authError || formError) && <p className="text-sm text-red-600 text-center">{authError || formError}</p>}
              <button type="submit" disabled={isLoading} className="w-full rounded-lg font-bold py-3 px-4 bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
                {isLoading ? "Processing..." : (mode === "login" ? "Login" : "Sign Up")}
              </button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setFormError(""); }} className="font-semibold text-primary hover:underline ml-1">{mode === "login" ? "Sign Up" : "Login"}</button>
            </p>
          </div>
        </div>
      </section>
    );
}

/* ==========================================================================
   Final Page Export
   ========================================================================== */
export default function LandingPage(props) {
  const [isVisible, setIsVisible] = useState(false);
  const { toggleLanguage, t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  const { onLogin, onSignUp, authError, onValidatorClick } = props;

  return (
    <div className={`bg-background text-foreground transition-opacity duration-700 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`} >
      <HeaderInline
        onValidatorClick={onValidatorClick}
        onToggleLanguage={toggleLanguage}
        langLabel={t.langButton}
        onEmergencyLogin={() => document.getElementById("auth")?.scrollIntoView({ behavior: "smooth" })}
      />
      <main>
        <HeroInline />
        <WhatIsAayulinkInline />
        <HealthcareChallengeInline />
        <WhyChooseAayulinkInline />
        <NetworkSectionInline />
        <AboutSection />
        <AuthPanelInline onLogin={onLogin} onSignUp={onSignUp} authError={authError} />
      </main>
    </div>
  );
}