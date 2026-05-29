# 剪映学堂整体重设计

## 概述

对 ClipAcademy 进行架构重构和视觉升级，解决 App.tsx（650行）和 App.css（664行）过度膨胀的问题，同时新增学习路径、百分比进度、智能推荐等功能。

## 布局：顶部导航 + 可折叠侧栏

- **TopNav**：Logo "剪映学堂"、导航标签（全部/收藏/学习路径）、加大搜索框（支持链接粘贴）、主题切换按钮
- **Sidebar**：展示全部 14 个分类（可折叠）、学习进度筛选（继续学习/练习中）
- **内容区**：根据当前视图展示首页/搜索结果/分类列表等

## 首页：三区块布局

1. **继续学习** — 横向滚动卡片，显示有进度记录的课程，带百分比进度条
2. **学习路径** — 官方路线卡片（如"剪辑从零到一"），每条路线显示课程数和完成进度
3. **猜你喜欢** — 基于学习记录和标签的智能推荐，3 列网格

## 主题系统

- CSS 变量驱动，`[data-theme="dark"]` 选择器覆盖
- **亮色**：毛玻璃卡片 + 浅色背景（`#fafafe`）+ 圆角阴影
- **暗色**：深色底（`#0a0a0f`）+ 紫金渐变点缀 + 细边框
- 切换时 framer-motion 过渡动画
- 偏好存 localStorage，默认跟随系统 `prefers-color-scheme`

## 组件架构

```
src/components/
├── layout/          TopNav / Sidebar / ThemeToggle
├── home/            HomePage / ContinueLearning / LearningPaths / RecommendedList
├── course/          CourseGrid / CourseCard / CourseDetail
├── search/          SearchBar / FilterBar
└── shared/          EmptyState / LoadingSkeleton
```

每个组件 80-150 行，职责单一。现有 hooks/ 和 services/ 保持不变。

## 功能改进

### 学习进度从三档改为百分比

- 进度条 0-100%，用户拖动设置，存储在现有 proficiency localStorage key（值改为 0-100）
- CourseCard 和详情面板展示进度条

### 学习路径

- 数据：手动定义 JSON 文件，每组路径包含有序课程 ID 列表、名称、描述、难度等级
- 展示：路径卡片显示课程数、进度条、已完成数
- 推荐：基于当前进度最高的路径，推荐下一步课程

### 智能推荐

- 基于已学课程的分类标签统计用户偏好
- 推荐同分类未学课程，按播放量/收藏数降序
- 排除已隐藏/已完成的课程

### 搜索增强

- 搜索框加大，placeholder 明确提示"搜索或粘贴链接"
- 粘贴链接时保持现有 fetch-course 流程

## 数据流

- 前端状态管理保持 React hooks 模式（useCourses / useFavorites / useFilters / useProficiency）
- proficiency 值域从 0|1|2 改为 0-100
- 学习路径数据新建 `src/data/learning-paths.json`
- localStorage key 不变，兼容现有数据

## 动画策略

- 卡片入场：framer-motion `initial={{ opacity: 0, y: 20 }}` + stagger
- 主题切换：背景色和卡片色 CSS transition 0.3s
- 页面切换：framer-motion AnimatePresence
- 侧栏折叠：宽度 transition
- Loading：骨架屏 shimmer 动画

## 不涉及

- 社区互动功能（评论/评分/分享）
- AI 学习助手
- 章节打卡（需要课程结构化数据）
- 后端/数据库改动
