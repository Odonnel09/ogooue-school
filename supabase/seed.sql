-- =============================================================================
-- SEED DE DÉMONSTRATION — Complexe scolaire Ogooué (`demo`)
--
-- FICHIER GÉNÉRÉ depuis `src/data/*.ts`. Ne pas modifier à la main : la source
-- de vérité est le jeu de données TypeScript que l'interface utilise
-- aujourd'hui en mémoire. Les deux ne peuvent ainsi pas diverger.
--
-- Idempotent : chaque instruction est protégée. Rejouer le fichier ne duplique
-- rien et ne détruit rien.
--
-- Les identifiants du jeu TypeScript (« std-001 », « 6eme »...) ne deviennent
-- pas des clés primaires : ils survivent dans `matricule` et `code`, et la
-- base génère ses propres UUID.
--
-- Prérequis : les 14 migrations appliquées, et l'établissement `demo` créé
-- par `app.bootstrap_tenant()` (migration 002).
-- =============================================================================

-- Années scolaires
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.academic_years (tenant_id, label, start_date, end_date, status)
select t.id, v.label, v.debut::date, v.fin::date, v.statut
from t
cross join (values
  ('2026-2027', '2026-09-14', '2027-07-09', 'active'),
  ('2025-2026', '2025-09-15', '2026-07-10', 'closed'),
  ('2024-2025', '2024-09-16', '2025-07-11', 'archived')
) as v(label, debut, fin, statut)
on conflict (tenant_id, label) do nothing;

-- Niveaux scolaires
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.levels (tenant_id, code, label, cycle, position)
select t.id, v.code, v.label, v.cycle::app.cycle, v.position
from t
cross join (values
  ('garderie', 'Garderie', 'garderie', 1),
  ('ps', 'Petite section', 'prescolaire', 2),
  ('ms', 'Moyenne section', 'prescolaire', 3),
  ('gs', 'Grande section', 'prescolaire', 4),
  ('cp1', 'CP1', 'primaire', 5),
  ('cp2', 'CP2', 'primaire', 6),
  ('ce1', 'CE1', 'primaire', 7),
  ('ce2', 'CE2', 'primaire', 8),
  ('cm1', 'CM1', 'primaire', 9),
  ('cm2', 'CM2', 'primaire', 10),
  ('6eme', '6ème', 'college', 11),
  ('5eme', '5ème', 'college', 12),
  ('4eme', '4ème', 'college', 13),
  ('3eme', '3ème', 'college', 14),
  ('seconde', 'Seconde', 'lycee', 15),
  ('premiere', 'Première', 'lycee', 16),
  ('terminale', 'Terminale', 'lycee', 17),
  ('licence1', 'Licence 1', 'superieur', 18),
  ('licence2', 'Licence 2', 'superieur', 19),
  ('licence3', 'Licence 3', 'superieur', 20),
  ('master1', 'Master 1', 'superieur', 21),
  ('master2', 'Master 2', 'superieur', 22),
  ('doctorat', 'Doctorat', 'superieur', 23)
) as v(code, label, cycle, position)
on conflict (tenant_id, code) do nothing;

-- Périodes de l'année en cours
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.periods (tenant_id, academic_year_id, label, kind, cycles, position)
select t.id, y.id, v.label, v.kind, v.cycles::app.cycle[], v.position
from t
join public.academic_years y on y.tenant_id = t.id and y.status = 'active'
cross join (values
  ('1er trimestre', 'trimestre', array['garderie','prescolaire','primaire','college','lycee'], 1),
  ('2ème trimestre', 'trimestre', array['garderie','prescolaire','primaire','college','lycee'], 2),
  ('3ème trimestre', 'trimestre', array['garderie','prescolaire','primaire','college','lycee'], 3),
  ('Semestre 1', 'semestre', array['superieur'], 4),
  ('Semestre 2', 'semestre', array['superieur'], 5)
) as v(label, kind, cycles, position)
where not exists (
  select 1 from public.periods pp
  where pp.tenant_id = t.id and pp.academic_year_id = y.id and pp.label = v.label
);

-- Matières
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.subjects (tenant_id, code, name, cycle, description, status, ue, ecue, ects_credits, semester, filiere)
select t.id, v.code, v.name, v.cycle::app.cycle, v.description, v.status, v.ue, v.ecue, v.credits, v.semester, v.filiere
from t
cross join (values
  ('MATH', 'Mathématiques', 'lycee', 'Algèbre, analyse, géométrie et probabilités du collège au baccalauréat.', 'active', '', '', 0, '', ''),
  ('FRA', 'Français', 'college', 'Expression écrite, lecture analytique et littérature.', 'active', '', '', 0, '', ''),
  ('ANG', 'Anglais', 'college', 'Première langue vivante étrangère.', 'active', '', '', 0, '', ''),
  ('PC', 'Physique-Chimie', 'lycee', 'Cours et travaux pratiques au laboratoire de sciences.', 'active', '', '', 0, '', ''),
  ('SVT', 'Sciences de la Vie et de la Terre', 'lycee', 'Biologie, géologie et éducation à l’environnement.', 'active', '', '', 0, '', ''),
  ('HG', 'Histoire-Géographie', 'college', 'Histoire du Gabon, de l’Afrique centrale et du monde.', 'active', '', '', 0, '', ''),
  ('PHILO', 'Philosophie', 'lycee', 'Programme de terminale, séries scientifiques et littéraires.', 'active', '', '', 0, '', ''),
  ('EPS', 'Éducation Physique et Sportive', 'college', 'Athlétisme, sports collectifs et natation.', 'active', '', '', 0, '', ''),
  ('ESP', 'Espagnol', 'lycee', 'Deuxième langue vivante étrangère.', 'active', '', '', 0, '', ''),
  ('INFO', 'Informatique', 'lycee', 'Bureautique, culture numérique et initiation à la programmation.', 'active', '', '', 0, '', ''),
  ('ECO', 'Sciences Économiques', 'lycee', 'Série A1 : économie générale et organisation des entreprises.', 'active', '', '', 0, '', ''),
  ('EVEIL', 'Éveil et Découverte du Monde', 'prescolaire', 'Activités d’éveil sensoriel et de socialisation.', 'active', '', '', 0, '', ''),
  ('LECT', 'Lecture et Écriture', 'primaire', 'Apprentissage fondamental de la lecture et de l’écriture.', 'active', '', '', 0, '', ''),
  ('INF-L1-01', 'Algorithmique et Programmation', 'superieur', 'Fondamentaux de l’algorithmique, structures de données, langage C.', 'active', 'UE 1 — Fondamentaux de l’informatique', 'ECUE 1.1 — Algorithmique', 6, 'Semestre 1', 'Informatique'),
  ('INF-L1-04', 'Bases de Données Relationnelles', 'superieur', 'Modèle relationnel, SQL et conception de schémas.', 'active', 'UE 2 — Systèmes d’information', 'ECUE 2.1 — Bases de données', 4, 'Semestre 2', 'Informatique'),
  ('GES-M1-02', 'Management Stratégique', 'superieur', 'Diagnostic stratégique, gouvernance et pilotage de la performance.', 'active', 'UE 3 — Stratégie et organisation', 'ECUE 3.2 — Management stratégique', 5, 'Semestre 1', 'Gestion des Organisations'),
  ('LAT', 'Latin', 'college', 'Option supprimée à la rentrée 2026 faute d’effectif.', 'archivee', '', '', 0, '', '')
) as v(code, name, cycle, description, status, ue, ecue, credits, semester, filiere)
on conflict (tenant_id, code) do nothing;

