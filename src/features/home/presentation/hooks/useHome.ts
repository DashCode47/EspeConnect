import {useState, useEffect} from 'react';
import {PromotionCategory} from '../../../establishments/domain/entities/establishment.entity';
import Food from '../../../../assets/svg/Food';
import Drinks from '../../../../assets/svg/Drinks';
import Parties from '../../../../assets/svg/Party';
import {Event} from '../../../events/domain/entities/event.entity';
import {useEventStore} from '../../../events/presentation/store/event.store';
import {useEstablishmentStore} from '../../../establishments/presentation/store/establishment.store';
import {useMarketingStore} from '../../../marketing/presentation/store/marketing.store';
import {usePostStore} from '../../../posts/presentation/store/post.store';
import {useAuthStore} from '../../../../store';

const useHome = () => {
  const [error, setError] = useState<string | null>(null);
  const [closestEvent, setClosestEvent] = useState<Event | null>(null);

  const {user: profile, fetchCurrentUser: fetchProfile, isLoading: profileLoading} = useAuthStore();
  const { fetchEvents } = useEventStore();
  const { fetchEstablishments, establishments, isLoading: establishmentsLoading } = useEstablishmentStore();
  const { fetchActiveBanners, banners, bannersLoading } = useMarketingStore();
  const { fetchPosts, posts } = usePostStore();

  const handleIcon = (category: PromotionCategory) => {
    switch (category) {
      case PromotionCategory.FOOD:
        return Food;
      case PromotionCategory.DRINKS:
        return Drinks;
      case PromotionCategory.EVENTS:
        return Parties;
      case PromotionCategory.PARTIES:
        return Parties;
      default:
        return Food;
    }
  };

  const handleBackgroundColors = (category: PromotionCategory) => {
    switch (category) {
      case PromotionCategory.FOOD:
        return '#E8F5E8';
      case PromotionCategory.DRINKS:
        return '#F0F8F0';
      case PromotionCategory.EVENTS:
        return '#E0F0E0';
      case PromotionCategory.PARTIES:
        return '#F5F0F0';
      default:
        return '#008000';
    }
  };

  const getConfessionHome = async () => {
    try {
      await fetchPosts('CONFESSION');
    } catch (error) {
      console.error(error);
    }
  };

  const getClosestEvent = async () => {
    try {
      await fetchEvents();
      const allEvents = useEventStore.getState().events;

      if (!allEvents || allEvents.length === 0) {
        setClosestEvent(null);
        return;
      }

      const now = new Date();
      const futureEvents = allEvents
        .filter((event: Event) => {
          const eventDate = new Date(event.startTime);
          return eventDate >= now;
        })
        .sort((a: Event, b: Event) => {
          const dateA = new Date(a.startTime);
          const dateB = new Date(b.startTime);
          return dateA.getTime() - dateB.getTime();
        });

      if (futureEvents.length > 0) {
        setClosestEvent(futureEvents[0]);
      } else {
        setClosestEvent(null);
      }
    } catch (error) {
      console.error('Error fetching closest event:', error);
      setClosestEvent(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    handleIcon,
    profile,
    fetchProfile,
    profileLoading,
    handleBackgroundColors,
    getConfessionHome,
    confessionHome: posts.length > 0 ? posts[0] : null,
    getClosestEvent,
    closestEvent,
    fetchEstablishments,
    establishments,
    establishmentsLoading,
    fetchActiveBanners,
    banners,
    bannersLoading,
    setError,
    error,
  };
};

export default useHome;
