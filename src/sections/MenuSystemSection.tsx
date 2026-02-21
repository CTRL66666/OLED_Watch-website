import { useState } from 'react';
import { Monitor, ChevronLeft, ChevronRight, Layers, Link2, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const menuItems = [
  { id: 'A', name: '时钟', icon: '🕐', color: 'from-blue-500 to-cyan-500' },
  { id: 'B', name: '秒表', icon: '⏱️', color: 'from-green-500 to-emerald-500' },
  { id: 'C', name: '表情', icon: '😊', color: 'from-yellow-500 to-orange-500' },
  { id: 'D', name: '游戏', icon: '🎮', color: 'from-purple-500 to-pink-500' },
  { id: 'E', name: '设置', icon: '⚙️', color: 'from-gray-500 to-slate-500' },
];

const codeExample = `// 链表节点结构体
typedef struct LinkNode {
    uint8_t id;                    // 节点标识
    const uint8_t *Image;          // 图标图像
    const char *Str;               // 文字描述
    struct LinkNode *next;         // 下一个节点
    struct LinkNode *last;         // 上一个节点
    struct Link *ChildMenuLink;    // 子菜单指针
    void (*Action)(void);          // 动作函数
} LinkNode;

// 队列节点结构体
typedef struct QueueNode {
    uint8_t sequence;              // 节点序号
    uint8_t block[4];              // 显示区域 [行,列,高,宽]
    LinkNode *element;             // 指向链表节点
    struct QueueNode *next;        // 下一个队列节点
} QueueNode;

// 左滚动：每个队列节点指向链表的上一个节点
void Left_Shift(void) {
    for(QueueNode *p = pCurrentQueue->head; 
        p != NULL; p = p->next) {
        p->element = p->element->next;  // 向后移动
    }
    ShowMenu(1);
}`;

export function MenuSystemSection() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const scrollLeft = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  const scrollRight = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % menuItems.length);
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  // Get visible items
  const getVisibleItems = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + menuItems.length) % menuItems.length;
      items.push({ ...menuItems[index], offset: i });
    }
    return items;
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 mb-4">
            <Monitor className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 text-sm font-medium">菜单系统</span>
          </div>
          <h2 className="section-title">双数据结构菜单</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            链表存储菜单项内容，队列管理显示位置，实现流畅的滚动动画效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Menu Demo */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600">
              <CardTitle className="text-white flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>菜单演示</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* OLED Screen Simulation */}
              <div className="relative bg-black rounded-xl p-4 mb-6 overflow-hidden">
                <div className="aspect-[2/1] relative flex items-center justify-center">
                  {/* Menu items */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {getVisibleItems().map((item, idx) => {
                      const isCenter = item.offset === 0;
                      const baseX = 50 + item.offset * 25;
                      const scale = isCenter ? 1.2 : 0.8;
                      const opacity = Math.abs(item.offset) > 1 ? 0.3 : 1;
                      
                      return (
                        <div
                          key={`${item.id}-${idx}`}
                          className={`absolute transition-all duration-300 ${
                            isAnimating && animationDirection === 'left' 
                              ? 'translate-x-[-25%]' 
                              : isAnimating && animationDirection === 'right'
                                ? 'translate-x-[25%]'
                                : ''
                          }`}
                          style={{
                            left: `${baseX}%`,
                            transform: `translateX(-50%) scale(${scale})`,
                            opacity,
                            zIndex: isCenter ? 10 : 5 - Math.abs(item.offset),
                          }}
                        >
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                            <span className="text-2xl">{item.icon}</span>
                          </div>
                          {isCenter && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-xs whitespace-nowrap">
                              {item.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Selection indicator */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={scrollLeft}
                  disabled={isAnimating}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-sm text-gray-500">
                  当前: {menuItems[currentIndex].name}
                </div>
                <button
                  onClick={scrollRight}
                  disabled={isAnimating}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Data Structure Explanation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  <span>链表 (Link)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  存储菜单项的实际内容，形成环形链表结构，支持循环导航
                </p>
                <div className="flex items-center justify-center space-x-2">
                  {menuItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {item.id}
                      </div>
                      {idx < menuItems.length - 1 && (
                        <div className="w-4 h-0.5 bg-gray-300" />
                      )}
                    </div>
                  ))}
                  <div className="w-4 h-0.5 bg-gray-300" />
                  <div className="text-gray-400 text-xs">循环</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <List className="w-5 h-5 text-blue-600" />
                  <span>队列 (Queue)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  管理菜单项在屏幕上的显示位置和大小，5个节点对应5个显示槽位
                </p>
                <div className="flex items-center justify-center space-x-1">
                  {['隐藏', '左侧', '选中', '右侧', '隐藏'].map((pos, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg text-xs text-center ${
                        idx === 2
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pos}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="code-block text-xs">
              <pre>{codeExample}</pre>
            </div>
          </div>
        </div>

        {/* Design Principles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '数据与显示分离', desc: '链表存储内容，队列管理位置', icon: Layers },
            { title: '环形链表', desc: '支持循环导航，无边界限制', icon: Link2 },
            { title: '平滑动画', desc: '只需移动指针，无需移动数据', icon: Monitor },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors">
                <Icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="font-medium text-gray-900 mb-1">{feature.title}</div>
                <div className="text-sm text-gray-500">{feature.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
