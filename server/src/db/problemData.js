// Official Hackathon Problem Statements (160 Full-Stack Web Application Challenges)
// Source of Truth: Official Hackathon Problem Statement Document
// Exactly 16 Domains and 10 Problem Statements per Domain (160 Total)

const domains = [
  { code: 'A', name: 'Agriculture', icon: '🌾', description: 'Smart crop detection, irrigation, equipment sharing, and agricultural market solutions.' },
  { code: 'H', name: 'Healthcare & Hospitals', icon: '🏥', description: 'Hospital systems, symptom triage, patient queues, bed availability, and medical tools.' },
  { code: 'E', name: 'Education', icon: '🎓', description: 'Personalized learning, attendance, timetables, doubt solving, and dropout prevention.' },
  { code: 'S', name: 'Smart City', icon: '🏙️', description: 'Waste collection, citizen complaints, smart parking, flood alerts, and civic dashboards.' },
  { code: 'P', name: 'Public Safety & Emergency', icon: '🚨', description: 'Emergency SOS, disaster management, shelter finding, and crowd safety monitoring.' },
  { code: 'F', name: 'Finance & FinTech', icon: '💳', description: 'Personal budgeting, expense management, small business cashflow, and loan comparison.' },
  { code: 'R', name: 'Retail & E-Commerce', icon: '🛍️', description: 'Local marketplaces, product recommendations, inventory management, and customer support.' },
  { code: 'C', name: 'Environment & Climate', icon: '🌱', description: 'Carbon tracking, tree plantation, water conservation, and renewable energy monitoring.' },
  { code: 'T', name: 'Transportation & Mobility', icon: '🚗', description: 'Carpooling, college transport, EV charging finder, and route optimization.' },
  { code: 'J', name: 'Employment & Career', icon: '💼', description: 'Resume analysis, skill-based job matching, career roadmaps, and campus placement.' },
  { code: 'G', name: 'Government & Public Services', icon: '🏛️', description: 'Government scheme discovery, grievance management, appointment booking, and civic heatmaps.' },
  { code: 'HC', name: 'Home & Community', icon: '🏡', description: 'Apartment management, skill exchange, neighborhood safety, and visitor management.' },
  { code: 'FN', name: 'Food & Nutrition', icon: '🥗', description: 'Food waste reduction, meal planning, nutrition info, and food expiry tracking.' },
  { code: 'MW', name: 'Mental Wellness & Social Wellbeing', icon: '🧠', description: 'Student stress management, digital wellness, peer support, and mood journals.' },
  { code: 'CS', name: 'Cybersecurity & Digital Safety', icon: '🛡️', description: 'Phishing awareness, password security, scam detection, and cyber incident reporting.' },
  { code: 'SA', name: 'Smart Automation', icon: '🤖', description: 'Home and office automation, workflow automation, and automated task assistants.' }
];

