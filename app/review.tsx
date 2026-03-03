import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { addReview, getReviewsByRestaurant } from "../db";

export default function Review() {
    const { id, name } = useLocalSearchParams();
    const restaurantId = Number(id);

    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState("5");
    const [text, setText] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
        loadReviews();
    }, [restaurantId]);

    const loadReviews = async () => {
        if (isNaN(restaurantId)) return;
        const data = await getReviewsByRestaurant(restaurantId);
        setReviews(data);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert("กรุณาอนุญาตให้ใช้กล้อง");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const submitReview = async () => {
        if (!text || !rating) {
            alert("กรุณากรอกข้อความและคะแนน");
            return;
        }
        try {
            await addReview(restaurantId, Number(rating), text, imageUri || "");
            Alert.alert("สำเร็จ", "บันทึกรีวิวเรียบร้อย");
            setText("");
            setRating("5");
            setImageUri(null);
            loadReviews();
        } catch (e: any) {
            console.log(e);
            alert("เกิดข้อผิดพลาดในการบันทึกรีวิว");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>รีวิวร้าน: {name}</Text>

            <View style={styles.form}>
                <Text style={styles.label}>คะแนน (1-5):</Text>
                <TextInput
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <Text style={styles.label}>ข้อความรีวิว:</Text>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    multiline
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                />

                <View style={styles.imageButtons}>
                    <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
                        <Text style={styles.btnText}>🖼️ เลือกรูป</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
                        <Text style={styles.btnText}>📷 ถ่ายรูป</Text>
                    </TouchableOpacity>
                </View>

                {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

                <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
                    <Text style={styles.submitText}>บันทึกรีวิว</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.subTitle}>รีวิวทั้งหมด ({reviews.length})</Text>

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.reviewCard}>
                        <Text style={styles.ratingText}>⭐ {item.rating} / 5</Text>
                        <Text style={styles.reviewText}>{item.text}</Text>
                        {item.imageUri ? (
                            <Image source={{ uri: item.imageUri }} style={styles.reviewImage} />
                        ) : null}
                        <Text style={styles.dateText}>{new Date(item.timestamp).toLocaleString()}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#F7F5F2" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#3E2723" },
    subTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10, marginBottom: 10, color: "#3E2723" },
    form: { backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    label: { fontSize: 16, fontWeight: "500", marginTop: 5, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: "#E0E0E0", padding: 12, borderRadius: 10, backgroundColor: "#FAFAFA" },
    imageButtons: { flexDirection: "row", justifyContent: "space-between", marginVertical: 15 },
    actionBtn: { backgroundColor: "#f0f0f0", padding: 12, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: "center" },
    btnText: { fontWeight: "bold", fontSize: 16 },
    previewImage: { width: "100%", height: 200, borderRadius: 15, marginVertical: 10 },
    submitBtn: { backgroundColor: "#8D6E63", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 5 },
    submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    reviewCard: { backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 15, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    ratingText: { fontSize: 16, fontWeight: "bold", color: "#FF9800", marginBottom: 5 },
    reviewText: { fontSize: 16, color: "#333", marginBottom: 10 },
    reviewImage: { width: "100%", height: 200, borderRadius: 15, marginTop: 5 },
    dateText: { fontSize: 12, color: "#9E9E9E", marginTop: 10, textAlign: "right" }
});
