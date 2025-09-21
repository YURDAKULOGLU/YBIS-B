import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyntaxHighlighterProps } from 'react-native-syntax-highlighter';

interface MarkdownProps {
  children: string;
  color?: string;
}

// Simplified markdown renderer - in production, use react-native-markdown-display
const Markdown: React.FC<MarkdownProps> = ({ children, color = '#000' }) => {
  // Basic code fence detection
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(children)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = children.slice(lastIndex, match.index);
      parts.push(
        <Text key={`text-${lastIndex}`} style={[styles.text, { color }]}>
          {textBefore}
        </Text>
      );
    }

    // Add code block
    const language = match[1] || 'text';
    const code = match[2];
    parts.push(
      <View key={`code-${match.index}`} style={styles.codeBlock}>
        <Text style={styles.codeText}>{code}</Text>
      </View>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < children.length) {
    const remainingText = children.slice(lastIndex);
    parts.push(
      <Text key={`text-${lastIndex}`} style={[styles.text, { color }]}>
        {remainingText}
      </Text>
    );
  }

  return <View style={styles.container}>{parts}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
  },
});

export default Markdown;