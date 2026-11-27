// Align the decimal coefficients before adding so repeated steps do not accumulate
// binary rounding errors. Keep the precision of both operands, including exponent notation.
export function addDecimalStep(value: number, step: number) {
  function decimalParts(number: number) {
    const [mantissa, exponent] = number.toExponential().split('e');
    const fractionLength = mantissa.split('.')[1]?.length ?? 0;
    return { coefficient: BigInt(mantissa.replace('.', '')), exponent: Number(exponent) - fractionLength };
  }

  const base = decimalParts(value);
  const delta = decimalParts(step);
  const exponent = Math.min(base.exponent, delta.exponent);
  const sum =
    base.coefficient * 10n ** BigInt(base.exponent - exponent) +
    delta.coefficient * 10n ** BigInt(delta.exponent - exponent);
  return Number(`${sum}e${exponent}`);
}
