import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface BarraEventosProps {
  color?: string;
  size?: number;
}

export const BarraEventos = ({ color = '#B6B6B6', size = 24 }: BarraEventosProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z"
      fill={color}
    />
  </Svg>
);

