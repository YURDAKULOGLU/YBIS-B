import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessage } from '../../stores/chatStore';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const containerAlignment = (isOwn: boolean) => (
  isOwn ? styles.ownContainer : styles.otherContainer
);

const bubbleStyle = (isOwn: boolean) => (
  isOwn ? styles.ownBubble : styles.otherBubble
);

const textStyle = (isOwn: boolean) => (
  isOwn ? styles.ownText : styles.otherText
);

const timestampStyle = (isOwn: boolean) => (
  isOwn ? styles.ownTimestamp : styles.otherTimestamp
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
}) => {
  return (
    <View style={[styles.container, containerAlignment(isOwn)]}>
      <View style={[styles.bubble, bubbleStyle(isOwn)]}>
        <Text style={[styles.text, textStyle(isOwn)]}>{message.content}</Text>
        <Text style={[styles.timestamp, timestampStyle(isOwn)]}>
          {new Date(message.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 20,
    width: '100%',
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#1E2B4D',
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownText: {
    color: '#F8FAFC',
  },
  otherText: {
    color: '#E0E7FF',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
  },
  ownTimestamp: {
    color: '#BFDBFE',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#94A3B8',
    textAlign: 'left',
  },
});
