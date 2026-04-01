# AI Agent Web

一个现代化的 AI 对话界面，参考 ChatGPT/Claude 等主流 AI 产品设计。

## 功能特性

- **对话管理**：左侧边栏管理历史对话，支持新建、删除、切换
- **流式输出**：实时显示 AI 回复内容
- **Markdown 支持**：支持代码高亮、列表、表格等富文本格式
- **快捷操作**：复制消息、重新生成
- **文件上传**：支持附件和图片上传（预留接口）

## 技术栈

- React 18 + TypeScript
- Vite 构建工具
- Ant Design 组件库
- Tailwind CSS 原子样式
- React Markdown 渲染

## 项目结构

```
src/
├── components/
│   ├── Sidebar.tsx      # 左侧对话列表
│   ├── ChatArea.tsx     # 中间聊天区域
│   └── InputArea.tsx    # 底部输入框
├── services/
│   └── api.ts           # API 接口封装
├── types.ts             # TypeScript 类型定义
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口
```

## 接口说明

### 智能对话
- **接口**: `POST /agent/chat/stream`
- **请求体**:
  ```json
  {
    "message": "用户输入",
    "conversationId": "对话ID"
  }
  ```
- **响应**: SSE 流式返回
  ```
  data: {"content": "回复内容片段"}
  data: [DONE]
  ```

### 预留接口（未来扩展）
- `GET /agent/conversations` - 获取对话列表
- `GET /agent/conversations/{id}/messages` - 获取对话消息
- `POST /agent/rag/query` - RAG 知识库查询
- `POST /agent/ppt/generate` - PPT 生成

## 开发运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 代理配置

开发服务器已配置代理，将 `/agent` 请求转发到 `http://localhost:8080`，可在 `vite.config.ts` 中修改后端地址。

## 界面预览

- **左侧边栏**：白色背景，显示对话历史，支持新建/删除对话
- **中间区域**：白色背景，显示消息列表，支持 Markdown 渲染
- **底部输入框**：圆角设计，支持多行文本、Enter 发送、Shift+Enter 换行
