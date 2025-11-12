import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import {Icon} from '../../components/Icon';
import {Header} from '../../components/Header';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';
import {bannerService, Banner} from '../../services/bannerService';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import useHome from './Hooks/useHome';
import ThemedSvgIcon from '../../components/ThemedSvgIcon';
import {FONT_WEIGHT} from '../../config/globalStyles';
import {PostCard} from '../../components/PostCard';
import {eventService, Event, EventCategory} from '../../services/event.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../config/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {globalStyles} from '../../config/globalStyles';
import {navigationRef} from '../../navigation/RootNavigator';
import {BENEFIT_DETAILS, BENEFIT_STACK} from '../../config/constants';
import {HomeSkeletonLoader} from '../../components/HomeSkeletonLoader';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface NewsCardProps {
  title: string;
  description: string;
  icon: string;
  backgroundColor?: string;
  imageUrl: string;
}

interface DealCardProps {
  icon: any;
  imagePromo?: React.ReactNode;
  title: string;
  backgroundColor: string;
  data: any;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  icon,
  backgroundColor = '#4169E1',
  imageUrl,
}) => (
  <ImageBackground
    source={{uri: imageUrl}}
    style={[styles.newsCard]}
    imageStyle={styles.newsCardImage}>
    <View style={styles.newsCardOverlay}>
      <View style={styles.newsContent}>
        <View>
          <Text style={styles.newsTitle}>{title}</Text>
          <Text style={styles.newsDescription}>{description}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon
            library="MaterialCommunityIcons"
            name={icon}
            size={32}
            color="rgba(255,255,255,0.8)"
          />
        </View>
      </View>
    </View>
  </ImageBackground>
);

const DealCard: React.FC<DealCardProps> = ({
  title,
  backgroundColor,
  icon,
  data,
}) => (
  <TouchableOpacity
    style={styles.dealCard}
    onPress={() =>
      navigationRef.current?.navigate(BENEFIT_STACK, {
        screen: BENEFIT_DETAILS,
        params: {
          data: data,
        },
      })
    }>
    <View style={[styles.dealCircle, {backgroundColor}]}>
      <Image source={{uri: icon}} style={{width: 70, height: 70, resizeMode: 'contain'}} />
      {/* <ThemedSvgIcon IconComponent={icon} color="white" size={40} /> */}
    </View>
    <Text style={styles.dealName} numberOfLines={2}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const width = Dimensions.get('window').width;
  const {
    allPromotions,
    fetchPromotions,
    handleIcon,
    profile,
    handleBackgroundColors,
    getConfessionHome,
    confessionHome,
    getClosestEvent,
    closestEvent,
  } = useHome();
  useEffect(() => {
    console.log(allPromotions);
    fetchPromotions();
    fetchBanners();
    getConfessionHome();
    getClosestEvent();
  }, []);
  console.log(allPromotions);
  const fetchBanners = async () => {
    try {
      const data = await bannerService.getAll();
      setBanners(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch banners');
      setLoading(false);
      console.error('Error fetching banners:', err);
    }
  };

  const renderBanner = ({item}: {item: Banner}) => (
    <NewsCard
      key={item.id}
      title={item.title}
      description={item.description}
      icon="bullhorn"
      imageUrl={item.imageUrl}
    />
  );

  const handleProgressChange = (progress: number) => {
    const newIndex = Math.round(progress);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({index, animated: true});
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  const getCategoryLabel = (category: EventCategory) => {
    switch (category) {
      case EventCategory.ACADEMIC:
        return 'ACADÉMICO';
      case EventCategory.SPORTS:
        return 'DEPORTIVO';
      case EventCategory.SOCIAL:
        return 'SOCIAL';
      case EventCategory.PRIVATE:
        return 'PRIVADO';
      case EventCategory.OTHER:
        return 'OTRO';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header userName={profile?.name} />
        <HomeSkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header userName={profile?.name} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
        }}
        showsVerticalScrollIndicator={false}>
        {/* University News Section */}
        <View style={styles.section}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View>
              <Carousel
                ref={carouselRef}
                loop={false}
                width={width - 40}
                height={200}
                data={banners}
                renderItem={renderBanner}
                onProgressChange={handleProgressChange}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                }}
                enabled={banners.length > 1}
                defaultIndex={0}
              />
              {banners.length > 1 && (
                <View style={styles.paginationContainer}>
                  {banners.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDotPress(index)}
                      style={styles.paginationDotWrapper}>
                      <View
                        style={[
                          styles.paginationDot,
                          index === activeIndex && styles.paginationDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promociones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promotionsScrollContent}>
            {allPromotions.length > 0 &&
              allPromotions.map(promotion => (
                <DealCard
                  data={promotion}
                  icon={promotion.imageUrl || ''}
                  title={promotion.title}
                  backgroundColor={handleBackgroundColors(promotion.category)}
                  key={promotion.id}
                />
              ))}
          </ScrollView>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <View style={styles.confessionContainer}>
            <Text style={styles.sectionTitle}>Eventos proximos</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('events' as any)}>
              <Text style={styles.sectionTitleMore}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {closestEvent ? (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() =>
                navigation.navigate('events' as any, {
                  screen: 'EventDetail',
                  params: {eventId: closestEvent.id},
                })
              }>
              <View style={styles.eventImageContainer}>
                {closestEvent.imagen ? (
                  <Image
                    source={{uri: closestEvent.imagen}}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.eventImagePlaceholder,
                      {
                        backgroundColor: getCategoryColor(closestEvent.categoria),
                      },
                    ]}>
                    <MaterialCommunityIcons
                      name="calendar-star"
                      size={48}
                      color="#fff"
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.categoryBadge,
                    {backgroundColor: getCategoryColor(closestEvent.categoria)},
                  ]}>
                  <Text style={styles.categoryBadgeText}>
                    {getCategoryLabel(closestEvent.categoria)}
                  </Text>
                </View>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{closestEvent.nombre}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons
                      name="calendar-today"
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.eventDetailText}>
                      {formatEventDate(closestEvent.fechaInicio)}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                    <Text style={styles.eventDetailText} numberOfLines={1}>
                      {closestEvent.ubicacion}
                    </Text>
                  </View>
                  {closestEvent.asistentesCount > 0 && (
                    <View style={styles.eventDetailRow}>
                      <MaterialCommunityIcons name="account-group" size={20} color="#666" />
                      <Text style={styles.eventDetailText}>
                        {closestEvent.asistentesCount}{' '}
                        {closestEvent.asistentesCount === 1 ? 'asistente' : 'asistentes'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noEventContainer}>
              <MaterialCommunityIcons name="calendar-remove" size={48} color="#999" />
              <Text style={styles.noEventText}>No hay eventos próximos</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 100,
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#008000',
  },
  sectionTitleMore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2BEE79',
  },
  confessionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  newsCardImage: {
    borderRadius: 16,
  },
  newsCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  newsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  newsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    maxWidth: '80%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  newsDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '80%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  iconContainer: {
    marginLeft: 20,
    borderRadius: 24,
  },
  dealsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  dealCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  dealCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dealName: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#008000',
  },
  extraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#008000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  extraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#008000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDotWrapper: {
    padding: 4,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D1',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#008000',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  promotionsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#008000',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#008000',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  quickActionArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#008000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 8,
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
    color: '#FFFFFF',
  },
  eventContent: {
    padding: 16,
    gap: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
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
    flex: 1,
  },
  noEventContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 8,
  },
  noEventText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