-- Enseignants
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.teachers (tenant_id, matricule, first_name, last_name, email, phone, address, contract_type, status, start_date, notes)
select t.id, v.matricule, v.prenom, v.nom, v.email, v.tel, v.adresse, v.contrat, v.statut, v.debut::date, v.notes
from t
cross join (values
  ('ENS-1042', 'Sylvie', 'Moussavou', 's.moussavou@complexe-ogooue.ga', '+241 06 12 34 55', 'Quartier Louis, Libreville', 'permanent', 'actif', '2018-09-17', 'Coordonnatrice du département de mathématiques. Professeur principal de la Terminale C.'),
  ('ENS-1078', 'Jean-Pierre', 'Obame', 'jp.obame@complexe-ogooue.ga', '+241 06 45 78 12', 'Nzeng-Ayong, Libreville', 'permanent', 'actif', '2016-09-19', 'Responsable du laboratoire de sciences physiques.'),
  ('ENS-1103', 'Clarisse', 'Nzue', 'c.nzue@complexe-ogooue.ga', '+241 07 22 08 46', 'Glass, Libreville', 'permanent', 'actif', '2019-09-16', 'Anime le club de lecture de l’établissement.'),
  ('ENS-1119', 'Michel', 'Bekale', 'm.bekale@complexe-ogooue.ga', '+241 06 77 31 90', 'Owendo, Libreville', 'contractuel', 'actif', '2021-09-20', 'Professeur principal de la Terminale A1.'),
  ('ENS-1127', 'Georgette', 'Mintsa', 'g.mintsa@complexe-ogooue.ga', '+241 07 54 60 23', 'Akanda, Libreville', 'permanent', 'conge', '2017-09-18', 'Congé maternité jusqu’au 15 décembre 2026. Remplacement assuré.'),
  ('ENS-1142', 'Alain', 'Koumba', 'a.koumba@complexe-ogooue.ga', '+241 06 09 47 71', 'PK8, Libreville', 'contractuel', 'actif', '2022-09-19', 'Professeur principal de la 6ème A.'),
  ('ENS-1156', 'Pauline', 'Ondo', 'p.ondo@complexe-ogooue.ga', '+241 07 81 25 34', 'Lalala, Libreville', 'permanent', 'actif', '2020-09-21', 'Professeur principal de la 5ème B.'),
  ('ENS-1163', 'Roland', 'Mavoungou', 'r.mavoungou@complexe-ogooue.ga', '+241 06 33 12 88', 'Nombakele, Libreville', 'vacataire', 'actif', '2023-09-18', 'Encadre l’association sportive du mercredi après-midi.'),
  ('ENS-1170', 'Estelle', 'Ngoua', 'e.ngoua@complexe-ogooue.ga', '+241 07 12 66 04', 'Batterie IV, Libreville', 'permanent', 'actif', '2015-09-14', 'Membre du conseil pédagogique.'),
  ('ENS-1184', 'Firmin', 'Ella', 'f.ella@complexe-ogooue.ga', '+241 06 58 90 17', 'Charbonnages, Libreville', 'contractuel', 'actif', '2021-10-04', 'Responsable du laboratoire informatique et du parc de machines.'),
  ('ENS-1198', 'Nadine', 'Boussougou', 'n.boussougou@complexe-ogooue.ga', '+241 07 40 73 62', 'Sotega, Libreville', 'vacataire', 'actif', '2024-09-16', ''),
  ('ENS-1205', 'Hervé', 'Nzigou', 'h.nzigou@complexe-ogooue.ga', '+241 06 64 21 39', 'Angondje, Libreville', 'permanent', 'actif', '2019-10-01', 'Responsable de la filière Gestion (Master).'),
  ('ENS-1211', 'Sandrine', 'Mabika', 's.mabika@complexe-ogooue.ga', '+241 07 05 88 27', 'Awendje, Libreville', 'permanent', 'actif', '2014-09-15', 'Coordonnatrice du cycle primaire et pré-primaire.'),
  ('ENS-1224', 'Patrick', 'Ntoutoume', 'p.ntoutoume@complexe-ogooue.ga', '+241 06 91 40 55', 'Nzeng-Ayong, Libreville', 'stagiaire', 'suspendu', '2025-01-13', 'Dossier administratif incomplet — régularisation en cours.'),
  ('ENS-0987', 'Léon', 'Ovono', 'l.ovono@complexe-ogooue.ga', '+241 06 17 22 40', 'Owendo, Libreville', 'permanent', 'archive', '2009-09-14', 'Départ à la retraite au 31 août 2026.')
) as v(matricule, prenom, nom, email, tel, adresse, contrat, statut, debut, notes)
on conflict (tenant_id, matricule) do nothing;

