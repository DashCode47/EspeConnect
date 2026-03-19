import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/auth.store';
import { AuthStackParamList } from '../../../../navigation/types';
import { colors } from '../../../../config/colors';
import { getAppConfig } from '../../../../services/remoteConfigService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CAREER_LIST } from '../../../../types/career.types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const AVAILABLE_INTERESTS = [
    'Música', 'Videojuegos', 'Deportes', 'Cine',
    'Tecnología', 'Conocer gente', 'Fiestas', 'Gimnasio',
    'Comida', 'Robótica', 'Arte', 'Lectura',
    'Fotografía', 'Viajes', 'Emprendimiento', 'Voluntariado'
];

const GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
];

export const RegisterScreen = () => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [faculty, setFaculty] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showCareerModal, setShowCareerModal] = useState(false);
    const [careerSearch, setCareerSearch] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorTitle, setErrorTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { register, isLoading } = useAuthStore();
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const showError = (title: string, message: string) => {
        setErrorTitle(title);
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else if (interests.length < 5) {
            setInterests([...interests, interest]);
        } else {
            showError('Límite alcanzado', 'Puedes seleccionar hasta 5 intereses');
        }
    };

    const handleRegister = async () => {
        if (!name || !faculty || !email || !password || !confirmPassword || !gender) {
            showError('Campos incompletos', 'Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            showError('Contraseñas distintas', 'Las contraseñas no coinciden');
            return;
        }

        const { allowedEmailDomains } = getAppConfig();
        if (allowedEmailDomains.length > 0) {
            const isAllowed = allowedEmailDomains.some(domain =>
                email.toLowerCase().endsWith(domain.toLowerCase())
            );
            if (!isAllowed) {
                setAllowedDomains(allowedEmailDomains);
                setShowDomainModal(true);
                return;
            }
        }

        if (interests.length === 0) {
            showError('Sin intereses', 'Por favor selecciona al menos un interés');
            return;
        }

        if (!acceptTerms) {
            showError('Términos requeridos', 'Debes aceptar los términos y condiciones');
            return;
        }

        try {
            await register({
                name,
                email,
                password,
                career: faculty,
                gender,
                interests
            });
            setShowSuccessModal(true);
        } catch (error: any) {
            showError('Error al registrarse', error.message || 'Ocurrió un error inesperado');
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.content,
                        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
                    ]}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}>

                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Registrarte</Text>
                        <Text style={styles.subtitle}>Te damos la bienvenida</Text>
                    </View>

                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                            name="account-outline"
                            size={20}
                            color="#999"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Career Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Carrera</Text>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setShowCareerModal(true)}
                            activeOpacity={0.7}>
                            <MaterialCommunityIcons
                                name="school-outline"
                                size={20}
                                color="#999"
                                style={styles.inputIcon}
                            />
                            <Text style={[styles.input, !faculty && styles.placeholder]}>
                                {faculty || 'Seleccionar carrera'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                            name="email-outline"
                            size={20}
                            color="#999"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                            name="lock-outline"
                            size={20}
                            color="#999"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}>
                            <MaterialCommunityIcons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                            name="lock-outline"
                            size={20}
                            color="#999"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar contraseña"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}>
                            <MaterialCommunityIcons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Gender Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Género</Text>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setShowGenderModal(true)}
                            activeOpacity={0.7}>
                            <MaterialCommunityIcons
                                name="gender-male-female"
                                size={20}
                                color="#999"
                                style={styles.inputIcon}
                            />
                            <Text style={[styles.input, !gender && styles.placeholder]}>
                                {gender ? GENDER_OPTIONS.find(g => g.value === gender)?.label : 'Seleccionar género'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Interests Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>
                            Intereses (máximo 5) {interests.length > 0 && `(${interests.length}/5)`}
                        </Text>
                        <View style={styles.interestsContainer}>
                            {AVAILABLE_INTERESTS.map((interest) => {
                                const isSelected = interests.includes(interest);
                                return (
                                    <TouchableOpacity
                                        key={interest}
                                        style={[
                                            styles.interestChip,
                                            isSelected && styles.interestChipSelected,
                                        ]}
                                        onPress={() => toggleInterest(interest)}
                                        activeOpacity={0.7}>
                                        <Text
                                            style={[
                                                styles.interestChipText,
                                                isSelected && styles.interestChipTextSelected,
                                            ]}>
                                            {interest}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Terms and Conditions Checkbox */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            onPress={() => setAcceptTerms(!acceptTerms)}
                            activeOpacity={0.7}>
                            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                                {acceptTerms && (
                                    <MaterialCommunityIcons name="check" size={16} color={colors.white} />
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.checkboxLabel}>
                            Acepto los{' '}
                            <Text
                                style={styles.termsLink}
                                onPress={() => navigation.navigate('WebViewScreen', {
                                    url: 'https://aypaifpbtykozsurpoyq.supabase.co/storage/v1/object/public/docs/terms-and-conditions.html',
                                    title: 'Términos y Condiciones',
                                })}>
                                términos y condiciones
                            </Text>
                            {' '}y la{' '}
                            <Text
                                style={styles.termsLink}
                                onPress={() => navigation.navigate('WebViewScreen', {
                                    url: 'https://aypaifpbtykozsurpoyq.supabase.co/storage/v1/object/public/docs/privacy-policy.html',
                                    title: 'Política de Privacidad',
                                })}>
                                política de privacidad
                            </Text>
                        </Text>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, (isLoading || !acceptTerms) && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading || !acceptTerms}
                        activeOpacity={0.8}>
                        <Text style={styles.registerButtonText}>
                            {isLoading ? 'Registrando...' : 'Registrarse'}
                        </Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.7}>
                            <Text style={styles.loginLink}>Inicia de sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Career Modal */}
            <Modal
                visible={showCareerModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowCareerModal(false);
                    setCareerSearch('');
                }}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '80%', paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Carrera</Text>
                            <TouchableOpacity onPress={() => {
                                setShowCareerModal(false);
                                setCareerSearch('');
                            }}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View style={[styles.inputContainer, { marginBottom: 15, backgroundColor: '#F8FAFC' }]}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Buscar carrera..."
                                placeholderTextColor="#999"
                                value={careerSearch}
                                onChangeText={setCareerSearch}
                                autoCorrect={false}
                            />
                            {careerSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setCareerSearch('')}>
                                    <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {CAREER_LIST
                                .filter(c => c.toLowerCase().includes(careerSearch.toLowerCase()))
                                .map((career) => (
                                    <TouchableOpacity
                                        key={career}
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setFaculty(career);
                                            setShowCareerModal(false);
                                            setCareerSearch('');
                                        }}>
                                        <Text style={[
                                            styles.modalOptionText,
                                            faculty === career && { color: colors.primary, fontWeight: '700' }
                                        ]}>{career}</Text>
                                        {faculty === career && (
                                            <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            {CAREER_LIST.filter(c => c.toLowerCase().includes(careerSearch.toLowerCase())).length === 0 && (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#999' }}>No se encontraron carreras</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Gender Modal */}
            <Modal
                visible={showGenderModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowGenderModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Género</Text>
                            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
                            </TouchableOpacity>
                        </View>
                        {GENDER_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setGender(option.value);
                                    setShowGenderModal(false);
                                }}>
                                <Text style={styles.modalOptionText}>{option.label}</Text>
                                {gender === option.value && (
                                    <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Domain Not Allowed Modal */}
            <Modal
                visible={showDomainModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDomainModal(false)}>
                <View style={styles.successModalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconContainer}>
                            <MaterialCommunityIcons name="email-alert-outline" size={64} color={colors.error} />
                        </View>
                        <Text style={styles.successTitle}>Correo no permitido</Text>
                        <Text style={styles.successMessage}>
                            Solo puedes registrarte con los siguientes dominios:{'\n'}
                            {allowedDomains.join('\n')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.successButton, { backgroundColor: colors.error }]}
                            onPress={() => setShowDomainModal(false)}
                            activeOpacity={0.8}>
                            <Text style={styles.successButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={handleSuccessModalClose}>
                <View style={styles.successModalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconContainer}>
                            <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
                        </View>
                        <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
                        <Text style={styles.successMessage}>
                            Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.
                        </Text>
                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={handleSuccessModalClose}
                            activeOpacity={0.8}>
                            <Text style={styles.successButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Error Modal */}
            <Modal
                visible={showErrorModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowErrorModal(false)}>
                <View style={styles.successModalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.error} />
                        </View>
                        <Text style={styles.successTitle}>{errorTitle}</Text>
                        <Text style={styles.successMessage}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={[styles.successButton, { backgroundColor: colors.error }]}
                            onPress={() => setShowErrorModal(false)}
                            activeOpacity={0.8}>
                            <Text style={styles.successButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    titleContainer: {
        marginBottom: 22,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.primaryDark,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#666',
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.primaryDark,
        padding: 0,
    },
    eyeIcon: {
        padding: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 22,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primaryDark,
        flex: 1,
    },
    termsLink: {
        color: colors.primary,
        fontWeight: '600',
    },
    registerButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primaryDark,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    section: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primaryDark,
        marginBottom: 8,
    },
    placeholder: {
        color: '#999',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    interestChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    interestChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primaryDark,
    },
    interestChipTextSelected: {
        color: colors.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primaryDark,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.primaryDark,
    },
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successModalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primaryDark,
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        fontWeight: '400',
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    successButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
    },
});
