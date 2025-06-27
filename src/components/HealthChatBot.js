import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaUserMd, FaUser } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';

const RULES = [
  {
    keywords: ['cough', 'cold'],
    response: "For coughs and colds: Rest, stay hydrated, and try warm fluids. If you have a high fever, difficulty breathing, or symptoms persist more than a week, consult a doctor."
  },
  {
    keywords: ['headache', 'head pain'],    
    response: "For headaches: Rest in a quiet, dark room, drink water, and avoid screens. If the pain is severe, sudden, or with other symptoms (like vision changes or nausea), seek medical advice."
  },
  {
    keywords: ['body pain', 'body ache', 'muscle pain'],
    response: "For body pain: Gentle stretching, rest, and hydration can help. Over-the-counter pain relief may be used if needed. If pain is severe, persistent, or with fever, consult a doctor."
  },
  {
    keywords: ['fever'],
    response: "For fever: Rest, drink fluids, and monitor your temperature. If fever is high (>102°F/39°C), lasts more than 3 days, or is with other symptoms, see a doctor."
  },
  {
    keywords: ['sore throat'],
    response: "For sore throat: Warm salt water gargles, honey in tea, and lozenges can help. If you have trouble swallowing, high fever, or it lasts more than a week, consult a doctor."
  },
  {
    keywords: ['stomach ache', 'stomach pain', 'abdominal pain'],
    response: "For stomach pain: Try small sips of water, bland foods like crackers, and avoid dairy. If pain is severe, persistent, or with vomiting/diarrhea for >24 hours, seek medical care."
  },
  {
    keywords: ['diarrhea'],
    response: "For diarrhea: Drink plenty of fluids, eat bland foods (BRAT diet: bananas, rice, applesauce, toast). If it lasts >2 days, has blood, or with fever/dehydration signs, see a doctor."
  },
  {
    keywords: ['vomiting', 'throwing up'],
    response: "For vomiting: Sip clear fluids slowly, avoid solid foods for a few hours. If vomiting persists >24 hours, has blood, or with severe abdominal pain, seek medical help."
  },
  {
    keywords: ['heartburn', 'acid reflux'],
    response: "For heartburn: Avoid spicy/fatty foods, eat smaller meals, don't lie down after eating. Antacids may help. If frequent (>2x/week) or severe, consult a doctor."
  },
  {
    keywords: ['constipation'],
    response: "For constipation: Drink more water, eat fiber-rich foods, and stay active. Over-the-counter remedies may help. If lasting >1 week or with severe pain, see a doctor."
  },
  {
    keywords: ['rash', 'skin rash'],
    response: "For rashes: Keep the area clean and dry, avoid scratching. Mild hydrocortisone cream may help. If rash spreads, has blisters, or with fever, seek medical advice."
  },
  {
    keywords: ['itchy skin', 'itching'],
    response: "For itchy skin: Use fragrance-free moisturizers, cool compresses, and avoid hot showers. Antihistamines may help. If severe or with swelling/difficulty breathing, seek immediate care."
  },
  {
    keywords: ['sunburn'],
    response: "For sunburn: Cool compresses, aloe vera gel, and pain relievers can help. Stay hydrated. If severe with blisters, fever, or dizziness, seek medical attention."
  },
  {
    keywords: ['insomnia', 'trouble sleeping'],
    response: "For insomnia: Maintain a regular sleep schedule, limit screens before bed, and avoid caffeine late in the day. If persistent (>1 month) or affecting daily life, consult a doctor."
  },
  {
    keywords: ['anxiety', 'feeling anxious'],
    response: "For anxiety: Deep breathing exercises, meditation, and regular exercise can help. Limit caffeine/alcohol. If interfering with daily life or causing panic attacks, seek professional help."
  },
  {
    keywords: ['depression', 'feeling depressed'],
    response: "For depression: Maintain routines, stay connected with loved ones, and get regular exercise. If symptoms persist >2 weeks or include suicidal thoughts, seek professional help immediately."
  },
  {
    keywords: ['back pain'],
    response: "For back pain: Gentle stretches, heat/ice therapy, and over-the-counter pain relievers may help. Avoid heavy lifting. If pain radiates down legs or with numbness/weakness, see a doctor."
  },
  {
    keywords: ['neck pain'],
    response: "For neck pain: Gentle neck stretches, good posture, and heat therapy can help. If pain persists >1 week, is severe, or with numbness/tingling in arms, consult a doctor."
  },
  {
    keywords: ['earache', 'ear pain'],
    response: "For ear pain: A warm compress may help. Over-the-counter pain relievers can reduce discomfort. If pain is severe, persistent, or with fever/hearing loss, see a doctor."
  },
  {
    keywords: ['toothache'],
    response: "For toothaches: Rinse with warm salt water, use dental floss to remove trapped food. Over-the-counter pain relievers may help. See a dentist as soon as possible."
  },
  {
    keywords: ['dizziness', 'lightheaded'],
    response: "For dizziness: Sit or lie down until it passes, hydrate well, and stand up slowly. If frequent, severe, or with chest pain/fainting, seek medical attention."
  },
  {
    keywords: ['fatigue', 'tiredness', 'feeling tired'],
    response: "For fatigue: Ensure adequate sleep, stay hydrated, and maintain a balanced diet. Regular exercise can boost energy. If persistent despite lifestyle changes, consult a doctor."
  },
  {
    keywords: ['allergies', 'allergic reaction'],
    response: "For allergies: Antihistamines may help with mild symptoms. Avoid known triggers. For severe reactions (difficulty breathing, swelling), seek emergency care immediately."
  },
  {
    keywords: ['asthma', 'wheezing'],
    response: "For asthma: Use your prescribed inhaler as directed. Avoid triggers. If symptoms worsen despite medication or you have difficulty breathing, seek emergency care."
  },
  {
    keywords: ['nosebleed'],
    response: "For nosebleeds: Sit upright, pinch the soft part of your nose for 10-15 minutes. Lean forward slightly. If bleeding persists >20 minutes or is heavy, seek medical help."
  },
  {
    keywords: ['flu', 'influenza'],
    response: "For flu: Rest, hydrate, and take fever reducers as needed. Stay home to avoid spreading it. If symptoms are severe (difficulty breathing, persistent high fever), see a doctor."
  },
  {
    keywords: ['pink eye', 'conjunctivitis'],
    response: "For pink eye: Keep eyes clean, use warm compresses, and avoid touching/rubbing. If symptoms worsen or include eye pain/vision changes, see a doctor."
  },
  {
    keywords: ['sprain', 'twisted ankle'],
    response: "For sprains: Follow RICE (Rest, Ice, Compression, Elevation). Avoid putting weight on it. If pain/swelling are severe or don't improve in a few days, see a doctor."
  },
  {
    keywords: ['cut', 'scrape', 'minor wound'],
    response: "For minor cuts: Clean with mild soap and water, apply antibiotic ointment, and cover with a bandage. If deep, won't stop bleeding, or shows signs of infection, seek medical care."
  },
  {
    keywords: ['burn'],
    response: "For minor burns: Cool with running water for 10-15 minutes, cover with sterile dressing. Don't use butter/ice. For large burns or on face/hands/genitals, seek emergency care."
  },
  {
    keywords: ['blister'],
    response: "For blisters: Leave intact if possible, cover with a bandage. Don't pop it. If infected (red, swollen, pus), see a doctor."
  },
  {
    keywords: ['hiccups', 'hiccoughs'],
    response: "For hiccups: Try holding your breath, drinking cold water, or breathing into a paper bag. If persistent (>48 hours) or severe, consult a doctor."
  },
  {
    keywords: ['indigestion', 'upset stomach'],
    response: "For indigestion: Eat smaller meals, avoid fatty/spicy foods, and don't lie down after eating. Antacids may help. If persistent or with severe pain, see a doctor."
  },
  {
    keywords: ['dehydration'],
    response: "For dehydration: Drink small amounts of water or oral rehydration solutions frequently. If severe (dizziness, rapid heartbeat, no urination >8 hours), seek medical care."
  },
  {
    keywords: ['food poisoning'],
    response: "For food poisoning: Stay hydrated with small sips of clear fluids, eat bland foods when able. If symptoms last >2 days, have blood in stool, or severe dehydration, see a doctor."
  },
  {
    keywords: ['chickenpox'],
    response: "For chickenpox: Use calamine lotion for itching, keep nails short to prevent scratching. Stay home until all blisters crust over. If high fever or difficulty breathing, seek medical help."
  },
  {
    keywords: ['measles'],
    response: "For measles: Rest, hydrate, and use fever reducers as needed. Stay isolated to prevent spread. If symptoms are severe or complications arise, seek medical care immediately."
  },
  {
    keywords: ['mumps'],
    response: "For mumps: Rest, drink fluids, and use warm/cold compresses for swollen glands. Stay isolated for 5 days after swelling begins. If severe headache/stiff neck develops, seek emergency care."
  },
  {
    keywords: ['sinus pain', 'sinus pressure'],
    response: "For sinus pain: Use steam inhalation, warm compresses, and stay hydrated. Decongestants may help. If symptoms last >10 days or with high fever, see a doctor."
  },
  {
    keywords: ['migraine'],
    response: "For migraines: Rest in a dark, quiet room, use cold compresses, and take prescribed medication. If new/severe symptoms or 'worst headache ever', seek emergency care."
  },
  {
    keywords: ['high blood pressure', 'hypertension'],
    response: "For high blood pressure: Reduce sodium intake, exercise regularly, and take prescribed medications. Monitor your BP. If extremely high (>180/120) or with severe headache/chest pain, seek emergency care."
  },
  {
    keywords: ['low blood pressure', 'hypotension'],
    response: "For low blood pressure: Increase fluid/salt intake (if advised by doctor), stand up slowly. If sudden drop with dizziness/fainting, especially after injury, seek medical attention."
  },
  {
    keywords: ['cholesterol'],
    response: "For high cholesterol: Eat heart-healthy foods (fruits, veggies, whole grains), exercise regularly, and take prescribed medications. Get regular check-ups with your doctor."
  },
  {
    keywords: ['diabetes', 'high blood sugar'],
    response: "For diabetes: Monitor blood sugar as directed, take medications as prescribed, and maintain a healthy diet. If blood sugar is very high or low with concerning symptoms, seek medical help."
  },
  {
    keywords: ['low blood sugar', 'hypoglycemia'],
    response: "For low blood sugar: Consume 15g fast-acting carbs (juice, glucose tablets), then eat a snack. If severe (confusion, unconsciousness), seek emergency care."
  },
  {
    keywords: ['UTI', 'urinary tract infection'],
    response: "For UTIs: Drink plenty of water, avoid irritants like caffeine. Cranberry juice may help prevent but not treat. If symptoms persist >1-2 days or with fever, see a doctor for antibiotics."
  },
  {
    keywords: ['yeast infection'],
    response: "For yeast infections: Over-the-counter antifungal treatments are available. Wear cotton underwear. If symptoms don't improve in 3 days or recur frequently, consult a doctor."
  },
  {
    keywords: ['hemorrhoids', 'piles'],
    response: "For hemorrhoids: Use over-the-counter creams, take warm sitz baths, and increase fiber intake. If bleeding is heavy or persistent, consult a doctor."
  },
  {
    keywords: ['cramps', 'menstrual cramps'],
    response: "For menstrual cramps: Use heat therapy, gentle exercise, and over-the-counter pain relievers. If severe or disrupting daily life, discuss options with your doctor."
  },
  {
    keywords: ['pms', 'premenstrual syndrome'],
    response: "For PMS: Regular exercise, balanced diet, and stress reduction techniques may help. Calcium/magnesium supplements might reduce symptoms. If severe, discuss with your doctor."
  },
  {
    keywords: ['motion sickness'],
    response: "For motion sickness: Sit where motion is least felt (front seat of car, over plane wings), focus on horizon, and avoid reading. Over-the-counter medications may help prevent it."
  },
  {
    keywords: ['hangover'],
    response: "For hangovers: Rehydrate with water/electrolyte drinks, eat bland foods, and rest. Pain relievers may help (avoid acetaminophen after alcohol). Prevent by drinking in moderation with food."
  },
  {
    keywords: ['stress'],
    response: "For stress: Practice relaxation techniques (deep breathing, meditation), exercise regularly, and maintain a healthy routine. If overwhelming or affecting daily life, consider professional help."
  },
  {
    keywords: ['panic attack'],
    response: "For panic attacks: Focus on slow, deep breathing, remind yourself it will pass. Grounding techniques (5-4-3-2-1 method) can help. If frequent or severe, seek professional treatment."
  }
];

