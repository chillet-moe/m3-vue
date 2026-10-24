import { showDialog, type ShowDialogOptions } from './components/Dialog/showDialog';
import { showSnackbar, useSnackbar, type ShowSnackbarOptions } from './components/Snackbar/showSnackbar';
import { useOverlayHost, type OverlayHostController } from './internal/overlayHost/overlayHost';

export type OverlayService = {
  showDialog: (options?: ShowDialogOptions) => Promise<string>;
  showSnackbar: (options?: ShowSnackbarOptions) => Promise<string>;
};

/** Bind programmatic overlays to a UI host without requiring a Vue setup context. */
export function createOverlayService(host: OverlayHostController): OverlayService {
  return {
    showDialog: (options) => showDialog(host, options),
    showSnackbar: (options) => showSnackbar(host, options),
  };
}

/** Capture the provided host and reactive subtree snackbar defaults during setup. */
export function useOverlays(): OverlayService {
  const host = useOverlayHost();
  return {
    showDialog: (options) => showDialog(host, options),
    showSnackbar: useSnackbar(),
  };
}
