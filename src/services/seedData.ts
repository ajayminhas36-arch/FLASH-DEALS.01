import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MOCK_PRODUCTS = [
  {
    name: "iPhone 15 Pro Max",
    description: "The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.",
    originalPrice: 1199,
    discountedPrice: 899,
    stock: 15,
    isActive: true,
    image: "https://picsum.photos/seed/iphone/800/800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-walking-slowly-34407-large.mp4",
    category: "Electronics"
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones with exceptional sound quality.",
    originalPrice: 399,
    discountedPrice: 249,
    stock: 25,
    isActive: true,
    image: "https://picsum.photos/seed/sony/800/800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-dancing-40040-large.mp4",
    category: "Audio"
  },
  {
    name: "MacBook Air M3",
    description: "Supercharged by M3, the MacBook Air is the world's most popular laptop.",
    originalPrice: 1099,
    discountedPrice: 949,
    stock: 10,
    isActive: false,
    image: "https://picsum.photos/seed/macbook/800/800",
    category: "Computers"
  },
  {
    name: "iPad Pro 12.9",
    description: "The ultimate iPad experience with the world's most advanced mobile display.",
    originalPrice: 1099,
    discountedPrice: 999,
    stock: 8,
    isActive: false,
    image: "https://picsum.photos/seed/ipad/800/800",
    category: "Tablets"
  },
  {
    name: "Apple Watch Ultra 2",
    description: "The most rugged and capable Apple Watch ever.",
    originalPrice: 799,
    discountedPrice: 699,
    stock: 20,
    isActive: false,
    image: "https://picsum.photos/seed/watch/800/800",
    category: "Wearables"
  }
];

const MOCK_REELS = [
  {
    title: "iPhone 15 Pro Max Cinematic",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-walking-slowly-34407-large.mp4",
    category: "Electronics",
    timestamp: new Date().toISOString()
  },
  {
    title: "Sony Headphones Experience",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-dancing-40040-large.mp4",
    category: "Audio",
    timestamp: new Date().toISOString()
  }
];

export async function seedProducts() {
  try {
    const q = query(collection(db, 'products'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Seeding products...');
      for (const product of MOCK_PRODUCTS) {
        await addDoc(collection(db, 'products'), product);
      }
      console.log('Seeding complete!');
    }

    const reelQ = query(collection(db, 'reels'), limit(1));
    const reelSnapshot = await getDocs(reelQ);
    if (reelSnapshot.empty) {
      console.log('Seeding reels...');
      for (const reel of MOCK_REELS) {
        await addDoc(collection(db, 'reels'), reel);
      }
      console.log('Reels seeding complete!');
    }
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
      console.log('Skipping seed: User does not have permission to seed products.');
    } else {
      console.error('Error seeding products:', error);
    }
  }
}
