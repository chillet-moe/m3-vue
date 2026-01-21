import React from 'react';
import { addons } from 'storybook/preview-api';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { themes } from 'storybook/theming';
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';

const channel = addons.getChannel();

function useIsDarkMode() {
  const [isDark, setIsDark] = React.useState<boolean>(false);

  React.useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, setIsDark);
    return () => channel.off(DARK_MODE_EVENT_NAME, setIsDark);
  }, []);

  return isDark;
}

export function ThemedDocsContainer(props: any) {
  const isDark = useIsDarkMode();
  return (
    // @ts-ignore
    <DocsContainer theme={isDark ? themes.dark : themes.light} context={props.context}>
      {props.children}
    </DocsContainer>
  );
}
