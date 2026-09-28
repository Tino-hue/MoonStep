# MoonStep 🌙

> MoonBit 交互式学习平台 — 让学习 MoonBit 像走台阶一样，每一步都踏实、清晰、有成就感。

## 项目简介

MoonStep 是一款面向编程初学者的 MoonBit 编程语言交互式学习平台。用户无需安装环境，打开浏览器即可编写代码、即时运行、获得反馈，通过关卡式教程循序渐进地掌握 MoonBit。

## 技术栈

- **编辑器内核**：`@moonbit/moonpad-monaco` + Monaco Editor
- **前端**：原生 HTML + CSS + JavaScript
- **构建工具**：esbuild
- **部署**：纯静态站点，零后端依赖

## 项目结构

```
MoonStep/
├── index.html          # 入口页面
├── css/                # 样式文件
├── js/                 # JavaScript 源码
├── levels/             # 关卡配置
├── docs/               # 项目文档
├── assets/             # 静态资源
└── dist/               # 构建输出（gitignore）
```

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 本地预览
npm run serve
```

## 许可证

待确定
