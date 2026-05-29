# Changelog

本项目的所有重要变更均记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### Changed
- **技术栈迁移**: SwiftUI → Electron 33 + React 18 + TypeScript，采用 electron-vite 2 + Vite 6 构建，electron-builder 打包分发
- **架构重构**: MVVM → React 函数组件 + Hooks + Context/useReducer（未来扩展至 Zustand）
- **数据层变更**: SwiftData/Core Data → 本地 JSON 文件存储，主进程管理读写，IPC 暴露接口
- **测试迁移**: XCTest → Vitest + Testing Library
- **构建系统**: Xcode → electron-vite + Vite，支持 HMR 开发体验
- **忽略规则更新**: 移除 Xcode/SPM/CocoaPods 忽略项，新增 Node.js/Vite/Electron/TypeScript 忽略规则

### Added
- 项目初始化，确立产品愿景与技术方向
- README 项目文档完善：愿景、功能规划、技术栈、项目结构、开发指南
- 架构设计文档 (docs/ARCHITECTURE.md)：多进程架构、组件树、数据流、安全模型
- 课程数据模型文档 (docs/DATA_MODEL.md)：Course/Platform/Category/Difficulty 类型定义、IPC 接口设计

---

## [0.1.0] - 规划中

MVP 目标：实现课程搜索、分类浏览、详情展示、一键跳转、收藏功能。
