import { useState } from 'react';
import { Menu, X, Cpu, Layers, Zap, Monitor, Play, Gamepad2, Code2, Settings, BookOpen } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isScrolled: boolean;
}

const navItems = [
  { id: 'hero', label: '首页', icon: Cpu },
  { id: 'architecture', label: '架构', icon: Layers },
  { id: 'eventbus', label: '事件总线', icon: Zap },
  { id: 'menu', label: '菜单系统', icon: Monitor },
  { id: 'oled', label: 'OLED显示', icon: Monitor },
  { id: 'animation', label: '动画', icon: Play },
  { id: 'games', label: '游戏', icon: Gamepad2 },
  { id: 'hardware', label: '硬件驱动', icon: Settings },
  { id: 'reproduction', label: '复现指南', icon: BookOpen },
  { id: 'code', label: '代码', icon: Code2 },
];

export function Navigation({ activeSection, onNavigate, isScrolled }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0f3460] to-[#533483] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              STM32智能手表
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-[#0f3460] to-[#533483] text-white'
                      : isScrolled
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-xl shadow-xl mt-2 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-[#0f3460] to-[#533483] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
