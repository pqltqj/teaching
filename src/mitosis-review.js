// November 2 Biology 30 review: concise mitosis-only questions.
export const mitosisReview = {
  "date": "2026-11-02",
  "title": "Mitosis",
  "questions": [
    {
      "question": "How does cytokinesis occur in plant cells?",
      "answer": "A cell plate forms between the two nuclei and develops into a new cell wall."
    },
    {
      "question": "What happens during prophase?",
      "answer": "Chromosomes condense, the nuclear envelope breaks down, and spindle fibres form."
    },
    {
      "question": "Draw a diploid cell with n = 3 during metaphase.",
      "answer": "Show 6 X-shaped chromosomes lined up individually at the equator, with spindle fibres attached from opposite poles."
    },
    {
      "question": "What separates during anaphase?",
      "answer": "Sister chromatids separate and move to opposite poles."
    },
    {
      "question": "What happens during telophase?",
      "answer": "Nuclear envelopes reform, chromosomes uncoil, and spindle fibres break down."
    },
    {
      "question": "What is the role of spindle fibres in mitosis?",
      "answer": "They align chromosomes and pull sister chromatids to opposite poles."
    }
  ]
};
export async function ensureMitosisReview(storage) {
  const marker = 'migration:biology30-mitosis-2026-11-02-v3';
  if (await storage.get(marker)) return;
  await storage.transaction(async txn => {
    if (await txn.get(marker)) return;
    const bank = await txn.get('bank');
    const course = bank?.courses.find(c => c.id === 'biology30');
    if (!course) return;
    const index = course.sets.findIndex(s => s.date === mitosisReview.date);
    if (index >= 0) course.sets[index] = structuredClone(mitosisReview);
    else {
      course.sets.push(structuredClone(mitosisReview));
      await txn.put('lock:biology30:' + mitosisReview.date, true);
    }
    await txn.put('bank', bank);
    await txn.put(marker, true);
  });
}
