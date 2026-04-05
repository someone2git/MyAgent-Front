import axios, { type AxiosResponse } from 'axios';
import type { Conversation, Message } from '../types/index';

const api = axios.create({
  baseURL: '/agent',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 对话相关接口
export const chatApi = {
  // 发送流式消息 (GET + URL参数)
  async sendMessageStream(
    message: string,
    conversationId: string,
    externalSignal: AbortSignal,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    // 创建 AbortController 用于超时控制 (10秒)
    const controller = new AbortController();
    let isUserCancelled = false; // 标记是否用户主动取消
    let timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10秒超时

    // 监听外部取消信号
    externalSignal.addEventListener('abort', () => {
      isUserCancelled = true; // 标记为用户主动取消
      clearTimeout(timeoutId);
      controller.abort();
    });

    try {
      // 构建 URL 查询参数
      const params = new URLSearchParams({
        query: message,
        conversationId,
      });
      const url = `/agent/chat/stream?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 检查HTTP错误状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        // 每次收到数据，重置超时计时器 (10秒)
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000);

        const chunk = decoder.decode(value, { stream: true });
        // 后端返回的是直接 JSON 流，不是 SSE 格式
        // 每行是一个独立的 JSON 对象: {"type":"text","content":"..."}
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            // 只处理 type 为 text 的数据
            if (parsed.type === 'text' && parsed.content !== undefined) {
              onChunk(parsed.content);
            }
            // type 为 recommend 的数据可以忽略或单独处理
          } catch (e) {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // 判断是否为 AbortError
      if (error instanceof Error && error.name === 'AbortError') {
        // 区分用户主动取消和超时
        if (isUserCancelled) {
          // 用户主动取消，静默处理
          onComplete();
        } else {
          // 超时导致的取消
          onError(new Error('系统忙，稍后再试'));
        }
      } else {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  },

  // 获取对话列表
  async getConversations(): Promise<Conversation[]> {
    const response: AxiosResponse<Conversation[]> = await api.get('/conversations');
    return response.data;
  },

  // 获取对话消息
  async getMessages(conversationId: string): Promise<Message[]> {
    const response: AxiosResponse<Message[]> = await api.get(
      `/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  // 创建新对话
  async createConversation(): Promise<Conversation> {
    const response: AxiosResponse<Conversation> = await api.post('/conversations');
    return response.data;
  },

  // 删除对话
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}`);
  },

  // 未来扩展：RAG 功能
  async queryRag(query: string, documentIds?: string[]) {
    const response = await api.post('/rag/query', { query, documentIds });
    return response.data;
  },

  // 未来扩展：PPT 生成功能
  async generatePpt(topic: string, outline?: string[]) {
    const response = await api.post('/ppt/generate', { topic, outline });
    return response.data;
  },

  // 停止生成
  async stopGeneration(conversationId: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await api.get('/stop', {
      params: { conversationId },
    });
    return response.data;
  },
};

export default api;
