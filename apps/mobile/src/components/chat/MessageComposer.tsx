import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  placeholder = 'Mesajınızı yazın...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleAttachment = () => {
    Alert.alert('Eklenti', 'Eklenti özelliği yakında gelecek!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={handleAttachment}
      >
        <Icon name="attach-file" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        multiline
        maxLength={1000}
        editable={!disabled}
      />
      
      <TouchableOpacity
        style={[styles.sendButton, (!message.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
      >
        <Icon name="send" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F2F2F7',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
});
