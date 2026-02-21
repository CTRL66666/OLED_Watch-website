import { useState } from 'react';
import { Gamepad2, Play, Clock, Smile, Ghost, Bird, Box, Settings, Code, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 游戏应用数据
const games = [
  {
    id: 'clock',
    name: '时钟',
    icon: Clock,
    color: 'from-blue-500 to-cyan-500',
    description: '海洋帆船主题时钟，带波浪动画、云朵、海鸥',
    features: ['波浪动画', '帆船起伏', '云朵飘动', '海鸥飞行'],
  },
  {
    id: 'emoji',
    name: '表情',
    icon: Smile,
    color: 'from-yellow-500 to-orange-500',
    description: '6种情绪表情，带物理惯性的视线追踪',
    features: ['6种情绪', '视线追踪', '眨眼动画', '弹簧阻尼'],
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    icon: Ghost,
    color: 'from-green-500 to-emerald-500',
    description: '经典贪吃蛇游戏，支持穿墙和状态机',
    features: ['穿墙机制', '状态机', '编码器控制', '实时计分'],
  },
  {
    id: 'flappybird',
    name: 'FlappyBird',
    icon: Bird,
    color: 'from-purple-500 to-pink-500',
    description: '经典FlappyBird游戏',
    features: ['跳跃控制', '管道碰撞', '计分系统', '游戏状态'],
  },
  {
    id: 'systemset',
    name: '系统设置',
    icon: Settings,
    color: 'from-gray-500 to-slate-500',
    description: '多级菜单系统设置，支持主频调节',
    features: ['多级菜单', '主频调节', '状态机', '动态反色'],
  },
];

// 真实游戏代码片段
const gameCodes: Record<string, string> = {
  clock: `// Clock.c - 海洋帆船主题时钟
#define WAVE_Y1  40  // 第一层波浪
#define WAVE_Y2  48  // 第二层波浪  
#define WAVE_Y3  56  // 第三层波浪

static uint16_t wave_phase = 0;
static uint8_t cloud1_x = 120;
static uint8_t bird_x = 140;

void Show_ClOCK_Ship(void)
{
    MyRTC_ReadTime();
    hour = MyRTC_Time[3];
    min = MyRTC_Time[4];
    sec = MyRTC_Time[5];
    
    // 显示时间
    OLED_Printf(10, 48, 20, 12, 0, "%02d:%02d", hour, min);
    
    // 更新动画
    wave_phase += 1;
    
    // 云朵缓慢左移
    if(cloud1_x > 0) cloud1_x--; else cloud1_x = 140;
    
    // 海鸥飞行
    if(bird_x > 0) {
        bird_x -= 2;
        bird_y += (sec % 2) ? 1 : -1;
    }
    
    // 绘制三层波浪(正弦曲线)
    for(x = 0; x < 128; x++) {
        idx = (x + wave_phase) % 60;
        offset = (SIN_TAB[idx] * 3) / 100;
        OLED_DrawPixel(WAVE_Y1 + offset, x);
    }
    
    // 帆船随波浪起伏
    SHIP_X = -8 + (sec % 60) * 2.27;
    idx = (SHIP_X + wave_phase * 2) % 60;
    ship_y = WAVE_Y2 + (SIN_TAB[idx] * 4) / 100 - 2;
    Draw_Ship(SHIP_X, ship_y);
}`,

  emoji: `// Emoji.c - 表情应用
// 6种情绪:中性/开心/惊讶/生气/悲伤/困倦

typedef enum {
    FACE_NEUTRAL, FACE_HAPPY, FACE_SAD,
    FACE_SURPRISED, FACE_ANGRY, FACE_SLEEPY
} FaceState_t;

void Show_Emoji(FaceManager_t *face)
{
    tick++;
    
    // 每隔800tick改变情绪
    if(tick % 800 == 0) {
        mood = (mood + 1) % 6;
        switch(mood) {
        case 0: Face_SetState(face, FACE_NEUTRAL); break;
        case 1: Face_SetState(face, FACE_HAPPY); break;
        case 2: Face_SetState(face, FACE_SURPRISED); break;
        case 3: Face_SetState(face, FACE_ANGRY); break;
        case 4: Face_SetState(face, FACE_SAD); break;
        case 5: Face_SetState(face, FACE_SLEEPY); break;
        }
    }
    
    Face_Update(face);
    OLED_ClearBuf();
    
    // 绘制双眼(带高光)
    Draw_Eye(&face->left_eye, offset_x, offset_y);
    Draw_Eye(&face->right_eye, offset_x, offset_y);
    
    // 绘制嘴巴
    Draw_Mouth(face, offset_x, offset_y);
}

// 视线物理惯性(弹簧阻尼系统)
void Face_Update(FaceManager_t *face) {
    float k = 0.12f;   // 弹簧系数
    float d = 0.75f;   // 阻尼系数
    
    // 计算加速度
    float ax = (target_pupil_x - face->left_eye.pupil_offset_x) * k;
    float ay = (target_pupil_y - face->left_eye.pupil_offset_y) * k;
    
    // 更新速度
    pupil_vel_x += ax;
    pupil_vel_y += ay;
    pupil_vel_x *= d;  // 阻尼衰减
    pupil_vel_y *= d;
    
    // 更新位置
    face->left_eye.pupil_offset_x += (int8_t)pupil_vel_x;
    face->left_eye.pupil_offset_y += (int8_t)pupil_vel_y;
}`,

  snake: `// Snake.c - 贪吃蛇游戏
#define MAP_W     128
#define MAP_H     64
#define DOT_SIZE  6
#define GRID_W    (MAP_W/DOT_SIZE)  // 21格
#define GRID_H    (MAP_H/DOT_SIZE)  // 10格
#define MAX_SNAKE 40

typedef enum {
    SNAKE_READY, SNAKE_PLAYING, 
    SNAKE_PAUSE, SNAKE_OVER
} SNAKE_STATE;

static SNAKE_STATE state = SNAKE_READY;
static uint8_t snakeLen = 3;
static int8_t dirX = 1, dirY = 0;

static void snake_move(void)
{
    // 计算新头，允许穿墙
    int16_t nx = snake[0].x + dirX;
    int16_t ny = snake[0].y + dirY;
    
    // 穿墙回绕
    if (nx < 0) nx = GRID_W - 1;
    else if (nx >= GRID_W) nx = 0;
    if (ny < 0) ny = GRID_H - 1;
    else if (ny >= GRID_H) ny = 0;
    
    // 撞自己检测
    for (uint8_t i = 0; i < snakeLen; i++)
        if (snake[i].x == nx && snake[i].y == ny)
        { state = SNAKE_OVER; return; }
    
    // 前移身体
    for (uint8_t i = snakeLen; i > 0; i--) 
        snake[i] = snake[i-1];
    
    snake[0].x = nx;
    snake[0].y = ny;
    
    // 吃食物
    if (snake[0].x == foodX && snake[0].y == foodY) {
        if (snakeLen < MAX_SNAKE) snakeLen++;
        place_food();
    }
}

void SNAKE_KeyAction(uint8_t event)
{
    switch (state) {
    case SNAKE_PLAYING:
        if (event == ENC_CW) {  // 顺时针右转
            if (dirX == 1) { dirX = 0; dirY = 1; }
            else if (dirY == 1) { dirX = -1; dirY = 0; }
            else if (dirX == -1) { dirX = 0; dirY = -1; }
            else if (dirY == -1) { dirX = 1; dirY = 0; }
        }
        else if (event == ENC_CCW) {  // 逆时针左转
            if (dirX == 1) { dirX = 0; dirY = -1; }
            else if (dirY == -1) { dirX = -1; dirY = 0; }
            else if (dirX == -1) { dirX = 0; dirY = 1; }
            else if (dirY == 1) { dirX = 1; dirY = 0; }
        }
        break;
    }
}`,

  flappybird: `// FlappyBird.c - FlappyBird游戏
#define DOT_SIZE  5
#define GRID_W    (128/DOT_SIZE)  // 25格
#define GRID_H    (64/DOT_SIZE)   // 12格

typedef enum { 
    FB_READY, FB_PLAYING, FB_OVER 
} FB_STATE;

static FB_STATE state = FB_READY;
static uint8_t birdGridY = GRID_H / 2;
static int8_t birdVY = 0;
static int8_t pipeCol = GRID_W - 1;
static uint8_t gapCenter = GRID_H / 2;

static void bird_update(void)
{
    birdVY += 1;
    if (birdVY > 2) birdVY = 2;
    
    int16_t newY = birdGridY + birdVY;
    if (newY < 0) { newY = 0; birdVY = 0; }
    if (newY >= GRID_H) { state = FB_OVER; return; }
    
    birdGridY = newY;
}

static void pipe_update(void)
{
    if (pipeCol == 0) {
        pipeCol = GRID_W;
        gapCenter = 3 + (rand() % (GRID_H - 6));
        Score++;
    } else {
        pipeCol--;
    }
}

static uint8_t isColliding(void)
{
    if (pipeCol != 4) return 0;
    uint8_t gapTop = gapCenter - 3;
    uint8_t gapBtm = gapCenter + 2;
    return (birdGridY < gapTop || birdGridY > gapBtm);
}

void FlappyBird_KeyAction(uint8_t event)
{
    switch (state) {
    case FB_PLAYING:
        if (event == KEY_OK || event == ENC_CCW || event == ENC_CW) {
            birdVY = -3;  // 跳跃
        }
        break;
    }
}`,

  systemset: `// SystemSET.c - 系统设置应用
// 多级菜单系统，支持主频调节

typedef enum {
    SYSTEMSET_HOMEPAGE,
    SYSTEMSET_CHILDPAGE,
    SYSTEMSET_THIRDPAGE,
    SYSTEMSET_OVER
} SYSTEMSET_STATE;

SystemElement HomePage[5] = {
    { .Inx=0, .Str="电源管理", .ChildPage=PowerPage },
    { .Inx=1, .Str="重启机器", .Action=NVIC_SystemReset },
    { .Inx=2, .Str="显示设置", .ChildPage=DisplayPage },
    { .Inx=3, .Str="关于设备", .ChildPage=AboutPage },
    { .Inx=255, .Str="定时设置" }
};

void SystemSET_KeyAction(uint8_t Event)
{
    switch(STATE) {
    case SYSTEMSET_HOMEPAGE:
        if (Event == 1) {  // 编码器逆时针
            if(Pointer.PointerOffset > 0) 
                Pointer.PointerOffset--;
            else if(Pointer.BaseOffset > 0) 
                Pointer.BaseOffset--;
        }
        else if(Event == 2) {  // 编码器顺时针
            if(Pointer.PointerOffset < 2) 
                Pointer.PointerOffset++;
            else if(Pointer.CurrentPage[Pointer.BaseOffset+2].Inx != 255) 
                Pointer.BaseOffset++;
        }
        else if (Event == 3) {  // BACK键
            ACTION_Exit();
        }
        else if (Event == 4) {  // OK键
            if(Pointer.CurrentPage[...].ChildPage) {
                // 进入子页面
                Pointer.CurrentPage = ...;
                STATE = SYSTEMSET_CHILDPAGE;
            }
            else if (Pointer.CurrentPage[...].Action) {
                // 执行动作
                Pointer.CurrentPage[...].Action();
            }
        }
        break;
    }
}

// 主频调节函数
void SystemSET_SysClockConfig_Medium()
{
    // 配置40MHz
    RCC_HSEConfig(RCC_HSE_ON);
    while (RCC_GetFlagStatus(RCC_FLAG_HSERDY) == RESET);
    
    RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_5);
    FLASH_SetLatency(FLASH_Latency_2);
    RCC_PLLCmd(ENABLE);
    while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET);
    
    RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);
    menuOptions.SystemClock = 40;
    SystemCoreClock = 40000000;
}`,
};

export function GamesSection() {
  const [selectedGame, setSelectedGame] = useState('clock');

  const currentGame = games.find(g => g.id === selectedGame);
  const Icon = currentGame?.icon || Gamepad2;

  return (
    <div className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 mb-4">
            <Gamepad2 className="w-4 h-4 text-pink-600" />
            <span className="text-pink-700 text-sm font-medium">游戏应用</span>
          </div>
          <h2 className="section-title">丰富的应用生态</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            项目包含8个精心设计的游戏应用，采用统一的状态机框架
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game selector */}
          <div className="space-y-3">
            {games.map((game) => {
              const GameIcon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedGame === game.id
                      ? 'bg-gradient-to-r ' + game.color + ' text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedGame === game.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <GameIcon className={`w-5 h-5 ${
                        selectedGame === game.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{game.name}</div>
                      <div className={`text-sm ${
                        selectedGame === game.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {game.features.length} 个特性
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Game details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className={`bg-gradient-to-r ${currentGame?.color}`}>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{currentGame?.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6">{currentGame?.description}</p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentGame?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentGame?.color}`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Code preview */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Code className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">核心代码</span>
                  </div>
                  <div className="code-block text-xs overflow-x-auto">
                    <pre>{gameCodes[selectedGame] || '// 代码加载中...'}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '8', label: '游戏应用', icon: Gamepad2 },
            { value: '统一', label: '状态机框架', icon: Play },
            { value: '事件', label: '驱动交互', icon: ChevronRight },
            { value: '双缓冲', label: '流畅显示', icon: Box },
          ].map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl p-6 text-center border border-gray-100">
                <StatIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
