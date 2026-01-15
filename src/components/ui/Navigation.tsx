'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useScrollStore, useUIStore } from '@/lib/store';

type NavItem = { id: string; label: string; href?: string };

// Main nav items (no Speed Audit - it's now under Services dropdown)
const navItems: NavItem[] = [
  { id: 'hero', label: 'Home' },
  { id: 'services', label: 'Services' }, // Has dropdown
  { id: 'case-studies', label: 'Case Studies', href: '/case-studies' },
  { id: 'projects', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'contact', label: 'Contact' },
];

// Services dropdown items
const serviceItems = [
  { id: 'speed-audit', label: 'Speed Audit', href: '/speed-audit', description: '48h turnaround • $197' },
  { id: 'speed-check', label: 'Free Speed Check', href: '/speed-check', description: 'Instant results' },
  { id: 'services-section', label: 'All Services', scrollTo: 'services', description: 'View all offerings' },
];

export default function Navigation() {
  const { activeSection } = useScrollStore();
  const { isMenuOpen, toggleMenu, closeAll } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      closeAll();
      setIsServicesOpen(false);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-darker/90 backdrop-blur-md border-b border-silver-800/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero');
            }}
            className="text-xl md:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-white">THEO DAUDEBOURG</span>
            <span className="text-lime-neon">.</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              item.id === 'services' ? (
                // Services with dropdown
                <div key={item.id} ref={servicesRef} className="relative">
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                      activeSection === 'services' || isServicesOpen
                        ? 'text-lime-neon'
                        : 'text-gray-brand hover:text-white'
                    }`}
                  >
                    {item.label}
                    <svg 
                      className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isServicesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-gray-darker/95 backdrop-blur-md border border-silver-800 rounded-lg shadow-xl overflow-hidden">
                      {serviceItems.map((service) => (
                        service.href ? (
                          <Link
                            key={service.id}
                            href={service.href}
                            onClick={() => setIsServicesOpen(false)}
                            className="block px-4 py-3 hover:bg-silver-900 transition-colors"
                          >
                            <span className="text-white text-sm font-medium">{service.label}</span>
                            <span className="block text-silver-500 text-xs mt-0.5">{service.description}</span>
                          </Link>
                        ) : (
                          <button
                            key={service.id}
                            onClick={() => {
                              scrollToSection(service.scrollTo!);
                              setIsServicesOpen(false);
                            }}
                            className="block w-full text-left px-4 py-3 hover:bg-silver-900 transition-colors"
                          >
                            <span className="text-white text-sm font-medium">{service.label}</span>
                            <span className="block text-silver-500 text-xs mt-0.5">{service.description}</span>
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm font-medium transition-colors text-gray-brand hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors relative ${
                    activeSection === item.id
                      ? 'text-lime-neon'
                      : 'text-gray-brand hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-lime-neon rounded-full" />
                  )}
                </button>
              )
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollToSection('contact')}
              className="btn-primary text-sm"
            >
              Start Project
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-white hover:text-lime-neon transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              item.id === 'services' ? (
                // Services section with sub-items on mobile
                <div key={item.id}>
                  <button
                    onClick={() => scrollToSection('services')}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === 'services'
                        ? 'bg-lime-neon/10 text-lime-neon'
                        : 'text-gray-brand hover:bg-gray-dark hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                  {/* Service sub-items */}
                  <div className="pl-4 mt-1 space-y-1">
                    {serviceItems.filter(s => s.href).map((service) => (
                      <Link
                        key={service.id}
                        href={service.href!}
                        onClick={closeAll}
                        className="block w-full text-left px-4 py-2 rounded-lg text-sm text-silver-400 hover:bg-gray-dark hover:text-white transition-colors"
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeAll}
                  className="block w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-brand hover:bg-gray-dark hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-lime-neon/10 text-lime-neon'
                      : 'text-gray-brand hover:bg-gray-dark hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              )
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="btn-primary w-full mt-4"
            >
              Start Project
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
