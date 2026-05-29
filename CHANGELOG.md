# Changelog

本项目的所有重要变更均记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### Added
- **掌握程度系统**: 五级掌握程度标记（未学习/30%/50%/70%/100%），侧边栏按进度筛选，课程卡片点击循环切换等级，详情面板精确选择
- **课程数据扩充**: 30 → 64 门课程，覆盖 14 个细分技能分类，B站课程使用真实 BV 号链接
- **分类体系重构**: 8 个通用分类 → 14 个细分分类（转场特效/调色滤镜/音效BGM/字幕动画/漫剪/混剪/口播/电商带货/知识分享/综艺类/视觉特效/Vlog日常/卡点节奏/基础操作）
- **macOS 应用打包**: electron-builder 生成 DMG/ZIP 包，自定义 ICNS 图标，安装至 `/Applications/剪映学堂.app`
- **浏览器开发模式**: localStorage 回退机制，无需 Electron 即可在浏览器中独立开发和调试 UI

### Changed
- **应用名称**: ClipAcademy → 剪映学堂
- **技术栈迁移**: SwiftUI → Electron 33 + React 18 + TypeScript，采用 electron-vite 2 + Vite 6 构建，electron-builder 打包分发
- **架构重构**: MVVM → React 函数组件 + Hooks，扁平组件结构
- **数据层变更**: SwiftData/Core Data → 内存 Map + localStorage 回退（收藏/掌握程度），课程数据 TypeScript 种子文件
- **测试迁移**: XCTest → Vitest + Testing Library
- **构建系统**: Xcode → electron-vite + Vite，支持 HMR 开发体验
- **忽略规则更新**: 移除 Xcode/SPM/CocoaPods 忽略项，新增 Node.js/Vite/Electron/TypeScript 忽略规则

### Fixed
- electron.vite.config `root: '.'` → `root: 'src/renderer'`，修复 Electron 无法加载渲染进程的问题
- TypeScript 字面量类型错误：引入 `as const` 数组 `PROF_VALUES` 保证类型安全

---

## [0.1.0] - 规划中

MVP 目标：实现课程搜索、分类浏览、详情展示、一键跳转、收藏功能。