function getBotResponse(message) {
  const lower = message.toLowerCase();
  // Gratitude/closing detection
  const gratitudeWords = [
    'ok', 'okay', 'thanks', 'thank you', 'thankyou', 'thx', 'ty', 'great', 'got it', 'cool', 'nice', 'bye', 'goodbye', 'see you', 'see ya'
  ];
  if (gratitudeWords.some((w) => lower === w || lower.includes(w))) {
    return "You're welcome! 😊 If you have more questions, feel free to ask. Take care!";
  }
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.response + " Always take medications and treatments under the guidance of a qualified doctor.";
    }
  }
  return "I'm here to help with common health symptoms and concerns. Please describe your symptom or health question in more detail. Remember to always consult a doctor for proper diagnosis and treatment.";
}

// Custom SVG: Robot doctor icon (no outer circle)
const RobotDoctorIcon = () => (
  <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <rect x="16" y="8" width="32" height="20" rx="8" fill="#D6EDFF" stroke="#377DFF" strokeWidth="2"/>
    {/* Face screen */}
    <rect x="22" y="14" width="20" height="10" rx="4" fill="#5DE6F7" stroke="#377DFF" strokeWidth="2"/>
    {/* Eyes */}
    <ellipse cx="28" cy="19" rx="2" ry="3" fill="#377DFF"/>
    <ellipse cx="36" cy="19" rx="2" ry="3" fill="#377DFF"/>
    {/* Head cross */}
    <rect x="30" y="9" width="4" height="8" rx="2" fill="#A7F3CE" stroke="#377DFF" strokeWidth="1"/>
    <rect x="28" y="13" width="8" height="4" rx="2" fill="#A7F3CE" stroke="#377DFF" strokeWidth="1"/>
    {/* Body */}
    <rect x="14" y="28" width="36" height="24" rx="10" fill="#A7C7FC" stroke="#377DFF" strokeWidth="2"/>
    {/* Stethoscope */}
    <path d="M32 38v6" stroke="#377DFF" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="46" r="2" fill="#5DE6F7" stroke="#377DFF" strokeWidth="1"/>
    {/* Left arm */}
    <rect x="6" y="34" width="10" height="16" rx="4" fill="#D6EDFF" stroke="#377DFF" strokeWidth="2"/>
    {/* Medical kit */}
    <rect x="2" y="48" width="16" height="12" rx="3" fill="#fff" stroke="#377DFF" strokeWidth="2"/>
    <rect x="8" y="53" width="4" height="2" rx="1" fill="#5DE6F7"/>
    <rect x="9" y="51" width="2" height="6" rx="1" fill="#5DE6F7"/>
    {/* Right arm */}
    <rect x="48" y="34" width="10" height="16" rx="4" fill="#D6EDFF" stroke="#377DFF" strokeWidth="2"/>
    {/* Syringe */}
    <rect x="56" y="48" width="6" height="12" rx="2" fill="#5DE6F7" stroke="#377DFF" strokeWidth="1"/>
    <rect x="58" y="46" width="2" height="4" rx="1" fill="#377DFF"/>
    <rect x="58" y="60" width="2" height="2" rx="1" fill="#377DFF"/>
  </svg>
);

const PaperPlaneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M3 16L29 6L13.5 21.5L11 29L9 19L3 16Z" fill="#fff"/>
      <path d="M13.5 21.5L29 6L11 29L13.5 21.5Z" fill="#fff" fillOpacity="0.7"/>
    </g>
  </svg>
);

const PaperPlaneSendButton = ({ disabled, onClick }) => (
  <button
    type="submit"
    onClick={onClick}
    style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: '#38bdf8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      padding: 0,
    }}
    disabled={disabled}
    aria-label="Send"
  >
    <FontAwesomeIcon icon={faPaperPlane} style={{ color: '#fff', fontSize: 16 }} />
  </button>
);

const HealthChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am your Health Assistant. Ask me about common symptoms like cough, cold, headache, or body pain.' }
  ]);
  const [showPanel, setShowPanel] = useState(false); // for animation
  const panelRef = useRef(null);
  const location = useLocation();

  // Hide chat bot on landing, login, and register pages
  const hideChatBot = ['/', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    if (open) {
      setShowPanel(true);
    } else if (showPanel) {
      // Wait for animation before unmounting
      const timeout = setTimeout(() => setShowPanel(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    const botMsg = { from: 'bot', text: getBotResponse(input) };
    setMessages((msgs) => [...msgs, userMsg, botMsg]);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      {!hideChatBot && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          {showPanel && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 68,
                marginBottom: 0,
                width: 320,
                maxWidth: '90vw',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'opacity 0.25s, transform 0.25s',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(30px)',
                pointerEvents: open ? 'auto' : 'none',
                zIndex: 1002,
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)',
                color: '#fff',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaUserMd style={{ marginRight: 6 }} /> Health Assistant
                </span>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
                  aria-label="Close chat"
                >
                  <FaTimes />
                </button>
              </div>
              {/* Chat Body */}
              <div
                ref={panelRef}
                style={{
                  padding: 12,
                  height: 260,
                  overflowY: 'auto',
                  background: '#f8fafc',
                  fontSize: 15,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.from === 'user' ? '#38bdf8' : '#e0f2fe',
                      color: msg.from === 'user' ? '#fff' : '#0369a1',
                      borderRadius: 12,
                      padding: '8px 12px',
                      maxWidth: '80%',
                      boxShadow: msg.from === 'user' ? '0 2px 8px #bae6fd' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {msg.from === 'user' ? <FaUser /> : <FaUserMd />} {msg.text}
                  </div>
                ))}
              </div>
              {/* Input */}
              <form
                onSubmit={handleSend}
                style={{
                  display: 'flex',
                  borderTop: '1px solid #e0e7ef',
                  background: '#fff',
                  padding: 8,
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your symptom..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: 15,
                    background: 'transparent',
                    padding: '6px 0',
                  }}
                  aria-label="Type your symptom"
                />
                <PaperPlaneSendButton disabled={!input.trim()} onClick={handleSend} />
              </form>
            </div>
          )}
          {/* Floating Icon Button */}
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fff',
              color: '#2563eb',
              border: '4px solid #2563eb',
              boxShadow: '0 2px 12px rgba(56,189,248,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              cursor: 'pointer',
              zIndex: 1001,
              gap: 4,
            }}
            aria-label="Open health chat bot"
          >
            <RobotDoctorIcon />
          </button>
        </div>
      )}
    </>
  );
};

export default HealthChatBot;