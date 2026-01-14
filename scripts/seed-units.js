const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const { firebaseConfig } = require("../lib/firebase.ts");

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const units = [
  { name: "Kilogram", symbol: "kg" },
  { name: "Gram", symbol: "g" },
  { name: "Litre", symbol: "L" },
  { name: "Millilitre", symbol: "ml" },
  { name: "Piece", symbol: "pc" },
  { name: "Dozen", symbol: "dz" },
];

async function seedUnits() {
  const unitsCollection = collection(db, "units");
  for (const unit of units) {
    try {
      await addDoc(unitsCollection, unit);
      console.log(`Added unit: ${unit.name}`);
    } catch (error) {
      console.error(`Error adding unit: ${unit.name}`, error);
    }
  }
}

seedUnits().then(() => {
  console.log("Finished seeding units.");
  process.exit(0);
}).catch((error) => {
  console.error("Error seeding units:", error);
  process.exit(1);
});
