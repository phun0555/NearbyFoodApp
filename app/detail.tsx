import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Detail() {
  const { name, image, rating, reviews } =
    useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image as string }}
        style={styles.image}
      />
      <Text style={styles.title}>{name}</Text>
      <Text>
        ⭐ {rating} ({reviews} รีวิว)
      </Text>
      <Text style={{ marginTop: 10 }}>
        ร้านอาหารบรรยากาศดี เหมาะสำหรับครอบครัว
      </Text>
    </View>
  
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F7F5F2" },
  image: { width: "100%", height: 220, borderRadius: 20 },
  title: { fontSize: 22, fontWeight: "600", marginVertical: 10 },
});