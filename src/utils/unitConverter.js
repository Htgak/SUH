const converters = {
  length: {
    meter: (value) => value,
    kilometer: (value) => value * 1000,
    mile: (value) => value * 1609.344,
    foot: (value) => value * 0.3048
  },
  weight: {
    kilogram: (value) => value,
    gram: (value) => value / 1000,
    pound: (value) => value * 0.45359237,
    ounce: (value) => value * 0.028349523125
  },
  temperature: {
    celsius: {
      toBase: (value) => value,
      fromBase: (value) => value
    },
    fahrenheit: {
      toBase: (value) => (value - 32) * (5 / 9),
      fromBase: (value) => (value * 9) / 5 + 32
    },
    kelvin: {
      toBase: (value) => value - 273.15,
      fromBase: (value) => value + 273.15
    }
  },
  area: {
    'sq-meter': (value) => value,
    'sq-kilometer': (value) => value * 1_000_000,
    acre: (value) => value * 4046.8564224,
    'sq-foot': (value) => value * 0.09290304
  },
  speed: {
    mps: (value) => value,
    kph: (value) => value / 3.6,
    mph: (value) => value * 0.44704,
    knot: (value) => value * 0.514444
  }
};

function convertStandard(category, fromUnit, toUnit, value) {
  const unitMap = converters[category];
  const baseValue = unitMap[fromUnit](value);
  const inverseUnit = unitMap[toUnit];
  return baseValue / inverseUnit(1);
}

function convertTemperature(fromUnit, toUnit, value) {
  const temperatureMap = converters.temperature;
  const celsiusValue = temperatureMap[fromUnit].toBase(value);
  return temperatureMap[toUnit].fromBase(celsiusValue);
}

export function getUnitsByCategory(category) {
  return Object.keys(converters[category] ?? {});
}

export function convertUnit(category, fromUnit, toUnit, value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error('Enter a valid number to convert.');
  }

  if (!converters[category]) {
    throw new Error('Unsupported category.');
  }

  if (!converters[category][fromUnit] || !converters[category][toUnit]) {
    throw new Error('Unsupported unit selection.');
  }

  if (category === 'temperature') {
    return convertTemperature(fromUnit, toUnit, parsed);
  }

  return convertStandard(category, fromUnit, toUnit, parsed);
}
