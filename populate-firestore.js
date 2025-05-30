import admin from "firebase-admin";

// Always connect to the Firestore emulator (since it's only used locally)
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8086";

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: "freewheelspin-com",
});

const db = admin.firestore();

async function seedData() {
  try {
    console.log("🏗️  Seeding Firestore with test data...");

    await db.collection("dashboard").doc("metrics").set({
      name: "FreeWheelSpin.com",
      totalSpins: 420,
      createdAt: admin.firestore.Timestamp.now(),
    });

    console.log("✅ Firestore test data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
  } finally {
    process.exit(0); // Exit after completing the script
  }
}

// Run the function
seedData();
