import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BarraMarketplaceProps {
  color?: string;
  size?: number;
}

export const BarraMarketplace = ({ color = '#B6B6B6', size = 24, ...props }: BarraMarketplaceProps) => (
    <Svg
    id="Layer_1"
    data-name="Layer 1"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    {...props}
  >
    <Path d="M23.962,7.725l-1.172-4.099c-.61-2.135-2.588-3.626-4.808-3.626h-.982V4c-.006,1.308-1.995,1.307-2,0V0h-6V4c-.006,1.308-1.994,1.307-2,0V0h-.983C3.797,0,1.82,1.491,1.209,3.626L.039,7.725c-.161,1.066,.314,2.138,.961,2.893v9.382c0,2.206,1.794,4,4,4h6c2.206,0,4-1.794,4-4V11.444c.378-.221,.714-.498,1-.826,.734,.84,1.799,1.382,3,1.382h1c.347,0,.678-.058,1-.142v11.142c.006,1.308,1.995,1.307,2,0V10.618c.648-.754,1.122-1.826,.962-2.893Zm-10.962,9.275H3v-5.142c.322,.084,.653,.142,1,.142h1c1.2,0,2.266-.542,3-1.382,.734,.84,1.8,1.382,3,1.382h2v5Z" />
  </Svg>
);

