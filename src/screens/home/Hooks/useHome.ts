import {
  PromotionCategory,
  promotionService,
} from '../../../services/promotion.service';
import {useState} from 'react';
import {Promotion} from '../../../services/promotion.service';
import {profileService, UserProfile} from '../../../services/profile.service';
import {useEffect} from 'react';

const useHome = () => {
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      const promotions = await promotionService.getPromotions();
      console.log(promotions);
      setAllPromotions(promotions.data.promotions);
    } catch (error) {
      console.log(error);
    }
  };

  const handleIcon = (category: PromotionCategory) => {
    switch (category) {
      case PromotionCategory.FOOD:
        return 'food-fork-drink';
      case PromotionCategory.DRINKS:
        return 'bottle-wine';
      case PromotionCategory.EVENTS:
        return 'event-available';
      case PromotionCategory.PARTIES:
        return 'party-popper';
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

  useEffect(() => {
    fetchProfile();
  }, []);

  return {allPromotions, fetchPromotions, handleIcon, profile, fetchProfile};
};

export default useHome;
