import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MessageBubble } from '../components/chat/MessageBubble';
import { MessageComposer } from '../components/chat/MessageComposer';
import { useChatStore, ChatMessage } from '../stores/chatStore';

const EMPTY_STATE = {
  title: 'Start a conversation',
  body: 'Ask a question, share context or paste content. The assistant will reply in seconds.',
};

export const ChatScreen: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChatStore();

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble
      message={item}
      isOwn={item.isOwn}
      onPress={() => undefined}
      onLongPress={() => undefined}
    />
  ), []);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const handleSendMessage = useCallback((content: string) => {
    sendMessage(content);
  }, [sendMessage]);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  return (
    <View style={styles.container}>
      {hasMessages ? (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          inverted
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{EMPTY_STATE.title}</Text>
          <Text style={styles.emptyBody}>{EMPTY_STATE.body}</Text>
        </View>
      )}

      <MessageComposer
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#E0E7FF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyBody: {
    color: '#CBD5F5',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
