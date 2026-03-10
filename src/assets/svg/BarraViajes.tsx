import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BarraViajesProps {
  color?: string;
  size?: number;
}

export const BarraViajes = ({ color = '#B6B6B6', size = 24 }: BarraViajesProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7,23.894a4.57,4.57,0,0,1-.527-.122l-2.869-.9a5.013,5.013,0,0,1-3.6-4.8V6A5,5,0,0,1,6.92,1.388L7,1.425ZM20.68,1.167l-.021-.007-2.715-.9A4.951,4.951,0,0,0,17,.053V22.315l2.054.592A4,4,0,0,0,24,19.021V5.876A5.01,5.01,0,0,0,20.68,1.167ZM15,.19S9.157,1.863,9,1.88v22c.1-.021,6-1.636,6-1.636Z"
      fill={color}
    />
  </Svg>
);

