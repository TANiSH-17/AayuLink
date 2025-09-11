const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');

// This is the full, complete mock data array for all 6 patients
const mockPatientData = [
    {
      abhaId: "12-3456-7890-0001",
      personalInfo: { name: "Tanish Kumar", age: 20, gender: "Male", bloodType: "AB+", dob: "2005-08-14", emergencyContact: "Rohit Kumar (Father) - +91 98765 10001" },
      criticalInfo: { allergies: ["Dust", "Pollen"], chronicConditions: ["Mild Asthma"], currentMedications: [{ name: "Salbutamol Inhaler", dosage: "2 puffs as needed" }] },
      medicalHistory: [
        { recordId: "TAN001", date: "2005-08-20", recordType: "Birth Record", hospitalName: "Fortis Hospital, Lucknow", doctor: "Dr. Mishra", details: "Normal delivery, 3.2 kg, no complications." },
        { recordId: "TAN004", date: "2006-02-15", recordType: "Vaccination", hospitalName: "Fortis Hospital, Lucknow", doctor: "Dr. Mehra", details: "Polio, DTP, and MMR vaccinations administered." },
        { recordId: "TAN012", date: "2010-03-10", recordType: "Pediatric Visit", hospitalName: "Apollo Clinic, Lucknow", doctor: "Dr. Sharma", details: "Diagnosed with childhood asthma. Prescribed inhaler." },
        { recordId: "TAN028", date: "2015-11-02", recordType: "Injury", hospitalName: "AIIMS, Delhi", doctor: "Dr. Joshi", details: "Fractured right wrist while playing cricket. Cast applied." },
        { recordId: "TAN045", date: "2018-07-25", recordType: "Lab Report", hospitalName: "Max Healthcare, Delhi", doctor: "Lab Services", details: "CBC normal, Vitamin D deficient. Supplement prescribed." },
        { recordId: "TAN060", date: "2021-01-18", recordType: "Dental", hospitalName: "Clove Dental, Delhi", doctor: "Dr. Singh", details: "Wisdom tooth extraction. No complications." },
        { recordId: "TAN078", date: "2023-12-05", recordType: "Emergency Visit", hospitalName: "AIIMS, Delhi", doctor: "Dr. Arora", details: "Severe asthma attack. Stabilized with nebulization. Advised follow-up." }
      ]
    },
    {
      abhaId: "12-3456-7890-0002",
      personalInfo: { name: "Shobhit Chola", age: 20, gender: "Male", bloodType: "AB-", dob: "2005-11-21", emergencyContact: "Anita Chola (Mother) - +91 98765 10002" },
      criticalInfo: { allergies: ["Penicillin"], chronicConditions: ["Seasonal Allergic Rhinitis"], currentMedications: [{ name: "Cetirizine", dosage: "10mg daily during allergy season" }] },
      medicalHistory: [
        { recordId: "SHO001", date: "2005-11-25", recordType: "Birth Record", hospitalName: "AIIMS, Delhi", doctor: "Dr. Kapoor", details: "C-section, 2.9 kg, minor jaundice treated with phototherapy." },
        { recordId: "SHO005", date: "2006-12-01", recordType: "Vaccination", hospitalName: "AIIMS, Delhi", doctor: "Dr. Kapoor", details: "Completed full immunization schedule." },
        { recordId: "SHO018", date: "2012-04-12", recordType: "Hospitalization", hospitalName: "Sir Ganga Ram Hospital, Delhi", doctor: "Dr. Saxena", details: "Tonsillitis treated with antibiotics. Developed allergy to Penicillin." },
        { recordId: "SHO033", date: "2020-08-10", recordType: "Lab Report", hospitalName: "Max Healthcare, Delhi", doctor: "Lab Services", details: "High IgE levels confirming chronic allergic rhinitis." },
        { recordId: "SHO042", date: "2022-06-15", recordType: "Vision Check", hospitalName: "Vision Plus Clinic, Delhi", doctor: "Dr. Mehta", details: "Diagnosed with mild myopia. Prescribed -1.5D glasses." }
      ]
    },
    {
      abhaId: "12-3456-7890-0003",
      personalInfo: { name: "Kajal Soni", age: 19, gender: "Female", bloodType: "B-", dob: "2006-06-05", emergencyContact: "Rajesh Soni (Father) - +91 98765 10003" },
      criticalInfo: { allergies: ["Seafood"], chronicConditions: ["Iron Deficiency Anemia"], currentMedications: [{ name: "Ferrous Sulfate", dosage: "325mg daily" }] },
      medicalHistory: [
        { recordId: "KAJ001", date: "2006-06-07", recordType: "Birth Record", hospitalName: "Manipal Hospital, Jaipur", doctor: "Dr. Verma", details: "Normal delivery, 3.0 kg." },
        { recordId: "KAJ008", date: "2010-07-12", recordType: "Childhood Illness", hospitalName: "Manipal Hospital, Jaipur", doctor: "Dr. Sharma", details: "Chickenpox, recovered without complications." },
        { recordId: "KAJ025", date: "2016-09-15", recordType: "Lab Report", hospitalName: "Jaipur Golden Hospital", doctor: "Lab Services", details: "Low hemoglobin (8.5 g/dL). Diagnosed with anemia." },
        { recordId: "KAJ032", date: "2019-12-05", recordType: "Mental Health", hospitalName: "Counseling Center, Jaipur", doctor: "Dr. Bansal", details: "Mild anxiety related to exams. Counseling sessions recommended." },
        { recordId: "KAJ040", date: "2023-03-05", recordType: "Emergency Visit", hospitalName: "Fortis Hospital, Jaipur", doctor: "Dr. Yadav", details: "Severe allergic reaction to prawns. Treated with antihistamines." }
      ]
    },
    {
      abhaId: "12-3456-7890-0004",
      personalInfo: { name: "Ashtam Pati Tiwari", age: 21, gender: "Male", bloodType: "O+", dob: "2004-04-18", emergencyContact: "Manoj Tiwari (Brother) - +91 98765 10004" },
      criticalInfo: { allergies: [], chronicConditions: ["Type 1 Diabetes"], currentMedications: [{ name: "Insulin (Glargine)", dosage: "10 units daily" }] },
      medicalHistory: [
        { recordId: "ASH001", date: "2004-04-20", recordType: "Birth Record", hospitalName: "Apollo Hospital, Kanpur", doctor: "Dr. Shukla", details: "Normal birth, 3.1 kg." },
        { recordId: "ASH010", date: "2009-01-11", recordType: "Childhood Illness", hospitalName: "Kanpur Childcare Center", doctor: "Dr. Das", details: "Measles, recovered fully." },
        { recordId: "ASH029", date: "2011-08-10", recordType: "Hospitalization", hospitalName: "AIIMS, Delhi", doctor: "Dr. Sethi", details: "Diagnosed with Type 1 Diabetes after ketoacidosis episode." },
        { recordId: "ASH043", date: "2018-02-20", recordType: "Sports Injury", hospitalName: "Apollo Hospital, Kanpur", doctor: "Dr. Singh", details: "Sprained ankle during football. Rest + physiotherapy advised." },
        { recordId: "ASH050", date: "2022-11-15", recordType: "Lab Report", hospitalName: "Apollo Hospital, Kanpur", doctor: "Lab Services", details: "HbA1c: 8.1% (poor control). Insulin dose adjusted." }
      ]
    },
    {
      abhaId: "12-3456-7890-0005",
      personalInfo: { name: "Prakriti Chandra", age: 20, gender: "Female", bloodType: "O+", dob: "2005-01-28", emergencyContact: "Sangeeta Chandra (Mother) - +91 98765 10005" },
      criticalInfo: { allergies: ["Latex"], chronicConditions: ["Polycystic Ovary Syndrome (PCOS)"], currentMedications: [{ name: "Metformin", dosage: "500mg twice daily" }] },
      medicalHistory: [
        { recordId: "PRA001", date: "2005-02-01", recordType: "Birth Record", hospitalName: "AIIMS, Patna", doctor: "Dr. Tripathi", details: "Normal delivery, 3.3 kg." },
        { recordId: "PRA012", date: "2011-04-20", recordType: "Vision Check", hospitalName: "Vision Care, Patna", doctor: "Dr. Nanda", details: "Mild hyperopia detected. No correction needed." },
        { recordId: "PRA023", date: "2019-09-20", recordType: "Gynecology Visit", hospitalName: "Max Healthcare, Delhi", doctor: "Dr. Malhotra", details: "Irregular periods and acne. Diagnosed with PCOS." },
        { recordId: "PRA037", date: "2023-05-05", recordType: "Lab Report", hospitalName: "AIIMS, Delhi", doctor: "Lab Services", details: "Hormonal imbalance (elevated androgens). PCOS confirmed." },
        { recordId: "PRA045", date: "2024-01-15", recordType: "Nutrition Counseling", hospitalName: "Apollo Wellness Center, Delhi", doctor: "Dr. Renu", details: "Recommended low-carb diet and regular exercise for PCOS." }
      ]
    },
    {
      abhaId: "12-3456-7890-0006",
      personalInfo: { name: "Akansha", age: 20, gender: "Female", bloodType: "B+", dob: "2005-12-10", emergencyContact: "Neha Sharma (Sister) - +91 98765 10006" },
      criticalInfo: { allergies: ["Sulfa Drugs"], chronicConditions: ["Migraine"], currentMedications: [{ name: "Sumatriptan", dosage: "50mg as needed" }] },
      medicalHistory: [
        { recordId: "AKA001", date: "2005-12-12", recordType: "Birth Record", hospitalName: "Fortis Hospital, Bhopal", doctor: "Dr. Khanna", details: "Normal delivery, 3.4 kg." },
        { recordId: "AKA009", date: "2007-06-30", recordType: "Vaccination", hospitalName: "Fortis Hospital, Bhopal", doctor: "Dr. Khanna", details: "Completed full immunization schedule." },
        { recordId: "AKA015", date: "2017-06-18", recordType: "Neurology Visit", hospitalName: "AIIMS, Bhopal", doctor: "Dr. Nair", details: "Recurrent headaches. Diagnosed with migraine." },
        { recordId: "AKA024", date: "2019-09-05", recordType: "Dental", hospitalName: "Clove Dental, Bhopal", doctor: "Dr. Rathore", details: "Braces treatment for dental alignment. 2 years duration." },
        { recordId: "AKA034", date: "2022-02-25", recordType: "Emergency Visit", hospitalName: "Apollo Hospital, Bhopal", doctor: "Dr. Agarwal", details: "Severe migraine with aura. Treated with IV triptans." }
      ]
    }
];

