import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Favorite() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favIds = await AsyncStorage.getItem("favorites");
    const allRestaurants =
      await AsyncStorage.getItem("restaurants");

    if (!favIds || !allRestaurants) return;

    const ids = JSON.parse(favIds);
    const restaurants = JSON.parse(allRestaurants);

    const favData = restaurants.filter((r: any) =>
      ids.includes(r.id)
    );

    setFavorites(favData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>❤️ ร้านที่ถูกใจ</Text>

      {favorites.length === 0 ? (
        <Text>ยังไม่มีร้านที่ถูกใจ</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
              <Text style={styles.title}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F7F5F2" },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 10 },
  card: { marginBottom: 15 },
  image: { width: "100%", height: 150, borderRadius: 15 },
  title: { fontSize: 16, marginTop: 5 },
});