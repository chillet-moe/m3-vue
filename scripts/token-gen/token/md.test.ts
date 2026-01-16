import { md, mdRaw } from './md';

// Test: mdRaw contains actual values
console.log('mdRaw.sys.color.primaryContainer:', mdRaw.sys.color.primaryContainer);
console.log('mdRaw.sys.color.primary:', mdRaw.sys.color.primary);
console.log('mdRaw.sys.elevation.level1:', mdRaw.sys.elevation.level1);
console.log('mdRaw.sys.shape.corner.extraSmall:', mdRaw.sys.shape.corner.extraSmall);
console.log('mdRaw.sys.motion.easing.emphasized:', mdRaw.sys.motion.easing.emphasized);

console.log('\n---\n');

// Test: md contains CSS variable strings
console.log('md.sys.color.primaryContainer:', md.sys.color.primaryContainer);
console.log('md.sys.color.primary:', md.sys.color.primary);
console.log('md.sys.elevation.level1:', md.sys.elevation.level1);
console.log('md.sys.shape.corner.extraSmall:', md.sys.shape.corner.extraSmall);
console.log('md.sys.motion.easing.emphasized:', md.sys.motion.easing.emphasized);

console.log('\n---\n');

// Test: Type safety - these should all work with IDE autocomplete
const primaryColor = md.sys.color.primary;
const primaryContainer = md.sys.color.primaryContainer;
const onPrimary = md.sys.color.onPrimary;
const surfaceContainer = md.sys.color.surfaceContainer;
const level1Elevation = md.sys.elevation.level1;
const cornerSmall = md.sys.shape.corner.small;
const easingEmphasized = md.sys.motion.easing.emphasized;

console.log('All type-safe values:');
console.log({ primaryColor, primaryContainer, onPrimary, surfaceContainer, level1Elevation, cornerSmall, easingEmphasized });

// Test: Deeply nested properties
const extraLargeCorner = md.sys.shape.corner.extraLarge;
console.log('\nDeeply nested:', extraLargeCorner);

