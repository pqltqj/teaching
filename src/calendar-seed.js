// Based on the mentor planner; C1 teaching days follow the Cell Division slides.
// Quiz, test and review days are preserved. Science 10 uses the triangle-marked row beneath Biology 30.
// November 30 is on the December spread. Entries before October 26 are excluded.
export const calendarCourses = [
  {id: 'biology30', name: 'Biology 30'},
  {id: 'science10', name: 'Science 10'},
  {id: 'chemistry20', name: 'Chemistry 20'},
  {id: 'biology20', name: 'Biology 20'}
];
const lessons = [
  ['2026-10-26', 'Review', 'Quiz', 'Cellular respiration: usable forms of energy'],
  ['2026-10-27', 'Reproduction test', 'Net ionic equations (p. 6)', 'Glycolysis'],
  ['2026-10-28', 'C1: Chromosomes, homologues and sister chromatids; haploid/diploid; interphase (slides 1–17)', 'Qualitative analysis (p. 7)', 'Krebs cycle'],
  ['2026-10-29', 'C1: Mitosis, cytokinesis and cancer (slides 18–35)', 'Precipitation lab', 'Electron transport chain'],
  ['2026-11-02', 'C1: Cloning, stem cells and telomeres; cloning and stem-cell ethics activity (slides 36–45)', 'Precipitation lab', 'Anaerobic respiration'],
  ['2026-11-03', 'C1: Meiosis I and II, crossing over, independent assortment and gametogenesis (slides 46–63)', 'Solubility', 'Review'],
  ['2026-11-04', 'C1 activity: Model mitosis and meiosis; track chromosomes, chromatids and ploidy', 'Pressure and solubility lab', 'Photosynthesis and cellular respiration test'],
  ['2026-11-05', 'Mitosis quiz', 'Quiz', 'Carbohydrates'],
  ['2026-11-09', 'C1: Nondisjunction and reproductive strategies (slides 64–77)', 'Acids and bases (p. 1)', 'Polysaccharides'],
  ['2026-11-10', 'C1: Alternation of generations; map sporophyte/gametophyte life cycles (slides 78–83)', 'Monoprotic and polyprotic acids/bases (pp. 2–3)', 'Lipids'],
  ['2026-11-12', 'Review', 'Calculating pOH (pp. 4–5)', 'Enzymes'],
  ['2026-11-13', 'Mitosis and meiosis test', 'Calculating concentrations using pH or pOH (pp. 6–7)', 'Quiz'],
  ['2026-11-16', 'Genetics', 'Indicators (p. 8)', 'Nutrients lab'],
  ['2026-11-17', 'Monohybrids', 'pH meters (pp. 9–10)', 'Nutrients lab / homeostasis'],
  ['2026-11-18', 'Incomplete dominance and codominance', 'Review', 'Mouth'],
  ['2026-11-19', 'Test cross; multiple alleles', 'Acid/base solutions test', 'Small intestine'],
  ['2026-11-23', 'Dihybrid cross', 'Balancing and reaction types (pp. 1–2)', 'Digestion'],
  ['2026-11-24', 'Quiz; X-linked traits', 'Mole ratios (p. 3)', 'Review'],
  ['2026-11-25', 'Pedigrees', 'Gravimetric stoichiometry (pp. 4–5)', 'Digestive test'],
  ['2026-11-26', 'Review', 'Solution stoichiometry', 'Blood'],
  ['2026-11-27', 'Genetic test', 'Gravimetric lab', 'Platelets'],
  ['2026-11-30', 'DNA', 'Gravimetric lab', 'Blood typing lab'],
  ['2026-12-01', 'Structure of DNA', 'Law of combining volumes (p. 8)', 'Immune response'],
  ['2026-12-02', 'RNA', 'Gas stoichiometry (pp. 9–10)', 'Heart'],
  ['2026-12-03', 'DNA sequencing', 'Stoichiometry quiz', 'Blood pressure lab'],
  ['2026-12-07', 'Recombinant DNA', 'Limiting and excess reactants (pp. 11–12)', 'Quiz'],
  ['2026-12-08', 'Mutations', 'Predicting and experimental yield (p. 13)', 'Blood pressure influences (slide 73)'],
  ['2026-12-09', 'Types of genes', 'Titrations (p. 14)', 'Peripheral control of circulation'],
  ['2026-12-10', 'Review', 'Titrations lab', 'Review'],
  ['2026-12-11', 'DNA and RNA test', 'Titrations lab', 'Circulation test'],
  ['2026-12-14', 'Population genetics', 'Titration curves', '9.1 Oxygen delivery system'],
  ['2026-12-15', 'Evolution', 'Review', 'Breath of air'],
  ['2026-12-16', 'Case study', 'Stoichiometry test', '9.2 Gas exchange and transport'],
  ['2026-12-17', 'Populations', 'Review', '9.3 Regulation of breathing']
];
export const calendarSeed = Object.fromEntries(lessons.map(([date, biology30, chemistry20, biology20]) => [date, {biology30, chemistry20, biology20, note: ''}]));
for (const date of ['2026-11-06', '2026-11-20', '2026-12-04', '2026-12-18']) calendarSeed[date] = {note: 'PLF'};
calendarSeed['2026-10-30'] = {note: 'ATA Day'};
calendarSeed['2026-11-11'] = {note: 'No school — Remembrance Day'};
for (let day = 21; day <= 31; day++) calendarSeed[`2026-12-${day}`] = {note: 'Christmas break'};

// Science 10 uses triangle-marked entries. November 12 is crossed out/unclear and left blank.
const science10Lessons = {
  "2026-11-02": "Mechanical energy",
  "2026-11-03": "Thermodynamics",
  "2026-11-04": "Energy conversion",
  "2026-11-05": "Development of energy",
  "2026-11-09": "Energy applications",
  "2026-11-10": "Review",
  "2026-11-13": "Microscopes; image magnification",
  "2026-11-16": "Microscope lab",
  "2026-11-17": "Abiogenesis",
  "2026-11-18": "Cell theory",
  "2026-11-19": "Cell research",
  "2026-11-23": "Cells",
  "2026-11-24": "Organelles",
  "2026-11-25": "Cell membrane",
  "2026-11-26": "Quiz",
  "2026-11-27": "Membrane technology",
  "2026-11-30": "Surface area to volume ratio",
  "2026-12-01": "Organisms",
  "2026-12-02": "Photosynthesis",
  "2026-12-03": "Transport in plants",
  "2026-12-07": "Review",
  "2026-12-08": "Biology test",
  "2026-12-09": "Weather vs. climate",
  "2026-12-10": "The water cycle",
  "2026-12-11": "Thermal energy transfer",
  "2026-12-14": "Water",
  "2026-12-15": "Review of mole",
  "2026-12-16": "Quiz",
  "2026-12-17": "Biomes"
};
for (const [date, science10] of Object.entries(science10Lessons)) calendarSeed[date].science10 = science10;
