import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    // Basic validation before sending the request
    if (!username || !email || !password || !confirmPassword || password !== confirmPassword) {
      setErrorMessage("Please fill all fields correctly and ensure passwords match.");
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://sarakhan100-securespot.hf.space/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username,
          email: email,
          password: password,
          confirm_password: confirmPassword,
        }),
      });
      const json = await response.json();

      if (json.status) {
        // If signup is successful, navigate to the Home page
        navigation.replace('Authentication');
      } else {
        setErrorMessage(json.message || "Sign up failed. Please try again.");
        setShowModal(true);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.appName}>SecureSpot</Text>
          <Text style={styles.header}>Sign Up</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#B0B0B0"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#B0B0B0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#B0B0B0"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signUpText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="fade" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '90%',
    maxWidth: 370,
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 6,
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F1C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    fontSize: 28,
    color: '#1F1C2C',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F4F6F8',
    marginBottom: 15,
    borderRadius: 30,
    paddingLeft: 20,
    fontSize: 16,
    color: '#333',
    borderColor: '#D0D0D0',
    borderWidth: 1,
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#928DAB',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#928DAB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: 300,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#928DAB',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignUpScreen;
