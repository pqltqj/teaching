// Server-side only. Do not copy answers into public assets.
const categoryNames = {
 'Structure detectives':'Reproductive Anatomy',
 'Hormone headquarters':'Reproductive Hormones',
 'Cycle case files':'Menstrual Cycle',
 'From one cell':'Gametes and Early Development',
 'Pregnancy and beyond':'Pregnancy and Birth',
 'Reproduction problem lab':'Fertility and Reproductive Technologies'
};
// Keep clue IDs stable so games already in progress survive label changes.
const category = (name, items) => ({name:categoryNames[name]||name, clues:items.map(([prompt,answer,note],i)=>({id:name.toLowerCase().replace(/[^a-z]+/g,'-')+'-'+i,value:(i+1)*100,prompt,answer,note}))});
export const jeopardyCategories = [
category("Structure detectives",[
 [
  "This muscular organ houses the endometrium and is the usual location of prenatal development.",
  "Uterus.",
  "The endometrium is the inner lining of the uterus."
 ],
 [
  "This narrow lower region of the uterus opens into the vagina and dilates during labour.",
  "Cervix.",
  "The cervix connects the uterus to the vagina."
 ],
 [
  "These fingerlike projections help sweep an ovulated oocyte toward the opening of an oviduct.",
  "Fimbriae.",
  "Fimbriae help guide the oocyte into the oviduct."
 ],
 [
  "Which glands release lubricating mucus into the male urethra before ejaculation?",
  "Bulbourethral (Cowper's) glands.",
  "Their secretion lubricates the urethra."
 ],
 [
  "Cells between the seminiferous tubules produce testosterone. Name these cells.",
  "Interstitial (Leydig) cells.",
  "Leydig cells are found in the testes."
 ]
]),
category("Hormone headquarters",[
 [
  "Name the gland that releases both FSH and LH into the blood.",
  "Anterior pituitary.",
  "GnRH from the hypothalamus stimulates the anterior pituitary."
 ],
 [
  "Name the gonadal hormone most directly responsible for development of typical male secondary sexual characteristics at puberty.",
  "Testosterone.",
  "Examples include a deeper voice and increased facial hair."
 ],
 [
  "Name the hormone released by Sertoli cells that helps reduce pituitary FSH secretion as sperm production increases.",
  "Inhibin.",
  "Inhibin provides negative feedback on FSH secretion."
 ],
 [
  "GnRH stimulates the pituitary. Which pituitary hormone then directly stimulates Leydig cells?",
  "LH.",
  "LH stimulates testosterone production."
 ],
 [
  "External testosterone reduces GnRH, FSH and LH secretion. What type of feedback is this?",
  "Negative feedback.",
  "A rising hormone level reduces further stimulation."
 ]
]),
category("Cycle case files",[
 [
  "What event is counted as day 1 of a menstrual cycle?",
  "The first day of menstrual bleeding.",
  "Day 1 is the first day of bleeding."
 ],
 [
  "What does an ovarian follicle normally become after ovulation?",
  "Corpus luteum.",
  "The corpus luteum secretes progesterone and estrogen."
 ],
 [
  "Estrogen is rising and a follicle is growing, but the LH surge has not occurred. Which ovarian phase is this?",
  "Follicular phase.",
  "Estrogen helps rebuild the endometrium."
 ],
 [
  "A mature follicle is present, but no LH surge occurs. Which event is most likely to fail?",
  "Ovulation.",
  "The LH surge normally triggers release of the oocyte."
 ],
 [
  "If early hCG is absent and the corpus luteum regresses, which hormone that maintains the uterine lining will fall?",
  "Progesterone.",
  "Early hCG keeps the corpus luteum active."
 ]
]),
category("From one cell",[
 [
  "What is the single cell formed when a sperm and secondary oocyte successfully unite?",
  "Zygote.",
  "The zygote is the first cell of the new organism."
 ],
 [
  "What type of cell division increases the number of cells during cleavage?",
  "Mitosis.",
  "Cleavage increases cell number through mitosis."
 ],
 [
  "One primary spermatocyte completes meiosis. How many spermatids result, and how many chromosomes does each have in humans?",
  "Four; 23 chromosomes each.",
  "The resulting cells are haploid."
 ],
 [
  "During oogenesis, what are the small cells that receive very little cytoplasm called?",
  "Polar bodies.",
  "Most cytoplasm remains in the functional egg."
 ],
 [
  "One zygote divides, and the early embryo later splits into two. What type of twins can result?",
  "Identical (monozygotic) twins.",
  "Fraternal twins begin as two separate zygotes."
 ]
]),
category("Pregnancy and beyond",[
 [
  "Name the hormone that stimulates milk synthesis in mammary glands.",
  "Prolactin.",
  "Prolactin stimulates milk production; oxytocin triggers milk ejection."
 ],
 [
  "Which extraembryonic membrane contributes the fetal component of the placenta?",
  "Chorion (chorionic villi).",
  "The maternal placental component comes from the endometrium."
 ],
 [
  "A fetal heart and a fetal spinal cord are developing. Match each to its primary germ layer.",
  "Heart: mesoderm. Spinal cord: ectoderm.",
  "Mesoderm forms the heart; ectoderm forms the spinal cord."
 ],
 [
  "What is the name for the embryonic process of organ formation, when teratogens can cause major structural changes?",
  "Organogenesis.",
  "Developing organs are especially sensitive to disruption."
 ],
 [
  "Suckling triggers oxytocin release. Which part of the pituitary releases it?",
  "Posterior pituitary.",
  "Oxytocin causes milk ejection."
 ]
]),
category("Reproduction problem lab",[
 [
  "What term describes a biological, chemical or physical agent capable of disrupting prenatal development?",
  "Teratogen.",
  "A teratogen can disrupt development before birth."
 ],
 [
  "Two oviducts are blocked but the ovaries and uterus function normally. Which technology can bypass fertilization in the tubes and transfer an embryo to the uterus?",
  "In vitro fertilization (IVF) with embryo transfer.",
  "IVF bypasses the tubes but does not guarantee implantation."
 ],
 [
  "Eggs and sperm are placed together in a Fallopian tube before fertilization. Name this technology.",
  "GIFT (gamete intrafallopian transfer).",
  "At least one Fallopian tube must function."
 ],
 [
  "After artificial insemination, fertilization normally occurs in which structure?",
  "Fallopian tube (oviduct).",
  "Insemination places sperm in the reproductive tract."
 ],
 [
  "In cytoplasmic transfer, the recipient egg keeps its nucleus. Which type of donor DNA can still enter with the added cytoplasm?",
  "Mitochondrial DNA.",
  "Donor cytoplasm can contain mitochondria with their own DNA."
 ]
])
];
export const finalChallenge={"category":"Final Jeopardy: Developmental Sequence","prompt":"Put these events in order: 1. Implantation; 2. Ovulation; 3. Fertilization. Enter only the three numbers.","answer":"2, 3, 1 - ovulation, fertilization, implantation.","note":"Accept the correct order written as numbers or words."};
export const allClues=jeopardyCategories.flatMap(c=>c.clues);
