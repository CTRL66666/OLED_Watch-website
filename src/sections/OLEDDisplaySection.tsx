import { useEffect, useRef } from 'react';
import { Monitor, Cpu, Zap, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const codeExample = `// OLED.c - 双缓冲显示驱动
#define BUF_CNT 2
uint8_t OLED_BUF[BUF_CNT][8][128];
volatile uint8_t buf_idx = 0;

#define DRAW_BUF OLED_BUF[buf_idx]
#define SEND_BUF OLED_BUF[buf_idx ^ 1]

// 双缓冲更新
void OLED_Update(void)
{
    // 等待上一次DMA传输完成
    while (!dma_done);
    
    // 交换缓冲区
    buf_idx ^= 1;
    
    // 启动DMA传输
    DMA1_Channel6->CMAR = (uint32_t)SEND_BUF;
    DMA1_Channel6->CNDTR = 1024;
    dma_done = 0;
    
    // 配置DMA并启动传输
    DMA_Cmd(DMA1_Channel6, ENABLE);
    I2C_DMACmd(I2C1, ENABLE);
    
    // 复制当前帧到绘制缓冲区
    memcpy(DRAW_BUF, SEND_BUF, sizeof(DRAW_BUF));
}`;

export function OLEDDisplaySection() {
  const singleCanvasRef = useRef<HTMLCanvasElement>(null);
  const doubleCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // 单缓冲演示 - 会有闪烁
  useEffect(() => {
    const canvas = singleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      
      // 清空画布（模拟清屏）
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制网格背景
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // 绘制移动的对象（模拟绘制过程）
      const x = (frame * 2) % (canvas.width - 20);
      
      // 在单缓冲模式下，可以看到绘制过程（闪烁）
      ctx.fillStyle = '#0f3460';
      ctx.fillRect(x, 20, 20, 20);
      
      // 绘制文字
      ctx.fillStyle = '#5eead4';
      ctx.font = '12px monospace';
      ctx.fillText('Single Buffer', 5, 55);
      
      // 闪烁指示器
      if (frame % 10 < 5) {
        ctx.fillStyle = '#ff4444';
        ctx.fillText('⚠ FLICKER', 70, 55);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 双缓冲演示 - 无闪烁
  useEffect(() => {
    const canvas = doubleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 创建离屏缓冲区
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      
      // 在离屏缓冲区绘制
      offCtx.fillStyle = '#000';
      offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      
      // 绘制网格背景
      offCtx.strokeStyle = '#222';
      offCtx.lineWidth = 1;
      for (let x = 0; x <= offscreen.width; x += 8) {
        offCtx.beginPath();
        offCtx.moveTo(x, 0);
        offCtx.lineTo(x, offscreen.height);
        offCtx.stroke();
      }
      for (let y = 0; y <= offscreen.height; y += 8) {
        offCtx.beginPath();
        offCtx.moveTo(0, y);
        offCtx.lineTo(offscreen.width, y);
        offCtx.stroke();
      }
      
      // 绘制移动的对象
      const x = (frame * 2) % (offscreen.width - 20);
      
      offCtx.fillStyle = '#0f3460';
      offCtx.fillRect(x, 20, 20, 20);
      
      // 绘制文字
      offCtx.fillStyle = '#5eead4';
      offCtx.font = '12px monospace';
      offCtx.fillText('Double Buffer', 5, 55);
      
      // 平滑指示器
      offCtx.fillStyle = '#44ff44';
      offCtx.fillText('✓ SMOOTH', 75, 55);
      
      // 一次性复制到显示缓冲区
      ctx.drawImage(offscreen, 0, 0);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 mb-4">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">OLED显示</span>
          </div>
          <h2 className="section-title">双缓冲显示驱动</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            采用硬件I2C+DMA通信，双缓冲机制消除闪烁，实现流畅的显示效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buffer Comparison */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <CardTitle className="text-white flex items-center space-x-2">
                <Layers className="w-5 h-5" />
                <span>缓冲机制对比</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Single Buffer */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2 text-center">单缓冲</div>
                  <div className="relative bg-black rounded-lg border-2 border-gray-700 overflow-hidden" style={{ aspectRatio: '2/1' }}>
                    <canvas
                      ref={singleCanvasRef}
                      width={200}
                      height={100}
                      className="w-full h-full"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="text-xs text-red-500 text-center mt-2 font-medium">
                    ⚠ 可见闪烁
                  </div>
                </div>

                {/* Double Buffer */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2 text-center">双缓冲</div>
                  <div className="relative bg-black rounded-lg border-2 border-gray-700 overflow-hidden" style={{ aspectRatio: '2/1' }}>
                    <canvas
                      ref={doubleCanvasRef}
                      width={200}
                      height={100}
                      className="w-full h-full"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="text-xs text-green-500 text-center mt-2 font-medium">
                    ✓ 流畅无闪烁
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">双缓冲原理</div>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>DRAW_BUF：绘制缓冲区，所有绘制操作在此进行</li>
                  <li>SEND_BUF：发送缓冲区，通过DMA发送给OLED</li>
                  <li>绘制完成后交换两个缓冲区</li>
                  <li>用户始终看到完整的帧，无闪烁</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>显存组织</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-1 mb-4">
                  {Array.from({ length: 8 }).map((_, page) => (
                    <div key={page} className="text-center">
                      <div className="text-xs text-gray-400 mb-1">页{page}</div>
                      <div className="w-full h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs text-blue-600">128B</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  SSD1306显存：128×64像素 = 1024字节 = 1KB，按8页组织
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>DMA传输性能</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">I2C时钟频率</span>
                    <span className="text-sm font-medium text-gray-900">1.3 MHz</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">每字节传输时间</span>
                    <span className="text-sm font-medium text-gray-900">~6.15 μs</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">全屏刷新时间</span>
                    <span className="text-sm font-medium text-gray-900">~6.3 ms</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">理论帧率</span>
                    <span className="text-sm font-bold text-green-600">~158 FPS</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="code-block">
              <pre>{codeExample}</pre>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: '双缓冲', desc: '消除显示闪烁', icon: Layers },
            { title: 'DMA传输', desc: 'CPU零占用', icon: Zap },
            { title: '硬件I2C', desc: '高速通信', icon: Cpu },
            { title: '局部刷新', desc: '提升效率', icon: Monitor },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow">
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
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
