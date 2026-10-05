// 16 Domains and 160 Hackathon Problem Statements
// 10 Problem statements per domain with specific ID codes:
// Agriculture (A1-A10), Healthcare (H1-H10), Education (E1-E10), Smart City (S1-S10),
// Public Safety (P1-P10), Finance (F1-F10), Retail (R1-R10), Environment (C1-C10),
// Transportation (T1-T10), Employment (J1-J10), Government (G1-G10), Home & Community (HC1-HC10),
// Food & Nutrition (FN1-FN10), Mental Wellness (MW1-MW10), Cybersecurity (CS1-CS10), Smart Automation (SA1-SA10).

const domains = [
  { code: 'AG', name: 'Agriculture', icon: '🌾', description: 'Smart farming, crop yield optimization, disease diagnosis, and supply chain technologies.' },
  { code: 'HC', name: 'Healthcare & Hospitals', icon: '🏥', description: 'Patient care, clinical diagnostics, hospital management, and telemedicine solutions.' },
  { code: 'ED', name: 'Education', icon: '🎓', description: 'EdTech platforms, personalized learning, interactive pedagogy, and accessibility tools.' },
  { code: 'SC', name: 'Smart City', icon: '🏙️', description: 'Urban infrastructure, IoT public utilities, waste management, and intelligent civic systems.' },
  { code: 'PS', name: 'Public Safety & Emergency', icon: '🚨', description: 'Disaster response, emergency dispatch, rapid rescue coordination, and hazard prevention.' },
  { code: 'FN', name: 'Finance & FinTech', icon: '💳', description: 'Decentralized finance, automated fraud detection, algorithmic wealth tools, and micro-lending.' },
  { code: 'RC', name: 'Retail & E-Commerce', icon: '🛍️', description: 'Intelligent inventory, hyper-personalized commerce, AR try-on, and checkout automation.' },
  { code: 'EC', name: 'Environment & Climate', icon: '🌱', description: 'Carbon footprint auditing, renewable energy management, wildlife conservation, and climate tech.' },
  { code: 'TM', name: 'Transportation & Mobility', icon: '🚗', description: 'Electric mobility, fleet optimization, smart routing, and multimodal transit systems.' },
  { code: 'EP', name: 'Employment & Career', icon: '💼', description: 'Skill-gap matchmaking, bias-free recruitment, talent analytics, and gig-economy platforms.' },
  { code: 'GV', name: 'Government & Public Services', icon: '🏛️', description: 'Civic participation, transparent welfare delivery, digital governance, and grievance redressal.' },
  { code: 'HM', name: 'Home & Community', icon: '🏡', description: 'Neighborhood safety, smart home energy orchestration, residential associations, and mutual aid.' },
  { code: 'FD', name: 'Food & Nutrition', icon: '🥗', description: 'Food waste elimination, personalized dietary wellness, food origin tracing, and culinary tech.' },
  { code: 'MW', name: 'Mental Wellness & Social Wellbeing', icon: '🧠', description: 'Holistic mental health tools, stress mitigation, peer support networks, and community wellness.' },
  { code: 'CS', name: 'Cybersecurity & Digital Safety', icon: '🛡️', description: 'Zero-trust architecture, automated threat hunting, phishing defense, and privacy-preserving tools.' },
  { code: 'SA', name: 'Smart Automation', icon: '🤖', description: 'Robotic process automation, autonomous inspection, industrial IoT, and intelligent agents.' }
];

