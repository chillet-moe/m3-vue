import path from 'node:path';
import ts from 'typescript';
import { createChecker as createVueMetaChecker } from 'vue-component-meta';
import { invalidateVirtualModuleAndReload, normalizeVitePath, type MinimalHotUpdateContext } from './hmr';

export interface SourceApiFieldMeta {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface SourceApiTypeMeta {
  name: string;
  fields: SourceApiFieldMeta[];
}

export interface SourceApiMeta {
  id: string;
  signature: string;
  source: string;
  types: SourceApiTypeMeta[];
}

type TypeSpec = {
  name: string;
  fieldOrder?: string[];
  componentProps?: {
    file: string;
    names: string[];
  };
};

type ApiEntry = {
  id: string;
  source: string;
  functionName: string;
  types: TypeSpec[];
};

const API_ENTRIES: ApiEntry[] = [
  {
    id: 'useTabs',
    source: 'src/composables/useTabs.ts',
    functionName: 'useTabs',
    types: [{ name: 'UseTabsOptions' }, { name: 'UseTabsReturn' }],
  },
  {
    id: 'useMenu',
    source: 'src/composables/useMenu.ts',
    functionName: 'useMenu',
    types: [{ name: 'UseMenuOptions' }, { name: 'UseMenuReturn' }],
  },
  {
    id: 'useSelect',
    source: 'src/composables/useSelect.ts',
    functionName: 'useSelect',
    types: [{ name: 'UseSelectOptions' }, { name: 'UseSelectReturn' }],
  },
  {
    id: 'showDialog',
    source: 'src/components/Dialog/showDialog.ts',
    functionName: 'showDialog',
    types: [
      {
        name: 'ShowDialogOptions',
        fieldOrder: ['headline', 'content', 'icon', 'actions', 'closeOnBackdrop', 'role'],
        componentProps: {
          file: 'src/components/Dialog/Dialog.vue',
          names: ['closeOnBackdrop'],
        },
      },
      { name: 'DialogAction' },
    ],
  },
  {
    id: 'showSnackbar',
    source: 'src/components/Snackbar/showSnackbar.ts',
    functionName: 'showSnackbar',
    types: [
      {
        name: 'ShowSnackbarOptions',
        fieldOrder: [
          'message',
          'action',
          'duration',
          'timeoutValue',
          'dismissValue',
          'position',
          'actionOnNewLine',
          'dismissible',
          'dismissButtonLabel',
        ],
        componentProps: {
          file: 'src/components/Snackbar/Snackbar.vue',
          names: ['actionOnNewLine', 'dismissible', 'dismissButtonLabel'],
        },
      },
      { name: 'SnackbarAction' },
    ],
  },
  {
    id: 'vTooltip',
    source: 'src/directives/Tooltip/types.ts',
    functionName: 'vTooltip',
    types: [
      {
        name: 'TooltipConfig',
        fieldOrder: [
          'target',
          'content',
          'placement',
          'offset',
          'interactive',
          'popoverType',
          'openDelay',
          'closeDelay',
          'longpressDelay',
        ],
      },
    ],
  },
  {
    id: 'vDropdown',
    source: 'src/directives/Dropdown/helpers.ts',
    functionName: 'resolveDropdownTarget',
    types: [
      {
        name: 'DropdownTargetBinding',
        fieldOrder: ['target', 'anchor', 'closeOnOutsideClick'],
      },
    ],
  },
];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanDefault(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const next = value.trim();
  if (!next || next === 'undefined') {
    return undefined;
  }
  return next;
}

function getSourceFile(program: ts.Program, absolutePath: string): ts.SourceFile | undefined {
  const normalized = path.normalize(absolutePath);
  return (
    program.getSourceFile(absolutePath) ??
    program.getSourceFiles().find((sourceFile) => path.normalize(sourceFile.fileName) === normalized)
  );
}

function getExportSymbol(checker: ts.TypeChecker, sourceFile: ts.SourceFile, name: string): ts.Symbol | undefined {
  const sf = sourceFile as ts.SourceFile & { symbol?: ts.Symbol };
  if (!sf.symbol) {
    return undefined;
  }
  const symbol = checker.getExportsOfModule(sf.symbol).find((item) => item.name === name);
  if (!symbol) {
    return undefined;
  }
  if (symbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(symbol);
  }
  return symbol;
}

function getJsDocComment(node: ts.Node): string | undefined {
  const docs = (node as ts.Node & { jsDoc?: ts.JSDoc[] }).jsDoc;
  if (!docs?.length) {
    return undefined;
  }
  const text = docs
    .map((doc) => {
      if (!doc.comment) {
        return '';
      }
      return typeof doc.comment === 'string' ? doc.comment : doc.comment.map((part) => part.text).join(' ');
    })
    .filter(Boolean)
    .join(' ');

  const normalized = normalizeText(text);
  return normalized || undefined;
}

function collectFieldsFromTypeChecker(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  typeName: string,
): SourceApiFieldMeta[] {
  const symbol = getExportSymbol(checker, sourceFile, typeName);
  if (!symbol) {
    return [];
  }

  const declaredType = checker.getDeclaredTypeOfSymbol(symbol);
  const properties = checker.getPropertiesOfType(declaredType);

  return properties.map((property) => {
    const declaration = property.valueDeclaration ?? property.declarations?.[0] ?? sourceFile;
    const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);
    let typeText = checker.typeToString(propertyType, declaration, ts.TypeFormatFlags.NoTruncation);
    if (typeText === 'any' && ts.isPropertySignature(declaration) && declaration.type) {
      typeText = declaration.type.getText(sourceFile);
    }

    const docs = normalizeText(ts.displayPartsToString(property.getDocumentationComment(checker)));
    const defaultTag = property.getJsDocTags().find((tag) => tag.name === 'default');
    const defaultText = cleanDefault(
      typeof defaultTag?.text === 'string'
        ? defaultTag.text
        : (defaultTag?.text ?? []).map((part) => part.text).join(''),
    );

    return {
      name: property.name,
      type: normalizeText(typeText),
      required: (property.flags & ts.SymbolFlags.Optional) === 0,
      description: docs || undefined,
      defaultValue: defaultText,
    };
  });
}

