import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Card = ({ option, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.iconBox}>
      <Ionicons name={option.icon} size={40} color="#fff" />
    </View>
    <Text style={styles.cardTxt}>{option.label}</Text>
  </TouchableOpacity>
);

const RideSharingScreen = ({ navigation }) => {
  const options = [
    { label: 'Ride Share', icon: 'car-outline', route: 'RideShare' },
    { label: 'Ride Request', icon: 'people-outline', route: 'RideRequest' },
  ];

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Ride Sharing</Text>
          <View style={styles.grid}>
            {options.map((opt, index) => (
              <Card key={index} option={opt} onPress={() => navigation.navigate(opt.route)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
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

export default RideSharingScreen;
