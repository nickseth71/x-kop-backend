# Frontend Integration - Quick Reference & Cheat Sheet

## Quick Start (Copy-Paste Ready)

### 1. Install Dependencies

```bash
npm install socket.io-client axios
```

### 2. Socket Configuration

```javascript
// socket.js
import io from "socket.io-client"

const token = localStorage.getItem("accessToken")
const userMobile = JSON.parse(localStorage.getItem("userInfo")).mobile

export const socket = io(process.env.REACT_APP_SOCKET_URL, {
  path: "/websocket",
  query: { token, callerId: userMobile },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
})

socket.on("connect", () => console.log("✅ Connected"))
socket.on("disconnect", () => console.log("❌ Disconnected"))
```

### 3. Complete Call Flow (Step by Step)

#### Step 1: Initialize Socket

```javascript
socket.emit("onLive", { status: "online" })
```

#### Step 2: Find Officer

```javascript
// REST API Call
const response = await axios.post(
  `${API_URL}/api/v1/scheduling/find-officer`,
  {
    consultationTypeName: "Legal Consultation",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
  },
  { headers: { Authorization: `Bearer ${token}` } },
)

const officer = response.data.data
// { id, name, mobile, avatar }
```

#### Step 3: Call Officer (Emit)

```javascript
socket.emit("call", {
  calleeId: officer.mobile,
  rtcMessage: { tokenUrl: "/api/v1/agoraTokenGen", channelName: "call_123" },
})
```

#### Step 4: Receiver Listens (Incoming Call)

```javascript
socket.on("newCall", (data) => {
  console.log("📱 Call from:", data.userInfo.name)
  // Show incoming call UI
  showIncomingCall({
    name: data.userInfo.name,
    avatar: data.userInfo.avatar,
    isFree: data.isFreeCall,
    freeMinutes: data.freeMinutesRemaining,
  })
})
```

#### Step 5: Answer Call (Emit)

```javascript
socket.emit("answerCall", {
  callerId: incomingCallData.callerId,
  rtcMessage: incomingCallData.rtcMessage,
  customer: customerId,
  officer: officerId,
})
```

#### Step 6: Both Receive Confirmation

```javascript
socket.on("callAnswered", (data) => {
  console.log("✅ Call Answered")
  const {
    consultationData, // { _id: consultation_id, ... }
    chatId,
    isFreeCall,
    freeMinutesRemaining,
  } = data

  // Initialize Agora video call
  initializeVideo(consultationData)

  // Start timer
  startCallTimer(freeMinutesRemaining)
})
```

#### Step 7: Sync Duration (Every 10 sec)

```javascript
socket.emit("syncCallDuration", {
  receiverUser: otherUserMobile,
  duration: callDurationInSeconds,
})

socket.on("updateCallDuration", (data) => {
  console.log("Duration:", data.callDuration)
})
```

#### Step 8: End Call (Emit)

```javascript
socket.emit("handsup", {
  otherUserId: otherUserMobile,
  type: "normal", // optional: 'call_reject', 'missed'
})

socket.on("appyHandsup", (data) => {
  console.log("📞 Call ended:", data.type)
  // Cleanup: stop video, close channels, etc.
})
```

---

## Socket Events Cheat Sheet

### EMIT (Send to Backend)

```javascript
// User Status
socket.emit("onLive", { status: "online" })

// Calling
socket.emit("call", { calleeId: "mobile", rtcMessage: {} })
socket.emit("answerCall", { callerId, rtcMessage, customer, officer })
socket.emit("handsup", { otherUserId, type: "normal" })

// Video
socket.emit("videocall", { calleeId: "mobile" })
socket.emit("VideoCallanswerCall", { callerId: "mobile" })

// Duration
socket.emit("syncCallDuration", { receiverUser: "mobile", duration: 120 })
```

### ON (Listen from Backend)

