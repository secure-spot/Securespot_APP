import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AuthenticationScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Start or update the countdown timer when OTP is sent
  useEffect(() => {
    let timer;
    if (otpSent && timerActive) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerActive(false);
            setMessage('OTP expired, please request a new one.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, timerActive]);

  // Request an OTP to be sent to the user's email
  const handleSendOTP = async () => {
    if (!email) {
      setMessage('Please enter your email.');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch('https://sarakhan100-securespot.hf.space/send_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.status) {
        setOtpSent(true);
        setMessage('OTP sent successfully. Please check your email.');
        setCountdown(60);
        setTimerActive(true);
      } else {
        setMessage(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Verify the entered OTP code
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP.');
      return;
    }
    if (countdown <= 0) {
      setMessage('OTP has expired, please request a new one.');
      return;
    }
    setIsVerifying(true);
    try {
      const response = await fetch('https://sarakhan100-securespot.hf.space/verify_otp_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.status) {
        // OTP verified successfully, navigate automatically to Login page
        navigation.replace('Login');
      } else {
        setMessage(data.message || 'OTP verification failed.');
      }
    } catch (error) {
      setMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Allow the user to go back to the email input screen
  const handleBack = () => {
    setOtpSent(false);
    setOtp('');
    setCountdown(60);
    setTimerActive(false);
    setMessage('');
  };

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Email Authentication</Text>
          {!otpSent ? (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={isSending}>
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.infoText}>
                An OTP has been sent to your email. Please enter it below.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#B0B0B0"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.timerText}>Time remaining: {countdown} sec</Text>
              <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={isVerifying}>
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </ScrollView>
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
    padding: 20,
  },
  innerContainer: {
    width: '90%',
    maxWidth: 370,
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    padding: 30,
    elevation: 6,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F1C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F4F6F8',
    marginBottom: 15,
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    borderColor: '#D0D0D0',
    borderWidth: 1,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#928DAB',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#d9534f',
    marginBottom: 15,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#928DAB',
    textDecorationLine: 'underline',
  },
});

export default AuthenticationScreen;
