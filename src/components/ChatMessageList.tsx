'use client';

import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { ChatMessage } from '../hooks/useChatStream';

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const MessageRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const m = messages[index];
    return (
      <div style={style} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
        <strong>{m.role === 'user' ? 'User:' : 'AI:'}</strong> {m.content}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md mb-4" style={{ height: '400px' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={messages.length}
            itemSize={50} // Adjust based on average message height
            width={width}
          >
            {MessageRow}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
