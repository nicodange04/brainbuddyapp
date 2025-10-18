// components/date-input.tsx
import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface DateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

export function DateInput({ value, onChangeText, placeholder = "DD/MM/YYYY", style }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  const formatDateInput = (text: string) => {
    // Remover todo excepto números
    const numbersOnly = text.replace(/\D/g, '');
    
    // Limitar a 8 dígitos (DDMMYYYY)
    const limitedNumbers = numbersOnly.slice(0, 8);
    
    // Formatear con separadores
    let formatted = '';
    if (limitedNumbers.length >= 1) {
      formatted += limitedNumbers.slice(0, 2);
    }
    if (limitedNumbers.length >= 3) {
      formatted += '/' + limitedNumbers.slice(2, 4);
    }
    if (limitedNumbers.length >= 5) {
      formatted += '/' + limitedNumbers.slice(4, 8);
    }
    
    setDisplayValue(formatted);
    onChangeText(formatted);
  };

  return (
    <TextInput
      style={[styles.input, style]}
      value={displayValue}
      onChangeText={formatDateInput}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType="numeric"
      maxLength={10} // DD/MM/YYYY = 10 caracteres
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
});