-- Classes
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.classes (tenant_id, academic_year_id, level_id, name, cycle, capacity, room, description, status)
select t.id, y.id, l.id, v.nom, v.cycle::app.cycle, v.capacite, v.salle, v.description, v.statut
from t
cross join (values
  ('Grande Section', 'gs', '2026-2027', 'prescolaire', 25, 'Salle 101', 'Dernière année de pré-primaire, préparation à l’entrée au CP1.', 'active'),
  ('CM2 A', 'cm2', '2026-2027', 'primaire', 40, 'Salle 102', 'Classe de fin de cycle primaire, préparation au CEP.', 'active'),
  ('6ème A', '6eme', '2026-2027', 'college', 45, 'Salle 103', 'Classe d’entrée au collège.', 'active'),
  ('6ème B', '6eme', '2026-2027', 'college', 45, 'Salle 201', 'Seconde division du niveau 6ème.', 'active'),
  ('5ème B', '5eme', '2026-2027', 'college', 42, 'Salle 202', '', 'active'),
  ('4ème A', '4eme', '2026-2027', 'college', 42, 'Salle 203', '', 'active'),
  ('3ème A', '3eme', '2026-2027', 'college', 40, 'Salle 201', 'Classe d’examen — préparation au BEPC.', 'active'),
  ('Seconde', 'seconde', '2026-2027', 'lycee', 50, 'Salle 202', 'Classe de détermination avant l’orientation en série.', 'active'),
  ('Première S', 'premiere', '2026-2027', 'lycee', 45, 'Labo Sciences', 'Série scientifique.', 'active'),
  ('Terminale C', 'terminale', '2026-2027', 'lycee', 40, 'Salle 203', 'Série C — mathématiques et sciences physiques.', 'active'),
  ('Terminale A1', 'terminale', '2026-2027', 'lycee', 45, 'Salle 103', 'Série A1 — lettres et sciences économiques.', 'active'),
  ('Licence 1 Informatique', 'licence1', '2026-2027', 'superieur', 60, 'Amphi A', 'Première année du parcours Licence Informatique (LMD).', 'active'),
  ('Master 1 Gestion', 'master1', '2026-2027', 'superieur', 35, 'Amphi B', 'Master Gestion des Organisations, parcours en alternance.', 'active'),
  ('Seconde B', 'seconde', '2026-2027', 'lycee', 45, '', 'Ouverture envisagée au 2ème trimestre selon les effectifs.', 'en_preparation'),
  ('Terminale C (2025-2026)', 'terminale', '2025-2026', 'lycee', 40, 'Salle 203', 'Promotion clôturée — année archivée.', 'archivee')
) as v(nom, niveau, annee, cycle, capacite, salle, description, statut)
join public.levels l on l.tenant_id = t.id and l.code = v.niveau
join public.academic_years y on y.tenant_id = t.id and y.label = v.annee
on conflict (tenant_id, academic_year_id, name) do nothing;

-- Professeurs principaux
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
update public.classes c
set main_teacher_id = te.id
from t
cross join (values
  ('Grande Section', 'ENS-1211'),
  ('CM2 A', 'ENS-1211'),
  ('6ème A', 'ENS-1142'),
  ('6ème B', 'ENS-1142'),
  ('5ème B', 'ENS-1156'),
  ('4ème A', 'ENS-1156'),
  ('3ème A', 'ENS-1103'),
  ('Seconde', 'ENS-1127'),
  ('Première S', 'ENS-1042'),
  ('Terminale C', 'ENS-1042'),
  ('Terminale A1', 'ENS-1119'),
  ('Licence 1 Informatique', 'ENS-1184'),
  ('Master 1 Gestion', 'ENS-1205'),
  ('Terminale C (2025-2026)', 'ENS-1042')
) as v(classe, matricule)
join public.teachers te on te.matricule = v.matricule
where c.tenant_id = t.id and c.name = v.classe and te.tenant_id = t.id;

