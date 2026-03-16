import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { AuthStackParamList } from '../../../../navigation/types';
import { colors } from '../../../../config/colors';
import { HorizontalIcon } from '../../../../assets/svg/HorizontalIcon';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

const MIN_LENGTH = 8;

export const ResetPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { resetPassword, isLoading } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (password.length < MIN_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError(null);
    try {
      await resetPassword(password);
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Error al cambiar la contraseña');
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

          <View style={styles.logoContainer}>
            <HorizontalIcon width={140} height={28} />
          </View>

          {done ? (
            /* ── Success ── */
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check-circle-outline" size={52} color={colors.primary} />
              </View>
              <Text style={styles.title}>¡Contraseña actualizada!</Text>
              <Text style={styles.subtitle}>
                Tu contraseña fue cambiada correctamente.{'\n'}Ya puedes iniciar sesión.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Form ── */
            <>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name="lock-check-outline" size={42} color={colors.primary} />
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>Nueva contraseña</Text>
                <Text style={styles.subtitle}>
                  Elige una contraseña segura de al menos {MIN_LENGTH} caracteres.
                </Text>
              </View>

              {/* Password */}
              <View style={[styles.inputContainer, !!error && styles.inputError]}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={error ? colors.error : '#999'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={t => { setPassword(t); setError(null); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm */}
              <View style={[styles.inputContainer, !!error && styles.inputError]}>
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={20}
                  color={error ? colors.error : '#999'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#999"
                  value={confirm}
                  onChangeText={t => { setConfirm(t); setError(null); }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              {/* Strength hint */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        password.length >= i * 3 && styles.strengthBarActive,
                      ]}
                    />
                  ))}
                  <Text style={styles.strengthLabel}>
                    {password.length < 6 ? 'Débil' : password.length < 10 ? 'Moderada' : 'Fuerte'}
                  </Text>
                </View>
              )}

              {error && (
                <View style={styles.errorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={isLoading}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  titleContainer: { marginBottom: 28, alignItems: 'center' },
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: { borderColor: colors.error, backgroundColor: '#FFF5F5' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.primaryDark, padding: 0 },
  eyeIcon: { padding: 4 },

  // Strength bar
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    marginTop: -4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  strengthBarActive: {
    backgroundColor: colors.primary,
  },
  strengthLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
    width: 52,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: colors.error },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white },

  // Success
  successContainer: { alignItems: 'center', paddingHorizontal: 8 },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
});
