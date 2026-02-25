import {
  MILESTONES,
  DOMAINS,
  AGE_RANGES,
  getMilestonesByDomainAndAge,
  getMilestonesByDomain,
  getMilestonesByAgeRange,
  getAgeRangeForMonths,
  getDomainMeta,
} from '../data/milestones';
import type { DomainId, AgeRangeId } from '../data/milestones';

describe('milestones', () => {
  describe('getMilestonesByDomainAndAge', () => {
    it('returns correct milestones for physical domain, 0-3m age range', () => {
      const milestones = getMilestonesByDomainAndAge('physical', '0-3m');
      expect(milestones).toHaveLength(5);
      milestones.forEach((m) => {
        expect(m.domain).toBe('physical');
        expect(m.ageRange).toBe('0-3m');
      });
    });

    it('returns correct milestones for speech domain, 9-12m age range', () => {
      const milestones = getMilestonesByDomainAndAge('speech', '9-12m');
      expect(milestones).toHaveLength(5);
      milestones.forEach((m) => {
        expect(m.domain).toBe('speech');
        expect(m.ageRange).toBe('9-12m');
      });
    });

    it('returns empty array for sensory domain with age ranges beyond 6-9m', () => {
      // Sensory domain only has milestones for 0-3m, 3-6m, 6-9m
      const milestones = getMilestonesByDomainAndAge('sensory', '9-12m');
      expect(milestones).toHaveLength(0);
    });

    it('returns 5 milestones for each valid domain/age combination', () => {
      const coreDomains: DomainId[] = ['physical', 'speech', 'cognitive', 'social'];
      const allAges: AgeRangeId[] = ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];

      for (const domain of coreDomains) {
        for (const age of allAges) {
          const milestones = getMilestonesByDomainAndAge(domain, age);
          expect(milestones).toHaveLength(5);
        }
      }
    });
  });

  describe('data completeness', () => {
    it('has exactly 195 milestones total', () => {
      expect(MILESTONES).toHaveLength(195);
    });

    it('all milestones have required fields', () => {
      for (const milestone of MILESTONES) {
        expect(typeof milestone.id).toBe('string');
        expect(milestone.id.length).toBeGreaterThan(0);
        expect(typeof milestone.nameKey).toBe('string');
        expect(milestone.nameKey.length).toBeGreaterThan(0);
        expect(typeof milestone.domain).toBe('string');
        expect(typeof milestone.ageRange).toBe('string');
        expect(typeof milestone.isRedFlag).toBe('boolean');
      }
    });

    it('all domains have milestones', () => {
      for (const domain of DOMAINS) {
        const milestones = getMilestonesByDomain(domain.id);
        expect(milestones.length).toBeGreaterThan(0);
      }
    });

    it('all age ranges have milestones', () => {
      for (const ageRange of AGE_RANGES) {
        const milestones = getMilestonesByAgeRange(ageRange.id);
        expect(milestones.length).toBeGreaterThan(0);
      }
    });

    it('sensory domain has milestones only for baby ages (0-3m, 3-6m, 6-9m)', () => {
      const sensoryMilestones = getMilestonesByDomain('sensory');
      expect(sensoryMilestones).toHaveLength(15);

      const ageRanges = new Set(sensoryMilestones.map((m) => m.ageRange));
      expect(ageRanges).toEqual(new Set(['0-3m', '3-6m', '6-9m']));
    });

    it('core domains each have 45 milestones', () => {
      const coreDomains: DomainId[] = ['physical', 'speech', 'cognitive', 'social'];
      for (const domain of coreDomains) {
        const milestones = getMilestonesByDomain(domain);
        expect(milestones).toHaveLength(45);
      }
    });
  });

  describe('getAgeRangeForMonths', () => {
    it('returns correct age range for 0 months', () => {
      const range = getAgeRangeForMonths(0);
      expect(range).toBeDefined();
      expect(range!.id).toBe('0-3m');
    });

    it('returns correct age range for 6 months', () => {
      const range = getAgeRangeForMonths(6);
      expect(range).toBeDefined();
      expect(range!.id).toBe('6-9m');
    });

    it('returns correct age range for 24 months (2 years)', () => {
      const range = getAgeRangeForMonths(24);
      expect(range).toBeDefined();
      expect(range!.id).toBe('2-3y');
    });

    it('returns undefined for 60+ months (out of range)', () => {
      expect(getAgeRangeForMonths(60)).toBeUndefined();
    });
  });

  describe('getDomainMeta', () => {
    it('returns metadata for physical domain', () => {
      const meta = getDomainMeta('physical');
      expect(meta).toBeDefined();
      expect(meta!.id).toBe('physical');
      expect(meta!.icon).toBe('runner');
    });

    it('returns metadata for all domains', () => {
      const domainIds: DomainId[] = ['physical', 'speech', 'cognitive', 'social', 'sensory'];
      for (const id of domainIds) {
        const meta = getDomainMeta(id);
        expect(meta).toBeDefined();
        expect(meta!.id).toBe(id);
      }
    });
  });
});
