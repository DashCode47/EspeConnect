import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { AuthStackParamList } from '../../../../navigation/types';
import { colors } from '../../../../config/colors';
import { HorizontalIcon } from '../../../../assets/svg/HorizontalIcon';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    setError(null);
    try {
      await forgotPassword(trimmed);
      navigation.navigate('VerifyOtp', { email: trimmed });
    } catch (e: any) {
      setError(e.message || 'Error al enviar el correo');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 15, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <HorizontalIcon width={140} height={28} />
          </View>

          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="lock-reset" size={42} color={colors.primary} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo y te enviaremos un código para restablecerla.
            </Text>
          </View>

          <View style={[styles.inputContainer, !!error && styles.inputError]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={error ? colors.error : '#999'}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={t => { setEmail(t); setError(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoFocus
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backLinkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    padding: 8,
  },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  titleContainer: { marginBottom: 32, alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: { borderColor: colors.error, backgroundColor: '#FFF5F5' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.primaryDark, padding: 0 },
  errorText: { fontSize: 13, color: colors.error, marginBottom: 16, marginLeft: 4 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: { fontSize: 14, fontWeight: '500', color: colors.primary },
});
