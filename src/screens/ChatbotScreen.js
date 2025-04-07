import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { useToken } from '../context/TokenContext';

const preplannedQuestions = [
  'Who is your creator?',
  'what is the distance between kamra road, attock and comsats cs parking,  attock?',
  'suggest me best restaurant around the kamra road, attock?',
  'What is your goal?',
  'tell me duration of travelling between kamra road, attock to comsats, islamabad'
];

const ChatbotScreen = ({ navigation }) => {
  const { token } = useToken();
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef(null);

  // Load chat history from endpoint
  const loadChatHistory = async () => {
    try {
      const response = await fetch('https://itsnida07-securespotbot.hf.space/getchat_securebot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.status) {
        const formattedHistory = data.chat_history.map(entry => ({
          question: `👤 ${entry.question}`,
          response: `🤖 ${entry.response}`
        }));
        setChatHistory(formattedHistory);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, [token]);

  const sendQuestion = async (questionText) => {
    if (!questionText.trim()) return;

    const newEntry = { question: `👤 ${questionText}`, response: '🤔 Thinking...' };
    setChatHistory(prev => [...prev, newEntry]);
    setIsThinking(true);

    try {
      const response = await fetch('https://itsnida07-securespotbot.hf.space/get_response_securebot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, query: questionText }),
      });
      const data = await response.json();
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].response = data.status
          ? `🤖 ${data.message}`
          : `🤖 ${data.message || 'Error retrieving response'}`;
        return updatedHistory;
      });
    } catch (error) {
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].response = '🤖 An error occurred. Please try again.';
        return updatedHistory;
      });
    }
    setIsThinking(false);
  };

  const handleSend = async () => {
    await sendQuestion(input);
    setInput('');
  };

  // Auto-scroll to bottom on new chat entry
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 40}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>SecureSpot Assistant</Text>
          </View>

          {/* Preplanned Questions (Plain Text) */}
          <View style={styles.preplannedContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {preplannedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.preplannedButton}
                  onPress={() => sendQuestion(question)}
                >
                  <Text style={styles.preplannedText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages (Markdown Format) */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
          >
            {chatHistory.map((entry, index) => (
              <View key={index} style={styles.messageContainer}>
                <View style={styles.questionBubble}>
                  <Markdown style={markdownStyles.chatText}>
                    {entry.question}
                  </Markdown>
                </View>
                <View style={styles.responseBubble}>
                  <Markdown style={markdownStyles.chatText}>
                    {entry.response}
                  </Markdown>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your question..."
              placeholderTextColor="#aaa"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              {isThinking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const markdownStyles = {
  chatText: {
    body: { color: '#333', fontSize: 16 },
  },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoidingContainer: { flex: 1 },
  headerContainer: {
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  preplannedContainer: {
    paddingVertical: 10,
    paddingLeft: 15,
    backgroundColor: '#F4F6F8',
  },
  preplannedButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  preplannedText: {
    fontSize: 14,
    color: '#333',
  },
  chatContainer: { flex: 1, paddingHorizontal: 20 },
  chatContent: { paddingBottom: 40 },
  messageContainer: { marginBottom: 20 },
  questionBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#70AD47',
    borderRadius: 15,
    padding: 12,
    maxWidth: '80%',
    elevation: 2,
  },
  responseBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    maxWidth: '80%',
    marginTop: 5,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#928DAB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
