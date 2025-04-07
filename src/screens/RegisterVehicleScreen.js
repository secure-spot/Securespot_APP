import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useToken } from '../context/TokenContext';

const RegisterVehicleScreen = () => {
  const { token } = useToken();
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020'); // default year
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create an array for years 1990 to 2025
  const years = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => (1990 + i).toString());

  // Predefined color options (maximum 10 colors specially used in cars)
  const colorOptions = ["Red", "Black", "White", "Blue", "Green", "Silver", "Gray", "Yellow", "Orange", "Brown"];

  const handleRegisterVehicle = async () => {
    // Validate fields
    if (!model || !year || !color || !licensePlate) {
      setMessage('Please fill out all fields.');
      setModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://sarakhan100-securespot.hf.space/register_vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          model,
          year: Number(year),
          color,
          license_plate: licensePlate,
        }),
      });
      const data = await response.json();
      if (data.status) {
        setMessage(data.message || 'Vehicle registered successfully!');
      } else {
        setMessage(data.message || 'Vehicle registration failed.');
      }
      setModalVisible(true);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setModalVisible(true);
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.gradientContainer}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerContainer}>
            <Text style={styles.header}>Register Vehicle</Text>
            {/* Model Input */}
            <TextInput
              style={styles.input}
              placeholder="Model"
              placeholderTextColor="#B0B0B0"
              value={model}
              onChangeText={setModel}
            />

            {/* Year Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={year}
                style={styles.picker}
                onValueChange={(itemValue) => setYear(itemValue)}
              >
                {years.map((yr) => (
                  <Picker.Item key={yr} label={yr} value={yr} />
                ))}
              </Picker>
            </View>

            {/* Color Selection */}
            <Text style={styles.label}>Select Color</Text>
            <View style={styles.colorOptionsContainer}>
              {colorOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.colorOptionButton,
                    { backgroundColor: option.toLowerCase() },
                    color.toLowerCase() === option.toLowerCase() && styles.selectedColorOption
                  ]}
                  onPress={() => setColor(option)}
                >
                  <Text
                    style={[
                      styles.colorOptionText,
                      option.toLowerCase() === 'white' && { color: '#333' }
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Editable Color Input */}
            <TextInput
              style={styles.input}
              placeholder="Or edit color name"
              placeholderTextColor="#B0B0B0"
              value={color}
              onChangeText={setColor}
            />

            {/* License Plate Input */}
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              placeholderTextColor="#B0B0B0"
              value={licensePlate}
              onChangeText={setLicensePlate}
            />

            {/* Register Button */}
            <TouchableOpacity style={styles.button} onPress={handleRegisterVehicle} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register Vehicle</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal for Response Messages */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{message}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
  innerContainer: {
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
  pickerContainer: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#F4F6F8',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 16,
    color: '#1F1C2C',
    fontWeight: '600',
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
    flexWrap: 'wrap'
  },
  colorOptionButton: {
    flexBasis: '30%',
    margin: 4,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#1F1C2C',
  },
  colorOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
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
    color: '#333',
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

export default RegisterVehicleScreen;
