// import admin from 'firebase-admin';

// // admin.initializeApp({
// //   credential: admin.credential.cert({
// //   "type": "service_account",
// //   "project_id": "xkop-customer",
// //   "private_key_id": "e71fe74911c0774d88362a0cc7c110cefbea11be",
// //   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCy6jkgHZIUrLW8\ne/zvN3TqMBvg/gcZJhMY+ODnIPj4yuD+uLnfx7YdWbHIsH2uZknaWBuo1CLtXNwr\nNGIoCTSi0M82YOiH8hkE8dKzKzccNNwtadvjxWDayZw5tGL7CCSFNS8WIggXlk+V\nlvBhhl4YfbihCOfQR2tiCKWrFxkLgJUrnh1UDh9hn8/qeGHQjvroppljm2+m3tBR\nJxyil8bbXMW9oyUuLy3GAcsdcCtBlo/FbrsiQcEEDnPHWY7X1thMLk7CEGuiKACH\n80Z37JZFxEhKLReFIb0eZfsQoleZ8rWto1hwWot1JF4HL5aTgE385TLZzz0Mq4iw\n6DXOvfV5AgMBAAECggEAAau2RNqB1reWKuBtiD5YVSeF2yAEKPP2EbGhSAdCy+/5\nEefftHtE9Bk2U81yHwLNhcB04aq5eMX5OF4Q3JbZavvQM43MHhjgqu8nLI0mwpir\nxbDLYOEi+mgPkWph0j5NOQE6I1bGBJJew+LY89AxaMEjzD0tDQDdu9ig02wvy6+v\nraO6P5RaN4yGDgJIRlrA3a8IbDuowRMDsNnIqaGGH91lsOvHLGxY3XjUyOXIBEiV\nbrFcVwDy4/gc49zvQlTO5XBb7pWjYpvhlFEylNDumNlqYk4gRWzw75Q/0rBFpXeL\nkSd/n2db9kOhpneaFEZxRX5NW+zxBXHPNM0z0/BcEQKBgQDyjcF738OSlzeEdmf5\nb6bneWLzNPaIAm57lCoyFGQXs9mfy0dE/Q3h/C5E9V7oA6akvCpqrbxuGpGGYGeU\nlT4ES++kmYdKxG+RtiN4pQxm0aAtkzSPegG5mdAlRc20KLPAB8jemx2egwB2ZtUS\n+pJdHPqzYP3cPq20qwt9SDCiMwKBgQC81VN5llcvIfDTmLvK1MOXb056/GnuB0Ep\nSpfkG4JtUYrdB375NK1OX7R2X+IH0O2G8ljMHqX+3jFGF4qbMdY5IFjcy9pKl8C4\nW4ak0xRM04If2eUMaf2P2WxBUlH9EV/9uKZIGJeLOJW35hq0K/P8nSqPRajTQe5/\nRUXeiCWVowKBgAoxTson0w4b8KdOWnwu5vKfNTtHJHz+rSngRg2osbQVSLXgUvRh\nNe4jLMaVERHq5VvS1G17M4nk7+yXrIKf6uU/U6i1EuxfaNjUsJTnSqgfcv23S+Qj\nmmL0RbzrPAOwGi2dpiFEn3ADzUcsdxO/F9t11ksnbkONFrua3Ha9S93lAoGBAJLe\npS9TdHoPPv2EtMM8muhExVi4zDc7Yz4Xa24ay2X1XzkspGB1zTnBDF5pkycbJDOq\neNBCIj/KV665jq/IomMKOrN4xk7wGxAI9/9owUhD1diqJBF0uqfQpvdjbKuVgQCZ\nRpOatPuuxhwjl6985CcdosWOm5G8nSBWI9LCN+FbAoGBAM/nLcp/nlkWmlZ3l9bD\ngc0j4WokgDDMe+4udkPEFwztHoIbD2TfQbFjBodkJwzhfz+b9A5hnb7HxqhwSuVn\nrvlzKIipKk7H9HG7WYlv1eU7qdW3rXQKFokOUJEFsYq3OQENf1AXWbe3t2bqE5dN\nPE6qRiBaIOg2h4jCFJP8/vUI\n-----END PRIVATE KEY-----\n",
// //   "client_email": "firebase-adminsdk-mxz62@xkop-customer.iam.gserviceaccount.com",
// //   "client_id": "104632264354038594384",
// //   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
// //   "token_uri": "https://oauth2.googleapis.com/token",
// //   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
// //   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-mxz62%40xkop-customer.iam.gserviceaccount.com",
// //   "universe_domain": "googleapis.com"
// // }),
// // });

