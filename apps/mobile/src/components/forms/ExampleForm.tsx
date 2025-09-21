import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  age: z.number().min(18, 'Yaş en az 18 olmalı'),
  bio: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const ExampleForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      bio: '',
    },
  });

  // useWatch kullanımı - React 19 + RHF 7.5x uyumlu
  const watchedName = useWatch({
    control,
    name: 'name',
  });

  const watchedAge = useWatch({
    control,
    name: 'age',
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      Alert.alert('Başarılı', `Merhaba ${data.name}! Form başarıyla gönderildi.`);
      reset();
    } catch (error) {
      Alert.alert('Hata', 'Form gönderilirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Örnek Form (RN 0.80 + RHF 7.5x)</Text>
      
      {/* Real-time preview */}
      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Canlı Önizleme:</Text>
        <Text>İsim: {watchedName || 'Henüz girilmedi'}</Text>
        <Text>Yaş: {watchedAge}</Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>İsim *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="İsminizi girin"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="age"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Yaş *</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              onChangeText={(text) => onChange(parseInt(text) || 0)}
              value={value.toString()}
              placeholder="18"
              keyboardType="numeric"
            />
            {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Biyografi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Kendiniz hakkında kısa bilgi..."
              multiline
              numberOfLines={4}
            />
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  preview: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
