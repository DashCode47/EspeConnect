import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { AuthStackParamList } from '../../../../navigation/types';
import { colors } from '../../../../config/colors';
import { HorizontalIcon } from '../../../../assets/svg/HorizontalIcon';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
type RouteProps = RouteProp<AuthStackParamList, 'VerifyOtp'>;

const OTP_LENGTH = 8;

export const VerifyOtpScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { email } = route.params;

  const { verifyOtp, forgotPassword, isLoading } = useAuthStore();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    // Accept only digits
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = digits.join('');
    if (token.length < OTP_LENGTH) {
      setError('Ingresa el código completo de 6 dígitos');
      return;
    }
    setError(null);
    try {
      await verifyOtp(email, token);
      navigation.navigate('ResetPassword');
    } catch (e: any) {
      setError(e.message || 'Código inválido. Intenta de nuevo.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setDigits(Array(OTP_LENGTH).fill(''));
    try {
      await forgotPassword(email);
    } catch {
      // silently ignore — the email may still be sent
    } finally {
      setResending(false);
      inputs.current[0]?.focus();
    }
  };

  const filled = digits.filter(Boolean).length;

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
            <MaterialCommunityIcons name="message-lock-outline" size={42} color={colors.primary} />
          </View>

          <Text style={styles.title}>Ingresa el código</Text>
          <Text style={styles.subtitle}>
            Enviamos un código de 6 dígitos a{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { inputs.current[i] = r; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={v => handleChange(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          {error && (
            <View style={styles.errorRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (isLoading || filled < OTP_LENGTH) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading || filled < OTP_LENGTH}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>¿No recibiste el código? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
              <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                {resending ? 'Enviando...' : 'Reenviar'}
              </Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    padding: 8,
  },
  logoContainer: { marginBottom: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
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
    marginBottom: 36,
  },
  emailHighlight: {
    fontWeight: '600',
    color: colors.primaryDark,
  },

  // OTP
  otpRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  otpBox: {
    width: 38,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: { fontSize: 14, color: '#666' },
  resendLink: { fontSize: 14, fontWeight: '600', color: colors.primary },
  resendLinkDisabled: { opacity: 0.5 },
});
