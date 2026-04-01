import { useState } from 'react';
import { Avatar, Typography, Spin, Tooltip } from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  CopyOutlined,
  CheckOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { Message } from '../types/index';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Text } = Typography;

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatArea({ messages, loading, messagesEndRef }: ChatAreaProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const renderMessageContent = (content: string) => {
    if (!content) {
      return <Spin size="small" />;
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <pre>{children}</pre>,
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-red-500" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
            <RobotOutlined className="text-3xl text-white" />
          </div>
          <div className="text-lg font-medium text-gray-600 mb-2">有什么可以帮助你的吗？</div>
          <div className="text-sm">我是你的 AI 助手，可以回答问题、协助写作、编程等任务</div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-8">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`py-6 px-4 sm:px-6 ${
                message.role === 'assistant' ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="max-w-3xl mx-auto flex gap-4">
                {/* 头像 */}
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      className="bg-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <RobotOutlined className="text-white text-sm" />
                    </div>
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-2">
                    {message.role === 'user' ? '你' : 'AI Agent'}
                  </div>
                  <div className="markdown-body text-gray-700 leading-relaxed">
                    {renderMessageContent(message.content)}
                  </div>

                  {/* 操作按钮 */}
                  {message.role === 'assistant' && message.content && (
                    <div className="flex gap-2 mt-3">
                      <Tooltip title="复制">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-500"
                        >
                          {copiedId === message.id ? (
                            <CheckOutlined className="text-green-500" />
                          ) : (
                            <CopyOutlined />
                          )}
                        </button>
                      </Tooltip>
                      <Tooltip title="重新生成">
                        <button className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-500">
                          <ReloadOutlined />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
