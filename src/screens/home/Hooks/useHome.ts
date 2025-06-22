import { PromotionCategory, promotionService } from "../../../services/promotion.service";
import { useState } from "react";
import { Promotion } from "../../../services/promotion.service";
import { useEffect } from "react";


const useHome = () => {
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);

  
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
    }


  return { allPromotions,fetchPromotions,handleIcon };
};

export default useHome;
