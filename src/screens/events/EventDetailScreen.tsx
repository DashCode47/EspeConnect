import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';
import { globalStyles } from '../../config/globalStyles';
import { eventService, Event, EventCategory } from '../../services/event.service';
import { EventStackParamList } from '../../navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { useHideNavbar } from '../../hooks/useHideNavbar';

type EventDetailScreenRouteProp = RouteProp<EventStackParamList, 'EventDetail'>;

export const EventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EventDetailScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [attendingLoading, setAttendingLoading] = useState(false);
  
  // Ocultar el navbar en esta pantalla
  useHideNavbar(true);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(eventId);
      setEvent(response.data.event);
      setAttending(response.data.event.isAttending);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = () => {
    // Implementar compartir evento
    console.log('Share event');
  };

  const handleMapPress = () => {
    // Abrir mapa con la ubicación del evento
    if (event?.ubicacion) {
      const encodedLocation = encodeURIComponent(event.ubicacion);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      Linking.openURL(url);
    }
  };

  const handleAttend = async () => {
    if (!event) return;
    
    try {
      setAttendingLoading(true);
      if (attending) {
        await eventService.cancelAttendance(event.id);
        setAttending(false);
        setEvent({ ...event, isAttending: false, asistentesCount: Math.max(0, event.asistentesCount - 1) });
      } else {
        await eventService.attendEvent(event.id);
        setAttending(true);
        setEvent({ ...event, isAttending: true, asistentesCount: event.asistentesCount + 1 });
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar la asistencia. Intenta nuevamente.'
      );
    } finally {
      setAttendingLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Cargando evento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Evento no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Evento</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={28} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: globalStyles.bottomNavigatorHeight + 100,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {event.imagen ? (
            <ImageBackground
              source={{ uri: event.imagen }}
              style={styles.heroImage}
              resizeMode="cover">
              <LinearGradient
                colors={['transparent', '#F5F5F5']}
                style={styles.heroGradient}
              />
            </ImageBackground>
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialCommunityIcons name="calendar-star" size={64} color="#999" />
              <LinearGradient
                colors={['transparent', '#F5F5F5']}
                style={styles.heroGradient}
              />
            </View>
          )}
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Event Title */}
          <Text style={styles.eventTitle}>{event.nombre}</Text>

          {/* Organizer Info */}
          <View style={styles.organizerContainer}>
            <View style={styles.organizerAvatar}>
              {event.creador.avatarUrl ? (
                <Image
                  source={{ uri: event.creador.avatarUrl }}
                  style={styles.organizerAvatarImage}
                />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={40} color={colors.primary} />
              )}
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{event.creador.name}</Text>
              <Text style={styles.organizerLabel}>
                {event.creador.career || 'Organizador'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quick Details */}
          <View style={styles.detailsContainer}>
            {/* Date */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>
                  {formatDate(event.fechaInicio)}
                </Text>
                <Text style={styles.detailSubtitle}>
                  {formatTime(event.fechaInicio)}
                  {event.fechaFin && ` - ${formatTime(event.fechaFin)}`}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{event.ubicacion}</Text>
                <Text style={styles.detailSubtitle}>Ubicación del evento</Text>
              </View>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleMapPress}>
                <MaterialCommunityIcons name="map" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Price */}
            {event.precio > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailTitle}>${event.precio.toFixed(2)}</Text>
                  <Text style={styles.detailSubtitle}>Precio de entrada</Text>
                </View>
              </View>
            )}

            {/* Category */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <MaterialCommunityIcons
                  name="tag"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>
                  {event.categoria === EventCategory.ACADEMIC && 'Académico'}
                  {event.categoria === EventCategory.SPORTS && 'Deportivo'}
                  {event.categoria === EventCategory.SOCIAL && 'Social'}
                  {event.categoria === EventCategory.PRIVATE && 'Privado'}
                  {event.categoria === EventCategory.OTHER && 'Otro'}
                </Text>
                <Text style={styles.detailSubtitle}>Categoría</Text>
              </View>
            </View>

            {/* Attendees Count */}
            {event.asistentesCount > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailTitle}>
                    {event.asistentesCount} {event.asistentesCount === 1 ? 'asistente' : 'asistentes'}
                  </Text>
                  <Text style={styles.detailSubtitle}>Confirmados</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Acerca del Evento</Text>
            <Text style={styles.descriptionText}>
              {event.descripcion ||
                'No hay descripción disponible.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button Bar */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
          },
        ]}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Asistencia</Text>
          <Text style={styles.footerPrice}>
            {event.precio > 0 ? `$${event.precio.toFixed(2)}` : 'Gratuita'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.attendButton, attending && styles.attendButtonActive]}
          onPress={handleAttend}
          disabled={attendingLoading}>
          <MaterialCommunityIcons
            name={attending ? 'check-circle' : 'ticket-confirmation'}
            size={24}
            color={attending ? colors.white : colors.black}
          />
          <Text style={[styles.attendButtonText, attending && styles.attendButtonTextActive]}>
            {attending ? 'Asistencia Confirmada' : '¡Quiero Asistir!'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    minHeight: 240,
  },
  heroImage: {
    width: '100%',
    minHeight: 240,
    justifyContent: 'flex-end',
  },
  heroPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    padding: 20,
    marginHorizontal: 8,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  organizerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  organizerLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginTop: 32,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLeft: {
    flexShrink: 0,
  },
  footerLabel: {
    fontSize: 12,
    color: '#666',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  attendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  attendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  attendButtonActive: {
    backgroundColor: colors.primary,
  },
  attendButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

