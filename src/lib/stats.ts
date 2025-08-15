import { db } from "./firebase";
import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";

// Fungsi untuk menambah atau mengurangi total pengguna
export const updateUserCount = async (action: 'increment' | 'decrement') => {
    const statsDocRef = doc(db, 'app-stats', 'live');
    await setDoc(statsDocRef, {
        totalUsers: increment(action === 'increment' ? 1 : -1)
    }, { merge: true });
};

// Fungsi untuk mencatat kalkulasi harian
export const recordCalculation = async () => {
    const statsDocRef = doc(db, 'app-stats', 'live');
    const todayStr = new Date().toDateString();

    try {
        const docSnap = await getDoc(statsDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastDateStr = data.lastCalculationDate?.toDate().toDateString();

            if (lastDateStr === todayStr) {
                // Hari yang sama, cukup increment
                await setDoc(statsDocRef, {
                    dailyCalculations: increment(1)
                }, { merge: true });
            } else {
                // Hari baru, reset counter
                await setDoc(statsDocRef, {
                    dailyCalculations: 1,
                    lastCalculationDate: serverTimestamp()
                }, { merge: true });
            }
        } else {
            // Dokumen belum ada, buat baru
            await setDoc(statsDocRef, {
                dailyCalculations: 1,
                lastCalculationDate: serverTimestamp()
            }, { merge: true });
        }
    } catch (error) {
        console.error("Error recording calculation:", error);
    }
};