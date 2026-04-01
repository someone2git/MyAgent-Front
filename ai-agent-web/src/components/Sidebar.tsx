import { Layout, Button, List, Typography, Popconfirm } from 'antd';
import {
  PlusOutlined,
  MessageOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Conversation } from '../types/index';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  conversations: Conversation[];
  currentId: string;
  onCreateNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function Sidebar({
  conversations,
  currentId,
  onCreateNew,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <Sider
      width={280}
      theme="light"
      className="border-r border-gray-200 flex flex-col bg-white"
    >
      {/* 新建对话按钮 */}
      <div className="p-4">
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={onCreateNew}
          block
          className="text-left flex items-center justify-center border-dashed border-gray-400 text-gray-600 hover:text-gray-900 hover:border-gray-500"
          style={{
            height: '44px',
            borderRadius: '8px',
          }}
        >
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-3">
        <List
          dataSource={conversations}
          renderItem={(item) => (
            <div
              onClick={() => onSelect(item.id)}
              className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer mb-1 transition-all ${
                currentId === item.id
                  ? 'bg-blue-50 border border-blue-100'
                  : 'hover:bg-gray-100'
              }`}
            >
              <MessageOutlined className="text-gray-500 text-sm flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Text
                  ellipsis
                  className="text-gray-800 text-sm block leading-tight font-medium"
                >
                  {item.title}
                </Text>
                {item.lastMessage && (
                  <Text
                    ellipsis
                    className="text-xs block mt-1 text-gray-500"
                  >
                    {item.lastMessage}
                  </Text>
                )}
              </div>
              <Popconfirm
                title="确定删除此对话？"
                onConfirm={(e) => onDelete(item.id, e as any)}
                okText="确定"
                cancelText="取消"
              >
                <DeleteOutlined
                  className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:text-red-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </div>
          )}
        />
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
            AI
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-800 font-medium">AI Agent</div>
            <div className="text-xs text-gray-500">
              智能助手
            </div>
          </div>
        </div>
      </div>
    </Sider>
  );
}
