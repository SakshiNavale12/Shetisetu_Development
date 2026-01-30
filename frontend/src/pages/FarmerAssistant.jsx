import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const faqData = [
  {
    category: 'Scheme Eligibility',
    categoryMr: 'योजना पात्रता',
    icon: '🎯',
    questions: [
      {
        id: 1,
        question: 'Who is eligible for PM-KISAN scheme?',
        questionMr: 'पीएम-किसान योजनेसाठी कोण पात्र आहे?',
        answer: 'All landholding farmer families are eligible for PM-KISAN. The family should have cultivable land in their name. Small and marginal farmers with landholding up to 2 hectares get priority. The scheme provides ₹6,000 per year in three equal installments of ₹2,000 each.',
        answerMr: 'सर्व जमीनधारक शेतकरी कुटुंबे पीएम-किसानसाठी पात्र आहेत. कुटुंबाच्या नावावर लागवडीयोग्य जमीन असावी. 2 हेक्टरपर्यंत जमीनधारणा असलेल्या लहान आणि सीमांत शेतकऱ्यांना प्राधान्य मिळते. योजना दरवर्षी ₹6,000 प्रत्येकी ₹2,000 च्या तीन समान हप्त्यांमध्ये प्रदान करते.'
      },
      {
        id: 2,
        question: 'Am I eligible for Pradhan Mantri Fasal Bima Yojana (PMFBY)?',
        questionMr: 'मी प्रधानमंत्री फसल बीमा योजनेसाठी (PMFBY) पात्र आहे का?',
        answer: 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas are eligible. Both loanee and non-loanee farmers can enroll. You need to have insurable interest in the crop. Premium rates are: Kharif - 2%, Rabi - 1.5%, Commercial/Horticultural - 5%.',
        answerMr: 'अधिसूचित क्षेत्रात अधिसूचित पिके घेणारे सर्व शेतकरी, वाटेकरी आणि भाडेकरू शेतकऱ्यांसह पात्र आहेत. कर्जदार आणि बिगर-कर्जदार दोन्ही शेतकरी नोंदणी करू शकतात. तुमचा पिकात विमायोग्य हित असणे आवश्यक आहे. प्रीमियम दर: खरीप - 2%, रबी - 1.5%, व्यावसायिक/फलोत्पादन - 5%.'
      },
      {
        id: 3,
        question: 'What are the eligibility criteria for Kisan Credit Card (KCC)?',
        questionMr: 'किसान क्रेडिट कार्ड (KCC) साठी पात्रता निकष काय आहेत?',
        answer: 'Farmers who own or lease agricultural land are eligible. Sharecroppers, tenant farmers, and oral lessees are also eligible. You need to be engaged in crop production, animal husbandry, or fisheries. Age should be between 18-75 years. For senior citizens above 60, a co-borrower is required.',
        answerMr: 'शेतजमीन मालक किंवा भाडेतत्त्वावर घेणारे शेतकरी पात्र आहेत. वाटेकरी, भाडेकरू शेतकरी आणि तोंडी भाडेकरू देखील पात्र आहेत. तुम्ही पीक उत्पादन, पशुसंवर्धन किंवा मत्स्यपालनात गुंतलेले असणे आवश्यक आहे. वय 18-75 वर्षे दरम्यान असावे. 60 वर्षांवरील ज्येष्ठ नागरिकांसाठी सह-कर्जदार आवश्यक आहे.'
      },
      {
        id: 4,
        question: 'Who can avail benefits under Soil Health Card Scheme?',
        questionMr: 'माती आरोग्य कार्ड योजनेंतर्गत कोण लाभ घेऊ शकतो?',
        answer: 'All farmers across India are eligible for Soil Health Card. There is no restriction based on land size or type of farming. The scheme provides free soil testing and recommendations for nutrients and fertilizers. Cards are issued every 2 years with updated soil health status.',
        answerMr: 'भारतातील सर्व शेतकरी माती आरोग्य कार्डसाठी पात्र आहेत. जमिनीचा आकार किंवा शेतीच्या प्रकारावर आधारित कोणतेही बंधन नाही. योजना मोफत माती चाचणी आणि पोषक आणि खतांसाठी शिफारसी प्रदान करते. अद्ययावत माती आरोग्य स्थितीसह दर 2 वर्षांनी कार्ड जारी केले जातात.'
      }
    ]
  },
  {
    category: 'Application Process',
    categoryMr: 'अर्ज प्रक्रिया',
    icon: '📝',
    questions: [
      {
        id: 5,
        question: 'How do I apply for PM-KISAN?',
        questionMr: 'मी पीएम-किसानसाठी कसा अर्ज करू?',
        answer: 'You can apply through: 1) Visit pmkisan.gov.in and click on "New Farmer Registration" 2) Visit your nearest CSC (Common Service Centre) 3) Contact your local agriculture office 4) Through ShetiSetu portal. Documents needed: Aadhaar card, Bank account details, Land ownership documents (7/12 extract).',
        answerMr: 'तुम्ही यामार्फत अर्ज करू शकता: 1) pmkisan.gov.in वर जा आणि "नवीन शेतकरी नोंदणी" वर क्लिक करा 2) तुमच्या जवळच्या CSC (सामान्य सेवा केंद्र) ला भेट द्या 3) तुमच्या स्थानिक कृषी कार्यालयाशी संपर्क साधा 4) शेतीसेतू पोर्टलद्वारे. आवश्यक कागदपत्रे: आधार कार्ड, बँक खाते तपशील, जमीन मालकी कागदपत्रे (7/12 उतारा).'
      },
      {
        id: 6,
        question: 'What is the process to file a crop loss report?',
        questionMr: 'पीक नुकसान अहवाल दाखल करण्याची प्रक्रिया काय आहे?',
        answer: 'Step 1: Report loss within 72 hours of calamity. Step 2: Login to ShetiSetu and go to "Loss Reports". Step 3: Fill details - crop type, area affected, damage percentage, cause of loss. Step 4: Upload photos of damaged crops. Step 5: Submit for verification. An agriculture officer will visit for inspection and create e-Panchanama.',
        answerMr: 'पायरी 1: आपत्तीच्या 72 तासांच्या आत नुकसान नोंदवा. पायरी 2: शेतीसेतूवर लॉगिन करा आणि "नुकसान अहवाल" वर जा. पायरी 3: तपशील भरा - पीक प्रकार, प्रभावित क्षेत्र, नुकसान टक्केवारी, नुकसानाचे कारण. पायरी 4: खराब झालेल्या पिकांचे फोटो अपलोड करा. पायरी 5: पडताळणीसाठी सबमिट करा. कृषी अधिकारी तपासणीसाठी भेट देतील आणि ई-पंचनामा तयार करतील.'
      },
      {
        id: 7,
        question: 'How to apply for crop insurance under PMFBY?',
        questionMr: 'PMFBY अंतर्गत पीक विम्यासाठी कसा अर्ज करायचा?',
        answer: 'For loanee farmers: Insurance is compulsory and done automatically by banks. For non-loanee farmers: 1) Visit pmfby.gov.in or CSC centre 2) Fill the application with crop and land details 3) Pay the premium amount 4) Submit land records and bank details. Deadline: 7 days before sowing for Kharif, 15 days before sowing for Rabi.',
        answerMr: 'कर्जदार शेतकऱ्यांसाठी: विमा अनिवार्य आहे आणि बँकांद्वारे आपोआप केला जातो. बिगर-कर्जदार शेतकऱ्यांसाठी: 1) pmfby.gov.in किंवा CSC केंद्राला भेट द्या 2) पीक आणि जमीन तपशीलासह अर्ज भरा 3) प्रीमियम रक्कम भरा 4) जमीन नोंदी आणि बँक तपशील सबमिट करा. अंतिम मुदत: खरीपसाठी पेरणीपूर्वी 7 दिवस, रबीसाठी पेरणीपूर्वी 15 दिवस.'
      },
      {
        id: 8,
        question: 'How do I get a Kisan Credit Card?',
        questionMr: 'मला किसान क्रेडिट कार्ड कसे मिळेल?',
        answer: 'Step 1: Visit your nearest bank branch (cooperative, regional rural, or commercial bank). Step 2: Fill KCC application form. Step 3: Submit documents: ID proof, address proof, land documents (7/12, 8-A), passport photos. Step 4: Bank will verify and process within 14 days. Step 5: Receive KCC with credit limit based on land holding and crops.',
        answerMr: 'पायरी 1: तुमच्या जवळच्या बँक शाखेला भेट द्या (सहकारी, प्रादेशिक ग्रामीण किंवा व्यावसायिक बँक). पायरी 2: KCC अर्ज फॉर्म भरा. पायरी 3: कागदपत्रे सबमिट करा: ओळखपत्र, पत्ता पुरावा, जमीन कागदपत्रे (7/12, 8-A), पासपोर्ट फोटो. पायरी 4: बँक 14 दिवसांत सत्यापन आणि प्रक्रिया करेल. पायरी 5: जमीन धारणा आणि पिकांवर आधारित क्रेडिट मर्यादेसह KCC प्राप्त करा.'
      }
    ]
  },
  {
    category: 'Compensation & Benefits',
    categoryMr: 'भरपाई आणि लाभ',
    icon: '💰',
    questions: [
      {
        id: 9,
        question: 'How is crop loss compensation calculated?',
        questionMr: 'पीक नुकसान भरपाईची गणना कशी केली जाते?',
        answer: 'Compensation is calculated based on: 1) Type of crop (food grain, commercial, horticultural) 2) Extent of damage (percentage) 3) Area affected (in hectares) 4) Government-notified rates per hectare. For >33% damage: Full compensation. For PMFBY insured crops: Additional insurance claim. Maximum limit varies by state and crop type.',
        answerMr: 'भरपाईची गणना यावर आधारित आहे: 1) पिकाचा प्रकार (अन्नधान्य, व्यावसायिक, फलोत्पादन) 2) नुकसानाची व्याप्ती (टक्केवारी) 3) प्रभावित क्षेत्र (हेक्टरमध्ये) 4) प्रति हेक्टर सरकारी अधिसूचित दर. >33% नुकसानासाठी: पूर्ण भरपाई. PMFBY विमाकृत पिकांसाठी: अतिरिक्त विमा दावा. कमाल मर्यादा राज्य आणि पीक प्रकारानुसार बदलते.'
      },
      {
        id: 10,
        question: 'When will I receive my compensation after loss report approval?',
        questionMr: 'नुकसान अहवाल मंजूर झाल्यानंतर मला भरपाई कधी मिळेल?',
        answer: 'Timeline after approval: 1) Verification by officer: 7-15 days 2) e-Panchanama creation: 2-3 days 3) District level approval: 15-30 days 4) Fund disbursement: 15-30 days after final approval. Total expected time: 45-60 days. Amount is directly credited to your registered bank account via DBT (Direct Benefit Transfer).',
        answerMr: 'मंजुरीनंतर वेळापत्रक: 1) अधिकाऱ्याकडून पडताळणी: 7-15 दिवस 2) ई-पंचनामा निर्मिती: 2-3 दिवस 3) जिल्हा स्तरीय मंजुरी: 15-30 दिवस 4) निधी वितरण: अंतिम मंजुरीनंतर 15-30 दिवस. एकूण अपेक्षित वेळ: 45-60 दिवस. रक्कम थेट तुमच्या नोंदणीकृत बँक खात्यात DBT (थेट लाभ हस्तांतरण) द्वारे जमा केली जाते.'
      },
      {
        id: 11,
        question: 'What benefits do I get under KCC?',
        questionMr: 'KCC अंतर्गत मला कोणते फायदे मिळतात?',
        answer: 'KCC Benefits: 1) Credit limit up to ₹3 lakh at 4% interest (with interest subvention) 2) Flexible withdrawal and repayment 3) No processing fee for loans up to ₹3 lakh 4) Personal accident insurance of ₹50,000 5) Crop insurance coverage 6) One-time documentation, valid for 5 years 7) Can be used at ATMs for cash withdrawal.',
        answerMr: 'KCC फायदे: 1) 4% व्याजावर ₹3 लाखापर्यंत क्रेडिट मर्यादा (व्याज सवलतीसह) 2) लवचिक काढणे आणि परतफेड 3) ₹3 लाखापर्यंत कर्जासाठी प्रक्रिया शुल्क नाही 4) ₹50,000 चा वैयक्तिक अपघात विमा 5) पीक विमा संरक्षण 6) एकदाच कागदपत्रे, 5 वर्षे वैध 7) रोख काढण्यासाठी ATM वर वापरता येते.'
      }
    ]
  },
  {
    category: 'Documents Required',
    categoryMr: 'आवश्यक कागदपत्रे',
    icon: '📄',
    questions: [
      {
        id: 12,
        question: 'What documents are needed for eKYC verification?',
        questionMr: 'eKYC पडताळणीसाठी कोणती कागदपत्रे आवश्यक आहेत?',
        answer: 'Required documents for eKYC: 1) Aadhaar Card (mandatory) 2) PAN Card 3) 7/12 Extract (Satbara Utara) - land ownership proof 4) 8-A Extract - land mutation record 5) Bank Passbook (first page with account details) 6) Lease agreement (if tenant farmer). All documents should be clear and legible.',
        answerMr: 'eKYC साठी आवश्यक कागदपत्रे: 1) आधार कार्ड (अनिवार्य) 2) पॅन कार्ड 3) 7/12 उतारा (सातबारा उतारा) - जमीन मालकी पुरावा 4) 8-A उतारा - जमीन हस्तांतरण नोंद 5) बँक पासबुक (खाते तपशीलासह पहिले पान) 6) भाडे करार (भाडेकरू शेतकरी असल्यास). सर्व कागदपत्रे स्पष्ट आणि वाचनीय असावीत.'
      },
      {
        id: 13,
        question: 'What is 7/12 extract and why is it important?',
        questionMr: '7/12 उतारा म्हणजे काय आणि तो का महत्त्वाचा आहे?',
        answer: '7/12 extract (Satbara Utara) is a land record document in Maharashtra that shows: 1) Survey number and land area 2) Owner name and co-owners 3) Type of land (irrigated/non-irrigated) 4) Crops grown 5) Any loans or encumbrances. It is essential for: scheme eligibility, crop surveys, loss reports, and bank loans.',
        answerMr: '7/12 उतारा (सातबारा उतारा) हा महाराष्ट्रातील जमीन नोंदी दस्तऐवज आहे जो दर्शवतो: 1) सर्वे क्रमांक आणि जमीन क्षेत्र 2) मालकाचे नाव आणि सह-मालक 3) जमिनीचा प्रकार (सिंचित/बिगर-सिंचित) 4) घेतलेली पिके 5) कोणतेही कर्ज किंवा भार. हे यासाठी आवश्यक आहे: योजना पात्रता, पीक सर्वेक्षण, नुकसान अहवाल आणि बँक कर्ज.'
      },
      {
        id: 14,
        question: 'How do I get my 7/12 extract online?',
        questionMr: 'मला माझा 7/12 उतारा ऑनलाइन कसा मिळेल?',
        answer: 'To get 7/12 online in Maharashtra: 1) Visit mahabhulekh.maharashtra.gov.in 2) Select your Division > District > Taluka > Village 3) Search by survey number or owner name 4) View and download the 7/12 extract 5) For certified copy, visit Talathi office or use Digital Seva portal. The online copy is free, certified copy costs ₹15-30.',
        answerMr: 'महाराष्ट्रात 7/12 ऑनलाइन मिळवण्यासाठी: 1) mahabhulekh.maharashtra.gov.in वर जा 2) तुमचा विभाग > जिल्हा > तालुका > गाव निवडा 3) सर्वे क्रमांक किंवा मालकाच्या नावाने शोधा 4) 7/12 उतारा पहा आणि डाउनलोड करा 5) प्रमाणित प्रतीसाठी, तलाठी कार्यालयाला भेट द्या किंवा डिजिटल सेवा पोर्टल वापरा. ऑनलाइन प्रत मोफत आहे, प्रमाणित प्रतीची किंमत ₹15-30 आहे.'
      }
    ]
  },
  {
    category: 'Common Issues',
    categoryMr: 'सामान्य समस्या',
    icon: '❓',
    questions: [
      {
        id: 15,
        question: 'My PM-KISAN installment is not credited. What should I do?',
        questionMr: 'माझा पीएम-किसान हप्ता जमा झाला नाही. मी काय करावे?',
        answer: 'Common reasons and solutions: 1) Aadhaar not linked to bank - Visit bank to link 2) Wrong bank details - Update on pmkisan.gov.in 3) Name mismatch - Ensure name matches in Aadhaar, bank, and land records 4) Land records not updated - Contact Talathi office 5) Check status on pmkisan.gov.in using "Beneficiary Status" option. For grievances, call helpline: 155261 or 011-24300606.',
        answerMr: 'सामान्य कारणे आणि उपाय: 1) आधार बँकेशी जोडलेले नाही - जोडण्यासाठी बँकेला भेट द्या 2) चुकीचे बँक तपशील - pmkisan.gov.in वर अपडेट करा 3) नाव जुळत नाही - आधार, बँक आणि जमीन नोंदींमध्ये नाव जुळत असल्याची खात्री करा 4) जमीन नोंदी अद्ययावत नाहीत - तलाठी कार्यालयाशी संपर्क साधा 5) "लाभार्थी स्थिती" पर्याय वापरून pmkisan.gov.in वर स्थिती तपासा. तक्रारींसाठी, हेल्पलाइनवर कॉल करा: 155261 किंवा 011-24300606.'
      },
      {
        id: 16,
        question: 'My crop loss report was rejected. What can I do?',
        questionMr: 'माझा पीक नुकसान अहवाल नाकारला गेला. मी काय करू शकतो?',
        answer: 'If your loss report is rejected: 1) Check the rejection reason in your dashboard 2) Common reasons: insufficient evidence, damage below threshold, late submission 3) You can file an appeal within 15 days 4) Gather additional evidence - more photos, witness statements 5) Contact your local agriculture officer for guidance 6) Re-submit with correct information if allowed.',
        answerMr: 'तुमचा नुकसान अहवाल नाकारला गेल्यास: 1) तुमच्या डॅशबोर्डमध्ये नकाराचे कारण तपासा 2) सामान्य कारणे: अपुरा पुरावा, नुकसान मर्यादेपेक्षा कमी, उशीरा सादरीकरण 3) तुम्ही 15 दिवसांच्या आत अपील दाखल करू शकता 4) अतिरिक्त पुरावे गोळा करा - अधिक फोटो, साक्षीदार विधान 5) मार्गदर्शनासाठी तुमच्या स्थानिक कृषी अधिकाऱ्याशी संपर्क साधा 6) परवानगी असल्यास योग्य माहितीसह पुन्हा सबमिट करा.'
      },
      {
        id: 17,
        question: 'How do I update my bank account details for compensation?',
        questionMr: 'भरपाईसाठी माझे बँक खाते तपशील कसे अपडेट करायचे?',
        answer: 'To update bank details: 1) Login to ShetiSetu portal 2) Go to "My Profile" section 3) Click "Edit" on bank details 4) Enter new account number, IFSC code, bank name 5) Upload new passbook photo 6) Submit for verification. Note: Changes take 7-10 days to reflect. Pending payments will be processed to the new account after verification.',
        answerMr: 'बँक तपशील अपडेट करण्यासाठी: 1) शेतीसेतू पोर्टलवर लॉगिन करा 2) "माझे प्रोफाइल" विभागात जा 3) बँक तपशीलावर "संपादित करा" क्लिक करा 4) नवीन खाते क्रमांक, IFSC कोड, बँक नाव प्रविष्ट करा 5) नवीन पासबुक फोटो अपलोड करा 6) पडताळणीसाठी सबमिट करा. टीप: बदल प्रतिबिंबित होण्यासाठी 7-10 दिवस लागतात. पडताळणीनंतर प्रलंबित पेमेंट नवीन खात्यात प्रक्रिया केली जाईल.'
      }
    ]
  },
  {
    category: 'Contact & Help',
    categoryMr: 'संपर्क आणि मदत',
    icon: '📞',
    questions: [
      {
        id: 18,
        question: 'Who should I contact for scheme-related queries?',
        questionMr: 'योजना-संबंधित प्रश्नांसाठी मी कोणाशी संपर्क साधावा?',
        answer: 'Contact points: 1) PM-KISAN Helpline: 155261, 011-24300606 2) PMFBY Helpline: 1800-180-1551 3) KCC: Contact your bank branch 4) Local Agriculture Office: Taluka Krishi Adhikari 5) ShetiSetu Support: Through the portal 6) Common Service Centre (CSC) for document help. Office hours: Mon-Sat, 10 AM - 5 PM.',
        answerMr: 'संपर्क बिंदू: 1) पीएम-किसान हेल्पलाइन: 155261, 011-24300606 2) PMFBY हेल्पलाइन: 1800-180-1551 3) KCC: तुमच्या बँक शाखेशी संपर्क साधा 4) स्थानिक कृषी कार्यालय: तालुका कृषी अधिकारी 5) शेतीसेतू सपोर्ट: पोर्टलद्वारे 6) कागदपत्र मदतीसाठी सामान्य सेवा केंद्र (CSC). कार्यालय वेळ: सोम-शनि, सकाळी 10 - संध्याकाळी 5.'
      },
      {
        id: 19,
        question: 'Where is my nearest agriculture office?',
        questionMr: 'माझे जवळचे कृषी कार्यालय कुठे आहे?',
        answer: 'To find your nearest agriculture office: 1) Visit the Maharashtra Agriculture Department website 2) Select your district and taluka 3) The Taluka Agriculture Office handles most farmer services 4) For district-level issues, contact the District Agriculture Officer (DAO) 5) You can also ask at your Gram Panchayat office for local Krishi Sahayak contact.',
        answerMr: 'तुमचे जवळचे कृषी कार्यालय शोधण्यासाठी: 1) महाराष्ट्र कृषी विभाग वेबसाइटला भेट द्या 2) तुमचा जिल्हा आणि तालुका निवडा 3) तालुका कृषी कार्यालय बहुतेक शेतकरी सेवा हाताळते 4) जिल्हा-स्तरीय समस्यांसाठी, जिल्हा कृषी अधिकारी (DAO) शी संपर्क साधा 5) स्थानिक कृषी सहायक संपर्कासाठी तुम्ही तुमच्या ग्राम पंचायत कार्यालयात देखील विचारू शकता.'
      },
      {
        id: 20,
        question: 'What are the helpline numbers for agricultural emergencies?',
        questionMr: 'कृषी आणीबाणीसाठी हेल्पलाइन नंबर काय आहेत?',
        answer: 'Emergency helplines: 1) Kisan Call Centre: 1551 (toll-free, 6 AM - 10 PM) 2) State Agriculture Helpline: 1800-233-4000 3) Disaster Management: 1070 4) Animal Husbandry Helpline: 1962 5) For pest/disease outbreak: Contact nearest Krishi Vigyan Kendra (KVK). All helplines have Marathi language support available.',
        answerMr: 'आणीबाणी हेल्पलाइन: 1) किसान कॉल सेंटर: 1551 (टोल-फ्री, सकाळी 6 - रात्री 10) 2) राज्य कृषी हेल्पलाइन: 1800-233-4000 3) आपत्ती व्यवस्थापन: 1070 4) पशुसंवर्धन हेल्पलाइन: 1962 5) कीड/रोग उद्रेकासाठी: जवळच्या कृषी विज्ञान केंद्राशी (KVK) संपर्क साधा. सर्व हेल्पलाइनवर मराठी भाषा समर्थन उपलब्ध आहे.'
      }
    ]
  }
];

