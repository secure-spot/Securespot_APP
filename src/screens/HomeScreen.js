import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient as LG } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';

const Card = ({ opt, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.iconBox}>
      <Icon name={opt.icon} size={40} color="#fff" />
    </View>
    <Text style={styles.cardTxt}>{opt.name}</Text>
  </TouchableOpacity>
);

const Home = ({ navigation }) => {
  const opts = [
  { name: 'Profile', icon: 'person-outline', route: 'Profile' },
  { name: 'Vehicle', icon: 'car-outline', route: 'Register Vehicle' },
  { name: 'Assistant', icon: 'chatbubble-ellipses-outline', route: 'Assistant' },
  { name: 'Alert', icon: 'shield-outline', route: 'SecureAlert' },
  { name: 'Parking', icon: 'location-outline', route: 'Parking' },
  { name: 'Ride', icon: 'people-outline', route: 'RideSharing' },
];


  return (
    <LG colors={['#1F1C2C', '#928DAB']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>Home</Text>
          <View style={styles.grid}>
            {opts.map((item, i) => (
              <Card key={i} opt={item} onPress={() => navigation.navigate(item.route)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LG>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, alignItems: 'center' },
  header: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
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

export default Home;