-- Rattachement matiere / classe
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.class_subjects (tenant_id, class_id, subject_id, teacher_id, coefficient, weekly_hours)
select t.id, c.id, s.id, te.id, v.coefficient, v.heures
from t
cross join (values
  ('Terminale C', 'MATH', 'ENS-1042', 7, 8),
  ('Terminale C', 'PC', 'ENS-1078', 6, 6),
  ('Terminale C', 'PHILO', 'ENS-1170', 3, 4),
  ('Terminale C', 'ANG', 'ENS-1142', 2, 3),
  ('Terminale C', 'HG', 'ENS-1119', 2, 2),
  ('Terminale C', 'INFO', 'ENS-1184', 1, 2),
  ('Terminale A1', 'PHILO', 'ENS-1170', 5, 6),
  ('Terminale A1', 'ECO', 'ENS-1205', 5, 5),
  ('Terminale A1', 'HG', 'ENS-1119', 4, 4),
  ('Terminale A1', 'ANG', 'ENS-1142', 3, 3),
  ('Terminale A1', 'ESP', 'ENS-1198', 3, 3),
  ('Première S', 'MATH', 'ENS-1042', 5, 6),
  ('Première S', 'PC', 'ENS-1078', 4, 4),
  ('Première S', 'SVT', 'ENS-1127', 4, 4),
  ('Première S', 'FRA', 'ENS-1103', 4, 4),
  ('Première S', 'ANG', 'ENS-1142', 2, 3),
  ('Première S', 'ESP', 'ENS-1198', 2, 2),
  ('Première S', 'EPS', 'ENS-1163', 1, 2),
  ('Seconde', 'MATH', 'ENS-1042', 4, 5),
  ('Seconde', 'FRA', 'ENS-1103', 4, 5),
  ('Seconde', 'ANG', 'ENS-1142', 3, 3),
  ('Seconde', 'PC', 'ENS-1078', 3, 4),
  ('Seconde', 'SVT', 'ENS-1127', 3, 3),
  ('Seconde', 'HG', 'ENS-1119', 3, 3),
  ('Seconde', 'ESP', 'ENS-1198', 2, 2),
  ('Seconde', 'INFO', 'ENS-1184', 1, 2),
  ('Seconde', 'EPS', 'ENS-1163', 1, 2),
  ('3ème A', 'MATH', 'ENS-1156', 4, 5),
  ('3ème A', 'FRA', 'ENS-1103', 4, 5),
  ('3ème A', 'ANG', 'ENS-1142', 3, 4),
  ('3ème A', 'HG', 'ENS-1119', 3, 3),
  ('3ème A', 'SVT', 'ENS-1127', 2, 3),
  ('3ème A', 'PC', 'ENS-1078', 2, 3),
  ('3ème A', 'EPS', 'ENS-1163', 1, 2),
  ('4ème A', 'MATH', 'ENS-1156', 4, 5),
  ('4ème A', 'FRA', 'ENS-1103', 4, 5),
  ('4ème A', 'ANG', 'ENS-1142', 3, 4),
  ('4ème A', 'HG', 'ENS-1119', 3, 3),
  ('4ème A', 'SVT', 'ENS-1127', 2, 3),
  ('4ème A', 'PC', 'ENS-1078', 2, 2),
  ('4ème A', 'EPS', 'ENS-1163', 1, 2),
  ('5ème B', 'MATH', 'ENS-1156', 4, 5),
  ('5ème B', 'FRA', 'ENS-1103', 4, 5),
  ('5ème B', 'ANG', 'ENS-1142', 3, 4),
  ('5ème B', 'HG', 'ENS-1119', 3, 3),
  ('5ème B', 'SVT', 'ENS-1127', 2, 3),
  ('5ème B', 'EPS', 'ENS-1163', 1, 2),
  ('6ème A', 'FRA', 'ENS-1103', 5, 6),
  ('6ème A', 'MATH', 'ENS-1156', 4, 5),
  ('6ème A', 'ANG', 'ENS-1142', 3, 4),
  ('6ème A', 'HG', 'ENS-1119', 3, 3),
  ('6ème A', 'SVT', 'ENS-1127', 2, 2),
  ('6ème A', 'EPS', 'ENS-1163', 1, 2),
  ('6ème B', 'FRA', 'ENS-1103', 5, 6),
  ('6ème B', 'MATH', 'ENS-1156', 4, 5),
  ('6ème B', 'ANG', 'ENS-1142', 3, 4),
  ('6ème B', 'HG', 'ENS-1119', 3, 3),
  ('6ème B', 'SVT', 'ENS-1127', 2, 2),
  ('6ème B', 'EPS', 'ENS-1163', 1, 2),
  ('CM2 A', 'LECT', 'ENS-1211', 4, 6),
  ('Grande Section', 'EVEIL', 'ENS-1211', 1, 5),
  ('Licence 1 Informatique', 'INF-L1-01', 'ENS-1184', 6, 6),
  ('Licence 1 Informatique', 'INF-L1-04', 'ENS-1224', 4, 4),
  ('Master 1 Gestion', 'GES-M1-02', 'ENS-1205', 5, 3)
) as v(classe, matiere, matricule, coefficient, heures)
join public.classes c on c.tenant_id = t.id and c.name = v.classe
join public.subjects s on s.tenant_id = t.id and s.code = v.matiere
left join public.teachers te on te.tenant_id = t.id and te.matricule = v.matricule
on conflict (class_id, subject_id) do nothing;

-- Eleves
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.students (tenant_id, matricule, first_name, last_name, birth_date, birth_place, gender, nationality, address, class_id, level_id, academic_year_id, status, medical_info, previous_school, filiere, parcours, is_draft)
select t.id, v.matricule, v.prenom, v.nom, v.naissance::date, v.lieu, v.sexe, v.nationalite, v.adresse,
       c.id, l.id, y.id, v.statut, v.medical, v.ecole, v.filiere, v.parcours, v.brouillon
