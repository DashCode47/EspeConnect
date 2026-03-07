import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Dimensions,
  Pressable,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../config/colors';
import { useAuth } from '../contexts/AuthContext';
import { useAuthStore } from '../features/auth/presentation/store/auth.store';
import { CareerName, CAREER_LIST } from '../types/career.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// New Theme Colors
const THEME = {
  primary: '#105b32',
  accent: '#F7B634',
  bgLight: '#f6f8f7',
  surface: '#ffffff',
  textMain: '#0f172a',
  textMuted: '#64748b',
};

const INTEREST_ICONS: Record<string, string> = {
  'Música': 'music-note',
  'Videojuegos': 'controller-classic-outline',
  'Deportes': 'soccer',
  'Cine': 'movie-open-outline',
  'Tecnología': 'laptop',
  'Conocer gente': 'account-group-outline',
  'Fiestas': 'glass-cocktail',
  'Gimnasio': 'dumbbell',
  'Comida': 'food-variant',
  'Robótica': 'robot-outline',
  'Arte': 'palette-outline',
  'Lectura': 'book-open-variant',
  'Fotografía': 'camera-outline',
  'Viajes': 'airplane',
  'Emprendimiento': 'lightbulb-outline',
  'Voluntariado': 'hand-heart-outline',
};

const DEFAULT_INTERESTS = [
  'Música', 'Videojuegos', 'Deportes', 'Cine',
  'Tecnología', 'Conocer gente', 'Fiestas', 'Gimnasio',
  'Comida', 'Robótica', 'Arte', 'Lectura',
  'Fotografía', 'Viajes', 'Emprendimiento', 'Voluntariado'
];


