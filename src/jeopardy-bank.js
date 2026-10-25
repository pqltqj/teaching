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
category('Structure detectives',[
 ['This muscular organ houses the endometrium and is the usual location of prenatal development.','Uterus.','Distinguish the uterus from the oviduct, the usual fertilization site.'],
 ['This narrow lower region of the uterus opens into the vagina and dilates during labour.','Cervix.','The cervix is part of the uterus, not an ovarian structure.'],
 ['These fingerlike projections help sweep an ovulated oocyte toward the opening of an oviduct.','Fimbriae.','Ciliary movement and fluid currents help direct the oocyte into the tube.'],
 ['A gland releases lubricating mucus into the male urethra before ejaculation. Name the gland and one useful effect of its secretion.','Bulbourethral (Cowper\'s) glands; lubrication or helping clear/neutralize residual urine in the urethra.','Accept either useful effect; do not require the fluid to contain no sperm.'],
 ['A sample contains coiled tubules with cells at many stages of sperm development and separate cells between the tubules. Identify the organ and the testosterone-producing cells.','Testis; interstitial (Leydig) cells between seminiferous tubules.','Two linked identifications are needed for full credit.']
]),
category('Hormone headquarters',[
 ['Name the gland that releases both FSH and LH into the blood.','Anterior pituitary.','The hypothalamus releases GnRH, which stimulates this gland.'],
 ['Name the gonadal hormone most directly responsible for development of typical male secondary sexual characteristics at puberty.','Testosterone.','Examples include a deeper voice and increased facial hair.'],
 ['Name the hormone released by Sertoli cells that helps reduce pituitary FSH secretion as sperm production increases.','Inhibin.','This is a negative-feedback signal that helps regulate spermatogenesis.'],
 ['GnRH secretion is greatly reduced. Predict the direction of change in both pituitary gonadotropins and testicular testosterone, and explain the link.','FSH and LH decrease; testosterone decreases because reduced LH means less Leydig-cell stimulation.','Require the causal link, not just three downward arrows.'],
 ['A person takes an external testosterone supply. Explain why blood testosterone can be high while sperm production falls.','External testosterone suppresses GnRH and gonadotropins by negative feedback; reduced FSH and intratesticular testosterone support can impair spermatogenesis.','High circulating testosterone does not guarantee the high local testicular concentrations needed for normal sperm production.']
]),
category('Cycle case files',[
 ['What event is counted as day 1 of a menstrual cycle?','The first day of menstrual bleeding.','Cycle lengths vary; day 1 is a reference point, not ovulation.'],
 ['What does an ovarian follicle normally become after ovulation?','Corpus luteum.','The ruptured follicle reorganizes into this temporary endocrine structure.'],
 ['A graph shows rising estrogen and a growing follicle, before the LH surge. Name the ovarian phase and one expected uterine change.','Follicular phase; the endometrium rebuilds or thickens.','Require a phase and a linked uterine change.'],
 ['A cycle has no LH surge and no ovulation. Predict whether a normal corpus luteum will form and whether a normal luteal progesterone rise will occur.','No normal corpus luteum forms, so the normal luteal progesterone rise is absent.','Do not claim that all progesterone in the body becomes zero.'],
 ['An embryo implants, but its early hCG signal is absent. Trace the likely effects on the corpus luteum, progesterone and uterine lining.','The corpus luteum regresses; progesterone falls; endometrial support is lost and pregnancy is jeopardized.','The reasoning follows the early-pregnancy rescue signal through to its target tissue.']
]),
category('From one cell',[
 ['What is the single cell formed when a sperm and secondary oocyte successfully unite?','Zygote.','A zygote begins development before cleavage creates multiple cells.'],
 ['What type of cell division increases the number of cells during cleavage?','Mitosis.','Meiosis produces gametes; cleavage is mitotic.'],
 ['One primary spermatocyte completes meiosis. How many haploid spermatids result, and how many chromosomes does each normally contain in humans?','Four spermatids, each with 23 chromosomes.','Both the number of cells and chromosome number are required.'],
 ['Oogenesis makes one large functional gamete and small polar bodies. Explain the advantage of unequal cytoplasmic division.','It concentrates cytoplasm, organelles and resources in the functional egg to support early development.','The purpose is resource allocation, not increasing chromosome number.'],
 ['Identical twins arise when one early embryo splits; fraternal twins arise from two fertilizations. Compare the number of zygotes involved and the expected genetic similarity.','Identical: one zygote and nearly identical inherited DNA. Fraternal: two zygotes and genetic similarity comparable to ordinary siblings.','Avoid saying that identical twins are identical in every trait or later-acquired mutation.']
]),
category('Pregnancy and beyond',[
 ['Name the hormone that stimulates milk synthesis in mammary glands.','Prolactin.','Oxytocin primarily triggers milk ejection rather than milk synthesis.'],
 ['Which extraembryonic membrane contributes the fetal component of the placenta?','Chorion (chorionic villi).','The maternal component comes from the endometrium.'],
 ['A fetal heart and a fetal spinal cord are developing. Match each to its primary germ layer.','Heart: mesoderm. Spinal cord: ectoderm.','Both matches are required.'],
 ['Why can an exposure that disrupts organ formation have a larger structural effect during early embryonic development than after those organs have formed?','During organogenesis, rapidly differentiating cells and forming tissues are especially vulnerable to disrupted developmental pathways.','Timing and dose matter; later exposures can still impair growth or function.'],
 ['During breastfeeding, a baby suckles more strongly. Trace the signals that increase milk ejection, naming the brain region, releasing gland and target cells.','Suckling sends nerve signals to the hypothalamus; the posterior pituitary releases oxytocin; myoepithelial cells around mammary alveoli contract and eject milk.','Oxytocin is synthesized in the hypothalamus and released from the posterior pituitary.']
]),
category('Reproduction problem lab',[
 ['What term describes a biological, chemical or physical agent capable of disrupting prenatal development?','Teratogen.','This names the agent, not the resulting developmental condition.'],
 ['Two oviducts are blocked but the ovaries and uterus function normally. Which technology can bypass fertilization in the tubes and transfer an embryo to the uterus?','In vitro fertilization (IVF) with embryo transfer.','A transfer does not guarantee implantation.'],
 ['A patient produces normal sperm in the testes, but none reach the semen. Give one plausible anatomical explanation and name the kind of fertility problem.','A blockage in a sperm-carrying duct, such as the vas deferens or epididymis; obstructive azoospermia.','Contrast impaired transport with impaired sperm production.'],
 ['Compare artificial insemination with IVF: where is sperm placed, and where does fertilization occur in each?','Insemination places sperm in the reproductive tract, commonly the uterus; fertilization occurs inside the body, usually in an oviduct. IVF combines sperm and egg outside the body, followed by embryo transfer.','Require the location distinction rather than just expanding the abbreviations.'],
 ['A clinic proposes ICSI when sperm cannot penetrate an egg. Explain what step ICSI bypasses and identify one later biological event it still cannot guarantee.','ICSI injects a sperm into the oocyte, bypassing penetration/fusion barriers. It cannot guarantee normal embryo development, implantation or a successful pregnancy.','Accept any one valid later event. Keep discussion focused on mechanisms rather than clinical advice.']
])
];
export const finalChallenge={category:'Final case: two signals',prompt:'A developing follicle secretes estrogen normally, but its LH receptors do not respond. Predict the effects on ovulation, corpus luteum formation and the usual progesterone pattern. Explain why rising estrogen alone cannot complete the cycle.',answer:'The LH surge cannot trigger a normal response in the follicle. Ovulation and normal corpus luteum formation fail; the usual luteal progesterone rise is absent. Estrogen promotes endometrial proliferation and participates in feedback, but it cannot replace LH action at its receptor.',note:'Full credit: all three predictions and the distinction between estrogen action and LH receptor signaling. Accept an equivalent causal explanation.'};
export const allClues=jeopardyCategories.flatMap(c=>c.clues);
