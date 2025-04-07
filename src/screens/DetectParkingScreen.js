import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Button,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

async function uploadImageAsync(uri) {
  let apiUrl = "https://sarakhan100-image-testing.hf.space/parkingcheck";
  let uriArray = uri.split(".");
  let fileType = uriArray[uriArray.length - 1];

  let formData = new FormData();
  // Use "image" as the key since FastAPI expects it that way
  formData.append("image", {
    uri,
    name: `photo.${fileType}`,
    type: `image/${fileType}`,
  });

  let options = {
    method: "POST",
    body: formData,
    mode: "cors",
    headers: {
      Accept: "application/json",
    },
  };

  return fetch(apiUrl, options);
}

const DetectParkingScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false); // For any additional processing if needed

  // Request permissions
  const askPermission = async (failureMessage) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(failureMessage);
    }
  };

  const askCameraPermission = async (failureMessage) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(failureMessage);
    }
  };

  const takePhoto = async () => {
    await askCameraPermission("We need camera permission to take a picture...");
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    });
    handleImagePicked(pickerResult);
  };

  const pickImage = async () => {
    await askPermission("We need camera-roll permission to read pictures from your phone...");
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
    });
    handleImagePicked(pickerResult);
  };

  // Only set image URI (and clear previous analysis)
  const handleImagePicked = async (pickerResult) => {
    const uri = pickerResult.assets ? pickerResult.assets[0].uri : pickerResult.uri;
    if (!uri) return;
    setImageUri(uri);
    setAnalysisResult(null);
  };

  // Called when user clicks "Check Parking"
  const handleCheckParking = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please upload an image first.");
      return;
    }
    setUploading(true);
    try {
      const uploadResponse = await uploadImageAsync(imageUri);
      const uploadResult = await uploadResponse.json();
      setAnalysisResult(uploadResult);
    } catch (error) {
      console.error(error);
      Alert.alert("Upload failed, sorry :(");
    } finally {
      setUploading(false);
    }
  };

  // Called on retry if detection was unsuccessful
  const handleRetry = () => {
    setImageUri(null);
    setAnalysisResult(null);
  };

  const renderUploadingIndicator = () => {
    return uploading ? (
      <ActivityIndicator size="large" color="#fff" style={styles.indicator} />
    ) : null;
  };

  const renderControls = () => {
    if (!uploading) {
      return (
        <View style={styles.controlsContainer}>
          <View style={styles.buttonContainer}>
            <Button onPress={pickImage} title="Pick an image" color="#70AD47" />
          </View>
          <View style={styles.buttonContainer}>
            <Button onPress={takePhoto} title="Take a photo" color="#70AD47" />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderImage = () => {
    return imageUri ? (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
    ) : null;
  };

  const renderAnalysis = () => {
    if (!analysisResult) return null;
    const { status, message, data } = analysisResult;
    if (status === true) {
      return (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis Result</Text>
          {data && (
            <>
              <Text style={styles.analysisText}>Parking Valid: {data.parking_valid ? "Yes" : "No"}</Text>
              <Text style={styles.analysisText}>Total Slots: {data.total_slot ?? "N/A"}</Text>
              <Text style={styles.analysisText}>Occupied Slots: {data.occupied_slot ?? "N/A"}</Text>
              <Text style={styles.analysisText}>Free Slots: {data.free_slots ?? "N/A"}</Text>
              <Text style={styles.analysisText}>Detected Car Count: {data.detected_car_count ?? "N/A"}</Text>
              <Text style={styles.analysisText}>Details: {data.message || "No details provided."}</Text>
            </>
          )}
          {/* Proceed button is removed on success */}
        </View>
      );
    } else {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{message || "Parking detection unsuccessful."}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <LinearGradient colors={['#1F1C2C', '#928DAB']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerText}>Detect Parking</Text>
          {renderControls()}
          {renderUploadingIndicator()}
          {renderImage()}
          {imageUri && !analysisResult && (
            <TouchableOpacity style={styles.checkButton} onPress={handleCheckParking} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkButtonText}>Check Parking</Text>
              )}
            </TouchableOpacity>
          )}
          {renderAnalysis()}
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
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  buttonContainer: {
    marginHorizontal: 8,
  },
  indicator: {
    marginVertical: 20,
  },
  imageContainer: {
    marginTop: 30,
    width: 250,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 5,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
  },
  checkButton: {
    backgroundColor: "#928DAB",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 20,
    elevation: 4,
  },
  checkButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  analysisContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#ffffffcc",
    width: "90%",
    alignSelf: "center",
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1F1C2C",
    textAlign: "center",
  },
  analysisText: {
    fontSize: 16,
    marginVertical: 2,
    color: "#333",
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8d7da",
    width: "90%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  errorText: {
    fontSize: 16,
    color: "#721c24",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#d9534f",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetectParkingScreen;
