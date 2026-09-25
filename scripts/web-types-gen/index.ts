import fs from 'node:fs/promises';
import path from 'node:path';
import { createChecker, type MetaCheckerOptions, type PropertyMeta, type PropertyMetaSchema } from 'vue-component-meta';
import ts from 'typescript';
import type { Plugin } from 'vite';

type WebTypesTypedContribution = {
  name: string;
  description?: string;
  type?: string;
  default?: string;
  required?: boolean;
};

type WebTypesSlot = {
  name: string;
  description?: string;
  'vue-properties'?: WebTypesTypedContribution[];
};

type WebTypesComponent = {
  name: string;
  description?: string;
  source: {
    module: string;
    symbol: string;
  };
  props: WebTypesTypedContribution[];
  slots: WebTypesSlot[];
  js: {
    events: WebTypesTypedContribution[];
  };
};

export type WebTypesJson = {
  $schema: string;
  framework: 'vue';
  name: string;
  version: string;
  'js-types-syntax': 'typescript';
  'description-markup': 'markdown';
  contributions: {
    html: {
      'vue-components': WebTypesComponent[];
    };
  };
};

export type WebTypesPluginOptions = {
  /** TypeScript config used by vue-component-meta and public export discovery. */
  tsconfigPath: string;

  /** Public package entry points whose exported Vue components are documented. */
  entryPoints: string | string[];

  /** Output path relative to the project root. */
  outFile?: string;

  /** Package metadata defaults to the root package.json values. */
  packageName?: string;
  packageVersion?: string;

  /** Additional vue-component-meta options. Schema parsing is always enabled. */
  checkerOptions?: MetaCheckerOptions;
};

type PublicComponent = {
  exportName: string;
  file: string;
};

function resolveFromRoot(root: string, file: string): string {
  return path.isAbsolute(file) ? file : path.resolve(root, file);
}

async function readPackage(root: string): Promise<{ name: string; version: string }> {
  const contents = await fs.readFile(path.join(root, 'package.json'), 'utf8');
  const packageJson = JSON.parse(contents) as { name?: string; version?: string };

  return {
    name: packageJson.name ?? 'unnamed-package',
    version: packageJson.version ?? '0.0.0',
  };
}

