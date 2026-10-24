---
title: InputOtp
---

<script setup lang="ts">
import { ref } from 'vue';
import { InputOtp } from '@/components/InputOtp';

import InputOtpDefault from '../../demos/input-otp/InputOtpDefault.vue';
import InputOtpDefaultSrc from '../../demos/input-otp/InputOtpDefault.vue?raw';
import InputOtpStates from '../../demos/input-otp/InputOtpStates.vue';
import InputOtpStatesSrc from '../../demos/input-otp/InputOtpStates.vue?raw';

const props = ref({
  length: 6,
  size: 'medium',
  type: 'number',
  mask: false,
  invalid: false,
  disabled: false,
  required: false,
  readonly: false,
  placeholder: '',
});

const modelValue = ref('');
</script>

# InputOtp

OTP 输入框用于收集简短的一次性验证码，提供单字符输入格、键盘导航、粘贴分配和表单提交支持。

<DemoContainer>
  <div style="display: grid; gap: 0.25rem;">
    <label id="input-otp-preview-label" style="color: var(--md-sys-color-on-surface-variant); font-size: var(--md-sys-typescale-body-small-size); line-height: var(--md-sys-typescale-body-small-line-height);">验证码</label>
    <InputOtp v-bind="props" v-model="modelValue" aria-labelledby="input-otp-preview-label" />
  </div>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="InputOtpDefaultSrc">
  <InputOtpDefault />
</DemoContainer>

### 状态

<DemoContainer :src="InputOtpStatesSrc">
  <InputOtpStates />
</DemoContainer>

## 参考

<AnatomyTable scope="input-otp" />

<ApiTable component="InputOtp" v-model="props" :exclude="['id', 'name', 'autocomplete', 'inputMode']" />

<StyleTokenTable component="InputOtp" />
