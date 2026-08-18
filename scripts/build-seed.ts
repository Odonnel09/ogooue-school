/**
 * Génère `supabase/seed.sql` depuis les données de démonstration du dépôt.
 *
 * Écriture ensembliste : une instruction par table, alimentée par une liste
 * `values`, plutôt qu'un `insert` par ligne. Le fichier est quatre fois plus
 * court, se relit d'un coup d'œil, et s'exécute en une passe par table.
 */
import { ACADEMIC_YEARS, LEVELS, DEFAULT_PERIODS } from '../src/data/academic';
import { SUBJECTS } from '../src/data/subjects';
import { CLASSES } from '../src/data/classes';
import { CLASS_SUBJECTS } from '../src/data/class-subjects';
import { TEACHERS } from '../src/data/teachers';
import { STUDENTS } from '../src/data/students';
import { GUARDIANS, GUARDIAN_LINKS } from '../src/data/guardians';

const q = (v: unknown) =>
  v === null || v === undefined ? "''" : `'${String(v).replace(/'/g, "''")}'`;
const qn = (v: unknown) =>
  v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const code = (v: string) => v.replace(/[^a-z0-9_]/g, '_');

const B: string[] = [];

function bloc(titre: string, corps: string) {
  B.push(`-- ${titre}
-- ${'-'.repeat(74)}
with t as (select id from public.tenants where slug = 'demo')
${corps};
`);
}

/* ------------------------------------------------------------------ Années */
bloc(
  'Années scolaires',
  `insert into public.academic_years (tenant_id, label, start_date, end_date, status)
select t.id, v.label, v.debut::date, v.fin::date, v.statut
from t
cross join (values
${ACADEMIC_YEARS.map((y) => `  (${q(y.label)}, ${q(y.startDate)}, ${q(y.endDate)}, ${q(y.status)})`).join(',\n')}
) as v(label, debut, fin, statut)
on conflict (tenant_id, label) do nothing`,
);

/* ----------------------------------------------------------------- Niveaux */
bloc(
  'Niveaux scolaires',
  `insert into public.levels (tenant_id, code, label, cycle, position)
select t.id, v.code, v.label, v.cycle::app.cycle, v.position
from t
cross join (values
${LEVELS.map((l) => `  (${q(code(l.id))}, ${q(l.label)}, ${q(l.cycle)}, ${l.order})`).join(',\n')}
) as v(code, label, cycle, position)
on conflict (tenant_id, code) do nothing`,
);

/* ---------------------------------------------------------------- Périodes */
bloc(
  "Périodes de l'année en cours",
  `insert into public.periods (tenant_id, academic_year_id, label, kind, cycles, position)
select t.id, y.id, v.label, v.kind, v.cycles::app.cycle[], v.position
from t
join public.academic_years y on y.tenant_id = t.id and y.status = 'active'
cross join (values
${DEFAULT_PERIODS.map(
  (p, i) =>
    `  (${q(p.label)}, ${q(p.kind)}, array[${p.cycles.map(q).join(',')}], ${i + 1})`,
).join(',\n')}
) as v(label, kind, cycles, position)
where not exists (
  select 1 from public.periods pp
  where pp.tenant_id = t.id and pp.academic_year_id = y.id and pp.label = v.label
)`,
);

/* ---------------------------------------------------------------- Matières */
bloc(
  'Matières',
  `insert into public.subjects (tenant_id, code, name, cycle, description, status, ue, ecue, ects_credits, semester, filiere)
select t.id, v.code, v.name, v.cycle::app.cycle, v.description, v.status, v.ue, v.ecue, v.credits, v.semester, v.filiere
from t
cross join (values
${SUBJECTS.map(
  (s) =>
    `  (${q(s.code)}, ${q(s.name)}, ${q(s.cycle)}, ${q(s.description)}, ${q(s.status)}, ${q(s.ue)}, ${q(s.ecue)}, ${s.ectsCredits ?? 0}, ${q(s.semester)}, ${q(s.filiere)})`,
).join(',\n')}
) as v(code, name, cycle, description, status, ue, ecue, credits, semester, filiere)
on conflict (tenant_id, code) do nothing`,
);

