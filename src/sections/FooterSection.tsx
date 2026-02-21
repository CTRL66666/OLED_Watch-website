import { Cpu, Github, BookOpen, Mail, Heart } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5eead4] to-[#8b5cf6] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">STM32智能手表</span>
            </div>
            <p className="text-white/70 mb-4 max-w-md">
              从架构设计到完美复现的完整指南，深入理解嵌入式开发的核心技术
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">快速链接</h3>
            <ul className="space-y-2">
              {[
                { label: '系统架构', href: '#architecture' },
                { label: '事件总线', href: '#eventbus' },
                { label: '菜单系统', href: '#menu' },
                { label: 'OLED显示', href: '#oled' },
                { label: '动画系统', href: '#animation' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4">资源下载</h3>
            <ul className="space-y-2">
              {[
                { label: '完整文档 (DOCX)', href: '#' },
                { label: '演示文稿 (PPT)', href: '#' },
                { label: '源码下载', href: '#' },
                { label: '原理图', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white/50 text-sm mb-4 md:mb-0">
              © 2025 STM32智能手表项目. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-white/50 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>by Embedded Learning Guide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
