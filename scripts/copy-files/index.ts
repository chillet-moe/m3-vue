import type { Plugin, ResolvedConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

export interface CopyFilesOptions {
  /**
   * 要复制的文件或目录列表
   * 支持 glob 模式或具体路径
   */
  targets: Array<{
    /**
     * 源文件路径（相对于项目根目录）
     */
    src: string;
    /**
     * 目标路径（相对于输出目录）
     * 如果不指定，则保持原有路径结构
     */
    dest?: string;
    /**
     * 重命名文件
     */
    rename?: string;
  }>;
  /**
   * 是否在复制时打印日志
   * @default true
   */
  verbose?: boolean;
}

/**
 * 复制文件到 dist 目录的 Vite 插件
 */
export function copyFiles(options: CopyFilesOptions): Plugin {
  const { targets, verbose = true } = options;
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-copy-files',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async closeBundle() {
      const outDir = config.build.outDir;
      const root = config.root;

      for (const target of targets) {
        const srcPath = path.resolve(root, target.src);

        if (!fs.existsSync(srcPath)) {
          config.logger.warn(`[copy-files] Source not found: ${srcPath}`);
          continue;
        }

        const stats = fs.statSync(srcPath);
        let destPath: string;

        if (stats.isDirectory()) {
          // 复制整个目录
          destPath = path.resolve(root, outDir, target.dest ?? path.basename(target.src));
          await copyDir(srcPath, destPath);
        } else {
          // 复制单个文件
          const fileName = target.rename ?? path.basename(target.src);
          destPath = path.resolve(
            root,
            outDir,
            target.dest ? path.join(target.dest, fileName) : fileName
          );

          // 确保目标目录存在
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          fs.copyFileSync(srcPath, destPath);
        }

        if (verbose) {
          const relativeSrc = path.relative(root, srcPath);
          const relativeDest = path.relative(root, destPath);
          config.logger.info(`[copy-files] ${relativeSrc} -> ${relativeDest}`);
        }
      }
    },
  };
}

/**
 * 递归复制目录
 */
async function copyDir(src: string, dest: string): Promise<void> {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default copyFiles;

