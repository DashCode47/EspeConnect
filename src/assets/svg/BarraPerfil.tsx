import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface BarraPerfilProps {
  color?: string;
  size?: number;
}

export const BarraPerfil = ({ color = '#B6B6B6', size = 24 }: BarraPerfilProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19,0H5A5.006,5.006,0,0,0,0,5V19a5.006,5.006,0,0,0,5,5V21a7,7,0,0,1,14,0v3a5.006,5.006,0,0,0,5-5V5A5.006,5.006,0,0,0,19,0ZM12,12a4,4,0,1,1,4-4A4,4,0,0,1,12,12Z"
      fill={color}
    />
    <Circle cx="12" cy="8" r="2" fill={color} />
    <Path
      d="M12,16a5.006,5.006,0,0,0-5,5v3H17V21A5.006,5.006,0,0,0,12,16Z"
      fill={color}
    />
  </Svg>
);