// admin.initializeApp({
//   credential: admin.credential.cert({
//     "type": "service_account",
//     "project_id": "xkop-officer",
//     "private_key_id": "f0520c3e889cd4a102d953e7eb8f352f8f1e3d64",
//     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCwzC+1tRcZNaZz\nnxTqUR9wyyTaYuHnZrnVzSwh1rpKl+HMkTgJv6/bdWyV40O5z6p167oxLgifaT/8\nkdF8Z7isGPC8+xZWuPmSEAADLYuYlBdRsiDJI22FHo5d9X11vsdgYL6KHo5nOWuz\nQEnU9pFsMe8xIYwp16MSQDnGpwp9XDtl4DT2qvGB64cOvwf3hS6ciqLfYs8GHp+0\nNox0AaJ1nyFPLa/Zwo3JqwNQl4N8Qv+3YNindBwZ1gFOXEnjh1zqAMcBK9p14xTd\nemM04lOuSCCHerC6GyNPnhmG+6HNDUh+lWTvZGXQsnl08JwYSu4umJ+agtqQr5a7\nwNUwyKSvAgMBAAECggEAUP4JcT23ijX4vgkHpNxrAdoeVOltwftecOKgMBRVnWx8\n5aE1QcoNvwTJLNVDJnFLDuBhmLwU+SpXRNZsWIiPok9+oaSJNEtjEZXA27PWupxF\nHojy2hIfzxcTc1nOEs3GOpG3WEDtTb6RZzmxWR1nu2AYyrIqqtR9gRPpI+dMN+bw\n5uLHZ7tPLf9qXnDHFt1TGJpp4tMy934y8edBn9b2WY8VjyJ8u9eHh24jzVCaO58+\nO3Jf8BAvLsgktKtM2y5ahuaRHxrQS8Q989NCDtLAR5/w7tBSM/6L/kTRG+QfZeEa\nzZGiATON7amve3EvKusuezTff5Oq1XvAa5ocoYjIcQKBgQDU3AErzCfiRCBfK5OY\nfXKreuYpVprCSLGwgo89v2YiwIZEraInr5kwB4Bl5s762ze7jsDtcjbLMGPbHowN\n4kXWuE6xHq0bnCSOU5IQpmX/SZqrt8YKHQeaQAo1qMylo5/GxIvX3SSNKwUlkRvt\nGrW7AQrLjKJaEx18+44SMB0yRwKBgQDUoSbwlmU5m8D4wKKIgYv6DiVYNaT7F5Pz\nASsgkPF/niF5D9AseSbOFz/psKeU3PUu3rNh1ml3ORvlft2DwPh8dFCQeAEmoj9M\ns2w1GrXgSgm4UfEY3rWNm3HBDjRYjLWhDGTXswAU8DRdhi8P+TShaua7MdvPBWFp\n1Nh8jqeGWQKBgQCuGGsUyVvtok7fyCJl3GTHgDNzqBPXx+EdPwutMzh0QAcRcPpp\nfyPJtrj7n3W2k0nYK3/8NSg/tApYE3n1eRYp8oDaOP7Y0DLN/eg/mflefXL1888U\nQn4PWUWAcdk/uL5bsjG2knbsxzzkZvTyTqBInSeZKCM5jNzXdl/S3GtkzQKBgHn5\nVBgxfjH06lcIUnSSNBUm5j9azqCHnwSIiA/vdcnqkXMcIiRQ/3S8G5rYDtozgqb3\nc9nNIMUWyqz1AOei3CiwpMKrRKW/7yX1yz4Pa4QVlMvanb7Riz6HjFLd7iNZ3Jtd\nO8AM3CAmxzNbVUYJhCqQ43lBGcIBaSdHxUR2pR1JAoGBANRhZBMFu+ArxjkUCfMh\n3gr7ZGeLX3/MSGIRwE1V2Hg+OgA4HnGU1Lt/NqRcujPfA5bLFj757D723m5Dyiex\nRv5jQenpsK9ZIv0gQ3KLFZ5TZvJKT2yEI0dRWWfLtZU2iHVMCpE3Lgp9ETEIHqeZ\ne2Ch42FIMJKNduXKtWgBSmie\n-----END PRIVATE KEY-----\n",
//     "client_email": "firebase-adminsdk-804r9@xkop-officer.iam.gserviceaccount.com",
//     "client_id": "104639604269116393758",
//     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//     "token_uri": "https://oauth2.googleapis.com/token",
//     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-804r9%40xkop-officer.iam.gserviceaccount.com",
//     "universe_domain": "googleapis.com"
// }),
// });

