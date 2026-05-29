# 课程数据模型设计

> **状态**: 待完善 — 将在「课程数据模型与资源结构设计」任务完成后更新。

---

## 概述

本文档定义 ClipAcademy 的核心数据模型，包括课程实体、分类体系、平台枚举等。

## 核心实体

### Course（课程）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 唯一标识 |
| title | String | 课程标题 |
| author | String | 作者/UP主名称 |
| platform | Platform | 来源平台（枚举） |
| url | URL | 课程原始链接 |
| category | Category | 所属技能分类 |
| difficulty | Difficulty | 难度等级 |
| duration | Int? | 视频时长（秒），可选 |
| description | String | 课程简介 |
| tags | [String] | 技能标签列表 |
| thumbnailURL | URL? | 缩略图链接，可选 |
| createdAt | Date | 收录日期 |
| updatedAt | Date | 最后更新日期 |

### Platform（平台）

```swift
enum Platform: String, Codable, CaseIterable {
    case xiaohongshu = "小红书"
    case bilibili    = "B站"
    case douyin      = "抖音"
    case youtube     = "YouTube"
}
```

### Category（分类）

```swift
enum Category: String, Codable, CaseIterable {
    case basics        = "基础操作"
    case colorGrading  = "调色"
    case transitions   = "转场特效"
    case audioDesign   = "音效设计"
    case subtitles     = "字幕标题"
    case editingMind   = "剪辑思维"
    case effects       = "视觉特效"
    case storytelling  = "叙事技巧"
}
```

### Difficulty（难度）

```swift
enum Difficulty: String, Codable, CaseIterable {
    case beginner     = "入门"
    case intermediate = "进阶"
    case advanced     = "高级"
}
```

## 数据存储结构

```
Resources/
└── courses.json        # 课程索引主文件
    [
      {
        "id": "uuid-string",
        "title": "示例课程标题",
        "author": "作者名",
        "platform": "bilibili",
        "url": "https://...",
        "category": "colorGrading",
        "difficulty": "beginner",
        "duration": 600,
        "description": "课程简介...",
        "tags": ["调色", "LUT", "达芬奇"],
        "thumbnailURL": null,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ]
```

## Swift 模型代码（草案）

```swift
import Foundation

struct Course: Identifiable, Codable {
    let id: UUID
    let title: String
    let author: String
    let platform: Platform
    let url: URL
    let category: Category
    let difficulty: Difficulty
    let duration: Int?
    let description: String
    let tags: [String]
    let thumbnailURL: URL?
    let createdAt: Date
    let updatedAt: Date
}
```

---

*本文档将在数据模型设计完成后补充完整的 Swift 类型定义和验证规则。*
