import React, { useCallback } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { MessageBubble } from '../src/components/chat/MessageBubble';
import { MessageComposer } from '../src/components/chat/MessageComposer';
import { useChatStore, Message } from '../src/stores/chatStore';

export const Chat: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChatStore();

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isOwn={item.isOwn}
      onPress={() => {
        if (item.status === 'failed') {
          Alert.alert('Mesaj Gonderilemedi', 'Tekrar denemek ister misiniz?');
        }
      }}
      onLongPress={() => {
        Alert.alert('Mesaj Secenekleri', 'Bu mesaj icin ne yapmak istiyorsunuz?');
      }}
    />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const handleSendMessage = useCallback((content: string) => {
    sendMessage(content);
  }, [sendMessage]);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        inverted
      />

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
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 16,
  },
});

export default Chat;
