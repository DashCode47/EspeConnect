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
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { profileService, UserProfile } from '../services/profile.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../config/colors';
import { globalStyles } from '../config/globalStyles';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

interface RecentActivity {
  id: string;
  type: 'marketplace' | 'connection' | 'comment';
  title: string;
  subtitle: string;
  timeAgo: string;
  icon: string;
  iconColor: string;
}

// Mock data for recent activity
const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'marketplace',
    title: 'Publicaste en Marketplace: Libro de Cálculo',
    subtitle: 'hace 2 horas',
    timeAgo: '2 horas',
    icon: 'storefront',
    iconColor: colors.primary,
  },
  {
    id: '2',
    type: 'connection',
    title: 'Nueva conexión en Modo Fiesta con Mateo Pérez',
    subtitle: 'hace 1 día',
    timeAgo: '1 día',
    icon: 'account-group',
    iconColor: colors.secondary,
  },
  {
    id: '3',
    type: 'comment',
    title: 'Comentaste en una publicación del foro de IA',
    subtitle: 'hace 3 días',
    timeAgo: '3 días',
    icon: 'forum',
    iconColor: colors.primary,
  },
];

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    career: '',
    bio: '',
    interests: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');

  // Ocultar el navbar en esta pantalla
  // useHideNavbar(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.status === 'success') {
        setProfile(response.data.user);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditFormData({
        name: profile.name,
        career: profile.career,
        bio: profile.bio || '',
        interests: [...profile.interests],
      });
      setIsEditModalVisible(true);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      const updateData: Partial<UserProfile> = {
        name: editFormData.name,
        career: editFormData.career,
        bio: editFormData.bio || null,
        interests: editFormData.interests,
      };

      const response = await profileService.updateProfile(updateData);
      
      if (response.status === 'success') {
        setProfile(response.data.user);
        setIsEditModalVisible(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAvatar = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 512,
        maxHeight: 512,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel || !response.assets?.[0]) {
          return;
        }

        try {
          setIsSaving(true);
          const imageUri = response.assets[0].uri;
          if (imageUri) {
            await profileService.updateAvatar(imageUri);
            // Refresh profile to get updated avatar URL
            await fetchProfile();
            Alert.alert('Éxito', 'Avatar actualizado correctamente');
          }
        } catch (err: any) {
          console.error('Error updating avatar:', err);
          Alert.alert('Error', 'No se pudo actualizar el avatar');
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const addInterest = () => {
    if (newInterest.trim() && !editFormData.interests.includes(newInterest.trim())) {
      setEditFormData({
        ...editFormData,
        interests: [...editFormData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditFormData({
      ...editFormData,
      interests: editFormData.interests.filter(i => i !== interest),
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity> */}
        
        <Text style={styles.headerTitle}>Perfil</Text>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
        >
          <MaterialCommunityIcons name="pencil" size={18} color={colors.white} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleSelectAvatar}
            disabled={isSaving}
          >
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={128}
                  color={colors.primary}
                />
              </View>
            )}
            <View style={styles.avatarEditOverlay}>
              <MaterialCommunityIcons name="camera" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileCareer}>{profile.career}</Text>
          </View>
        </View>

        {/* Bio Section */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Interests Section */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis Intereses</Text>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest, index) => {
                const isPrimary = index % 2 === 0;
                return (
                  <View
                    key={index}
                    style={[
                      styles.interestTag,
                      isPrimary
                        ? styles.interestTagPrimary
                        : styles.interestTagSecondary,
                    ]}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        isPrimary
                          ? styles.interestTextPrimary
                          : styles.interestTextSecondary,
                      ]}
                    >
                      {interest}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityContainer}>
            {mockRecentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIconContainer,
                    {
                      backgroundColor:
                        activity.iconColor === colors.primary
                          ? `${colors.primary}1A`
                          : `${colors.secondary}1A`,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={activity.icon as any}
                    size={24}
                    color={activity.iconColor}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre</Text>
                <RNTextInput
                  style={styles.input}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Nombre completo"
                />
              </View>

              {/* Career */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Carrera</Text>
                <RNTextInput
                  style={styles.input}
                  value={editFormData.career}
                  onChangeText={(text) => setEditFormData({ ...editFormData, career: text })}
                  placeholder="Carrera"
                />
              </View>

              {/* Bio */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Biografía</Text>
                <RNTextInput
                  style={[styles.input, styles.textArea]}
                  value={editFormData.bio}
                  onChangeText={(text) => setEditFormData({ ...editFormData, bio: text })}
                  placeholder="Cuéntanos sobre ti..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Interests */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Intereses</Text>
                <View style={styles.interestsInputContainer}>
                  <RNTextInput
                    style={[styles.input, styles.interestInput]}
                    value={newInterest}
                    onChangeText={setNewInterest}
                    placeholder="Agregar interés"
                    onSubmitEditing={addInterest}
                  />
                  <TouchableOpacity
                    style={styles.addInterestButton}
                    onPress={addInterest}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                  </TouchableOpacity>
                </View>
                <View style={styles.interestsTagsContainer}>
                  {editFormData.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTagEdit}>
                      <Text style={styles.interestTagText}>{interest}</Text>
                      <TouchableOpacity
                        onPress={() => removeInterest(interest)}
                        style={styles.removeInterestButton}
                      >
                        <MaterialCommunityIcons name="close" size={16} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color={colors.white} />
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFFE6', // 90% opacity
    paddingLeft: 110,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: `${colors.primary}80`, // 50% opacity
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  profileCareer: {
    fontSize: 16,
    color: '#888888',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#888888',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestTag: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestTagPrimary: {
    backgroundColor: `${colors.primary}1A`, // 10% opacity
  },
  interestTagSecondary: {
    backgroundColor: `${colors.secondary}1A`, // 10% opacity
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
  },
  interestTextPrimary: {
    color: colors.primary,
  },
  interestTextSecondary: {
    color: colors.secondary,
  },
  activityContainer: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#888888',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
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
    maxHeight: '90%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  interestsInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  interestInput: {
    flex: 1,
  },
  addInterestButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTagEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  interestTagText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  removeInterestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
