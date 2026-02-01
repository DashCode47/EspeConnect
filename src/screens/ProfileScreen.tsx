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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../config/colors';
import { useAuth } from '../contexts/AuthContext';
import { useUserStore } from '../store/userStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  onPress: () => void;
}

interface StatItem {
  id: string;
  icon: string;
  value: string | number;
  label: string;
  featured?: boolean;
}

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { profile, isLoading, fetchProfile } = useUserStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  const stats: StatItem[] = [
    { id: 'credits', icon: 'school', value: 12, label: 'Créditos' },
    { id: 'savings', icon: 'piggy-bank', value: '450€', label: 'Ahorro', featured: true },
    { id: 'trips', icon: 'car', value: 8, label: 'Viajes' },
  ];

  const menuItems: MenuItem[] = [
    {
      id: 'posts',
      label: 'Mis Publicaciones',
      subtitle: 'Gestiona tus ventas',
      icon: 'storefront',
      iconBgColor: '#E8F5E9',
      iconColor: colors.primary,
      onPress: () => console.log('Navigate to My Posts'),
    },
    {
      id: 'trips',
      label: 'Historial de Viajes',
      subtitle: 'Tus rutas compartidas',
      icon: 'history',
      iconBgColor: '#FFF8E1',
      iconColor: colors.accent,
      onPress: () => console.log('Navigate to Trip History'),
    },
    {
      id: 'coupons',
      label: 'Mis Cupones',
      subtitle: 'Descuentos activos',
      icon: 'tag-multiple',
      iconBgColor: '#F3E5F5',
      iconColor: '#9C27B0',
      onPress: () => console.log('Navigate to Coupons'),
    },
    {
      id: 'settings',
      label: 'Configuración',
      subtitle: 'Privacidad y cuenta',
      icon: 'cog',
      iconBgColor: '#F5F5F5',
      iconColor: '#757575',
      onPress: () => console.log('Navigate to Settings'),
    },
  ];

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
      {/* Background Gradient Header */}
      <LinearGradient
        colors={['#e0f2eb', '#F6F8F7']}
        style={styles.headerGradient}
      >
        {/* Decorative Blobs */}
        <View style={styles.blobAccent} />
        <View style={styles.blobPrimary} />
      </LinearGradient>

      {/* Top Navigation */}
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topNav, { paddingTop: insets.top > 0 ? 0 : 16 }]}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => console.log('Edit profile')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {/* Avatar with decorative border */}
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={[colors.accent, colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarBorderGradient}
              >
                <View style={styles.avatarContainer}>
                  {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialCommunityIcons name="account" size={64} color="#999" />
                    </View>
                  )}
                </View>
              </LinearGradient>
              
              {/* Camera button */}
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <MaterialCommunityIcons name="camera" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile.name}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>
                  ID: {profile.espeId || 'A00123456'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Bubbles */}
          <View style={styles.statsContainer}>
            {stats.map((stat) => (
              <View
                key={stat.id}
                style={[
                  styles.statBubble,
                  stat.featured && styles.statBubbleFeatured,
                ]}
              >
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={28}
                  color={stat.featured ? colors.accent : colors.accent}
                />
                <Text style={[
                  styles.statValue,
                  stat.featured && styles.statValueFeatured,
                ]}>
                  {stat.value}
                </Text>
                <Text style={[
                  styles.statLabel,
                  stat.featured && styles.statLabelFeatured,
                ]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: item.iconBgColor }]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={item.iconColor}
                  />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#D0D0D0" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="logout" size={20} color={colors.primary} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Confirmation Modal */}
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
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleLogout}
                activeOpacity={0.7}
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
    backgroundColor: '#F6F8F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  blobAccent: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${colors.accent}33`,
  },
  blobPrimary: {
    position: 'absolute',
    top: 50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `${colors.primary}33`,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorderGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 132,
    height: 132,
    borderRadius: 66,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  idBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  idBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: `${colors.primary}B3`,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: `${colors.primary}1A`,
    padding: 16,
    borderRadius: 16,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statBubbleFeatured: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    marginTop: -8,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  statValueFeatured: {
    color: colors.white,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statLabelFeatured: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}4D`,
    borderRadius: 9999,
    paddingVertical: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
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
  modalMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
