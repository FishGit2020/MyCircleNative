import {
  getGrowthDataForWeek,
  getTrimester,
  getStageForWeek,
  babyGrowthData,
  developmentStages,
} from '../data/babyGrowthData';

describe('babyGrowthData', () => {
  describe('getGrowthDataForWeek', () => {
    it('returns correct data for week 1', () => {
      const data = getGrowthDataForWeek(1);
      expect(data).not.toBeNull();
      expect(data!.week).toBe(1);
      expect(data!.fruit).toBe('poppy seed');
    });

    it('returns correct data for week 20 (midpoint)', () => {
      const data = getGrowthDataForWeek(20);
      expect(data).not.toBeNull();
      expect(data!.week).toBe(20);
      expect(data!.fruit).toBe('banana');
      expect(data!.lengthCm).toBe(25.6);
    });

    it('returns correct data for week 40 (full term)', () => {
      const data = getGrowthDataForWeek(40);
      expect(data).not.toBeNull();
      expect(data!.week).toBe(40);
      expect(data!.fruit).toBe('watermelon');
      expect(data!.weightG).toBe(3462);
    });

    it('returns null for week 0 (out of range)', () => {
      expect(getGrowthDataForWeek(0)).toBeNull();
    });

    it('returns null for week 41 (out of range)', () => {
      expect(getGrowthDataForWeek(41)).toBeNull();
    });

    it('returns null for negative week', () => {
      expect(getGrowthDataForWeek(-1)).toBeNull();
    });
  });

  describe('getTrimester', () => {
    it('returns 1 for weeks 1-13', () => {
      expect(getTrimester(1)).toBe(1);
      expect(getTrimester(7)).toBe(1);
      expect(getTrimester(13)).toBe(1);
    });

    it('returns 2 for weeks 14-26', () => {
      expect(getTrimester(14)).toBe(2);
      expect(getTrimester(20)).toBe(2);
      expect(getTrimester(26)).toBe(2);
    });

    it('returns 3 for weeks 27-40', () => {
      expect(getTrimester(27)).toBe(3);
      expect(getTrimester(33)).toBe(3);
      expect(getTrimester(40)).toBe(3);
    });
  });

  describe('getStageForWeek', () => {
    it('returns the correct stage for week 1', () => {
      const stage = getStageForWeek(1);
      expect(stage).not.toBeNull();
      expect(stage!.id).toBe(1);
      expect(stage!.weekStart).toBe(1);
      expect(stage!.weekEnd).toBe(3);
    });

    it('returns the correct stage for week 5 (stage 2)', () => {
      const stage = getStageForWeek(5);
      expect(stage).not.toBeNull();
      expect(stage!.id).toBe(2);
    });

    it('returns the correct stage for week 40 (last stage)', () => {
      const stage = getStageForWeek(40);
      expect(stage).not.toBeNull();
      expect(stage!.id).toBe(10);
    });

    it('returns null for week 0 (out of range)', () => {
      expect(getStageForWeek(0)).toBeNull();
    });

    it('returns null for week 41 (out of range)', () => {
      expect(getStageForWeek(41)).toBeNull();
    });
  });

  describe('data completeness', () => {
    it('has data for all 40 weeks', () => {
      expect(babyGrowthData).toHaveLength(40);
      for (let week = 1; week <= 40; week++) {
        const data = getGrowthDataForWeek(week);
        expect(data).not.toBeNull();
        expect(data!.week).toBe(week);
      }
    });

    it('all weeks have required fields', () => {
      for (const data of babyGrowthData) {
        expect(data.week).toBeGreaterThanOrEqual(1);
        expect(data.week).toBeLessThanOrEqual(40);
        expect(typeof data.fruit).toBe('string');
        expect(typeof data.animal).toBe('string');
        expect(typeof data.vegetable).toBe('string');
        expect(typeof data.lengthCm).toBe('number');
        expect(typeof data.weightG).toBe('number');
        expect(typeof data.lengthIn).toBe('number');
        expect(typeof data.weightOz).toBe('number');
      }
    });

    it('development stages cover all 40 weeks without gaps', () => {
      expect(developmentStages).toHaveLength(10);
      expect(developmentStages[0].weekStart).toBe(1);
      expect(developmentStages[developmentStages.length - 1].weekEnd).toBe(40);

      for (let i = 1; i < developmentStages.length; i++) {
        expect(developmentStages[i].weekStart).toBe(
          developmentStages[i - 1].weekEnd + 1,
        );
      }
    });
  });
});
