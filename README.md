# 福州八中第56届田径运动会 - 重构版本

## 项目概述

这是一个为福州八中第第56届田径运动会开发的赛事信息综合平台，React架构进行重构

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **React Router v6** - 路由管理
- **Axios** - HTTP客户端
- **CSS3** - 样式系统

## 项目结构

```
src/
├── components/          # 可复用组件
│   └── common/        # 通用组件
├── contexts/          # React Context状态管理
├── hooks/             # 自定义Hooks
├── pages/             # 页面组件
├── services/          # API服务层
├── types/             # TypeScript类型定义
├── utils/             # 工具函数
│   ├── constants/     # 常量配置
│   └── helpers/     # 辅助函数
└── App.tsx            # 主应用组件
```

## 功能特性

### 1. 赛程浏览
- 按日期查看比赛项目
- 区分径赛和田赛
- 上午/下午时间段分类

### 2. 赛事详情
- 选手信息展示
- 实时成绩显示
- 班级信息映射

### 3. 用户体验
- 响应式设计
- 加载状态提示
- 错误处理机制
- 时间实时更新

## 安装和运行

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm start
```

### 生产构建
```bash
npm run build
```

## 代码规范

- 使用TypeScript进行类型检查
- 遵循React Hooks最佳实践
- 组件化设计，提高复用性
- 错误边界和错误处理

## 性能优化

- React.memo防止不必要重渲染
- useMemo和useCallback优化计算
- 图片懒加载
- 代码分割

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 贡献指南

1. 使用TypeScript编写代码
2. 遵循现有的代码风格
3. 添加适当的测试用例
4. 更新相关文档

## 许可证

MIT License