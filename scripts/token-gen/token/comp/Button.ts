import { md } from '../md';

export const Button = {
  container: {
    color: md.sys.color.primary,
    shadowColor: md.sys.color.shadow,
    elevation: md.sys.elevation.level0,
    height: '40dp',
    shape: {
      round: md.sys.shape.corner.full,
      square: '12dp',
    },
  },
  labelText: {
    color: md.sys.color.onPrimary,
  },
  icon: {
    color: md.sys.color.onPrimary,
    size: '20dp',
  },

  leadingSpace: '24dp',
  iconLabelSpace: '8dp',
  trailingSpace: '24dp',

  unselected: {
    container: {
      color: md.sys.color.surfaceContainer,
      shape: {
        round: md.sys.shape.corner.medium,
        square: md.sys.shape.corner.full,
      },
    },
    labelText: {
      color: md.sys.color.onSurfaceVariant,
    },
    icon: {
      color: md.sys.color.onSurfaceVariant,
    },
  },
  selected: {
    container: {
      color: md.sys.color.primary,
    },
    labelText: {
      color: md.sys.color.onPrimary,
    },
    icon: {
      color: md.sys.color.onPrimary,
    },
  },

  pressed: {
    container: {
      shape: md.sys.shape.corner.small,
      elevation: md.sys.elevation.level0,
    },
    stateLayer: {
      color: md.sys.color.onPrimary,
      opacity: 0.1,
    },
    labelText: {
      color: md.sys.color.onPrimary,
    },
    icon: {
      color: md.sys.color.onPrimary,
    },
    unselected: {
      stateLayer: {
        color: md.sys.color.onSurfaceVariant,
      },
      labelText: {
        color: md.sys.color.onSurfaceVariant,
      },
      icon: {
        color: md.sys.color.onSurfaceVariant,
      },
    },
    selected: {
      stateLayer: {
        color: md.sys.color.onPrimary,
      },
      labelText: {
        color: md.sys.color.onPrimary,
      },
      icon: {
        color: md.sys.color.onPrimary,
      },
    },
  },

  focus: {
    indicator: {
      color: md.sys.color.secondary,
      thickness: '3dp',
      outline: {
        offset: '2dp',
      },
    },
  },

  disabled: {
    container: {
      color: md.sys.color.onSurface,
      opacity: 0.1,
      elevation: md.sys.elevation.level0,
    },
    labelText: {
      color: md.sys.color.onSurface,
      opacity: 0.38,
    },
    icon: {
      color: md.sys.color.onSurface,
      opacity: 0.38,
    },
  },

  hovered: {
    stateLayer: {
      color: md.sys.color.onPrimary,
      opacity: 0.08,
    },
    labelText: {
      color: md.sys.color.onPrimary,
    },
    icon: {
      color: md.sys.color.onPrimary,
    },
    unselected: {
      stateLayer: {
        color: md.sys.color.onSurfaceVariant,
      },
      labelText: {
        color: md.sys.color.onSurfaceVariant,
      },
      icon: {
        color: md.sys.color.onSurfaceVariant,
      },
    },
    selected: {
      stateLayer: {
        color: md.sys.color.onPrimary,
      },
      labelText: {
        color: md.sys.color.onPrimary,
      },
      icon: {
        color: md.sys.color.onPrimary,
      },
    },
  },

  focused: {
    stateLayer: {
      color: md.sys.color.onPrimary,
      opacity: 0.1,
    },
    container: {
      elevation: md.sys.elevation.level0,
    },
    labelText: {
      color: md.sys.color.onPrimary,
    },
    icon: {
      color: md.sys.color.onPrimary,
    },
    unselected: {
      stateLayer: {
        color: md.sys.color.onSurfaceVariant,
      },
      labelText: {
        color: md.sys.color.onSurfaceVariant,
      },
      icon: {
        color: md.sys.color.onSurfaceVariant,
      },
    },
    selected: {
      stateLayer: {
        color: md.sys.color.onPrimary,
      },
      labelText: {
        color: md.sys.color.onPrimary,
      },
      icon: {
        color: md.sys.color.onPrimary,
      },
    },
  },

  elevated: {
    container: {
      color: md.sys.color.surfaceContainerLow,
      shadowColor: md.sys.color.shadow,
      elevation: md.sys.elevation.level1,
    },
    labelText: {
      color: md.sys.color.primary,
    },
    icon: {
      color: md.sys.color.primary,
    },

    unselected: {
      container: {
        color: md.sys.color.surfaceContainerLow,
      },
      labelText: {
        color: md.sys.color.primary,
      },
      icon: {
        color: md.sys.color.primary,
      },
    },
    selected: {
      container: {
        color: md.sys.color.primary,
      },
      labelText: {
        color: md.sys.color.onPrimary,
      },
      icon: {
        color: md.sys.color.onPrimary,
      },
    },

    disabled: {
      container: {
        color: md.sys.color.onSurface,
        opacity: 0.1,
        elevation: md.sys.elevation.level0,
      },
      labelText: {
        color: md.sys.color.onSurface,
        opacity: 0.38,
      },
      icon: {
        color: md.sys.color.onSurface,
        opacity: 0.38,
      },
    },

    hovered: {
      stateLayer: {
        color: md.sys.color.primary,
        opacity: 0.08,
      },
      labelText: {
        color: md.sys.color.primary,
      },
      icon: {
        color: md.sys.color.primary,
      },
      unselected: {
        stateLayer: {
          color: md.sys.color.primary,
        },
        labelText: {
          color: md.sys.color.primary,
        },
        icon: {
          color: md.sys.color.primary,
        },
      },
      selected: {
        stateLayer: {
          color: md.sys.color.onPrimary,
        },
        labelText: {
          color: md.sys.color.onPrimary,
        },
        icon: {
          color: md.sys.color.onPrimary,
        },
      },
    },

    focused: {
      stateLayer: {
        color: md.sys.color.primary,
        opacity: 0.1,
      },
      labelText: {
        color: md.sys.color.primary,
      },
      icon: {
        color: md.sys.color.primary,
      },
      unselected: {
        stateLayer: {
          color: md.sys.color.primary,
        },
        labelText: {
          color: md.sys.color.primary,
        },
        icon: {
          color: md.sys.color.primary,
        },
      },
      selected: {
        stateLayer: {
          color: md.sys.color.onPrimary,
        },
        labelText: {
          color: md.sys.color.onPrimary,
        },
        icon: {
          color: md.sys.color.onPrimary,
        },
      },
    },

    pressed: {
      stateLayer: {
        color: md.sys.color.primary,
        opacity: 0.1,
      },
      labelText: {
        color: md.sys.color.primary,
      },
      icon: {
        color: md.sys.color.primary,
      },
      unselected: {
        stateLayer: {
          color: md.sys.color.primary,
        },
        labelText: {
          color: md.sys.color.primary,
        },
        icon: {
          color: md.sys.color.primary,
        },
      },
      selected: {
        stateLayer: {
          color: md.sys.color.onPrimary,
        },
        labelText: {
          color: md.sys.color.onPrimary,
        },
        icon: {
          color: md.sys.color.onPrimary,
        },
      },
    },
  },

  xsmall: {
    container: {
      height: '32dp',
    },
  },
} as const;
