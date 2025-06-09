import React from "react";
import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import villagesData from "../data/villages.json";

export default function UploadVillageData() {
  const handleUpload = async () => {
    for (const village of villagesData) {
      const docId = village.id ? village.id.toString() : undefined;
      const ref = docId
        ? doc(db, "villages", docId)
        : doc(collection(db, "villages"));
      await setDoc(ref, village);
      console.log(`Uploaded: ${village.name}`);
    }
    alert("Upload complete!");
  };

  return (
    <div className="p-4">
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload Villages JSON to Firestore
      </button>
    </div>
  );
}