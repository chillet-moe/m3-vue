---
title: Multiple windows
---

# Multiple windows

m3-vue supports independently loaded browser windows and same-origin windows containing Vue subtrees from one execution environment. Ordinary components and directives derive their DOM environment from their elements. Consumers do not need to know whether a layout library uses cross-document rendering or moves existing DOM nodes.

## UI Ownership

Create an [overlay host](/components/overlay-host) for each independently owned application or panel. `useOverlays()` captures the nearest provided host and reactive subtree snackbar defaults during setup. Outside components, `createOverlayService(host)` binds both functions to an explicit host. Both return `showDialog(options)` and `showSnackbar(options)` functions that retain their ownership in asynchronous callbacks. `useSnackbar()` is available for notification-only consumers. Two applications in the same Document remain independent.

DOM services such as scroll locking, viewport listeners, tooltip delegation and state layers are shared only within their Document. Reference-counted resources are released when their owners are removed. Each window must load the library stylesheet and the application's fonts and theme; JavaScript cannot make a stylesheet from one Document apply to another.

## Moving Mounted Panels

A layout container may move an already-mounted panel into a same-origin Document and back without unmounting Vue. m3-vue rebinds document resources after adoption. Shared structural observation detects removal from the original Document without polling or one persistent observer per component. For a subtree detached across tasks, a temporary custom element adoption callback detects insertion into a new Document; no polling is used.

Move the complete interaction subtree: triggers, menus, tooltip targets and their host must remain together. A selector target is resolved in the trigger's Document. A trigger in one window cannot anchor a top-layer surface in another window. Transient pointer gestures may end during a move; start a new gesture after the panel arrives.

Programmatic ownership follows the host, not keyboard focus. If a panel retains a controller belonging to another host, its programmatic calls continue to render there. Document, Window and host controllers are runtime objects and must not be stored in persisted layout settings.

## Closing And Unmounting

Vue unmount and browser window closure are different operations. A browser close does not run Vue's unmount hooks. Document teardown releases m3-vue resources and rejects pending programmatic overlays, while ordinary Vue unmount releases the owning host directly. The application still owns disposal of its Vue application and its own event handlers, stores and other runtime resources.

Native browser top-layer, focus, popup and background-timer policies still apply. Cross-origin Documents, process termination and renderer crashes cannot provide normal JavaScript cleanup or observable promise completion. In Electron, windows must allow the same-origin DOM access used by the layout container; m3-vue does not bypass context isolation or provide inter-process communication.

Application data sharing, state synchronization, docking layouts, and cross-window RPC remain the responsibility of the application.
