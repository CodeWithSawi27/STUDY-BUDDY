import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export function CustomSplash() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        {/* Replace with your logo/icon */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>SB</Text>
        </View>
        <Text style={styles.title}>STUDY BUDDY</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3D3B8E", // Your Jacksons Purple
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#3D3B8E",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    letterSpacing: 4,
  },
});
