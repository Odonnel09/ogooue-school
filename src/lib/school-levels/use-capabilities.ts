'use client';

import { useMemo } from 'react';
import { useSchoolData } from '@/lib/store/school-data';
import type { GradingConfig } from '@/lib/grading/types';
import type { Cycle, SchoolClass } from '@/types';
import {
  anyCycleHas,
  capabilitiesOf,
  menusFor,
  studentFieldsFor,
  type LevelCapabilities,
  type MenuKey,
  type StudentFieldKey,
} from './capabilities';

/**
 * Point d'entrée unique des composants vers la matrice de capacités.
 *
 * Les composants posent des questions (« ce champ est-il actif ? », « quel
 * barème pour cette classe ? ») et ne testent jamais un cycle eux-mêmes.
 */
export interface CapabilitiesApi {
  activeCycles: Cycle[];
  /** Entrées de navigation ouvertes par les cycles actifs. */
  menus: MenuKey[];
  /** Blocs du dossier élève ouverts par les cycles actifs. */
  studentFields: StudentFieldKey[];
  /** Vrai si au moins un cycle actif porte cette capacité. */
  hasAny: (
    capability:
      | 'hasCoefficients'
      | 'hasCredits'
      | 'hasCompensation'
      | 'hasSessions',
  ) => boolean;
  /** Capacités d'un cycle donné. */
  forCycle: (cycle: Cycle) => LevelCapabilities;
  /** Capacités applicables à une classe, via son cycle. */
  forClass: (schoolClass: SchoolClass) => LevelCapabilities;
  /** Configuration de notation d'une classe, telle que réglée en Paramètres. */
  gradingConfigForClass: (schoolClass: SchoolClass) => GradingConfig;
  gradingConfigForCycle: (cycle: Cycle) => GradingConfig;
}

export function useCapabilities(): CapabilitiesApi {
  const { config } = useSchoolData();

  return useMemo(() => {
    const activeCycles = config.activeCycles;

    return {
      activeCycles,
      menus: menusFor(activeCycles),
      studentFields: studentFieldsFor(activeCycles),
      hasAny: (capability) => anyCycleHas(activeCycles, capability),
      forCycle: (cycle) => capabilitiesOf(cycle),
      forClass: (schoolClass) => capabilitiesOf(schoolClass.cycle),
      gradingConfigForClass: (schoolClass) =>
        config.gradingSystems[schoolClass.cycle],
      gradingConfigForCycle: (cycle) => config.gradingSystems[cycle],
    };
  }, [config]);
}