const problems = [
  // ==========================================
  // 1. Agriculture (A1 - A10)
  // ==========================================
  {
    code: 'A1',
    domainCode: 'A',
    title: 'Smart Crop Disease Detection Platform',
    description: 'Farmers struggle to identify crop diseases early. Build a web application where farmers can upload crop images and receive possible disease identification, severity estimation, and recommended actions.'
  },
  {
    code: 'A2',
    domainCode: 'A',
    title: 'AI-Based Crop Recommendation System',
    description: 'Build a platform that recommends suitable crops based on soil type, location, weather, water availability, and previous crop history.'
  },
  {
    code: 'A3',
    domainCode: 'A',
    title: 'Farm Expense & Profit Tracker',
    description: 'Create a dashboard that helps farmers record seeds, fertilizers, labor, equipment, irrigation, and other expenses and calculates estimated profit per crop.'
  },
  {
    code: 'A4',
    domainCode: 'A',
    title: 'Smart Irrigation Recommendation System',
    description: 'Build an application that recommends when and how much to irrigate crops using weather information, crop type, soil conditions, and historical irrigation data.'
  },
  {
    code: 'A5',
    domainCode: 'A',
    title: 'Farmer-to-Buyer Marketplace',
    description: 'Create a platform connecting farmers directly with restaurants, retailers, wholesalers, and consumers to reduce unnecessary middlemen.'
  },
  {
    code: 'A6',
    domainCode: 'A',
    title: 'Agricultural Equipment Sharing Platform',
    description: 'Build a system where farmers can rent tractors, harvesters, pumps, and other agricultural equipment from nearby owners.'
  },
  {
    code: 'A7',
    domainCode: 'A',
    title: 'Government Agricultural Scheme Finder',
    description: 'Create an application that matches farmers with government subsidies, loans, insurance programs, and agricultural schemes based on their profile.'
  },
  {
    code: 'A8',
    domainCode: 'A',
    title: 'Crop Price Prediction Dashboard',
    description: 'Build a platform that displays historical crop prices and predicts possible future price trends using available market data.'
  },
  {
    code: 'A9',
    domainCode: 'A',
    title: 'Farm-to-Consumer Traceability System',
    description: 'Create a platform that allows consumers to track a food product from farm to retailer using digital batch records.'
  },
  {
    code: 'A10',
    domainCode: 'A',
    title: 'Agricultural Waste Marketplace',
    description: 'Build a platform where farmers can list agricultural waste such as straw, husks, and crop residues so industries can purchase and reuse them.'
  },

  // ==========================================
  // 2. Healthcare & Hospitals (H1 - H10)
  // ==========================================
  {
    code: 'H1',
    domainCode: 'H',
    title: 'Smart Hospital Appointment System',
    description: 'Build a hospital appointment platform that automatically manages doctors, departments, available slots, cancellations, and waiting lists.'
  },
  {
    code: 'H2',
    domainCode: 'H',
    title: 'AI-Based Symptom Triage Assistant',
    description: 'Create a web application where users enter symptoms and receive a preliminary urgency classification such as emergency, urgent, or routine consultation.'
  },
  {
    code: 'H3',
    domainCode: 'H',
    title: 'Hospital Bed Availability Dashboard',
    description: 'Build a real-time dashboard showing available, occupied, reserved, and cleaning-status beds across hospital departments.'
  },
  {
    code: 'H4',
    domainCode: 'H',
    title: 'Digital Patient Queue Management',
    description: 'Create a system that allows patients to obtain digital tokens and track their estimated waiting time without physically standing in queues.'
  },
  {
    code: 'H5',
    domainCode: 'H',
    title: 'Medicine Availability Finder',
    description: 'Build a platform that helps patients find nearby pharmacies or hospital pharmacies that have a particular medicine in stock.'
  },
  {
    code: 'H6',
    domainCode: 'H',
    title: 'Medical Report Organizer',
    description: 'Create a secure application where patients can upload and organize medical reports, prescriptions, test results, and appointment history.'
  },
  {
    code: 'H7',
    domainCode: 'H',
    title: 'Emergency Blood Donor Network',
    description: 'Build a platform connecting hospitals and patients with compatible blood donors based on blood group and location.'
  },
  {
    code: 'H8',
    domainCode: 'H',
    title: 'Hospital Resource Management System',
    description: 'Create a dashboard for hospitals to monitor ICU beds, oxygen equipment, ventilators, medicines, blood units, and other critical resources.'
  },
  {
    code: 'H9',
    domainCode: 'H',
    title: 'Patient Feedback & Hospital Quality Dashboard',
    description: 'Build a platform that collects patient feedback and generates department-wise insights about waiting time, cleanliness, staff behavior, and service quality.'
  },
  {
    code: 'H10',
    domainCode: 'H',
    title: 'Elderly Healthcare Reminder Platform',
    description: 'Create an application that reminds elderly users about medicines, appointments, health checkups, and important medical activities.'
  },

  // ==========================================
  // 3. Education (E1 - E10)
  // ==========================================
  {
    code: 'E1',
    domainCode: 'E',
    title: 'AI Personalized Learning Platform',
    description: "Build an application that analyzes a student's performance and recommends personalized learning materials and practice questions."
  },
  {
    code: 'E2',
    domainCode: 'E',
    title: 'Student Attendance & Performance Dashboard',
    description: 'Create a system where teachers can track attendance, marks, assignments, and identify students who may require additional support.'
  },
  {
    code: 'E3',
    domainCode: 'E',
    title: 'AI Doubt-Solving Platform',
    description: 'Build a platform where students can submit academic questions and receive explanations, examples, and learning resources.'
  },
  {
    code: 'E4',
    domainCode: 'E',
    title: 'Skill Gap Analyzer',
    description: "Create an application that compares a student's current skills with the requirements of a selected career or job and generates a personalized learning roadmap."
  },
  {
    code: 'E5',
    domainCode: 'E',
    title: 'Smart College Timetable Generator',
    description: 'Build an application that automatically creates conflict-free timetables based on classrooms, faculty availability, subjects, and student batches.'
  },
  {
    code: 'E6',
    domainCode: 'E',
    title: 'Scholarship Discovery Platform',
    description: 'Create a system that recommends scholarships to students based on academic performance, income category, course, location, and eligibility.'
  },
  {
    code: 'E7',
    domainCode: 'E',
    title: 'Student Project Collaboration Platform',
    description: 'Build a platform where students can find teammates, publish project ideas, assign tasks, and track project progress.'
  },
  {
    code: 'E8',
    domainCode: 'E',
    title: 'AI Interview Preparation Platform',
    description: 'Create a web application that conducts mock interviews and provides feedback on answers, communication, and technical knowledge.'
  },
  {
    code: 'E9',
    domainCode: 'E',
    title: 'Digital Laboratory Management System',
    description: 'Build a platform for managing laboratory equipment, experiments, bookings, maintenance, and student usage records.'
  },
  {
    code: 'E10',
    domainCode: 'E',
    title: 'Early Dropout Risk Detection',
    description: 'Create a dashboard that analyzes attendance, academic performance, assignment completion, and engagement data to identify students who may be at risk of dropping out.'
  },

  // ==========================================
  // 4. Smart City (S1 - S10)
  // ==========================================
  {
    code: 'S1',
    domainCode: 'S',
    title: 'Smart Waste Collection Platform',
    description: 'Build a system that helps municipalities track waste collection vehicles, collection schedules, and overflowing garbage locations.'
  },
  {
    code: 'S2',
    domainCode: 'S',
    title: 'Citizen Complaint Management System',
    description: 'Create a platform where citizens report road, water, electricity, sanitation, and public infrastructure problems and track resolution status.'
  },
  {
    code: 'S3',
    domainCode: 'S',
    title: 'Smart Parking Finder',
    description: 'Build a web application that helps users find available parking spaces and optionally reserve them.'
  },
  {
    code: 'S4',
    domainCode: 'S',
    title: 'Pothole Reporting Platform',
    description: 'Create a map-based system where citizens can report potholes with photographs and location information.'
  },
  {
    code: 'S5',
    domainCode: 'S',
    title: 'Public Toilet Finder & Maintenance System',
    description: 'Build an application that helps citizens find nearby public toilets and allows authorities to monitor cleanliness and maintenance complaints.'
  },
  {
    code: 'S6',
    domainCode: 'S',
    title: 'Smart Streetlight Monitoring',
    description: 'Create a dashboard for monitoring streetlights, reporting failures, and prioritizing maintenance.'
  },
  {
    code: 'S7',
    domainCode: 'S',
    title: 'Urban Flood Alert Platform',
    description: 'Build a system that combines rainfall, drainage, and location information to identify areas at higher risk of urban flooding.'
  },
  {
    code: 'S8',
    domainCode: 'S',
    title: 'Public Transport Tracking Platform',
    description: 'Create a web application that displays public buses, routes, estimated arrival times, and service alerts.'
  },
  {
    code: 'S9',
    domainCode: 'S',
    title: 'City Air Quality Dashboard',
    description: 'Build a platform displaying air quality levels across different locations and providing health recommendations based on pollution levels.'
  },
  {
    code: 'S10',
    domainCode: 'S',
    title: 'Smart Civic Resource Dashboard',
    description: 'Create a dashboard that helps municipal authorities visualize complaints, infrastructure conditions, sanitation data, and maintenance activities.'
  },

  // ==========================================
  // 5. Public Safety & Emergency (P1 - P10)
  // ==========================================
  {
    code: 'P1',
    domainCode: 'P',
    title: 'Emergency SOS Web Platform',
    description: 'Build a platform where users can trigger an emergency alert and share their location with predefined emergency contacts.'
  },
  {
    code: 'P2',
    domainCode: 'P',
    title: 'Disaster Management Dashboard',
    description: 'Create a dashboard for authorities to monitor disaster incidents, affected areas, shelters, resources, and rescue operations.'
  },
  {
    code: 'P3',
    domainCode: 'P',
    title: 'Missing Person Reporting Platform',
    description: 'Build a system for reporting missing persons and managing verified information, locations, and case updates.'
  },
  {
    code: 'P4',
    domainCode: 'P',
    title: 'Women Safety Route Planner',
    description: 'Create a map-based application that recommends safer routes using factors such as lighting, public activity, and reported incidents.'
  },
  {
    code: 'P5',
    domainCode: 'P',
    title: 'Emergency Shelter Finder',
    description: 'Build an application that helps people locate nearby shelters during floods, cyclones, earthquakes, or other disasters.'
  },
  {
    code: 'P6',
    domainCode: 'P',
    title: 'Volunteer Coordination Platform',
    description: 'Create a system that connects volunteers with disaster-relief organizations and assigns tasks based on location and skills.'
  },
  {
    code: 'P7',
    domainCode: 'P',
    title: 'Emergency Vehicle Coordination System',
    description: 'Build a platform that helps coordinate ambulances, fire engines, rescue teams, and emergency requests.'
  },
  {
    code: 'P8',
    domainCode: 'P',
    title: 'Crowd Safety Monitoring Dashboard',
    description: 'Create a system for event organizers to monitor crowd density, entrances, exits, and potential overcrowding.'
  },
  {
    code: 'P9',
    domainCode: 'P',
    title: 'Disaster Resource Distribution Platform',
    description: 'Build an application for tracking food, water, medicine, clothing, and other relief supplies during disasters.'
  },
  {
    code: 'P10',
    domainCode: 'P',
    title: 'Emergency Communication Hub',
    description: 'Create a centralized platform for authorities to publish verified emergency instructions, alerts, evacuation information, and updates.'
  },

  // ==========================================
  // 6. Finance & FinTech (F1 - F10)
  // ==========================================
  {
    code: 'F1',
    domainCode: 'F',
    title: 'Personal Expense Management Platform',
    description: 'Build a web application that automatically categorizes expenses and provides spending insights.'
  },
  {
    code: 'F2',
    domainCode: 'F',
    title: 'Student Budget Planner',
    description: 'Create a budgeting platform specifically designed for students to manage food, travel, education, entertainment, and savings.'
  },
  {
    code: 'F3',
    domainCode: 'F',
    title: 'Small Business Cash Flow Dashboard',
    description: 'Build a system that helps small businesses track income, expenses, invoices, and projected cash flow.'
  },
  {
    code: 'F4',
    domainCode: 'F',
    title: 'AI Financial Education Assistant',
    description: 'Create an educational platform that explains financial concepts such as savings, loans, interest, taxes, and investments in simple language.'
  },
  {
    code: 'F5',
    domainCode: 'F',
    title: 'Subscription Management Platform',
    description: 'Build an application that tracks recurring subscriptions and alerts users about upcoming payments.'
  },
  {
    code: 'F6',
    domainCode: 'F',
    title: 'Bill Splitting Platform',
    description: 'Create a system for groups to track shared expenses and automatically calculate who owes whom.'
  },
  {
    code: 'F7',
    domainCode: 'F',
    title: 'Loan Comparison Platform',
    description: 'Build a platform that allows users to compare loans based on interest rate, tenure, fees, and estimated monthly payments.'
  },
  {
    code: 'F8',
    domainCode: 'F',
    title: 'Invoice Management System',
    description: 'Create an application for freelancers and small businesses to generate, track, and manage invoices.'
  },
  {
    code: 'F9',
    domainCode: 'F',
    title: 'Financial Goal Tracker',
    description: 'Build a platform where users define financial goals and receive progress tracking and saving recommendations.'
  },
  {
    code: 'F10',
    domainCode: 'F',
    title: 'Small Business Credit Readiness Platform',
    description: 'Create a system that analyzes business financial records and provides an indicative credit-readiness score.'
  },

  // ==========================================
  // 7. Retail & E-Commerce (R1 - R10)
  // ==========================================
  {
    code: 'R1',
    domainCode: 'R',
    title: 'Local Store Digital Marketplace',
    description: 'Build a platform where local shops can list products and customers can order from nearby stores.'
  },
  {
    code: 'R2',
    domainCode: 'R',
    title: 'Smart Product Recommendation System',
    description: 'Create an e-commerce platform that recommends products based on customer behavior and preferences.'
  },
  {
    code: 'R3',
    domainCode: 'R',
    title: 'Inventory Management System',
    description: 'Build a dashboard that helps retailers monitor stock levels, sales, low-stock products, and reorder requirements.'
  },
  {
    code: 'R4',
    domainCode: 'R',
    title: 'Expiry Management System',
    description: 'Create a system that alerts stores about products approaching their expiry dates.'
  },
  {
    code: 'R5',
    domainCode: 'R',
    title: 'Customer Loyalty Platform',
    description: 'Build an application that manages customer points, rewards, offers, and purchase history.'
  },
  {
    code: 'R6',
    domainCode: 'R',
    title: 'Second-Hand Marketplace',
    description: 'Create a platform where users can buy and sell used electronics, furniture, books, and other products.'
  },
  {
    code: 'R7',
    domainCode: 'R',
    title: 'Smart Shopping List',
    description: 'Build an application that creates optimized shopping lists based on previous purchases, budget, and preferences.'
  },
  {
    code: 'R8',
    domainCode: 'R',
    title: 'Price Comparison Platform',
    description: 'Create a system that allows users to compare product prices across different sellers.'
  },
  {
    code: 'R9',
    domainCode: 'R',
    title: 'Return & Warranty Management System',
    description: 'Build a platform for customers to track product warranties, returns, repairs, and service requests.'
  },
  {
    code: 'R10',
    domainCode: 'R',
    title: 'AI Customer Support Platform',
    description: 'Create an AI-powered customer support system that handles common queries and escalates complex issues to human agents.'
  },

  // ==========================================
  // 8. Environment & Climate (C1 - C10)
  // ==========================================
  {
    code: 'C1',
    domainCode: 'C',
    title: 'Personal Carbon Footprint Tracker',
    description: "Build a platform that estimates an individual's carbon footprint based on travel, electricity, food, and lifestyle data."
  },
  {
    code: 'C2',
    domainCode: 'C',
    title: 'Tree Plantation Management Platform',
    description: 'Create a system for organizations to track trees planted, locations, species, survival rates, and maintenance.'
  },
  {
    code: 'C3',
    domainCode: 'C',
    title: 'Water Conservation Dashboard',
    description: 'Build a platform that tracks household or institutional water consumption and provides conservation recommendations.'
  },
  {
    code: 'C4',
    domainCode: 'C',
    title: 'Plastic Waste Reporting Platform',
    description: 'Create a system where users can report plastic waste hotspots and monitor cleanup activities.'
  },
  {
    code: 'C5',
    domainCode: 'C',
    title: 'E-Waste Collection Platform',
    description: 'Build a marketplace connecting households and organizations with authorized e-waste collection services.'
  },
  {
    code: 'C6',
    domainCode: 'C',
    title: 'Climate Risk Dashboard',
    description: 'Create a platform that displays climate risks such as heatwaves, floods, droughts, and extreme rainfall for different regions.'
  },
  {
    code: 'C7',
    domainCode: 'C',
    title: 'Renewable Energy Monitoring Platform',
    description: 'Build a dashboard for monitoring solar panels, energy generation, consumption, and savings.'
  },
  {
    code: 'C8',
    domainCode: 'C',
    title: 'Sustainable Lifestyle Recommendation App',
    description: 'Create an application that suggests environmentally friendly alternatives to everyday activities.'
  },
  {
    code: 'C9',
    domainCode: 'C',
    title: 'River & Lake Pollution Reporting System',
    description: 'Build a map-based platform for reporting pollution incidents and monitoring cleanup efforts.'
  },
  {
    code: 'C10',
    domainCode: 'C',
    title: 'Community Recycling Platform',
    description: 'Create a system that connects residents with recycling centers and tracks recyclable material collection.'
  },

  // ==========================================
  // 9. Transportation & Mobility (T1 - T10)
  // ==========================================
  {
    code: 'T1',
    domainCode: 'T',
    title: 'Smart Carpooling Platform',
    description: 'Build a platform that connects people traveling along similar routes to share rides.'
  },
  {
    code: 'T2',
    domainCode: 'T',
    title: 'College Transport Management System',
    description: 'Create a system for managing college buses, routes, drivers, students, and live trip information.'
  },
  {
    code: 'T3',
    domainCode: 'T',
    title: 'EV Charging Station Finder',
    description: 'Build an application that helps EV users find charging stations and view availability.'
  },
  {
    code: 'T4',
    domainCode: 'T',
    title: 'Road Accident Blackspot Dashboard',
    description: 'Create a map showing accident-prone areas using historical accident data.'
  },
  {
    code: 'T5',
    domainCode: 'T',
    title: 'Vehicle Maintenance Reminder System',
    description: 'Build an application that tracks vehicle servicing, insurance, pollution certificates, and maintenance schedules.'
  },
  {
    code: 'T6',
    domainCode: 'T',
    title: 'Intelligent Parking Management',
    description: 'Create a system that manages parking spaces, reservations, payments, and occupancy.'
  },
  {
    code: 'T7',
    domainCode: 'T',
    title: 'Public Transport Route Optimizer',
    description: 'Build an application that recommends efficient public transport routes based on travel time and transfers.'
  },
  {
    code: 'T8',
    domainCode: 'T',
    title: 'School Bus Safety Platform',
    description: 'Create a system for tracking school buses and notifying parents about pickup and drop-off events.'
  },
  {
    code: 'T9',
    domainCode: 'T',
    title: 'Traffic Incident Reporting Platform',
    description: 'Build an application where users can report accidents, roadblocks, traffic jams, and hazards.'
  },
  {
    code: 'T10',
    domainCode: 'T',
    title: 'Logistics Route Optimization Platform',
    description: 'Create a system that helps delivery companies optimize routes based on multiple delivery locations.'
  },

  // ==========================================
  // 10. Employment & Career (J1 - J10)
  // ==========================================
  {
    code: 'J1',
    domainCode: 'J',
    title: 'AI Resume Analyzer',
    description: 'Build a platform that analyzes resumes against a job description and identifies missing skills and improvements.'
  },
  {
    code: 'J2',
    domainCode: 'J',
    title: 'Skill-Based Job Matching Platform',
    description: 'Create a system that matches candidates with jobs based on skills rather than only job titles.'
  },
  {
    code: 'J3',
    domainCode: 'J',
    title: 'Internship Discovery Platform',
    description: 'Build a platform that helps students discover internships based on their skills, course, location, and interests.'
  },
  {
    code: 'J4',
    domainCode: 'J',
    title: 'Career Roadmap Generator',
    description: "Create an application that generates personalized career roadmaps based on a student's desired profession."
  },
  {
    code: 'J5',
    domainCode: 'J',
    title: 'Freelancer-Client Matching Platform',
    description: 'Build a marketplace connecting freelancers with clients based on skills and project requirements.'
  },
  {
    code: 'J6',
    domainCode: 'J',
    title: 'Interview Scheduling System',
    description: 'Create a platform that manages interview slots, candidates, interviewers, reminders, and feedback.'
  },
  {
    code: 'J7',
    domainCode: 'J',
    title: 'Employee Skill Management Platform',
    description: 'Build a dashboard that helps organizations track employee skills, certifications, and training requirements.'
  },
  {
    code: 'J8',
    domainCode: 'J',
    title: 'AI Mock Interview Platform',
    description: 'Create a system that conducts simulated interviews and evaluates candidate responses.'
  },
  {
    code: 'J9',
    domainCode: 'J',
    title: 'Campus Placement Management System',
    description: 'Build a complete platform for colleges to manage companies, students, eligibility, applications, interviews, and offers.'
  },
  {
    code: 'J10',
    domainCode: 'J',
    title: 'Career Mentorship Platform',
    description: 'Create a platform connecting students with industry professionals for mentorship sessions.'
  },

  // ==========================================
  // 11. Government & Public Services (G1 - G10)
  // ==========================================
  {
    code: 'G1',
    domainCode: 'G',
    title: 'Government Scheme Discovery Platform',
    description: 'Build an application that helps citizens find government schemes they may be eligible for.'
  },
  {
    code: 'G2',
    domainCode: 'G',
    title: 'Digital Grievance Management System',
    description: 'Create a platform for citizens to submit complaints and track their resolution.'
  },
  {
    code: 'G3',
    domainCode: 'G',
    title: 'Public Service Appointment Platform',
    description: 'Build a system for booking appointments for government services and managing queues.'
  },
  {
    code: 'G4',
    domainCode: 'G',
    title: 'Government Office Queue Management',
    description: 'Create a digital token and queue tracking system for government offices.'
  },
  {
    code: 'G5',
    domainCode: 'G',
    title: 'Civic Issue Heatmap',
    description: 'Build a map that visualizes reported civic problems such as garbage, potholes, water leaks, and streetlight failures.'
  },
  {
    code: 'G6',
    domainCode: 'G',
    title: 'Public Project Transparency Dashboard',
    description: 'Create a platform showing government infrastructure projects, budgets, timelines, contractors, and progress.'
  },
  {
    code: 'G7',
    domainCode: 'G',
    title: 'Document Application Tracker',
    description: 'Build a platform where citizens can track applications for certificates, licenses, permits, and other services.'
  },
  {
    code: 'G8',
    domainCode: 'G',
    title: 'Citizen Feedback Platform',
    description: 'Create a system that collects citizen feedback about public services and generates analytics.'
  },
  {
    code: 'G9',
    domainCode: 'G',
    title: 'Local Government Resource Dashboard',
    description: 'Build a dashboard for authorities to monitor public resources, complaints, projects, and service delivery.'
  },
  {
    code: 'G10',
    domainCode: 'G',
    title: 'Rural Service Information Platform',
    description: 'Create a simple multilingual platform providing rural citizens with information about government services and programs.'
  },

  // ==========================================
  // 12. Home & Community (HC1 - HC10)
  // ==========================================
  {
    code: 'HC1',
    domainCode: 'HC',
    title: 'Apartment Management System',
    description: 'Build a platform for managing residents, maintenance requests, notices, visitor records, and payments.'
  },
  {
    code: 'HC2',
    domainCode: 'HC',
    title: 'Community Skill Exchange Platform',
    description: 'Create a system where neighbors can exchange skills such as tutoring, repairs, cooking, or technology support.'
  },
  {
    code: 'HC3',
    domainCode: 'HC',
    title: 'Local Community Event Platform',
    description: 'Build an application for discovering and organizing local community events.'
  },
  {
    code: 'HC4',
    domainCode: 'HC',
    title: 'Neighborhood Safety Network',
    description: 'Create a platform where residents can report local safety concerns and share verified alerts.'
  },
  {
    code: 'HC5',
    domainCode: 'HC',
    title: 'Household Expense Manager',
    description: 'Build an application for families to track shared household expenses.'
  },
  {
    code: 'HC6',
    domainCode: 'HC',
    title: 'Home Maintenance Tracker',
    description: 'Create a platform for managing appliance maintenance, repairs, warranties, and service schedules.'
  },
  {
    code: 'HC7',
    domainCode: 'HC',
    title: 'Lost & Found Community Platform',
    description: 'Build a neighborhood-based platform for reporting and finding lost items.'
  },
  {
    code: 'HC8',
    domainCode: 'HC',
    title: 'Local Service Provider Marketplace',
    description: 'Create a platform connecting residents with electricians, plumbers, cleaners, tutors, and other service providers.'
  },
  {
    code: 'HC9',
    domainCode: 'HC',
    title: 'Community Resource Sharing Platform',
    description: 'Build an application where neighbors can lend or borrow tools, books, equipment, and other items.'
  },
  {
    code: 'HC10',
    domainCode: 'HC',
    title: 'Apartment Visitor Management System',
    description: 'Create a digital visitor management platform with resident approval and entry records.'
  },

  // ==========================================
  // 13. Food & Nutrition (FN1 - FN10)
  // ==========================================
  {
    code: 'FN1',
    domainCode: 'FN',
    title: 'Food Waste Reduction Platform',
    description: 'Build a platform connecting restaurants, stores, and households with organizations that can redistribute surplus food.'
  },
  {
    code: 'FN2',
    domainCode: 'FN',
    title: 'AI Meal Planning Platform',
    description: 'Create a system that generates meal plans based on budget, dietary preferences, available ingredients, and nutritional requirements.'
  },
  {
    code: 'FN3',
    domainCode: 'FN',
    title: 'Restaurant Food Waste Dashboard',
    description: 'Build a dashboard that helps restaurants track food waste and identify major sources of waste.'
  },
  {
    code: 'FN4',
    domainCode: 'FN',
    title: 'Smart Grocery Planner',
    description: 'Create an application that generates grocery lists based on planned meals and household consumption.'
  },
  {
    code: 'FN5',
    domainCode: 'FN',
    title: 'Food Donation Coordination Platform',
    description: 'Build a platform connecting food donors with NGOs and community organizations.'
  },
  {
    code: 'FN6',
    domainCode: 'FN',
    title: 'Restaurant Nutrition Information Platform',
    description: 'Create a system that allows restaurants to display nutritional information for menu items.'
  },
  {
    code: 'FN7',
    domainCode: 'FN',
    title: 'Local Food Producer Marketplace',
    description: 'Build a platform connecting local farmers and food producers directly with consumers.'
  },
  {
    code: 'FN8',
    domainCode: 'FN',
    title: 'Food Expiry Tracker',
    description: 'Create an application that tracks food products at home and reminds users before expiry.'
  },
  {
    code: 'FN9',
    domainCode: 'FN',
    title: 'School Nutrition Management System',
    description: 'Build a dashboard for monitoring school meal programs, menus, attendance, and food distribution.'
  },
  {
    code: 'FN10',
    domainCode: 'FN',
    title: 'AI Recipe Generator',
    description: 'Create a platform that generates recipes using ingredients already available to users.'
  },

  // ==========================================
  // 14. Mental Wellness & Social Wellbeing (MW1 - MW10)
  // ==========================================
  {
    code: 'MW1',
    domainCode: 'MW',
    title: 'Student Stress Management Platform',
    description: 'Build a platform that helps students track workload, study habits, sleep patterns, and stress indicators.'
  },
  {
    code: 'MW2',
    domainCode: 'MW',
    title: 'Digital Wellness Dashboard',
    description: 'Create an application that helps users understand and manage their screen time and digital habits.'
  },
  {
    code: 'MW3',
    domainCode: 'MW',
    title: 'Anonymous Peer Support Platform',
    description: 'Build a moderated platform where students can anonymously share problems and receive peer support.'
  },
  {
    code: 'MW4',
    domainCode: 'MW',
    title: 'Study-Life Balance Planner',
    description: 'Create a system that helps students balance academics, exercise, social activities, and personal time.'
  },
  {
    code: 'MW5',
    domainCode: 'MW',
    title: 'Workplace Wellbeing Dashboard',
    description: 'Build a platform that allows organizations to monitor anonymous employee wellbeing surveys.'
  },
  {
    code: 'MW6',
    domainCode: 'MW',
    title: 'Daily Mood Journal',
    description: 'Create a web application for users to record moods, activities, and personal reflections and visualize trends.'
  },
  {
    code: 'MW7',
    domainCode: 'MW',
    title: 'Social Connection Platform for Seniors',
    description: 'Build a platform that helps elderly people discover community activities and connect with others.'
  },
  {
    code: 'MW8',
    domainCode: 'MW',
    title: 'Digital Detox Challenge Platform',
    description: 'Create an application that organizes screen-time reduction challenges and tracks progress.'
  },
  {
    code: 'MW9',
    domainCode: 'MW',
    title: 'Student Support Resource Finder',
    description: 'Build a platform that helps students discover counseling, academic, financial, and social support resources available to them.'
  },
  {
    code: 'MW10',
    domainCode: 'MW',
    title: 'Community Volunteering Platform',
    description: 'Create a platform that connects people looking to volunteer with local social organizations.'
  },

  // ==========================================
  // 15. Cybersecurity & Digital Safety (CS1 - CS10)
  // ==========================================
  {
    code: 'CS1',
    domainCode: 'CS',
    title: 'Phishing Awareness Simulator',
    description: 'Build an educational platform that teaches users how to identify phishing attacks through simulated examples.'
  },
  {
    code: 'CS2',
    domainCode: 'CS',
    title: 'Password Security Education Platform',
    description: 'Create an application that teaches users about password security and evaluates password practices without storing actual passwords.'
  },
  {
    code: 'CS3',
    domainCode: 'CS',
    title: 'Scam Detection Assistant',
    description: 'Build a system where users can submit suspicious messages, emails, or links for risk analysis.'
  },
  {
    code: 'CS4',
    domainCode: 'CS',
    title: 'Cybersecurity Awareness Dashboard',
    description: 'Create a platform for organizations to conduct cybersecurity awareness campaigns and track employee training.'
  },
  {
    code: 'CS5',
    domainCode: 'CS',
    title: 'Digital Privacy Assistant',
    description: 'Build an application that teaches users how to improve privacy settings across common online services.'
  },
  {
    code: 'CS6',
    domainCode: 'CS',
    title: 'Fake Website Detection Platform',
    description: 'Create a tool that analyzes website characteristics and provides an indicative risk assessment.'
  },
  {
    code: 'CS7',
    domainCode: 'CS',
    title: 'Data Breach Awareness Platform',
    description: 'Build a dashboard that helps organizations track potential security incidents and response activities.'
  },
  {
    code: 'CS8',
    domainCode: 'CS',
    title: 'Secure Document Sharing Platform',
    description: 'Create a web application for sharing documents with access controls, expiration dates, and audit logs.'
  },
  {
    code: 'CS9',
    domainCode: 'CS',
    title: 'Cyber Incident Reporting System',
    description: 'Build a platform where organizations can report, categorize, and track cybersecurity incidents.'
  },
  {
    code: 'CS10',
    domainCode: 'CS',
    title: 'Cybersecurity Learning Platform',
    description: 'Create an interactive learning platform with cybersecurity lessons, quizzes, challenges, progress tracking, and leaderboards.'
  },

  // ==========================================
  // 16. Smart Automation (SA1 - SA10)
  // ==========================================
  {
    code: 'SA1',
    domainCode: 'SA',
    title: 'Smart Home Automation Management System',
    description: 'Build a web application that allows users to monitor and control home appliances, lighting, fans, and other devices through a centralized dashboard with automated schedules and rules.'
  },
  {
    code: 'SA2',
    domainCode: 'SA',
    title: 'Smart Office Automation Platform',
    description: 'Create a system that automatically manages office lighting, temperature, meeting rooms, equipment, and energy consumption based on occupancy, schedules, and user requirements.'
  },
  {
    code: 'SA3',
    domainCode: 'SA',
    title: 'Automated College Classroom System',
    description: 'Build a platform that automates classroom operations such as lights, fans, projectors, attendance, timetable-based device control, and energy monitoring.'
  },
  {
    code: 'SA4',
    domainCode: 'SA',
    title: 'Smart Hospital Room Automation',
    description: 'Create a system that automates hospital room lighting, temperature, equipment status, nurse-call alerts, and room monitoring based on patient and staff requirements.'
  },
  {
    code: 'SA5',
    domainCode: 'SA',
    title: 'Smart Agriculture Automation Platform',
    description: 'Build a web application that automatically controls irrigation, greenhouse conditions, water pumps, and other agricultural operations using sensor data and predefined rules.'
  },
  {
    code: 'SA6',
    domainCode: 'SA',
    title: 'AI-Based Workflow Automation Platform',
    description: 'Create a platform where users can create automated workflows such as If → Condition → Action. For example, when a new customer registers, automatically send a welcome email, create a CRM record, and notify the sales team.'
  },
  {
    code: 'SA7',
    domainCode: 'SA',
    title: 'Smart Energy Automation System',
    description: 'Build a platform that monitors electricity consumption and automatically recommends or executes actions to reduce unnecessary energy usage.'
  },
  {
    code: 'SA8',
    domainCode: 'SA',
    title: 'Automated Inventory Reordering System',
    description: 'Create a system that monitors inventory levels and automatically generates purchase requests or alerts when stock reaches predefined thresholds.'
  },
  {
    code: 'SA9',
    domainCode: 'SA',
    title: 'Smart Parking Automation System',
    description: 'Build a platform that detects parking availability and automatically manages slot allocation, reservations, entry/exit records, and notifications.'
  },
  {
    code: 'SA10',
    domainCode: 'SA',
    title: 'AI-Based Personal Task Automation Assistant',
    description: 'Create a web application that understands user tasks and automatically schedules reminders, organizes activities, prioritizes work, and triggers appropriate actions.'
  }
];

module.exports = {
  domains,
  problems
};
