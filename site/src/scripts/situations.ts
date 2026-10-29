// Situations offered in the hero; the same keys pre-fill step 1 of the form.
export type SituationKey = 'kavets' | 'vid' | 'nekartots' | 'gramatvedis';

export interface StatusRow {
  label: string;
  before: string;
  after: string;
}

export interface Situation {
  key: SituationKey;
  label: string;
  // Illustration of the process for the status card, not a promise of timing.
  rows: StatusRow[];
}

export const SITUATIONS: Situation[] = [
  {
    key: 'kavets',
    label: 'Kavēts gada pārskats',
    rows: [
      { label: 'Gada pārskats 2024', before: 'nav iesniegts', after: 'Iesniegts' },
      { label: 'Gada pārskats 2023', before: 'nav iesniegts', after: 'Iesniegts' },
      { label: 'Dokumenti', before: 'dažādās vietās', after: 'Vienā mapē' },
    ],
  },
  {
    key: 'vid',
    label: 'Saņēmu VID vēstuli',
    rows: [
      { label: 'VID vēstule', before: 'neatbildēta', after: 'Atbildēta' },
      { label: 'Gada pārskats 2024', before: 'nav iesniegts', after: 'Iesniegts' },
      { label: 'Dokumenti', before: 'dažādās vietās', after: 'Vienā mapē' },
    ],
  },
  {
    key: 'nekartots',
    label: 'Nav kārtots 1-3 gadus',
    rows: [
      { label: 'Uzskaite par iepriekšējiem gadiem', before: 'nav kārtota', after: 'Sakārtota' },
      { label: 'Gada pārskati', before: 'nav iesniegti', after: 'Iesniegti' },
      { label: 'Dokumenti', before: 'dažādās vietās', after: 'Vienā mapē' },
    ],
  },
  {
    key: 'gramatvedis',
    label: 'Grāmatvedis pazuda',
    rows: [
      { label: 'Dokumenti', before: 'pie iepriekšējā grāmatveža', after: 'Vienā mapē' },
      { label: 'Gada pārskats 2024', before: 'nav iesniegts', after: 'Iesniegts' },
      { label: 'Grāmatvedība', before: 'neviens neved', after: 'Turpinām vest' },
    ],
  },
];

export const STORAGE_KEY = 'irg-lead-v1';
