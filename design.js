# Visual Design System Analysis

Based on the interface screenshot, here's a comprehensive design system specification for precise UI replication:

## Design System Specification

```json
{
  "designSystem": {
    "containerArchitecture": {
      "mainCard": {
        "surfaceColor": "#FFFFFF",
        "borderRadius": "20px",
        "elevationShadow": "0 4px 12px rgba(0,0,0,0.08)",
        "padding": "0",
        "backgroundColor": "#F5F5F7"
      }
    },
    
    "componentStyles": {
      "headerBanner": {
        "surfaceColor": "#FFD4D8",
        "height": "120px",
        "borderRadius": "20px 20px 0 0",
        "position": "relative"
      },
      
      "profileAvatar": {
        "containerStyle": {
          "diameter": "80px",
          "surfaceColor": "#C4C4C4",
          "borderTreatment": "4px solid #FFFFFF",
          "position": "overlapping",
          "verticalOffset": "-40px",
          "elevationShadow": "0 2px 8px rgba(0,0,0,0.1)"
        }
      },
      
      "typography": {
        "primaryMetric": {
          "textColor": "#2C2C2E",
          "fontSize": "28px",
          "fontWeight": "700",
          "letterSpacing": "-0.02em"
        }
      },
      
      "actionControls": {
        "primaryAction": {
          "surfaceColor": "#FFB4BB",
          "textColor": "#FFFFFF",
          "borderRadius": "8px",
          "padding": "10px 24px",
          "minWidth": "120px",
          "interactionStates": {
            "hoverSurface": "#FF9FA8",
            "activeSurface": "#FF8A94"
          }
        },
        "secondaryAction": {
          "surfaceColor": "#EEEEEF",
          "textColor": "#8E8E93",
          "borderRadius": "8px",
          "padding": "10px 24px",
          "interactionStates": {
            "hoverSurface": "#E5E5E7"
          }
        },
        "iconButton": {
          "surfaceColor": "#FFB4BB",
          "borderRadius": "8px",
          "dimensions": "44px",
          "iconColor": "#FFFFFF"
        }
      },
      
      "iconography": {
        "interactionIcons": {
          "outlineStyle": {
            "strokeColor": "#C7C7CC",
            "strokeWidth": "2px",
            "fillColor": "transparent"
          },
          "filledStyle": {
            "fillColor": "#C7C7CC",
            "strokeColor": "transparent"
          }
        }
      }
    },
    
    "layoutSystem": {
      "componentSpacing": {
        "cardPadding": "24px",
        "elementGap": "12px",
        "sectionMargin": "20px"
      },
      "alignmentRules": {
        "avatarPosition": "center-aligned with left offset",
        "actionButtons": "horizontal-flex with 12px gap",
        "iconAlignment": "left-aligned vertical stack"
      }
    },
    
    "colorPalette": {
      "primary": {
        "coral": "#FFD4D8",
        "coralDark": "#FFB4BB",
        "coralInteractive": "#FF9FA8"
      },
      "neutral": {
        "surface": "#FFFFFF",
        "background": "#F5F5F7",
        "secondaryBackground": "#EEEEEF",
        "avatarGray": "#C4C4C4",
        "textPrimary": "#2C2C2E",
        "textSecondary": "#8E8E93",
        "iconGray": "#C7C7CC"
      }
    },
    
    "visualEffects": {
      "shadows": {
        "cardElevation": "0 4px 12px rgba(0,0,0,0.08)",
        "avatarElevation": "0 2px 8px rgba(0,0,0,0.1)",
        "subtle": "0 1px 3px rgba(0,0,0,0.04)"
      },
      "borderRadius": {
        "container": "20px",
        "controls": "8px",
        "avatar": "50%"
      }
    }
  }
}
```

## Implementation Guidelines

### Critical Visual Patterns
1. **Overlapping Avatar Treatment**: The circular profile element overlaps the header banner with a white border ring, creating visual depth through layering
2. **Color Harmony**: Coral/pink tones (#FFD4D8, #FFB4BB) are used consistently across primary elements
3. **Soft Neutrals**: Gray scale progression from #C4C4C4 (avatar) to #C7C7CC (icons) maintains visual hierarchy

### State Architecture
- **Primary Actions**: Coral background with white text/icons
- **Secondary Actions**: Light gray background (#EEEEEF) with darker gray text
- **Icon States**: Toggle between outline and filled versions for interaction feedback

### Quality Assurance Checklist
✓ **Ensure** avatar white border renders above banner background
✓ **Ensure** consistent 8px border radius on all interactive controls
✓ **Avoid** applying banner gradient to individual elements
✓ **Maintain** 12px spacing between horizontal action buttons
✓ **Preserve** subtle shadow depths for proper elevation hierarchy

This specification enables pixel-perfect reproduction of the interface's visual design language while maintaining flexibility for content variations.