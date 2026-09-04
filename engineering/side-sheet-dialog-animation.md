# SideSheet modal dialog animation investigation

## Status

The SideSheet entry animation is implemented on the native `<dialog>` root. The
root owns the sheet's viewport placement, size, and translation; its surface is
a stationary, fully painted child that fills the root.

Page scroll locking remains independent from the animation. It uses the shared
scroll lock, which hides body overflow and compensates for the removed scrollbar
with inline padding.

## Symptom

An end-side SideSheet could appear to move too far toward the inline start and
then snap back into place. The failure was intermittent: in some openings the
snap was visible, while in others the sheet appeared without a useful entry
translation.

The sheet did not appear to scale or otherwise deform. A captured frame also
showed a transparent vertical strip between the painted surface and the
scrollbar. This was an important clue: the visible sheet surface and the box
participating in modal placement were not the same element.

## Original structure

The original implementation divided responsibility as follows:

- the `<dialog>` root was a transparent, full-viewport grid;
- a grid child represented the visible sheet and was aligned to the start or
  end edge;
- the child owned the background, width, `transform`, transition, and an entry
  keyframe animation;
- `showModal()` promoted the full-viewport root to the browser top layer.

This made the modal's positioned box much larger than the painted surface. The
child moved inside that transparent box, so any disagreement between modal
placement, layout, and the sampled animation frame became visible as an empty
strip or an apparent displacement of the whole sheet. The child transform was
also driven by both a transition and `sideSheetIn` keyframes, leaving two motion
mechanisms responsible for the same property during entry.

## Investigation

### Scrollbar and scroll locking

The first plausible explanation was a viewport-width change when the page
scrollbar disappeared. Several variants were tested, including keeping the root
scrollbar visible and fixing the body at its existing width.

Those variants changed the size or location of the transparent strip, but did
not reliably remove the snap. Moving the sheet to compensate for the strip only
masked the symptom. The failure also remained possible when scrollbar geometry
was held stable, so scroll locking was not the root cause.

The shared scroll lock was therefore restored to its original behavior instead
of carrying SideSheet-specific layout policy.

### Shape, scale, and missing paint

No changing scale could be established. The stronger evidence was the missing
paint beside the scrollbar: the full-viewport dialog was transparent, while
only its transforming child painted the container color. This explained why a
frame could look like a displaced or malformed sheet even though the visible
surface's own shape was unchanged.

### Browser observation

Single screenshots and ordinary browser inspection were insufficient because
the bad state could exist for only a small number of frames. The useful check
was to open the sheet repeatedly and sample its geometry on successive
`requestAnimationFrame` callbacks.

After moving the transform to the dialog root, repeated openings produced about
twenty distinct intermediate positions from the closed edge to the final
position. Every sampled position progressed monotonically, and five consecutive
cycles completed without the previous reversal. The root and surface rectangles
also moved together.

This is a better regression criterion than merely checking the first and last
styles: an animation can have correct endpoints and still contain a one-frame
jump.

## Resolution

The implementation now follows one ownership chain:

1. The `<dialog>` root is sized as the sheet rather than the viewport.
2. Logical inset properties place that root at the requested viewport edge.
3. The root alone transitions `transform` between the closed and open states.
4. `@starting-style` supplies the entry transform after `showModal()` changes
   the dialog from non-rendered to rendered.
5. `display` and `overlay` remain discrete transitions so the browser keeps the
   dialog rendered and in the top layer for the visual transition.
6. The surface fills the root and owns only paint, shape, elevation, and content
   layout. It has no competing translation or opacity animation.

This makes the positioned modal box, animated box, hit-test area, and painted
sheet share the same geometry. Detached variants express their gap through the
root's inset and size instead of padding a viewport-sized modal.

## Rules for future changes

- Keep viewport placement and translation on the top-layer element when the
  entire modal surface moves as one unit.
- Keep one mechanism in charge of a property during a phase. Do not combine a
  transition and keyframes for the same entry `transform`.
- Do not use a transparent viewport-sized wrapper unless the wrapper itself has
  a real full-viewport responsibility that cannot be served by `::backdrop`.
- Treat scroll locking and overlay motion as separate systems. First prove that
  a scrollbar change alters the moving element's measured geometry before
  adding compensation.
- For transient motion defects, repeat the interaction and sample bounding
  rectangles per animation frame. Verify monotonic progress as well as final
  position.
- Test start, end, docked, detached, narrow viewport, reduced motion, and pages
  with enough content to show a scrollbar.

## References

- [MDN: `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style)
- [MDN: `::backdrop`](https://developer.mozilla.org/docs/Web/CSS/%3A%3Abackdrop)
- [CSS Positioned Layout Module Level 4: top layer](https://drafts.csswg.org/css-position-4/#top-layer)
