# 福州八中第56届田径运动会 - 赛事综合管理平台

## 🏃‍♂️ 项目概述

这是一个专为福州八中第56届田径运动会开发的现代化赛事综合管理平台。采用React + TypeScript技术栈，提供赛程管理、运动员信息、成绩展示等全方位功能支持。

## 🚀 技术架构

### 前端技术
- **React 18** - 现代化UI框架，支持并发特性
- **TypeScript** - 类型安全的JavaScript，提升代码质量
- **React Router v6** - 声明式路由管理
- **React Hooks** - 函数式组件状态管理
- **CSS3** - 现代化样式系统

### 后端服务
- **Node.js + Express** - 轻量级RESTful API服务
- **CORS** - 跨域资源共享支持
- **Body Parser** - 请求体解析中间件

### 开发工具
- **Concurrently** - 前后端并行开发
- **XLSX** - Excel数据导入导出支持
- **React Scripts** - 官方构建工具链

## 📁 项目结构

```
2025SportsMeetingWeb/
├── public/                    # 静态资源
│   └── data/                 # JSON数据文件
│       ├── sports_data.json  # 赛事主数据
│       └── sports_data_backup.json # 数据备份
├── src/                      # 源代码目录
│   ├── components/          # 可复用组件
│   │   └── common/        # 通用基础组件
│   ├── contexts/          # React Context状态管理
│   ├── hooks/             # 自定义Hooks
│   ├── pages/             # 页面级组件
│   │   ├── DataEditorPage/   # 数据编辑器
│   │   ├── GameListPage/     # 赛程列表页
│   │   ├── GamePage/         # 赛事详情页
│   │   └── PlayerEditorPage/ # 运动员编辑器
│   ├── services/          # API服务层
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数库
│   │   ├── constants/     # 常量配置
│   │   └── helpers/       # 辅助函数
│   ├── App.tsx            # 主应用组件
│   └── index.tsx          # 应用入口
├── server.js              # Express服务器
└── package.json           # 项目依赖配置
```

## ✨ 核心功能特性

### 🏆 赛程管理
- **📅 多日期赛程展示** - 支持第一天、第二天等多日赛程
- **🏃‍♀️ 径赛/田赛分类** - 智能区分径赛和田赛项目
- **⏰ 时间段分组** - 上午/下午赛程自动分组
- **🔍 实时搜索过滤** - 支持按项目名称、年级、时间搜索

### 👥 运动员管理
- **📋 运动员信息展示** - 姓名、班级、道次等详细信息
- **📊 成绩实时更新** - 支持成绩录入和实时显示
- **🎯 项目关联** - 运动员与参赛项目智能关联
- **📱 移动端适配** - 响应式设计，支持手机端查看

### 🛠️ 数据编辑
- **✏️ 可视化数据编辑** - 直观的JSON数据编辑器
- **💾 自动备份机制** - 数据修改前自动创建备份
- **📤 数据导入导出** - 支持Excel格式数据导入
- **🔒 数据验证** - 严格的数据格式验证

### 🎨 用户体验
- **📱 响应式设计** - 完美适配PC、平板、手机
- **⚡ 性能优化** - React.memo、useMemo优化渲染性能
- **🔄 实时更新** - 数据变化即时反映到界面
- **⚠️ 错误处理** - 完善的错误边界和异常处理

## 🚀 快速开始

### 环境要求
- Node.js ≥ 14.0.0
- npm ≥ 6.0.0

### 安装依赖
```bash
npm install
```

### 开发模式启动
```bash
# 同时启动后端API和前端开发服务器
npm run dev
```

### 单独启动服务
```bash
# 只启动后端API服务器 (端口: 3001)
npm run server

# 只启动前端开发服务器 (端口: 3000)
npm run frontend
```

### 生产环境构建
```bash
# 构建优化后的生产版本
npm run build
```

## 📊 数据结构设计

### 赛事数据格式
```json
{
  "games": {
    "第一天": [
      // 上午径赛
      [
        {
          "grade": "高一",
          "name": "高一男子组-100米-预赛",
          "time": "09:30"
        }
      ],
      // 下午径赛
      [
        {
          "grade": "高一", 
          "name": "高一男子组-100米-决赛",
          "time": "14:30"
        }
      ],
      // 上午田赛
      [
        {
          "grade": "高一",
          "name": "高一男子组-跳高-预决赛", 
          "time": "09:30"
        }
      ]
    ]
  }
}
```

### 运动员数据格式
```json
{
  "players": {
    "高一男子组-100米-预赛": {
      "name": "高一男子组-100米-预赛",
      "players": [
        [
          {
            "road": "1",
            "name": "张三",
            "class": "高一(1)班",
            "data": "11.2"
          }
        ]
      ]
    }
  }
}
```

## 🔧 API接口文档

### 数据获取接口
- **GET** `/api/health` - 健康检查
- **GET** `/api/data` - 获取完整赛事数据

### 数据更新接口  
- **POST** `/api/data` - 更新赛事数据（自动备份）

### 静态资源服务
- **GET** `/data/*` - 提供数据文件下载服务

## 🧪 开发规范

### 代码规范
- ✅ 使用TypeScript进行严格的类型检查
- ✅ 遵循React Hooks最佳实践
- ✅ 组件化设计，提高代码复用性
- ✅ 使用ESLint进行代码质量检查

### 性能优化
- 🚀 使用React.memo防止不必要的重渲染
- 🚀 使用useMemo缓存复杂计算结果
- 🚀 使用useCallback优化事件处理函数
- 🚀 实现图片懒加载和代码分割

### 错误处理
- 🛡️ 完善的错误边界(Error Boundary)
- 🛡️ API请求异常处理
- 🛡️ 数据格式验证和容错处理
- 🛡️ 用户友好的错误提示

## 🌐 浏览器兼容性

- ✅ Chrome 90+ (推荐)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端浏览器 (iOS Safari, Chrome Mobile)

## 🤝 贡献指南

1. **Fork** 项目到个人仓库
2. **创建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交代码** (`git commit -m 'Add some amazing feature'`)
4. **推送到分支** (`git push origin feature/amazing-feature`)
5. **创建 Pull Request**

### 代码要求
- 使用TypeScript编写所有新代码
- 遵循现有的代码风格和命名规范
- 为新功能添加适当的类型定义
- 编写清晰的提交信息
- 更新相关文档

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布

## 🆘 技术支持

如遇到问题或需要帮助，请通过以下方式联系：
- 📧 邮箱支持
- 💬 提交Issue
- 📞 技术热线

---

**🏃‍♂️ 让每一场比赛都精彩纷呈！** 
*福州八中第56届田径运动会赛事综合管理平台*