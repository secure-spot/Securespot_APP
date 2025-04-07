import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = "AIzaSyA4WeE-BvNOhIA7g3sxQQ_bVlEmGu2adhs";
// Destination as a text address
const DESTINATION_ADDRESS = "CUI Attock CS Parking";

function decodePolyline(encoded) {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoord, setDestinationCoord] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setLoading(false);
        return;
      }
      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      // Prepare API request with destination as text
      const origin = `${latitude},${longitude}`;
      const destination = encodeURIComponent(DESTINATION_ADDRESS);
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_APIKEY}`;

      try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.status === "OK") {
          // Decode polyline route
          const points = data.routes[0].overview_polyline.points;
          const coords = decodePolyline(points);
          setRouteCoords(coords);
          // Retrieve route details (first leg)
          const leg = data.routes[0].legs[0];
          setRouteDetails({
            distance: leg.distance.text,
            duration: leg.duration.text,
            trafficDuration: leg.duration_in_traffic ? leg.duration_in_traffic.text : null,
          });
          // Set destination coordinates from leg end_location
          setDestinationCoord({
            latitude: leg.end_location.lat,
            longitude: leg.end_location.lng,
          });
        } else {
          Alert.alert('Directions Error', data.error_message || 'Unable to get directions');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch directions');
      }
      setLoading(false);
    })();
  }, []);

  if (loading || !currentLocation) {
    return (
      <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  const initialRegion = {
    ...currentLocation,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Parking SecureSpot - Map</Text>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation
            followsUserLocation
          >
            {destinationCoord && (
              <Marker coordinate={destinationCoord} title="Destination" description={DESTINATION_ADDRESS} />
            )}
            {routeCoords.length > 0 && (
              <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#70AD47" />
            )}
          </MapView>
          {routeDetails && (
            <View style={styles.routeDetails}>
              <Text style={styles.routeText}>Distance: {routeDetails.distance}</Text>
              <Text style={styles.routeText}>Duration: {routeDetails.duration}</Text>
              {routeDetails.trafficDuration && (
                <Text style={styles.routeText}>Traffic Duration: {routeDetails.trafficDuration}</Text>
              )}
            </View>
          )}
          {/* Professional Route Analysis Report */}
          {routeDetails && (
            <View style={styles.reportContainer}>
              <Text style={styles.reportTitle}>Route Analysis Report</Text>
              <Text style={styles.reportText}>
                The route covers a distance of {routeDetails.distance} and is estimated to take {routeDetails.duration}.
              </Text>
              {routeDetails.trafficDuration && (
                <Text style={styles.reportText}>
                  Considering current traffic, the estimated duration is {routeDetails.trafficDuration}.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center'
  },
  map: {
    width: width - 40,
    height: height * 0.4,
    borderRadius: 15
  },
  routeDetails: {
    marginTop: 15,
    backgroundColor: '#ffffffcc',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  routeText: {
    fontSize: 16,
    color: '#1F1C2C',
    fontWeight: '600'
  },
  reportContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F1C2C',
    marginBottom: 10,
    textAlign: 'center',
  },
  reportText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
    textAlign: 'center',
  },
});

export default MapScreen;
