import { useState } from 'react';
import { Code2, FileCode, Folder, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// 真实的代码片段库 - 来自用户项目源代码
const codeSnippets: Record<string, string> = {
  main: `// main.c - 主程序入口
// 软件代码开源By:CTRL66666(GITHUB)
// STM32引脚配置:
// PB4接地; PB5接VCC(可软件复位OLED)
// PB6接OLED屏幕SCL; PB7接OLED屏幕SDA
// PB0连接按键"OK",ID:4; PB11连接按键"BACK",ID:3
// PA7连接编码器'A'脚,ID:1(顺时针); PA6连接编码器'B'脚,ID:2(逆时针)

#include "stm32f10x.h"
#include "Delay.h"
#include "EventBus.h"
#include "MyTimer.h"
#include "Encoder.h"
#include "OLED.h"
#include "Image.h"
#include "Key.h"
#include "MyRTC.h"
#include "CreateMenu.h"
#include "Action.h"

int main(void)
{
    OLED_Init();    // 初始化屏幕
    Image_Init();   // 创建一级菜单并显示
    Menu_Init();    // 二级菜单初始化
    MyRTC_Init();   // 初始化时钟数据
    Key_Init();     // PB0和PB11外部中断配置
    Encoder_Init(); // 编码器控制操作菜单
    Timer_Init();   // 定时器3测帧速率
    
    while(1)
    {
        if (EventQueue_IsEmpty())
        {
            // 进入低功耗
            // __WFI();
        }
        else
        {
            EventType ev = EventQueue_Dequeue();  // 队列中取出事件
            EventBus_Publish(ev);  // 分发事件
        }
    }
}`,

  eventbus: `// EventBus.c - 事件总线模块
// 事件观察者+消息队列框架,二者协同解耦复杂逻辑的事件响应

#define MAX_SUBSCRIBERS 4
static EventHandler_t handlers[EV_MAX][MAX_SUBSCRIBERS];
static uint8_t handler_count[EV_MAX];

// 订阅事件（无参数版本）
void EventBus_Subscribe(EventType ev, void (*handler)(void))
{
    if (ev < EV_MAX && handler_count[ev] < MAX_SUBSCRIBERS)
    {
        handlers[ev][handler_count[ev]].Handler = handler;
        handlers[ev][handler_count[ev]].type = HANDLER_VOID;
        handler_count[ev]++;
    }
}

// 订阅事件（带参数版本）
void EventBus_SubscribeInt(EventType ev, void (*handler)(int), char param)
{
    if (ev < EV_MAX && handler_count[ev] < MAX_SUBSCRIBERS)
    {
        handlers[ev][handler_count[ev]].Handler = (void (*)(void))handler;
        handlers[ev][handler_count[ev]].param = param;
        handlers[ev][handler_count[ev]].type = HANDLER_INT;
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
            ((void (*)(int))handlers[ev][i].Handler)(handlers[ev][i].param);
        }
    }
}`,

  eventqueue: `// EventQueue.c - 消息队列模块
#define EVENT_QUEUE_SIZE 3

static Event_t queue[EVENT_QUEUE_SIZE];
static volatile uint8_t head = 0;   // 入队位置
static volatile uint8_t tail = 0;   // 出队位置

// 入队操作（在中断中调用，必须保证原子性）
u8 EventQueue_Enqueue(EventType ev)
{
    __disable_irq();  // 关中断
    
    uint8_t next = (head + 1) % EVENT_QUEUE_SIZE;
    if (next == tail)
    {
        // 队列满，丢弃事件
        __enable_irq();
        return 0;
    }
    
    queue[head].type = ev;
    head = next;
    
    __enable_irq();  // 开中断
    return 1;
}

// 出队操作（在主循环中调用）
EventType EventQueue_Dequeue(void)
{
    if (head == tail)
    {
        return EV_NONE;  // 队列空
    }
    
    EventType ev = queue[tail].type;
    CurrentEvent = ev;
    tail = (tail + 1) % EVENT_QUEUE_SIZE;
    
    return ev;
}

// 检查队列是否为空
u8 EventQueue_IsEmpty(void)
{
    return head == tail;
}`,

  menutree: `// MenuTree.c - 菜单树模块
// 链表节点结构体
typedef struct LinkNode {
    uint8_t id;
    const uint8_t *Image;
    const char *Str;
    struct LinkNode *next;
    struct LinkNode *last;
    struct Link *ChildMenuLink;
    void (*Action)(void);
} LinkNode;

// 队列节点结构体
typedef struct QueueNode {
    uint8_t sequence;
    uint8_t block[4];  // [行, 列, 高, 宽]
    LinkNode *element;
    struct QueueNode *next;
} QueueNode;

// 创建链表并初始化头结点
Link* Link_Init(uint8_t ID, const uint8_t *img, 
                const char *str, void (*action)(void))
{
    Link *NewLink = (Link *)malloc(sizeof(Link));
    LinkNode *HeadNode = (LinkNode *)malloc(sizeof(LinkNode));
    
    HeadNode->id = ID;
    HeadNode->Image = img;
    HeadNode->Str = str;
    HeadNode->next = NULL;
    HeadNode->last = NULL;
    HeadNode->Action = action;
    
    NewLink->head = NewLink->tail = HeadNode;
    return NewLink;
}

// 链表添加图像元素
BitAction Link_PushBack(Link *lk, uint8_t id, 
    const uint8_t *img, const char *str, void (*action)(void))
{
    if (lk == NULL) return 0;
    
    LinkNode *NewNode = (LinkNode *)malloc(sizeof(LinkNode));
    if (NewNode == NULL) return 0;
    
    NewNode->id = id;
    NewNode->Image = img;
    NewNode->Str = str;
    NewNode->next = lk->head;  // 形成环形链表
    NewNode->last = lk->tail;
    NewNode->Action = action;
    
    lk->tail->next = NewNode;
    lk->tail = NewNode;
    lk->head->last = NewNode;  // 头节点的last指向新尾节点
    
    return 1;
}`,

  oled: `// OLED.c - OLED显示驱动
// 基于HardI2C的OLED画图和显示方法,为驱动层
// GND->PB4; VCC->PB5; SCL->PB6; SDA->PB7

#define BUF_CNT 2
uint8_t OLED_BUF[BUF_CNT][8][128];
volatile uint8_t buf_idx = 0;

#define DRAW_BUF OLED_BUF[buf_idx]
#define SEND_BUF OLED_BUF[buf_idx ^ 1]

// 双缓冲更新 - 一次性发送整个显存(1024字节)
void OLED_Update(void)
{
    // 等待上一次传输完成
    uint32_t timeout = 25000;
    while (!dma_done)
    {
        timeout--;
        if (timeout < 10) 
        {
            // 总线卡死，尝试恢复
            DMA_Cmd(DMA1_Channel6, DISABLE);
            I2C_GenerateSTOP(I2C1, ENABLE);
            I2C_DMACmd(I2C1, DISABLE);
            dma_done = 1;
        }
    }
    
    // 交换缓冲区
    if(OledOptions.DisplayReverse) OLED_ReverseArea(0, 0, 64, 128);
    buf_idx ^= 1;
    uint8_t *p_data = (uint8_t*)SEND_BUF;
    
    // 启动DMA传输
    DMA1_Channel6->CMAR = (uint32_t)p_data;
    DMA1_Channel6->CNDTR = 1024;
    dma_done = 0;
    
    I2C_DMACmd(I2C1, ENABLE);
    I2C_GenerateSTART(I2C1, ENABLE);
    while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
    I2C_Send7bitAddress(I2C1, OLED_I2C_ADDR, I2C_Direction_Transmitter);
    while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
    I2C_SendData(I2C1, DAT_CTRL_BYTE);  // 0x40
    while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
    DMA_Cmd(DMA1_Channel6, ENABLE);
    
    memcpy(DRAW_BUF, SEND_BUF, sizeof(DRAW_BUF));
    if(OledOptions.DisplayReverse) OLED_ReverseArea(0, 0, 64, 128);
}`,

  hardi2c: `// HardI2C.c - 硬件I2C驱动
// 硬件I2C和引脚时钟配置,是协议层

#define OLED_I2C_ADDR   (0x3C<<1)   // 0x78的7位形式
#define CMD_CTRL_BYTE   0x00        // Co=0, D/C#=0
#define DAT_CTRL_BYTE   0x40        // Co=0, D/C#=1

volatile uint8_t dma_done;   // 1=完成，0=正在传

void OLED_I2C_Init(void)
{
    // 使能时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);
    RCC_AHBPeriphClockCmd(RCC_AHBPeriph_DMA1, ENABLE);
    
    // PB5置高用于软件复位OLED
    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_5;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOB, &GPIO_InitStructure);
    GPIO_SetBits(GPIOB, GPIO_Pin_5);
    Delay_ms(5);
    
    // PB6=SCL, PB7=SDA 复用开漏
    GPIO_PinRemapConfig(GPIO_Remap_SWJ_JTAGDisable, ENABLE);
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_OD;
    GPIO_Init(GPIOB, &GPIO_InitStructure);
    
    // I2C配置
    I2C_InitTypeDef i2c;
    i2c.I2C_Mode = I2C_Mode_I2C;
    i2c.I2C_DutyCycle = I2C_DutyCycle_2;
    i2c.I2C_ClockSpeed = 1300000;  // 1.3MHz超频
    I2C_Init(I2C1, &i2c);
    I2C_Cmd(I2C1, ENABLE);
    
    // DMA配置
    DMA_InitTypeDef dma;
    DMA_DeInit(DMA1_Channel6);
    dma.DMA_PeripheralBaseAddr = (uint32_t)&I2C1->DR;
    dma.DMA_MemoryBaseAddr = (uint32_t)i2c_buf;
    dma.DMA_DIR = DMA_DIR_PeripheralDST;
    dma.DMA_BufferSize = 2;
    dma.DMA_Mode = DMA_Mode_Normal;
    dma.DMA_Priority = DMA_Priority_VeryHigh;
    DMA_Init(DMA1_Channel6, &dma);
    
    dma_done = 1;
    DMA_ITConfig(DMA1_Channel6, DMA_IT_TC, ENABLE);
    NVIC_EnableIRQ(DMA1_Channel6_IRQn);
}`,

  animation: `// Animation.c - 动画引擎
// 菜单元素的线性缩放平移动画

#define PHYSICS_SCALE 10  // 固定点数缩放,避免浮点运算

AnimationController Controller[5] = {
    {   // 左侧隐藏元素
        .currentY = 20<<8, .currentX = -32<<8,
        .currentHeight = 24<<8, .currentWidth = 32<<8
    },
    {   // 屏幕左侧
        .currentY = 20<<8, .currentX = 5<<8,
        .currentHeight = 24<<8, .currentWidth = 32<<8
    },
    {   // 中间元素
        .currentY = 6<<8, .currentX = 40<<8,
        .currentHeight = 36<<8, .currentWidth = 48<<8
    },
    {   // 屏幕右侧
        .currentY = 20<<8, .currentX = 92<<8,
        .currentHeight = 24<<8, .currentWidth = 32<<8
    },
    {   // 右侧隐藏
        .currentY = 20<<8, .currentX = 128<<8,
        .currentHeight = 24<<8, .currentWidth = 32<<8
    }
};

void Animation_Start(u8 Direction, AnimationController* ConstController, u8 Frame)
{
    AnimationController Controller[5];
    memcpy(Controller, ConstController, sizeof(Controller));
    
    // 计算每个元素的初末位移差值
    if(Direction)  // 左滚动
    {
        for (int i = 1; i < 5; i++) {
            Controller[i].deltaY = Controller[i-1].currentY - Controller[i].currentY;
            Controller[i].deltaX = Controller[i-1].currentX - Controller[i].currentX;
        }
    }
    else  // 右滚动
    {
        for (int i = 0; i < 4; i++) {
            Controller[i].deltaY = Controller[i+1].currentY - Controller[i].currentY;
            Controller[i].deltaX = Controller[i+1].currentX - Controller[i].currentX;
        }
    }
    
    // 计算缩放精度8位后的步长
    for (int i = 0; i < 5; i++) {
        Controller[i].stepY = Controller[i].deltaY / Frame;
        Controller[i].stepX = Controller[i].deltaX / Frame;
    }
    
    // 执行动画帧
    for(int j = 1; j < Frame; j++)
    {
        OLED_ClearBuf();
        int i = 0;
        for(QueueNode *p = pCurrentQueue->head; p != NULL; p = p->next)
        {
            Controller[i].currentY += Controller[i].stepY;
            p->block[0] = Controller[i].currentY >> 8;
            Controller[i].currentX += Controller[i].stepX;
            p->block[1] = (Controller[i].currentX + Controller[i].stepX) >> 8;
            i++;
        }
        OLED_Update();
    }
}`,

  snake: `// Snake.c - 贪吃蛇游戏

#define MAP_W       128
#define MAP_H       64
#define DOT_SIZE    6
#define GRID_W      (MAP_W/DOT_SIZE)
#define GRID_H      (MAP_H/DOT_SIZE)
#define MAX_SNAKE   40

typedef enum {
    SNAKE_READY,
    SNAKE_PLAYING,
    SNAKE_PAUSE,
    SNAKE_OVER
} SNAKE_STATE;

static SNAKE_STATE state = SNAKE_READY;
static struct { uint8_t x,y; } snake[MAX_SNAKE];
static uint8_t snakeLen = 3;
static int8_t dirX = 1, dirY = 0;

static void snake_move(void)
{
    // 计算新头，允许穿墙
    int16_t nx = (int16_t)snake[0].x + dirX;
    int16_t ny = (int16_t)snake[0].y + dirY;
    
    // 穿墙回绕
    if (nx < 0) nx = GRID_W - 1;
    else if (nx >= GRID_W) nx = 0;
    if (ny < 0) ny = GRID_H - 1;
    else if (ny >= GRID_H) ny = 0;
    
    // 撞自己才死
    for (uint8_t i = 0; i < snakeLen; i++)
        if (snake[i].x == (uint8_t)nx && snake[i].y == (uint8_t)ny)
        { state = SNAKE_OVER; return; }
    
    // 前移身体
    for (uint8_t i = snakeLen; i > 0; i--) snake[i] = snake[i-1];
    snake[0].x = (uint8_t)nx;
    snake[0].y = (uint8_t)ny;
    
    // 吃食物
    if (snake[0].x == foodX && snake[0].y == foodY) {
        if (snakeLen < MAX_SNAKE) snakeLen++;
        place_food();
    }
}

void SNAKE_KeyAction(uint8_t event)
{
    switch (state) {
    case SNAKE_READY:
        if (event == KEY_OK) { state = SNAKE_PLAYING; }
        else if (event == KEY_BACK) { ACTION_Exit(); }
        break;
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
    case SNAKE_OVER:
        if (event == KEY_OK) { snake_init(); state = SNAKE_READY; }
        break;
    }
}`,

  systemset: `// SystemSET.c - 系统设置应用
// 提供调整主频,查看信息等功能

typedef enum {
    SYSTEMSET_HOMEPAGE,   // 首页
    SYSTEMSET_CHILDPAGE,  // 子页
    SYSTEMSET_THIRDPAGE,  // 第三页
    SYSTEMSET_OVER        // 其他页
} SYSTEMSET_STATE;

SystemElement HomePage[5] = {
    { .Inx=0, .Str="电源管理", .ChildPage=PowerPage, .Icon=Icon_Batterry },
    { .Inx=1, .Str="重启机器", .Action=NVIC_SystemReset, .Icon=Icon_Restart },
    { .Inx=2, .Str="显示设置", .ChildPage=DisplayPage, .Icon=Icon_Display },
    { .Inx=3, .Str="关于设备", .ChildPage=AboutPage, .Icon=Icon_About },
    { .Inx=255, .Str="定时设置", .Icon=Icon_Clock }
};

void SystemSET_KeyAction(uint8_t Event)
{
    switch(STATE) {
    case SYSTEMSET_HOMEPAGE:
        if (Event == 1) {  // 反转
            if(Pointer.PointerOffset>0) Pointer.PointerOffset--;
            else if(Pointer.BaseOffset>0) Pointer.BaseOffset--;
        }
        else if(Event == 2) {  // 正转
            if(Pointer.PointerOffset<2) Pointer.PointerOffset++;
            else if(Pointer.CurrentPage[Pointer.BaseOffset+2].Inx != 255) 
                Pointer.BaseOffset++;
        }
        else if (Event == 3) {  // BACK键
            ACTION_Exit();
        }
        else if (Event == 4) {  // OK键
            if(Pointer.CurrentPage[Pointer.BaseOffset+Pointer.PointerOffset].ChildPage)
            {
                // 进入子页面
                Pointer.CurrentPage = Pointer.CurrentPage[Pointer.BaseOffset+Pointer.PointerOffset].ChildPage;
                Pointer.ChildContorller = (PointerContorller *)malloc(sizeof(PointerContorller));
                Pointer.ChildContorller->BaseOffset = Pointer.BaseOffset;
                Pointer.ChildContorller->PointerOffset = Pointer.PointerOffset;
                Pointer.BaseOffset = 0;
                Pointer.PointerOffset = 0;
                STATE = SYSTEMSET_CHILDPAGE;
            }
            else if (Pointer.CurrentPage[Pointer.BaseOffset+Pointer.PointerOffset].Action)
            {
                // 执行动作函数
                Pointer.CurrentPage[Pointer.BaseOffset+Pointer.PointerOffset].Action();
            }
        }
        break;
    }
}`,

  clock: `// Clock.c - 时钟应用(海洋帆船主题)
// 包含波浪动画、帆船、云朵、海鸥

#define WAVE_Y1     40  // 第一层波浪基准线
#define WAVE_Y2     48  // 第二层波浪基准线
#define WAVE_Y3     56  // 第三层波浪基准线

static uint16_t wave_phase = 0;
static uint8_t cloud1_x = 120;
static uint8_t cloud2_x = 50;
static uint8_t bird_x = 140;
static int8_t SHIP_X = -8;

void Show_ClOCK_Ship(void)
{
    uint8_t hour, min, sec;
    int8_t offset;
    uint8_t idx;
    
    MyRTC_ReadTime();
    hour = MyRTC_Time[3];
    min = MyRTC_Time[4];
    sec = MyRTC_Time[5];
    
    // 显示时间
    OLED_Printf(10, 48, 20, 12, 0, "%02d:%02d", hour, min);
    
    // 更新动画参数
    wave_phase += 1;
    
    // 云朵缓慢左移
    if(cloud1_x > 0) cloud1_x--; else cloud1_x = 140;
    if(cloud2_x > 0) cloud2_x--; else cloud2_x = 130;
    
    // 海鸥飞行
    if(bird_x > 0) {
        bird_x -= 2;
        bird_y += (sec % 2) ? 1 : -1;
    } else {
        bird_x = 140;
        bird_y = 12 + (sec % 10);
    }
    
    // 绘制三层波浪
    for(x = 0; x < 128; x++) {
        idx = (x + wave_phase) % 60;
        offset = (SIN_TAB[idx] * 3) / 100;
        OLED_DrawPixel(WAVE_Y1 + offset, x);
    }
    
    // 帆船随波浪起伏
    SHIP_X = -8 + (sec % 60) * 2.27;
    idx = (SHIP_X + wave_phase * 2) % 60;
    int8_t ship_y = WAVE_Y2 + (SIN_TAB[idx] * 4) / 100 - 2;
    Draw_Ship(SHIP_X, ship_y);
}`,

  emoji: `// Emoji.c - 表情应用
// 支持6种表情状态:中性、开心、惊讶、生气、悲伤、困倦

typedef enum {
    FACE_NEUTRAL,
    FACE_HAPPY,
    FACE_SAD,
    FACE_SURPRISED,
    FACE_ANGRY,
    FACE_SLEEPY
} FaceState_t;

void Show_Emoji(FaceManager_t *face)
{
    tick++;
    
    // 每隔一段时间改变情绪
    if(tick % 800 == 0) {
        static uint8_t mood = 0;
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
    
    // 绘制双眼
    Draw_Eye(&face->left_eye, offset_x, offset_y);
    Draw_Eye(&face->right_eye, offset_x, offset_y);
    
    // 绘制嘴巴
    Draw_Mouth(face, offset_x, offset_y);
}

// 视线物理惯性（弹簧阻尼系统）
void Face_Update(FaceManager_t *face) {
    float k = 0.12f;   // 弹簧系数
    float d = 0.75f;   // 阻尼系数
    
    // 计算指向目标的加速度
    float ax = (target_pupil_x - face->left_eye.pupil_offset_x) * k;
    float ay = (target_pupil_y - face->left_eye.pupil_offset_y) * k;
    
    // 更新速度
    pupil_vel_x += ax;
    pupil_vel_y += ay;
    pupil_vel_x *= d;
    pupil_vel_y *= d;
    
    // 更新位置
    face->left_eye.pupil_offset_x += (int8_t)pupil_vel_x;
    face->left_eye.pupil_offset_y += (int8_t)pupil_vel_y;
}`,
};

// 文件结构定义
interface FileItem {
  name: string;
  type: 'folder' | 'file';
  desc?: string;
  codeKey?: string;
  children?: FileItem[];
}

const fileStructure: FileItem[] = [
  {
    name: 'Core',
    type: 'folder',
    children: [
      { name: 'main.c', type: 'file', desc: '主程序入口', codeKey: 'main' },
    ],
  },
  {
    name: 'Event',
    type: 'folder',
    children: [
      { name: 'EventBus.c', type: 'file', desc: '事件总线', codeKey: 'eventbus' },
      { name: 'EventQueue.c', type: 'file', desc: '消息队列', codeKey: 'eventqueue' },
    ],
  },
  {
    name: 'Menu',
    type: 'folder',
    children: [
      { name: 'MenuTree.c', type: 'file', desc: '菜单树', codeKey: 'menutree' },
    ],
  },
  {
    name: 'Display',
    type: 'folder',
    children: [
      { name: 'OLED.c', type: 'file', desc: 'OLED驱动', codeKey: 'oled' },
      { name: 'HardI2C.c', type: 'file', desc: '硬件I2C', codeKey: 'hardi2c' },
      { name: 'Animation.c', type: 'file', desc: '动画引擎', codeKey: 'animation' },
    ],
  },
  {
    name: 'Apps',
    type: 'folder',
    children: [
      { name: 'Clock.c', type: 'file', desc: '时钟应用', codeKey: 'clock' },
      { name: 'Emoji.c', type: 'file', desc: '表情应用', codeKey: 'emoji' },
      { name: 'Snake.c', type: 'file', desc: '贪吃蛇', codeKey: 'snake' },
      { name: 'SystemSET.c', type: 'file', desc: '系统设置', codeKey: 'systemset' },
    ],
  },
];

export function CodeSection() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['Core', 'Event', 'Display', 'Apps']));
  const [selectedFile, setSelectedFile] = useState<string>('main');
  const [copied, setCopied] = useState(false);

  const toggleFolder = (name: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedFolders(newExpanded);
  };

  const copyCode = () => {
    const code = codeSnippets[selectedFile];
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('代码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.name} style={{ marginLeft: level * 16 }}>
        {item.type === 'folder' ? (
          <div>
            <div
              onClick={() => toggleFolder(item.name)}
              className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {expandedFolders.has(item.name) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Folder className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            {expandedFolders.has(item.name) && item.children && (
              <div>{renderFileTree(item.children, level + 1)}</div>
            )}
          </div>
        ) : (
          <div
            onClick={() => item.codeKey && setSelectedFile(item.codeKey)}
            className={`flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
              selectedFile === item.codeKey ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <FileCode className={`w-5 h-5 ml-6 ${selectedFile === item.codeKey ? 'text-blue-600' : 'text-blue-400'}`} />
            <span className={`text-sm ${selectedFile === item.codeKey ? 'font-medium' : ''}`}>{item.name}</span>
            {item.desc && <span className="text-xs text-gray-400">- {item.desc}</span>}
          </div>
        )}
      </div>
    ));
  };

  const getSelectedFileName = () => {
    for (const folder of fileStructure) {
      if (folder.children) {
        for (const file of folder.children) {
          if (file.codeKey === selectedFile) {
            return file.name;
          }
        }
      }
    }
    return '代码预览';
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 mb-4">
            <Code2 className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 text-sm font-medium">代码结构</span>
          </div>
          <h2 className="section-title">项目源码解析</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            展示项目真实源代码，来自CTRL66666的开源项目
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* File Tree */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Folder className="w-5 h-5 text-yellow-600" />
                <span>文件结构</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
                {renderFileTree(fileStructure)}
              </div>
            </CardContent>
          </Card>

          {/* Code Display */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileCode className="w-5 h-5 text-blue-600" />
                <span>{getSelectedFileName()}</span>
              </CardTitle>
              <button
                onClick={copyCode}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">复制</span>
                  </>
                )}
              </button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="code-block max-h-[600px] overflow-y-auto">
                <pre>{codeSnippets[selectedFile] || '// 选择文件查看代码'}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '28', label: '源码文件', color: 'blue' },
            { value: '10万+', label: '字技术文档', color: 'purple' },
            { value: '17', label: '章节', color: 'green' },
            { value: '8', label: '游戏应用', color: 'orange' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
