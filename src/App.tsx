import { useState, useEffect } from 'react';
import { HeroSection } from './sections/HeroSection';
import { ArchitectureSection } from './sections/ArchitectureSection';
import { EventBusSection } from './sections/EventBusSection';
import { MenuSystemSection } from './sections/MenuSystemSection';
import { OLEDDisplaySection } from './sections/OLEDDisplaySection';
import { AnimationSection } from './sections/AnimationSection';
import { GamesSection } from './sections/GamesSection';
import { CodeSection } from './sections/CodeSection';
import { HardwareDriversSection } from './sections/HardwareDriversSection';
import { ReproductionGuideSection } from './sections/ReproductionGuideSection';
import { FooterSection } from './sections/FooterSection';
import { Navigation } from './components/Navigation';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['hero', 'architecture', 'eventbus', 'menu', 'oled', 'animation', 'games', 'hardware', 'reproduction', 'code'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation 
        activeSection={activeSection} 
        onNavigate={scrollToSection}
        isScrolled={isScrolled}
      />
      
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="architecture">
          <ArchitectureSection />
        </section>
        
        <section id="eventbus">
          <EventBusSection />
        </section>
        
        <section id="menu">
          <MenuSystemSection />
        </section>
        
        <section id="oled">
          <OLEDDisplaySection />
        </section>
        
        <section id="animation">
          <AnimationSection />
        </section>
        
        <section id="games">
          <GamesSection />
        </section>

        <section id="hardware">
          <HardwareDriversSection />
        </section>

        <section id="reproduction">
          <ReproductionGuideSection />
        </section>
        
        <section id="code">
          <CodeSection />
        </section>
        
        <FooterSection />
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
