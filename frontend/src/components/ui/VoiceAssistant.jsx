import { useState, useEffect } from 'react';

/**
 * VoiceAssistant Component
 * Provides voice guidance for illiterate/elderly farmers
 * Supports Marathi, Hindi, and English voice commands
 */

function VoiceAssistant({ language = 'en', onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true);
    }
  }, []);

  const startListening = () => {
    if (!supported) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Set language
    const langMap = {
      en: 'en-IN',
      mr: 'mr-IN',
      hi: 'hi-IN',
    };
    recognition.lang = langMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      onCommand?.(speechResult);
      speak(speechResult, language);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        en: 'en-IN',
        mr: 'mr-IN',
        hi: 'hi-IN',
      };
      utterance.lang = langMap[lang] || 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const helpMessages = {
    en: 'Tap microphone and say: "Report crop loss" or "Track application"',
    mr: 'मायक्रोफोन दाबा आणि म्हणा: "पीक नुकसान नोंदवा" किंवा "अर्ज ट्रॅक करा"',
    hi: 'माइक्रोफ़ोन दबाएं और कहें: "फसल नुकसान रिपोर्ट करें" या "आवेदन ट्रैक करें"',
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 z-40">
      {/* Voice Button */}
      <button
        onClick={startListening}
        disabled={!supported}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 animate-pulse'
            : 'bg-accent-500 hover:bg-accent-600'
        } ${!supported ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-3xl">{isListening ? '🎤' : '🔊'}</span>
      </button>

      {/* Transcript Display */}
      {transcript && (
        <div className="absolute bottom-20 right-0 bg-white p-4 rounded-lg shadow-lg max-w-xs animate-slide-up">
          <p className="text-sm font-medium text-gray-900 mb-1">You said:</p>
          <p className="text-sm text-gray-600">{transcript}</p>
        </div>
      )}

      {/* Help Tooltip */}
      <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg max-w-xs opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        {helpMessages[language]}
      </div>
    </div>
  );
}

export default VoiceAssistant;
