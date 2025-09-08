import {
  PromotionCategory,
  promotionService,
} from '../../../services/promotion.service';
import {useState} from 'react';
import {Promotion} from '../../../services/promotion.service';
import {profileService, UserProfile} from '../../../services/profile.service';
import {useEffect} from 'react';
import Food from '../../../assets/svg/Food';
import Drinks from '../../../assets/svg/Drinks';
import Parties from '../../../assets/svg/Party';
import { Post, postService } from '../../../services/post.service';

const useHome = () => {
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confessionHome, setConfessionHome] = useState<Post | null>(null);
  const fetchPromotions = async () => {
    try {
      const promotions = await promotionService.getPromotions();
      setAllPromotions(promotions.data.promotions);
    } catch (error) {
      console.log(error);
    }
  };

  const handleIcon = (category: PromotionCategory) => {
    console.log(category);
    switch (category) {
      case PromotionCategory.FOOD:
        return Food;
      case PromotionCategory.DRINKS:
        return Drinks;
      case PromotionCategory.EVENTS:
        return Parties; // Using Parties as fallback since Events doesn't exist
      case PromotionCategory.PARTIES:
        return Parties;
      default:
        return Food;
    }
  };

  const handleBackgroundColors = (category: PromotionCategory) => {
    switch (category) {
      case PromotionCategory.FOOD:
        return '#E8F5E8'; // Light green
      case PromotionCategory.DRINKS:
        return '#F0F8F0'; // Very light green
      case PromotionCategory.EVENTS:
        return '#E0F0E0'; // Light green variant
      case PromotionCategory.PARTIES:
        return '#F5F0F0'; // Light red tint
      default:
        return '#008000'; // Primary green
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.status === 'success') {
        setProfile(response.data.user);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    }
  };

  const getConfessionHome = async () => {
    try {
      const response = await postService.getPosts('CONFESSION');
      setConfessionHome(response.data.posts[0]);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {allPromotions, fetchPromotions, handleIcon, profile, fetchProfile, handleBackgroundColors, getConfessionHome, confessionHome};
};

export default useHome;