// export const sendPushNotificationCall = async (fcmToken, notificationData) => {
//   if (!fcmToken || typeof fcmToken !== 'string') {
//     throw new Error('Invalid FCM token provided');
//   }

//   // Simplify the data payload to reduce size
//   const simplifiedData = {
//     action: 'CALL_NOTIFICATION',
//     // callUUID: notificationData.callUUID || require('uuid').v4(),
//     callerId: notificationData.callerId,
//     data: JSON.stringify(notificationData)
//   };

//   const message = {
//     data: simplifiedData,
//     token: fcmToken,
//     android: {
//       priority: 'high',
//       ttl: 60,
//       // notification: {
//       //   channelId: 'call',
//       //   sound: 'default',
//       //   priority: 'max',
//       //   visibility: 'public'
//       // }
//     },
//     apns: {
//       payload: {
//         aps: {
//           sound: 'default',
//           category: 'CALL_NOTIFICATION',
//           'mutable-content': 1
//         }
//       }
//     }
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Call notification sent successfully:', response);
//     return response;
//   } catch (error) {
//     console.error('Error sending call notification:', error);
//     throw error;
//   }
// };

// export async function sendPushNotification(message) {
//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Push notification sent successfully:', response);
//   } catch (error) {
//     console.error('Error sending push notification:', error);

//     if (error.code === 'messaging/registration-token-not-registered') {
//       console.log('FCM token not registered. Proceed with token cleanup.');
//     }
//   }
// }

import admin from "firebase-admin";

