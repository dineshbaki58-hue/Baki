import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>BakiFitness</Text>
    </View>
  );
}
