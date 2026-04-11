# Remove Unused CSS Variables Script

这是一个用 TypeScript 编写的脚本，用于自动删除 CSS 文件中未使用的变量定义。

## 功能特性

- ✓ 扫描 CSS 文件中的变量定义
- ✓ 识别在 CSS 规则中使用的变量
- ✓ 自动删除未使用的变量定义
- ✓ 支持自定义变量前缀
- ✓ 提供详细的统计信息和日志
- ✓ 可导出为 TypeScript 模块使用

## 使用方法

### 命令行使用

#### 基础用法
```bash
pnpm remove-unused-vars <css-file-path>
```

#### 示例
```bash
# 处理 Button 组件的 CSS 文件
pnpm remove-unused-vars src/components/Button/Button.css

# 处理多个文件
pnpm remove-unused-vars src/components/Button/Button.css
pnpm remove-unused-vars src/components/Card/Card.css
```

#### 选项

- `--no-verbose`: 静默模式，不打印详细日志

```bash
pnpm remove-unused-vars src/components/Button/Button.css --no-verbose
```

### 代码中使用

```typescript
import { removeUnusedCssVariables } from './scripts/remove-unused-vars/index.ts';

const result = await removeUnusedCssVariables({
  filePath: 'src/components/Button/Button.css',
  verbose: true,
  varPrefix: '--', // 可选，默认为 '--'
});

if (result.success) {
  console.log(`删除了 ${result.removed} 个未使用的变量`);
  console.log(`定义总数: ${result.defined}`);
  console.log(`使用总数: ${result.used}`);
} else {
  console.error(result.message);
}
```

## 返回结果

函数返回一个 `CleanupResult` 对象：

```typescript
interface CleanupResult {
  success: boolean;        // 操作是否成功
  removed: number;         // 删除的变量数
  defined: number;         // 定义的变量总数
  used: number;            // 使用的变量总数
  message: string;         // 结果消息
  unusedVars?: string[];   // 未使用的变量列表（可选）
}
```

## 工作原理

1. **读取文件**: 读取指定的 CSS 文件
2. **提取定义**: 从 `@layer tokens` 部分提取所有变量定义
3. **提取使用**: 从 CSS 规则中提取所有被使用的变量
4. **对比**: 找出未使用的变量
5. **删除**: 删除定义未使用变量的行
6. **保存**: 将修改后的内容写入文件

## 限制

- 目前仅支持在 `@layer tokens { ... }` 中定义的变量
- 变量必须通过 `var()` 函数使用才会被识别
- 不支持删除 CSS 中的其他类型的规则

## 示例输出

```
📋 处理文件: src/components/Button/Button.css
-------------------------------------------
✓ 删除了 185 个未使用的变量
  定义的变量: 327
  使用的变量: 150
  未使用的变量: 185
-------------------------------------------
✓ 成功删除了 185 个未使用的变量
📊 变量减少比例: 56%
```

## 相关文件

- 脚本主文件: `scripts/remove-unused-vars/index.ts`
- 在 package.json 中添加了 `remove-unused-vars` npm 脚本
- 使用 `tsx` 作为 TypeScript 执行器

## 故障排除

### "文件不存在" 错误
检查提供的文件路径是否正确

### 变量未被识别
确保变量定义在 `@layer tokens { ... }` 块中，并且使用 `var(--variable-name)` 格式

### 权限错误
确保脚本有读写文件的权限

