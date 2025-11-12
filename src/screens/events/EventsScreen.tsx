import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../config/colors';
import { globalStyles } from '../../config/globalStyles';
import { eventService, Event, EventCategory } from '../../services/event.service';
import { EventStackParamList } from '../../navigation/types';

type EventsScreenNavigationProp = NativeStackNavigationProp<EventStackParamList, 'EventsList'>;

export const EventsScreen = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>(EventCategory.ALL);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        categoria: selectedCategory !== EventCategory.ALL ? selectedCategory : undefined,
        ubicacion: searchQuery.trim() || undefined,
      });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: EventCategory.ALL, label: 'Todos' },
    { key: EventCategory.ACADEMIC, label: 'Académico' },
    { key: EventCategory.SPORTS, label: 'Deportivo' },
    { key: EventCategory.SOCIAL, label: 'Social' },
    { key: EventCategory.PRIVATE, label: 'Privado' },
    { key: EventCategory.OTHER, label: 'Otro' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case EventCategory.ACADEMIC:
        return '#2ECC71';
      case EventCategory.SPORTS:
        return '#3498DB';
      case EventCategory.SOCIAL:
        return '#E74C3C';
      case EventCategory.PRIVATE:
        return '#9B59B6';
      case EventCategory.OTHER:
        return '#95A5A6';
      default:
        return colors.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>

        <Text style={styles.headerTitle}>Eventos</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialCommunityIcons name="bell-outline" size={28} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, lugar..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        contentContainerStyle={styles.chipsContent}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.chip,
              selectedCategory === category.key && styles.chipActive,
              selectedCategory === category.key && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedCategory(category.key)}>
            <Text
              style={[
                styles.chipText,
                selectedCategory === category.key && styles.chipTextActive,
              ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView
        style={styles.eventsList}
        contentContainerStyle={[
          styles.eventsListContent,
          { paddingBottom: globalStyles.bottomNavigatorHeight + 20 },
        ]}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Cargando eventos...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-remove" size={64} color="#999" />
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
          </View>
        ) : (
          events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}>
              <View style={styles.eventImageContainer}>
                {event.imagen ? (
                  <Image
                    source={{ uri: event.imagen }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.eventImagePlaceholder, { backgroundColor: getCategoryColor(event.categoria) }]}>
                    <MaterialCommunityIcons name="calendar-star" size={48} color="#fff" />
                  </View>
                )}
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(event.categoria) },
                  ]}>
                  <Text style={styles.categoryBadgeText}>
                    {categories.find((c) => c.key === event.categoria)?.label.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.nombre}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons
                      name="calendar-today"
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.fechaInicio)}, {formatTime(event.fechaInicio)}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                    <Text style={styles.eventDetailText}>{event.ubicacion}</Text>
                  </View>
                  {event.asistentesCount > 0 && (
                    <View style={styles.eventDetailRow}>
                      <MaterialCommunityIcons name="account-group" size={20} color="#666" />
                      <Text style={styles.eventDetailText}>
                        {event.asistentesCount} {event.asistentesCount === 1 ? 'asistente' : 'asistentes'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}>
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  chipsContainer: {
    maxHeight: 50,
  },
  chipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.black,
  },
  eventContent: {
    padding: 16,
    gap: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: globalStyles.bottomNavigatorHeight + 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

