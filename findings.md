# Findings

## Color scheme cannot be inverted with `light-dark(dark, light)`

A color scheme cannot be set via the `light-dark` function, becaues this is a cyclic dependency. Inverting a color scheme with `light-dark(dark, light)` would immediately change it back, creating an infinite loop.

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

Example:
| Palette | Schemes | Mode |
| :--- | --- | --- |
| Default | light, dark | aligned |
| Alternate | light, dark | aligned |
| Accent | dark, light | inverted |
| Brand | light, light | static |

## Color scheme media query is only referencing the global scheme

It's not possible to have `@media (prefers-color-scheme: light)` to react to it's immediate environment. This will always react to the global user setting and is page wide either dark or light.

## `data-color-scheme` attribte on the body sets the page wide color scheme

Otherwise it's not possible to invert the color scheme on palette classes.

## Palette classes stay consistent when nested

Every palette class keeps it's color, no matter if it's nested in a light or dark context. The scheme for palettes is always dependent on the body, the scheme of components is dependent on the body or any palette it's nested in.
