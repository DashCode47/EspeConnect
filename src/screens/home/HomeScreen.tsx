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
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {Icon} from '../../components/Icon';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';
import {bannerService, Banner} from '../../services/bannerService';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import useHome from './Hooks/useHome';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface NewsCardProps {
  title: string;
  description: string;
  icon: string;
  backgroundColor?: string;
  imageUrl: string;
}

interface DealCardProps {
  icon: string;
  title: string;
  backgroundColor: string;
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

const DealCard: React.FC<DealCardProps> = ({icon, title, backgroundColor}) => (
  <TouchableOpacity style={[styles.dealCard, {backgroundColor}]}>
    <View style={styles.dealCardContent}>
      <View style={styles.dealIconContainer}>
        <Icon
          library="MaterialCommunityIcons"
          name={icon}
          size={32}
          color="rgba(255,255,255,0.95)"
        />
      </View>
      <View style={styles.dealTextContainer}>
        <Text style={styles.dealText} numberOfLines={2}>{title}</Text>
      </View>
      <View style={styles.dealArrowContainer}>
        <Icon
          library="MaterialCommunityIcons"
          name="chevron-right"
          size={20}
          color="rgba(255,255,255,0.7)"
        />
      </View>
    </View>
  </TouchableOpacity>
);

const ExtraItem: React.FC<{icon: string; title: string}> = ({icon, title}) => (
  <TouchableOpacity style={styles.extraItem}>
    <View style={styles.extraIconContainer}>
      <Icon library="MaterialCommunityIcons" name={icon} size={24} color="#666" />
    </View>
    <Text style={styles.extraTitle}>{title}</Text>
  </TouchableOpacity>
);

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const width = Dimensions.get('window').width;
  const {allPromotions, fetchPromotions, handleIcon} = useHome();
  useEffect(() => {
    console.log(allPromotions);
    fetchPromotions();
    fetchBanners();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4169E1" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* University News Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ESPE Connect</Text>
          {loading ? (
            <Text>Loading banners...</Text>
          ) : error ? (
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

        {/* Deals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promociones</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promotionsScrollContent}
          >
            {allPromotions.length > 0 &&
              allPromotions.map(promotion => (  
                <DealCard
                  icon={handleIcon(promotion.category) || ''}
                  title={promotion.title}
                  backgroundColor="#5aa651"
                  key={promotion.id}
                />
              ))}
          </ScrollView>
        </View>

        {/* Extras Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extras</Text>
          <ExtraItem icon="clipboard-text" title="Surveys" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white',
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
    color: '#1A1A1A',
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
    color: 'white',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  dealCard: {
    width: 280,
    height: 80,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginRight: 16,
  },
  dealCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  dealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  dealText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'left',
    lineHeight: 20,
  },
  dealArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  extraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  extraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  errorText: {
    color: 'red',
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
    backgroundColor: '#4169E1',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  promotionsScrollContent: {
    padding: 20,
  },
});