/* ------------------------------------------------------------- Enseignants */
bloc(
  'Enseignants',
  `insert into public.teachers (tenant_id, matricule, first_name, last_name, email, phone, address, contract_type, status, start_date, notes)
select t.id, v.matricule, v.prenom, v.nom, v.email, v.tel, v.adresse, v.contrat, v.statut, v.debut::date, v.notes
from t
cross join (values
${TEACHERS.map(
  (x) =>
    `  (${q(x.matricule)}, ${q(x.firstName)}, ${q(x.lastName)}, ${q(x.email)}, ${q(x.phone)}, ${q(x.address)}, ${q(x.contractType)}, ${q(x.status)}, ${qn(x.startDate)}, ${q(x.notes)})`,
).join(',\n')}
) as v(matricule, prenom, nom, email, tel, adresse, contrat, statut, debut, notes)
on conflict (tenant_id, matricule) do nothing`,
);

/* ----------------------------------------------------------------- Classes */
bloc(
  'Classes',
  `insert into public.classes (tenant_id, academic_year_id, level_id, name, cycle, capacity, room, description, status)
select t.id, y.id, l.id, v.nom, v.cycle::app.cycle, v.capacite, v.salle, v.description, v.statut
from t
cross join (values
${CLASSES.map(
  (c) =>
    `  (${q(c.name)}, ${q(code(c.levelId))}, ${q(c.academicYear)}, ${q(c.cycle)}, ${c.capacity}, ${q(c.room)}, ${q(c.description)}, ${q(c.status)})`,
).join(',\n')}
) as v(nom, niveau, annee, cycle, capacite, salle, description, statut)
join public.levels l on l.tenant_id = t.id and l.code = v.niveau
join public.academic_years y on y.tenant_id = t.id and y.label = v.annee
on conflict (tenant_id, academic_year_id, name) do nothing`,
);

/* ------------------------------------------------- Professeurs principaux */
const principaux = CLASSES.filter((c) => c.mainTeacherId).map((c) => ({
  classe: c.name,
  matricule: TEACHERS.find((t) => t.id === c.mainTeacherId)?.matricule,
})).filter((x) => x.matricule);

bloc(
  'Professeurs principaux',
  `update public.classes c
set main_teacher_id = te.id
from t
cross join (values
${principaux.map((p) => `  (${q(p.classe)}, ${q(p.matricule)})`).join(',\n')}
) as v(classe, matricule)
join public.teachers te on te.matricule = v.matricule
where c.tenant_id = t.id and c.name = v.classe and te.tenant_id = t.id`,
);

/* --------------------------------------------------- Matières des classes */
const rattachements = CLASS_SUBJECTS.map((cs) => {
  const cls = CLASSES.find((c) => c.id === cs.classId);
  const sub = SUBJECTS.find((s) => s.id === cs.subjectId);
  const tea = TEACHERS.find((x) => x.id === cs.teacherId);
  return cls && sub
    ? `  (${q(cls.name)}, ${q(sub.code)}, ${qn(tea?.matricule)}, ${cs.coefficient}, ${cs.weeklyHours})`
    : null;
}).filter(Boolean);

bloc(
  'Rattachement matiere / classe',
  `insert into public.class_subjects (tenant_id, class_id, subject_id, teacher_id, coefficient, weekly_hours)
select t.id, c.id, s.id, te.id, v.coefficient, v.heures
from t
cross join (values
${rattachements.join(',\n')}
) as v(classe, matiere, matricule, coefficient, heures)
join public.classes c on c.tenant_id = t.id and c.name = v.classe
join public.subjects s on s.tenant_id = t.id and s.code = v.matiere
left join public.teachers te on te.tenant_id = t.id and te.matricule = v.matricule
on conflict (class_id, subject_id) do nothing`,
);

/* ------------------------------------------------------------------ Élèves */
bloc(
  'Eleves',
  `insert into public.students (tenant_id, matricule, first_name, last_name, birth_date, birth_place, gender, nationality, address, class_id, level_id, academic_year_id, status, medical_info, previous_school, filiere, parcours, is_draft)
select t.id, v.matricule, v.prenom, v.nom, v.naissance::date, v.lieu, v.sexe, v.nationalite, v.adresse,
       c.id, l.id, y.id, v.statut, v.medical, v.ecole, v.filiere, v.parcours, v.brouillon
from t
cross join (values
${STUDENTS.map((s) => {
  const cls = CLASSES.find((c) => c.id === s.classId);
  return `  (${q(s.matricule)}, ${q(s.firstName)}, ${q(s.lastName)}, ${qn(s.birthDate)}, ${q(s.birthPlace)}, ${q(s.gender)}, ${q(s.nationality)}, ${q(s.address)}, ${qn(cls?.name)}, ${q(code(s.levelId))}, ${q(s.academicYear)}, ${q(s.status)}, ${q(s.medicalInfo)}, ${q(s.previousSchool)}, ${q(s.filiere)}, ${q(s.parcours)}, ${s.isDraft ? 'true' : 'false'})`;
}).join(',\n')}
) as v(matricule, prenom, nom, naissance, lieu, sexe, nationalite, adresse, classe, niveau, annee, statut, medical, ecole, filiere, parcours, brouillon)
left join public.classes c on c.tenant_id = t.id and c.name = v.classe
left join public.levels l on l.tenant_id = t.id and l.code = v.niveau
left join public.academic_years y on y.tenant_id = t.id and y.label = v.annee
on conflict (tenant_id, matricule) do nothing`,
);

