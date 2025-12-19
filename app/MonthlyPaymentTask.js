import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { getFirestore, collection, getDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';
import { format } from 'date-fns';

export const BACKGROUND_FETCH_TASK = 'monthly-payment-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;
    console.log("Background task started");

    if (!user) {
      console.error("No logged-in user found.");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const currentMonth = format(new Date(), 'yyyy-MM');

    // Corrected to use getDoc, not getDocs, to get a single document
    const ownerDocRef = doc(db, 'owners', user.uid);
    const ownerDocSnap = await getDoc(ownerDocRef);

    if (!ownerDocSnap.exists()) {
      console.error("Owner document not found.");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Querying the 'customers' collection for the current owner
    const customersRef = collection(db, 'owners', user.uid, 'customers');
    const customersSnapshot = await getDocs(customersRef);

    if (customersSnapshot.empty) {
      console.log("No customers found.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Iterate over each customer document and update monthly payments
    customersSnapshot.forEach(async (customerDoc) => {
      const customerData = customerDoc.data();

      if (customerData.lastUpdatedMonth !== currentMonth) {
        const currentPayment = customerData.payment || 0;
        const newMonthlyPayment = {
          month: currentMonth,
          payment: currentPayment,
          paid: false, 
        };

        // Use arrayUnion to add the new payment record to the existing array
        await updateDoc(customerDoc.ref, {
          monthlypayment: arrayUnion(newMonthlyPayment),
          lastUpdatedMonth: currentMonth,
        });

        console.log(`Updated monthly payment for customer: ${customerDoc.id}`);
      }
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error updating monthly payments:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
