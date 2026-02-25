# Conductr - 项目概览

这是一份针对中文用户的项目概览文档。

## 📦 项目简介

**Conductr** 是一个革命性的AI音乐作曲工具，允许你在MIDI控制器上弹奏和弦，而Claude AI会实时生成完整的四轨音乐编排。

- **原作者**: Asep Bagja Priandana（Anthropic黑客马拉松2026）
- **开源协议**: MIT License
- **开发语言**: JavaScript (HTML5 + Web Audio)
- **核心依赖**: Tone.js, Tonal.js

## 🎯 核心功能

### 四轨自动编排
- 🎸 **吉他轨道** - 动态伴奏
- 🥁 **鼓轨道** - 节奏基础
- 🎹 **钢琴轨道** - 和声厚度
- 🎼 **弦乐轨道** - 情感深度

### 用户交互
- 虚拟钢琴键盘（无需硬件）
- MIDI控制器支持
- 实时和弦识别
- 多种音乐风格选择
- 可调节的BPM和调性

### 输出能力
- 实时播放和预览
- WAV格式下载
- 轨道音量混合
- 静音和循环控制

## 🏗️ 项目结构

```
conductr/
├── index.html                 # 主UI页面
├── css/
│   └── style.css             # 样式（Tailwind + 自定义）
├── js/
│   ├── app.js                # 主应用控制器
│   ├── piano-keyboard.js     # 虚拟键盘和MIDI输入
│   ├── chord-engine.js       # 和弦检测和进行
│   ├── ai-arranger.js        # Claude AI集成
│   ├── playback-engine.js    # 音频播放和WAV渲染
│   ├── config.js             # 配置（风格、轨道、调性）
│   └── utils.js              # 工具函数
├── README.md                 # 英文项目文档
├── LICENSE                   # MIT协议
├── CONTRIBUTING.md           # 贡献指南
└── .gitignore               # Git忽略文件

```

## 🚀 快速开始

### 1. 本地运行
```bash
cd conductr
python3 -m http.server 8080
# 在浏览器打开 http://localhost:8080
```

### 2. 配置API
- 点击右上角⚙️按钮
- 输入Claude API密钥和端点
- 保存设置

### 3. 创建第一首曲子
1. 在虚拟钢琴上点击音符选择和弦
2. 按Enter或点击"+ Add"添加到进行
3. 选择音乐风格
4. 点击"✨ Generate"生成
5. 用"▶ Play"播放，或"⬇ Download WAV"导出

## 💡 技术亮点

### 架构设计
- **模块化设计** - 每个功能模块独立，易于扩展
- **事件驱动** - 模块间通过事件通信，低耦合
- **ES Modules** - 现代JavaScript模块化
- **零构建步骤** - 直接运行，无需编译打包

### 音乐理论
- 自动和弦识别（三和弦和扩展和弦）
- 调性分析和升降推断
- 节拍和速度管理

### AI集成
- Claude API调用处理
- 音乐编排Prompt设计
- MIDI数据序列化/反序列化

### 音频处理
- Web Audio API合成
- 多轨音频混合
- WAV编码和导出

## 🔧 开发指南

### 扩展音乐风格
编辑 `js/config.js` 中的 `STYLES` 配置：

```javascript
const STYLES = [
  {
    id: 'pop',
    name: 'Pop',
    prompt: '...'  // 对AI的风格描述
  },
  // 添加新风格...
];
```

### 修改AI提示词
在 `js/ai-arranger.js` 中调整发送给Claude的Prompt，控制生成的音乐特征。

### 添加新的音轨
在 `js/config.js` 中的 `TRACKS` 数组添加新轨道定义。

## 📊 项目统计

- **代码行数**: ~2500行 JavaScript
- **HTML文件**: 1个
- **CSS**：自定义样式 + Tailwind框架
- **外部依赖**: Tone.js, Tonal.js (CDN加载)

## 🤝 贡献方式

欢迎以下形式的贡献：

1. **Bug报告** - 提issue描述问题
2. **功能建议** - 讨论新的可能性
3. **代码贡献** - 提交PR完善功能
4. **文档改进** - 优化说明和示例
5. **翻译** - 多语言支持

详见 `CONTRIBUTING.md`

## 🎓 学习资源

### 理解和弦检测
看 `chord-engine.js` - 这是项目的音乐大脑

### 理解AI集成
看 `ai-arranger.js` - 如何与Claude通信

### 理解音频播放
看 `playback-engine.js` - Tone.js的高级用法

## 🐛 常见问题

**Q: 为什么需要本地服务器？**
A: ES模块需要HTTP协议，不能用file://协议

**Q: 可以离线使用吗？**
A: 不行，需要API连接来调用Claude

**Q: 支持哪些浏览器？**
A: Chrome、Firefox、Safari、Edge（最新版本）

**Q: 可以商用吗？**
A: 可以！MIT协议允许商用

## 📈 路线图

- [ ] MIDI文件导入/导出
- [ ] 更多音轨选项
- [ ] 鼓组变化库
- [ ] 人类化选项
- [ ] 乐谱导出
- [ ] 多人协作模式
- [ ] 移动应用版本
- [ ] 预设库系统

## 🙏 致谢

- **Asep Bagja Priandana** - 原创设计者
- **Anthropic** - Claude AI支撑
- **Tone.js团队** - Web Audio框架
- **Tonal.js团队** - 音乐理论算法
- **所有贡献者** - 一起让它变更好

## 📝 许可证

MIT License - 详见LICENSE文件

## 🎵 相关链接

- [Anthropic Claude](https://www.anthropic.com)
- [Tone.js文档](https://tonejs.org/)
- [Tonal.js文档](https://github.com/tonaljs/tonal)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**一起创造音乐，赋能创意！** 🎹✨