/* ---------------------------------------------------------------- Tuteurs */
bloc(
  'Parents et tuteurs',
  `insert into public.guardians (tenant_id, first_name, last_name, phone, alt_phone, email, address, profession, id_document, notes, status)
select t.id, v.prenom, v.nom, v.tel, v.tel2, v.email, v.adresse, v.profession, v.piece, v.notes, v.statut
from t
cross join (values
${GUARDIANS.map(
  (g) =>
    `  (${q(g.firstName)}, ${q(g.lastName)}, ${q(g.phone)}, ${q(g.altPhone)}, ${q(g.email)}, ${q(g.address)}, ${q(g.profession)}, ${q(g.idDocument)}, ${q(g.notes)}, ${q(g.status)})`,
).join(',\n')}
) as v(prenom, nom, tel, tel2, email, adresse, profession, piece, notes, statut)
where not exists (
  select 1 from public.guardians g
  where g.tenant_id = t.id and g.first_name = v.prenom and g.last_name = v.nom and g.phone = v.tel
)`,
);

const liens = GUARDIAN_LINKS.map((link) => {
  const g = GUARDIANS.find((x) => x.id === link.guardianId);
  const s = STUDENTS.find((x) => x.id === link.studentId);
  return g && s
    ? `  (${q(g.phone)}, ${q(s.matricule)}, ${q(link.relation)}, ${link.isPrimary}, ${link.canPickUp})`
    : null;
}).filter(Boolean);

bloc(
  'Rattachements tuteur / eleve',
  `insert into public.guardian_links (tenant_id, guardian_id, student_id, relation, is_primary, can_pick_up)
select t.id, g.id, s.id, v.relation, v.principal, v.recuperation
from t
cross join (values
${liens.join(',\n')}
) as v(tel, matricule, relation, principal, recuperation)
join public.guardians g on g.tenant_id = t.id and g.phone = v.tel
join public.students s on s.tenant_id = t.id and s.matricule = v.matricule
on conflict (guardian_id, student_id) do nothing`,
);

/* -------------------------------------------------------------- Documents */
bloc(
  'Gabarits et signature',
  `insert into public.document_templates (tenant_id, variant, document_title, footer_text, accent_color, columns)
select t.id, v.variante, v.titre, v.pied, '#7c3aed', v.colonnes::text[]
from t
cross join (values
  ('report', 'Bulletin de notes', 'Complexe scolaire Ogooué — Libreville', array['teacher','coefficient','classAverage']),
  ('card', 'Carte scolaire', 'Année 2026-2027', array[]::text[])
) as v(variante, titre, pied, colonnes)
on conflict (tenant_id, variant) do nothing`,
);

B.push(`-- Signature du chef d'établissement
-- ${'-'.repeat(74)}
insert into public.signatures (tenant_id, signer_name, signer_role)
select id, 'M. Ndong Mba', 'Chef d''établissement' from public.tenants where slug = 'demo'
on conflict (tenant_id) do nothing;
`);

const entete = `-- =============================================================================
-- SEED DE DÉMONSTRATION — Complexe scolaire Ogooué (\`demo\`)
--
-- FICHIER GÉNÉRÉ depuis \`src/data/*.ts\`. Ne pas modifier à la main : la source
-- de vérité est le jeu de données TypeScript que l'interface utilise
-- aujourd'hui en mémoire. Les deux ne peuvent ainsi pas diverger.
--
-- Idempotent : chaque instruction est protégée. Rejouer le fichier ne duplique
-- rien et ne détruit rien.
--
-- Les identifiants du jeu TypeScript (« std-001 », « 6eme »...) ne deviennent
-- pas des clés primaires : ils survivent dans \`matricule\` et \`code\`, et la
-- base génère ses propres UUID.
--
-- Prérequis : les 14 migrations appliquées, et l'établissement \`demo\` créé
-- par \`app.bootstrap_tenant()\` (migration 002).
-- =============================================================================

`;

console.log(entete + B.join('\n'));