const customerApp = admin.initializeApp(
  {
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "xkop-customer",
      private_key_id: "e71fe74911c0774d88362a0cc7c110cefbea11be",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCy6jkgHZIUrLW8\ne/zvN3TqMBvg/gcZJhMY+ODnIPj4yuD+uLnfx7YdWbHIsH2uZknaWBuo1CLtXNwr\nNGIoCTSi0M82YOiH8hkE8dKzKzccNNwtadvjxWDayZw5tGL7CCSFNS8WIggXlk+V\nlvBhhl4YfbihCOfQR2tiCKWrFxkLgJUrnh1UDh9hn8/qeGHQjvroppljm2+m3tBR\nJxyil8bbXMW9oyUuLy3GAcsdcCtBlo/FbrsiQcEEDnPHWY7X1thMLk7CEGuiKACH\n80Z37JZFxEhKLReFIb0eZfsQoleZ8rWto1hwWot1JF4HL5aTgE385TLZzz0Mq4iw\n6DXOvfV5AgMBAAECggEAAau2RNqB1reWKuBtiD5YVSeF2yAEKPP2EbGhSAdCy+/5\nEefftHtE9Bk2U81yHwLNhcB04aq5eMX5OF4Q3JbZavvQM43MHhjgqu8nLI0mwpir\nxbDLYOEi+mgPkWph0j5NOQE6I1bGBJJew+LY89AxaMEjzD0tDQDdu9ig02wvy6+v\nraO6P5RaN4yGDgJIRlrA3a8IbDuowRMDsNnIqaGGH91lsOvHLGxY3XjUyOXIBEiV\nbrFcVwDy4/gc49zvQlTO5XBb7pWjYpvhlFEylNDumNlqYk4gRWzw75Q/0rBFpXeL\nkSd/n2db9kOhpneaFEZxRX5NW+zxBXHPNM0z0/BcEQKBgQDyjcF738OSlzeEdmf5\nb6bneWLzNPaIAm57lCoyFGQXs9mfy0dE/Q3h/C5E9V7oA6akvCpqrbxuGpGGYGeU\nlT4ES++kmYdKxG+RtiN4pQxm0aAtkzSPegG5mdAlRc20KLPAB8jemx2egwB2ZtUS\n+pJdHPqzYP3cPq20qwt9SDCiMwKBgQC81VN5llcvIfDTmLvK1MOXb056/GnuB0Ep\nSpfkG4JtUYrdB375NK1OX7R2X+IH0O2G8ljMHqX+3jFGF4qbMdY5IFjcy9pKl8C4\nW4ak0xRM04If2eUMaf2P2WxBUlH9EV/9uKZIGJeLOJW35hq0K/P8nSqPRajTQe5/\nRUXeiCWVowKBgAoxTson0w4b8KdOWnwu5vKfNTtHJHz+rSngRg2osbQVSLXgUvRh\nNe4jLMaVERHq5VvS1G17M4nk7+yXrIKf6uU/U6i1EuxfaNjUsJTnSqgfcv23S+Qj\nmmL0RbzrPAOwGi2dpiFEn3ADzUcsdxO/F9t11ksnbkONFrua3Ha9S93lAoGBAJLe\npS9TdHoPPv2EtMM8muhExVi4zDc7Yz4Xa24ay2X1XzkspGB1zTnBDF5pkycbJDOq\neNBCIj/KV665jq/IomMKOrN4xk7wGxAI9/9owUhD1diqJBF0uqfQpvdjbKuVgQCZ\nRpOatPuuxhwjl6985CcdosWOm5G8nSBWI9LCN+FbAoGBAM/nLcp/nlkWmlZ3l9bD\ngc0j4WokgDDMe+4udkPEFwztHoIbD2TfQbFjBodkJwzhfz+b9A5hnb7HxqhwSuVn\nrvlzKIipKk7H9HG7WYlv1eU7qdW3rXQKFokOUJEFsYq3OQENf1AXWbe3t2bqE5dN\nPE6qRiBaIOg2h4jCFJP8/vUI\n-----END PRIVATE KEY-----\n",
      client_email:
        "firebase-adminsdk-mxz62@xkop-customer.iam.gserviceaccount.com",
      client_id: "104632264354038594384",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-mxz62%40xkop-customer.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    }),
  },
  "customer"
);