```javascript
// Incoming
socket.on("newCall", (data) => {})
socket.on("newVideoCall", (data) => {})

// Confirmation
socket.on("callAnswered", (data) => {})
socket.on("VideoCallAnswered", (data) => {})

// Status
socket.on("updateCallDuration", (data) => {})
socket.on("freeMinutesExpired", (data) => {})
socket.on("appyHandsup", (data) => {})

// Errors
socket.on("call_error", (error) => {})
socket.on("connect_error", (error) => {})
```

---

## REST API Endpoints Cheat Sheet

### Scheduling

```
POST   /api/v1/scheduling/find-officer
POST   /api/v1/scheduling/schedules
GET    /api/v1/scheduling/schedules
GET    /api/v1/scheduling/schedules/:id
PUT    /api/v1/scheduling/schedules/:id
DELETE /api/v1/scheduling/schedules/:id
```

### Consultations

```
GET    /api/v1/consultations/consultList
POST   /api/v1/consultations/get-consultation-by-date
```

### Agora Token

```
POST   /api/v1/agoraTokenGen
```

### Chat

```
POST   /api/v1/chat
GET    /api/v1/chat/:chatId
GET    /api/v1/chat/messages/:chatId
POST   /api/v1/chat/messages
```

### Users

```
POST   /api/v1/users/login
POST   /api/v1/users/register
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
```

---

## Data Structures

### Officer Object

```javascript
{
  _id: "officer_id",
  name: "Officer Name",
  mobile: "+919876543210",
  avatar: "image_url",
  officerDetails: {
    JobTitle: "Legal Consultant",
    ConsultationTypeID: {
      _id: "type_id",
      ConsultationTypeName: "Legal",
      FeePerMinute: 5
    }
  }
}
```

### Incoming Call Data

```javascript
{
  callerId: "caller_mobile",
  rtcMessage: { tokenUrl, channelName },
  userInfo: { _id, name, mobile, avatar },
  chatId: "chat_id",
  isFreeCall: true,
  freeMinutesRemaining: 15,
  consultationTypeName: "Legal"
}
```

### Call Answered Data

```javascript
{
  callee: "receiver_mobile",
  rtcMessage: { tokenUrl, channelName },
  consultationData: { _id, customer, officer, startCallTime, isFreeCall },
  chatId: "chat_id",
  isFreeCall: true,
  freeMinutesRemaining: 15
}
```

### User Info (After Login)

```javascript
{
  _id: "user_id",
  name: "User Name",
  mobile: "+919876543210",
  userRoleId: "role_id",
  avatar: "image_url",
  wallet: 500,
  hasFreeMinutes: true,
  freeMinutesUsed: 0,
  freeMinutesLimit: 15,
  isCalling: false,
  isOnline: true
}
```

---

## Error Handling Patterns

### Connection Error

```javascript
socket.on("connect_error", (error) => {
  if (error.message.includes("Authentication")) {
    // Redirect to login
    window.location.href = "/login"
  } else if (error.message.includes("Caller ID")) {
    // Re-fetch user info
    refreshUserInfo()
  }
})
```

### Call Error

```javascript
socket.on("call_error", (error) => {
  console.error("Call failed:", error.message)
  alert(error.message || "Call failed. Try again.")
})
```

### Receiver Not Found

```javascript
// When officer is offline, backend sends push notification
// Frontend should listen for notification and navigate to call screen
```

---

## Common Scenarios

### Scenario 1: Customer Calls Officer

```
Customer emits 'call'
↓
If Officer Online:
  Officer receives 'newCall'
  Officer emits 'answerCall'
  Both receive 'callAnswered'
↓
If Officer Offline:
  Backend sends FCM push notification
  Officer can answer from notification
```

### Scenario 2: Free Call Expires

```
Customer starts free call (15 min free)
↓
Timer set for 15 minutes
↓
After 15 min:
  Backend emits 'freeMinutesExpired' to both
  Backend emits 'appyHandsup' to both
↓
Both users disconnected from call
```

### Scenario 3: Call Rejected

```
Receiver rejects:
  socket.emit('handsup', { otherUserId, type: 'call_reject' })
↓
Caller receives:
  socket.on('appyHandsup', (data) => {
    if (data.type === 'call_reject') {
      // Handle rejection
    }
  })
```

---

