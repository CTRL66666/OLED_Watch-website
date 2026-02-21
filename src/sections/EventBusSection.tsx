import { useState } from 'react';
import { Zap, Send, Users, Bell, Code, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const eventTypes = [
  { id: 'EV_NONE', label: '无事件', color: 'gray' },
  { id: 'EV_ENC_CW', label: '编码器顺时针', color: 'blue' },
  { id: 'EV_ENC_CCW', label: '编码器逆时针', color: 'blue' },
  { id: 'EV_KEY_OK_CLICK', label: 'OK键单击', color: 'green' },
  { id: 'EV_KEY_OK_LONGPRESS', label: 'OK键长按', color: 'green' },
  { id: 'EV_KEY_BACK_CLICK', label: 'BACK键单击', color: 'orange' },
  { id: 'EV_KEY_BACK_LONGPRESS', label: 'BACK键长按', color: 'orange' },
  { id: 'EV_TIMER_TASK', label: '定时器任务', color: 'purple' },
  { id: 'EV_TIMER_OLED_UPDATE', label: 'OLED刷新', color: 'purple' },
];

const codeExample = `// 事件总线核心实现
#define MAX_SUBSCRIBERS 4

typedef enum {
    EV_NONE = 0,
    EV_ENC_CW,           // 编码器顺时针
    EV_ENC_CCW,          // 编码器逆时针
    EV_KEY_OK_CLICK,     // OK键单击
    EV_KEY_BACK_CLICK,   // BACK键单击
    EV_TIMER_TASK,       // 定时器任务
    EV_MAX
} EventType;

// 订阅事件
void EventBus_Subscribe(EventType ev, void (*handler)(void))
{
    if (ev < EV_MAX && handler_count[ev] < MAX_SUBSCRIBERS)
    {
        handlers[ev][handler_count[ev]].Handler = handler;
        handlers[ev][handler_count[ev]].type = HANDLER_VOID;
        handler_count[ev]++;
    }
}

// 发布事件
void EventBus_Publish(EventType ev)
{
    for (int i = 0; i < handler_count[ev]; i++)
    {
        if (handlers[ev][i].type == HANDLER_VOID)
        {
            (handlers[ev][i].Handler)();
        }
        else
        {
            ((void (*)(int))handlers[ev][i].Handler)
                (handlers[ev][i].param);
        }
    }
}`;

export function EventBusSection() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const simulateEvent = (eventId: string) => {
    setIsAnimating(true);
    setCurrentEvent(eventId);
    
    // Simulate subscribers
    const eventSubscribers = ['MenuTree', 'Clock', 'Game', 'Animation'];
    setSubscribers(eventSubscribers);
    
    // Add log
    const eventLabel = eventTypes.find(e => e.id === eventId)?.label || eventId;
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] 事件发布: ${eventLabel}`, ...prev].slice(0, 5));
    
    setTimeout(() => {
      setIsAnimating(false);
      setCurrentEvent(null);
      setSubscribers([]);
    }, 2000);
  };

  return (
    <div className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 mb-4">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700 text-sm font-medium">事件驱动架构</span>
          </div>
          <h2 className="section-title">EventBus 事件总线</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            采用观察者模式实现模块间松耦合通信，支持带参数的事件处理函数
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive demo */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#0f3460] to-[#533483]">
              <CardTitle className="text-white flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>交互演示</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Event Bus Visual */}
              <div className="relative h-80 mb-6">
                {/* Event Bus Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#0f3460] to-[#533483] flex items-center justify-center transition-all duration-300 ${
                    isAnimating ? 'scale-110 shadow-lg shadow-[#0f3460]/50' : ''
                  }`}>
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center mt-2 text-sm font-medium text-gray-700">EventBus</div>
                </div>

                {/* Event Types (Left) */}
                <div className="absolute left-0 top-0 bottom-0 w-32 flex flex-col justify-center space-y-2">
                  {eventTypes.slice(1, 5).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => simulateEvent(event.id)}
                      disabled={isAnimating}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        currentEvent === event.id
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {event.label}
                    </button>
                  ))}
                </div>

                {/* Subscribers (Right) */}
                <div className="absolute right-0 top-0 bottom-0 w-32 flex flex-col justify-center space-y-2">
                  {['MenuTree', 'Clock', 'Game', 'Animation'].map((sub, idx) => (
                    <div
                      key={sub}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all duration-500 ${
                        subscribers.includes(sub) && isAnimating
                          ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white scale-105'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      style={{ transitionDelay: `${idx * 100}ms` }}
                    >
                      {sub}
                    </div>
                  ))}
                </div>

                {/* Connection lines */}
                {isAnimating && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1="128"
                      y1="50%"
                      x2="35%"
                      y2="50%"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                    <line
                      x1="65%"
                      y1="50%"
                      x2="calc(100% - 128px)"
                      y2="50%"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                )}
              </div>

              {/* Event Log */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-2">事件日志</div>
                <div className="space-y-1">
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <div key={idx} className="text-xs text-green-400 font-mono">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">点击左侧事件按钮开始演示...</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-[#0f3460]" />
                <span>核心代码</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="code-block text-xs overflow-x-auto">
                <pre>{codeExample}</pre>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">发布-订阅模式</div>
                    <div className="text-sm text-gray-500">模块间通过事件间接通信，无需知道对方存在</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">多订阅者支持</div>
                    <div className="text-sm text-gray-500">一个事件可被多个模块订阅，实现广播效果</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">带参数事件</div>
                    <div className="text-sm text-gray-500">支持传递参数，增强事件表达能力</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '松耦合设计', desc: '发布者和订阅者无需知道对方存在', icon: '🔗' },
            { title: '可扩展性', desc: '新增功能只需订阅相关事件', icon: '📈' },
            { title: '可测试性', desc: '可单独测试事件处理逻辑', icon: '🧪' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <div className="font-medium text-gray-900 mb-1">{feature.title}</div>
              <div className="text-sm text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
