import { useState } from 'react';
import { BookOpen, CheckCircle, AlertCircle, Lightbulb, Wrench, Code, Cpu, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const reproductionSteps = [
  {
    id: 'prepare',
    title: '环境准备',
    icon: Wrench,
    color: 'from-blue-500 to-cyan-500',
    items: [
      { text: '安装Keil MDK 5.3x或更高版本', important: true },
      { text: '安装STM32标准外设库 (SPL)', important: true },
      { text: '准备ST-Link调试器', important: true },
      { text: '安装串口调试助手', important: false },
      { text: '准备0.96寸OLED显示屏 (I2C接口)', important: true },
      { text: '准备旋转编码器和按键', important: true },
    ],
    tips: [
      'Keil建议使用最新版本，兼容性更好',
      'OLED确保是I2C接口，地址通常为0x78或0x7A',
      '旋转编码器选择带按键功能的型号',
    ],
  },
  {
    id: 'hardware',
    title: '硬件连接',
    icon: Cpu,
    color: 'from-purple-500 to-pink-500',
    items: [
      { text: 'OLED SCL → PB6', important: true },
      { text: 'OLED SDA → PB7', important: true },
      { text: '编码器A相 → PA0', important: true },
      { text: '编码器B相 → PA1', important: true },
      { text: 'OK按键 → PA0 (与编码器共用)', important: true },
      { text: 'BACK按键 → PA1', important: true },
      { text: 'LED → PC13', important: false },
    ],
    tips: [
      '所有GPIO配置为内部上拉输入模式',
      'OLED需要3.3V供电，不要接5V',
      '建议使用面包板先搭建测试电路',
    ],
  },
  {
    id: 'project',
    title: '工程创建',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    items: [
      { text: '创建新工程，选择STM32F103C8芯片', important: true },
      { text: '添加启动文件 startup_stm32f10x_md.s', important: true },
      { text: '配置CMSIS和SPL库路径', important: true },
      { text: '添加头文件包含路径', important: true },
      { text: '配置宏定义 STM32F10X_MD, USE_STDPERIPH_DRIVER', important: true },
      { text: '设置输出HEX文件', important: false },
    ],
    tips: [
      '芯片型号必须选择正确，否则程序无法运行',
      '宏定义在C/C++选项卡中配置',
      '建议先创建一个简单的LED闪烁工程测试环境',
    ],
  },
  {
    id: 'code',
    title: '代码移植',
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
    items: [
      { text: '按文件结构创建所有源文件', important: true },
      { text: '从底层驱动开始移植 (HardI2C → OLED)', important: true },
      { text: '移植中间件层 (EventBus → MenuTree)', important: true },
      { text: '最后移植应用层代码', important: true },
      { text: '逐个模块测试，确保功能正常', important: true },
      { text: '整合所有模块，进行系统测试', important: true },
    ],
    tips: [
      '采用自底向上的移植策略',
      '每移植一个模块就进行测试',
      '遇到问题先检查硬件连接再查代码',
    ],
  },
];

const commonIssues = [
  {
    problem: 'OLED不显示',
    causes: [
      '检查I2C地址是否正确',
      '检查SCL/SDA接线是否接反',
      '检查OLED供电电压是否为3.3V',
      '用示波器检查I2C信号是否正常',
    ],
    solution: '使用I2C扫描程序确认设备地址，检查硬件连接',
  },
  {
    problem: '编码器无响应',
    causes: [
      '检查A/B相接线是否正确',
      '检查外部中断配置',
      '检查编码器是否损坏',
    ],
    solution: '先用简单的GPIO读取测试编码器输出',
  },
  {
    problem: '程序卡死',
    causes: [
      '检查中断优先级配置',
      '检查是否有死循环',
      '检查栈溢出',
      '检查DMA配置是否正确',
    ],
    solution: '使用调试器单步执行，定位卡死位置',
  },
  {
    problem: '动画卡顿',
    causes: [
      'I2C传输速度不够',
      'DMA未正确配置',
      '中断处理时间过长',
    ],
    solution: '启用DMA传输，优化中断处理函数',
  },
];

export function ReproductionGuideSection() {
  const [activeStep, setActiveStep] = useState('prepare');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const currentStep = reproductionSteps.find(s => s.id === activeStep);

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 mb-4">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-sm font-medium">复现指南</span>
          </div>
          <h2 className="section-title">项目复现完整流程</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            从零开始搭建环境到成功运行，详细的步骤指导和常见问题解决方案
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step navigation */}
          <div className="space-y-3">
            {reproductionSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    activeStep === step.id
                      ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeStep === step.id ? 'bg-white/20' : 'bg-white'
                    }`}>
                      <StepIcon className={`w-4 h-4 ${
                        activeStep === step.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${
                          activeStep === step.id ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          步骤 {index + 1}
                        </span>
                      </div>
                      <div className="font-medium">{step.title}</div>
                    </div>
                    {activeStep === step.id && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className={`bg-gradient-to-r ${currentStep?.color}`}>
                <CardTitle className="text-white flex items-center space-x-2">
                  {currentStep && <currentStep.icon className="w-5 h-5" />}
                  <span>{currentStep?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Checklist */}
                <div className="space-y-3 mb-6">
                  {currentStep?.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        item.important ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`mt-0.5 ${
                        item.important ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {item.important ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={item.important ? 'text-red-900' : 'text-gray-700'}>
                          {item.text}
                        </span>
                        {item.important && (
                          <span className="ml-2 text-xs text-red-500 font-medium">
                            重要
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">实用提示</span>
                  </div>
                  <ul className="space-y-2">
                    {currentStep?.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-yellow-700">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Common issues */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">常见问题排查</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonIssues.map((issue, idx) => (
              <Card
                key={idx}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => setExpandedIssue(expandedIssue === issue.problem ? null : issue.problem)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span>{issue.problem}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expandedIssue === issue.problem ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">可能原因：</div>
                        <ul className="space-y-1">
                          {issue.causes.map((cause, cidx) => (
                            <li key={cidx} className="text-sm text-gray-600 flex items-start space-x-2">
                              <span className="text-gray-400">-</span>
                              <span>{cause}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-800 mb-1">解决方案：</div>
                        <div className="text-sm text-green-700">{issue.solution}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">点击查看解决方案</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success checklist */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold text-center mb-6">复现成功检查清单</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'OLED正常显示',
              '编码器响应正常',
              '按键功能正常',
              '菜单滚动流畅',
              '动画效果正常',
              '游戏运行正常',
              '时间显示准确',
              '无卡顿现象',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