## UI Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      APP START                              │
└────────────────────┬────────────────────────────────────────┘
                     │
            ┌────────▼─────────┐
            │   Login/Auth     │
            │ Get JWT & Mobile │
            └────────┬─────────┘
                     │
            ┌────────▼──────────────┐
            │ Connect Socket with   │
            │ token + callerId      │
            └────────┬──────────────┘
                     │
      ┌──────────────▼──────────────┐
      │  Browse Officers / Chat     │
      │  emit 'onLive'              │
      └──┬─────────────────────┬────┘
        │ Call Button         │ Receive Call
        │                     │
  ┌─────▼────────────┐  ┌───▼──────────────────┐
  │ emit 'call'      │  │ Listen 'newCall'     │
  │ Show Dialing UI  │  │ Show Incoming UI     │
  └─────┬────────────┘  └───┬──────────────────┘
        │                   │
        │                   │ Answer/Reject
        │                   │
   ┌────▼────────────────┬──▼──────────┐
   │ emit 'answerCall'   │ emit 'handsup'
   │ (from receiver)     │ type: 'call_reject'
   └────┬──────────┬─────┴──────────────┘
        │ Both Get │
   ┌────▼──────────▼──────┐
   │ Listen 'callAnswered'│
   │ Start Video (Agora)  │
   │ Start Timer          │
   └────┬─────────────────┘
        │
   ┌────▼───────────────────┐
   │ Active Call            │
   │ - Video streaming      │
   │ - Sync duration        │
   │ - Show timer           │
   └────┬──────────────────┘
        │ End Call
   ┌────▼──────────────────┐
   │ emit 'handsup'        │
   │ Listen 'appyHandsup'  │
   │ Stop Video (Agora)    │
   │ Show Summary          │
   └────┬──────────────────┘
        │
   ┌────▼──────────────┐
   │ Return to Home    │
   └───────────────────┘
```

---

## Quick Debugging Checklist

```javascript
// ✅ Connection Check
console.log("Socket ID:", socket.id)
console.log("Connected:", socket.connected)

// ✅ Token Check
console.log("Token:", localStorage.getItem("accessToken"))
console.log("User Mobile:", JSON.parse(localStorage.getItem("userInfo")).mobile)

// ✅ Event Listener Check
socket.on("*", (event, ...args) => {
  console.log("🔍 Event:", event, args)
})

// ✅ API Check
axios
  .get("/api/v1/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then((res) => console.log("✅ API OK:", res.data))

// ✅ Agora Check
console.log("Agora App ID:", process.env.REACT_APP_AGORA_APP_ID)

// ✅ Enable All Debug Logs
localStorage.debug = "socket.io-client:*"
```

---

## Production Checklist

- [ ] JWT token refresh before expiry
- [ ] Unsubscribe from all socket events on component unmount
- [ ] Handle socket disconnection gracefully
- [ ] Implement retry logic for failed API calls
- [ ] Use environment variables for all URLs
- [ ] Test auto-hangup on free minutes expiry
- [ ] Verify push notifications working
- [ ] Test call rejection flow
- [ ] Verify payment deduction after call
- [ ] Clear localStorage on logout
- [ ] Implement call history pagination
- [ ] Add call quality indicators
- [ ] Monitor socket memory leaks
- [ ] Test on slow network
- [ ] Add error tracking/logging service

---

## Performance Tips

1. **Debounce Duration Sync**: Don't sync every second

   ```javascript
   if (callDurationSeconds % 10 === 0) {
     socket.emit("syncCallDuration", { ...data })
   }
   ```

2. **Clean Up Event Listeners**: Remove on unmount

   ```javascript
   useEffect(() => {
     return () => socket.off("newCall")
   }, [])
   ```

3. **Memoize Socket Callbacks**: Prevent recreation

   ```javascript
   const handleNewCall = useCallback((data) => {}, [])
   ```

4. **Lazy Load Agora SDK**: Only when needed
   ```javascript
   const AgoraRTC = await import("agora-rtc-sdk-ng")
   ```

---

**Version**: 1.0.0 | Last Updated: 2026-07-06
