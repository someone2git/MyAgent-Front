import { useState, useRef, useEffect } from 'react';
import { Input, Button, Space, Upload, message as antMessage } from 'antd';
import {
  SendOutlined,
  PaperClipOutlined,
  PictureOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface InputAreaProps {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function InputArea({ onSend, loading }: InputAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<any>(null);

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current.resizableTextArea.textArea;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.resizableTextArea.textArea.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (info: any) => {
    if (info.file.status === 'done') {
      antMessage.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      antMessage.error(`${info.file.name} 上传失败`);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="relative rounded-2xl border border-gray-300 bg-white shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        >
          {/* 输入框 */}
          <TextArea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，按 Enter 发送，Shift + Enter 换行..."
            autoSize={{ minRows: 1, maxRows: 6 }}
            bordered={false}
            className="py-3 px-4 text-base resize-none"
            style={{
              background: 'transparent',
            }}
            disabled={loading}
          />

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between px-3 py-2">
            <Space>
              {/* 附件上传 */}
              <Upload
                accept=".pdf,.doc,.docx,.txt,.md"
                showUploadList={false}
                onChange={handleFileUpload}
                customRequest={({ onSuccess }) => {
                  setTimeout(() => onSuccess?.('ok'), 0);
                }}
              >
                <Button
                  type="text"
                  icon={<PaperClipOutlined />}
                  className="text-gray-500 hover:text-gray-700"
                  size="small"
                >
                  附件
                </Button>
              </Upload>

              {/* 图片上传 */}
              <Upload
                accept="image/*"
                showUploadList={false}
                onChange={handleFileUpload}
                customRequest={({ onSuccess }) => {
                  setTimeout(() => onSuccess?.('ok'), 0);
                }}
              >
                <Button
                  type="text"
                  icon={<PictureOutlined />}
                  className="text-gray-500 hover:text-gray-700"
                  size="small"
                >
                  图片
                </Button>
              </Upload>
            </Space>

            {/* 发送按钮 */}
            <Button
              type="primary"
              icon={loading ? <LoadingOutlined /> : <SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="rounded-lg"
              style={{
                background: input.trim() && !loading ? '#10a37f' : '#d9d9d9',
                borderColor: input.trim() && !loading ? '#10a37f' : '#d9d9d9',
              }}
            >
              {loading ? '发送中' : '发送'}
            </Button>
          </div>
        </div>

        {/* 提示文字 */}
        <div className="text-center mt-2 text-xs text-gray-400">
          AI 生成的内容可能存在错误，请仔细核对重要信息
        </div>
      </div>
    </div>
  );
}
