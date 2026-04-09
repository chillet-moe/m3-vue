export type UnknownObject = Record<string, unknown>;

export function getArgs(args: UnknownObject, option: string, outerOption?: string) {
  const outerEnumProps: UnknownObject = {};
  const enumProps: UnknownObject = {};

  Object.entries(args)
    .filter(([, value]) => JSON.stringify(value)?.includes('{enumValue}'))
    .map(([key]) => key)
    .forEach((key) => {
      enumProps[key] = option;

      const isNotPrimitive = Object.keys(args[key] ?? {}).length || (Array.isArray(args[key]) && args[key].length);

      if (key in args && isNotPrimitive) {
        const replacedOption = JSON.stringify(args[key])?.replaceAll('{enumValue}', option);

        enumProps[key] = JSON.parse(replacedOption);
      }
    });

  Object.entries(args)
    .filter(([, value]) => JSON.stringify(value)?.includes('{outerEnumValue}'))
    .map(([key]) => key)
    .forEach((key) => {
      outerEnumProps[key] = option;

      const isNotPrimitive = Object.keys(args[key] ?? {}).length || (Array.isArray(args[key]) && args[key].length);

      if (key in args && isNotPrimitive) {
        const replacedOption = JSON.stringify(args[key])?.replaceAll('{outerEnumValue}', option);

        outerEnumProps[key] = JSON.parse(replacedOption);
      }
    });

  return {
    ...args,
    ...enumProps,
    ...outerEnumProps,
    [args.enum as string]: option,
    [args.outerEnum as string]: outerOption,
  };
}

export function getSlotsFragment(defaultTemplate: string) {
  const result = `
  <template v-for="(slot, index) of slots" :key="index" v-slot:[slot]>
    <template v-if="slot === 'default' && !args['defaultSlot']">${defaultTemplate || ''}</template>
    <template v-else-if="slot === 'default' && args['defaultSlot']">{{ args['defaultSlot'] }}</template>
    <template v-else-if="args[slot + 'Slot']">{{ args[slot + 'Slot'] }}</template>
  </template>
`;
  console.log('Generated slots fragment:', result);
  return result;
}
