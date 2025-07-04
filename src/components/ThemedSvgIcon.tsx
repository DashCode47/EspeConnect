import React from 'react'
import { SvgProps } from 'react-native-svg'

type ThemedSvgIconProps = {
  IconComponent: React.ElementType
  color?: string
  size?: number
} & SvgProps

const ThemedSvgIcon: React.FC<ThemedSvgIconProps> = ({ IconComponent, color, size, ...props }) => {

  const defaultColor = '#4169E1'

  const iconColor = color || defaultColor
  const iconSize = size ?? 24

  return (
    <IconComponent
      width={iconSize}
      height={iconSize}
      stroke={iconColor}
      color={color}
      {...props}
    />
  )
}

export default ThemedSvgIcon
