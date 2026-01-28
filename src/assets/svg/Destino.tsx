import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface DestinoProps {
  color?: string;
  size?: number;
}

export const Destino = ({ color = '#0A482D', size = 13 }: DestinoProps) => {
  // Convert color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const colorWithOpacity = hexToRgba(color, 0.5);
  const solidColor = color;

  return (
    <Svg width={size} height={size} viewBox="0 0 13 13" fill="none">
      <Circle cx="6.5" cy="6.5" r="6.5" fill={colorWithOpacity} />
      <Circle cx="6.5" cy="6.5" r="5.5" fill={colorWithOpacity} />
      <Circle cx="6.49989" cy="6.49989" r="3.05556" fill={solidColor} />
    </Svg>
  );
};

