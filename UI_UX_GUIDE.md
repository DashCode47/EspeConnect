# EspeConnect - UI/UX Design Guide

This document contains the design system specifications for the EspeConnect mobile application.

---

## 🎨 Color Palette

### Primary Colors

| Color Name | HEX Code | Usage |
|------------|----------|-------|
| **Primary** | `#105A39` | Main brand color (dark green) - Used for primary buttons, headers, icons |
| **White** | `#FFFFFF` | Backgrounds, text on dark surfaces, card backgrounds |
| **Accent** | `#F7B634` | Accent/highlight color (golden yellow) - CTAs, warnings, highlights |

### Extended Color System

#### Brand Colors
| Color Name | HEX Code | Usage |
|------------|----------|-------|
| Primary Dark | `#131413` | Dark text, headings, contrast elements |
| Secondary | `#FDC332` | Secondary accent, alternative highlights |
| Tertiary | `#FF9101` | Additional accent (orange) |
| Green Light | `#2BEE79` | Light green accents, highlights |

#### Background Colors
| Color Name | HEX Code | Usage |
|------------|----------|-------|
| Background | `#FDFDFD` | Main app background |
| Splash Gradient Start | `#F6F8F7` | Splash screen gradient |
| Splash Gradient End | `#E8F0EB` | Splash screen gradient |

#### State Colors
| Color Name | HEX Code | Usage |
|------------|----------|-------|
| Success | `#16965D` | Success states, confirmations |
| Error | `#E63E2F` | Error states, destructive actions |

#### Neutral Colors
| Color Name | HEX Code | Usage |
|------------|----------|-------|
| Black | `#222222` | Text, icons |
| White | `#FFFFFF` | Backgrounds, light text |

---

## 🔤 Typography

### Font Family: **League Spartan**

The app uses **League Spartan** as its primary typeface across all text elements.

#### Available Weights
| Weight Name | File Name | Weight Value |
|-------------|-----------|--------------|
| Extra Light | `LeagueSpartan-ExtraLight` | 200 |
| Light | `LeagueSpartan-Light` | 300 |
| Regular | `LeagueSpartan-Regular` | 400 |
| Medium | `LeagueSpartan-Medium` | 500 |
| Semi Bold | `LeagueSpartan-SemiBold` | 600 |
| Bold | `LeagueSpartan-Bold` | 700 |
| Extra Bold | `LeagueSpartan-ExtraBold` | 800 |
| Black | `LeagueSpartan-Black` | 900 |

### Text Styles

#### Headings
| Style | Font | Size | Weight |
|-------|------|------|--------|
| H1 | League Spartan Bold | 32px | 700 |
| H2 | League Spartan Bold | 28px | 700 |
| H3 | League Spartan SemiBold | 24px | 600 |
| H4 | League Spartan SemiBold | 20px | 600 |
| H5 | League Spartan Medium | 18px | 500 |
| H6 | League Spartan Medium | 16px | 500 |

#### Body Text
| Style | Font | Size | Weight |
|-------|------|------|--------|
| Body | League Spartan Regular | 16px | 400 |
| Body Small | League Spartan Regular | 14px | 400 |
| Caption | League Spartan Regular | 12px | 400 |
| Button | League Spartan SemiBold | 16px | 600 |

---

## 📐 Spacing & Layout

### Padding
| Type | Value |
|------|-------|
| Horizontal | 20px |
| Vertical | 16px |

### Margins
| Size | Value |
|------|-------|
| Small | 8px |
| Medium | 16px |
| Large | 24px |

### Border Radius
| Size | Value |
|------|-------|
| Small | 8px |
| Medium | 12px |
| Large | 16px |
| X-Large | 24px |

---

## 🌑 Shadow System

### Small Shadow
```css
shadow-color: #000;
shadow-offset: { width: 0, height: 2 };
shadow-opacity: 0.1;
shadow-radius: 4;
elevation: 2; /* Android */
```

### Medium Shadow
```css
shadow-color: #000;
shadow-offset: { width: 0, height: 4 };
shadow-opacity: 0.15;
shadow-radius: 8;
elevation: 4; /* Android */
```

### Large Shadow
```css
shadow-color: #000;
shadow-offset: { width: 0, height: 6 };
shadow-opacity: 0.2;
shadow-radius: 12;
elevation: 8; /* Android */
```

---

## 📁 Configuration Files Reference

All design tokens are defined in:
- `src/config/colors.ts` - Color definitions
- `src/config/fonts.ts` - Typography styles
- `src/config/globalStyles.ts` - Spacing, shadows, and layout utilities
- `src/config/theme.ts` - React Native Paper theme configuration

---

## 🎯 Color Usage Quick Reference

### The 3 Main Colors

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🟢 PRIMARY GREEN    #105A39                          │
│      Use for: Main UI elements, headers, nav           │
│                                                         │
│   ⚪ WHITE            #FFFFFF                          │
│      Use for: Backgrounds, cards, light text           │
│                                                         │
│   🟡 ACCENT YELLOW    #F7B634                          │
│      Use for: CTAs, highlights, important actions      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 HomeScreen Structure

The HomeScreen is located at `src/screens/home/HomeScreen.tsx`.

### Components (Top to Bottom)

| Order | Functionality | Component Type | Description |
|-------|--------------|----------------|-------------|
| 1 | **Top Navigation Bar** | `View` + `TouchableOpacity` | Profile avatar (left), logo (center), notification bell (right) |
| 2 | **Welcome Section** | `View` + `Text` | "Bienvenido, {userName}" + user's career |
| 3 | **Search Bar** | `TextInput` | *(Currently commented out)* Search + filter |
| 4 | **Banner Carousel** | `Carousel` | Auto-playing image banners with pagination dots |
| 5 | **Promotions Section** | `ScrollView` (horizontal) | Circular promotion chips |
| 6 | **Call to Action** | `Text` | "No las dejes pasar!" |
| 7 | **Promotion Cards** | `ScrollView` (horizontal, paged) | Full-width swipeable cards |

### PromotionCard Sub-Component
| Section | Content |
|---------|---------|
| Header | Avatar, establishment name, category, bookmark |
| Image | Large establishment photo |
| Content | Title, description, discount % |
| Actions | Address button + discount button |

### Data Sources
- `useHome` hook → User profile, events
- `bannerService` → Banner carousel data
- `establishmentService` → Establishments with promotions
