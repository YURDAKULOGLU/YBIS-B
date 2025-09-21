import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExampleForm } from '../components/forms/ExampleForm';

const METRICS = [
  { label: 'Active Notes', value: '12' },
  { label: 'AI Chats', value: '37' },
  { label: 'Pending Tasks', value: '5' },
];

const QUICK_ACTIONS = [
  'Capture meeting notes',
  'Ask AI to summarise a mail',
  'Schedule follow-up reminders',
  'Draft a customer reply',
];

export default function DashboardScreen(): React.ReactElement {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome back ??</Text>
        <Text style={styles.subtitle}>All of your workspace insights in one place.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s snapshot</Text>
        <View style={styles.metricRow}>
          {METRICS.map(metric => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.card}>
          {QUICK_ACTIONS.map(action => (
            <Text key={action} style={styles.cardItem}>� {action}</Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Try the form toolkit</Text>
        <View style={styles.card}>
          <ExampleForm />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#111C3D',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5F5',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E7FF',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    marginRight: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1E2B4D',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#60A5FA',
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#CBD5F5',
  },
  card: {
    backgroundColor: '#111C3D',
    borderRadius: 16,
    padding: 18,
  },
  cardItem: {
    color: '#CBD5F5',
    fontSize: 15,
    marginBottom: 8,
  },
});