function collectFieldsFromTypeNode(sourceFile: ts.SourceFile, typeName: string): SourceApiFieldMeta[] {
  const rows: SourceApiFieldMeta[] = [];

  const collectMembers = (members: ts.NodeArray<ts.TypeElement>) => {
    for (const member of members) {
      if (!ts.isPropertySignature(member) || !member.name) {
        continue;
      }

      const name = member.name.getText(sourceFile).replace(/^["']|["']$/g, '');
      const typeText = normalizeText(member.type ? member.type.getText(sourceFile) : 'unknown');
      const defaultTag = ts.getJSDocTags(member).find((tag) => tag.tagName.text === 'default');
      const defaultText = cleanDefault(defaultTag?.comment ? String(defaultTag.comment) : undefined);
      const description = getJsDocComment(member);

      rows.push({
        name,
        type: typeText,
        required: !member.questionToken,
        description,
        defaultValue: defaultText,
      });
    }
  };

  const collectFromTypeNode = (typeNode: ts.TypeNode) => {
    if (ts.isTypeLiteralNode(typeNode)) {
      collectMembers(typeNode.members);
      return;
    }
    if (ts.isIntersectionTypeNode(typeNode) || ts.isUnionTypeNode(typeNode)) {
      for (const part of typeNode.types) {
        collectFromTypeNode(part);
      }
    }
  };

  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
      collectFromTypeNode(node.type);
    }

    if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) {
      collectMembers(node.members);
    }
  });

  return rows;
}

function collectFields(checker: ts.TypeChecker, sourceFile: ts.SourceFile, typeName: string): SourceApiFieldMeta[] {
  const fromChecker = collectFieldsFromTypeChecker(checker, sourceFile, typeName);
  if (fromChecker.length > 0) {
    return fromChecker;
  }
  return collectFieldsFromTypeNode(sourceFile, typeName);
}

function mergeFields(baseFields: SourceApiFieldMeta[], nextFields: SourceApiFieldMeta[]): SourceApiFieldMeta[] {
  const result = new Map<string, SourceApiFieldMeta>();
  for (const row of baseFields) {
    result.set(row.name, row);
  }
  for (const row of nextFields) {
    const prev = result.get(row.name);
    result.set(row.name, { ...prev, ...row });
  }
  return [...result.values()];
}

