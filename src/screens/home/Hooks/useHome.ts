import {
  PromotionCategory,
} from '../../../services/promotion.service';
import {useState, useEffect} from 'react';
import {Promotion} from '../../../services/promotion.service';
import {useUserStore} from '../../../store/userStore';
import Food from '../../../assets/svg/Food';
import Drinks from '../../../assets/svg/Drinks';
import Parties from '../../../assets/svg/Party';
import {Post, postService} from '../../../services/post.service';
import {Event, eventService} from '../../../services/event.service';

const useHome = () => {
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confessionHome, setConfessionHome] = useState<Post | null>(null);
  const [closestEvent, setClosestEvent] = useState<Event | null>(null);

  // Use Zustand store for profile
  const {profile, fetchProfile, isLoading: profileLoading} = useUserStore();

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
      const response = await postService.getPosts('CONFESSION');
      setConfessionHome(response.data.posts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getClosestEvent = async () => {
    try {
      const response = await eventService.getEvents();
      const events = response.data.events;

      if (events.length === 0) {
        setClosestEvent(null);
        return;
      }

      const now = new Date();
      const futureEvents = events
        .filter(event => {
          const eventDate = new Date(event.fechaInicio);
          return eventDate >= now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.fechaInicio);
          const dateB = new Date(b.fechaInicio);
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
    allPromotions,
    handleIcon,
    profile,
    fetchProfile,
    profileLoading,
    handleBackgroundColors,
    getConfessionHome,
    confessionHome,
    getClosestEvent,
    closestEvent,
  };
};

export default useHome;