from t
cross join (values
  ('MAT-2301', 'Jean', 'Ndong', '2008-03-14', 'Libreville', 'M', 'Camerounaise', 'Quartier Louis, Libreville', 'Terminale C', 'terminale', '2026-2027', 'actif', 'Asthme léger — inhalateur au bureau de la vie scolaire.', 'École publique de Nzeng-Ayong', '', '', false),
  ('MAT-2305', 'Sarah', 'Nguema', '2008-07-02', 'Port-Gentil', 'F', 'Gabonaise', 'Nzeng-Ayong, Libreville', 'Terminale C', 'terminale', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2312', 'Yannick', 'Mboumba', '2007-11-25', 'Franceville', 'M', 'Gabonaise', 'Glass, Libreville', 'Terminale C', 'terminale', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2318', 'Aline', 'Ovono', '2008-01-30', 'Oyem', 'F', 'Gabonaise', 'Owendo, Libreville', 'Terminale C', 'terminale', '2026-2027', 'actif', '', 'Institut Immaculée Conception', '', '', false),
  ('MAT-2324', 'Fabrice', 'Kombila', '2008-05-19', 'Libreville', 'M', 'Gabonaise', 'Akanda, Libreville', 'Terminale C', 'terminale', '2026-2027', 'en_attente', '', '', '', '', false),
  ('MAT-2331', 'Grace', 'Bongo', '2008-09-08', 'Libreville', 'F', 'Gabonaise', 'PK8, Libreville', 'Terminale C', 'terminale', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2340', 'Christian', 'Mengue', '2007-12-11', 'Lambaréné', 'M', 'Gabonaise', 'Lalala, Libreville', 'Terminale A1', 'terminale', '2026-2027', 'actif', '', 'Collège Bessieux', '', '', false),
  ('MAT-2346', 'Prisca', 'Ibinga', '2008-02-27', 'Mouila', 'F', 'Gabonaise', 'Batterie IV, Libreville', 'Terminale A1', 'terminale', '2026-2027', 'actif', 'Asthme léger — inhalateur au bureau de la vie scolaire.', '', '', '', false),
  ('MAT-2352', 'Wilfried', 'Nzamba', '2008-06-16', 'Tchibanga', 'M', 'Gabonaise', 'Charbonnages, Libreville', 'Terminale A1', 'terminale', '2026-2027', 'transfere', '', '', '', '', false),
  ('MAT-2358', 'Nadia', 'Lekogo', '2008-04-05', 'Libreville', 'F', 'Gabonaise', 'Sotega, Libreville', 'Terminale A1', 'terminale', '2026-2027', 'actif', '', 'École Sainte-Marie de Port-Gentil', '', '', false),
  ('MAT-2410', 'Marie', 'Mba', '2009-05-21', 'Libreville', 'F', 'Gabonaise', 'Awendje, Libreville', 'Première S', 'premiere', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2415', 'Steve', 'Assoumou', '2009-08-13', 'Bitam', 'M', 'Camerounaise', 'Angondje, Libreville', 'Première S', 'premiere', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2421', 'Laetitia', 'Divounguy', '2009-01-09', 'Moanda', 'F', 'Gabonaise', 'Quartier Louis, Libreville', 'Première S', 'premiere', '2026-2027', 'actif', '', 'Lycée Léon Mba', '', '', false),
  ('MAT-2427', 'Brice', 'Makaya', '2009-10-04', 'Libreville', 'M', 'Gabonaise', 'Nzeng-Ayong, Libreville', 'Première S', 'premiere', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2433', 'Ornella', 'Mouele', '2009-03-18', 'Port-Gentil', 'F', 'Gabonaise', 'Glass, Libreville', 'Première S', 'premiere', '2026-2027', 'en_attente', 'Asthme léger — inhalateur au bureau de la vie scolaire.', '', '', '', false),
  ('MAT-2287', 'Paul', 'Obiang', '2010-02-07', 'Libreville', 'M', 'Gabonaise', 'Owendo, Libreville', 'Seconde', 'seconde', '2026-2027', 'actif', '', 'École publique de Nzeng-Ayong', '', '', false),
  ('MAT-2291', 'Chimène', 'Sima', '2010-06-29', 'Oyem', 'F', 'Gabonaise', 'Akanda, Libreville', 'Seconde', 'seconde', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2296', 'Ludovic', 'Rekangalt', '2010-09-15', 'Koulamoutou', 'M', 'Gabonaise', 'PK8, Libreville', 'Seconde', 'seconde', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2302', 'Vanessa', 'Nzue', '2010-04-23', 'Libreville', 'F', 'Gabonaise', 'Lalala, Libreville', 'Seconde', 'seconde', '2026-2027', 'actif', '', 'Institut Immaculée Conception', '', '', false),
  ('MAT-2308', 'Kevin', 'Boussougou', '2010-11-11', 'Makokou', 'M', 'Gabonaise', 'Batterie IV, Libreville', 'Seconde', 'seconde', '2026-2027', 'archive', '', '', '', '', false),
  ('MAT-2501', 'Ange', 'Mintsa', '2011-01-17', 'Libreville', 'F', 'Gabonaise', 'Charbonnages, Libreville', '3ème A', '3eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2506', 'Junior', 'Ondo', '2011-07-30', 'Libreville', 'M', 'Gabonaise', 'Sotega, Libreville', '3ème A', '3eme', '2026-2027', 'actif', 'Asthme léger — inhalateur au bureau de la vie scolaire.', 'Collège Bessieux', '', '', false),
  ('MAT-2511', 'Sonia', 'Mavoungou', '2011-03-06', 'Mouila', 'F', 'Camerounaise', 'Awendje, Libreville', '3ème A', '3eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2516', 'Emmanuel', 'Bekale', '2011-09-24', 'Bitam', 'M', 'Gabonaise', 'Angondje, Libreville', '3ème A', '3eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2604', 'Doriane', 'Koumba', '2012-05-12', 'Libreville', 'F', 'Gabonaise', 'Quartier Louis, Libreville', '4ème A', '4eme', '2026-2027', 'actif', '', 'École Sainte-Marie de Port-Gentil', '', '', false),
  ('MAT-2609', 'Rodrigue', 'Ella', '2012-08-03', 'Lambaréné', 'M', 'Gabonaise', 'Nzeng-Ayong, Libreville', '4ème A', '4eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2614', 'Elodie', 'Ngoua', '2012-12-19', 'Libreville', 'F', 'Gabonaise', 'Glass, Libreville', '4ème A', '4eme', '2026-2027', 'en_attente', '', '', '', '', false),
  ('MAT-2702', 'Merveille', 'Nzigou', '2013-02-25', 'Franceville', 'F', 'Gabonaise', 'Owendo, Libreville', '5ème B', '5eme', '2026-2027', 'actif', '', 'Lycée Léon Mba', '', '', false),
  ('MAT-2707', 'Alban', 'Mabika', '2013-06-08', 'Libreville', 'M', 'Gabonaise', 'Akanda, Libreville', '5ème B', '5eme', '2026-2027', 'actif', 'Asthme léger — inhalateur au bureau de la vie scolaire.', '', '', '', false),
  ('MAT-2712', 'Carine', 'Ntoutoume', '2013-10-14', 'Oyem', 'F', 'Gabonaise', 'PK8, Libreville', '5ème B', '5eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2801', 'Gaël', 'Oyane', '2014-04-02', 'Libreville', 'M', 'Gabonaise', 'Lalala, Libreville', '6ème A', '6eme', '2026-2027', 'actif', '', 'École publique de Nzeng-Ayong', '', '', false),
  ('MAT-2806', 'Ruth', 'Biyoghe', '2014-08-27', 'Port-Gentil', 'F', 'Gabonaise', 'Batterie IV, Libreville', '6ème A', '6eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2811', 'Idriss', 'Moussavou', '2014-11-09', 'Tchibanga', 'M', 'Gabonaise', 'Charbonnages, Libreville', '6ème A', '6eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2816', 'Naomi', 'Ndong Mba', '2014-01-21', 'Libreville', 'F', 'Camerounaise', 'Sotega, Libreville', '6ème A', '6eme', '2026-2027', 'actif', '', 'Institut Immaculée Conception', '', '', false),
  ('MAT-2821', 'Samuel', 'Ovono', '2014-09-05', 'Libreville', 'M', 'Gabonaise', 'Awendje, Libreville', '6ème B', '6eme', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2826', 'Léa', 'Mboumba', '2014-03-30', 'Moanda', 'F', 'Gabonaise', 'Angondje, Libreville', '6ème B', '6eme', '2026-2027', 'actif', 'Asthme léger — inhalateur au bureau de la vie scolaire.', '', '', '', false),
  ('MAT-2831', 'Ismaël', 'Kombila', '2014-06-17', 'Libreville', 'M', 'Gabonaise', 'Quartier Louis, Libreville', '6ème B', '6eme', '2026-2027', 'en_attente', '', 'Collège Bessieux', '', '', false),
  ('MAT-2901', 'Bénédicte', 'Nguema', '2015-05-14', 'Libreville', 'F', 'Gabonaise', 'Nzeng-Ayong, Libreville', 'CM2 A', 'cm2', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2906', 'Yohan', 'Mengue', '2015-10-22', 'Libreville', 'M', 'Gabonaise', 'Glass, Libreville', 'CM2 A', 'cm2', '2026-2027', 'actif', '', '', '', '', false),
  ('MAT-2951', 'Aïcha', 'Ibinga', '2021-07-19', 'Libreville', 'F', 'Gabonaise', 'Owendo, Libreville', 'Grande Section', 'gs', '2026-2027', 'actif', '', 'École Sainte-Marie de Port-Gentil', '', '', false),
  ('ETU-1101', 'Cédric', 'Nzamba', '2007-02-11', 'Libreville', 'M', 'Gabonaise', 'Akanda, Libreville', 'Licence 1 Informatique', 'licence1', '2026-2027', 'actif', '', '', 'Informatique', 'Formation initiale', false),
  ('ETU-1106', 'Stéphanie', 'Lekogo', '2006-12-04', 'Port-Gentil', 'F', 'Gabonaise', 'PK8, Libreville', 'Licence 1 Informatique', 'licence1', '2026-2027', 'actif', '', '', 'Gestion des Organisations', 'Formation initiale', false),
  ('ETU-1111', 'Arnaud', 'Assoumou', '2007-08-28', 'Franceville', 'M', 'Gabonaise', 'Lalala, Libreville', 'Licence 1 Informatique', 'licence1', '2026-2027', 'actif', 'Asthme léger — inhalateur au bureau de la vie scolaire.', 'Lycée Léon Mba', 'Informatique', 'Formation initiale', false),
  ('ETU-1201', 'Murielle', 'Divounguy', '2003-09-16', 'Libreville', 'F', 'Gabonaise', 'Batterie IV, Libreville', 'Master 1 Gestion', 'master1', '2026-2027', 'actif', '', '', 'Gestion des Organisations', 'Formation initiale', false),
  ('ETU-1206', 'Landry', 'Makaya', '2002-04-08', 'Mouila', 'M', 'Camerounaise', 'Charbonnages, Libreville', 'Master 1 Gestion', 'master1', '2026-2027', 'actif', '', '', 'Informatique', 'Formation initiale', false)
) as v(matricule, prenom, nom, naissance, lieu, sexe, nationalite, adresse, classe, niveau, annee, statut, medical, ecole, filiere, parcours, brouillon)
left join public.classes c on c.tenant_id = t.id and c.name = v.classe
left join public.levels l on l.tenant_id = t.id and l.code = v.niveau
left join public.academic_years y on y.tenant_id = t.id and y.label = v.annee
on conflict (tenant_id, matricule) do nothing;

-- Parents et tuteurs
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.guardians (tenant_id, first_name, last_name, phone, alt_phone, email, address, profession, id_document, notes, status)
select t.id, v.prenom, v.nom, v.tel, v.tel2, v.email, v.adresse, v.profession, v.piece, v.notes, v.statut
from t
cross join (values
  ('Paulin', 'Ndong', '+241 06 21 44 08', '+241 01 76 30 12', 'paulin.ndong@mail.ga', 'Quartier Louis, Libreville', 'Commerçante', 'CNI n° 1200000', '', 'actif'),
  ('Estelle', 'Nguema', '+241 07 33 12 76', '', 'estelle.nguema@mail.ga', 'Nzeng-Ayong, Libreville', 'Fonctionnaire', 'Passeport n° GA450013', '', 'actif'),
  ('Sophie', 'Mboumba', '+241 07 95 21 03', '', 'sophie.mboumba@mail.ga', 'Glass, Libreville', 'Enseignant', 'Passeport n° GA450026', '', 'actif'),
  ('Célestin', 'Ovono', '+241 07 15 62 44', '', 'celestin.ovono@mail.ga', 'Owendo, Libreville', 'Infirmière', 'CNI n° 1200111', '', 'actif'),
  ('Georges', 'Kombila', '+241 06 31 78 25', '+241 01 76 30 12', 'georges.kombila@mail.ga', 'Akanda, Libreville', 'Chauffeur', 'Passeport n° GA450052', '', 'actif'),
  ('Rodrigue', 'Bongo', '+241 07 61 28 55', '', 'rodrigue.bongo@mail.ga', 'PK8, Libreville', 'Ingénieur', 'Passeport n° GA450065', '', 'actif'),
  ('Odette', 'Mengue', '+241 06 44 71 30', '', 'odette.mengue@mail.ga', 'Lalala, Libreville', 'Artisan', 'CNI n° 1200222', '', 'actif'),
  ('Fatou', 'Ibinga', '+241 07 08 34 71', '', 'fatou.ibinga@mail.ga', 'Batterie IV, Libreville', 'Cadre bancaire', 'Passeport n° GA450091', '', 'actif'),
  ('Julie', 'Nzamba', '+241 06 30 18 47', '+241 01 76 30 12', 'julie.nzamba@mail.ga', 'Quartier Louis, Libreville', 'Agricultrice', 'Passeport n° GA450104', '', 'actif'),
  ('Marc', 'Lekogo', '+241 07 82 34 60', '', 'marc.lekogo@mail.ga', 'Nzeng-Ayong, Libreville', 'Sans emploi déclaré', 'CNI n° 1200333', '', 'actif'),
  ('Antoine', 'Mba', '+241 06 55 77 21', '', 'antoine.mba@mail.ga', 'Glass, Libreville', 'Commerçante', 'Passeport n° GA450130', '', 'actif'),
  ('Delphine', 'Assoumou', '+241 07 41 96 08', '', 'delphine.assoumou@mail.ga', 'Owendo, Libreville', 'Fonctionnaire', 'Passeport n° GA450143', '', 'actif'),
  ('Guy', 'Divounguy', '+241 06 12 85 39', '+241 01 76 30 12', 'guy.divounguy@mail.ga', 'Akanda, Libreville', 'Enseignant', 'CNI n° 1200444', '', 'actif'),
  ('Sylviane', 'Makaya', '+241 07 70 23 14', '', 'sylviane.makaya@mail.ga', 'PK8, Libreville', 'Infirmière', 'Passeport n° GA450169', '', 'actif'),
  ('Landry', 'Mouele', '+241 06 68 02 51', '', 'landry.mouele@mail.ga', 'Lalala, Libreville', 'Chauffeur', 'Passeport n° GA450182', '', 'actif'),
  ('Rachel', 'Obiang', '+241 07 25 63 90', '', 'rachel.obiang@mail.ga', 'Batterie IV, Libreville', 'Ingénieur', 'CNI n° 1200555', '', 'actif'),
  ('Bernard', 'Sima', '+241 06 91 47 22', '+241 01 76 30 12', 'bernard.sima@mail.ga', 'Quartier Louis, Libreville', 'Artisan', 'Passeport n° GA450208', '', 'actif'),
  ('Antoinette', 'Rekangalt', '+241 07 58 11 07', '', 'antoinette.rekangalt@mail.ga', 'Nzeng-Ayong, Libreville', 'Cadre bancaire', 'Passeport n° GA450221', '', 'actif'),
  ('Thierry', 'Nzue', '+241 06 37 80 64', '', 'thierry.nzue@mail.ga', 'Glass, Libreville', 'Agricultrice', 'CNI n° 1200666', '', 'actif'),
  ('Nathalie', 'Boussougou', '+241 07 04 92 38', '', 'nathalie.boussougou@mail.ga', 'Owendo, Libreville', 'Sans emploi déclaré', 'Passeport n° GA450247', '', 'actif'),
  ('Patricia', 'Mintsa', '+241 06 49 26 73', '+241 01 76 30 12', 'patricia.mintsa@mail.ga', 'Akanda, Libreville', 'Commerçante', 'Passeport n° GA450260', '', 'actif'),
  ('Franck', 'Ondo', '+241 07 13 45 89', '', 'franck.ondo@mail.ga', 'PK8, Libreville', 'Fonctionnaire', 'CNI n° 1200777', '', 'actif'),
  ('Blaise', 'Mavoungou', '+241 06 76 31 20', '', 'blaise.mavoungou@mail.ga', 'Lalala, Libreville', 'Enseignant', 'Passeport n° GA450286', '', 'actif'),
  ('Colette', 'Bekale', '+241 07 88 07 41', '', 'colette.bekale@mail.ga', 'Batterie IV, Libreville', 'Infirmière', 'Passeport n° GA450299', '', 'actif'),
  ('Alphonse', 'Koumba', '+241 06 22 59 84', '+241 01 76 30 12', 'alphonse.koumba@mail.ga', 'Quartier Louis, Libreville', 'Chauffeur', 'CNI n° 1200888', '', 'actif'),
  ('Sylvie', 'Ella', '+241 07 66 14 27', '', 'sylvie.ella@mail.ga', 'Nzeng-Ayong, Libreville', 'Ingénieur', 'Passeport n° GA450325', '', 'actif'),
  ('Didier', 'Ngoua', '+241 06 05 73 60', '', 'didier.ngoua@mail.ga', 'Glass, Libreville', 'Artisan', 'Passeport n° GA450338', '', 'actif'),
  ('Régine', 'Nzigou', '+241 07 39 82 15', '', 'regine.nzigou@mail.ga', 'Owendo, Libreville', 'Cadre bancaire', 'CNI n° 1200999', '', 'actif'),
  ('Yves', 'Mabika', '+241 06 84 20 93', '+241 01 76 30 12', 'yves.mabika@mail.ga', 'Akanda, Libreville', 'Agricultrice', 'Passeport n° GA450364', '', 'actif'),
  ('Josiane', 'Ntoutoume', '+241 07 51 67 32', '', 'josiane.ntoutoume@mail.ga', 'PK8, Libreville', 'Sans emploi déclaré', 'Passeport n° GA450377', '', 'actif'),
  ('Martine', 'Oyane', '+241 06 60 38 71', '', 'martine.oyane@mail.ga', 'Lalala, Libreville', 'Commerçante', 'CNI n° 1201110', '', 'actif'),
  ('Armand', 'Biyoghe', '+241 07 27 90 46', '', 'armand.biyoghe@mail.ga', 'Batterie IV, Libreville', 'Fonctionnaire', 'Passeport n° GA450403', '', 'actif'),
  ('Léa', 'Moussavou', '+241 06 43 15 08', '+241 01 76 30 12', 'lea.moussavou@mail.ga', 'Quartier Louis, Libreville', 'Enseignant', 'Passeport n° GA450416', '', 'actif'),
  ('Christiane', 'Ndong', '+241 07 72 04 59', '', 'christiane.ndong@mail.ga', 'Nzeng-Ayong, Libreville', 'Infirmière', 'CNI n° 1201221', '', 'actif'),
  ('Bertrand', 'Ovono', '+241 06 18 47 62', '', 'bertrand.ovono@mail.ga', 'Glass, Libreville', 'Chauffeur', 'Passeport n° GA450442', '', 'actif'),
  ('Alice', 'Nguema', '+241 07 46 09 87', '', 'alice.nguema@mail.ga', 'Owendo, Libreville', 'Ingénieur', 'Passeport n° GA450481', '', 'actif'),
  ('Roger', 'Mengue', '+241 06 57 63 40', '', 'roger.mengue@mail.ga', 'Akanda, Libreville', 'Artisan', 'Passeport n° GA450494', '', 'actif'),
  ('Cédric', 'Nzamba', '+241 06 90 52 18', '+241 01 76 30 12', 'cedric.nzamba@mail.ga', 'PK8, Libreville', 'Cadre bancaire', 'Passeport n° GA450520', '', 'actif'),
  ('Stéphanie', 'Lekogo', '+241 07 34 76 90', '', 'stephanie.lekogo@mail.ga', 'Lalala, Libreville', 'Agricultrice', 'Passeport n° GA450533', '', 'actif'),
  ('Arnaud', 'Assoumou', '+241 06 65 29 47', '', 'arnaud.assoumou@mail.ga', 'Batterie IV, Libreville', 'Sans emploi déclaré', 'CNI n° 1201554', '', 'actif'),
  ('Murielle', 'Divounguy', '+241 07 19 83 25', '', 'murielle.divounguy@mail.ga', 'Quartier Louis, Libreville', 'Commerçante', 'Passeport n° GA450559', '', 'actif'),
  ('Landry', 'Makaya', '+241 06 73 41 06', '+241 01 76 30 12', 'landry.makaya@mail.ga', 'Nzeng-Ayong, Libreville', 'Fonctionnaire', 'Passeport n° GA450572', '', 'actif')
) as v(prenom, nom, tel, tel2, email, adresse, profession, piece, notes, statut)
where not exists (
  select 1 from public.guardians g
  where g.tenant_id = t.id and g.first_name = v.prenom and g.last_name = v.nom and g.phone = v.tel
);

-- Rattachements tuteur / eleve
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.guardian_links (tenant_id, guardian_id, student_id, relation, is_primary, can_pick_up)
select t.id, g.id, s.id, v.relation, v.principal, v.recuperation
from t
cross join (values
  ('+241 06 21 44 08', 'MAT-2301', 'pere', true, true),
  ('+241 07 33 12 76', 'MAT-2305', 'mere', true, true),
  ('+241 07 95 21 03', 'MAT-2312', 'mere', true, true),
  ('+241 07 15 62 44', 'MAT-2318', 'pere', true, true),
  ('+241 06 31 78 25', 'MAT-2324', 'pere', true, true),
  ('+241 07 61 28 55', 'MAT-2331', 'pere', true, true),
  ('+241 06 44 71 30', 'MAT-2340', 'mere', true, true),
  ('+241 07 08 34 71', 'MAT-2346', 'mere', true, true),
  ('+241 06 30 18 47', 'MAT-2352', 'mere', true, true),
  ('+241 07 82 34 60', 'MAT-2358', 'pere', true, true),
  ('+241 06 55 77 21', 'MAT-2410', 'pere', true, true),
  ('+241 07 41 96 08', 'MAT-2415', 'mere', true, true),
  ('+241 06 12 85 39', 'MAT-2421', 'pere', true, true),
  ('+241 07 70 23 14', 'MAT-2427', 'mere', true, true),
  ('+241 06 68 02 51', 'MAT-2433', 'oncle', true, true),
  ('+241 07 25 63 90', 'MAT-2287', 'mere', true, true),
  ('+241 06 91 47 22', 'MAT-2291', 'pere', true, true),
  ('+241 07 58 11 07', 'MAT-2296', 'mere', true, true),
  ('+241 06 37 80 64', 'MAT-2302', 'pere', true, true),
  ('+241 07 04 92 38', 'MAT-2308', 'mere', true, true),
  ('+241 06 49 26 73', 'MAT-2501', 'mere', true, true),
  ('+241 07 13 45 89', 'MAT-2506', 'pere', true, true),
  ('+241 06 76 31 20', 'MAT-2511', 'pere', true, true),
  ('+241 07 88 07 41', 'MAT-2516', 'grand_parent', true, true),
  ('+241 06 22 59 84', 'MAT-2604', 'pere', true, true),
  ('+241 07 66 14 27', 'MAT-2609', 'mere', true, true),
  ('+241 06 05 73 60', 'MAT-2614', 'pere', true, true),
  ('+241 07 39 82 15', 'MAT-2702', 'mere', true, true),
  ('+241 06 84 20 93', 'MAT-2707', 'pere', true, true),
  ('+241 07 51 67 32', 'MAT-2712', 'mere', true, true),
  ('+241 06 60 38 71', 'MAT-2801', 'mere', true, true),
  ('+241 07 27 90 46', 'MAT-2806', 'pere', true, true),
  ('+241 06 43 15 08', 'MAT-2811', 'mere', true, true),
  ('+241 07 72 04 59', 'MAT-2816', 'tuteur', true, true),
  ('+241 06 18 47 62', 'MAT-2821', 'pere', true, true),
  ('+241 07 95 21 03', 'MAT-2826', 'mere', true, false),
  ('+241 06 31 78 25', 'MAT-2831', 'pere', true, false),
  ('+241 07 46 09 87', 'MAT-2901', 'mere', true, true),
  ('+241 06 57 63 40', 'MAT-2906', 'pere', true, true),
  ('+241 07 08 34 71', 'MAT-2951', 'mere', true, false),
  ('+241 06 90 52 18', 'ETU-1101', 'autre', true, false),
  ('+241 07 34 76 90', 'ETU-1106', 'autre', true, false),
  ('+241 06 65 29 47', 'ETU-1111', 'autre', true, false),
  ('+241 07 19 83 25', 'ETU-1201', 'autre', true, false),
  ('+241 06 73 41 06', 'ETU-1206', 'autre', true, false)
) as v(tel, matricule, relation, principal, recuperation)
join public.guardians g on g.tenant_id = t.id and g.phone = v.tel
join public.students s on s.tenant_id = t.id and s.matricule = v.matricule
on conflict (guardian_id, student_id) do nothing;

-- Gabarits et signature
-- --------------------------------------------------------------------------
with t as (select id from public.tenants where slug = 'demo')
insert into public.document_templates (tenant_id, variant, document_title, footer_text, accent_color, columns)
select t.id, v.variante, v.titre, v.pied, '#7c3aed', v.colonnes::text[]
from t
cross join (values
  ('report', 'Bulletin de notes', 'Complexe scolaire Ogooué — Libreville', array['teacher','coefficient','classAverage']),
  ('card', 'Carte scolaire', 'Année 2026-2027', array[]::text[])
) as v(variante, titre, pied, colonnes)
on conflict (tenant_id, variant) do nothing;

-- Signature du chef d'établissement
-- --------------------------------------------------------------------------
insert into public.signatures (tenant_id, signer_name, signer_role)
select id, 'M. Ndong Mba', 'Chef d''établissement' from public.tenants where slug = 'demo'
on conflict (tenant_id) do nothing;

