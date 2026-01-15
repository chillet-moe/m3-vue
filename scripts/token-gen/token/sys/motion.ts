export const motion = {
  easing: {
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    legacy: 'cubic-bezier(0.4, 0, 0.2, 1)',
    legacyAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    legacyDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    linear: 'cubic-bezier(0, 0, 1, 1)',
  },

  /*
   * Expressive fast spatial    	0.42, 1.67, 0.21, 0.90. Duration =  350ms
   * Expressive default spatial	    0.38, 1.21, 0.22, 1.00. Duration =  500ms
   * Expressive slow spatial	    0.39, 1.29, 0.35, 0.98. Duration =  650ms
   * Expressive fast effects	    0.31, 0.94, 0.34, 1.00. Duration =  150ms
   * Expressive default effects	    0.34, 0.80, 0.34, 1.00. Duration =  200ms
   * Expressive slow effects	    0.34, 0.88, 0.34, 1.00. Duration =  300ms
   * Standard fast spatial	        0.27, 1.06, 0.18, 1.00. Duration =  350ms
   * Standard default spatial	    0.27, 1.06, 0.18, 1.00. Duration =  500ms
   * Standard slow spatial	        0.27, 1.06, 0.18, 1.00. Duration =  750ms
   * Standard fast effects	        0.31, 0.94, 0.34, 1.00. Duration =  150ms
   * Standard default effects	    0.34, 0.80, 0.34, 1.00. Duration =  200ms
   * Standard slow effects	        0.34, 0.88, 0.34, 1.00. Duration =  300ms
   */
  spring: {
    expressive: {
      duration: {
        fastSpatial: '350ms',
        defaultSpatial: '500ms',
        slowSpatial: '650ms',
        fastEffects: '150ms',
        defaultEffects: '200ms',
        slowEffects: '300ms',
      },
      curve: {
        fastSpatial: 'cubic-bezier(0.42, 1.67, 0.21, 0.90)',
        defaultSpatial: 'cubic-bezier(0.38, 1.21, 0.22, 1.00)',
        slowSpatial: 'cubic-bezier(0.39, 1.29, 0.35, 0.98)',
        fastEffects: 'cubic-bezier(0.31, 0.94, 0.34, 1.00)',
        defaultEffects: 'cubic-bezier(0.34, 0.80, 0.34, 1.00)',
        slowEffects: 'cubic-bezier(0.34, 0.88, 0.34, 1.00)',
      },
    },
    standard: {
      duration: {
        fastSpatial: '350ms',
        defaultSpatial: '500ms',
        slowSpatial: '750ms',
        fastEffects: '150ms',
        defaultEffects: '200ms',
        slowEffects: '300ms',
      },
      curve: {
        fastSpatial: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)',
        defaultSpatial: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)',
        slowSpatial: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)',
        fastEffects: 'cubic-bezier(0.31, 0.94, 0.34, 1.00)',
        defaultEffects: 'cubic-bezier(0.34, 0.80, 0.34, 1.00)',
        slowEffects: 'cubic-bezier(0.34, 0.88, 0.34, 1.00)',
      },
    },
  },
  duration: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms',
  },
};
