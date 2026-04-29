type MinimalHotUpdateContext = {
  file: string;
  server: {
    moduleGraph: {
      getModuleById(id: string): unknown;
      invalidateModule(module: unknown): void;
    };
    ws: {
      send(payload: { type: 'full-reload'; path: string }): void;
    };
  };
};

export function normalizeVitePath(file: string): string {
  return file.replace(/\\/g, '/');
}

export function invalidateVirtualModuleAndReload(ctx: MinimalHotUpdateContext, resolvedVirtualModuleId: string): void {
  const module = ctx.server.moduleGraph.getModuleById(resolvedVirtualModuleId);
  if (module) {
    ctx.server.moduleGraph.invalidateModule(module);
  }

  ctx.server.ws.send({
    type: 'full-reload',
    path: '*',
  });
}

export type { MinimalHotUpdateContext };
