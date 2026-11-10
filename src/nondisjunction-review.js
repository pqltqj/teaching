// November 10 Biology 30 review: nondisjunction.
export const nondisjunctionReview = {
  date: '2026-11-10',
  title: 'Nondisjunction',
  questions: [
    {
      question: 'What is nondisjunction?',
      answer: 'The failure of homologous chromosomes or sister chromatids to separate properly during meiosis.'
    },
    {
      question: 'What fails to separate in meiosis I versus meiosis II nondisjunction?',
      answer: 'Meiosis I: homologous chromosomes. Meiosis II: sister chromatids.'
    },
    {
      question: 'If nondisjunction occurs in meiosis I, how many of the four gametes are abnormal?',
      answer: 'All four: two have an extra chromosome (n + 1), and two are missing one (n - 1).'
    },
    {
      question: 'How many normal gametes form if nondisjunction occurs during meiosis II?',
      answer: 'Two are normal; one has an extra chromosome (n + 1), and one is missing one (n - 1).'
    },
    {
      question: 'What are monosomy and trisomy? Give one example of each from the slides.',
      answer: 'Monosomy is one copy of a chromosome (e.g., Turner syndrome, monosomy X); trisomy is three copies (e.g., Down syndrome, trisomy 21).'
    },
    {
      question: 'What does the Down syndrome graph show about increasing maternal age?',
      answer: 'The incidence of Down syndrome increases with maternal age, especially at older maternal ages.'
    }
  ]
};

export async function ensureNondisjunctionReview(storage) {
  const marker = 'migration:biology30-nondisjunction-2026-11-10-v1';
  if (await storage.get(marker)) return;
  await storage.transaction(async txn => {
    if (await txn.get(marker)) return;
    const bank = await txn.get('bank');
    const course = bank?.courses.find(c => c.id === 'biology30');
    if (!course) return;
    const index = course.sets.findIndex(s => s.date === nondisjunctionReview.date);
    if (index >= 0) course.sets[index] = structuredClone(nondisjunctionReview);
    else {
      course.sets.push(structuredClone(nondisjunctionReview));
      await txn.put('lock:biology30:' + nondisjunctionReview.date, true);
    }
    await txn.put('bank', bank);
    await txn.put(marker, true);
  });
}