const officerApp = admin.initializeApp(
  {
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "xkop-officer",
      private_key_id: "f0520c3e889cd4a102d953e7eb8f352f8f1e3d64",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCwzC+1tRcZNaZz\nnxTqUR9wyyTaYuHnZrnVzSwh1rpKl+HMkTgJv6/bdWyV40O5z6p167oxLgifaT/8\nkdF8Z7isGPC8+xZWuPmSEAADLYuYlBdRsiDJI22FHo5d9X11vsdgYL6KHo5nOWuz\nQEnU9pFsMe8xIYwp16MSQDnGpwp9XDtl4DT2qvGB64cOvwf3hS6ciqLfYs8GHp+0\nNox0AaJ1nyFPLa/Zwo3JqwNQl4N8Qv+3YNindBwZ1gFOXEnjh1zqAMcBK9p14xTd\nemM04lOuSCCHerC6GyNPnhmG+6HNDUh+lWTvZGXQsnl08JwYSu4umJ+agtqQr5a7\nwNUwyKSvAgMBAAECggEAUP4JcT23ijX4vgkHpNxrAdoeVOltwftecOKgMBRVnWx8\n5aE1QcoNvwTJLNVDJnFLDuBhmLwU+SpXRNZsWIiPok9+oaSJNEtjEZXA27PWupxF\nHojy2hIfzxcTc1nOEs3GOpG3WEDtTb6RZzmxWR1nu2AYyrIqqtR9gRPpI+dMN+bw\n5uLHZ7tPLf9qXnDHFt1TGJpp4tMy934y8edBn9b2WY8VjyJ8u9eHh24jzVCaO58+\nO3Jf8BAvLsgktKtM2y5ahuaRHxrQS8Q989NCDtLAR5/w7tBSM/6L/kTRG+QfZeEa\nzZGiATON7amve3EvKusuezTff5Oq1XvAa5ocoYjIcQKBgQDU3AErzCfiRCBfK5OY\nfXKreuYpVprCSLGwgo89v2YiwIZEraInr5kwB4Bl5s762ze7jsDtcjbLMGPbHowN\n4kXWuE6xHq0bnCSOU5IQpmX/SZqrt8YKHQeaQAo1qMylo5/GxIvX3SSNKwUlkRvt\nGrW7AQrLjKJaEx18+44SMB0yRwKBgQDUoSbwlmU5m8D4wKKIgYv6DiVYNaT7F5Pz\nASsgkPF/niF5D9AseSbOFz/psKeU3PUu3rNh1ml3ORvlft2DwPh8dFCQeAEmoj9M\ns2w1GrXgSgm4UfEY3rWNm3HBDjRYjLWhDGTXswAU8DRdhi8P+TShaua7MdvPBWFp\n1Nh8jqeGWQKBgQCuGGsUyVvtok7fyCJl3GTHgDNzqBPXx+EdPwutMzh0QAcRcPpp\nfyPJtrj7n3W2k0nYK3/8NSg/tApYE3n1eRYp8oDaOP7Y0DLN/eg/mflefXL1888U\nQn4PWUWAcdk/uL5bsjG2knbsxzzkZvTyTqBInSeZKCM5jNzXdl/S3GtkzQKBgHn5\nVBgxfjH06lcIUnSSNBUm5j9azqCHnwSIiA/vdcnqkXMcIiRQ/3S8G5rYDtozgqb3\nc9nNIMUWyqz1AOei3CiwpMKrRKW/7yX1yz4Pa4QVlMvanb7Riz6HjFLd7iNZ3Jtd\nO8AM3CAmxzNbVUYJhCqQ43lBGcIBaSdHxUR2pR1JAoGBANRhZBMFu+ArxjkUCfMh\n3gr7ZGeLX3/MSGIRwE1V2Hg+OgA4HnGU1Lt/NqRcujPfA5bLFj757D723m5Dyiex\nRv5jQenpsK9ZIv0gQ3KLFZ5TZvJKT2yEI0dRWWfLtZU2iHVMCpE3Lgp9ETEIHqeZ\ne2Ch42FIMJKNduXKtWgBSmie\n-----END PRIVATE KEY-----\n",
      client_email:
        "firebase-adminsdk-804r9@xkop-officer.iam.gserviceaccount.com",
      client_id: "104639604269116393758",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-804r9%40xkop-officer.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    }),
  },
  "officer"
);

export const sendPushNotificationCall = async (
  fcmToken,
  notificationData,
  project = "officer" // default fallback
) => {
  if (!fcmToken || typeof fcmToken !== "string") {
    throw new Error("Invalid FCM token provided");
  }

  if (!["customer", "officer"].includes(project)) {
    console.warn("⚠️ Unknown project used for push notification:", project);
    project = "officer"; // fallback safety
  }

  console.log("Sending notification using project:", project);

  const firebaseApp =
    project === "customer" ? admin.app("customer") : admin.app("officer");

  const simplifiedData = {
    action: "CALL_NOTIFICATION",
    callerId: notificationData.callerId,
    data: JSON.stringify(notificationData),
  };

  const message = {
    data: simplifiedData,
    token: fcmToken,
    android: {
      priority: 'high',
      ttl: 60,
      // notification: {
      //   channelId: 'call',
      //   sound: 'default',
      //   priority: 'max',
      //   visibility: 'public'
      // }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          category: 'CALL_NOTIFICATION',
          'mutable-content': 1
        }
      }
    }
  };

  try {
    const response = await firebaseApp.messaging().send(message);
    console.log("📨 Call notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❗ Error sending call notification:", error);
    throw error;
  }
};



export async function sendPushNotification(message, project = "officer") {
  try {
    const firebaseApp =
      project === "customer" ? admin.app("customer") : admin.app("officer");

    const response = await firebaseApp.messaging().send(message);
    console.log("Push notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending push notification:", error);

    if (error.code === "messaging/registration-token-not-registered") {
      console.log("FCM token not registered. Proceed with token cleanup.");
    }
  }
}
