/**
 * Centralized Mixpanel event definitions.
 * All tracked events must be declared here.
 */

export const AnalyticsEvents = {

  // ─── Home ────────────────────────────────────────────────────────────────
  HOME_SCREEN_VIEWED:        'Home Screen Viewed',
  HOME_PROFILE_TAPPED:       'Home - Profile Button Tapped',
  HOME_BANNER_TAPPED:        'Home - Banner Tapped',
  HOME_BENEFIT_TAPPED:       'Home - Benefit Card Tapped',
  HOME_BENEFITS_SEE_ALL:     'Home - Benefits See All Tapped',

  // ─── Events Screen ───────────────────────────────────────────────────────
  EVENTS_SCREEN_VIEWED:      'Events Screen Viewed',
  EVENTS_TAB_CHANGED:        'Events - Tab Changed',

  // ─── Eventos Tab ─────────────────────────────────────────────────────────
  EVENTS_FEATURED_TAPPED:    'Events - Featured Event Tapped',
  EVENTS_CALENDAR_DAY_SELECTED: 'Events - Calendar Day Selected',
  EVENTS_CARD_TAPPED:        'Events - Event Card Tapped',
  EVENTS_ATTEND_TOGGLED:     'Events - Attend Toggled',
  EVENTS_CREATE_TAPPED:      'Events - Create Event Tapped',

  // ─── Planes Tab ──────────────────────────────────────────────────────────
  PLANS_PLAN_TAPPED:         'Plans - Plan Card Tapped',
  PLANS_CATEGORY_CHANGED:    'Plans - Category Filter Changed',
  PLANS_JOIN_TOGGLED:        'Plans - Join Toggled',
  PLANS_CREATE_TAPPED:       'Plans - Create Plan Tapped',
  PLANS_MY_PLANS_TAPPED:     'Plans - My Plans Tapped',

  // ─── Rides Screen ────────────────────────────────────────────────────────
  RIDES_SCREEN_VIEWED:       'Rides Screen Viewed',
  RIDES_TAB_CHANGED:         'Rides - Tab Changed',
  RIDES_MY_TRIPS_TAPPED:     'Rides - My Trips Tapped',

  // ─── Busco Viaje Tab ─────────────────────────────────────────────────────
  RIDES_SEARCH_TAPPED:       'Rides - Search Tapped',
  RIDES_TRIP_CARD_TAPPED:    'Rides - Trip Card Tapped',
  RIDES_RESERVE_TAPPED:      'Rides - Reserve Tapped',
  RIDES_CREATE_FROM_SEARCH:  'Rides - Create Trip Tapped (Search Tab)',

  // ─── Ofrezco Viaje Tab ───────────────────────────────────────────────────
  RIDES_PUBLISH_TAPPED:      'Rides - Publish Route Tapped',
  RIDES_ACTIVE_TRIP_TAPPED:  'Rides - Active Trip Tapped',
  RIDES_MANAGE_TRIP_TAPPED:  'Rides - Manage Trip Tapped',
  RIDES_EDIT_TRIP_TAPPED:    'Rides - Edit Trip Tapped',

} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