const problems = [
  // 1. Agriculture (A1 - A10)
  {
    code: 'A1',
    domainCode: 'AG',
    title: 'AI-Based Crop Disease Detection & Remedy Recommender',
    description: 'Smallholder farmers lose up to 40% of their crop yields to undetected fungal and bacterial infections. Build a mobile-first computer vision system that instantly identifies crop leaf diseases from photos and provides localized, eco-friendly treatment plans in regional languages.',
    detailedRequirements: '1. Image classification model for 20+ common agricultural leaf diseases with offline/low-bandwidth caching.\n2. Severity grading and actionable organic/chemical remedy suggestions.\n3. Multilingual voice synthesis for illiterate and rural farmers.',
    expectedOutcome: 'A lightweight web/mobile app allowing live camera capture, disease diagnosis in <2 seconds with 90%+ precision, remedy instructions, and weather-adjusted preventative spray timing.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Computer Vision', 'Deep Learning', 'AgriTech', 'Offline-First'])
  },
  {
    code: 'A2',
    domainCode: 'AG',
    title: 'IoT Micro-Irrigation & Soil Nutrient Telemetry',
    description: 'Freshwater depletion and over-fertilization cause severe ecological degradation. Develop an intelligent dashboard that ingests real-time soil moisture, NPK sensors, and weather forecast streams to trigger precision drip valves automatically.',
    detailedRequirements: '1. MQTT / WebSocket sensor stream telemetry simulator.\n2. Soil moisture threshold forecasting with evaporation modeling.\n3. Automated valve scheduling and chemical runoff risk alert engine.',
    expectedOutcome: 'Interactive control portal showing real-time field heatmaps, simulated IoT sensor nodes, valve actuation status, and estimated water savings metrics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['IoT', 'Hardware Simulation', 'Water Conservation', 'Dashboards'])
  },
  {
    code: 'A3',
    domainCode: 'AG',
    title: 'Farm-to-Market Decentralized Price Discovery Platform',
    description: 'Intermediaries pocket the majority of profit margins while farmers struggle with volatile spot prices. Create a transparent peer-to-peer marketplace connecting farmer producer organizations directly with bulk institutional buyers.',
    detailedRequirements: '1. Real-time mandi/market price aggregator and price trend predictor.\n2. Buyer-seller direct bidding engine with automated escrow protection.\n3. Logistics bundling module to aggregate shipments from adjacent farms.',
    expectedOutcome: 'Full-stack marketplace with dynamic bidding, farmer verification, automated price alerts, and freight cost estimator.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Marketplace', 'FinTech', 'Supply Chain', 'Fair Trade'])
  },
  {
    code: 'A4',
    domainCode: 'AG',
    title: 'Drone Multispectral Imagery Yield Estimator',
    description: 'Precision yield prediction is essential for agricultural loan underwriting and storage planning. Build an analytical tool that processes multispectral aerial drone tiles to compute NDVI and forecast crop tonnage per acre.',
    detailedRequirements: '1. Processing pipeline for GeoTIFF / RGB drone imagery to calculate Vegetation Indices.\n2. Historical yield regression analysis based on vegetation vigor.\n3. Exportable crop insurance assessment reports.',
    expectedOutcome: 'Web dashboard with interactive GIS map layers, NDVI color gradient visualizer, zone-by-zone yield calculations, and printable PDF insurance audit certificates.',
    difficulty: 'Hard',
    tags: JSON.stringify(['GIS', 'Remote Sensing', 'Data Science', 'InsurTech'])
  },
  {
    code: 'A5',
    domainCode: 'AG',
    title: 'Predictive Pest Infestation Early Warning System',
    description: 'Pest swarms devastate harvest cycles before farmers can react. Design an epidemiological forecasting model that maps temperature, relative humidity, wind vectors, and local outbreak reports to issue localized 7-day pest risk alerts.',
    detailedRequirements: '1. Weather API integration with biophysical pest development models.\n2. Geofenced SMS / WhatsApp notification dispatcher.\n3. Crowd-sourced farmer reporting tool with geolocation tagging.',
    expectedOutcome: 'Interactive risk map highlighting infection vectors, automated advisory generation, and farmer community sighting verification pipeline.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Forecasting', 'Geolocation', 'Weather Data', 'Public Good'])
  },
  {
    code: 'A6',
    domainCode: 'AG',
    title: 'Post-Harvest Grain Warehouse Monitoring & Spoilage Prevention',
    description: 'Inefficient storage causes millions of tons of grains to rot in storage silos due to humidity spikes and mycotoxin contamination. Create an ambient silo monitoring suite that alerts warehouse managers to microbial hotspots.',
    detailedRequirements: '1. Silo temperature and humidity sensor gradient monitoring.\n2. Spoilage risk index based on dew point and CO2 buildup.\n3. Automated ventilation actuator logic and emergency aeration alerts.',
    expectedOutcome: '3D silo visualization showing internal sensor probe temperatures, spoilage risk level indicators, and automated fan control trigger logs.',
    difficulty: 'Medium',
    tags: JSON.stringify(['IoT', 'Data Visualization', 'Warehouse Logistics', 'Food Security'])
  },
  {
    code: 'A7',
    domainCode: 'AG',
    title: 'Livestock Health & Estrous Cycle Tracker',
    description: 'Dairy farmers face huge economic losses when cow health issues or fertility windows are missed. Develop a behavioral analysis system tracking livestock pedometer activity, rumination hours, and feeding patterns.',
    detailedRequirements: '1. Ingestion of biometric collar data streams (accelerometer, rumination).\n2. Anomaly detection for bovine mastitis and optimal insemination window.\n3. Veterinary schedule management and milk yield correlation.',
    expectedOutcome: 'Cattle herd management dashboard showing individual animal health status, reproduction calendar, and automated alerts for veterinary intervention.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Biometrics', 'Animal Husbandry', 'Time Series', 'DairyTech'])
  },
  {
    code: 'A8',
    domainCode: 'AG',
    title: 'Algorithmic Crop Rotation & Soil Carbon Sequestration Planner',
    description: 'Monoculture depletes soil biome and accelerates desertification. Build an algorithmic planner that generates regenerative multi-season crop rotation schedules maximizing soil nitrogen while maximizing farm revenue.',
    detailedRequirements: '1. Constraint optimization solver balancing crop profitability, nitrogen fixation, and seasonal water requirements.\n2. Soil carbon sequestration credit calculator.\n3. Downloadable multi-year agronomic calendar.',
    expectedOutcome: 'Intuitive farmer planning wizard calculating 3-year crop sequences, projected income vs input costs, and verified carbon credit generation estimates.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Optimization', 'Carbon Credits', 'Regenerative Agriculture', 'Sustainability'])
  },
  {
    code: 'A9',
    domainCode: 'AG',
    title: 'Automated Solar Cold-Storage Sharing & Booking Network',
    description: 'Perishable horticulture crops like tomatoes and strawberries spoil rapidly without cold chains. Build an Uber-like marketplace for rural solar-powered cold room operators and neighboring farmers.',
    detailedRequirements: '1. Real-time crate capacity booking with micro-hourly pricing.\n2. Temperature compliance logging via QR-code tagged produce crates.\n3. Automatic payment release upon produce pickup or sale.',
    expectedOutcome: 'Mobile web app for storage operators to list crates and farmers to reserve chilled storage with digital receipts and temperature audit trails.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Sharing Economy', 'Cold Chain', 'Micro-Logistics', 'Rural Tech'])
  },
  {
    code: 'A10',
    domainCode: 'AG',
    title: 'Agricultural Equipment Peer-to-Peer Rental Network',
    description: 'Heavy machinery like combine harvesters and laser levelers are unaffordable for smallholders. Build a fractional machinery sharing and booking platform with GPS tracking and pay-per-hour billing.',
    detailedRequirements: '1. Tractor & implement registry with availability scheduler.\n2. Telematics billing based on operating hours and diesel consumption.\n3. Operator verification and damage insurance escrow hold.',
    expectedOutcome: 'Equipment reservation portal with live map showing nearby available machinery, booking calendar, escrow payments, and ratings.',
    difficulty: 'Easy',
    tags: JSON.stringify(['P2P', 'Resource Sharing', 'Mechanization', 'Mobile First'])
  },

  // 2. Healthcare & Hospitals (H1 - H10)
  {
    code: 'H1',
    domainCode: 'HC',
    title: 'Real-Time Emergency Department Triage & Bed Orchestrator',
    description: 'Hospital overcrowding causes lethal delays in trauma care. Build a predictive patient triage system that scores incoming emergencies using the Emergency Severity Index (ESI) and dynamically allocates ICU/ward beds.',
    detailedRequirements: '1. ESI triage scoring calculator incorporating vital signs, consciousness level, and pain index.\n2. Live ICU/HDU bed occupancy grid with automatic priority waitlist rerouting.\n3. Ambulance pre-notification integration with ETA countdown.',
    expectedOutcome: 'Real-time hospital operations command center with live triage queue, color-coded urgency badges, and automated bed assignment recommendations.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Hospital Ops', 'Triage', 'Emergency Medicine', 'Real-Time'])
  },
  {
    code: 'H2',
    domainCode: 'HC',
    title: 'AI Medical Imaging Pulmonary Nodule & Pneumonia Screener',
    description: 'Radiology departments in rural areas suffer from acute specialist shortages. Build a deep-learning radiograph analysis tool that detects pulmonary opacities, cardiomegaly, and pneumothorax on standard chest X-rays.',
    detailedRequirements: '1. DICOM / PNG chest radiograph viewer with Grad-CAM heatmap overlay.\n2. Multi-label thoracic pathology probability scoring.\n3. Structured HL7/FHIR compliant radiologist preliminary report generator.',
    expectedOutcome: 'Web-based diagnostic workspace allowing image upload, instant lesion localization heatmap overlay, confidence metrics, and one-click PDF report export.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Medical Imaging', 'Radiology', 'Computer Vision', 'Deep Learning'])
  },
  {
    code: 'H3',
    domainCode: 'HC',
    title: 'Clinical Drug-Drug Interaction & Adverse Event Engine',
    description: 'Polypharmacy in elderly patients frequently causes fatal drug interactions and contraindicated prescriptions. Create an intelligent clinical pharmacist copilot that flags adverse interactions in real time as doctors enter medications.',
    detailedRequirements: '1. RxNorm / ATC code drug ontology matching.\n2. Multi-drug interaction matrix grading severity (Minor, Moderate, Contraindicated).\n3. Patient kidney/liver function (eGFR) dosage adjustment alert engine.',
    expectedOutcome: 'Physician prescription tool with instant real-time drug collision checks, mechanistic pharmacodynamic explanations, and safer alternative drug recommendations.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Pharmacology', 'Patient Safety', 'Clinical Copilot', 'HealthTech'])
  },
  {
    code: 'H4',
    domainCode: 'HC',
    title: 'Telemedicine Consultation Suite with Real-Time Transcription & EHR Auto-Fill',
    description: 'Physicians spend over 50% of their workday typing notes into EHRs instead of looking at patients. Build a WebRTC telemedicine platform that transcribes doctor-patient conversations and formats them into SOAP clinical notes automatically.',
    detailedRequirements: '1. High-definition WebRTC video/audio consultation room.\n2. Real-time speech-to-text with medical entity extraction (Symptoms, Diagnosis, Plan).\n3. Automatic SOAP note generation with physician review & sign-off.',
    expectedOutcome: 'Complete telemedicine portal with scheduled appointments, live video call, simultaneous transcript sidebar, and generated SOAP record saved to patient chart.',
    difficulty: 'Hard',
    tags: JSON.stringify(['WebRTC', 'NLP', 'Medical Scribe', 'Telehealth'])
  },
  {
    code: 'H5',
    domainCode: 'HC',
    title: 'Smart Inpatient Medication Dispensing & Barcode Verification',
    description: 'Wrong-patient and wrong-dose medication administration errors remain a leading cause of preventable hospital deaths. Develop a closed-loop bedside nurse verification app.',
    detailedRequirements: '1. Barcode/QR scanning for patient wristband and medication blister pack.\n2. Real-time verification against the electronic Medication Administration Record (eMAR).\n3. Five Rights checklist enforcement (Right Patient, Right Drug, Right Dose, Right Route, Right Time).',
    expectedOutcome: 'Nurse tablet interface with barcode scanner simulation, medication schedule timeline, audio error warning on mismatch, and audit compliance logging.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Nursing Informatics', 'eMAR', 'Barcode Verification', 'Safety'])
  },
  {
    code: 'H6',
    domainCode: 'HC',
    title: 'Chronic Disease Remote Patient Monitoring & Early Deterioration Alert',
    description: 'Congestive heart failure and diabetes patients frequently experience preventable readmissions due to unnoticed decompensation. Build a continuous telemetry dashboard ingesting blood pressure, SpO2, and weight data.',
    detailedRequirements: '1. Daily patient biometric symptom questionnaire and Bluetooth device telemetry sync.\n2. National Early Warning Score (NEWS2) trend calculator.\n3. Automatic SMS check-in trigger when physiological parameters deviate from baseline.',
    expectedOutcome: 'Clinician monitoring dashboard with patient risk stratifications (Green, Yellow, Red), physiological trend graphs, and instant escalation protocols.',
    difficulty: 'Medium',
    tags: JSON.stringify(['RPM', 'Chronic Care', 'Predictive Analytics', 'Vital Signs'])
  },
  {
    code: 'H7',
    domainCode: 'HC',
    title: 'Emergency Blood Bank Supply Chain & Donor Geo-Dispatch',
    description: 'Critical surgeries are often delayed due to localized shortages of rare blood types (e.g. O-negative). Build a hyper-local blood inventory exchange network that alerts eligible donors within a 5km radius during critical shortages.',
    detailedRequirements: '1. Real-time hospital blood unit inventory tracker by blood group and component (PRBC, Platelets, FFP).\n2. Geo-fenced push notifications to pre-screened volunteer donors when reserves fall below safety thresholds.\n3. Donor eligibility cooldown tracker and digital appointment scheduling.',
    expectedOutcome: 'Multi-hospital blood stock dashboard, interactive shortage map, and instant donor broadcast dispatch engine with GPS navigation.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Blood Bank', 'Geolocation', 'Emergency Response', 'Logistics'])
  },
  {
    code: 'H8',
    domainCode: 'HC',
    title: 'Pediatric Vaccine Lifecycle & Cold-Chain Expiry Tracker',
    description: 'Vaccine spoilage due to cold-chain breaches and missed immunization schedules endanger children in developing areas. Build a mother-and-child immunization tracker that couples temperature monitoring with automated reminders.',
    detailedRequirements: '1. WHO-standard infant vaccination schedule generator from birth date.\n2. IoT temperature logger integration for vaccine storage vials.\n3. Automated SMS/WhatsApp vaccination reminders in local dialects.',
    expectedOutcome: 'Pediatric clinic management dashboard showing cohort immunization coverage, upcoming child appointments, and thermal breach alerts for vaccine batches.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Immunization', 'Pediatrics', 'Public Health', 'Cold Chain'])
  },
  {
    code: 'H9',
    domainCode: 'HC',
    title: 'Post-Operative Wound Healing Recovery Tracker via Computer Vision',
    description: 'Surgical site infections (SSIs) occur in 2-5% of surgical patients after discharge. Develop a patient smartphone tool that tracks surgical wound incision closure, detects erythema/exudate, and alerts the surgical team.',
    detailedRequirements: '1. Standardized incision photography guide with color reference sticker calibration.\n2. Visual classification of wound edge approximation, redness, and drainage.\n3. Longitudinal image comparison timeline for surgical follow-up.',
    expectedOutcome: 'Patient upload portal with visual healing score, surgical team review inbox, and automated red-flag alerts for fever/drainage complications.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Surgical Care', 'Computer Vision', 'Mobile Health', 'Telehealth'])
  },
  {
    code: 'H10',
    domainCode: 'HC',
    title: 'Decentralized Clinical Trial Patient Matching & Consent Portal',
    description: 'Over 80% of clinical trials are delayed due to failure to recruit and retain diverse participant populations. Build a patient-centric clinical trial finder that parses health records and matches patients with active FDA trials.',
    detailedRequirements: '1. ClinicalTrials.gov API crawler and structured eligibility criteria parser.\n2. Patient health questionnaire matching engine with strict anonymization.\n3. Interactive e-Consent module with multimedia explanations and digital signatures.',
    expectedOutcome: 'Searchable clinical trial discovery portal, match compatibility percentage calculator, and secure electronic informed consent workflow.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Clinical Trials', 'Patient Recruitment', 'eConsent', 'Bioethics'])
  },

  // 3. Education (E1 - E10)
  {
    code: 'E1',
    domainCode: 'ED',
    title: 'AI Adaptive Mastery Learning Engine for STEM',
    description: 'One-size-fits-all classroom pacing leaves struggling students behind and bores advanced learners. Build an adaptive mastery learning platform that models student knowledge state and generates individualized learning pathways in real time.',
    detailedRequirements: '1. Knowledge graph representing concept prerequisites in mathematics or physics.\n2. Bayesian Knowledge Tracing (BKT) or Item Response Theory (IRT) to estimate topic mastery.\n3. Dynamic quiz generation adjusting question difficulty based on prior answers.',
    expectedOutcome: 'Interactive student study portal showing dynamic concept node mastery tree, personalized practice quizzes, and teacher diagnostic analytics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Adaptive Learning', 'Knowledge Tracing', 'EdTech', 'Algorithms'])
  },
  {
    code: 'E2',
    domainCode: 'ED',
    title: 'Accessible Screen-Reader Friendly Collaborative Code Editor',
    description: 'Visually impaired students struggle immensely with modern web IDEs that fail accessibility compliance. Build an accessible collaborative coding environment with audio syntax cues, screen reader optimizations, and haptic audio feedback.',
    detailedRequirements: '1. Full WCAG 2.1 AAA compliant UI with high contrast and keyboard-only navigation.\n2. Auditory syntax highlighting (unique earcons for brackets, loops, syntax errors).\n3. Real-time pair programming collaboration with collaborative cursor announcements.',
    expectedOutcome: 'Fully accessible online code editor supporting Python/JS with audio indentation feedback, accessible error inspection, and live audio collaboration.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Accessibility', 'Screen Reader', 'Web Audio API', 'Collaborative IDE'])
  },
  {
    code: 'E3',
    domainCode: 'ED',
    title: 'Automated Essay Scoring & Constructive Pedagogical Feedback Engine',
    description: 'Teachers spend dozens of hours grading essays, resulting in delayed, surface-level grammar checks rather than structural writing critique. Build an AI writing coach that assesses argumentative structure, thesis strength, and citation rigor.',
    detailedRequirements: '1. NLP evaluation of thesis clarity, paragraph coherence, and claim-evidence reasoning.\n2. Rubric-based scoring (Content, Organization, Grammar, Vocabulary).\n3. Inline contextual feedback suggestions that prompt the student to reflect rather than just auto-correcting.',
    expectedOutcome: 'Student writing workspace with instant rubric breakdown, paragraph-by-paragraph revision recommendations, and teacher grading dashboard.',
    difficulty: 'Medium',
    tags: JSON.stringify(['NLP', 'Essay Grading', 'Pedagogy', 'Writing Coach'])
  },
  {
    code: 'E4',
    domainCode: 'ED',
    title: 'Gamified Peer-to-Peer Concept Teaching & Micro-Tutoring Exchange',
    description: 'Peer instruction is proven to yield 2x learning retention compared to passive lectures. Build a student marketplace where high school and college students teach bite-sized concepts to earn verified academic karma.',
    detailedRequirements: '1. Bite-sized 15-minute whiteboarding and voice session matching.\n2. Student reputation score based on learner comprehension post-quiz.\n3. Tokenized peer tutoring hours verifiable for college extracurricular credits.',
    expectedOutcome: 'Fast matchmaking interface for concept help, interactive collaborative whiteboard canvas, and student merit leaderboard.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Peer Learning', 'Gamification', 'Whiteboard', 'WebRTC'])
  },
  {
    code: 'E5',
    domainCode: 'ED',
    title: 'Virtual Chemistry Laboratory with Realistic Reaction Physics',
    description: 'Underfunded schools cannot afford hazardous chemicals, glassware, and fume hoods. Create an interactive virtual wet lab simulation allowing students to conduct organic chemistry titrations and observe accurate thermal and color changes.',
    detailedRequirements: '1. Chemical equilibrium and reaction kinetics computation engine.\n2. Realistic digital apparatus (burettes, beakers, Bunsen burners, pH meters).\n3. Safety hazard simulation for incorrect reagent mixing (e.g. acid into water).',
    expectedOutcome: 'Interactive 2D/Canvas lab simulator with draggable glassware, real-time chemical reaction calculations, color titration indicator, and lab report auto-logger.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Simulation', 'Physics/Chemistry', 'STEM Education', 'Canvas'])
  },
  {
    code: 'E6',
    domainCode: 'ED',
    title: 'Automated Academic Integrity & Plagiarism Graph Analyzer',
    description: 'Traditional plagiarism checkers only check for exact substring matches, missing paraphrasing and multi-student homework ring collusion. Build a graph-based code and text submission similarity analyzer.',
    detailedRequirements: '1. Abstract Syntax Tree (AST) tokenization and comparison for programming assignments.\n2. Semantic vector embeddings for natural language essay comparison.\n3. Graph cluster visualization showing mutual similarity networks among student batches.',
    expectedOutcome: 'Instructor submission portal with interactive graph visualization of colluding student clusters, side-by-side AST diff viewer, and similarity threshold flags.',
    difficulty: 'Hard',
    tags: JSON.stringify(['AST Analysis', 'Graph Analytics', 'Academic Integrity', 'NLP'])
  },
  {
    code: 'E7',
    domainCode: 'ED',
    title: 'Multilingual Curriculum Translation & Local Cultural Adaptor',
    description: 'High-quality open educational resources (OER) like MIT OpenCourseWare are trapped in English. Build an AI-driven educational translator that translates video/text lessons while adapting idioms and cultural examples to regional contexts.',
    detailedRequirements: '1. STEM terminology preservation during translation.\n2. Auto-generated bilingual subtitles and synthetic localized voice dubbing.\n3. Example localization (e.g., swapping baseball analogies for cricket in South Asia).',
    expectedOutcome: 'Interactive learning player displaying synchronized translated video captions, terminology glossary tooltips, and localized practice examples.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Localization', 'Translation', 'EdTech', 'Multimedia'])
  },
  {
    code: 'E8',
    domainCode: 'ED',
    title: 'Neurodivergent Focus & Study Workflow Assistant',
    description: 'Students with ADHD and executive dysfunction struggle with open-ended assignments and sensory overload. Build a distraction-free study companion that breaks large syllabi into micro-dopamine tasks with Pomodoro audio pacing.',
    detailedRequirements: '1. Task decomposition algorithm turning large assignments into 5-minute actionable steps.\n2. Ambient soundscapes and low-stimulation visual theme customization.\n3. Gentle anti-procrastination check-ins and visual timeline timers.',
    expectedOutcome: 'Focus study app with step-by-step task runner, customizable sound mixer, dopamine reward badges, and progress reflection journal.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Neurodiversity', 'ADHD Support', 'Productivity', 'UX Design'])
  },
  {
    code: 'E9',
    domainCode: 'ED',
    title: 'Decentralized Academic Credential & Skill Badge Ledger',
    description: 'Degree fraud and slow paper transcript verification cost universities and employers millions. Build a verifiable digital credential issuance platform where institutions issue cryptographically signed skill micro-credentials.',
    detailedRequirements: '1. W3C Verifiable Credentials standard compliance with asymmetric key signing.\n2. Student public portfolio showcasing verified skills and credential metadata.\n3. Instant employer verification tool via QR code or public key check.',
    expectedOutcome: 'University issuance dashboard, student credential wallet, and public instant verification portal that validates cryptographic signatures in milliseconds.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Cryptography', 'Digital Identity', 'EdTech', 'Badges'])
  },
  {
    code: 'E10',
    domainCode: 'ED',
    title: 'Interactive Historical Timeline & Primary Source Explorer',
    description: 'History education suffers from dry rote memorization of dates. Build an immersive geospatial-temporal exploration engine that maps historical events with synchronized primary source documents, speeches, and maps.',
    detailedRequirements: '1. Interactive scrubbable historical timeline (e.g. 1900-2000).\n2. Dynamic map boundary shifting based on treaty years.\n3. Synchronized repository of original digitized telegrams, treaty scans, and audio recordings.',
    expectedOutcome: 'Rich chronological exploration interface with animated geopolitical borders, linked primary source exhibits, and interactive comprehension quizzes.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Interactive Timeline', 'GIS', 'Humanities', 'Data Visualization'])
  },

  // 4. Smart City (S1 - S10)
  {
    code: 'S1',
    domainCode: 'SC',
    title: 'Intelligent Traffic Signal Timing Optimization via Computer Vision',
    description: 'Fixed-timer traffic signals cause massive vehicular idling, fuel wastage, and carbon emissions. Build a real-time intersection controller that estimates vehicle queue lengths from CCTV cameras and dynamically adjusts green light duration.',
    detailedRequirements: '1. Vehicle counting and classification (Cars, Buses, Emergency Vehicles, Two-wheelers) from video feeds.\n2. Reinforcement learning or dynamic rule-based green-light duration allocator.\n3. Emergency vehicle priority preemption green corridor.',
    expectedOutcome: 'Traffic simulation dashboard showing 4-way intersection video simulation, live vehicle count metrics, adaptive signal phase transitions, and emergency vehicle preemption.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Computer Vision', 'Traffic Ops', 'Smart Signals', 'Simulation'])
  },
  {
    code: 'S2',
    domainCode: 'SC',
    title: 'Municipal Solid Waste Smart Bin Telemetry & Route Optimization',
    description: 'City garbage trucks follow rigid schedules, collecting half-empty bins while overflowing dumpsters cause public health hazards. Build an IoT fill-level monitoring system with automated route planning for municipal waste trucks.',
    detailedRequirements: '1. Ultrasonic trash fill-level simulation across 50+ city bins.\n2. Vehicle Routing Problem (VRP) solver to calculate the most fuel-efficient route for garbage trucks only visiting bins >75% full.\n3. Citizen reporting app for illegal dumping with geolocation photo uploads.',
    expectedOutcome: 'Municipal dispatch map showing live bin fill levels, automated garbage truck turn-by-turn route generation, and fuel savings calculator.',
    difficulty: 'Medium',
    tags: JSON.stringify(['VRP', 'Waste Management', 'IoT', 'Route Optimization'])
  },
  {
    code: 'S3',
    domainCode: 'SC',
    title: 'Urban Water Distribution Leakage Detection & Acoustic Telemetry',
    description: 'Municipal water distribution networks lose over 30% of treated drinking water to underground pipe fractures. Build an anomaly detection pipeline analyzing pressure gradients and acoustic sensor spikes to pinpoint pipe bursts.',
    detailedRequirements: '1. Hydraulic pipe network simulation model with pressure and flow rate sensors.\n2. Anomaly detection algorithm isolating pipe burst segments from pressure drop signatures.\n3. Maintenance crew work order dispatch and valve isolation recommendations.',
    expectedOutcome: 'Water authority GIS command dashboard showing pipe network pressure heatmaps, burst alerts, automatic valve shutdown isolation suggestions, and estimated lost liter metrics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Hydraulics', 'Anomaly Detection', 'Smart Utilities', 'GIS'])
  },
  {
    code: 'S4',
    domainCode: 'SC',
    title: 'Streetlight Energy Optimization & Predictive Maintenance Mesh',
    description: 'Public streetlights consume up to 40% of municipal energy bills. Build an intelligent street lighting mesh controller that dims lights based on pedestrian motion sensors, ambient moonlight, and reports dead lamps automatically.',
    detailedRequirements: '1. Dynamic dimming schedule based on ambient lux and radar vehicle/pedestrian detection.\n2. Automated fault detection (burned-out LEDs, wiring short circuits).\n3. Citywide energy consumption tracking and CO2 offset dashboard.',
    expectedOutcome: 'City lighting map displaying lamp status, power draw, scheduled dimming controls, and maintenance work ticket automation.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Energy Efficiency', 'IoT Mesh', 'Smart Grid', 'City Ops'])
  },
  {
    code: 'S5',
    domainCode: 'SC',
    title: 'Civic Infrastructure Hazard Reporting & Citizen Grievance Tracker',
    description: 'Potholes, broken footpaths, and damaged street furniture linger for months because citizen complaints get lost in bureaucratic silos. Build a citizen app that automatically routes geotagged complaints to the correct department.',
    detailedRequirements: '1. Mobile-friendly photo upload with EXIF GPS location verification and pothole severity classification.\n2. Automated ticketing and SLA tracking for municipal engineering departments.\n3. Public status tracker with upvoting, timeline updates, and completed repair photos.',
    expectedOutcome: 'Citizen complaint portal with interactive map, automated ticket workflow, departmental SLA leaderboard, and citizen resolution feedback.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Civic Tech', 'Grievance Redressal', 'Geolocation', 'Crowdsourcing'])
  },
  {
    code: 'S6',
    domainCode: 'SC',
    title: 'Urban Heat Island Mitigation & Rooftop Greening Planner',
    description: 'Concrete density causes city temperatures to rise 4-8°C above surrounding countryside. Build an urban satellite mapping tool that identifies thermal hotspots and models the cooling impact of reflective cool roofs and rooftop gardens.',
    detailedRequirements: '1. Thermal satellite raster ingestion and surface temperature calculation.\n2. Building rooftop footprint extraction and green roof suitability scoring.\n3. Microclimate cooling simulation showing ambient temperature drop under greening scenarios.',
    expectedOutcome: 'City GIS planner showing heat island thermal maps, building-by-building rooftop retrofit potential, and estimated municipal temperature reduction.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Climate Resilience', 'Urban Planning', 'Thermal Imaging', 'GIS'])
  },
  {
    code: 'S7',
    domainCode: 'SC',
    title: 'Smart Public Parking Guidance & Reservation System',
    description: 'Up to 30% of inner-city traffic is caused by drivers cruising in circles looking for vacant curbside parking. Build an integrated parking management system with ultrasonic space sensors and dynamic pricing.',
    detailedRequirements: '1. Real-time curbside and parking garage vacancy tracking.\n2. Dynamic congestion pricing based on current occupancy rates.\n3. Driver navigation app with advance 15-minute slot reservation.',
    expectedOutcome: 'Driver navigation view showing nearby available slots with price indicators, reservation booking flow, and parking authority revenue analytics.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Smart Parking', 'Dynamic Pricing', 'Mobility', 'Navigation'])
  },
  {
    code: 'S8',
    domainCode: 'SC',
    title: 'Citywide Ambient Air Quality Hyper-Local Sensor Network',
    description: 'City pollution monitoring stations are sparse, hiding toxic pollution spikes on specific school streets and construction corridors. Build a hyper-local air quality platform tracking PM2.5, PM10, NO2, and VOCs with clean air routing.',
    detailedRequirements: '1. Ingestion of multi-node low-cost IoT AQI sensor feeds.\n2. Spatial interpolation (Kriging / IDW) generating smooth street-level pollution heatmaps.\n3. Pedestrian & cyclist navigation engine routing users through the cleanest air corridors.',
    expectedOutcome: 'Live interactive AQI heatmap, historical pollutant trend charts, and "cleanest air path" walking route generator.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Air Quality', 'Spatial Interpolation', 'Healthy Cities', 'IoT'])
  },
  {
    code: 'S9',
    domainCode: 'SC',
    title: 'Automated Noise Pollution Violation Monitoring & Acoustic Camera',
    description: 'Illegal nighttime construction and vehicle honking degrade citizen health. Build an acoustic telemetry network that identifies noise threshold violations, triangulates sound sources, and issues automated civic notices.',
    detailedRequirements: '1. Audio dB monitoring and frequency spectrum analysis to distinguish honking/jackhammers from sirens.\n2. Sound source triangulation from multi-microphone sensor arrays.\n3. Automated municipal violation citation dispatch with timestamped audio evidence snippets.',
    expectedOutcome: 'Noise monitoring dashboard showing city dB heatmaps, automatic violation incident triggers, and regulatory compliance logs.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Acoustics', 'Audio Processing', 'Civic Enforcement', 'Sensors'])
  },
  {
    code: 'S10',
    domainCode: 'SC',
    title: 'Public Transit Passenger Crowd Density & Bus Dispatch Forecaster',
    description: 'Buses arrive bunched together, leaving some packed while others run empty. Build an automated transit fleet controller analyzing passenger tap-in data and waiting passenger counts at stops to dynamically dispatch buses.',
    detailedRequirements: '1. Real-time passenger count monitoring at transit stops via simulated camera/turnstiles.\n2. Bus bunching prediction and dynamic schedule headway adjustment.\n3. Commuter app showing next bus ETA and live passenger crowding level (Low, Medium, Full).',
    expectedOutcome: 'Transit controller dashboard with live bus fleet tracking, headway regularity score, and commuter real-time crowd arrival display.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Transit Ops', 'Fleet Management', 'Crowd Estimation', 'Commuter Tech'])
  },

  // 5. Public Safety & Emergency (P1 - P10)
  {
    code: 'P1',
    domainCode: 'PS',
    title: 'Disaster Relief Coordination & Offline Peer-to-Peer Mesh Dispatch',
    description: 'Cell towers and power grids collapse during earthquakes and hurricanes, severing 911 access. Build a localized peer-to-peer offline emergency communication app using WebRTC data channels and Bluetooth mesh relay.',
    detailedRequirements: '1. Offline SOS packet generation containing GPS coordinates, medical triaging, and victim count.\n2. Multi-hop peer-to-peer message relay across civilian phones until an internet gateway is reached.\n3. Incident commander rescue map plotting triangulated distress beacons.',
    expectedOutcome: 'Civilian offline SOS beacon app and rescue commander triage dashboard displaying verified victims on offline raster maps.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Mesh Networks', 'WebRTC Data', 'Disaster Relief', 'Offline First'])
  },
  {
    code: 'P2',
    domainCode: 'PS',
    title: 'AI Wildfire Smoke Detection & Early Thermal Spotting from Tower Cameras',
    description: 'Wildfires that are not contained within the first 20 minutes turn into catastrophic infernos. Build a vision system that monitors 360-degree hilltop optical and infrared camera feeds to spot smoke plumes before satellite detection.',
    detailedRequirements: '1. Object detection model identifying low-contrast smoke plumes and thermal anomalies.\n2. False positive filtering against fog, dust devils, and agricultural burn permits.\n3. Fire spread projection model taking into account wind speed and fuel moisture.',
    expectedOutcome: 'Forestry alert dashboard with video player bounding-box overlays, instant SMS dispatch to fire stations, and predicted 2-hour burn perimeter map.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Computer Vision', 'Wildfire Prevention', 'Thermal Imaging', 'GIS'])
  },
  {
    code: 'P3',
    domainCode: 'PS',
    title: 'Flash Flood Early Warning & Inundation Evacuation Planner',
    description: 'Rapid urban cloudbursts submerge low-lying underpasses and settlements within minutes. Create an early warning system integrating river gauge sensors, drainage capacity, and rainfall radar to plan evacuation routes.',
    detailedRequirements: '1. Real-time river basin water level telemetry and runoff flood modeling.\n2. Elevation contour map identifying submerged road segments in real time.\n3. Turn-by-turn dynamic evacuation routing steering citizens away from flooded roads.',
    expectedOutcome: 'Civil defense command map showing flood water progression, automated shelter location allocation, and dynamic safe evacuation paths.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Hydrology', 'Flood Modeling', 'Evacuation Routing', 'Public Safety'])
  },
  {
    code: 'P4',
    domainCode: 'PS',
    title: 'Smart 911 Computer-Aided Dispatch (CAD) & Speech Triaging',
    description: 'Emergency dispatchers suffer high burnout and cognitive overload while triaging panicked callers. Build an AI-assisted CAD interface that transcribes 911 calls, extracts addresses and caller state, and suggests responder units.',
    detailedRequirements: '1. Real-time speech transcription with acoustic panic and gunshot detection.\n2. Automated geolocation extraction from unstructured caller speech.\n3. Unit recommendation engine (Police, EMS, Fire) based on proximity and incident code.',
    expectedOutcome: 'Dispatcher workstation with live caller transcript, extracted incident facts, one-click unit dispatch buttons, and responder status board.',
    difficulty: 'Hard',
    tags: JSON.stringify(['CAD', 'Speech Recognition', 'Emergency Services', 'Real-Time'])
  },
  {
    code: 'P5',
    domainCode: 'PS',
    title: 'Women & Solo Traveler Personal Safety Guardian with Audio Trigger',
    description: 'Victims of harassment or assault are often unable to unlock their phones to dial emergency numbers. Build a background safety app that triggers SOS alerts upon hearing specific distress keywords or scream acoustic signatures.',
    detailedRequirements: '1. On-device acoustic neural network detecting human screams and pre-configured safety trigger phrases.\n2. Silent SOS broadcasting with live GPS location tracking and 10-second ambient audio recording to emergency contacts.\n3. Fake incoming call simulator and safe-haven route guidance to verified open stores.',
    expectedOutcome: 'Mobile web application featuring acoustic trigger test bed, live location sharing link for trusted contacts, and rapid emergency contact broadcast.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Personal Safety', 'Audio ML', 'Geolocation', 'Mobile Security'])
  },
  {
    code: 'P6',
    domainCode: 'PS',
    title: 'Structural Health Monitoring & Seismic Anomaly Detector for Bridges',
    description: 'Aging civil infrastructure suffers catastrophic failures without prior warning. Build an IoT vibration monitoring suite that processes accelerometer data from bridge suspension cables to detect micro-fractures.',
    detailedRequirements: '1. High-frequency vibration time-series ingestion and Fast Fourier Transform (FFT) resonant frequency analysis.\n2. Anomaly detection when modal frequency shifts indicate structural fatigue.\n3. Maintenance alert dashboard with automated vehicle load restriction recommendations.',
    expectedOutcome: 'Structural engineering portal showing 3D bridge wireframe, live vibration waveforms, FFT frequency spectrum, and structural integrity rating.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Structural Health', 'Signal Processing', 'FFT', 'IoT Telemetry'])
  },
  {
    code: 'P7',
    domainCode: 'PS',
    title: 'Missing Person Search & Rescue Drone Reconnaissance Coordinator',
    description: 'Search and rescue teams lose crucial time during the golden 24-hour window when scouring rugged terrain. Build a multi-drone aerial search coordinator that splits wilderness sectors and scans video feeds for clothing colors.',
    detailedRequirements: '1. Grid partition and flight path allocator for search drones.\n2. Computer vision color-blob and human silhouette detection on thermal/RGB feeds.\n3. Clustered sighting map with probability of detection heatmaps.',
    expectedOutcome: 'Search and rescue tactical operations map showing drone search tracks, flagged suspect human detections with imagery snippets, and search coverage stats.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Search & Rescue', 'Drone Ops', 'Computer Vision', 'Tactical GIS'])
  },
  {
    code: 'P8',
    domainCode: 'PS',
    title: 'Hazardous Chemical Leak Plume Dispersion Forecaster',
    description: 'Industrial toxic chemical leaks require immediate downwind evacuation before lethal gases reach residential zones. Build a dispersion modeling tool using the Gaussian Plume Model to predict chemical gas spread.',
    detailedRequirements: '1. Gaussian Plume air dispersion algorithm incorporating wind vector, atmospheric stability, and chemical emission rate.\n2. Downwind hazard zone polygon rendering on satellite maps.\n3. Automatic population at risk calculation and shelter-in-place advisory generator.',
    expectedOutcome: 'Industrial safety command screen displaying animated toxic gas plume contours, affected residential neighborhood counts, and evacuation sirens.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Hazardous Materials', 'Gaussian Plume', 'Environmental Health', 'GIS'])
  },
  {
    code: 'P9',
    domainCode: 'PS',
    title: 'Crowd Crush Hazard Detection & Surge Density Monitoring',
    description: 'Pilgrimages, concerts, and stadium events turn deadly when crowd density exceeds 4-5 people per square meter. Build a computer vision monitoring tool that detects dangerous crowd turbulence and high-density choke points.',
    detailedRequirements: '1. Crowd density heatmapping from overhead camera video streams.\n2. Optical flow motion vector analysis detecting sudden panic surges or unidirectional jams.\n3. Automated alarm triggers to stadium security to open relief exit gates.',
    expectedOutcome: 'Venue safety control room interface with camera feed crowd heatmaps, real-time people-per-sqm metrics, and choke-point escalation alarms.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Crowd Safety', 'Computer Vision', 'Optical Flow', 'Venue Management'])
  },
  {
    code: 'P10',
    domainCode: 'PS',
    title: 'Automated Cyber Bullying & Violent Threat Detection for Public Schools',
    description: 'School violence and cyber bullying lead to severe psychological trauma and school shooting tragedies. Build a threat detection scanner for student community boards that flags violent intent and self-harm keywords while preserving privacy.',
    detailedRequirements: '1. Multi-category NLP text classifier (Bullying, Self-Harm, Violent Weapon Threat, Hate Speech).\n2. Severity escalation pipeline routing critical threats directly to school counselors.\n3. Context-aware false positive filter (slang vs genuine threats).',
    expectedOutcome: 'School administrator moderation portal showing anonymized flagged posts, risk score badges, and automated crisis counselor intervention workflow.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Content Moderation', 'NLP', 'School Safety', 'Mental Health'])
  },

  // 6. Finance & FinTech (F1 - F10)
  {
    code: 'F1',
    domainCode: 'FN',
    title: 'Real-Time Payment Fraud Detection via Graph Anomaly Mining',
    description: 'Syndicated money-mule networks evade traditional rule-based checks by hopping funds across hundreds of micro-accounts. Build a real-time graph database analyzer that detects cyclical transactions and mule chains.',
    detailedRequirements: '1. Transaction graph ingestion modeling users as nodes and transfers as directed edges.\n2. Detection algorithms for circular payment rings, rapid pass-through mule chains, and sudden velocity spikes.\n3. Real-time scoring API returning approve/hold/reject in <100ms.',
    expectedOutcome: 'Fraud operations dashboard showing visual graph cluster rendering of money-mule rings, flagged transaction inspection pane, and rule configuration studio.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Graph Analytics', 'Fraud Detection', 'FinTech', 'High Throughput'])
  },
  {
    code: 'F2',
    domainCode: 'FN',
    title: 'Alternative Credit Scoring Engine for Unbanked Gig Workers',
    description: 'Millions of gig-economy drivers and freelance workers are rejected by banks because they lack traditional credit bureau history. Build an alternative underwriting engine evaluating cash-flow consistency and utility bill timeliness.',
    detailedRequirements: '1. Account aggregator/bank statement cash flow parser calculating monthly discretionary income.\n2. Non-traditional behavioral scoring (delivery app earnings consistency, utility bill payment history).\n3. Explainable credit score breakdown with clear adverse action disclosures.',
    expectedOutcome: 'Lender underwriting portal showing applicant alternative credit score (300-850), cash flow stability charts, and instant loan pre-approval decisioning.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Credit Scoring', 'Financial Inclusion', 'Explainable AI', 'FinTech'])
  },
  {
    code: 'F3',
    domainCode: 'FN',
    title: 'Automated Micro-Investment & Round-Up Portfolio Rebalancer',
    description: 'Young consumers struggle to save money for retirement due to friction in traditional investing. Build an automated spare-change round-up application that rounds everyday transactions to the nearest dollar and invests into fractional portfolios.',
    detailedRequirements: '1. Transaction round-up calculation engine (e.g. $4.30 coffee -> $0.70 spare change).\n2. Automated fractional ETF portfolio rebalancing based on modern portfolio theory.\n3. Recurring goal simulator showing 10-year compound interest projections.',
    expectedOutcome: 'Consumer investing dashboard with linked card transaction feed, round-up savings accumulator, portfolio allocation donut chart, and deposit automation.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Micro-Investing', 'WealthTech', 'Personal Finance', 'Compound Interest'])
  },
  {
    code: 'F4',
    domainCode: 'FN',
    title: 'Smart Escrow Contract System for Milestone-Based Freelance Contracts',
    description: 'Freelancers routinely face non-payment after delivering software, while clients worry about paying upfront for incomplete work. Build a milestone-locked digital escrow system that releases funds upon verifiable deliverables.',
    detailedRequirements: '1. Multi-milestone contract generator with escrow deposit locking.\n2. Cryptographic signature and GitHub commit/pull request deliverable verification.\n3. Decentralized dispute arbitration workflow with independent mediation.',
    expectedOutcome: 'Contract creation workflow, client escrow deposit vault, freelancer delivery submission panel, and automatic escrow release trigger.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Escrow', 'Smart Contracts', 'Gig Economy', 'Dispute Resolution'])
  },
  {
    code: 'F5',
    domainCode: 'FN',
    title: 'Cross-Border Remittance Fee Comparison & Optimal Route Aggregator',
    description: 'Migrant workers lose an average of 6-8% of their hard-earned money to hidden exchange rate markups and transfer fees. Build an international remittance aggregator that calculates the true net payout across 20+ transfer corridors.',
    detailedRequirements: '1. Real-time scraping/API ingestion of interbank mid-market exchange rates vs service provider rates.\n2. Transparent total fee calculator exposing hidden foreign exchange spreads.\n3. Historical transfer speed and recipient pickup method comparison (Bank, Cash Pickup, Mobile Wallet).',
    expectedOutcome: 'Consumer remittance comparison tool showing live exchange rates, exact recipient payout amount, speed ranking, and direct referral links.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Remittance', 'Forex', 'Financial Transparency', 'Consumer Protection'])
  },
  {
    code: 'F6',
    domainCode: 'FN',
    title: 'Corporate Expense Fraud & Receipt Duplicate Detection Engine',
    description: 'Employees abuse corporate expense policies through duplicate receipt submissions, inflated meals, and altered invoice dates. Build an automated expense auditing engine with OCR text parsing and duplicate image detection.',
    detailedRequirements: '1. OCR receipt scanner extracting merchant, date, tax, line items, and total amount.\n2. Perceptual hashing (pHash) and fuzzy date-amount matching to catch identical receipts submitted across multiple expense reports.\n3. Policy rule compliance engine (e.g. alcohol limits, weekend expense flags).',
    expectedOutcome: 'Corporate finance audit dashboard flagging duplicate claims with side-by-side receipt image diffs, policy violations, and approval workflows.',
    difficulty: 'Medium',
    tags: JSON.stringify(['OCR', 'Expense Auditing', 'Perceptual Hashing', 'Corporate Finance'])
  },
  {
    code: 'F7',
    domainCode: 'FN',
    title: 'Personal Financial Health Diagnostic & Automated Budget Coach',
    description: 'Most budgeting apps are passive spreadsheets that don’t actively help users eliminate high-interest debt. Build a proactive personal finance coach that categorizes bank transactions and creates a personalized debt avalanche plan.',
    detailedRequirements: '1. Automated transaction categorization into essential, discretionary, and savings buckets.\n2. Debt payoff optimization comparing Avalanche vs Snowball payoff methods.\n3. Predictive cash-flow runway calculator warning of upcoming overdraft risks.',
    expectedOutcome: 'Personal finance dashboard with cash flow runway timeline, debt payoff milestone tracker, and actionable weekly savings recommendations.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Personal Finance', 'Debt Payoff', 'Budgeting', 'Analytics'])
  },
  {
    code: 'F8',
    domainCode: 'FN',
    title: 'SME Invoice Factoring & Automated Early Payment Discounting Marketplace',
    description: 'Small suppliers wait 60 to 90 days for corporate buyers to settle invoices, creating severe working capital crunches. Build a dynamic discounting marketplace where suppliers can auction receivables for instant cash.',
    detailedRequirements: '1. Verified invoice uploading and buyer approval workflow.\n2. Dynamic APR bidding engine for factoring lenders.\n3. Automatic payment reconciliation on invoice maturity date.',
    expectedOutcome: 'Marketplace portal where SMEs list verified invoices, view competitive bids from institutional factors, and accept instant discounted payouts.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Invoice Factoring', 'Supply Chain Finance', 'B2B FinTech', 'Lending'])
  },
  {
    code: 'F9',
    domainCode: 'FN',
    title: 'Regulatory AML (Anti-Money Laundering) Sanctions & PEP Screener',
    description: 'Financial institutions face multi-million dollar penalties if they fail to screen customers against global sanctions lists (OFAC, UN, EU). Build a high-performance sanctions and Politically Exposed Persons (PEP) screening engine.',
    detailedRequirements: '1. Automated ingestion of global sanctions and PEP databases.\n2. Fuzzy string matching (Levenshtein, Jaro-Winkler, phonetic Metaphone) to detect altered spelling and aliases.\n3. Audit-trail compliance log and true match escalation workflow.',
    expectedOutcome: 'Compliance search workspace returning fuzzy match candidates with percentage confidence scores, sanction list citations, and resolution sign-offs.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Compliance', 'RegTech', 'Sanctions Screening', 'Fuzzy Matching'])
  },
  {
    code: 'F10',
    domainCode: 'FN',
    title: 'Automated Crypto Portfolio Tax & Capital Gains Calculator',
    description: 'Cryptocurrency traders executing transactions across multiple exchanges struggle with complex FIFO/LIFO capital gains tax reporting. Build a portfolio tax calculator that imports transaction histories and computes taxable gains.',
    detailedRequirements: '1. Multi-exchange CSV / API transaction importer (buys, sells, transfers, staking rewards).\n2. Cost-basis calculation supporting FIFO, LIFO, and Specific Identification accounting methods.\n3. Generation of official Form 8949 / Schedule D capital gains tax report summaries.',
    expectedOutcome: 'Tax reporting portal showing calculated short-term and long-term capital gains, cost-basis audit records, and downloadable tax summary reports.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Crypto Tax', 'Accounting', 'FinTech', 'Reporting'])
  },

  // 7. Retail & E-Commerce (R1 - R10)
  {
    code: 'R1',
    domainCode: 'RC',
    title: 'AI Hyper-Personalized Product Recommendation Engine',
    description: 'Generic product recommendation sliders result in poor conversion rates and high cart abandonment. Build a hybrid collaborative and content-based recommendation engine that adapts to user clicks in real time.',
    detailedRequirements: '1. User session clickstream tracking and immediate embedding updates.\n2. Matrix factorization and vector similarity search for related items.\n3. Cold-start handler for new users based on onboarding preferences.',
    expectedOutcome: 'E-commerce storefront with dynamically rearranging product recommendation carousels, similarity scoring explanations, and conversion analytics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Recommender Systems', 'Vector Search', 'E-Commerce', 'Personalization'])
  },
  {
    code: 'R2',
    domainCode: 'RC',
    title: 'Virtual 3D Augmented Reality Apparel & Glasses Try-On',
    description: 'Apparel e-commerce suffers from return rates exceeding 30% due to sizing and fit mismatch. Build a browser-based WebGL/AR virtual try-on application that projects 3D eyewear and accessories onto live webcam video.',
    detailedRequirements: '1. Facial landmark detection (68 points) tracking head rotation and scale in real time via webcam.\n2. WebGL 3D model rendering anchored to detected face coordinates (glasses, hats, earrings).\n3. Pupillary distance (PD) measurement tool for optical prescription accuracy.',
    expectedOutcome: 'Interactive try-on web studio where users test 3D frames with real-time head tracking, take snapshots, and add the chosen frame to cart.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Augmented Reality', 'WebGL', 'Facial Landmarks', 'Computer Vision'])
  },
  {
    code: 'R3',
    domainCode: 'RC',
    title: 'Dynamic Pricing & Competitor Scraping Intelligence Dashboard',
    description: 'Retailers lose sales when prices are too high and sacrifice margins when prices are too low. Build a competitive pricing engine that monitors competitor catalogs and calculates profit-maximizing dynamic prices.',
    detailedRequirements: '1. Automated competitor product catalog matching and price scraper.\n2. Rule-based pricing engine (e.g. price $0.05 below lowest competitor while maintaining 15% gross margin).\n3. Demand elasticity simulator forecasting sales volume shifts.',
    expectedOutcome: 'Merchandiser command center showing competitor price trends, automated re-pricing recommendations, and profit margin impact forecasts.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Dynamic Pricing', 'Web Scraping', 'Business Intelligence', 'Analytics'])
  },
  {
    code: 'R4',
    domainCode: 'RC',
    title: 'Omnichannel Warehouse Inventory Orchestration & Safety Stock Forecaster',
    description: 'Retailers operating both physical stores and online portals suffer stockouts and expensive cross-country split shipments. Build an inventory orchestrator that routes orders to the nearest store with inventory.',
    detailedRequirements: '1. Real-time multi-location inventory ledger across central warehouses and local retail stores.\n2. Intelligent order routing engine minimizing shipping distance and package splits.\n3. Holt-Winters time-series demand forecasting to calculate safety stock reorder thresholds.',
    expectedOutcome: 'Logistics portal showing inventory heatmaps by location, automated purchase order suggestions, and real-time order routing simulation.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Inventory Management', 'Supply Chain', 'Forecasting', 'Omnichannel'])
  },
  {
    code: 'R5',
    domainCode: 'RC',
    title: 'Automated Fake Review Detection & Sentiment Verifier',
    description: 'Paid bot networks and incentivized reviews deceive online shoppers and destroy consumer trust. Build an NLP classifier that detects synthesized, astroturfed, and unnatural sentiment spikes in product reviews.',
    detailedRequirements: '1. Linguistic analysis detecting AI-generated text patterns and repetitive templated phrasing.\n2. Reviewer account velocity checks (bursts of 5-star reviews on the same day).\n3. Verified buyer badge correlation and adjusted "true rating" score computation.',
    expectedOutcome: 'Consumer browser extension / product review page displaying fake review percentage, verified trust score, and highlighted authentic user criticisms.',
    difficulty: 'Medium',
    tags: JSON.stringify(['NLP', 'Sentiment Analysis', 'Fake Reviews', 'Trust & Safety'])
  },
  {
    code: 'R6',
    domainCode: 'RC',
    title: 'E-Commerce Return Logistics & Circular Refurbishment Exchange',
    description: 'Billions of returned items end up in landfills because restocking is more expensive than discarding. Build a reverse-logistics platform that grades returned goods, routes them to local refurbishers, and sells them as certified open-box items.',
    detailedRequirements: '1. Customer return portal with image-based damage self-inspection.\n2. Automated return label routing to nearest regional refurbishment depot.\n3. Open-box / refurbished secondary marketplace with transparent condition grading.',
    expectedOutcome: 'Return initiation wizard, warehouse return inspection grading tool, and secondary discounted marketplace for open-box items.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Reverse Logistics', 'Sustainability', 'Circular Economy', 'E-Commerce'])
  },
  {
    code: 'R7',
    domainCode: 'RC',
    title: 'Smart Grocery Expiry Tracker & Dynamic Markdown System',
    description: 'Supermarkets discard billions of dollars of edible food every day because items near their expiration date are not sold in time. Build an inventory markdown system that dynamically discounts perishables as expiration approaches.',
    detailedRequirements: '1. Batch and expiry date tracking via GS1 DataBar 2D barcodes.\n2. Automated dynamic discount curve (e.g. -20% at 3 days, -50% at 1 day, -80% day of expiry).\n3. Shopper notification feed alerting nearby budget-conscious consumers to flash markdown deals.',
    expectedOutcome: 'Supermarket staff markdown management app, electronic shelf label price simulator, and consumer deal hunter map for expiring food items.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Food Waste', 'Dynamic Markdown', 'Retail Ops', 'Barcode'])
  },
  {
    code: 'R8',
    domainCode: 'RC',
    title: 'Live Stream Video Shopping Platform with In-Video Checkout',
    description: 'Traditional static product pages fail to engage Gen-Z shoppers. Build an interactive live video shopping platform allowing influencers to showcase products with real-time chat, viewer polls, and instant one-click in-stream checkout.',
    detailedRequirements: '1. Low-latency live video streaming integration.\n2. Synchronized interactive product drawer pinned to video timestamps.\n3. Instant checkout drawer without leaving the video stream.',
    expectedOutcome: 'Creator streaming studio with product pin tool, and viewer interactive live room with scrolling live comments, floating reactions, and seamless purchase modal.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Live Video', 'Live Commerce', 'WebRTC', 'Interactive Media'])
  },
  {
    code: 'R9',
    domainCode: 'RC',
    title: 'Micro-Store Point-of-Sale (POS) & Offline Sync for Small Merchants',
    description: 'Street vendors and small pop-up shops lose sales when internet connectivity drops. Build a fast, offline-first touchscreen POS that registers transactions in IndexedDB and automatically syncs to cloud inventory upon reconnection.',
    detailedRequirements: '1. Touchscreen cash/card register interface optimized for quick-tap item entry.\n2. Complete offline capability with local SQLite/IndexedDB transaction buffering.\n3. Conflict-free cloud synchronization and SMS digital receipt dispatch.',
    expectedOutcome: 'Fast POS cashier screen with barcode scanner input, offline receipt generation, network status indicator, and automatic background sync.',
    difficulty: 'Easy',
    tags: JSON.stringify(['POS', 'Offline-First', 'Retail Tech', 'Sync'])
  },
  {
    code: 'R10',
    domainCode: 'RC',
    title: 'E-Commerce Customer Support AI Agent with Order Action Execution',
    description: 'Customer service bots that only answer canned FAQs frustrate customers. Build an intelligent conversational agent that authenticates customers, looks up their real orders, and autonomously processes returns, refunds, and address changes.',
    detailedRequirements: '1. Intent parsing and slot filling for common order inquiries (Where is my order, Change address, Cancel item).\n2. Secure integration with backend order database via API tool-calling.\n3. Human agent escalation handoff when sentiment drops or order threshold exceeds limits.',
    expectedOutcome: 'Interactive chat widget where customers can check live order transit status, cancel an active order, or request a refund with real database updates.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Conversational AI', 'Customer Support', 'Function Calling', 'E-Commerce'])
  },

  // 8. Environment & Climate (C1 - C10)
  {
    code: 'C1',
    domainCode: 'EC',
    title: 'Enterprise Carbon Accounting & Scope 1/2/3 Greenhouse Gas Auditor',
    description: 'Companies face stringent ESG regulations requiring transparent accounting of greenhouse gas emissions across all three scopes. Build a corporate carbon auditing platform following the GHG Protocol standards.',
    detailedRequirements: '1. Automated conversion factors for electricity consumption, business flights, freight, and supply chain invoices.\n2. Breakdown into Scope 1 (Direct), Scope 2 (Purchased Energy), and Scope 3 (Value Chain) emissions.\n3. Scenario modeling for net-zero reduction targets and Science Based Targets (SBTi) audit reports.',
    expectedOutcome: 'Corporate sustainability dashboard displaying carbon emissions by business unit, historical reduction trajectories, and exportable ESG audit reports.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Carbon Accounting', 'ESG', 'Sustainability', 'Reporting'])
  },
  {
    code: 'C2',
    domainCode: 'EC',
    title: 'Solar Microgrid Energy Trading & Battery Storage Optimizer',
    description: 'Residential rooftop solar owners waste excess clean energy during midday peaks. Build a peer-to-peer neighborhood energy trading platform that schedules home battery charging and sells surplus kilowatt-hours to neighbors.',
    detailedRequirements: '1. Battery storage charge/discharge state optimization based on time-of-use tariffs.\n2. Peer-to-peer energy order matching matching local solar producers with neighborhood consumers.\n3. Grid tie-in simulation tracking total community clean energy self-sufficiency.',
    expectedOutcome: 'Homeowner dashboard showing real-time solar generation, home consumption, battery SOC, and automated energy sale transaction ledger.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Renewable Energy', 'Microgrid', 'P2P Energy', 'Battery Optimization'])
  },
  {
    code: 'C3',
    domainCode: 'EC',
    title: 'Illegal Deforestation & Poaching Acoustic Early Warning System',
    description: 'Chainsaws and gunshots in protected wildlife reserves go undetected until hundreds of hectares of rainforest are destroyed. Build an acoustic detection engine analyzing audio from solar-powered forest canopy sensors.',
    detailedRequirements: '1. Audio spectrogram classification detecting chainsaw motors, truck engines, and rifle gunshots.\n2. Triangulation of sound origin using Time Difference of Arrival (TDOA) across multi-sensor nodes.\n3. Automated ranger dispatch alert with GPS coordinates.',
    expectedOutcome: 'Ranger command map with live audio stream spectrum visualizer, acoustic intrusion alert alerts, and GPS navigation to the intrusion coordinates.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Bioacoustics', 'Conservation', 'Audio Classification', 'Ranger Tech'])
  },
  {
    code: 'C4',
    domainCode: 'EC',
    title: 'Ocean Plastic & Shoreline Debris Drone Mapping System',
    description: 'Coastal cleanup efforts waste volunteer hours searching for debris rather than collecting it. Build an aerial imagery mapping tool that automatically categorizes and maps marine debris density along beaches.',
    detailedRequirements: '1. Computer vision detection of plastic bottles, fishing nets, polystyrene, and tires on aerial shoreline photos.\n2. Generation of high-resolution marine debris density heatmaps.\n3. Volunteer cleanup team task assignment and weight collection tracking.',
    expectedOutcome: 'Interactive coastal GIS map showing plastic hot zones, categorized litter counts, and organized volunteer cleanup expedition plans.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Marine Conservation', 'Computer Vision', 'Drone Mapping', 'Crowdsourced Cleanup'])
  },
  {
    code: 'C5',
    domainCode: 'EC',
    title: 'Urban Tree Canopy & Biodiversity Health Index Tracker',
    description: 'City tree cover is vital for cooling and bird habitats, but urban trees often die from drought and disease unnoticed. Build a civic tree inventory and canopy health tracker combining satellite NDVI and citizen tree adoptions.',
    detailedRequirements: '1. Urban tree registry with species identification, diameter at breast height (DBH), and canopy area.\n2. Citizen tree adoption feature allowing residents to log watering and maintenance.\n3. Ecological services calculator (gallons of stormwater absorbed, lbs of CO2 sequestered).',
    expectedOutcome: 'Civic tree map with individual tree profiles, citizen watering leaderboards, and neighborhood canopy coverage metrics.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Urban Forestry', 'Biodiversity', 'Citizen Science', 'GIS'])
  },
  {
    code: 'C6',
    domainCode: 'EC',
    title: 'Personal Carbon Footprint Tracker & Sustainable Habit Gamifier',
    description: 'Citizens want to fight climate change but lack concrete understanding of how their daily habits impact their personal carbon footprint. Build a habit-tracking app that estimates daily carbon emissions and gamifies reduction.',
    detailedRequirements: '1. Daily lifestyle log (commute mode, dietary choices, home thermostat, purchases) with carbon footprint calculation.\n2. Weekly carbon reduction challenges with peer leaderboards and badge milestones.\n3. Curated recommendations for low-carbon lifestyle swaps with verified impact metrics.',
    expectedOutcome: 'Engaging consumer mobile web app with carbon daily tracker gauge, community challenge leaderboard, and personalized carbon reduction tips.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Personal Carbon', 'Gamification', 'Behavioral Science', 'Climate Action'])
  },
  {
    code: 'C7',
    domainCode: 'EC',
    title: 'Industrial Factory Wastewater Effluent Monitoring & Early Compliance Alert',
    description: 'Factories frequently discharge untreated toxic effluents into rivers during nighttime to avoid inspection. Build an IoT sensor telemetry platform that monitors pH, chemical oxygen demand (COD), and turbidity at industrial discharge pipes.',
    detailedRequirements: '1. Continuous streaming data pipeline from industrial water discharge sensors.\n2. Automated compliance violation detection against environmental protection standards.\n3. Tamper-proof regulatory audit trail and automatic environmental agency notification.',
    expectedOutcome: 'Environmental agency inspection dashboard showing factory discharge compliance, historical contamination spikes, and automated fine calculation.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Water Quality', 'IoT Telemetry', 'Environmental Regulation', 'Audit Trail'])
  },
  {
    code: 'C8',
    domainCode: 'EC',
    title: 'Wind Turbine Predictive Vibration Analysis & Blade Pitch Optimizer',
    description: 'Mechanical gearbox breakdowns in offshore wind turbines cause catastrophic outages costing hundreds of thousands in crane rentals. Build an anomaly detection pipeline that predicts bearing failure weeks in advance.',
    detailedRequirements: '1. SCADA sensor time-series processing (bearing temperature, vibration harmonics, wind speed).\n2. Machine learning remaining useful life (RUL) estimation for critical components.\n3. Dynamic blade pitch angle optimization to maximize power generation under gusty wind profiles.',
    expectedOutcome: 'Wind farm operations console showing individual turbine 3D models, component health scores, predictive maintenance alerts, and power generation stats.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Renewable Energy', 'SCADA', 'Predictive Maintenance', 'Wind Power'])
  },
  {
    code: 'C9',
    domainCode: 'EC',
    title: 'Food Supply Chain Carbon Traceability & Product Climate Labeling',
    description: 'Consumers have no visibility into the hidden carbon footprint behind food products on supermarket shelves. Build an end-to-end supply chain carbon tracker that calculates the true farm-to-fork footprint of grocery items.',
    detailedRequirements: '1. Lifecycle assessment (LCA) calculator factoring in farming fertilizer, processing, air freight, and refrigeration.\n2. Standardized Eco-Score (Grade A to E) generation printable on product packaging QR codes.\n3. Consumer scanner displaying the product’s carbon breakdown compared to category averages.',
    expectedOutcome: 'Manufacturer carbon entry portal, Eco-Score rating engine, and consumer mobile product scan view with comparative environmental metrics.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Life Cycle Assessment', 'Eco-Labeling', 'Supply Chain', 'Food Tech'])
  },
  {
    code: 'C10',
    domainCode: 'EC',
    title: 'Groundwater Aquifer Depletion Forecaster & Rainwater Harvesting Planner',
    description: 'Unregulated borewells are causing underground aquifers to dry up, threatening water security for millions. Build a groundwater level forecasting tool that simulates aquifer recharge and models the impact of rooftop rainwater harvesting.',
    detailedRequirements: '1. Hydrogeological balance simulation incorporating extraction rates, rainfall, and soil permeability.\n2. Rooftop rainwater harvesting tank size and recharge pit calculator for residential properties.\n3. Aquifer depletion warning zones and local government policy advisory.',
    expectedOutcome: 'Regional groundwater depth map, residential rainwater harvesting sizing calculator, and predictive aquifer depletion timeline charts.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Hydrogeology', 'Water Conservation', 'Simulation', 'Civic Planning'])
  },

  // 9. Transportation & Mobility (T1 - T10)
  {
    code: 'T1',
    domainCode: 'TM',
    title: 'EV Smart Charging Grid Orchestrator & Peak Shaving System',
    description: 'Uncoordinated charging of thousands of electric vehicles during evening hours threatens to overload municipal power transformers. Build an intelligent charging scheduler that balances EV charging demand with grid capacity.',
    detailedRequirements: '1. Dynamic charging load balancer adjusting kilowatt output to connected vehicles based on transformer capacity.\n2. Driver departure-time constraint solver ensuring vehicles are fully charged by morning.\n3. Integration with real-time electricity pricing to charge during cheapest off-peak hours.',
    expectedOutcome: 'Charging station management portal showing connected vehicle charging curves, grid load threshold line, and driver charging status app.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Electric Vehicles', 'Smart Grid', 'Load Balancing', 'Energy'])
  },
  {
    code: 'T2',
    domainCode: 'TM',
    title: 'Multimodal Urban Transit Journey Planner with Unified Ticketing',
    description: 'Urban commuters waste time switching between separate apps for metro tickets, city buses, bike shares, and ride-hailing. Build a unified multimodal transit routing engine with one-click single-fare digital ticketing.',
    detailedRequirements: '1. Multimodal graph routing combining walking, metro, bus, shared e-scooter, and taxi.\n2. Real-time transit arrival and delay integration.\n3. Unified single QR code ticket valid across all legs of the combined journey.',
    expectedOutcome: 'Commuter routing application showing multimodal route options ranked by time, cost, and carbon footprint, complete with single QR ticket checkout.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Transit Routing', 'MaaS', 'Multimodal', 'Unified Ticketing'])
  },
  {
    code: 'T3',
    domainCode: 'TM',
    title: 'Commercial Fleet Predictive Maintenance & Telematics Suite',
    description: 'Unplanned truck breakdowns on highway freight routes cause millions in late delivery penalties and supply chain disruptions. Build a fleet telematics platform that predicts engine, brake, and tire failures before roadside breakdowns occur.',
    detailedRequirements: '1. OBD-II telemetry stream processor ingesting coolant temp, RPM, engine oil pressure, and DTC codes.\n2. Predictive failure models based on mileage and stress duty cycles.\n3. Automated mechanic service ticket dispatch and parts inventory reservation.',
    expectedOutcome: 'Fleet manager command center with live vehicle map, health status indicators for every vehicle, and predictive maintenance schedule.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Fleet Management', 'Telematics', 'Predictive Maintenance', 'Logistics'])
  },
  {
    code: 'T4',
    domainCode: 'TM',
    title: 'Autonomous Vehicle Remote Teleoperation & Safety Intervention Portal',
    description: 'When self-driving vehicles encounter road construction, unexpected police hand signals, or sensor occlusions, they stall. Build a low-latency remote teleoperation bridge that allows human operators to guide stalled vehicles safely.',
    detailedRequirements: '1. Low-latency multi-camera video streaming simulator with latency and jitter monitoring.\n2. Remote waypoint drawing and steering path injection for the autonomous vehicle planner.\n3. Operator safety supervisor with heartbeat dead-man switch and automated fail-safe stop.',
    expectedOutcome: 'Teleoperation cockpit interface showing 360-degree vehicle video streams, interactive path-drawing canvas, vehicle telemetry HUD, and intervention audit logs.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Autonomous Vehicles', 'Teleoperation', 'WebRTC', 'Robotics'])
  },
  {
    code: 'T5',
    domainCode: 'TM',
    title: 'Micromobility Fleet Rebalancing & Geofence Parking Enforcement',
    description: 'Shared e-bikes and e-scooters clutter pedestrian sidewalks and accumulate in residential areas while business centers run out. Build an automated rebalancing and geofencing management platform for micromobility operators.',
    detailedRequirements: '1. High-precision GPS geofencing enforcing designated parking corrals and slow-speed pedestrian zones.\n2. Demand heatmaps predicting vehicle shortages and automated rebalancing van routing.\n3. In-app photo verification of parked scooters with computer vision parking compliance check.',
    expectedOutcome: 'City operations map showing live scooter locations, geofence zones, rebalancing tasks, and customer parking photo verification interface.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Micromobility', 'Geofencing', 'Fleet Rebalancing', 'Urban Transport'])
  },
  {
    code: 'T6',
    domainCode: 'TM',
    title: 'Last-Mile Delivery Route Optimizer with Real-Time Traffic & Curbside Constraints',
    description: 'Delivery drivers waste up to 40% of their time finding parking spots and backtracking between deliveries. Build a vehicle routing engine that incorporates package dimensions, truck capacity, and delivery time windows.',
    detailedRequirements: '1. Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) optimization.\n2. Dynamic re-routing based on live traffic congestion and street parking availability.\n3. Driver companion mobile app with package delivery checklist and barcode proof of delivery.',
    expectedOutcome: 'Dispatcher route planning portal with optimized delivery stops on an interactive map, and driver step-by-step turn-by-turn route companion.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Route Optimization', 'Last-Mile Delivery', 'CVRPTW', 'Logistics'])
  },
  {
    code: 'T7',
    domainCode: 'TM',
    title: 'Carpool & Ride-Matching Network for Corporate Campuses',
    description: 'Daily solo-occupancy car commuting to large corporate and university campuses causes massive traffic gridlock and parking shortages. Build a verified employee carpooling platform with automated cost sharing and preferred parking perks.',
    detailedRequirements: '1. Verified employee route matching based on origin, destination, and flexible shift times.\n2. Automated split-fare calculation (fuel & toll reimbursement) without commercial taxi licensing.\n3. Campus reserved carpool parking space reservation and check-in QR code.',
    expectedOutcome: 'Employee mobile web app showing matched colleagues along their commute route, in-app ride scheduling, cost sharing split, and reserved parking pass.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Carpooling', 'Ride Sharing', 'Corporate Mobility', 'Sustainability'])
  },
  {
    code: 'T8',
    domainCode: 'TM',
    title: 'Railway Track Defect & Ultrasonic Rail Inspection Telemetry',
    description: 'Rail track fissures and rail head corrugation cause catastrophic train derailments. Build a predictive inspection dashboard that ingests ultrasonic sensor and accelerometer data from inspection railcars to map track anomalies.',
    detailedRequirements: '1. Ingestion of track geometry data (gauge, alignment, cross-level, twist) and ultrasonic flaw records.\n2. Track Quality Index (TQI) calculation along rail track segments.\n3. Maintenance crew prioritization and automated work order scheduling.',
    expectedOutcome: 'Rail infrastructure map displaying color-coded track safety ratings, detailed ultrasonic flaw visualizer, and prioritized repair schedule.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Rail Tech', 'Safety Critical', 'Signal Processing', 'Infrastructure'])
  },
  {
    code: 'T9',
    domainCode: 'TM',
    title: 'Automated Maritime Port Container Drayage & Berth Scheduler',
    description: 'Container ships wait for days anchored offshore while container drayage trucks idle outside port terminal gates. Build an integrated berth and truck appointment reservation system to optimize container terminal throughput.',
    detailedRequirements: '1. Berth allocation scheduling for incoming container ships based on crane availability and draft.\n2. Time-slot reservation system for drayage trucks collecting import containers.\n3. Terminal congestion prediction engine smoothing peak hourly truck arrivals.',
    expectedOutcome: 'Port authority terminal operations dashboard with vessel berth timeline, truck gate appointment calendar, and container turnaround metrics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Maritime Logistics', 'Terminal Operations', 'Scheduling', 'Supply Chain'])
  },
  {
    code: 'T10',
    domainCode: 'TM',
    title: 'School Bus Live GPS Tracking & Child Safety Geofence Alert System',
    description: 'Parents face extreme anxiety when school buses are delayed or children board the wrong bus. Build a comprehensive school bus tracking and student attendance system with instant parent notifications.',
    detailedRequirements: '1. Real-time bus GPS tracking with live speed and stop ETA broadcasting.\n2. RFID / QR code student boarding and deboarding tap-in logger.\n3. Automatic SMS/push notifications when bus enters parent neighborhood geofence.',
    expectedOutcome: 'Parent live tracking app showing school bus on map with countdown ETA, student boarding status badges, and school administrator fleet monitor.',
    difficulty: 'Easy',
    tags: JSON.stringify(['School Bus', 'Child Safety', 'GPS Tracking', 'Mobile Notifications'])
  },

  // 10. Employment & Career (J1 - J10)
  {
    code: 'J1',
    domainCode: 'EP',
    title: 'Bias-Free Skill-First Tech Hiring & Code Assessment Sandbox',
    description: 'Traditional resume screening perpetuates racial, gender, and prestigious-university biases, rejecting talented self-taught developers. Build an anonymized hiring platform where candidates are evaluated purely on verifiable coding performance.',
    detailedRequirements: '1. Complete anonymization of candidate personal identifiers (name, gender, college, location).\n2. Interactive browser-based coding sandbox with automated test case execution and execution time profiling.\n3. Objective candidate competency scorecard measuring problem-solving, code cleanliness, and efficiency.',
    expectedOutcome: 'Anonymized employer candidate review portal, interactive candidate coding environment, and automated skill-based leaderboard.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Diversity & Inclusion', 'Skill Assessment', 'Code Sandbox', 'Hiring'])
  },
  {
    code: 'J2',
    domainCode: 'EP',
    title: 'AI Resume Semantic Matcher & Personalized Career Skill-Gap Roadmap',
    description: 'Job seekers send hundreds of generic resumes into applicant tracking system (ATS) black holes without knowing what skills they lack. Build a semantic resume analyzer that scores match percentage and creates a step-by-step upskilling roadmap.',
    detailedRequirements: '1. PDF resume text extraction and semantic matching against target job descriptions.\n2. Identification of missing core competencies and keyword alignment score.\n3. Personalized 8-week learning curriculum recommendation linking to specific free courses and project ideas.',
    expectedOutcome: 'Job seeker career workstation displaying ATS match score, highlighted missing skills, optimized resume suggestion diff, and custom learning roadmap.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Career Tech', 'Resume Optimizer', 'NLP', 'Skill Gap'])
  },
  {
    code: 'J3',
    domainCode: 'EP',
    title: 'Freelance Gig Worker Portability & Reputation Passport',
    description: 'Gig workers are trapped on individual platforms (Upwork, Fiverr, Uber) and lose their entire reputation if they switch. Build a decentralized work credential passport where freelancers aggregate verified reviews and earnings across platforms.',
    detailedRequirements: '1. Multi-platform review and earnings history aggregation with cryptographic proof.\n2. Portable freelancer reputation score calculated from client feedback and completion rates.\n3. Public shareable portfolio profile with verifiable skill badges and testimonials.',
    expectedOutcome: 'Freelancer passport dashboard displaying aggregated ratings across platforms, composite trust score, and public portfolio showcase link.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Gig Economy', 'Reputation Passport', 'Worker Empowerment', 'Portfolio'])
  },
  {
    code: 'J4',
    domainCode: 'EP',
    title: 'Automated Apprenticeship & Vocational Skill Matchmaker for Youth',
    description: 'Skilled trades (electricians, welders, plumbers, HVAC) face massive labor shortages while non-college youth struggle to find career apprenticeships. Build a vocational matchmaking portal connecting youth with sponsored trade apprenticeships.',
    detailedRequirements: '1. Trade career aptitude quiz matching hands-on strengths with vocational careers.\n2. Local trade union and certified employer apprenticeship opening directory.\n3. Apprenticeship milestone tracker logging on-the-job training hours and licensing prep.',
    expectedOutcome: 'Youth career portal with vocational discovery quiz, geolocated apprenticeship job board, and apprentice hour logging dashboard.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Vocational Training', 'Apprenticeships', 'Trade Careers', 'Job Board'])
  },
  {
    code: 'J5',
    domainCode: 'EP',
    title: 'Remote Team Culture & Asynchronous Pulse Morale Analyzer',
    description: 'Remote engineering teams suffer from quiet burnout, social isolation, and communication silos that managers fail to detect. Build an asynchronous team wellness tool that tracks sentiment trends and meeting overload without invasive spying.',
    detailedRequirements: '1. Daily 1-click asynchronous mood and workload pulse check.\n2. Calendar analytics identifying meeting overload (>20 hours/week) and lack of deep work focus blocks.\n3. Aggregated team burnout risk score with manager intervention recommendations while preserving individual privacy.',
    expectedOutcome: 'Team pulse dashboard showing team sentiment over time, meeting vs focus time ratio, and actionable team health recommendations.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Remote Work', 'Team Morale', 'Burnout Prevention', 'People Ops'])
  },
  {
    code: 'J6',
    domainCode: 'EP',
    title: 'AI Interactive Technical Mock Interviewer & Speech Coach',
    description: 'Students from underprivileged backgrounds lack access to professional mentors to practice technical job interviews. Build an AI-driven voice interviewer that conducts behavioral and technical software engineering interviews with real-time feedback.',
    detailedRequirements: '1. Conversational voice agent that asks dynamic follow-up questions based on candidate answers.\n2. Real-time feedback on pacing, filler words (um, like), confidence, and clarity of explanation.\n3. Comprehensive interview performance report with model answers and improvement tips.',
    expectedOutcome: 'Interactive mock interview room with live speech interaction, real-time question prompts, and a downloadable interview feedback scorecard.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Mock Interview', 'Voice AI', 'Interview Prep', 'EdTech'])
  },
  {
    code: 'J7',
    domainCode: 'EP',
    title: 'Internal Talent Mobility & Internal Gig Marketplace for Enterprises',
    description: 'Large companies lose valuable employees to competitors because workers cannot easily transfer to other departments or explore internal projects. Build an internal talent marketplace matching employees with part-time cross-functional projects.',
    detailedRequirements: '1. Employee skill profile and career aspiration registry.\n2. Project leader internal gig posting board with required skills and time commitment (5-10 hrs/week).\n3. Matching algorithm connecting internal employees with growth opportunities.',
    expectedOutcome: 'Internal company talent marketplace where employees discover internal project gigs, apply with manager approval, and log cross-departmental accomplishments.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Talent Mobility', 'Enterprise HR', 'Skill Development', 'Internal Marketplace'])
  },
  {
    code: 'J8',
    domainCode: 'EP',
    title: 'Veteran & Military Skill Translator to Corporate Careers',
    description: 'Military veterans face high underemployment rates because military occupational specialty (MOS) codes and battlefield leadership are misunderstood by corporate hiring managers. Build an automated military-to-corporate career translator.',
    detailedRequirements: '1. MOS / AFSC / Navy rating code parser translating military roles into standard corporate job titles.\n2. Translation of military leadership and technical responsibilities into corporate resume bullet points.\n3. Curated matching with veteran-friendly corporate employers and mentor networks.',
    expectedOutcome: 'Veteran career portal with MOS code lookup, instant corporate resume bullet generator, and veteran job matching board.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Veterans', 'Career Transition', 'Resume Builder', 'Social Impact'])
  },
  {
    code: 'J9',
    domainCode: 'EP',
    title: 'Worker Micro-Insurance & Income Volatility Buffer for Delivery Riders',
    description: 'Gig delivery workers face financial ruin when sick or injured because they lack paid sick leave and disability safety nets. Build a parametric micro-insurance platform that pays out automatically when bad weather or illness halts work.',
    detailedRequirements: '1. Parametric weather trigger (heavy rainfall / extreme heat) automatically crediting lost wage compensation.\n2. Micro-premium deduction from daily delivery gig earnings (e.g. $0.50/day).\n3. Instant claim payout engine directly to rider digital wallets.',
    expectedOutcome: 'Gig worker insurance portal showing active parametric coverage policies, automated weather trigger payout simulator, and claim payout history.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Micro-Insurance', 'Parametric Insurance', 'Gig Workers', 'InsurTech'])
  },
  {
    code: 'J10',
    domainCode: 'EP',
    title: 'College Alumni Mentorship & Career Shadowing Network',
    description: 'First-generation college students lack the professional networks that wealthy peers take for granted. Build a smart alumni mentorship platform matching current undergraduates with experienced alumni based on shared background and career goals.',
    detailedRequirements: '1. Mentee-mentor matching algorithm weighing career industry, college major, first-generation status, and interests.\n2. Structured 6-week mentorship track with built-in discussion guides and goal check-ins.\n3. In-app messaging and 1-click video call booking.',
    expectedOutcome: 'University mentorship community hub with alumni directory, automated matching wizard, milestone tracking, and student feedback ratings.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Mentorship', 'Alumni Network', 'First-Gen Students', 'Networking'])
  },

  // 11. Government & Public Services (G1 - G10)
  {
    code: 'G1',
    domainCode: 'GV',
    title: 'Public Welfare Benefit Eligibility Screener & Unified Application Portal',
    description: 'Low-income citizens miss out on food stamps, housing vouchers, and healthcare subsidies because each program has separate complicated eligibility rules. Build a single screener that determines eligibility across 15+ welfare programs.',
    detailedRequirements: '1. Plain-language 5-minute household income, family size, and asset questionnaire.\n2. Rules engine mapping household data against federal and state eligibility criteria (SNAP, Medicaid, TANF, WIC, Section 8).\n3. Unified auto-filled application package with document upload checklist.',
    expectedOutcome: 'Citizen-friendly benefits calculator showing all eligible programs with estimated monthly dollar values, and unified application submission assistant.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Welfare Access', 'Public Good', 'Eligibility Rules', 'GovTech'])
  },
  {
    code: 'G2',
    domainCode: 'GV',
    title: 'Municipal Open Budget & Public Spending Transparency Explorer',
    description: 'City budgets contain millions of taxpayer dollars but are published in dense 500-page scanned PDF documents that citizens cannot understand. Build an interactive open-budget explorer that visualizes city revenue and departmental expenditures.',
    detailedRequirements: '1. Interactive Sankey diagram showing tax revenue sources flowing into municipal departments and public projects.\n2. Vendor contract lookup and searchable checkbook registry.\n3. Citizen participatory budgeting voting simulation allowing residents to allocate discretionary municipal funds.',
    expectedOutcome: 'Public transparency portal with interactive budget visualizer, vendor contract search, and citizen participatory budget voting module.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Open Budget', 'Data Visualization', 'GovTech', 'Civic Transparency'])
  },
  {
    code: 'G3',
    domainCode: 'GV',
    title: 'Decentralized Digital Identity & Citizen Document Locker',
    description: 'Citizens lose critical physical documents (birth certificates, vehicle titles, property deeds) during floods or displacements and face bureaucratic nightmares replacing them. Build a secure citizen document locker with cryptographic verification.',
    detailedRequirements: '1. Tamper-evident digital document storage backed by cryptographic hashes.\n2. Verifiable document sharing via time-limited QR codes or zero-knowledge proof of age/residency.\n3. Direct issuance integration for municipal and state agencies.',
    expectedOutcome: 'Citizen digital wallet for official government documents, one-time sharing permission manager, and government agency document verification terminal.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Digital Identity', 'Zero-Knowledge', 'Document Vault', 'Civic Tech'])
  },
  {
    code: 'G4',
    domainCode: 'GV',
    title: 'Automated Legislative Bill Tracker & Plain-Language Summary Generator',
    description: 'Hundreds of legislative bills are introduced in state and national parliaments full of dense legal jargon that citizens and journalists cannot parse. Build a legislative tracking crawler that generates plain-language summaries and tracks bill progress.',
    detailedRequirements: '1. Automated scraper for parliamentary/congressional bill introduction registries.\n2. NLP legal summarization producing an 8th-grade reading level summary of bill impact, proponents, and opponents.\n3. Citizen topic alert subscription (e.g. notify me on education bills) and representative voting record tracker.',
    expectedOutcome: 'Civic legislation tracker displaying active bills, side-by-side legal text vs plain-language summary, and public comment sentiment poll.',
    difficulty: 'Medium',
    tags: JSON.stringify(['NLP', 'GovTech', 'Legislative Tracking', 'Civic Engagement'])
  },
  {
    code: 'G5',
    domainCode: 'GV',
    title: 'Municipal Building Permit Application & Zoning Code Compliance Checker',
    description: 'Small homeowners and architects wait 6 to 12 months for city building permits because plan examiners must manually review drawings against dense zoning bylaws. Build an automated zoning compliance checker for residential blueprints.',
    detailedRequirements: '1. Automated parsing of parcel zoning restrictions (setbacks, height limits, lot coverage ratio, parking requirements).\n2. Upload interface for architectural CAD/PDF plans with automated dimension checks.\n3. Immediate compliance report flagging non-conforming design elements prior to human submission.',
    expectedOutcome: 'Self-service building permit portal where applicants enter property address, upload project dimensions, and receive instant zoning compliance reports.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Zoning Codes', 'CAD/GIS', 'Urban Planning', 'Permit Automation'])
  },
  {
    code: 'G6',
    domainCode: 'GV',
    title: 'Public Freedom of Information (FOI/RTI) Request Management Portal',
    description: 'Citizens filing Freedom of Information requests face lost files, delayed responses, and redaction disputes. Build an end-to-end FOI request portal that streamlines request submission, public disclosure logs, and automatic SLA tracking.',
    detailedRequirements: '1. Citizen request filing wizard with agency routing.\n2. Government agency redaction workspace with automatic PII / SSN redaction suggestions.\n3. Public searchable disclosure repository where previously released records are freely accessible to all.',
    expectedOutcome: 'Public FOI request tracker, agency officer redaction & review workspace, and searchable public disclosure library.',
    difficulty: 'Easy',
    tags: JSON.stringify(['FOIA', 'Public Records', 'Transparency', 'Redaction'])
  },
  {
    code: 'G7',
    domainCode: 'GV',
    title: 'Smart Disaster Reconstruction & Federal Aid Allocation Auditor',
    description: 'Billions in post-disaster reconstruction aid are delayed or misallocated due to fraud and lack of transparent damage verification. Build a transparent disaster grant allocation tracker linking satellite damage assessments to household payouts.',
    detailedRequirements: '1. Geospatial damage tier verification (Destroyed, Major, Minor) linked to property tax parcels.\n2. Household disaster assistance grant application with milestone-based payout stages (Emergency, Temporary Shelter, Rebuilding).\n3. Public dashboard tracking total federal/state relief funds disbursed vs rebuilding progress.',
    expectedOutcome: 'Disaster management agency grant allocation portal, citizen grant tracker, and transparent public recovery scorecard.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Disaster Relief', 'GovTech', 'Grant Management', 'Audit Trail'])
  },
  {
    code: 'G8',
    domainCode: 'GV',
    title: 'Civic Town Hall & Participatory Deliberation Platform',
    description: 'Traditional city council meetings are dominated by loud, unrepresentative special interest groups. Build a structured digital town hall platform that enables representative citizen polling, moderated policy debates, and consensus finding.',
    detailedRequirements: '1. Verified resident voter registration ensuring 1 citizen = 1 voice.\n2. Pol.is-style consensus mapping identifying common ground between opposing political factions.\n3. City council member deliberation dashboard with verified district sentiment analytics.',
    expectedOutcome: 'Interactive civic deliberation forum with consensus clustering visualizer, verified resident polling, and official city council response tracking.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Deliberative Democracy', 'Civic Tech', 'Consensus Finding', 'GovTech'])
  },
  {
    code: 'G9',
    domainCode: 'GV',
    title: 'Court Scheduling & Case Backlog Reduction Orchestrator',
    description: 'Judicial systems in many countries face multi-year case backlogs due to inefficient manual courtroom scheduling and avoidable hearing adjournments. Build an intelligent court case scheduling system.',
    detailedRequirements: '1. Conflict-free scheduling engine harmonizing judge availability, prosecutor/defense calendars, and prisoner transport.\n2. Predictive hearing duration estimator based on case type, witness counts, and historical trial data.\n3. Automated SMS summons and appearance reminders for witnesses and litigants to reduce failure-to-appear rates.',
    expectedOutcome: 'Court clerk master scheduling calendar, courtroom utilization metrics, case progression timeline, and automated litigant notification engine.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Judicial Tech', 'Scheduling Optimization', 'Case Management', 'LegalTech'])
  },
  {
    code: 'G10',
    domainCode: 'GV',
    title: 'Voter Information, Polling Station Locator & Sample Ballot Assistant',
    description: 'Low voter turnout in municipal elections is heavily driven by voter confusion regarding polling locations, registration deadlines, and down-ballot candidates. Build a non-partisan voter assistant platform.',
    detailedRequirements: '1. Polling location finder with live wait-time estimates and accessible transit routes.\n2. Personalized interactive sample ballot generator based on registered voter address.\n3. Non-partisan candidate policy comparison cards with verified candidate debate statements.',
    expectedOutcome: 'Clean mobile-first voter portal with address search, interactive sample ballot that users can print or save, and polling place directions.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Civic Engagement', 'Elections', 'Voter Information', 'Public Good'])
  },

  // 12. Home & Community (HC1 - HC10)
  {
    code: 'HC1',
    domainCode: 'HM',
    title: 'Smart Home Energy Management & Carbon-Aware Appliance Scheduling',
    description: 'Home appliances like water heaters, EV chargers, and dishwashers consume heavy electricity regardless of whether the grid is running on dirty coal or clean solar. Build a home energy controller that schedules heavy loads during clean energy hours.',
    detailedRequirements: '1. Integration with regional grid carbon intensity APIs (e.g. WattTime / Electricity Maps).\n2. Smart plug and appliance scheduling engine postponing non-urgent cycles to lowest-carbon hours.\n3. Household electricity cost and carbon savings analytics.',
    expectedOutcome: 'Home automation dashboard showing live grid carbon intensity, scheduled smart appliance tasks, and monthly kilowatt-hour savings.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Smart Home', 'Energy Efficiency', 'IoT', 'Carbon Reduction'])
  },
  {
    code: 'HC2',
    domainCode: 'HM',
    title: 'Neighborhood Tool Library & Skill-Sharing Cooperative',
    description: 'The average power drill is used for only 13 minutes in its entire lifespan. Build a hyper-local neighborhood cooperative sharing platform where residents borrow tools, lawnmowers, and share DIY home repair skills.',
    detailedRequirements: '1. Community inventory catalog with QR code check-in / check-out.\n2. Security deposit holding and item condition photo verification before and after borrowing.\n3. Skill-swap directory connecting neighbors for plumbing and carpentry help.',
    expectedOutcome: 'Neighborhood community web app with searchable tool catalog, reservation calendar, QR borrowing scanner, and neighbor skill profiles.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Circular Economy', 'Community', 'Sharing Cooperative', 'Sustainability'])
  },
  {
    code: 'HC3',
    domainCode: 'HM',
    title: 'Residential HOA & Tenant Building Management with Maintenance Ticketing',
    description: 'Apartment complexes and residential housing associations suffer from disorganized maintenance requests, missed dues payments, and unaccountable board meetings. Build a modern tenant and property manager portal.',
    detailedRequirements: '1. Tenant maintenance ticket system with photo uploads and technician dispatch tracking.\n2. Automated monthly HOA dues billing and payment reconciliation.\n3. Community announcements, amenity reservation (gym, clubhouse), and democratic voting on building improvements.',
    expectedOutcome: 'Tenant mobile portal with ticket status, dues payment, amenity booking, and property manager operational dashboard.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Property Management', 'Tenant Tech', 'Ticketing', 'Community'])
  },
  {
    code: 'HC4',
    domainCode: 'HM',
    title: 'Hyper-Local Neighborhood Mutual Aid & Senior Assistance Network',
    description: 'Elderly and disabled community members often suffer from social isolation and struggle with basic tasks like grocery shopping, pharmacy pickups, and snow shoveling. Build a verified mutual-aid volunteer coordination network.',
    detailedRequirements: '1. Simple request submission for seniors (groceries, companionship check-in, prescription pickup).\n2. Geofenced volunteer matching connecting nearby background-verified neighbors.\n3. Daily check-in wellness calls with automated escalation if a vulnerable senior fails to respond.',
    expectedOutcome: 'Senior-friendly assistance request interface, volunteer coordination board with mapped requests, and emergency wellness monitor.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Mutual Aid', 'Elderly Care', 'Community', 'Social Impact'])
  },
  {
    code: 'HC5',
    domainCode: 'HM',
    title: 'Decentralized Community Mesh Wi-Fi & Internet Bandwidth Sharing',
    description: 'Millions of low-income apartment dwellers cannot afford $80/month broadband bills while neighboring apartments have unused gigabit fiber. Build a community bandwidth-sharing network with captive portal micro-billing.',
    detailedRequirements: '1. Wi-Fi router bandwidth allocation and guest network isolation logic.\n2. Fair-share bandwidth shaping preventing any single user from hogging speeds.\n3. Micro-payment or mutual credit ledger compensating broadband host households.',
    expectedOutcome: 'Host bandwidth sharing configuration portal, guest onboarding captive portal simulator, and community data usage statistics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Digital Divide', 'Networking', 'Bandwidth Sharing', 'Community Tech'])
  },
  {
    code: 'HC6',
    domainCode: 'HM',
    title: 'Smart Domestic Water Leak Detection & Automatic Shutoff Valve',
    description: 'Undetected plumbing leaks behind walls and running toilets cause billions of dollars in catastrophic water damage and waste thousands of gallons. Build an IoT flow monitoring system that detects micro-leaks and triggers shutoff.',
    detailedRequirements: '1. Ultrasonic water meter pulse ingestion analyzing continuous nighttime flow anomalies.\n2. Machine learning classification distinguishing normal showers from burst pipe flow patterns.\n3. Automated motorized ball valve actuation trigger and immediate homeowner phone alert.',
    expectedOutcome: 'Homeowner water consumption dashboard with real-time flow graphs, anomaly alert indicators, and manual/automated remote valve shutoff switch.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Smart Plumbing', 'Water Conservation', 'IoT', 'Home Security'])
  },
  {
    code: 'HC7',
    domainCode: 'HM',
    title: 'Community Compost & Organic Waste Circular Exchange',
    description: 'Organic kitchen waste rotting in landfills produces methane, a potent greenhouse gas, while community gardeners buy expensive chemical fertilizers. Build an organic waste exchange connecting households with urban compost hubs.',
    detailedRequirements: '1. Neighborhood drop-off compost bin location mapping with fill capacity indicators.\n2. Citizen organic waste deposit logging with rewarded "soil credits".\n3. Community garden distribution ledger allowing members to redeem soil credits for cured organic compost.',
    expectedOutcome: 'Citizen compost tracker with QR drop-off logging, community soil credits balance, and compost hub operator inventory manager.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Composting', 'Zero Waste', 'Circular Economy', 'Community Gardens'])
  },
  {
    code: 'HC8',
    domainCode: 'HM',
    title: 'Neighborhood Noise Mediation & Quiet Hours Decibel Logging',
    description: 'Barking dogs, late-night music, and leaf blowers cause bitter neighbor disputes that often escalate into police calls. Build an objective community decibel logging and anonymous mediation platform.',
    detailedRequirements: '1. Calibrated smartphone/Raspberry Pi acoustic dB logger with timestamped noise floor recordings.\n2. Anonymous friendly alert notification to neighboring address before calling authorities.\n3. Community agreement quiet-hours charter with peer mediation appointment booking.',
    expectedOutcome: 'Objective noise log timeline, anonymous neighbor friendly message sender, and community dispute resolution workspace.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Community Harmony', 'Civic Tech', 'Acoustics', 'Mediation'])
  },
  {
    code: 'HC9',
    domainCode: 'HM',
    title: 'Smart Residential Indoor Air Quality (IAQ) & Ventilation Controller',
    description: 'Indoor air pollution (CO2 buildup, cooking VOCs, radon) is often 2 to 5 times worse than outdoor air, impairing sleep and cognitive function. Build a smart home air quality management system.',
    detailedRequirements: '1. Telemetry ingestion for CO2, PM2.5, VOCs, temperature, and relative humidity.\n2. Automated control logic triggering fresh air HRV/ERV dampers and kitchen exhaust fans.\n3. Sleep quality correlation tracking indoor air quality against sleep duration.',
    expectedOutcome: 'Indoor air quality dashboard showing room-by-room sensor readings, automated ventilation trigger logs, and sleep environment health ratings.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Indoor Air Quality', 'HealthTech', 'Smart Home', 'HVAC'])
  },
  {
    code: 'HC10',
    domainCode: 'HM',
    title: 'Community Disaster Preparedness & Block Captain Emergency Plan',
    description: 'During severe storms and extended power outages, neighbors are the true first responders, yet most neighborhoods lack an organized emergency plan. Build a residential block emergency preparedness mapper.',
    detailedRequirements: '1. Voluntary neighborhood asset registry (generators, medical skills, chainsaws, four-wheel drive vehicles).\n2. Vulnerability registry mapping residents requiring medical oxygen, dialysis, or mobility assistance.\n3. Offline-printable block emergency response map and communication tree.',
    expectedOutcome: 'Neighborhood block captain disaster hub with asset/need mapping, volunteer team assignment, and one-click printable emergency action sheets.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Disaster Prep', 'Community Resilience', 'Emergency Response', 'Mapping'])
  },

  // 13. Food & Nutrition (FN1 - FN10)
  {
    code: 'FN1',
    domainCode: 'FD',
    title: 'AI Smart Kitchen Pantry & Anti-Food-Waste Recipe Generator',
    description: 'Households throw away over 30% of groceries because ingredients expire before use. Build an intelligent pantry tracker that monitors grocery shelf life and generates delicious recipes using whatever ingredients are expiring soonest.',
    detailedRequirements: '1. Receipt OCR and barcode scanning to auto-populate virtual kitchen pantry with estimated shelf-lives.\n2. Recipe generation algorithm prioritizing items within 48 hours of expiration.\n3. Automatic shopping list generation replenishing staple items only when depleted.',
    expectedOutcome: 'Pantry inventory screen with color-coded freshness countdowns, "Cook Now" recipe suggestions based strictly on current ingredients, and food waste reduction stats.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Food Waste', 'Recipe AI', 'Computer Vision', 'Sustainability'])
  },
  {
    code: 'FN2',
    domainCode: 'FD',
    title: 'Restaurant Surplus Food Rescue & Geofenced Flash Discount App',
    description: 'Bakeries and restaurants discard fresh gourmet food at closing time every single night. Build a dynamic surplus food rescue marketplace where businesses sell surprise bags of unsold meals at 70% off.',
    detailedRequirements: '1. Restaurant surplus meal listing with pickup time windows (e.g. 9:00 PM - 9:30 PM).\n2. Real-time consumer reservations with digital pickup redemption voucher.\n3. Environmental impact calculator tracking meals saved and kilograms of CO2 avoided.',
    expectedOutcome: 'Merchant listing dashboard, customer marketplace app with nearby surplus deals on a map, and instant QR voucher redemption.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Food Rescue', 'Surplus Food', 'Marketplace', 'Sustainability'])
  },
  {
    code: 'FN3',
    domainCode: 'FD',
    title: 'Personalized Clinical Nutrition & Chronic Disease Meal Planner',
    description: 'Patients managing diabetes, chronic kidney disease (CKD), and hypertension struggle to navigate complex nutritional restrictions. Build a clinically validated nutrition coach that creates personalized meal plans satisfying strict micronutrient constraints.',
    detailedRequirements: '1. Nutritional constraint engine enforcing medical limits (e.g. Sodium <1500mg, Potassium <2000mg for CKD, Carbohydrate counting for Type-1 diabetes).\n2. Cultural cuisine adaptation allowing diverse global dishes that comply with medical dietary limits.\n3. Continuous glucose monitor (CGM) or lab bloodwork trend correlation.',
    expectedOutcome: 'Patient meal planning dashboard with micronutrient progress bars, curated medical recipe database, and exportable dietitian dietary diary.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Clinical Nutrition', 'Chronic Disease', 'Dietary Algorithms', 'HealthTech'])
  },
  {
    code: 'FN4',
    domainCode: 'FD',
    title: 'Food Allergen Cross-Contamination & Menu Optical Recognition Scanner',
    description: 'Individuals with severe food allergies (peanuts, shellfish, gluten) face life-threatening anaphylaxis when dining out due to hidden allergens and confusing menus. Build an optical menu scanner that highlights allergens and checks cross-contamination risks.',
    detailedRequirements: '1. OCR menu text scanner with multilingual translation.\n2. Allergen knowledge base cross-referencing culinary ingredients with standard allergen classifications.\n3. Digital chef allergy alert card generator in foreign languages for safe international travel.',
    expectedOutcome: 'Smartphone camera menu scanner highlighting dangerous dishes in red with specific allergen flags, and multi-language restaurant chef alert cards.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Allergy Safety', 'OCR', 'Food Tech', 'Mobile Health'])
  },
  {
    code: 'FN5',
    domainCode: 'FD',
    title: 'Institutional School Lunch Nutrition & Food Sourcing Optimizer',
    description: 'Public school districts operate on tight budgets of $1.50 per meal while trying to meet federal nutritional guidelines and incorporate fresh local produce. Build a linear programming menu optimizer for school cafeterias.',
    detailedRequirements: '1. Mixed-Integer Linear Programming (MILP) solver optimizing meal cost subject to USDA school nutrition guidelines (calories, sodium, whole grains, vegetables).\n2. Local farm produce availability schedule integration.\n3. Student taste preference ratings minimizing cafeteria tray waste.',
    expectedOutcome: 'Cafeteria director menu planning console with automated weekly menu generation, nutritional compliance scorecard, and wholesale food purchase orders.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Optimization', 'Linear Programming', 'Child Nutrition', 'School Cafeteria'])
  },
  {
    code: 'FN6',
    domainCode: 'FD',
    title: 'Blockchain-Based Farm-to-Fork Organic & Halal/Kosher Traceability',
    description: 'Consumers pay premium prices for organic, fair-trade, or religious dietary certifications that are frequently counterfeited. Build an immutable supply chain provenance ledger tracking livestock and produce batches from origin farm to grocery shelf.',
    detailedRequirements: '1. Batch origin registration with GPS coordinates, certification upload, and batch ID generation.\n2. Intermediate processing node sign-offs (slaughterhouse, packaging plant, cold storage distributor).\n3. Consumer QR code lookup displaying the complete immutable chain of custody with inspection certificates.',
    expectedOutcome: 'Supply chain checkpoint logging portal and consumer product passport page displaying interactive journey map and verified inspection stamps.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Provenance', 'Food Authenticity', 'Traceability', 'QR Codes'])
  },
  {
    code: 'FN7',
    domainCode: 'FD',
    title: 'Precision Hydroponics & Vertical Farming Nutrient Dosing Controller',
    description: 'Urban vertical indoor farms fail commercially when manual nutrient balancing causes crop failure or excessive energy consumption. Build an automated hydroponic dosing suite monitoring EC, pH, and water temperature.',
    detailedRequirements: '1. Telemetry ingestion from electrical conductivity (EC), pH, and water temperature probes.\n2. Automated PID dosing controller logic dispensing acid/base and nutrient A/B solutions.\n3. Light photoperiod and PPFD LED dimmer scheduler synchronized with crop growth stages.',
    expectedOutcome: 'Vertical farm telemetry dashboard showing live sensor dials, automated pump actuation logs, and crop harvest yield forecast.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Hydroponics', 'Vertical Farming', 'IoT Control', 'AgTech'])
  },
  {
    code: 'FN8',
    domainCode: 'FD',
    title: 'Community Food Bank Inventory & Fresh Produce Redistribution Network',
    description: 'Food banks frequently receive massive donations of perishable produce that rots before distribution, while neighboring pantries have empty shelves. Build an inter-food-bank inventory balancing and volunteer distribution platform.',
    detailedRequirements: '1. Real-time food pantry inventory tracking by expiration urgency and food category.\n2. Inter-pantry transfer matching algorithm redistributing surplus perishables before spoilage.\n3. Volunteer driver dispatch coordinating timely pickups and drop-offs.',
    expectedOutcome: 'Regional food bank coordinator dashboard showing inventory levels across 20+ pantries, automated transfer proposals, and volunteer driver routes.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Food Security', 'Logistics', 'Volunteer Management', 'Social Impact'])
  },
  {
    code: 'FN9',
    domainCode: 'FD',
    title: 'Microbiome Gut Health & Dietary Fiber Tracking Companion',
    description: 'Modern processed diets starve beneficial gut microbiota, contributing to systemic inflammation and autoimmune diseases. Build a gut-health companion app that tracks dietary diversity across 30+ diverse plant foods weekly.',
    detailedRequirements: '1. "30 Plants a Week" food diversity tracker categorizing fruits, vegetables, grains, legumes, nuts, and herbs.\n2. Microbiome diversity scoring algorithm based on prebiotic fiber and polyphenol intake.\n3. Daily stool and digestive symptom tracker identifying individual trigger foods.',
    expectedOutcome: 'Consumer wellness tracker displaying plant diversity circle progress, prebiotic fiber metrics, and digestive symptom correlation insights.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Microbiome', 'Nutrition', 'Gut Health', 'Wellness'])
  },
  {
    code: 'FN10',
    domainCode: 'FD',
    title: 'Emergency Food Rations & Disaster Relief Supply Chain Tracker',
    description: 'Following natural disasters, emergency food ration deliveries become bottlenecks, leading to riots and inequitable distribution among displaced families. Build an emergency humanitarian food distribution management system.',
    detailedRequirements: '1. Disaster survivor registration and family nutritional calorie requirement calculation.\n2. Relief camp food ration inventory and caloric reserve depletion countdown.\n3. Biometric / QR code ration card distribution tracking preventing double-claiming and ensuring fair access.',
    expectedOutcome: 'Humanitarian coordinator relief dashboard showing camp calorie reserves, daily ration kit distribution numbers, and logistical resupply alerts.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Disaster Relief', 'Humanitarian Aid', 'Food Logistics', 'Public Good'])
  },

  // 14. Mental Wellness & Social Wellbeing (MW1 - MW10)
  {
    code: 'MW1',
    domainCode: 'MW',
    title: 'Crisis Hot-Line AI Triage & De-escalation Dispatcher',
    description: 'Mental health crisis hotlines experience severe caller surges during late nights, leaving high-risk individuals on hold with fatal consequences. Build an intelligent triage assistant that detects acute suicidal ideation and prioritizes human counselor routing.',
    detailedRequirements: '1. High-accuracy NLP sentiment and self-harm risk classification on incoming chat/call transcripts.\n2. Real-time de-escalation suggestion prompts for counselors during active crises.\n3. Seamless emergency services geolocated dispatch escalation for imminent lethal threats.',
    expectedOutcome: 'Crisis center supervisor queue with color-coded risk urgency ranking, active counselor assist sidebar, and rapid emergency intervention triggers.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Mental Health', 'Crisis Intervention', 'NLP', 'Safety Critical'])
  },
  {
    code: 'MW2',
    domainCode: 'MW',
    title: 'Cognitive Behavioral Therapy (CBT) Thought Journal & Cognitive Distortion Detector',
    description: 'Patients between therapy sessions struggle to practice cognitive reframing on their own when experiencing catastrophic thoughts. Build a guided digital CBT journal that automatically identifies cognitive distortions (all-or-nothing, catastrophizing, mind reading).',
    detailedRequirements: '1. Guided ABC (Activating event, Belief, Consequence) thought recording workflow.\n2. NLP classifier detecting 10 common cognitive distortions in user journal entries.\n3. Socratic questioning prompts guiding the user to formulate rational alternative beliefs.',
    expectedOutcome: 'Interactive thought record journal, automatic distortion badge highlights, cognitive reframing guided exercise, and therapist progress summary report.',
    difficulty: 'Medium',
    tags: JSON.stringify(['CBT', 'Psychology', 'NLP', 'Self-Help'])
  },
  {
    code: 'MW3',
    domainCode: 'MW',
    title: 'Anonymous Peer Mental Health Support Circles with Trained Moderation',
    description: 'Stigma prevents millions of people from seeking professional therapy, yet unmoderated internet forums can become toxic echo chambers. Build a structured, anonymous audio/text peer support platform moderated by certified peer specialists.',
    detailedRequirements: '1. Pseudonymous topic-based support circles (Grief, Anxiety, Caregiver Burnout, Chronic Illness).\n2. Real-time toxic speech and harassment filter muting abusive participants instantly.\n3. Trained peer facilitator toolkit with structured discussion icebreakers and grounding exercises.',
    expectedOutcome: 'Support circle audio/chat room interface, participant anonymous avatar customizer, and moderator supervision dashboard.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Peer Support', 'Mental Wellness', 'Content Moderation', 'Community'])
  },
  {
    code: 'MW4',
    domainCode: 'MW',
    title: 'Biofeedback Heart Rate Variability (HRV) Stress Reduction & Breath Pacer',
    description: 'Acute panic attacks and autonomic nervous system dysregulation can be mitigated through resonant frequency paced breathing. Build a web camera photoplethysmography (PPG) pulse sensor with interactive resonant breathing biofeedback.',
    detailedRequirements: '1. Contactless facial blood volume pulse detection (remote PPG) via standard webcam video feed.\n2. Real-time Heart Rate Variability (RMSSD) computation and autonomic stress score.\n3. Dynamic resonant breath pacer visualizer that synchronizes inhale/exhale timing with user HRV resonance.',
    expectedOutcome: 'Interactive biofeedback relaxation studio with live webcam PPG pulse tracker, soothing visual breathing orb, and pre/post stress score comparison.',
    difficulty: 'Hard',
    tags: JSON.stringify(['rPPG', 'Biofeedback', 'HRV', 'Computer Vision'])
  },
  {
    code: 'MW5',
    domainCode: 'MW',
    title: 'Postpartum Depression Screening & New Mother Community Support Network',
    description: 'Up to 20% of new mothers suffer from Postpartum Depression (PPD) and anxiety, often suffering in silence due to guilt and social stigma. Build a proactive PPD screening companion that integrates the Edinburgh Postnatal Depression Scale (EPDS).',
    detailedRequirements: '1. Longitudinal EPDS questionnaire with automated risk scoring and symptom tracking.\n2. Local new-mother buddy matching connecting mothers with infants of similar age.\n3. Teletherapy consultation scheduling with specialized perinatal mental health clinicians.',
    expectedOutcome: 'New mother wellness app with monthly EPDS screening graph, local mama support circle connections, and 1-click clinical escalation.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Maternal Health', 'PPD', 'Screening', 'Women Health'])
  },
  {
    code: 'MW6',
    domainCode: 'MW',
    title: 'Digital Wellness & Social Media Screen-Time Habit Architecture',
    description: 'Addictive algorithmic social media feeds manipulate dopamine loops, leading to severe teenage depression and focus fragmentation. Build a digital wellness extension that introduces deliberate friction into infinite-scroll apps.',
    detailedRequirements: '1. Detection of mindless infinite scrolling on social media sites.\n2. Intentional friction interventions (10-second reflection pause, breath prompt, grayscale mode toggle).\n3. Daily intentional vs compulsive screen time analytics and mindfulness streaks.',
    expectedOutcome: 'Digital wellness browser extension / web dashboard showing compulsive usage triggers, mindfulness reflection logs, and habit improvement badges.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Digital Wellbeing', 'Habit Change', 'Mindfulness', 'UX Psychology'])
  },
  {
    code: 'MW7',
    domainCode: 'MW',
    title: 'Grief & Bereavement Digital Memorial & Processing Sanctuary',
    description: 'Bereavement after losing a loved one is an overwhelming, isolating process with few tailored digital spaces that respect solemn remembrance. Build a digital memorial sanctuary where families preserve memories, audio stories, and celebrate anniversaries.',
    detailedRequirements: '1. Multi-generational collaborative memorial timeline (photos, voice recordings, personal stories).\n2. Grief milestone support calendar sending gentle comforting check-ins on difficult anniversaries.\n3. Curated bereavement support literature and local grief counselor directory.',
    expectedOutcome: 'Solemn, beautifully designed digital memorial book, collaborative story submission portal, and bereavement anniversary reminder engine.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Bereavement', 'Digital Memorial', 'Emotional Wellbeing', 'Family Tech'])
  },
  {
    code: 'MW8',
    domainCode: 'MW',
    title: 'Workplace Psychological Safety & Anonymous Team Culture Diagnostic',
    description: 'Employees withhold critical safety and strategic insights when their work environment lacks psychological safety. Build an anonymous psychological safety assessment platform based on Amy Edmondson’s research framework.',
    detailedRequirements: '1. Amy Edmondson 7-item Psychological Safety questionnaire with strict cryptographic anonymization.\n2. Team-level aggregated safety heatmaps identifying blame culture vs growth mindset.\n3. Actionable executive leadership playbook with guided workshop exercises to rebuild team trust.',
    expectedOutcome: 'Anonymous employee assessment submission portal, team psychological safety benchmark dashboard, and leadership intervention guide.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Psychological Safety', 'Org Behavior', 'Anonymized Surveys', 'Workplace'])
  },
  {
    code: 'MW9',
    domainCode: 'MW',
    title: 'Neurofeedback Guided Sleep Architecture & Circadian Entrainment Coach',
    description: 'Chronic insomnia fuels clinical depression and cognitive decline. Build a circadian rhythm optimization coach that creates personalized light exposure and bedtime wind-down protocols based on chronotype.',
    detailedRequirements: '1. Munich Chronotype Questionnaire (MCTQ) assessment calculating biological sleep mid-point.\n2. Personalized daily sunlight exposure and blue-light restriction schedule.\n3. Bedtime sleep hygiene audio soundscape generator featuring binaural beats and sleep-onset stories.',
    expectedOutcome: 'Personalized circadian schedule clock, dynamic light exposure checklist, and interactive binaural sleep audio player.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Circadian Rhythm', 'Sleep Tech', 'Binaural Audio', 'Chronobiology'])
  },
  {
    code: 'MW10',
    domainCode: 'MW',
    title: 'Veterans PTSD & Trauma Grounding Companion with Emergency Panic Mode',
    description: 'Combat veterans experiencing severe PTSD flashbacks require immediate sensory grounding techniques to pull out of fight-or-flight loops. Build an emergency trauma grounding companion with haptic 5-4-3-2-1 sensory exercises.',
    detailedRequirements: '1. 1-Tap Emergency Panic Mode launching immediate sensory grounding protocol (5 things you see, 4 you feel, 3 hear, 2 smell, 1 taste).\n2. Gentle haptic rhythmic pulses guiding the user back to somatic awareness.\n3. Quick-dial link to Veterans Crisis Line and pre-designated trusted battle buddies.',
    expectedOutcome: 'High-contrast, distraction-free panic grounding screen, step-by-step 5-4-3-2-1 sensory prompts, and one-tap emergency buddy notification.',
    difficulty: 'Easy',
    tags: JSON.stringify(['PTSD', 'Trauma Support', 'Grounding Techniques', 'Veterans'])
  },

  // 15. Cybersecurity & Digital Safety (CS1 - CS10)
  {
    code: 'CS1',
    domainCode: 'CS',
    title: 'Zero-Trust API Gateway & Automated Credential Leak Detector',
    description: 'Developers constantly commit sensitive API keys, database credentials, and private SSH keys into public GitHub repositories. Build an automated code scanner and zero-trust gateway that revokes leaked credentials instantly.',
    detailedRequirements: '1. Git pre-commit hook and repository scanner detecting high-entropy strings and known API key patterns (AWS, Stripe, OpenAI, JWT).\n2. Automated secret revocation API webhook notifying the issuing service to invalidate compromised keys.\n3. Developer alert dashboard with severity score and remediation git-filter instructions.',
    expectedOutcome: 'Security scanning console showing detected secrets across scanned repositories, automated revocation webhooks, and developer remediation guide.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Secret Scanning', 'Zero Trust', 'DevSecOps', 'Static Analysis'])
  },
  {
    code: 'CS2',
    domainCode: 'CS',
    title: 'AI Phishing Email Detection & Brand Impersonation Visual Analyzer',
    description: 'Sophisticated spear-phishing attacks evade traditional spam filters by spoofing corporate login pages and sender domains. Build an advanced anti-phishing defense tool that analyzes both email headers and embedded login URLs.',
    detailedRequirements: '1. Email header DKIM/SPF/DMARC alignment verification and lookalike homoglyph domain detector.\n2. Headless browser screenshot renderer comparing login page visual similarity against top 50 impersonated brands (Microsoft, Google, PayPal).\n3. Interactive employee phishing report button with automated security operations center (SOC) triage.',
    expectedOutcome: 'Email security inspection tool showing header validation, visual brand similarity score, URL risk classification, and automated quarantine action.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Phishing Defense', 'Computer Vision', 'Email Security', 'SOC Automation'])
  },
  {
    code: 'CS3',
    domainCode: 'CS',
    title: 'Decentralized Passwordless FIDO2 / WebAuthn Authentication Server',
    description: 'Passwords remain the #1 vector for data breaches due to credential stuffing and phishing attacks. Build a modern passwordless authentication service using WebAuthn / Passkeys backed by device biometrics.',
    detailedRequirements: '1. Complete FIDO2 WebAuthn registration and authentication ceremony implementation.\n2. Support for hardware security keys (YubiKey), TouchID, FaceID, and Windows Hello.\n3. Cryptographic challenge-response verification against server-side public key registry.',
    expectedOutcome: 'Working passwordless login demonstration, user authenticator device management screen, and cryptographic authentication audit log.',
    difficulty: 'Medium',
    tags: JSON.stringify(['WebAuthn', 'Passkeys', 'FIDO2', 'Cryptography'])
  },
  {
    code: 'CS4',
    domainCode: 'CS',
    title: 'Real-Time Network Intrusion Detection & Port Scan Behavioral Anomaly Hunter',
    description: 'Network perimeter breaches often go unnoticed for months while attackers perform reconnaissance and lateral movement. Build an intrusion detection pipeline that monitors packet logs and flags port scanning and beaconing.',
    detailedRequirements: '1. Packet PCAP and NetFlow log ingestion pipeline.\n2. Anomaly detection identifying SYN stealth scans, DNS tunneling, and periodic C2 server beaconing.\n3. Automated IP firewall rule generation (iptables / cloud security group) isolating compromised hosts.',
    expectedOutcome: 'SOC analyst command center showing live network traffic graph, active attack alert feed, packet inspector modal, and automated blocklist generator.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Network Security', 'Intrusion Detection', 'Threat Hunting', 'Firewall'])
  },
  {
    code: 'CS5',
    domainCode: 'CS',
    title: 'Client-Side Web Application Firewall (WAF) & XSS / Injection Shield',
    description: 'Third-party JavaScript libraries and malicious CDN compromises expose web apps to Cross-Site Scripting (XSS) and Magecart card-skimming attacks. Build a client-side tamper detection and runtime script isolation shield.',
    detailedRequirements: '1. Runtime DOM mutation observer detecting injected malicious script tags and form hijacking.\n2. Strict Content Security Policy (CSP) dynamic violation logger and policy generator.\n3. Tamper-proof keystroke protection securing credit card input fields against third-party script scraping.',
    expectedOutcome: 'Web security monitoring dashboard showing real-time CSP violations, injected script alerts, and automatic defensive sandboxing rules.',
    difficulty: 'Medium',
    tags: JSON.stringify(['AppSec', 'WAF', 'XSS Defense', 'Magecart Prevention'])
  },
  {
    code: 'CS6',
    domainCode: 'CS',
    title: 'Privacy-Preserving Federated Learning & Differential Privacy Studio',
    description: 'Machine learning models trained on sensitive healthcare or financial data risk memorizing and leaking private user records. Build a federated learning simulator where models train locally on client devices with differential privacy noise.',
    detailedRequirements: '1. Federated Averaging (FedAvg) algorithm aggregating local client model weights without sending raw data to the central server.\n2. Differential Privacy Laplacian/Gaussian noise injection bounding epsilon privacy loss.\n3. Privacy budget tracking dashboard demonstrating model accuracy vs privacy guarantee tradeoffs.',
    expectedOutcome: 'Interactive machine learning simulator demonstrating distributed training across simulated nodes, epsilon privacy consumption curves, and model evaluation metrics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Federated Learning', 'Differential Privacy', 'Privacy Tech', 'Machine Learning'])
  },
  {
    code: 'CS7',
    domainCode: 'CS',
    title: 'Automated Software Bill of Materials (SBOM) & Vulnerability Dependency Tracker',
    description: 'Open-source software supply chain vulnerabilities like Log4j and malicious npm packages threaten modern software ecosystems. Build an automated SBOM generator and continuous vulnerability tracker.',
    detailedRequirements: '1. Package lockfile parser (package-lock.json, pom.xml, requirements.txt) generating CycloneDX / SPDX standard SBOMs.\n2. Real-time correlation with National Vulnerability Database (NVD) CVE records.\n3. Automated dependency upgrade Pull Request generator for critical zero-day vulnerabilities.',
    expectedOutcome: 'Security dashboard displaying interactive dependency tree, critical CVE alert badges with CVSS severity scores, and automated patch recommendations.',
    difficulty: 'Medium',
    tags: JSON.stringify(['SBOM', 'Supply Chain Security', 'CVE', 'DevSecOps'])
  },
  {
    code: 'CS8',
    domainCode: 'CS',
    title: 'Ransomware Canary File Decoy & Early Cryptographic Shield',
    description: 'Ransomware encrypts hundreds of gigabytes before endpoint antivirus detects the threat. Build an early-warning ransomware tripwire system that places hidden canary files across directories and halts suspicious encryption processes.',
    detailedRequirements: '1. Placement of hidden decoy/canary files with real-time file system write/modify watchers.\n2. Rapid Shannon entropy calculation on modified files detecting sudden spikes characteristic of AES encryption.\n3. Instant process suspension and automated network interface isolation.',
    expectedOutcome: 'Endpoint defense agent dashboard displaying active canary traps, real-time file entropy graphs, and rapid process kill event logs.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Ransomware', 'Endpoint Security', 'Canary Files', 'Entropy Analysis'])
  },
  {
    code: 'CS9',
    domainCode: 'CS',
    title: 'Simulated Employee Phishing Awareness & Cyber Training Platform',
    description: 'Employees are the primary attack vector for enterprise breaches, but annual boring slide-deck training fails to change behavior. Build an automated phishing simulation campaign manager with tailored instant learning modules.',
    detailedRequirements: '1. Phishing email template studio with customizable scenarios (Fake IT password reset, CEO gift card, urgent invoice).\n2. Automated campaign scheduler tracking email open rates, link clicks, and credential submissions.\n3. Instant positive reinforcement learning landing page triggered when an employee clicks a simulated phishing link.',
    expectedOutcome: 'Security administrator campaign manager with click-rate analytics by department, template editor, and employee training compliance scorecard.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Phishing Simulation', 'Security Awareness', 'Social Engineering', 'Enterprise Security'])
  },
  {
    code: 'CS10',
    domainCode: 'CS',
    title: 'Decentralized Encrypted P2P Secret Sharing & Dead Man Switch',
    description: 'Individuals holding critical passwords, cryptocurrency private keys, or legal documents have no secure way to pass access to heirs if something happens to them. Build a cryptographic Shamir’s Secret Sharing vault with dead man’s switch timers.',
    detailedRequirements: '1. Shamir’s Secret Sharing algorithm splitting a master secret into N shares with K threshold required for reconstruction.\n2. Automated periodic proof-of-life email check-in ping with configurable countdown timer.\n3. Encrypted share distribution to designated trustees upon confirmed inactivity.',
    expectedOutcome: 'User secret encryption setup wizard, trustee contact management, proof-of-life heartbeat check-in button, and emergency share recovery workflow.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Cryptography', 'Shamir Secret Sharing', 'Dead Man Switch', 'Data Privacy'])
  },

  // 16. Smart Automation (SA1 - SA10)
  {
    code: 'SA1',
    domainCode: 'SA',
    title: 'Autonomous Document Processing & Invoice Extraction RPA Agent',
    description: 'Back-office accounting clerks waste thousands of hours manually copying numbers from diverse PDF vendor invoices into ERP systems. Build an intelligent Robotic Process Automation (RPA) agent that parses unstructured invoices with zero templates.',
    detailedRequirements: '1. Multi-page PDF text and table extraction using vision and layout analysis.\n2. Key-value field extraction (Vendor Name, Invoice #, PO #, Line Items, Subtotal, Tax, Total).\n3. Automated validation checking that line item amounts sum up to invoice subtotal, with ERP export.',
    expectedOutcome: 'Invoice dropzone portal with side-by-side PDF preview and extracted structured JSON/table fields, automated math verification, and one-click CSV export.',
    difficulty: 'Medium',
    tags: JSON.stringify(['RPA', 'Document AI', 'Invoice Processing', 'OCR'])
  },
  {
    code: 'SA2',
    domainCode: 'SA',
    title: 'Industrial Manufacturing Defect Computer Vision Inspection Conveyor',
    description: 'Human visual inspection on high-speed factory assembly lines suffers from fatigue, missing microscopic surface cracks, paint scratches, and soldering defects. Build a computer vision inspection station for conveyor belt items.',
    detailedRequirements: '1. Real-time image processing classifying parts as Pass / Fail based on surface anomalies, dents, and cracks.\n2. Defect localization bounding box and anomaly segmentation heatmaps.\n3. Production line throughput analytics tracking yield rate, defect distribution, and automated pneumatic sorter ejection trigger.',
    expectedOutcome: 'Factory quality control dashboard displaying live conveyor camera feed, real-time defect bounding boxes, Pass/Fail counters, and defect Pareto chart.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Computer Vision', 'Quality Control', 'Manufacturing', 'Defect Detection'])
  },
  {
    code: 'SA3',
    domainCode: 'SA',
    title: 'No-Code Workflow Automation & Multi-App Trigger Builder',
    description: 'Business users need to automate repetitive workflows between SaaS apps without writing custom API code. Build an intuitive drag-and-drop workflow canvas connecting Webhooks, conditional branching, and API actions.',
    detailedRequirements: '1. Visual node-based workflow builder (Trigger -> Filter / Condition -> Action).\n2. Real-time execution engine evaluating incoming webhook payloads and stepping through connected nodes.\n3. Detailed execution history log with step-by-step inputs, outputs, and retry logic.',
    expectedOutcome: 'Interactive visual workflow canvas with draggable trigger and action nodes, live test payload runner, and execution audit history.',
    difficulty: 'Hard',
    tags: JSON.stringify(['No-Code', 'Workflow Automation', 'iPaaS', 'Canvas'])
  },
  {
    code: 'SA4',
    domainCode: 'SA',
    title: 'Smart HVAC Digital Twin & Commercial Building Energy Optimization',
    description: 'Commercial office buildings over-condition air in unoccupied conference rooms and run chillers at full blast during peak demand. Build an IoT digital twin that models building thermal dynamics and modulates dampers dynamically.',
    detailedRequirements: '1. Room-by-room temperature, CO2, and occupancy sensor telemetry.\n2. Thermal physics modeling calculating solar heat gain and thermal mass retention.\n3. Automated Variable Air Volume (VAV) damper and chiller setpoint control minimizing kilowatt consumption.',
    expectedOutcome: 'Interactive 2.5D building floorplan digital twin with color-coded temperature zones, active VAV damper actuators, and cumulative energy cost savings.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Digital Twin', 'Building Automation', 'Energy Efficiency', 'HVAC'])
  },
  {
    code: 'SA5',
    domainCode: 'SA',
    title: 'Autonomous Mobile Robot (AMR) Warehouse Fleet Navigation Simulator',
    description: 'E-commerce fulfillment centers rely on hundreds of autonomous warehouse robots that must navigate dense aisles without colliding or causing deadlocks. Build a multi-robot path planning simulator using Multi-Agent Pathfinding (MAPF).',
    detailedRequirements: '1. 2D grid warehouse simulation with storage racks, picking stations, and multiple AMRs.\n2. Conflict-Based Search (CBS) or Time-Space A* pathfinding algorithm preventing collisions and deadlocks.\n3. Dynamic order dispatch assigning nearest available AMR to pick storage pods.',
    expectedOutcome: 'Animated 2D warehouse floor simulation showing moving robot fleets, picking order completion statistics, and zero-collision path metrics.',
    difficulty: 'Hard',
    tags: JSON.stringify(['Robotics', 'Pathfinding', 'A*', 'Warehouse Automation'])
  },
  {
    code: 'SA6',
    domainCode: 'SA',
    title: 'Automated IT Incident Remediation & Self-Healing Cloud Infrastructure',
    description: 'On-call Site Reliability Engineers (SREs) are woken up at 3 AM for predictable, routine server errors like disk space exhaustion and memory leaks. Build a self-healing automation engine that executes verified runbooks automatically.',
    detailedRequirements: '1. Alert webhook ingestion from Prometheus / Datadog (e.g. DiskSpaceHigh, MemoryLeak, PodCrashLoop).\n2. Automated runbook execution engine (e.g. prune docker logs, resize EBS volume, restart worker pool).\n3. Safety circuit breaker preventing runaway restart loops, with Slack incident report dispatch.',
    expectedOutcome: 'SRE operations dashboard showing active incident triggers, automated runbook execution progress logs, and system health status recovery.',
    difficulty: 'Medium',
    tags: JSON.stringify(['SRE', 'Self-Healing', 'Cloud Automation', 'DevOps'])
  },
  {
    code: 'SA7',
    domainCode: 'SA',
    title: 'Automated Cold Email Personalization & Outreach Sales Agent',
    description: 'Outbound sales teams send blast spam that gets flagged, while manual research takes 20 minutes per prospect. Build an intelligent research agent that scans a company’s website and generates hyper-personalized value proposition emails.',
    detailedRequirements: '1. Company website scraper extracting value propositions, recent news, and product offerings.\n2. Dynamic cold email generator tailoring problem-solution hooks specifically to the prospect company’s business model.\n3. Automated email deliverability validation checking SPF/DKIM and mailbox warmup score.',
    expectedOutcome: 'Prospect input dashboard, automated website intelligence extraction report, and customized multi-stage cold outreach sequence editor.',
    difficulty: 'Easy',
    tags: JSON.stringify(['Sales Automation', 'Web Scraping', 'NLP', 'Cold Outreach'])
  },
  {
    code: 'SA8',
    domainCode: 'SA',
    title: 'Legal Contract Review & Clause Risk Highlighting RPA Agent',
    description: 'Procurement teams spend days reviewing 50-page Non-Disclosure Agreements (NDAs) and Master Service Agreements (MSAs) for unfavorable clauses. Build an automated contract analyzer that highlights high-risk terms against company playbooks.',
    detailedRequirements: '1. Document text parser for Word (.docx) and PDF contracts.\n2. Clause extraction and categorization (Indemnification, Limitation of Liability, Governing Law, Non-Compete, Termination).\n3. Risk scoring against company legal playbook with recommended redline fallback clauses.',
    expectedOutcome: 'Contract review workspace displaying side-by-side original contract text with color-coded risk highlights and one-click redline insertion.',
    difficulty: 'Medium',
    tags: JSON.stringify(['LegalTech', 'Contract Analysis', 'RPA', 'NLP'])
  },
  {
    code: 'SA9',
    domainCode: 'SA',
    title: 'Automated Pharmacy Prescription Refill & Dispensing Bot Telemetry',
    description: 'Retail pharmacies experience high error rates and customer wait times during peak pill-counting hours. Build an automated prescription verification and automated pill counting telemetry interface.',
    detailedRequirements: '1. Prescription barcode verification ensuring correct drug NDC number and dosage match.\n2. High-speed optical camera pill counting simulator verifying exact tablet counts before bottle capping.\n3. Automatic patient refill readiness SMS dispatcher and insurance copay adjudication logger.',
    expectedOutcome: 'Pharmacy technician dispensing terminal showing prescription verification checklist, simulated optical tablet count verification, and patient pickup alert status.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Healthcare Automation', 'Computer Vision', 'Pharmacy', 'Robotics'])
  },
  {
    code: 'SA10',
    domainCode: 'SA',
    title: 'Smart Greenhouse Climate & Fertigation Autonomous Orchestrator',
    description: 'Commercial greenhouse growers struggle to balance heating costs, ventilation, and CO2 enrichment to optimize vegetable growth rates. Build an autonomous greenhouse environmental controller.',
    detailedRequirements: '1. Sensor telemetry ingestion for solar radiation, indoor/outdoor temperature, relative humidity, and CO2 ppm.\n2. Autonomous actuation logic modulating motorized shade screens, roof vents, evaporative cooling pads, and CO2 injectors.\n3. Vapor Pressure Deficit (VPD) optimization keeping plants in the ideal transpiration zone.',
    expectedOutcome: 'Greenhouse controller cockpit displaying live climate dials, active actuator status indicators, Vapor Pressure Deficit curve, and energy consumption metrics.',
    difficulty: 'Medium',
    tags: JSON.stringify(['Smart Greenhouse', 'VPD', 'Industrial IoT', 'AgTech Automation'])
  }
];

module.exports = {
  domains,
  problems
};
