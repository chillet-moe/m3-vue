/**
 * 使用 remove-unused-vars 脚本的示例
 * 
 * 这个示例展示了如何在其他脚本中使用 removeUnusedCssVariables 函数
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { removeUnusedCssVariables } from './index.ts';

/**
 * 示例 1: 批量处理多个 CSS 文件
 */
export async function cleanupMultipleFiles() {
  const cssFiles = [
    'src/components/Button/Button.css',
    'src/components/Card/Card.css',
    'src/components/Dialog/Dialog.css',
  ];

  console.log('🧹 开始清理 CSS 文件中的未使用变量...\n');

  let totalRemoved = 0;
  let totalDefined = 0;
  let totalUsed = 0;

  for (const file of cssFiles) {
    const result = await removeUnusedCssVariables({
      filePath: file,
      verbose: false,
    });

    if (result.success) {
      console.log(`✓ ${file}`);
      console.log(`  移除: ${result.removed}个 | 定义: ${result.defined}个 | 使用: ${result.used}个`);
      totalRemoved += result.removed;
      totalDefined += result.defined;
      totalUsed += result.used;
    } else {
      console.log(`✗ ${file}: ${result.message}`);
    }
  }

  console.log('\n📊 总统计:');
  console.log(`  总共移除: ${totalRemoved} 个变量`);
  console.log(`  总共定义: ${totalDefined} 个变量`);
  console.log(`  总共使用: ${totalUsed} 个变量`);
}

/**
 * 示例 2: 处理单个文件并获取详细信息
 */
async function cleanupWithDetails() {
  const result = await removeUnusedCssVariables({
    filePath: 'src/components/Button/Button.css',
    verbose: true,
  });

  if (result.success && result.unusedVars) {
    console.log('\n🔍 未使用的变量列表:');
    result.unusedVars.forEach((variable) => {
      console.log(`  - ${variable}`);
    });
  }
}

/**
 * 示例 3: 自定义变量前缀
 */
async function cleanupWithCustomPrefix() {
  // 如果你的 CSS 使用不同的变量前缀（如 $var 或 @var）
  await removeUnusedCssVariables({
    filePath: 'src/custom-style.css',
    varPrefix: '$', // 自定义前缀
    verbose: true,
  });
}

// 运行示例
if (import.meta.main) {
  console.log('示例 1: 批量处理多个文件');
  console.log('================================\n');
  await cleanupMultipleFiles();

  console.log('\n\n示例 2: 处理单个文件并获取详细信息');
  console.log('================================\n');
  // 取消注释以运行
  // await cleanupWithDetails();
}

