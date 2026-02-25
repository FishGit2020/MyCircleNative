import { transposeChord, transposeContent } from '../utils/transpose';

describe('transposeChord', () => {
  describe('basic transposition up', () => {
    it('transposes C up by 1 semitone to C#', () => {
      expect(transposeChord('C', 1)).toBe('C#');
    });

    it('transposes C up by 2 semitones to D', () => {
      expect(transposeChord('C', 2)).toBe('D');
    });

    it('transposes G up by 5 semitones to C', () => {
      expect(transposeChord('G', 5)).toBe('C');
    });

    it('transposes E up by 1 semitone to F', () => {
      expect(transposeChord('E', 1)).toBe('F');
    });
  });

  describe('basic transposition down', () => {
    it('transposes D down by 2 semitones to C', () => {
      expect(transposeChord('D', -2)).toBe('C');
    });

    it('transposes C down by 1 semitone to B', () => {
      expect(transposeChord('C', -1)).toBe('B');
    });

    it('transposes F down by 1 semitone to E', () => {
      expect(transposeChord('F', -1)).toBe('E');
    });
  });

  describe('returns same chord when semitones is 0', () => {
    it('returns the same chord when transposing by 0', () => {
      expect(transposeChord('Am', 0)).toBe('Am');
      expect(transposeChord('G7', 0)).toBe('G7');
    });
  });

  describe('all 12 keys (transposing C through full chromatic scale)', () => {
    it('produces all 12 chromatic notes from C', () => {
      const expected = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      for (let i = 0; i < 12; i++) {
        expect(transposeChord('C', i)).toBe(expected[i]);
      }
    });

    it('wraps around after 12 semitones back to original', () => {
      expect(transposeChord('C', 12)).toBe('C');
      expect(transposeChord('G', 12)).toBe('G');
      expect(transposeChord('F#', 12)).toBe('F#');
    });
  });

  describe('sharp and flat notation', () => {
    it('transposes sharp notes correctly', () => {
      expect(transposeChord('C#', 1)).toBe('D');
      expect(transposeChord('F#', 2)).toBe('G#');
    });

    it('transposes flat notes correctly', () => {
      expect(transposeChord('Bb', 2)).toBe('C');
      expect(transposeChord('Eb', 1)).toBe('E');
      // Ab up 2 -> index 8+2=10, CHROMATIC_SHARP[10] = A# (not in FLAT_KEYS), uses sharp scale
      expect(transposeChord('Ab', 2)).toBe('A#');
    });

    it('uses flats when target root is a flat key (F)', () => {
      // Transposing to F (a flat key) should use flat scale
      expect(transposeChord('E', 1)).toBe('F');
      // F is in FLAT_KEYS; the useFlats check uses CHROMATIC_SHARP[newRootIdx]
      // so only F triggers flat output from sharp scale lookups
    });

    it('uses sharps for non-flat key targets', () => {
      // A up 1 -> A# (not Bb) because CHROMATIC_SHARP[10] = A# is not in FLAT_KEYS
      expect(transposeChord('A', 1)).toBe('A#');
      // D up 1 -> D# (not Eb) because CHROMATIC_SHARP[3] = D# is not in FLAT_KEYS
      expect(transposeChord('D', 1)).toBe('D#');
    });
  });

  describe('minor chords', () => {
    it('transposes Am up by 2 semitones to Bm', () => {
      expect(transposeChord('Am', 2)).toBe('Bm');
    });

    it('transposes Em up by 3 semitones to Gm', () => {
      expect(transposeChord('Em', 3)).toBe('Gm');
    });

    it('transposes Dm up by 1 semitone to D#m', () => {
      expect(transposeChord('Dm', 1)).toBe('D#m');
    });

    it('transposes C#m down by 1 semitone to Cm', () => {
      expect(transposeChord('C#m', -1)).toBe('Cm');
    });
  });

  describe('complex chords', () => {
    it('transposes 7th chords', () => {
      expect(transposeChord('G7', 2)).toBe('A7');
      expect(transposeChord('C7', 5)).toBe('F7');
    });

    it('transposes maj7 chords', () => {
      expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7');
      expect(transposeChord('Fmaj7', 7)).toBe('Cmaj7');
    });

    it('transposes sus4 chords', () => {
      expect(transposeChord('Dsus4', 2)).toBe('Esus4');
      expect(transposeChord('Asus4', -2)).toBe('Gsus4');
    });

    it('transposes dim chords', () => {
      expect(transposeChord('Bdim', 1)).toBe('Cdim');
      expect(transposeChord('Cdim', -1)).toBe('Bdim');
    });

    it('transposes aug chords', () => {
      expect(transposeChord('Caug', 4)).toBe('Eaug');
      // G up 3 = A# (index 10), CHROMATIC_SHARP[10] = A# which is NOT in FLAT_KEYS
      expect(transposeChord('Gaug', 3)).toBe('A#aug');
    });

    it('transposes slash chords', () => {
      expect(transposeChord('G/B', 2)).toBe('A/C#');
      expect(transposeChord('C/E', 5)).toBe('F/A');
    });

    it('returns unrecognized chords unchanged', () => {
      expect(transposeChord('N.C.', 2)).toBe('N.C.');
      expect(transposeChord('', 2)).toBe('');
    });
  });
});

describe('transposeContent', () => {
  it('transposes all chords in ChordPro content', () => {
    const content = '[C]Amazing [G]Grace how [Am]sweet the [F]sound';
    const result = transposeContent(content, 2);
    expect(result).toBe('[D]Amazing [A]Grace how [Bm]sweet the [G]sound');
  });

  it('returns original content when transposing by 0', () => {
    const content = '[C]Amazing [G]Grace';
    expect(transposeContent(content, 0)).toBe(content);
  });

  it('handles content with no chords', () => {
    const content = 'Just plain text';
    expect(transposeContent(content, 5)).toBe('Just plain text');
  });
});
