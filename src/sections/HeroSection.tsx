import { useEffect, useRef } from 'react';
import { ArrowDown, Cpu, Layers, Zap, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 234, 212, ${p.opacity})`;
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const scrollToArchitecture = () => {
    document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 circuit-bg opacity-30" />

      {/* Glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#5eead4]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#8b5cf6]/15 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up">
          <Cpu className="w-4 h-4 text-[#5eead4]" />
          <span className="text-white/80 text-sm font-medium">STM32F103 嵌入式项目</span>
        </div>

        {/* Main title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          智能手表项目
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] via-[#8b5cf6] to-[#ec4899]">
            深度技术剖析
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          从架构设计到完美复现的完整指南，深入理解事件驱动架构、多级菜单系统、动画引擎等核心技术
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: Layers, label: '分层架构', desc: '清晰的模块设计' },
            { icon: Zap, label: '事件驱动', desc: '松耦合通信' },
            { icon: Monitor, label: 'OLED显示', desc: '双缓冲技术' },
            { icon: Cpu, label: '多款游戏', desc: '丰富的应用' },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group"
              >
                <Icon className="w-8 h-8 text-[#5eead4] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-white font-medium text-sm">{feature.label}</div>
                <div className="text-white/50 text-xs">{feature.desc}</div>
              </div>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={scrollToArchitecture}
            className="bg-gradient-to-r from-[#0f3460] to-[#533483] hover:from-[#1a4a7a] hover:to-[#6b4a9c] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            开始探索
            <ArrowDown className="w-5 h-5 ml-2" />
          </Button>
          <a
            href="/mnt/okcomputer/output/STM32智能手表项目深度技术剖析.docx"
            download
            className="px-8 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
          >
            下载完整文档
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {[
            { value: '10万+', label: '字技术剖析' },
            { value: '28', label: '个源码文件' },
            { value: '17', label: '个章节' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#5eead4]">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-white/50" />
      </div>
    </div>
  );
}