function reorderFields(fields: SourceApiFieldMeta[], fieldOrder?: string[]): SourceApiFieldMeta[] {
  if (!fieldOrder?.length) {
    return fields;
  }

  const rank = new Map<string, number>();
  for (const [index, name] of fieldOrder.entries()) {
    rank.set(name, index);
  }

  return [...fields].sort((a, b) => {
    const aRank = rank.get(a.name);
    const bRank = rank.get(b.name);
    if (aRank !== undefined && bRank !== undefined) {
      return aRank - bRank;
    }
    if (aRank !== undefined) {
      return -1;
    }
    if (bRank !== undefined) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function getFunctionSignature(checker: ts.TypeChecker, sourceFile: ts.SourceFile, functionName: string): string {
  const symbol = getExportSymbol(checker, sourceFile, functionName);
  if (!symbol?.declarations?.length) {
    return `${functionName}(...)`;
  }
  const declaration = symbol.declarations[0]!;
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = type.getCallSignatures()[0];
  if (!signature) {
    return `${functionName}(...)`;
  }
  return `function ${functionName}${checker.signatureToString(signature, declaration, ts.TypeFormatFlags.NoTruncation)}`;
}

function collectComponentProps(tsconfigPath: string, componentFile: string, propNames: string[]): SourceApiFieldMeta[] {
  const checker = createVueMetaChecker(tsconfigPath, {
    forceUseTs: true,
    printer: { newLine: 1 },
  });
  const meta = checker.getComponentMeta(componentFile);

  return propNames
    .map((name) => (meta.props ?? []).find((prop) => prop.name === name))
    .filter((prop): prop is NonNullable<typeof prop> => Boolean(prop))
    .map((prop) => ({
      name: prop.name,
      type: normalizeText(prop.type ?? 'unknown'),
      required: Boolean(prop.required),
      description: prop.description || undefined,
      defaultValue: cleanDefault(prop.default),
    }));
}

export function sourceApiMetaPlugin(options?: { tsconfigPath?: string }) {
  const virtualModuleId = 'virtual:source-api-meta';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const root = process.cwd();
  const tsconfigAbsPath = path.isAbsolute(options?.tsconfigPath ?? '')
    ? (options?.tsconfigPath as string)
    : path.join(root, options?.tsconfigPath ?? 'tsconfig.docs.json');

  let metaMap: Record<string, SourceApiMeta> = {};

  async function generateMeta() {
    const configFile = ts.readConfigFile(tsconfigAbsPath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
    }

    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigAbsPath));
    const program = ts.createProgram({
      rootNames: parsed.fileNames,
      options: parsed.options,
    });
    const checker = program.getTypeChecker();

    const nextMap: Record<string, SourceApiMeta> = {};

    for (const entry of API_ENTRIES) {
      const sourceAbsPath = path.join(root, entry.source);
      const sourceFile = getSourceFile(program, sourceAbsPath);
      if (!sourceFile) {
        continue;
      }

      const types: SourceApiTypeMeta[] = entry.types.map((typeSpec) => {
        let fields = collectFields(checker, sourceFile, typeSpec.name);
        if (typeSpec.componentProps) {
          const componentFields = collectComponentProps(
            tsconfigAbsPath,
            path.join(root, typeSpec.componentProps.file),
            typeSpec.componentProps.names,
          );
          fields = mergeFields(fields, componentFields);
        }
        fields = reorderFields(fields, typeSpec.fieldOrder);
        return {
          name: typeSpec.name,
          fields,
        };
      });

      nextMap[entry.id] = {
        id: entry.id,
        signature: getFunctionSignature(checker, sourceFile, entry.functionName),
        source: entry.source,
        types,
      };
    }

    metaMap = nextMap;
  }

  return {
    name: 'vitepress:source-api-meta',

    async buildStart() {
      await generateMeta();
    },

    resolveId(id: string) {
      if (id === virtualModuleId || id.startsWith(virtualModuleId + '/')) {
        return '\0' + id;
      }
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(metaMap)}`;
      }
      if (id.startsWith(resolvedVirtualModuleId + '/')) {
        const key = id.slice((resolvedVirtualModuleId + '/').length);
        return `export default ${JSON.stringify(metaMap[key] ?? null)}`;
      }
    },

    async handleHotUpdate(ctx: MinimalHotUpdateContext) {
      const normalized = normalizeVitePath(ctx.file);
      if (
        normalized.endsWith('.ts') &&
        (normalized.includes('/src/composables/') ||
          normalized.includes('/src/components/Dialog/') ||
          normalized.includes('/src/components/Snackbar/') ||
          normalized.includes('/src/directives/Tooltip/') ||
          normalized.includes('/src/directives/Dropdown/'))
      ) {
        await generateMeta();
        invalidateVirtualModuleAndReload(ctx, resolvedVirtualModuleId);
        return [];
      }
      if (
        normalized.endsWith('.vue') &&
        (normalized.includes('/src/components/Dialog/') || normalized.includes('/src/components/Snackbar/'))
      ) {
        await generateMeta();
        invalidateVirtualModuleAndReload(ctx, resolvedVirtualModuleId);
        return [];
      }
    },
  };
}
