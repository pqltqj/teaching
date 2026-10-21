'use strict';
const steps = [
 {
  "chapter": "The big picture",
  "level": 0,
  "scene": "plant",
  "title": "What does a plant make using light?",
  "answer": "It makes <strong>sugars</strong>, storing energy from light as chemical energy.",
  "label": "Plant",
  "id": "old-1"
 },
 {
  "chapter": "The big picture",
  "level": 0,
  "scene": "organisms",
  "title": "Do only plants photosynthesize?",
  "answer": "No. Plants, Euglena and some bacteria are <strong>autotrophs</strong> that use light energy to make organic food from CO₂.",
  "label": "Other organisms",
  "id": "old-2"
 },
 {
  "chapter": "Zoom into a leaf",
  "level": 1,
  "scene": "leaf",
  "title": "Where does most photosynthesis happen in a typical leafy plant?",
  "answer": "In <strong>photosynthetic cells inside the leaves</strong>. Other green parts, such as young stems, can photosynthesize too.",
  "label": "Leaf",
  "id": "old-3"
 },
 {
  "chapter": "Inside the leaf",
  "level": 1,
  "scene": "leafmicro",
  "title": "Which leaf cells contain many chloroplasts?",
  "answer": "<strong>Mesophyll cells</strong> inside the leaf contain many chloroplasts.",
  "label": "Leaf tissue under a microscope",
  "id": "old-4"
 },
 {
  "chapter": "Inside a cell",
  "level": 2,
  "scene": "plantcell",
  "title": "What is a chloroplast?",
  "answer": "An <strong>organelle that carries out photosynthesis</strong>. It contains chlorophyll, which absorbs light.",
  "label": "A plant cell",
  "id": "old-5"
 },
 {
  "chapter": "Zoom into a cell",
  "level": 2,
  "scene": "cells",
  "title": "How can chloroplasts move around inside a living cell?",
  "answer": "<strong>Cytoplasmic streaming</strong> is movement of cytoplasm within a living cell. It can carry chloroplasts around inside that same cell.",
  "label": "Cytoplasmic streaming",
  "id": "old-6"
 },
 {
  "chapter": "Inside the chloroplast",
  "level": 3,
  "scene": "chloroplast",
  "focus": "whole",
  "title": "What is inside a chloroplast?",
  "answer": "<strong>Thylakoids</strong> are membrane sacs. <strong>Stroma</strong> is the fluid around them; the <strong>lumen</strong> is the space inside each sac.",
  "label": "Chloroplast",
  "reference": "chloroplast",
  "id": "old-7"
 },
 {
  "chapter": "Inside the chloroplast",
  "level": 3,
  "scene": "chloroplast",
  "focus": "stack",
  "title": "What is a stack of thylakoids called?",
  "answer": "A <strong>granum</strong> is a stack of thylakoids. Each thylakoid is a flattened sac formed by the <strong>thylakoid membrane</strong>.",
  "label": "A stack of thylakoids",
  "reference": "chloroplast",
  "id": "old-8"
 },
 {
  "chapter": "Find the reaction sites",
  "level": 4,
  "scene": "thylakoid",
  "focus": "membrane",
  "title": "Where do the light reactions happen?",
  "answer": "At the <strong>thylakoid membrane</strong>. It holds pigments, electron carriers and ATP synthase.",
  "label": "The light-reaction site",
  "id": "old-10"
 },
 {
  "chapter": "Find the reaction sites",
  "level": 3,
  "scene": "locations",
  "title": "Where does the Calvin cycle happen?",
  "answer": "In the <strong>stroma</strong>. It uses products made by the light reactions.",
  "label": "The Calvin-cycle site",
  "id": "old-11"
 },
 {
  "chapter": "Before we follow the pathway",
  "level": 4,
  "scene": "particles",
  "title": "Are an electron and H⁺ the same thing?",
  "answer": "No. An <strong>electron</strong> is negatively charged. <strong>H⁺</strong> is a positively charged hydrogen ion.",
  "label": "Two different particles",
  "id": "old-12"
 },
 {
  "id": "visible",
  "scene": "foundation",
  "focus": "visible",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "Which part of sunlight powers most photosynthesis?",
  "answer": "<strong>Visible light</strong>. Photosynthetic pigments mainly use wavelengths of about <strong>400–700 nm</strong>.",
  "label": "Visible light"
 },
 {
  "id": "photon-energy",
  "scene": "foundation",
  "focus": "photon-energy",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "Which carries more energy per photon: blue light or red light?",
  "answer": "<strong>Blue light</strong>. A shorter wavelength means more energy per photon.",
  "label": "Wavelength and photon energy"
 },
 {
  "id": "pigment",
  "scene": "foundation",
  "focus": "pigment",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "What does a photosynthetic pigment do?",
  "answer": "It <strong>absorbs certain wavelengths of light</strong>. Other wavelengths may be reflected or transmitted.",
  "label": "Photosynthetic pigments"
 },
 {
  "id": "chlorophyll-types",
  "scene": "foundation",
  "focus": "chlorophyll-types",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "What are chlorophyll a and chlorophyll b?",
  "answer": "<strong>Chlorophyll a</strong> is a blue-green primary pigment. <strong>Chlorophyll b</strong> is a yellow-green accessory pigment that passes energy toward chlorophyll a.",
  "label": "Chlorophyll a and b"
 },
 {
  "id": "absorption",
  "scene": "foundation",
  "focus": "absorption",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "Which wavelengths do chlorophyll a and b absorb most strongly?",
  "answer": "Mostly <strong>blue-violet (~400–500 nm)</strong> and <strong>red (~630–700 nm)</strong> light. Their absorption peaks differ.",
  "label": "Absorption spectra"
 },
 {
  "id": "carotenoids",
  "scene": "foundation",
  "focus": "carotenoids",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "What are carotenoids?",
  "answer": "A family of <strong>yellow, orange and red pigments</strong>. In leaves, some act as accessory light-absorbing pigments.",
  "label": "Carotenoid examples"
 },
 {
  "id": "photoprotection",
  "scene": "foundation",
  "focus": "photoprotection",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "How do carotenoids protect photosystems from too much light?",
  "answer": "They help release <strong>excess excitation energy as heat</strong> and prevent oxidative damage. This is <strong>photoprotection</strong>.",
  "label": "Photoprotection"
 },
 {
  "id": "autumn",
  "scene": "foundation",
  "focus": "autumn",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "Why do many leaves turn yellow or orange in autumn?",
  "answer": "Chlorophyll breaks down, revealing <strong>carotenoids already present</strong>. Reds and purples often come from <strong>anthocyanins</strong>.",
  "label": "Autumn leaf colours"
 },
 {
  "chapter": "Inside a photosystem",
  "level": 4,
  "scene": "photosystem",
  "focus": "structure",
  "title": "What is a photosystem?",
  "answer": "A <strong>complex of proteins and pigments</strong> in the thylakoid membrane that captures light energy.",
  "label": "A photosystem",
  "id": "old-13"
 },
 {
  "chapter": "Pass on the energy",
  "level": 4,
  "scene": "photosystem",
  "focus": "energy",
  "title": "Where do the pigments pass the light energy they absorb?",
  "answer": "They pass energy to the <strong>reaction centre</strong>, which contains a <strong>special pair of chlorophyll a molecules</strong>.",
  "label": "Energy reaches the reaction centre",
  "id": "old-14"
 },
 {
  "chapter": "Excite an electron",
  "level": 4,
  "scene": "orbit",
  "title": "How does light excite an electron in chlorophyll?",
  "answer": "Absorbing a <strong>photon</strong> supplies energy. An electron moves from its ground state to a <strong>higher-energy, excited state</strong>.",
  "label": "What excited means",
  "id": "old-15"
 },
 {
  "chapter": "Follow the energy",
  "level": 4,
  "scene": "excitation",
  "title": "What can happen after chlorophyll absorbs light?",
  "answer": "<strong>Isolated chlorophyll</strong> can release heat or light. In an <strong>electron transport chain</strong>, downhill electron transfers release energy that helps build the H⁺ gradient.",
  "label": "Excitation and electron capture",
  "id": "old-16"
 },
 {
  "chapter": "Capture the excited electron",
  "level": 4,
  "scene": "photosystem",
  "focus": "electron",
  "title": "What is special about the reaction centre’s chlorophyll a pair?",
  "answer": "When excited, it can <strong>donate an electron to the primary electron acceptor</strong>, starting electron transfer.",
  "label": "The special chlorophyll a pair",
  "id": "old-17"
 },
 {
  "id": "oil-rig",
  "scene": "foundation",
  "focus": "oil-rig",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "What does OIL RIG help us remember?",
  "answer": "<strong>Oxidation Is Loss</strong> of electrons. <strong>Reduction Is Gain</strong> of electrons.",
  "label": "OIL RIG"
 },
 {
  "chapter": "Capture light",
  "level": 4,
  "scene": "membrane",
  "phase": 0,
  "title": "Which photosystem starts this electron pathway?",
  "answer": "<strong>Photosystem II</strong> starts the pathway. Photosystem I acts later.",
  "label": "Start at photosystem II",
  "id": "old-18"
 },
 {
  "chapter": "1 · Energize electrons",
  "level": 4,
  "scene": "membrane",
  "phase": 1,
  "title": "What does light do in photosystem II?",
  "answer": "It raises electrons to a <strong>higher energy level</strong>. Losing these electrons is <strong>oxidation</strong>.",
  "label": "Photosystem II",
  "id": "old-19"
 },
 {
  "chapter": "2 · Replace the electrons",
  "level": 4,
  "scene": "membrane",
  "phase": 2,
  "title": "Where do replacement electrons come from?",
  "answer": "<strong>Photolysis</strong> splits water, supplying replacement electrons to photosystem II and releasing H⁺ and oxygen.",
  "label": "Water splitting",
  "id": "old-20"
 },
 {
  "chapter": "3 · Pass electrons along",
  "level": 4,
  "scene": "membrane",
  "phase": 3,
  "title": "Where do the electrons go next?",
  "answer": "Along an <strong>electron transport chain</strong> toward photosystem I. Their transfer releases energy.",
  "label": "Electron transport",
  "id": "old-21"
 },
 {
  "chapter": "4 · Build a gradient",
  "level": 4,
  "scene": "membrane",
  "phase": 4,
  "title": "What is that released energy used for?",
  "answer": "To help move <strong>H⁺ from the stroma into the lumen</strong>, building a gradient.",
  "label": "Move H⁺ inside",
  "id": "old-22"
 },
 {
  "chapter": "5 · Energize electrons again",
  "level": 4,
  "scene": "membrane",
  "phase": 5,
  "title": "What happens at photosystem I?",
  "answer": "Light raises the electrons to a <strong>higher energy level again</strong>.",
  "label": "Photosystem I",
  "id": "old-23"
 },
 {
  "chapter": "6 · Make NADPH",
  "level": 4,
  "scene": "membrane",
  "phase": 6,
  "title": "What accepts the electrons at the end?",
  "answer": "<strong>NADP⁺</strong> accepts electrons and H⁺ to form <strong>NADPH</strong>. Gaining electrons is reduction.",
  "label": "NADP⁺ to NADPH",
  "id": "old-24"
 },
 {
  "chapter": "Follow the hydrogen ions",
  "level": 4,
  "scene": "membrane",
  "phase": 7,
  "title": "Where is the H⁺ concentration higher?",
  "answer": "In the <strong>lumen</strong>. Water splitting and electron transport both add H⁺ there.",
  "label": "The H⁺ gradient",
  "id": "old-25"
 },
 {
  "chapter": "7 · Let H⁺ flow back",
  "level": 4,
  "scene": "membrane",
  "phase": 8,
  "title": "How does H⁺ return to the stroma?",
  "answer": "It flows down its gradient through <strong>ATP synthase</strong>, from the lumen to the stroma.",
  "label": "ATP synthase",
  "id": "old-26"
 },
 {
  "chapter": "8 · Make ATP",
  "level": 4,
  "scene": "membrane",
  "phase": 9,
  "title": "What does this H⁺ flow power?",
  "answer": "<strong>ATP production</strong> from ADP and phosphate. Using the H⁺ gradient this way is <strong>chemiosmosis</strong>.",
  "label": "Chemiosmosis",
  "id": "old-27"
 },
 {
  "id": "atp-structure",
  "scene": "foundation",
  "focus": "atp-structure",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "What is ATP, and what is it made of?",
  "answer": "<strong>ATP</strong> is a cell’s immediate energy carrier: <strong>adenine + ribose sugar + three phosphate groups</strong>.",
  "label": "ATP structure"
 },
 {
  "id": "atp-cycle",
  "scene": "foundation",
  "focus": "atp-cycle",
  "level": 4,
  "chapter": "Light, pigments and energy",
  "title": "How does ATP supply energy for cellular work?",
  "answer": "ATP reacts with water to form <strong>ADP + phosphate</strong>, releasing usable energy. Energy input is needed to rebuild ATP.",
  "label": "ATP and ADP"
 },
 {
  "chapter": "Connect the two stages",
  "level": 3,
  "scene": "locations",
  "focus": "products",
  "title": "What do the light reactions supply to the Calvin cycle?",
  "answer": "<strong>ATP</strong> supplies energy. <strong>NADPH</strong> supplies electrons to help reduce carbon from CO₂.",
  "label": "ATP and NADPH",
  "id": "old-28"
 },
 {
  "chapter": "Store energy in sugars",
  "level": 3,
  "scene": "locations",
  "focus": "sugar",
  "title": "What does the Calvin cycle help the plant make?",
  "answer": "<strong>Sugars from CO₂</strong>. Its product, G3P, is used to make glucose and other carbohydrates.",
  "label": "Carbon fixation",
  "id": "old-29"
 }
];
