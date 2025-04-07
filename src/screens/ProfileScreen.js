import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToken } from '../context/TokenContext';

const ProfileScreen = ({ navigation }) => {
  const { token, setToken } = useToken();
  const [profileData, setProfileData] = useState(null);
  const [profileMsg, setProfileMsg] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleMsg, setVehicleMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user profile details
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('https://sarakhan100-securespot.hf.space/get_user_details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.status) {
        setProfileData(data.data);
        setProfileMsg('');
      } else {
        setProfileData(null);
        setProfileMsg(data.message || 'Failed to retrieve profile data.');
      }
    } catch (error) {
      setProfileData(null);
      setProfileMsg('An error occurred while fetching profile data.');
    }
  };

  // Fetch vehicle details
  const fetchVehicleDetails = async () => {
    try {
      const response = await fetch('https://sarakhan100-securespot.hf.space/get_vehicle_details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.status) {
        setVehicleData(data.data);
        setVehicleMsg('');
      } else {
        setVehicleData(null);
        setVehicleMsg(data.message || 'Failed to retrieve vehicle details.');
      }
    } catch (error) {
      setVehicleData(null);
      setVehicleMsg('An error occurred while fetching vehicle details.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUserProfile(), fetchVehicleDetails()]);
      setLoading(false);
    };
    fetchData();
  }, [token]);

  // Compute initials from user's name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  // Logout handler: clear token and reset navigation stack to Login screen
  const handleLogout = async () => {
    setToken('');
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Cover & Overlapping Avatar */}
          {profileData && (
            <View style={styles.coverContainer}>
              <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.cover} />
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(profileData.name)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Profile Information */}
          <View style={styles.profileInfo}>
            {profileData ? (
              <>
                <Text style={styles.profileName}>{profileData.name}</Text>
                <Text style={styles.profileEmail}>{profileData.email}</Text>
                <Text style={styles.profileJoined}>Joined: {profileData.joining_date}</Text>
              </>
            ) : (
              <Text style={styles.error}>{profileMsg}</Text>
            )}
          </View>

          {/* Vehicle Details Card */}
          <LinearGradient colors={['#ffffffee', '#ffffffcc']} style={styles.card}>
            <Text style={styles.cardHeader}>Vehicle Details</Text>
            {vehicleData ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Model:</Text>
                  <Text style={styles.value}>{vehicleData.model}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Year:</Text>
                  <Text style={styles.value}>{vehicleData.year}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Color:</Text>
                  <Text style={styles.value}>{vehicleData.color}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>License:</Text>
                  <Text style={styles.value}>{vehicleData.license_plate}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.error}>{vehicleMsg}</Text>
            )}
          </LinearGradient>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LinearGradient colors={['#d9534f', '#c9302c']} style={styles.logoutGradient}>
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Cover & Avatar Styles
  coverContainer: { position: 'relative', marginBottom: 60 },
  cover: { width: '100%', height: 150 },
  avatarWrapper: { position: 'absolute', top: 90, left: 0, right: 0, alignItems: 'center' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#70AD47',
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },

  // Profile Info
  profileInfo: { alignItems: 'center', marginHorizontal: 20, marginTop: 10 },
  profileName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 16, color: '#eee', marginBottom: 2 },
  profileJoined: { fontSize: 14, color: '#ccc' },
  error: { fontSize: 16, color: '#d9534f', textAlign: 'center', marginVertical: 10 },

  // Vehicle Details Card
  card: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F1C2C',
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1C2C',
    paddingBottom: 5,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 16, color: '#555', fontWeight: '600' },
  value: { fontSize: 16, color: '#000', fontWeight: '600' },

  // Logout Button
  logoutBtn: { marginVertical: 20, width: '100%', alignItems: 'center' },
  logoutGradient: {
    width: '60%',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ProfileScreen;