export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { user: profile, isLoading, fetchCurrentUser: fetchProfile, updateProfile } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCareerPicker, setShowCareerPicker] = useState(false);
  const [careerSearch, setCareerSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);

  useEffect(() => {
    console.log(profile);
    if (!profile) {
      fetchProfile();
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  const handleEditOpen = () => {
    if (profile) {
      setEditName(profile.name || '');
      setEditCareer(profile.career || '');
      setEditGender(profile.gender || '');
      setEditInterests(profile.interests || []);
      setShowEditModal(true);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        name: editName,
        career: editCareer,
        gender: editGender,
        interests: editInterests,
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setEditInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const currentAvailableInterests = Array.from(new Set([...DEFAULT_INTERESTS, ...editInterests]));


  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <View style={styles.dottedPattern} />

        <View style={styles.topRightBlob} />
        <View style={styles.middleLeftBlob} />
        <View style={styles.bottomRightBlob} />

        <MaterialCommunityIcons
          name="star-outline"
          size={24}
          color={THEME.accent}
          style={[styles.floatingIcon, { top: 120, left: 30, opacity: 0.15 }]}
        />
        <MaterialCommunityIcons
          name="circle-outline"
          size={32}
          color={THEME.primary}
          style={[styles.floatingIcon, { top: 200, right: 40, opacity: 0.1 }]}
        />
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%', paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={THEME.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Nombre Completo</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Tu nombre"
                  placeholderTextColor={THEME.textMuted}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Carrera</Text>
                <TouchableOpacity
                  style={styles.textInput}
                  onPress={() => setShowCareerPicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{
                      fontSize: 16,
                      color: editCareer ? THEME.textMain : THEME.textMuted
                    }}>
                      {editCareer || 'Seleccionar carrera'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={THEME.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Género</Text>
                <View style={styles.chipRow}>
                  {['Masculino', 'Femenino', 'Otro'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderChip, editGender === g && styles.genderChipActive]}
                      onPress={() => setEditGender(g)}
                    >
                      <Text style={[styles.genderChipText, editGender === g && styles.genderChipTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Intereses</Text>
                <View style={[styles.interestsWrap, { marginTop: 8 }]}>
                  {currentAvailableInterests.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.interestTag,
                        editInterests.includes(interest) && styles.interestTagActive
                      ]}
                      onPress={() => toggleInterest(interest)}
                    >
                      <MaterialCommunityIcons
                        name={(INTEREST_ICONS[interest] || 'tag-outline') as any}
                        size={18}
                        color={editInterests.includes(interest) ? THEME.accent : THEME.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[
                        styles.interestText,
                        editInterests.includes(interest) && { color: THEME.accent }
                      ]}>
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalButtons, { marginTop: 24 }]}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: THEME.primary }]}
                onPress={handleUpdateProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Career Selection Modal */}
      <Modal
        visible={showCareerPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCareerPicker(false);
          setCareerSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%', paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Carrera</Text>
              <TouchableOpacity onPress={() => {
                setShowCareerPicker(false);
                setCareerSearch('');
              }}>
                <MaterialCommunityIcons name="close" size={24} color={THEME.textMain} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.formSection, { marginBottom: 15 }]}>
              <View style={[styles.textInput, { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC' }]}>
                <MaterialCommunityIcons name="magnify" size={20} color={THEME.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 16, color: THEME.textMain, padding: 0 }}
                  placeholder="Buscar carrera..."
                  placeholderTextColor={THEME.textMuted}
                  value={careerSearch}
                  onChangeText={setCareerSearch}
                  autoCorrect={false}
                />
                {careerSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCareerSearch('')}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={THEME.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {CAREER_LIST
                .filter(c => c.toLowerCase().includes(careerSearch.toLowerCase()))
                .map((career) => (
                  <TouchableOpacity
                    key={career}
                    style={styles.modalOption}
                    onPress={() => {
                      setEditCareer(career);
                      setShowCareerPicker(false);
                      setCareerSearch('');
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      editCareer === career && { color: THEME.primary, fontWeight: '700' }
                    ]}>
                      {career}
                    </Text>
                    {editCareer === career && (
                      <MaterialCommunityIcons name="check" size={24} color={THEME.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              {CAREER_LIST.filter(c => c.toLowerCase().includes(careerSearch.toLowerCase())).length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: THEME.textMuted }}>No se encontraron carreras</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.safeArea}>
        {/* Header Nav */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={THEME.primary} />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Mi Perfil</Text>

          <TouchableOpacity
            style={[styles.navButton, styles.editButton]}
            onPress={handleEditOpen}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pencil" size={20} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBlob}>
                <View style={styles.avatarContainer}>
                  {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialCommunityIcons name="account" size={64} color="#CBD5E1" />
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.statusIndicator} />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile.name}</Text>
              <View style={styles.careerBadge}>
                <MaterialCommunityIcons name="school-outline" size={16} color={THEME.primary} />
                <Text style={styles.careerBadgeText}>
                  {profile.career || 'Estudiante'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          {/* <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Reputación</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Ventas</Text>
            </View>
          </View> */}

          {/* Personal Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Datos Personales</Text>
            </View>

            <View style={styles.dataList}>
              <View style={styles.dataItem}>
                <View style={[styles.dataIconContainer, { backgroundColor: '#eff6ff' }]}>
                  <MaterialCommunityIcons name="email-outline" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.dataLabel}>Correo Institucional</Text>
                  <Text style={styles.dataValue}>{profile.email || 'correo@espe.edu.ec'}</Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <View style={[styles.dataIconContainer, { backgroundColor: '#fdf2f8' }]}>
                  <MaterialCommunityIcons name="gender-female" size={24} color="#db2777" />
                </View>
                <View>
                  <Text style={styles.dataLabel}>Género</Text>
                  <Text style={styles.dataValue}>{profile.gender || 'No especificado'}</Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <View style={[styles.dataIconContainer, { backgroundColor: '#fffbeb' }]}>
                  <MaterialCommunityIcons name="cake-variant-outline" size={24} color="#d97706" />
                </View>
                <View>
                  <Text style={styles.dataLabel}>Antigüedad</Text>
                  <Text style={styles.dataValue}>Miembro desde Enero 2024</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Mis Intereses</Text>
            </View>

            <View style={styles.interestsWrap}>
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest, idx) => (
                  <View key={idx} style={[styles.interestTag, idx === 1 && styles.interestTagActive]}>
                    <MaterialCommunityIcons
                      name={(INTEREST_ICONS[interest] || 'tag-outline') as any}
                      size={18}
                      color={idx === 1 ? THEME.accent : THEME.primary}
                    />
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.textMuted, { fontSize: 14, fontStyle: 'italic' }]}>
                  No has seleccionado intereses todavía.
                </Text>
              )}
              <TouchableOpacity style={styles.addInterestButton} onPress={handleEditOpen}>
                <MaterialCommunityIcons name="plus" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer actions */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cerrar Sesión</Text>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={THEME.textMain} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Volver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.modalConfirmButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgLight,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bgLight,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: THEME.bgLight,
  },
  dottedPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    // Note: In a real app we might use a small repeating image, 
    // but for now we'll simulate the "doodle" feel with blobs.
  },
  topRightBlob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME.accent,
    opacity: 0.1,
  },
  middleLeftBlob: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.primary,
    opacity: 0.05,
  },
  bottomRightBlob: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: THEME.accent,
    opacity: 0.08,
  },
  floatingIcon: {
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  editButton: {
    backgroundColor: 'rgba(247, 182, 52, 0.2)', // accent-yellow 20%
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarBlob: {
    width: 140,
    height: 140,
    backgroundColor: THEME.primary,
    // Approximate the "rounded-blob" look
    borderTopLeftRadius: 65,
    borderTopRightRadius: 75,
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 70,
    borderBottomLeftRadius: 52,
    borderBottomRightRadius: 65,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: THEME.surface,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: THEME.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.textMain,
    letterSpacing: -0.5,
  },
  careerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 91, 50, 0.1)', // primary 10%
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  careerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    backgroundColor: THEME.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textMain,
  },
  dataList: {
    gap: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  dataIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textMain,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: 'rgba(16, 91, 50, 0.1)',
    gap: 8,
  },
  interestTagActive: {
    borderColor: THEME.accent,
    backgroundColor: 'rgba(247, 182, 52, 0.05)',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textMain,
  },
  addInterestButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  textMuted: {
    color: THEME.textMuted,
  },
  // Modal Styles Redesign
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textMain,
  },
  modalMessage: {
    fontSize: 16,
    color: THEME.textMuted,
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  // Form Styles
  formSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: THEME.textMain,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  genderChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderChipActive: {
    backgroundColor: 'rgba(16, 91, 50, 0.1)',
    borderColor: THEME.primary,
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  genderChipTextActive: {
    color: THEME.primary,
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
    color: THEME.textMain,
  },
});
