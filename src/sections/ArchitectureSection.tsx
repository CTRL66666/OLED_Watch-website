import { useState } from 'react';
import { Layers, Cpu, Monitor, Database, Gamepad2, ChevronRight, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const architectureLayers = [
  {
    id: 'app',
    name: '应用层',
    icon: Gamepad2,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-gradient-to-r from-pink-500 to-rose-500',
    modules: ['时钟应用', '秒表应用', '表情应用', '贪吃蛇', 'FlappyBird', '飞机大战', '恐龙跑酷', '3D立方体', '系统设置'],
    description: '提供丰富的用户应用和游戏功能，统一的应用框架设计',
  },
  {
    id: 'middleware',
    name: '中间件层',
    icon: Layers,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    modules: ['EventBus事件总线', 'EventQueue消息队列', 'MenuTree菜单树', 'Animation动画引擎', 'SelectorPhysics物理选择框'],
    description: '实现模块间通信和核心功能支持，松耦合设计',
  },
  {
    id: 'driver',
    name: '驱动层',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    modules: ['OLED显示驱动', 'HardI2C硬件I2C', 'MyTimer定时器', 'MyRTC实时时钟', 'Key按键驱动', 'Encoder编码器'],
    description: '硬件抽象和底层驱动实现，封装硬件操作',
  },
  {
    id: 'hal',
    name: '硬件抽象层',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    modules: ['GPIO', 'TIM定时器', 'I2C', 'RTC', 'DMA', 'EXTI外部中断', 'NVIC中断管理'],
    description: 'STM32标准外设库封装，提供统一接口',
  },
  {
    id: 'hardware',
    name: '硬件层',
    icon: Monitor,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-gradient-to-r from-orange-500 to-amber-500',
    modules: ['STM32F103C8T6', '0.96寸OLED', '旋转编码器', '按键', 'LED'],
    description: '物理硬件设备，系统运行的基础',
  },
];

// 模块关系数据（用于后续扩展）
// const moduleRelations = [
//   { from: 'main.c', to: 'EventBus', desc: '事件分发' },
//   { from: 'main.c', to: 'MenuTree', desc: '菜单管理' },
//   { from: 'main.c', to: 'OLED', desc: '显示控制' },
//   { from: 'EventBus', to: '应用模块', desc: '事件通知' },
//   { from: 'MenuTree', to: 'Animation', desc: '动画效果' },
//   { from: '应用模块', to: 'OLED', desc: '显示输出' },
//   { from: 'OLED', to: 'HardI2C', desc: 'I2C通信' },
//   { from: 'HardI2C', to: 'DMA', desc: 'DMA传输' },
// ];

export function ArchitectureSection() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'layers' | 'relations'>('layers');

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0f3460]/10 to-[#533483]/10 mb-4">
            <Layers className="w-4 h-4 text-[#0f3460]" />
            <span className="text-[#0f3460] text-sm font-medium">系统架构</span>
          </div>
          <h2 className="section-title">分层架构设计</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            项目采用清晰的分层架构，从硬件到应用层层递进，各层职责明确，便于开发和维护
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('layers')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'layers'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              架构层次
            </button>
            <button
              onClick={() => setActiveTab('relations')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'relations'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              模块关系
            </button>
          </div>
        </div>

        {activeTab === 'layers' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Layer list */}
            <div className="lg:col-span-1 space-y-3">
              {architectureLayers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedLayer === layer.id
                        ? layer.bgColor + ' text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedLayer === layer.id ? 'bg-white/20' : layer.bgColor
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className={`font-medium ${selectedLayer === layer.id ? 'text-white' : 'text-gray-900'}`}>
                            {layer.name}
                          </div>
                          <div className={`text-sm ${selectedLayer === layer.id ? 'text-white/70' : 'text-gray-500'}`}>
                            {layer.modules.length} 个模块
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${
                        selectedLayer === layer.id ? 'rotate-90 text-white' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Layer detail */}
            <div className="lg:col-span-2">
              {selectedLayer ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {(() => {
                        const layer = architectureLayers.find(l => l.id === selectedLayer);
                        const Icon = layer?.icon || Layers;
                        return <Icon className="w-6 h-6 text-[#0f3460]" />;
                      })()}
                      <span>{architectureLayers.find(l => l.id === selectedLayer)?.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">
                      {architectureLayers.find(l => l.id === selectedLayer)?.description}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {architectureLayers.find(l => l.id === selectedLayer)?.modules.map((module, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-100"
                        >
                          {module}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-center p-8">
                    <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">点击左侧层级查看详细信息</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">模块依赖关系</h3>
                <p className="text-gray-600">展示核心模块之间的调用关系和数据流向</p>
              </div>
              
              {/* Module relation diagram */}
              <div className="relative bg-gray-50 rounded-xl p-6 overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Row 1: Main */}
                  <div className="flex justify-center mb-8">
                    <div className="arch-diagram-node bg-gradient-to-r from-[#1a1a2e] to-[#0f3460]">
                      main.c
                    </div>
                  </div>
                  
                  {/* Arrows from main */}
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-16">
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                        <span className="text-xs text-gray-500 mt-1">事件分发</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                        <span className="text-xs text-gray-500 mt-1">菜单管理</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                        <span className="text-xs text-gray-500 mt-1">显示控制</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 2: Core Modules */}
                  <div className="flex justify-center space-x-8 mb-8">
                    <div className="arch-diagram-node bg-gradient-to-r from-purple-500 to-indigo-500">
                      EventBus
                    </div>
                    <div className="arch-diagram-node bg-gradient-to-r from-purple-500 to-indigo-500">
                      MenuTree
                    </div>
                    <div className="arch-diagram-node bg-gradient-to-r from-blue-500 to-cyan-500">
                      OLED
                    </div>
                  </div>
                  
                  {/* Arrows */}
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-8">
                      <div className="flex flex-col items-center ml-[-80px]">
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                        <span className="text-xs text-gray-500 mt-1">事件通知</span>
                      </div>
                      <div className="flex flex-col items-center ml-[80px]">
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                        <span className="text-xs text-gray-500 mt-1">显示输出</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 3: Sub-modules */}
                  <div className="flex justify-center space-x-8 mb-8">
                    <div className="arch-diagram-node bg-gradient-to-r from-pink-500 to-rose-500">
                      应用模块
                    </div>
                    <div className="arch-diagram-node bg-gradient-to-r from-purple-500 to-indigo-500">
                      Animation
                    </div>
                    <div className="arch-diagram-node bg-gradient-to-r from-blue-500 to-cyan-500">
                      HardI2C
                    </div>
                  </div>
                  
                  {/* Final arrow */}
                  <div className="flex justify-center mb-4">
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                      <span className="text-xs text-gray-500 mt-1">DMA传输</span>
                    </div>
                  </div>
                  
                  {/* DMA */}
                  <div className="flex justify-center">
                    <div className="arch-diagram-node bg-gradient-to-r from-emerald-500 to-teal-500">
                      DMA
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#0f3460]">28</div>
                  <div className="text-sm text-gray-500">源码文件</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#533483]">15</div>
                  <div className="text-sm text-gray-500">核心模块</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#e94560]">5</div>
                  <div className="text-sm text-gray-500">架构层次</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
