export const SAMPLE_REPORTS = [
  {
    id: 'report-lipid-01',
    title: 'Comprehensive Lipid & Cholesterol Profile',
    patientCode: 'DEMO-PT-8291',
    date: '10 Nov 2026',
    labName: 'Apex Diagnostics & Pathology Lab',
    overallStatus: 'attention_needed',
    overallSummary:
      'This lipid profile measures different types of fats (lipids) in your bloodstream. Your overall results show healthy HDL ("good") cholesterol, but your Total Cholesterol and LDL ("bad") cholesterol are slightly higher than desirable ranges. This is a common pattern often managed through nutrition, regular exercise, and discussions with your doctor.',
    keyTakeaways: [
      'Total Cholesterol is 224 mg/dL (recommended is below 200 mg/dL).',
      'LDL ("Bad") Cholesterol is 144 mg/dL, which is borderline elevated.',
      'HDL ("Good") Cholesterol is 48 mg/dL, showing good protective levels.',
      'Triglycerides are slightly high at 168 mg/dL following an overnight fast.'
    ],
    parameters: [
      {
        name: 'Total Cholesterol',
        category: 'Lipid Profile',
        value: '224',
        unit: 'mg/dL',
        referenceRange: '< 200',
        status: 'high',
        statusLabel: 'Slightly Elevated',
        simpleExplanation:
          'Cholesterol is a soft, waxy substance your liver produces to build cell membranes and hormones. When total levels stay elevated over time, excess fat can slowly deposit along artery walls.',
        whyItMatters:
          'Keeping total cholesterol in a balanced range protects your heart and helps arteries remain smooth and flexible.',
        gaugePercentage: 75
      },
      {
        name: 'LDL Cholesterol ("Bad")',
        category: 'Lipid Profile',
        value: '144',
        unit: 'mg/dL',
        referenceRange: '< 100',
        status: 'high',
        statusLabel: 'Above Desirable',
        simpleExplanation:
          'Low-Density Lipoprotein carries cholesterol from your liver to cells. It is nicknamed "bad" cholesterol because surplus amounts can stick to blood vessel linings.',
        whyItMatters:
          'Doctors prioritize lowering LDL through dietary fiber, heart-healthy fats, and physical activity to reduce cardiovascular risks.',
        gaugePercentage: 72
      },
      {
        name: 'HDL Cholesterol ("Good")',
        category: 'Lipid Profile',
        value: '48',
        unit: 'mg/dL',
        referenceRange: '> 40',
        status: 'normal',
        statusLabel: 'Healthy Level',
        simpleExplanation:
          'High-Density Lipoprotein acts like a scavenger or street-sweeper. It collects spare cholesterol from tissues and returns it to the liver for disposal.',
        whyItMatters:
          'Higher HDL levels are naturally protective and help keep arteries clear.',
        gaugePercentage: 55
      },
      {
        name: 'Triglycerides',
        category: 'Lipid Profile',
        value: '168',
        unit: 'mg/dL',
        referenceRange: '< 150',
        status: 'high',
        statusLabel: 'Borderline High',
        simpleExplanation:
          'Triglycerides are the main form of stored energy fat in your body, created when you consume calories your body does not immediately burn.',
        whyItMatters:
          'Moderating intake of refined sugars, alcohol, and processed carbohydrates typically helps bring triglycerides back into optimal range.',
        gaugePercentage: 65
      },
      {
        name: 'Total / HDL Ratio',
        category: 'Cardiovascular Risk Ratio',
        value: '4.6',
        unit: 'ratio',
        referenceRange: '< 5.0',
        status: 'normal',
        statusLabel: 'Optimal Balance',
        simpleExplanation:
          'This mathematical ratio compares total circulating cholesterol against your protective HDL cleaner cells.',
        whyItMatters:
          'A ratio below 5.0 suggests that despite elevated total numbers, your protective HDL is doing meaningful defensive work.',
        gaugePercentage: 45
      }
    ],
    doctorQuestions: [
      'Do my elevated LDL and Total Cholesterol warrant repeating this test in 3 to 6 months?',
      'Are there specific dietary changes (such as increasing soluble fiber or plant sterols) that you recommend for my numbers?',
      'Should we consider my family cardiovascular history before deciding on medication versus lifestyle changes?',
      'Would an advanced lipid particle check or ApoB test provide more clarity?'
    ],
    lifestyleTips: [
      'Increase soluble fiber intake by adding oats, lentils, chia seeds, and leafy greens to daily meals.',
      'Swap saturated cooking fats (like butter or deep-fry oils) with heart-friendly extra virgin olive oil or mustard oil.',
      'Engage in at least 150 minutes of moderate cardiovascular activity (e.g. brisk walking, cycling, or swimming) per week.',
      'Stay hydrated and limit sugary beverages and ultra-processed snacks.'
    ],
    rawExtractedText: `========================================================
APEX DIAGNOSTICS & PATHOLOGY LAB - CONFIDENTIAL
Accreditation No: ISO-15189 | Reg ID: 2026-X992
Patient ID: DEMO-PT-8291    Age: 42 Yrs    Gender: Female
Specimen: Serum Fasting (12 hrs)   Collected: 10-Nov-2026 07:30 AM
========================================================
INVESTIGATION                     RESULT     UNIT       REFERENCE INTERVAL
--------------------------------------------------------
Total Cholesterol                 224 (H)    mg/dL      < 200 (Desirable)
Triglycerides                     168 (H)    mg/dL      < 150 (Normal)
HDL Cholesterol                   48         mg/dL      > 40 (Optimal)
LDL Cholesterol (Calculated)      144 (H)    mg/dL      < 100 (Optimal)
VLDL Cholesterol                  32         mg/dL      05 - 40
Total / HDL Cholesterol Ratio     4.66                  < 5.0
--------------------------------------------------------
Methodology: Enzymatic Photometric / Friedewald Calculation
Comments: Serum clear. Correlate clinically with cardiovascular risk profile.
Report Authorized by: Dr. V. Sen, MD (Biochemistry)
========================================================`
  },
  {
    id: 'report-cbc-02',
    title: 'Complete Blood Count (CBC) & Anemia Screen',
    patientCode: 'DEMO-PT-4410',
    date: '04 Nov 2026',
    labName: 'Metro Healthcare Diagnostics',
    overallStatus: 'attention_needed',
    overallSummary:
      'This Complete Blood Count checks red cells, white defense cells, and blood-clotting platelets. Your results indicate mildly low Hemoglobin and Hematocrit, consistent with mild iron-deficiency or nutritional anemia. Platelets and infection-fighting white blood cells are completely normal.',
    keyTakeaways: [
      'Hemoglobin is 11.2 g/dL (normal range is typically 12.0 – 16.0 g/dL for women).',
      'Red blood cells are slightly smaller than average (MCV 76.2 fL).',
      'White blood cells (WBC) are at 6,800 /uL, signaling no active systemic infection.',
      'Platelet count is normal at 265,000 /uL, ensuring standard blood clotting.'
    ],
    parameters: [
      {
        name: 'Hemoglobin (Hb)',
        category: 'Red Blood Cells',
        value: '11.2',
        unit: 'g/dL',
        referenceRange: '12.0 - 16.0',
        status: 'low',
        statusLabel: 'Mildly Low',
        simpleExplanation:
          'Hemoglobin is the iron-rich protein in red blood cells that picks up oxygen from lungs and carries it to all muscles and organs.',
        whyItMatters:
          'When hemoglobin drops below normal, cells receive slightly less oxygen, which can cause mild fatigue, breathlessness on exertion, or pale skin.',
        gaugePercentage: 30
      },
      {
        name: 'Hematocrit (PCV)',
        category: 'Red Blood Cells',
        value: '33.8',
        unit: '%',
        referenceRange: '36.0 - 46.0',
        status: 'low',
        statusLabel: 'Below Range',
        simpleExplanation:
          'Hematocrit represents the percentage of whole blood that consists of red oxygen-carrying cells versus liquid plasma.',
        whyItMatters:
          'Closely mirrors hemoglobin and helps determine whether you have sufficient blood volume dedicated to oxygen transport.',
        gaugePercentage: 32
      },
      {
        name: 'Mean Corpuscular Volume (MCV)',
        category: 'Red Blood Cells',
        value: '76.2',
        unit: 'fL',
        referenceRange: '80.0 - 98.0',
        status: 'low',
        statusLabel: 'Microcytic (Smaller cells)',
        simpleExplanation:
          'MCV measures the physical average volume or size of individual red blood cells.',
        whyItMatters:
          'Smaller red cells often occur when iron supply is low, as the body struggles to fill each cell with adequate hemoglobin.',
        gaugePercentage: 28
      },
      {
        name: 'Total White Blood Cells (WBC)',
        category: 'Immune Defense',
        value: '6,800',
        unit: '/uL',
        referenceRange: '4,000 - 11,000',
        status: 'normal',
        statusLabel: 'Normal Defense',
        simpleExplanation:
          'White blood cells are your body’s frontline security guards, fighting off bacterial, viral, and fungal intruders.',
        whyItMatters:
          'A normal count indicates your immune system is calm and not currently reacting to a major infection or acute inflammation.',
        gaugePercentage: 50
      },
      {
        name: 'Platelet Count',
        category: 'Clotting Function',
        value: '265,000',
        unit: '/uL',
        referenceRange: '150,000 - 450,000',
        status: 'normal',
        statusLabel: 'Healthy Clotting',
        simpleExplanation:
          'Platelets are tiny disk-like cell fragments that clump together to plug cuts and stop bleeding.',
        whyItMatters:
          'Healthy counts ensure prompt wound healing without unprovoked bruising or bleeding.',
        gaugePercentage: 52
      }
    ],
    doctorQuestions: [
      'Should we check Serum Ferritin and Iron Binding Capacity (TIBC) to confirm iron levels?',
      'Would you recommend an oral iron supplement, and which formulation causes the least stomach upset?',
      'Could dietary iron adjustments or vitamin C pairings be sufficient?',
      'How soon should we repeat the CBC to verify if hemoglobin is rising?'
    ],
    lifestyleTips: [
      'Incorporate iron-rich foods such as spinach, beetroot, lentils, beans, fortified cereals, or lean proteins.',
      'Pair iron-rich foods with Vitamin C (such as a squeeze of lemon juice, oranges, or amla) to multiply iron absorption.',
      'Avoid drinking black tea or coffee within an hour of meals, as tannins can hinder iron absorption.',
      'Ensure restful sleep and stay hydrated to combat feelings of midday fatigue.'
    ],
    rawExtractedText: `========================================================
METRO HEALTHCARE DIAGNOSTICS - CLINICAL PATHOLOGY
Patient: DEMO-PT-4410       Age: 29 Yrs    Gender: Female
Specimen: Whole Blood EDTA  Date of Collection: 04-Nov-2026
========================================================
COMPLETE BLOOD COUNT (AUTOMATED HEMATOLOGY 5-PART)
--------------------------------------------------------
TEST NAME                          RESULT    UNIT       REFERENCE
Hemoglobin                         11.2 (L)  g/dL       12.0 - 16.0
Total RBC Count                    4.1       mil/uL     3.8 - 5.2
Hematocrit (PCV)                   33.8 (L)  %          36.0 - 46.0
MCV                                76.2 (L)  fL         80.0 - 98.0
MCH                                24.8 (L)  pg         27.0 - 32.0
MCHC                               32.5      g/dL       31.5 - 35.0
Total Leukocyte Count (WBC)        6,800     /uL        4,000 - 11,000
Platelet Count                     265,000   /uL        150,000 - 450,000
--------------------------------------------------------
Peripheral Smear Examination:
RBC: Microcytic hypochromic with mild anisocytosis.
WBC: Mature morphology, no blasts seen.
Platelets: Adequate on smear.
Impression: Microcytic hypochromic anemia. Suggest serum ferritin.
Dr. A. Verma, MBBS, DCP
========================================================`
  },
  {
    id: 'report-metabolic-03',
    title: 'Diabetic & Renal Function Screening',
    patientCode: 'DEMO-PT-1903',
    date: '28 Oct 2026',
    labName: 'Sunlight Care Clinical Laboratories',
    overallStatus: 'all_normal',
    overallSummary:
      'This screening examined kidney filtration and glucose balance. Your kidney markers (Creatinine, BUN, eGFR) are excellent and in optimal standing. Fasting glucose is completely normal, showing healthy metabolic regulation.',
    keyTakeaways: [
      'Fasting Blood Sugar is 88 mg/dL (well within the healthy 70 – 99 mg/dL window).',
      'Serum Creatinine is 0.82 mg/dL, showing efficient waste filtration.',
      'Estimated GFR is > 95 mL/min, representing robust kidney performance.',
      'Blood Urea Nitrogen (BUN) is normal at 13 mg/dL.'
    ],
    parameters: [
      {
        name: 'Fasting Blood Glucose',
        category: 'Metabolic & Sugar',
        value: '88',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        status: 'normal',
        statusLabel: 'Optimal Fasting',
        simpleExplanation:
          'Measures circulating glucose after an overnight fast. It indicates how well your pancreas produces insulin and how receptive your cells are to taking in sugar.',
        whyItMatters:
          'Maintaining fasting glucose under 100 mg/dL protects long-term blood vessel health and guards against diabetes.',
        gaugePercentage: 42
      },
      {
        name: 'Serum Creatinine',
        category: 'Renal Function',
        value: '0.82',
        unit: 'mg/dL',
        referenceRange: '0.60 - 1.20',
        status: 'normal',
        statusLabel: 'Healthy Filtration',
        simpleExplanation:
          'Creatinine is a steady, natural byproduct of normal muscle wear and tear that healthy kidneys continuously eliminate into urine.',
        whyItMatters:
          'Stable, low levels are the gold standard confirmation that your kidneys are filtering clean blood.',
        gaugePercentage: 38
      },
      {
        name: 'Estimated GFR (eGFR)',
        category: 'Renal Function',
        value: '> 95',
        unit: 'mL/min/1.73m²',
        referenceRange: '> 90',
        status: 'normal',
        statusLabel: 'Excellent Filtration Rate',
        simpleExplanation:
          'Estimated Glomerular Filtration Rate calculates how many milliliters of blood your microscopic kidney filters clean every single minute.',
        whyItMatters:
          'Values above 90 represent top-tier, healthy kidney performance.',
        gaugePercentage: 55
      },
      {
        name: 'Blood Urea Nitrogen (BUN)',
        category: 'Renal Function',
        value: '13',
        unit: 'mg/dL',
        referenceRange: '7 - 20',
        status: 'normal',
        statusLabel: 'Normal Waste Balance',
        simpleExplanation:
          'Measures urea nitrogen, which forms when your body breaks down dietary proteins.',
        whyItMatters:
          'Normal readings indicate a balanced intake of protein and adequate everyday hydration.',
        gaugePercentage: 44
      }
    ],
    doctorQuestions: [
      'Given that these metabolic markers are in good standing, should we keep to annual preventive screening?',
      'Would it be beneficial to include an HbA1c (3-month blood sugar average) test in my next routine checkup?',
      'Are there any electrolyte markers (Sodium, Potassium) you suggest tracking in the future?'
    ],
    lifestyleTips: [
      'Maintain adequate hydration (2–2.5 liters of clean water daily) to keep kidneys flushing waste smoothly.',
      'Continue whole-food nutrition focusing on complex carbohydrates and moderate dietary protein.',
      'Maintain regular physical activity to sustain cellular insulin sensitivity.'
    ],
    rawExtractedText: `========================================================
SUNLIGHT CARE CLINICAL LABORATORIES
Patient ID: DEMO-PT-1903    Age: 36 Yrs    Gender: Male
Specimen: Serum (Fasting 10 hrs)   Reported: 28-Oct-2026
========================================================
TEST                               RESULT    UNIT       REFERENCE
Fasting Blood Glucose              88        mg/dL      70 - 99
Serum Creatinine                   0.82      mg/dL      0.60 - 1.20
Estimated GFR (CKD-EPI 2021)       > 95      mL/min     > 90
Blood Urea Nitrogen (BUN)          13        mg/dL      7 - 20
BUN / Creatinine Ratio             15.8                 10.0 - 20.0
Uric Acid                          5.2       mg/dL      3.5 - 7.2
--------------------------------------------------------
Clinical Note: Renal and glycemic profiles within normal reference ranges.
Dr. R. Kulkarni, MD Pathology
========================================================`
  }
];
