import { useState, useRef, useEffect } from 'react';
import { Layout, theme, message as antMessage } from 'antd';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import type { Conversation, Message } from './types/index';
import { chatApi } from './services/api';
import './index.css';

const { Content } = Layout;

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: '欢迎使用 AI Agent',
      lastMessage: '你好，我是你的 AI 助手，有什么可以帮助你的吗？',
      timestamp: Date.now(),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好，我是你的 AI 助手，有什么可以帮助你的吗？',
      timestamp: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 存储所有对话的消息历史 (conversationId -> Message[])
  const messagesMapRef = useRef<Map<string, Message[]>>(new Map([
    ['1', [
      {
        id: '1',
        role: 'assistant',
        content: '你好，我是你的 AI 助手，有什么可以帮助你的吗？',
        timestamp: Date.now(),
      },
    ]]
  ]));

  const {
    token: { colorBgContainer, colorBgLayout },
  } = theme.useToken();

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 当消息变化时，保存到对应对话的存储中
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      messagesMapRef.current.set(currentConversationId, messages);
    }
  }, [messages, currentConversationId]);

  // 创建新对话
  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: '新对话',
      lastMessage: '',
      timestamp: Date.now(),
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newId);
    setMessages([]);
    // 初始化空的消息数组
    messagesMapRef.current.set(newId, []);
  };

  // 删除对话
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newConversations = conversations.filter((c) => c.id !== id);
    setConversations(newConversations);
    // 删除对应的消息记录
    messagesMapRef.current.delete(id);
    if (currentConversationId === id && newConversations.length > 0) {
      const nextId = newConversations[0].id;
      setCurrentConversationId(nextId);
      // 加载切换后对话的消息
      const savedMessages = messagesMapRef.current.get(nextId) || [];
      setMessages(savedMessages);
    } else if (newConversations.length === 0) {
      setCurrentConversationId('');
      setMessages([]);
    }
  };

  // 选择对话
  const selectConversation = (id: string) => {
    // 先保存当前对话的消息
    messagesMapRef.current.set(currentConversationId, messages);
    // 切换到新对话
    setCurrentConversationId(id);
    // 加载目标对话的消息
    const savedMessages = messagesMapRef.current.get(id) || [];
    setMessages(savedMessages);
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // 更新对话列表
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, lastMessage: content, timestamp: Date.now() }
          : conv
      )
    );

    // 创建 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    // 使用 API 服务发送流式消息
    let accumulatedContent = '';

    try {
      await chatApi.sendMessageStream(
      content,
      currentConversationId,
      // onChunk
      (chunk: string) => {
        accumulatedContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      },
      // onComplete
      () => {
        setLoading(false);
        // 保存最终消息到存储
        messagesMapRef.current.set(currentConversationId, messages);
      },
      // onError
      (error: Error) => {
        console.error('发送消息失败:', error);
        const errorMsg = error.message?.includes('系统忙')
          ? '系统忙，稍后再试'
          : error.message || '抱歉，发生了错误，请稍后重试。';
        antMessage.error(errorMsg);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: errorMsg }
              : msg
          )
        );
        // 确保关闭loading状态
        setLoading(false);
      }
    );
    } catch (error) {
      // 捕获任何未处理的异常
      console.error('发送消息异常:', error);
      antMessage.error('系统忙，稍后再试');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: '系统忙，稍后再试' }
            : msg
        )
      );
      setLoading(false);
    }
  };

  return (
    <Layout className="h-screen overflow-hidden" style={{ background: colorBgLayout }}>
      <Sidebar
        conversations={conversations}
        currentId={currentConversationId}
        onCreateNew={createNewConversation}
        onSelect={selectConversation}
        onDelete={deleteConversation}
      />
      <Layout className="flex flex-col" style={{ background: colorBgContainer }}>
        <Content className="flex-1 overflow-hidden flex flex-col">
          <ChatArea
            messages={messages}
            loading={loading}
            messagesEndRef={messagesEndRef}
          />
          <InputArea onSend={sendMessage} loading={loading} />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
