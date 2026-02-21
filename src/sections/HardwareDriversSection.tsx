import { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Clock, Database, Activity, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const driverCategories = [
  {
    id: 'i2c',
    name: '硬件I2C驱动',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    description: '基于STM32硬件I2C外设，配合DMA实现高效数据传输',
    features: ['硬件I2C外设', 'DMA传输', '中断处理', '错误检测'],
  },
  {
    id: 'timer',
    name: '定时器驱动',
    icon: Clock,
    color: 'from-purple-500 to-pink-500',
    description: '多定时器管理，支持周期性任务和延时操作',
    features: ['周期任务', '延时操作', '多定时器', '中断回调'],
  },
  {
    id: 'rtc',
    name: '实时时钟驱动',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    description: 'STM32内部RTC，提供精确的时间和日期功能',
    features: ['时间保持', '日期计算', '闹钟功能', '低功耗'],
  },
  {
    id: 'gpio',
    name: 'GPIO驱动',
    icon: Database,
    color: 'from-orange-500 to-amber-500',
    description: '通用输入输出端口控制，按键和LED驱动',
    features: ['输入检测', '输出控制', '中断触发', '消抖处理'],
  },
];

const i2cCode = `// HardI2C.c - 硬件I2C驱动实现
#include "HardI2C.h"

// I2C初始化 - 400KHz快速模式
void HardI2C_Init(void)
{
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);
    
    // PB6-SCL, PB7-SDA
    GPIO_InitTypeDef GPIO_InitStruct;
    GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_OD;
    GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOB, &GPIO_InitStruct);
    
    I2C_InitTypeDef I2C_InitStruct;
    I2C_InitStruct.I2C_ClockSpeed = 400000;  // 400KHz
    I2C_InitStruct.I2C_Mode = I2C_Mode_I2C;
    I2C_InitStruct.I2C_DutyCycle = I2C_DutyCycle_2;
    I2C_InitStruct.I2C_Ack = I2C_Ack_Enable;
    I2C_InitStruct.I2C_AcknowledgedAddress = 
        I2C_AcknowledgedAddress_7bit;
    I2C_Init(I2C1, &I2C_InitStruct);
    
    I2C_Cmd(I2C1, ENABLE);
}

// DMA发送数据 - 非阻塞高效传输
void HardI2C_DMA_Send(uint8_t addr, uint8_t *data, uint16_t len)
{
    // 等待总线空闲
    while (I2C_GetFlagStatus(I2C1, I2C_FLAG_BUSY));
    
    // 发送起始信号
    I2C_GenerateSTART(I2C1, ENABLE);
    while (!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
    
    // 发送设备地址
    I2C_Send7bitAddress(I2C1, addr, I2C_Direction_Transmitter);
    while (!I2C_CheckEvent(I2C1, 
        I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
    
    // 配置DMA传输
    DMA_InitTypeDef DMA_InitStruct;
    DMA_InitStruct.DMA_PeripheralBaseAddr = (uint32_t)&I2C1->DR;
    DMA_InitStruct.DMA_MemoryBaseAddr = (uint32_t)data;
    DMA_InitStruct.DMA_DIR = DMA_DIR_PeripheralDST;
    DMA_InitStruct.DMA_BufferSize = len;
    DMA_InitStruct.DMA_PeripheralInc = DMA_PeripheralInc_Disable;
    DMA_InitStruct.DMA_MemoryInc = DMA_MemoryInc_Enable;
    DMA_InitStruct.DMA_PeripheralDataSize = DMA_PeripheralDataSize_Byte;
    DMA_InitStruct.DMA_MemoryDataSize = DMA_MemoryDataSize_Byte;
    DMA_InitStruct.DMA_Mode = DMA_Mode_Normal;
    DMA_InitStruct.DMA_Priority = DMA_Priority_High;
    DMA_InitStruct.DMA_M2M = DMA_M2M_Disable;
    DMA_Init(DMA1_Channel6, &DMA_InitStruct);
    
    // 使能DMA请求
    I2C_DMACmd(I2C1, ENABLE);
    DMA_Cmd(DMA1_Channel6, ENABLE);
}`;

const timerCode = `// MyTimer.c - 定时器管理实现
#include "MyTimer.h"

#define MAX_TIMERS 8

typedef struct {
    uint32_t interval;      // 定时周期(ms)
    uint32_t lastTick;      // 上次触发时间
    uint8_t enabled;        // 使能标志
    TimerCallback callback; // 回调函数
} Timer;

static Timer timers[MAX_TIMERS];
static volatile uint32_t sysTick = 0;

// SysTick中断 - 1ms中断一次
void SysTick_Handler(void)
{
    sysTick++;
    
    // 检查所有定时器
    for (int i = 0; i < MAX_TIMERS; i++) {
        if (timers[i].enabled && 
            (sysTick - timers[i].lastTick) >= timers[i].interval) {
            timers[i].lastTick = sysTick;
            if (timers[i].callback) {
                timers[i].callback();
            }
        }
    }
}

// 创建定时器
int Timer_Create(uint32_t interval, TimerCallback callback)
{
    for (int i = 0; i < MAX_TIMERS; i++) {
        if (!timers[i].enabled) {
            timers[i].interval = interval;
            timers[i].lastTick = sysTick;
            timers[i].callback = callback;
            timers[i].enabled = 1;
            return i;
        }
    }
    return -1; // 无可用定时器
}

// 启动定时器
void Timer_Start(int timerId)
{
    if (timerId >= 0 && timerId < MAX_TIMERS) {
        timers[timerId].enabled = 1;
        timers[timerId].lastTick = sysTick;
    }
}

// 停止定时器
void Timer_Stop(int timerId)
{
    if (timerId >= 0 && timerId < MAX_TIMERS) {
        timers[timerId].enabled = 0;
    }
}`;

const rtcCode = `// MyRTC.c - 实时时钟实现
#include "MyRTC.h"

// 时间结构体
typedef struct {
    uint16_t year;
    uint8_t month;
    uint8_t day;
    uint8_t hour;
    uint8_t minute;
    uint8_t second;
} DateTime;

static DateTime currentTime = {2025, 1, 1, 0, 0, 0};

// RTC初始化
void MyRTC_Init(void)
{
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR | 
        RCC_APB1Periph_BKP, ENABLE);
    PWR_BackupAccessCmd(ENABLE);
    
    // 检查是否首次配置
    if (BKP_ReadBackupRegister(BKP_DR1) != 0xA5A5) {
        // 首次配置RTC
        RCC_LSEConfig(RCC_LSE_ON);
        while (RCC_GetFlagStatus(RCC_FLAG_LSERDY) == RESET);
        
        RCC_RTCCLKConfig(RCC_RTCCLKSource_LSE);
        RCC_RTCCLKCmd(ENABLE);
        
        RTC_WaitForSynchro();
        RTC_WaitForLastTask();
        
        // 设置分频值 - 1秒中断
        RTC_SetPrescaler(32767);
        RTC_WaitForLastTask();
        
        // 标记已配置
        BKP_WriteBackupRegister(BKP_DR1, 0xA5A5);
    }
    
    // 使能秒中断
    RTC_ITConfig(RTC_IT_SEC, ENABLE);
    NVIC_EnableIRQ(RTC_IRQn);
}

// RTC秒中断处理
void RTC_IRQHandler(void)
{
    if (RTC_GetITStatus(RTC_IT_SEC) != RESET) {
        RTC_ClearITPendingBit(RTC_IT_SEC);
        
        // 更新时间
        currentTime.second++;
        if (currentTime.second >= 60) {
            currentTime.second = 0;
            currentTime.minute++;
            if (currentTime.minute >= 60) {
                currentTime.minute = 0;
                currentTime.hour++;
                if (currentTime.hour >= 24) {
                    currentTime.hour = 0;
                    // 日期更新...
                }
            }
        }
    }
}

// 获取当前时间
void RTC_GetTime(uint8_t *hour, uint8_t *minute, uint8_t *second)
{
    *hour = currentTime.hour;
    *minute = currentTime.minute;
    *second = currentTime.second;
}`;

const gpioCode = `// Key.c - 按键驱动实现
#include "Key.h"

#define KEY_OK_PIN    GPIO_Pin_0
#define KEY_BACK_PIN  GPIO_Pin_1
#define KEY_GPIO      GPIOA

// 按键状态
volatile uint8_t keyOkPressed = 0;
volatile uint8_t keyBackPressed = 0;
volatile uint32_t keyOkPressTime = 0;
volatile uint32_t keyBackPressTime = 0;

// 按键初始化
void Key_Init(void)
{
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_AFIO, ENABLE);
    
    GPIO_InitTypeDef GPIO_InitStruct;
    GPIO_InitStruct.GPIO_Pin = KEY_OK_PIN | KEY_BACK_PIN;
    GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IPU;  // 上拉输入
    GPIO_Init(KEY_GPIO, &GPIO_InitStruct);
    
    // 配置外部中断
    GPIO_EXTILineConfig(GPIO_PortSourceGPIOA, GPIO_PinSource0);
    GPIO_EXTILineConfig(GPIO_PortSourceGPIOA, GPIO_PinSource1);
    
    EXTI_InitTypeDef EXTI_InitStruct;
    EXTI_InitStruct.EXTI_Line = EXTI_Line0 | EXTI_Line1;
    EXTI_InitStruct.EXTI_Mode = EXTI_Mode_Interrupt;
    EXTI_InitStruct.EXTI_Trigger = EXTI_Trigger_Falling;
    EXTI_InitStruct.EXTI_LineCmd = ENABLE;
    EXTI_Init(&EXTI_InitStruct);
    
    NVIC_InitTypeDef NVIC_InitStruct;
    NVIC_InitStruct.NVIC_IRQChannel = EXTI0_IRQn;
    NVIC_InitStruct.NVIC_IRQChannelPreemptionPriority = 2;
    NVIC_InitStruct.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStruct.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStruct);
    
    NVIC_InitStruct.NVIC_IRQChannel = EXTI1_IRQn;
    NVIC_Init(&NVIC_InitStruct);
}

// 按键中断处理
void EXTI0_IRQHandler(void)
{
    if (EXTI_GetITStatus(EXTI_Line0) != RESET) {
        EXTI_ClearITPendingBit(EXTI_Line0);
        
        // 消抖处理
        Delay_ms(10);
        if (GPIO_ReadInputDataBit(KEY_GPIO, KEY_OK_PIN) == 0) {
            keyOkPressed = 1;
            keyOkPressTime = GetSysTick();
            
            // 发布按键事件
            EventBus_Publish(EV_KEY_OK_CLICK);
        }
    }
}

// 检查按键长按
void Key_CheckLongPress(void)
{
    if (keyOkPressed && 
        (GetSysTick() - keyOkPressTime) > 1000) {
        EventBus_Publish(EV_KEY_OK_LONGPRESS);
        keyOkPressed = 0;  // 防止重复触发
    }
}`;

const codeExamples: Record<string, string> = {
  i2c: i2cCode,
  timer: timerCode,
  rtc: rtcCode,
  gpio: gpioCode,
};

export function HardwareDriversSection() {
  const [selectedDriver, setSelectedDriver] = useState('i2c');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // I2C信号演示动画
  useEffect(() => {
    if (selectedDriver !== 'i2c') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animationId: number;

    const draw = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格
      ctx.strokeStyle = '#2d2d44';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 绘制SCL时钟信号
      ctx.strokeStyle = '#5eead4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sclY = canvas.height * 0.3;
      const bitWidth = 30;
      const startX = 20;
      
      for (let i = 0; i < 10; i++) {
        const x = startX + i * bitWidth;
        const isHigh = (Math.floor(frame / 10) + i) % 2 === 0;
        
        if (i === 0) {
          ctx.moveTo(x, isHigh ? sclY - 15 : sclY + 15);
        }
        
        ctx.lineTo(x + bitWidth * 0.2, isHigh ? sclY - 15 : sclY + 15);
        ctx.lineTo(x + bitWidth * 0.2, isHigh ? sclY + 15 : sclY - 15);
        ctx.lineTo(x + bitWidth * 0.8, isHigh ? sclY + 15 : sclY - 15);
        ctx.lineTo(x + bitWidth * 0.8, isHigh ? sclY - 15 : sclY + 15);
        ctx.lineTo(x + bitWidth, isHigh ? sclY - 15 : sclY + 15);
      }
      ctx.stroke();

      // 绘制SDA数据信号
      ctx.strokeStyle = '#8b5cf6';
      ctx.beginPath();
      const sdaY = canvas.height * 0.7;
      const dataPattern = [0, 1, 0, 0, 1, 1, 0, 1, 0, 1];
      
      for (let i = 0; i < 10; i++) {
        const x = startX + i * bitWidth;
        const isHigh = dataPattern[i] === 1;
        
        if (i === 0) {
          ctx.moveTo(x, isHigh ? sdaY - 15 : sdaY + 15);
        }
        
        ctx.lineTo(x + bitWidth * 0.1, isHigh ? sdaY - 15 : sdaY + 15);
        ctx.lineTo(x + bitWidth * 0.9, isHigh ? sdaY - 15 : sdaY + 15);
        ctx.lineTo(x + bitWidth, isHigh ? sdaY - 15 : sdaY + 15);
      }
      ctx.stroke();

      // 标签
      ctx.fillStyle = '#5eead4';
      ctx.font = '12px monospace';
      ctx.fillText('SCL', 5, sclY + 5);
      
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText('SDA', 5, sdaY + 5);

      frame++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [selectedDriver]);

  const currentDriver = driverCategories.find(d => d.id === selectedDriver);
  const Icon = currentDriver?.icon || Cpu;

  return (
    <div className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 mb-4">
            <Settings className="w-4 h-4 text-cyan-600" />
            <span className="text-cyan-700 text-sm font-medium">硬件驱动</span>
          </div>
          <h2 className="section-title">底层驱动详解</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            深入理解硬件驱动实现原理，掌握STM32外设配置和数据传输机制
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Driver selector */}
          <div className="space-y-4">
            {driverCategories.map((driver) => {
              const DriverIcon = driver.icon;
              return (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedDriver === driver.id
                      ? 'bg-gradient-to-r ' + driver.color + ' text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDriver === driver.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <DriverIcon className={`w-5 h-5 ${
                        selectedDriver === driver.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{driver.name}</div>
                      <div className={`text-sm ${
                        selectedDriver === driver.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {driver.features.length} 个特性
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Driver details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className={`bg-gradient-to-r ${currentDriver?.color}`}>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{currentDriver?.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6">{currentDriver?.description}</p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentDriver?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentDriver?.color}`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* I2C Signal Visualization */}
                {selectedDriver === 'i2c' && (
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">I2C信号波形演示</div>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Code example */}
                <div className="code-block text-xs overflow-x-auto">
                  <pre>{codeExamples[selectedDriver]}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key points */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: '硬件抽象', desc: '封装底层寄存器操作', icon: '🔧' },
            { title: '中断驱动', desc: '高效的事件响应机制', icon: '⚡' },
            { title: 'DMA传输', desc: '零CPU开销数据传输', icon: '📊' },
            { title: '错误处理', desc: '完善的异常检测恢复', icon: '🛡️' },
          ].map((point, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">{point.icon}</div>
              <div className="font-medium text-gray-900 mb-1">{point.title}</div>
              <div className="text-sm text-gray-500">{point.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