function withoutUndefined(type: string): string {
  const source = ts.createSourceFile(
    'web-types-value.ts',
    `type WebTypesValue = ${type};`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const statement = source.statements[0];
  if (!statement || !ts.isTypeAliasDeclaration(statement)) {
    return type.trim() || 'any';
  }

  if (statement.type.kind === ts.SyntaxKind.UndefinedKeyword) {
    return 'any';
  }

  if (!ts.isUnionTypeNode(statement.type)) {
    return statement.type.getText(source);
  }

  const members = statement.type.types
    .filter((member) => member.kind !== ts.SyntaxKind.UndefinedKeyword)
    .map((member) => member.getText(source));

  return members.join(' | ') || 'any';
}

function schemaMemberType(schema: PropertyMetaSchema): string {
  return typeof schema === 'string' ? schema : schema.type;
}

function propertyType(property: Pick<PropertyMeta, 'schema' | 'type'>): string {
  const rawType = withoutUndefined(property.type || 'any');
  if (typeof property.schema === 'string' || property.schema.kind !== 'enum') {
    return rawType;
  }

  const schemaType = withoutUndefined(property.schema.type);
  if (schemaType === 'boolean' || schemaType === 'number' || schemaType === 'string') {
    return schemaType;
  }

  const members = (property.schema.schema ?? [])
    .map(schemaMemberType)
    .map(withoutUndefined)
    .filter((member) => member !== 'any')
    .filter((member, index, all) => all.indexOf(member) === index)
    .sort();

  return members.join(' | ') || rawType;
}

function normalizeDefault(value: string | undefined): string | undefined {
  if (value === undefined || value === 'undefined') {
    return undefined;
  }

  const source = ts.createSourceFile(
    'web-types-default.ts',
    `const webTypesDefault = ${value};`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const statement = source.statements[0];
  if (statement && ts.isVariableStatement(statement)) {
    const initializer = statement.declarationList.declarations[0]?.initializer;
    if (initializer && (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer))) {
      return initializer.text;
    }
  }

  return value;
}

function typedContribution(property: PropertyMeta): WebTypesTypedContribution {
  const contribution: WebTypesTypedContribution = {
    name: property.name,
    type: propertyType(property),
    required: property.required,
  };

  if (property.description) {
    contribution.description = property.description;
  }

  const defaultValue = normalizeDefault(property.default);
  if (defaultValue !== undefined) {
    contribution.default = defaultValue;
  }

  return contribution;
}

function discoverPublicComponents(checker: ReturnType<typeof createChecker>, entryPoints: string[]): PublicComponent[] {
  for (const entryPoint of entryPoints) {
    checker.getExportNames(entryPoint);
  }

  const program = checker.getProgram();
  if (!program) {
    throw new Error('vue-component-meta did not create a TypeScript program');
  }

  const typeChecker = program.getTypeChecker();
  const components = new Map<string, PublicComponent>();

  for (const entryPoint of entryPoints) {
    const sourceFile = program.getSourceFile(entryPoint);
    const moduleSymbol = sourceFile && typeChecker.getSymbolAtLocation(sourceFile);
    if (!sourceFile || !moduleSymbol) {
      throw new Error(`Unable to resolve public entry point: ${entryPoint}`);
    }

    for (const exportedSymbol of typeChecker.getExportsOfModule(moduleSymbol)) {
      const target =
        exportedSymbol.flags & ts.SymbolFlags.Alias ? typeChecker.getAliasedSymbol(exportedSymbol) : exportedSymbol;

      if (!(target.flags & ts.SymbolFlags.Value)) {
        continue;
      }

      const vueFiles = [
        ...new Set(
          (target.declarations ?? [])
            .map((declaration) => declaration.getSourceFile().fileName)
            .filter((file) => file.endsWith('.vue')),
        ),
      ];

      if (vueFiles.length === 0) {
        continue;
      }
      if (vueFiles.length > 1) {
        throw new Error(`Component export ${exportedSymbol.name} resolves to multiple Vue files`);
      }

      const existing = components.get(exportedSymbol.name);
      if (existing && existing.file !== vueFiles[0]) {
        throw new Error(`Duplicate component export ${exportedSymbol.name} resolves to different Vue files`);
      }

      components.set(exportedSymbol.name, {
        exportName: exportedSymbol.name,
        file: vueFiles[0],
      });
    }
  }

  return [...components.values()].sort((left, right) => left.exportName.localeCompare(right.exportName));
}

function slotProperties(schema: PropertyMetaSchema): WebTypesTypedContribution[] | undefined {
  if (typeof schema === 'string' || schema.kind !== 'object' || !schema.schema) {
    return undefined;
  }

  const properties = Object.values(schema.schema)
    .map(typedContribution)
    .sort((left, right) => left.name.localeCompare(right.name));

  return properties.length ? properties : undefined;
}

export async function generateWebTypes(options: WebTypesPluginOptions, root = process.cwd()): Promise<WebTypesJson> {
  const packageMetadata = await readPackage(root);
  const packageName = options.packageName ?? packageMetadata.name;
  const packageVersion = options.packageVersion ?? packageMetadata.version;
  const tsconfigPath = resolveFromRoot(root, options.tsconfigPath);
  const entryPoints = (Array.isArray(options.entryPoints) ? options.entryPoints : [options.entryPoints])
    .map((entryPoint) => resolveFromRoot(root, entryPoint))
    .sort();
  const checker = createChecker(tsconfigPath, {
    ...options.checkerOptions,
    schema: true,
  });

  const components = discoverPublicComponents(checker, entryPoints).map(({ exportName, file }) => {
    const meta = checker.getComponentMeta(file);
    const props = meta.props
      .filter((property) => !property.global)
      .map(typedContribution)
      .sort((left, right) => left.name.localeCompare(right.name));
    const slots = meta.slots
      .map((slot): WebTypesSlot => {
        const contribution: WebTypesSlot = { name: slot.name };
        if (slot.description) {
          contribution.description = slot.description;
        }
        const properties = slotProperties(slot.schema);
        if (properties) {
          contribution['vue-properties'] = properties;
        }
        return contribution;
      })
      .sort((left, right) => left.name.localeCompare(right.name));
    const events = meta.events
      .map((event): WebTypesTypedContribution => {
        const contribution: WebTypesTypedContribution = {
          name: event.name,
          type: event.type,
        };
        if (event.description) {
          contribution.description = event.description;
        }
        return contribution;
      })
      .sort((left, right) => left.name.localeCompare(right.name));

    const component: WebTypesComponent = {
      name: exportName,
      source: {
        module: packageName,
        symbol: exportName,
      },
      props,
      slots,
      js: { events },
    };
    if (meta.description) {
      component.description = meta.description;
    }

    return component;
  });

  return {
    $schema: 'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
    framework: 'vue',
    name: packageName,
    version: packageVersion,
    'js-types-syntax': 'typescript',
    'description-markup': 'markdown',
    contributions: {
      html: {
        'vue-components': components,
      },
    },
  };
}

export function webTypesFromVueComponentMeta(options: WebTypesPluginOptions): Plugin {
  const outFile = options.outFile ?? 'web-types.json';

  return {
    name: 'vite:web-types-from-vue-component-meta',
    apply: 'build',

    async buildStart() {
      const root = process.cwd();
      const webTypes = await generateWebTypes(options, root);
      const outputPath = resolveFromRoot(root, outFile);
      await fs.writeFile(outputPath, `${JSON.stringify(webTypes, null, 2)}\n`, 'utf8');
      this.info(
        `web-types generated: ${path.relative(root, outputPath)} (${webTypes.contributions.html['vue-components'].length} components)`,
      );
    },
  };
}
