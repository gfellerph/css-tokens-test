# Findings

## Color scheme cannot be inverted with `light-dark(dark, light)`

A color scheme cannot be set via the `light-dark` function, becaues this is a cyclic dependency. Inverting a color scheme with `light-dark(dark, light)` would immediately change it back, creating an infinite loop.

```css
.palette-accent {
  /* Infinite CSS loop aka cyclic dependency, don't try this at home */
  color-scheme: light-dark(dark, light);
}
```

Color scheme has to be set on child elements.

```html
<div class="palette-default">
  <button>Button</button>
</div>
```

```CSS
.palette-default {
  > * {
      color-scheme: light; /* No light-dark function here either */
  }
}
```

Due to this, we might need to grab a list of cases where the color scheme is being inverted.

### Possible color-scheme combinations

| Palette       | Schemes      | Mode     |
| :------------ | ------------ | -------- |
| Default       | light, dark  | aligned  |
| Alternate     | light, dark  | aligned  |
| Accent        | dark, light  | inverted |
| Brand         | light, light | static   |
| Brand (cargo) | dark, dark   | static   |

## Color scheme media query is only referencing the global scheme

It's not possible to have `@media (prefers-color-scheme: light)` to react to it's immediate environment. This will always react to the global user setting and is page wide either dark or light.

## Palette classes must stay consistent when nested

Every palette class keeps it's color, no matter if it's nested in a light or dark context. The scheme for palettes is always dependent on the body, the scheme of components is dependent on the body or any palette it's nested in.

## `data-color-scheme` attribute on the body sets the page wide color scheme

This allows us to either have page wide color schemes or even local overrides (which should be very rare or edge cases). Since palettes have consistent background colors, their color-scheme is dependent on what's set on the body.

To set each palettes color scheme, the selector depends on the presence of the `data-color-scheme` attribute:

```css
.palette-accent {
  [data-color-scheme="light"] & {
    --palette-color-scheme: var(--palette-accent-light-scheme);
  }
  [data-color-scheme="dark"] & {
    --palette-color-scheme: var(--palette-accent-dark-scheme);
  }
}
```

## What does a fallback look like?

The `light-dark` function is not supported enough, yet (https://caniuse.com/?search=light-dark). How can we implement a fallback to this function?

### Palette layer

#### Modern

The modern approach simply relies on the current `color-scheme` that's set for this component.

```css
.palette-default {
  --palette-background: light-dark(
    var(--palette-default-light-background),
    var(--palette-default-dark-background)
  );
}
```

#### Fallback

The fallback relies on an attribute set to the body or any other ancestor element, but the fallback is easy to implement, but takes a little more code.

```css
.palette-default {
  [data-color-scheme="light"] & {
    --palette-background: var(--palette-default-light-background);
  }
  [data-color-scheme="dark"] & {
    --palette-background: var(--palette-default-dark-background);
  }
}
```

### Component layer

The trickier part is that palettes need to switch up the color scheme based on their current background.

#### Modern

When `color-scheme` is available, it's easy. Just switch all child elements to the appropriate color scheme and the components `light-dark` function will handle it.

```css
[class*="palette-"] {
  background-color: var(--palette-background);
  color: var(--palette-foreground);
  border-color: var(--palette-border-color);

  /* Switch all child elements to the appropriate theme */
  & > *:not([class*="palette-"]) {
    color-scheme: var(--palette-color-scheme);
  }
}
```

#### Fallback

This fallback happens on the scheme layer and needs to know the mode (aligned, inverted, static) of each palette. As it applies in the scheme layer as additional selectors, it does not duplicate any token definition, which is nice - but the requirement for knowing the mode makes it not straight forward to implement.

```css
[data-color-scheme="light"],
[data-color-scheme="light"] .palette-default > *:not([class*="palette-"]) /* aligned */,
[data-color-scheme="light"] .palette-alternate > *:not([class*="palette-"]) /* aligned */,
[data-color-scheme="dark"] .palette-accent > *:not([class*="palette-"]) /* inverted */,
.palette-brand > *:not([class*="palette-"]) /* static */ {
  /* All light scheme tokens */
}

[data-color-scheme="dark"],
[data-color-scheme="dark"] .palette-default > *:not([class*="palette-"]) /* aligned */,
[data-color-scheme="dark"] .palette-alternate > *:not([class*="palette-"]) /* aligned */,
[data-color-scheme="light"] .palette-accent > *:not([class*="palette-"]) /* inverted */
/* no palette brand here */ {
  /* All dark scheme tokens */
}
```
