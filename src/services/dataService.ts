import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, PriceRequest, Order, UserProfile, SupportMessage, FlashReel, Banner } from '../types';

export const dataService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    console.log(`Getting user profile for ${uid}...`);
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      const exists = docSnap.exists();
      console.log(`Profile exists: ${exists}`);
      return exists ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      console.error(`Error getting user profile for ${uid}:`, error);
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    console.log(`Updating user profile for ${uid}:`, data);
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, data, { merge: true });
      console.log(`Profile updated successfully for ${uid}`);
    } catch (error) {
      console.error(`Error updating user profile for ${uid}:`, error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Products
  subscribeToProducts(callback: (products: Product[]) => void) {
    const path = 'products';
    const q = query(collection(db, 'products'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      callback(products);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    const path = 'products';
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Requests
  async createPriceRequest(userId: string, productId: string, productName: string, productImage: string): Promise<void> {
    const path = 'requests';
    try {
      await addDoc(collection(db, 'requests'), {
        userId,
        productId,
        productName,
        productImage,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeToUserRequests(userId: string, callback: (requests: PriceRequest[]) => void) {
    const path = 'requests';
    const q = query(
      collection(db, 'requests'), 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PriceRequest));
      callback(requests);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  subscribeToAllRequests(callback: (requests: PriceRequest[]) => void) {
    const path = 'requests';
    const q = query(collection(db, 'requests'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PriceRequest));
      callback(requests);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async updateRequestStatus(id: string, status: PriceRequest['status']): Promise<void> {
    const path = `requests/${id}`;
    try {
      const docRef = doc(db, 'requests', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Orders
  async createOrder(orderData: Omit<Order, 'id'>): Promise<void> {
    const path = 'orders';
    try {
      await addDoc(collection(db, 'orders'), orderData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void) {
    const path = 'orders';
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  subscribeToAllOrders(callback: (orders: Order[]) => void) {
    const path = 'orders';
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    const path = `orders/${id}`;
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Support
  async sendSupportMessage(message: Omit<SupportMessage, 'id'>): Promise<void> {
    const path = 'support_messages';
    try {
      await addDoc(collection(db, 'support_messages'), message);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeToSupportMessages(callback: (messages: SupportMessage[]) => void) {
    const path = 'support_messages';
    const q = query(collection(db, 'support_messages'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  // Admin Stats
  async getAdminStats() {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const productsSnap = await getDocs(collection(db, 'products'));
      
      return {
        totalUsers: usersSnap.size,
        totalOrders: ordersSnap.size,
        activeDeals: productsSnap.docs.filter(d => d.data().isActive).length
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { totalUsers: 0, totalOrders: 0, activeDeals: 0 };
    }
  },

  // Flash Reels
  subscribeToReels(callback: (reels: FlashReel[]) => void) {
    const path = 'reels';
    const q = query(collection(db, 'reels'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FlashReel));
      callback(reels);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addReel(reel: Omit<FlashReel, 'id'>): Promise<void> {
    const path = 'reels';
    try {
      await addDoc(collection(db, 'reels'), reel);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteReel(id: string): Promise<void> {
    const path = `reels/${id}`;
    try {
      await deleteDoc(doc(db, 'reels', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Banners
  subscribeToBanners(callback: (banners: Banner[]) => void) {
    const path = 'banners';
    const q = query(collection(db, 'banners'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      callback(banners);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addBanner(banner: Omit<Banner, 'id'>): Promise<void> {
    const path = 'banners';
    try {
      await addDoc(collection(db, 'banners'), banner);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteBanner(id: string): Promise<void> {
    const path = `banners/${id}`;
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
