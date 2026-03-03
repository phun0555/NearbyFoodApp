import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { initDB } from "../db";

export default function Home() {
  const router = useRouter();

  const [location, setLocation] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    initDB();
    getLocation();
    fetchRestaurants();
    loadFavorites();
  }, []);


  const getLocation = async () => {
    let { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("กรุณาอนุญาต GPS");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setLocation(loc.coords);
  };


  const calculateDistance = (lat: number, lon: number) => {
    if (!location) return 0;

    const R = 6371;
    const dLat =
      ((lat - location.latitude) * Math.PI) / 180;
    const dLon =
      ((lon - location.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((location.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };


  const loadFavorites = async () => {
    const fav = await AsyncStorage.getItem("favorites");
    if (fav) setFavorites(JSON.parse(fav));
  };

  const toggleFavorite = async (id: number) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);

    await AsyncStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  };


  const fetchRestaurants = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/phun0555/NearbyFoodApp/refs/heads/master/app/restaurants.json"
      );

      const data = await response.json();

      const baseLat = 14.0379;
      const baseLon = 100.6183;

      const customRestaurants = [
        {
          name: "ก๋วยเตี๋ยวเรือรังสิต นวนคร",
          image:
            "https://cheewajit.com/app/uploads/2021/04/image-130-edited.png",
        },
        {
          name: "ส้มตำป้าน้อย นวนคร",
          image:
            "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rHIRiYHCRigP4Gyivh7rgX5F5HqUmbf9L4SQODbALPtARByTGY.webp",
        },
        {
          name: "ชาบูอิ่มอร่อย นวนคร",
          image:
            "https://image.makewebeasy.net/makeweb/m_1920x0/Ommd4Syoj/Contacts/image.jpg",
        },
        {
          name: "ร้านข้าวมันไก่นวนคร",
          image:
            "https://img.wongnai.com/p/1920x0/2017/06/22/bbf899f7ab4341dea4aec6330c2afafd.jpg",
        },
        {
          name: "หมูกระทะริมทาง นวนคร",
          image:
            "https://s.isanook.com/he/0/ud/1/7657/korean-grilled-pork-thai-styl.jpg",
        },
        {
          name: "ครัวบ้านสวน นวนคร",
          image:
            "https://img.wongnai.com/p/1920x0/2018/05/15/bbe2772a39d845e1af3289ed4d6cd149.jpg",
        },
        {
          name: "ร้านอาหารตามสั่ง 24 ชม. นวนคร",
          image:
            "https://patoisfdimage4-fcbugqebgmbma7he.z01.patois.com/patois/image/2023/10/19/PATOIS_2023-10-19_17_10_17_223c2e69-ea67-49da-b6aa-897c0df2b795.jpg",
        },
      ];

      const formatted = customRestaurants.map(
        (item, index) => ({
          id: index + 1,
          name: item.name,
          image: item.image,
          rating: (4 + Math.random()).toFixed(1),
          reviews:
            Math.floor(Math.random() * 300) + 50,
          latitude:
            baseLat + (Math.random() - 0.5) * 0.01,
          longitude:
            baseLon + (Math.random() - 0.5) * 0.01,
        })
      );

      setRestaurants(formatted);
      await AsyncStorage.setItem("restaurants", JSON.stringify(formatted));
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  const openGoogleMaps = (
    lat: number,
    lng: number
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1 }}>


      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={() => router.push("/favorite")}
      >
        <Text style={styles.favoriteText}>
          ❤️ ไปหน้าร้านที่ถูกใจ
        </Text>
      </TouchableOpacity>


      {location && (
        <MapView
          style={{ height: 300 }}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
        >
          {restaurants.map((r) => (
            <Marker
              key={r.id}
              coordinate={{
                latitude: r.latitude,
                longitude: r.longitude,
              }}
            >
              <Callout
                onPress={() =>
                  openGoogleMaps(
                    r.latitude,
                    r.longitude
                  )
                }
              >
                <View style={{ width: 150 }}>
                  <Image
                    source={{ uri: r.image }}
                    style={{ width: "100%", height: 80 }}
                  />
                  <Text>{r.name}</Text>
                  <Text>กดเพื่อนำทาง</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      <FlatList
        style={{ padding: 15 }}
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <Text style={styles.title}>
              {item.name}
            </Text>

            <Text>
              ⭐ {item.rating} ({item.reviews} รีวิว)
            </Text>

            <Text>
              📍{" "}
              {calculateDistance(
                item.latitude,
                item.longitude
              ).toFixed(2)} กม.
            </Text>

            <TouchableOpacity
              onPress={() =>
                toggleFavorite(item.id)
              }
            >
              <Text style={{ fontSize: 24 }}>
                {favorites.includes(item.id)
                  ? "❤️"
                  : "🤍"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() =>
                openGoogleMaps(
                  item.latitude,
                  item.longitude
                )
              }
            >
              <Text style={{ color: "#fff" }}>
                🚗 นำทางไปที่ร้าน
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: "#4CAF50" }]}
              onPress={() => router.push(`/review?id=${item.id}&name=${encodeURIComponent(item.name)}`)}
            >
              <Text style={{ color: "#fff" }}>
                📝 เขียน/ดูรีวิว
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 5,
  },
  navBtn: {
    backgroundColor: "#8D6E63",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  favoriteBtn: {
    backgroundColor: "#E57373",
    padding: 12,
    margin: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  favoriteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});