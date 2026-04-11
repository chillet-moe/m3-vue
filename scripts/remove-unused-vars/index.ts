import fs from 'node:fs';

export interface RemoveUnusedVarsOptions {
  /** CSS 文件路径 */
  filePath: string;
  /** 是否打印详细日志 */
  verbose?: boolean;
  /** 自定义变量前缀（默认为 --） */
  varPrefix?: string;
}

export interface CleanupResult {
  success: boolean;
  removed: number;
  defined: number;
  used: number;
  message: string;
  unusedVars?: string[];
}

/**
 * 从 CSS 文件中删除未使用的变量
 * @param options 配置选项
 * @returns 清理结果
 */
export async function removeUnusedCssVariables(options: RemoveUnusedVarsOptions): Promise<CleanupResult> {
  const { filePath, verbose = true, varPrefix = '--' } = options;

  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        removed: 0,
        defined: 0,
        used: 0,
        message: `❌ 文件不存在: ${filePath}`,
      };
    }

    // 读取文件
    const content = fs.readFileSync(filePath, 'utf-8');

    // 提取变量定义部分（假设在 @layer tokens 中）
    const tokenMatch = content.match(/@layer tokens \{([\s\S]*?)}/);
    if (!tokenMatch) {
      if (verbose) {
        console.log('⚠️ 未找到 @layer tokens 部分');
      }
      return {
        success: true,
        removed: 0,
        defined: 0,
        used: 0,
        message: '⚠️ 未找到 @layer tokens 部分，跳过处理',
      };
    }

    const tokenSection = tokenMatch[1];

    // 提取所有定义的变量
    const varPattern = new RegExp(`${varPrefix}[\\w-]+`, 'g');
    const definedVarsMatch = tokenSection.match(varPattern) || [];
    const definedVars = [...new Set(definedVarsMatch)].sort();

    // 提取所有使用的变量（在 @layer tokens 之外）
    const cssRules = content.replace(/@layer tokens \{[\s\S]*?}/, '');
    const usedVarsMatch = cssRules.match(varPattern) || [];
    const usedVars = [...new Set(usedVarsMatch)].sort();

    // 找出未使用的变量
    const unusedVars = definedVars.filter((variable) => !usedVars.includes(variable));

    if (unusedVars.length === 0) {
      if (verbose) {
        console.log('✓ 所有变量都被使用了！');
      }
      return {
        success: true,
        removed: 0,
        defined: definedVars.length,
        used: usedVars.length,
        message: '✓ 所有变量都被使用了！',
      };
    }

    // 创建未使用变量集合
    const unusedSet = new Set(unusedVars);

    // 处理每一行，删除定义未使用变量的行
    const lines = content.split('\n');
    const newLines = [];

    for (const line of lines) {
      let shouldRemove = false;

      for (const variable of unusedSet) {
        if (line.includes(`${variable}:`)) {
          shouldRemove = true;
          break;
        }
      }

      if (!shouldRemove) {
        newLines.push(line);
      }
    }

    const newContent = newLines.join('\n');

    // 保存修改后的文件
    fs.writeFileSync(filePath, newContent, 'utf-8');

    if (verbose) {
      console.log(`✓ 删除了 ${unusedVars.length} 个未使用的变量`);
      console.log(`  定义的变量: ${definedVars.length}`);
      console.log(`  使用的变量: ${usedVars.length}`);
      console.log(`  未使用的变量: ${unusedVars.length}`);
    }

    return {
      success: true,
      removed: unusedVars.length,
      defined: definedVars.length,
      used: usedVars.length,
      message: `✓ 成功删除了 ${unusedVars.length} 个未使用的变量`,
      unusedVars,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      removed: 0,
      defined: 0,
      used: 0,
      message: `❌ 处理失败: ${errorMessage}`,
    };
  }
}

/**
 * 主入口 - 用于命令行调用
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  npx ts-node scripts/remove-unused-vars/index.ts <css-file-path> [options]');
    console.log('');
    console.log('示例:');
    console.log('  npx ts-node scripts/remove-unused-vars/index.ts src/components/Button/Button.css');
    console.log('  npx ts-node scripts/remove-unused-vars/index.ts src/components/Button/Button.css --no-verbose');
    process.exit(1);
  }

  const filePath = args[0];
  const verbose = !args.includes('--no-verbose');

  console.log(`📋 处理文件: ${filePath}`);
  console.log('-------------------------------------------');

  const result = await removeUnusedCssVariables({
    filePath,
    verbose,
  });

  console.log('-------------------------------------------');
  console.log(result.message);

  if (result.success && result.removed > 0) {
    const reduction = Math.round((result.removed / result.defined) * 100);
    console.log(`📊 变量减少比例: ${reduction}%`);
  }

  process.exit(result.success ? 0 : 1);
}

// 如果直接运行此文件
if (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('scripts/remove-unused-vars/index.ts')) {
  main().catch((error) => {
    console.error('❌ 脚本错误:', error);
    process.exit(1);
  });
}
