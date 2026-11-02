// Add the November 2 mitosis review once without replacing existing bank data.
export const mitosisReview = {
  "date": "2026-11-02",
  "title": "Mitosis",
  "questions": [
    {
      "question": "What happens to chromosomes, the nuclear envelope, and spindle fibres during prophase?",
      "answer": "Chromatin condenses into visible chromosomes, the nuclear envelope breaks down, and spindle fibres form as the spindle poles move apart. Each duplicated chromosome consists of two sister chromatids."
    },
    {
      "question": "How are chromosomes arranged during metaphase, and why is this arrangement important?",
      "answer": "Duplicated chromosomes line up individually at the cell's equator. Attachment to opposite spindle poles positions the sister chromatids to separate to opposite ends of the cell."
    },
    {
      "question": "What separates during anaphase, and where does it move?",
      "answer": "Sister chromatids separate at their centromeres and move toward opposite poles as spindle fibres shorten. Once separated, each chromatid is considered a chromosome."
    },
    {
      "question": "Describe three changes that occur during telophase.",
      "answer": "Chromosomes reach opposite poles and begin to decondense into chromatin; nuclear envelopes form around the two chromosome sets; and spindle fibres break down."
    },
    {
      "question": "A cell's chromosomes are condensed, and its nuclear envelope has broken down, but the chromosomes have not yet lined up at the equator. Which mitotic stage is shown? How would you distinguish it from metaphase?",
      "answer": "Prophase. In metaphase, the duplicated chromosomes are aligned in single file at the equator; in prophase, they are not yet aligned there."
    },
    {
      "question": "A cell with 46 duplicated chromosomes enters mitosis. How does mitosis ensure that each new nucleus receives 46 chromosomes with the same genetic information?",
      "answer": "During metaphase, each duplicated chromosome attaches to spindle fibres from opposite poles. During anaphase, its sister chromatids separate, sending one copy toward each pole. In telophase, a nuclear envelope forms around each complete set of 46 chromosomes."
    }
  ]
};
export async function ensureMitosisReview(storage) {
  const marker = 'migration:biology30-mitosis-2026-11-02';
  if (await storage.get(marker)) return;
  await storage.transaction(async txn => {
    if (await txn.get(marker)) return;
    const bank = await txn.get('bank');
    const course = bank?.courses.find(c => c.id === 'biology30');
    if (!course) return;
    if (!course.sets.some(s => s.date === mitosisReview.date)) {
      course.sets.push(structuredClone(mitosisReview));
      await txn.put('bank', bank);
      // Keep the existing release convention: new review sets begin locked.
      await txn.put('lock:biology30:' + mitosisReview.date, true);
    }
    await txn.put(marker, true);
  });
}
