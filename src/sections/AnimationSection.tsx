import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const codeExample = `// 线性插值动画
void Animation_Start(u8 Direction, 
    AnimationController* Controller, u8 Frame) {
    // 计算每帧的步长
    for (int i = 0; i < 5; i++) {
        Controller[i].stepY = 
            Controller[i].deltaY / Frame;
        Controller[i].stepX = 
            Controller[i].deltaX / Frame;
    }
    
    // 执行动画帧
    for(int j = 1; j < Frame; j++) {
        // 更新位置和大小
        for(QueueNode *p = queue->head; 
            p != NULL; p = p->next) {
            Controller[i].currentY += 
                Controller[i].stepY;
            p->block[0] = 
                Controller[i].currentY >> 8;
        }
        OLED_Update();
    }
}

// 弹簧阻尼动画
void ElementOffset_Update(ElementOffset *sel) {
    // 计算弹簧力
    float spring = (sel->target_output - 
        sel->current_input) * sel->stiffness;
    
    // 计算阻尼力
    float damp = sel->velocity * sel->damping;
    
    // 更新速度
    sel->velocity += (spring - damp) * dt;
    
    // 更新位置
    sel->current_input += sel->velocity * dt;
}`;

export function AnimationSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationType, setAnimationType] = useState<'linear' | 'spring'>('linear');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i <= canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw animation curve
      ctx.strokeStyle = animationType === 'linear' ? '#3b82f6' : '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();

      if (animationType === 'linear') {
        // Linear interpolation
        for (let x = 0; x <= canvas.width * progress; x++) {
          const t = x / canvas.width;
          const y = canvas.height - (t * canvas.height * 0.8 + canvas.height * 0.1);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Spring damper
        for (let x = 0; x <= canvas.width * progress; x++) {
          const t = x / canvas.width;
          const damping = 0.5;
          const frequency = 3;
          const decay = Math.exp(-damping * t * frequency);
          const oscillation = Math.cos(t * frequency * Math.PI * 2);
          const value = 1 - decay * oscillation * (1 - t);
          const y = canvas.height - (value * canvas.height * 0.8 + canvas.height * 0.1);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw moving object
      const t = progress;
      let x = t * canvas.width * 0.8 + canvas.width * 0.1;
      let y;
      
      if (animationType === 'linear') {
        y = canvas.height - (t * canvas.height * 0.8 + canvas.height * 0.1);
      } else {
        const damping = 0.5;
        const frequency = 3;
        const decay = Math.exp(-damping * t * frequency);
        const oscillation = Math.cos(t * frequency * Math.PI * 2);
        const value = 1 - decay * oscillation * (1 - t);
        y = canvas.height - (value * canvas.height * 0.8 + canvas.height * 0.1);
      }

      // Draw object
      ctx.fillStyle = animationType === 'linear' ? '#3b82f6' : '#8b5cf6';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(x, canvas.height - 10, 15 * (1 - t * 0.3), 5, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();
  }, [progress, animationType]);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 0.01;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 mb-4">
            <Play className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm font-medium">动画系统</span>
          </div>
          <h2 className="section-title">流畅动画引擎</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            支持线性插值动画和弹簧阻尼物理动画，定点数运算避免浮点
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Animation Demo */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600">
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>动画演示</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Animation Type Selector */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => { setAnimationType('linear'); reset(); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    animationType === 'linear'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  线性插值
                </button>
                <button
                  onClick={() => { setAnimationType('spring'); reset(); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    animationType === 'spring'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  弹簧阻尼
                </button>
              </div>

              {/* Animation Canvas */}
              <div className="relative mb-6 bg-gray-50 rounded-xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`${
                    animationType === 'linear' 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      animationType === 'linear' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="text-center text-sm text-gray-500 mt-1">
                  {Math.round(progress * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animation Types */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>线性插值动画</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  等速运动，从起始值均匀变化到结束值，适用于菜单滚动、页面切换等场景
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>匀速运动</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>计算简单</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>弹簧阻尼动画</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  模拟物理弹簧的运动特性，具有惯性和回弹效果，适用于选择框移动、表情动画等场景
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <div className="font-medium text-purple-700">stiffness</div>
                    <div className="text-purple-500">刚度系数</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <div className="font-medium text-purple-700">damping</div>
                    <div className="text-purple-500">阻尼系数</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <div className="font-medium text-purple-700">velocity</div>
                    <div className="text-purple-500">当前速度</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="code-block text-xs">
              <pre>{codeExample}</pre>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '定点数运算', desc: '避免浮点，提高性能', icon: '🔢' },
            { title: '可配置参数', desc: '灵活调整动画效果', icon: '⚙️' },
            { title: '物理模拟', desc: '自然的运动效果', icon: '🎯' },
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
