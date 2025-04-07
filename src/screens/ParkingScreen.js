import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const options = [
  { title: 'Parking Token', icon: 'key-outline', route: 'ParkingTokenScreen' },
  { title: 'Map', icon: 'map-outline', route: 'ParkingMapScreen' },
  { title: 'Detect Parking', icon: 'alert-circle-outline', route: 'DetectParkingScreen' },
];

const ParkingSecureSpotOptions = ({ navigation }) => {
  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.header}>SecureSpot Parking</Text>
          <View style={styles.grid}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(option.route)}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={option.icon} size={40} color="#fff" />
                </View>
                <Text style={styles.cardTxt}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center'
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 10,
  },
  iconBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  cardTxt: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ParkingSecureSpotOptions;