const runSeeder = async () => {
    try {
        console.log('--- Starting Database Seed ---');
        await Patient.deleteMany({});
        await MedicalRecord.deleteMany({});
        console.log('Old data cleared successfully.');

        for (const patient of mockPatientData) {
            const newPatient = new Patient({
                abhaId: patient.abhaId,
                personalInfo: {
                    name: patient.personalInfo.name,
                    age: patient.personalInfo.age,
                    gender: patient.personalInfo.gender,
                    bloodType: patient.personalInfo.bloodType,
                    emergencyContact: patient.personalInfo.emergencyContact,
                },
                registeredAtHospital: "Aarogya General Hospital", 
                allergies: patient.criticalInfo.allergies,
                chronicConditions: patient.criticalInfo.chronicConditions,
                currentMedications: patient.criticalInfo.currentMedications,
            });
            await newPatient.save();
            console.log(`Saved patient: ${patient.personalInfo.name}`);

            for (const record of patient.medicalHistory) {
                const newRecord = new MedicalRecord({
                    ...record,
                    patient: patient.abhaId
                });
                await newRecord.save();
            }
            console.log(`  -> Saved ${patient.medicalHistory.length} medical records for ${patient.personalInfo.name}.`);
        }
        console.log('--- Seeding Complete ---');
    } catch (error) {
        console.error("---!! ERROR SEEDING DATABASE !!---:", error);
        throw new Error("Database seeding failed.");
    }
};

module.exports = runSeeder;

