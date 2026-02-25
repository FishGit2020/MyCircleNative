import {
  formatTemperature,
  convertTemp,
  getWindDirection,
  formatWindSpeed,
  getWeatherIconUrl,
  getWeatherDescription,
  tempUnitSymbol,
  formatTemperatureDiff,
} from '../weatherHelpers';

describe('weatherHelpers', () => {
  describe('formatTemperature', () => {
    it('formats temperature in Celsius', () => {
      expect(formatTemperature(25, 'C')).toBe('25\u00B0C');
    });

    it('formats temperature in Fahrenheit (converts from C)', () => {
      // 0 C = 32 F
      expect(formatTemperature(0, 'F')).toBe('32\u00B0F');
    });

    it('rounds fractional Celsius values', () => {
      expect(formatTemperature(25.7, 'C')).toBe('26\u00B0C');
      expect(formatTemperature(25.3, 'C')).toBe('25\u00B0C');
    });

    it('rounds fractional Fahrenheit values', () => {
      // 100 C = 212 F
      expect(formatTemperature(100, 'F')).toBe('212\u00B0F');
    });

    it('handles negative temperatures in Celsius', () => {
      expect(formatTemperature(-10, 'C')).toBe('-10\u00B0C');
    });

    it('handles negative temperatures in Fahrenheit', () => {
      // -40 C = -40 F
      expect(formatTemperature(-40, 'F')).toBe('-40\u00B0F');
    });

    it('handles zero', () => {
      expect(formatTemperature(0, 'C')).toBe('0\u00B0C');
    });
  });

  describe('convertTemp', () => {
    it('returns rounded Celsius when unit is C', () => {
      expect(convertTemp(25.6, 'C')).toBe(26);
      expect(convertTemp(25.4, 'C')).toBe(25);
    });

    it('converts Celsius to Fahrenheit', () => {
      // 0 C => 32 F
      expect(convertTemp(0, 'F')).toBe(32);
      // 100 C => 212 F
      expect(convertTemp(100, 'F')).toBe(212);
    });

    it('handles negative values', () => {
      // -40 C = -40 F
      expect(convertTemp(-40, 'F')).toBe(-40);
    });

    it('rounds the result', () => {
      // 37 C => 98.6 F => rounds to 99
      expect(convertTemp(37, 'F')).toBe(99);
    });
  });

  describe('getWindDirection', () => {
    it('returns N for 0 degrees', () => {
      expect(getWindDirection(0)).toBe('N');
    });

    it('returns NE for 45 degrees', () => {
      expect(getWindDirection(45)).toBe('NE');
    });

    it('returns E for 90 degrees', () => {
      expect(getWindDirection(90)).toBe('E');
    });

    it('returns SE for 135 degrees', () => {
      expect(getWindDirection(135)).toBe('SE');
    });

    it('returns S for 180 degrees', () => {
      expect(getWindDirection(180)).toBe('S');
    });

    it('returns SW for 225 degrees', () => {
      expect(getWindDirection(225)).toBe('SW');
    });

    it('returns W for 270 degrees', () => {
      expect(getWindDirection(270)).toBe('W');
    });

    it('returns NW for 315 degrees', () => {
      expect(getWindDirection(315)).toBe('NW');
    });

    it('wraps 360 degrees back to N', () => {
      expect(getWindDirection(360)).toBe('N');
    });

    it('handles intermediate degrees by rounding', () => {
      // 22 degrees => 22/45 = 0.49 => rounds to 0 => N
      expect(getWindDirection(22)).toBe('N');
      // 23 degrees => 23/45 = 0.51 => rounds to 1 => NE
      expect(getWindDirection(23)).toBe('NE');
    });
  });

  describe('formatWindSpeed', () => {
    it('formats in m/s (default)', () => {
      expect(formatWindSpeed(5, 'ms')).toBe('5 m/s');
    });

    it('converts and formats in mph', () => {
      // 10 m/s * 2.237 = 22.37 => rounds to 22
      expect(formatWindSpeed(10, 'mph')).toBe('22 mph');
    });

    it('converts and formats in km/h', () => {
      // 10 m/s * 3.6 = 36
      expect(formatWindSpeed(10, 'kmh')).toBe('36 km/h');
    });

    it('rounds fractional m/s', () => {
      expect(formatWindSpeed(3.7, 'ms')).toBe('4 m/s');
      expect(formatWindSpeed(3.2, 'ms')).toBe('3 m/s');
    });

    it('handles zero wind speed', () => {
      expect(formatWindSpeed(0, 'ms')).toBe('0 m/s');
      expect(formatWindSpeed(0, 'mph')).toBe('0 mph');
      expect(formatWindSpeed(0, 'kmh')).toBe('0 km/h');
    });
  });

  describe('getWeatherIconUrl', () => {
    it('returns the correct URL for a given icon code', () => {
      expect(getWeatherIconUrl('01d')).toBe(
        'https://openweathermap.org/img/wn/01d@2x.png',
      );
    });

    it('handles night icon codes', () => {
      expect(getWeatherIconUrl('02n')).toBe(
        'https://openweathermap.org/img/wn/02n@2x.png',
      );
    });

    it('handles multi-digit icon codes', () => {
      expect(getWeatherIconUrl('10d')).toBe(
        'https://openweathermap.org/img/wn/10d@2x.png',
      );
    });
  });

  describe('getWeatherDescription', () => {
    it('returns colors for known weather types', () => {
      const clear = getWeatherDescription('Clear');
      expect(clear.color).toBe('text-yellow-600');
      expect(clear.bgColor).toBe('bg-yellow-100');
    });

    it('returns colors for Clouds', () => {
      const clouds = getWeatherDescription('Clouds');
      expect(clouds.color).toBe('text-gray-600');
      expect(clouds.bgColor).toBe('bg-gray-100');
    });

    it('returns colors for Rain', () => {
      const rain = getWeatherDescription('Rain');
      expect(rain.color).toBe('text-blue-600');
      expect(rain.bgColor).toBe('bg-blue-100');
    });

    it('returns default colors for unknown weather types', () => {
      const unknown = getWeatherDescription('Tornado');
      expect(unknown.color).toBe('text-gray-600');
      expect(unknown.bgColor).toBe('bg-gray-100');
    });
  });

  describe('tempUnitSymbol', () => {
    it('returns degree C for Celsius', () => {
      expect(tempUnitSymbol('C')).toBe('\u00B0C');
    });

    it('returns degree F for Fahrenheit', () => {
      expect(tempUnitSymbol('F')).toBe('\u00B0F');
    });
  });

  describe('formatTemperatureDiff', () => {
    it('formats diff in Celsius (no conversion, just rounds)', () => {
      expect(formatTemperatureDiff(5, 'C')).toBe('5\u00B0C');
    });

    it('formats diff in Fahrenheit (converts difference scale only)', () => {
      // Diff of 10 C => 10 * 9/5 = 18 F (no +32 for differences)
      expect(formatTemperatureDiff(10, 'F')).toBe('18\u00B0F');
    });

    it('handles zero diff', () => {
      expect(formatTemperatureDiff(0, 'C')).toBe('0\u00B0C');
      expect(formatTemperatureDiff(0, 'F')).toBe('0\u00B0F');
    });
  });
});
