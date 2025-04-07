import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useToken, useParkingToken } from "../context/TokenContext";

const GOOGLE_MAPS_APIKEY = "AIzaSyA4WeE-BvNOhIA7g3sxQQ_bVlEmGu2adhs";
const PARKING_TOKEN_URL = "https://itsnida07-securespotbot.hf.space/parkingtoken";

const ParkingTokenScreen = () => {
  const { token } = useToken();
  const { parkingTokenData, saveToken, clearToken } = useParkingToken();

  const [manualAddress, setManualAddress] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Timer state: elapsed time (in seconds) and token status
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState("inactive");

  // Current time state for real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Update elapsed time if parking token exists, and update status
  useEffect(() => {
    let interval;
    if (parkingTokenData) {
      interval = setInterval(() => {
        const diffSeconds = Math.floor((Date.now() - parkingTokenData.timestamp) / 1000);
        setElapsedSeconds(diffSeconds);
        setStatus(diffSeconds < 1800 ? "active" : "inactive");
      }, 1000);
    } else {
      setElapsedSeconds(0);
      setStatus("inactive");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [parkingTokenData]);

  // Convert elapsed seconds to mm:ss format
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch autocomplete suggestions if user types a location
  useEffect(() => {
    if (locationInput.length < 3 || !showSuggestions) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          locationInput
        )}&key=${GOOGLE_MAPS_APIKEY}`;
        const response = await fetch(apiUrl);
        const json = await response.json();
        if (json.status === "OK") {
          setSuggestions(json.predictions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [locationInput, showSuggestions]);

  const handleSelectSuggestion = async (suggestion) => {
    try {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(apiUrl);
      const json = await response.json();
      if (json.status === "OK") {
        const address = json.result.formatted_address;
        setManualAddress(address);
        setLocationInput(address);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Place details error:", error);
    }
  };

  const handleGenerateToken = async () => {
    const addressToUse = manualAddress;
    if (!addressToUse) {
      Alert.alert("Error", "Please provide your location.");
      return;
    }
    setTokenLoading(true);
    setErrorMessage("");
    try {
      const payload = {
        token: token,
        current_location: addressToUse,
      };
      const response = await fetch(PARKING_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === true) {
        saveToken(result.parking_token);
      } else {
        setErrorMessage(result.message || "Failed to generate parking token.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while generating token.");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleRemoveToken = async () => {
    clearToken();
  };

  // Format current time as hh:mm:ss
  const formattedTime = currentTime.toLocaleTimeString();

  return (
    <LinearGradient colors={["#1F1C2C", "#928DAB"]} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerText}>Parking SecureSpot</Text>
          <Text style={styles.currentTimeText}>Current Time: {formattedTime}</Text>
          <Text style={styles.infoText}>Enter your location:</Text>
          {/* Container for input; suggestions will render as part of layout */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your location"
              placeholderTextColor="#B0B0B0"
              value={locationInput}
              onChangeText={(text) => {
                setLocationInput(text);
                setManualAddress(text);
                setShowSuggestions(true);
              }}
            />
          </View>
          {suggestions.length > 0 && showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  onPress={() => handleSelectSuggestion(item)}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateToken}
            disabled={tokenLoading}
          >
            {tokenLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Parking Token</Text>
            )}
          </TouchableOpacity>
          {parkingTokenData && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Parking Token Generated:</Text>
              <Text style={styles.resultText}>{parkingTokenData.token}</Text>
              <Text style={styles.timerText}>
                Elapsed: {formatElapsedTime(elapsedSeconds)}
              </Text>
              <Text style={styles.statusText}>Status: {status}</Text>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveToken}>
                <Text style={styles.removeButtonText}>Remove Token</Text>
              </TouchableOpacity>
            </View>
          )}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          <StatusBar barStyle="light-content" />
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
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  currentTimeText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    width: "90%",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  suggestionsContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 250,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  suggestionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  generateButton: {
    backgroundColor: "#70AD47",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 20,
    elevation: 3,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: "#ffffffcc",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    alignItems: "center",
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F1C2C",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
  timerText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#c0392b",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: "#f8d7da",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  errorText: {
    fontSize: 16,
    color: "#721c24",
    textAlign: "center",
  },
});

export default ParkingTokenScreen;
