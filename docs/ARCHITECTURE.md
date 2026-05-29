# 架构设计文档

> **状态**: 待完善 — 将在「项目脚手架搭建与技术选型」任务完成后更新。

---

## 概述

ClipAcademy 是一个 macOS 原生桌面应用，采用 **SwiftUI + MVVM** 架构。

## 架构图（规划）

```
┌──────────────────────────────────────────┐
│                  Views                    │
│  (Sidebar / Search / Browse / Detail)     │
├──────────────────────────────────────────┤
│               ViewModels                  │
│  (状态管理 / 业务逻辑 / 数据转换)           │
├──────────────────────────────────────────┤
│               Services                    │
│  (SearchEngine / DataLoader / Favorites)  │
├──────────────────────────────────────────┤
│                Models                     │
│  (Course / Category / Author / Platform)  │
├──────────────────────────────────────────┤
│            Data Layer                     │
│  (SwiftData / Core Data / JSON)           │
└──────────────────────────────────────────┘
```

## 核心设计决策（待定）

1. **架构模式**: MVVM — SwiftUI 原生配套，数据绑定通过 `@Observable` (Swift 5.9+) 实现
2. **导航方案**: `NavigationSplitView` 三栏布局（侧边栏 + 列表 + 详情）
3. **数据持久化**: 待定（SwiftData vs Core Data vs 纯 JSON）
4. **搜索实现**: 本地全文搜索，可能使用 `NaturalLanguage` 框架
5. **网络请求**: 仅用于课程数据更新，不做实时网络请求

## 组件树

```
App
├── ContentView
│   ├── SidebarView
│   │   ├── SearchField
│   │   ├── CategoryList
│   │   └── PlatformFilter
│   ├── CourseListView
│   │   ├── CourseCard
│   │   └── EmptyStateView
│   └── CourseDetailView
│       ├── CourseInfoSection
│       ├── PlatformBadge
│       └── OpenLinkButton
```

---

*本文档将在技术选型完成后补充详细实现说明。*