function FarmerAssistant() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' or 'mr'

  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => {
      const query = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(query) ||
        q.questionMr.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.answerMr.toLowerCase().includes(query)
      );
    })
  })).filter(category => category.questions.length > 0);

  const handleCategoryClick = (categoryIndex) => {
    setSelectedCategory(selectedCategory === categoryIndex ? null : categoryIndex);
    setSelectedQuestion(null);
  };

  const handleQuestionClick = (questionId) => {
    setSelectedQuestion(selectedQuestion === questionId ? null : questionId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-8 px-4 sm:px-8 py-6 text-white rounded-b-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              🤖 Farmer Assistant / शेतकरी सहाय्यक
            </h1>
            <p className="text-green-100">
              Get answers to common questions about schemes, eligibility & processes
            </p>
            <p className="text-green-200 text-sm">
              योजना, पात्रता आणि प्रक्रियांबद्दल सामान्य प्रश्नांची उत्तरे मिळवा
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-white text-green-700'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                language === 'mr'
                  ? 'bg-white text-green-700'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              मराठी
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder={language === 'en' ? "Search for questions..." : "प्रश्न शोधा..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center bg-blue-50">
          <div className="text-2xl mb-1">📋</div>
          <p className="text-lg font-bold text-blue-700">{faqData.reduce((acc, cat) => acc + cat.questions.length, 0)}</p>
          <p className="text-xs text-blue-600">{language === 'en' ? 'Total FAQs' : 'एकूण प्रश्न'}</p>
        </Card>
        <Card className="text-center bg-green-50">
          <div className="text-2xl mb-1">🏛️</div>
          <p className="text-lg font-bold text-green-700">4+</p>
          <p className="text-xs text-green-600">{language === 'en' ? 'Schemes Covered' : 'योजना समाविष्ट'}</p>
        </Card>
        <Card className="text-center bg-amber-50">
          <div className="text-2xl mb-1">📞</div>
          <p className="text-lg font-bold text-amber-700">5+</p>
          <p className="text-xs text-amber-600">{language === 'en' ? 'Helplines' : 'हेल्पलाइन'}</p>
        </Card>
        <Card className="text-center bg-purple-50">
          <div className="text-2xl mb-1">🌐</div>
          <p className="text-lg font-bold text-purple-700">2</p>
          <p className="text-xs text-purple-600">{language === 'en' ? 'Languages' : 'भाषा'}</p>
        </Card>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          {language === 'en' ? 'Browse by Category' : 'श्रेणीनुसार ब्राउझ करा'}
        </h2>

        {filteredData.length === 0 ? (
          <Card className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">
              {language === 'en'
                ? 'No questions found matching your search.'
                : 'तुमच्या शोधाशी जुळणारे प्रश्न सापडले नाहीत.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              {language === 'en' ? 'Clear Search' : 'शोध साफ करा'}
            </Button>
          </Card>
        ) : (
          filteredData.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => handleCategoryClick(categoryIndex)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {language === 'en' ? category.category : category.categoryMr}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.questions.length} {language === 'en' ? 'questions' : 'प्रश्न'}
                    </p>
                  </div>
                </div>
                <span className={`text-gray-400 transition-transform ${selectedCategory === categoryIndex ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Questions List */}
              {selectedCategory === categoryIndex && (
                <div className="border-t border-gray-100">
                  {category.questions.map((q) => (
                    <div key={q.id} className="border-b border-gray-50 last:border-b-0">
                      {/* Question */}
                      <button
                        onClick={() => handleQuestionClick(q.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-green-600 mt-1">❓</span>
                          <p className="text-gray-700 font-medium">
                            {language === 'en' ? q.question : q.questionMr}
                          </p>
                        </div>
                        <span className={`text-green-600 ml-2 transition-transform ${selectedQuestion === q.id ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {/* Answer */}
                      {selectedQuestion === q.id && (
                        <div className="px-4 pb-4 bg-green-50">
                          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-l-4 border-green-500">
                            <span className="text-green-600 mt-1">💡</span>
                            <div>
                              <p className="text-gray-700 leading-relaxed">
                                {language === 'en' ? q.answer : q.answerMr}
                              </p>
                              {language === 'en' && (
                                <p className="text-gray-500 text-sm mt-3 pt-3 border-t border-gray-200">
                                  <span className="font-medium">मराठी:</span> {q.answerMr}
                                </p>
                              )}
                              {language === 'mr' && (
                                <p className="text-gray-500 text-sm mt-3 pt-3 border-t border-gray-200">
                                  <span className="font-medium">English:</span> {q.answer}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Quick Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-start gap-4">
          <span className="text-4xl">📞</span>
          <div>
            <h3 className="font-bold text-blue-800 mb-2">
              {language === 'en' ? 'Need More Help?' : 'अधिक मदत हवी आहे?'}
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              {language === 'en'
                ? 'Contact these helplines for immediate assistance:'
                : 'तात्काळ सहाय्यासाठी या हेल्पलाइनशी संपर्क साधा:'}
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-blue-200 px-2 py-1 rounded text-blue-800 font-mono">1551</span>
                <span className="text-blue-700">Kisan Call Centre</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-200 px-2 py-1 rounded text-blue-800 font-mono">155261</span>
                <span className="text-blue-700">PM-KISAN Helpline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-200 px-2 py-1 rounded text-blue-800 font-mono">1800-180-1551</span>
                <span className="text-blue-700">PMFBY Helpline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-200 px-2 py-1 rounded text-blue-800 font-mono">1800-233-4000</span>
                <span className="text-blue-700">State Agriculture</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm pb-4">
        <p>{language === 'en'
          ? 'Information is updated regularly. For official details, please visit government websites.'
          : 'माहिती नियमितपणे अद्ययावत केली जाते. अधिकृत तपशीलांसाठी, कृपया सरकारी वेबसाइटला भेट द्या.'}
        </p>
      </div>
    </div>
  );
}

export default FarmerAssistant;
