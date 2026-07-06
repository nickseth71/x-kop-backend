# Frontend Integration Guide - Call & Scheduling System

This guide provides comprehensive instructions for frontend developers to integrate the X-Kop call and scheduling system.

---

## Table of Contents

1. [Setup & Dependencies](#setup--dependencies)
2. [Authentication Flow](#authentication-flow)
3. [WebSocket Connection](#websocket-connection)
4. [REST API Integration](#rest-api-integration)
5. [Complete Call Flow](#complete-call-flow)
6. [Socket Events Reference](#socket-events-reference)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)

---

## Setup & Dependencies

### Required Libraries

```bash
npm install socket.io-client axios
# For React:
npm install react-hook-form zustand
```

### Environment Configuration

```javascript
// .env or config file
REACT_APP_API_BASE_URL=http://localhost:8001
REACT_APP_SOCKET_URL=http://localhost:8001
REACT_APP_AGORA_APP_ID=<your_agora_app_id>
```

---

## Authentication Flow

### 1. Login & Get JWT Token

**Endpoint**: `POST /api/v1/users/login`

```javascript
// Request
{
  "mobile": "+91xxxx",
  "password": "password"
}

// Response
{
  "statusCode": 200,
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "mobile": "+91xxxx",
      "userRoleId": "role_id",
      "avatar": "url",
      "wallet": 500,
      "hasFreeMinutes": true,
      "freeMinutesUsed": 0,
      "freeMinutesLimit": 15
    }
  }
}
```

### 2. Store Token & User Info

```javascript
// Store in localStorage or state management
localStorage.setItem("accessToken", response.data.data.accessToken)
localStorage.setItem("userInfo", JSON.stringify(response.data.data.user))
```

---

## WebSocket Connection

### Initialize Socket Connection

```javascript
import io from "socket.io-client"

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL
const token = localStorage.getItem("accessToken")
const userInfo = JSON.parse(localStorage.getItem("userInfo"))

// Create socket instance
const socket = io(SOCKET_URL, {
  path: "/websocket",
  query: {
    token: token,
    callerId: userInfo.mobile, // Important: use mobile number
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
})

// Connection events
socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id)
  // Notify user is online
  socket.emit("onLive", { status: "online" })
})

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket")
})

socket.on("connect_error", (error) => {
  console.error("🔴 Connection error:", error)
})

export default socket
```

---

## REST API Integration

### 1. Find Available Officer

**Endpoint**: `POST /api/v1/scheduling/find-officer`

```javascript
async function findOfficer(consultationType, startTime, endTime) {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/v1/scheduling/find-officer`,
      {
        consultationTypeName: consultationType,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data.data // Returns officer ID, name, mobile, avatar
  } catch (error) {
    console.error("Error finding officer:", error)
    throw error
  }
}
```

### 2. Create Schedule (Optional)

**Endpoint**: `POST /api/v1/scheduling/schedules`

```javascript
async function createSchedule(officerId, startTime, endTime) {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/v1/scheduling/schedules`,
      {
        officer: officerId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status: "scheduled",
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data.data
  } catch (error) {
    console.error("Error creating schedule:", error)
    throw error
  }
}
```

### 3. Get Consultation History

**Endpoint**: `GET /api/v1/consultations/consultList?page=1&limit=10`

```javascript
async function getConsultationHistory(page = 1, limit = 10) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/v1/consultations/consultList`,
      {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    console.error("Error fetching consultation history:", error)
    throw error
  }
}
```

---

## Complete Call Flow

### Step-by-Step Integration

#### **Phase 1: Search & Select Officer**

```javascript
// 1. Frontend searches for available officers
const officer = await findOfficer("Legal Consultation", startTime, endTime)
// Returns: { id, name, mobile, avatar }

// 2. Display officer to user and get confirmation
// User clicks "Call Officer"
```

#### **Phase 2: Initiate Call (WebSocket)**

```javascript
function initiateCall(officer) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  // Generate RTC message (for Agora token, call your backend or use Agora SDK)
  const rtcMessage = {
    tokenUrl: "/api/v1/agoraTokenGen", // Endpoint to get Agora token
    channelName: `consultation_${Date.now()}`,
  }

  // Emit call event
  socket.emit("call", {
    calleeId: officer.mobile, // Important: use mobile number
    rtcMessage: rtcMessage,
  })

  // Handle errors
  socket.on("call_error", (error) => {
    console.error("❌ Call failed:", error.message)
    showNotification("Call failed", "error")
  })
}
```

#### **Phase 3: Receiver Listens for Incoming Call**

```javascript
// Receiver (Officer) listens for incoming call
socket.on("newCall", async (data) => {
  console.log("📱 Incoming call from:", data.userInfo.name)

  const incomingCallData = {
    callerId: data.callerId,
    callerName: data.userInfo.name,
    callerMobile: data.userInfo.mobile,
    callerAvatar: data.userInfo.avatar,
    chatId: data.chatId,
    rtcMessage: data.rtcMessage,
    isFreeCall: data.isFreeCall,
    freeMinutesRemaining: data.freeMinutesRemaining,
    consultationTypeName: data.consultationTypeName,
  }

  // Show incoming call UI
  displayIncomingCallUI(incomingCallData)

  // Auto-dismiss after 30 seconds if not answered
  setTimeout(() => {
    if (!callAnswered) {
      socket.emit("handsup", {
        otherUserId: data.callerId,
        type: "missed",
      })
    }
  }, 30000)
})

// Listen for push notifications when offline
socket.on("push_notification", (notification) => {
  console.log("🔔 Push notification:", notification)
  // Handle notification and navigate to incoming call screen
})
```

#### **Phase 4: Answer Call**

```javascript
function answerCall(incomingCallData) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  socket.emit("answerCall", {
    callerId: incomingCallData.callerId,
    rtcMessage: incomingCallData.rtcMessage,
    customer: incomingCallData.customerId,
    officer: userInfo._id,
  })

  // Listen for confirmation
  socket.on("callAnswered", (data) => {
    console.log("✅ Call answered")
    console.log("Chat ID:", data.chatId)
    console.log("Consultation ID:", data.consultationData._id)
    console.log("Is Free Call:", data.isFreeCall)
    console.log("Free Minutes Remaining:", data.freeMinutesRemaining)

    // Initialize Agora/RTC connection
    initializeAgoraCall(data)

    // Show video call UI
    displayVideoCallUI(data)

    // Start call duration timer
    startCallTimer(data)
  })
}

function initializeAgoraCall(consultationData) {
  // 1. Get Agora token from backend
  // 2. Initialize Agora client
  // 3. Join channel
  // 4. Subscribe to remote user
  // Example implementation:
  /*
  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  
  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
  });
  
  await client.join(
    appId,
    channelName,
    token,
    userInfo._id
  );
  
  await client.publish(await AgoraRTC.createMicrophoneAndCameraTracks());
  */
}
```

#### **Phase 5: Sync Call Duration**

```javascript
let callDurationSeconds = 0
let callTimerInterval

function startCallTimer(consultationData) {
  callTimerInterval = setInterval(() => {
    callDurationSeconds++

    // Emit sync every 10 seconds
    if (callDurationSeconds % 10 === 0) {
      socket.emit("syncCallDuration", {
        receiverUser: otherUserMobile,
        duration: callDurationSeconds,
      })
    }

    // Update UI with call duration
    updateCallDurationUI(formatDuration(callDurationSeconds))

    // Check for auto-hangup (free minutes expired)
    if (
      consultationData.isFreeCall &&
      callDurationSeconds >= consultationData.freeMinutesRemaining * 60
    ) {
      console.log("⏰ Free minutes expired")
      socket.emit("handsup", { otherUserId: otherUserMobile })
    }
  }, 1000)

  // Listen for duration updates from other party
  socket.on("updateCallDuration", (data) => {
    console.log("Call duration:", data.callDuration)
  })

  // Listen for auto-hangup
  socket.on("freeMinutesExpired", (data) => {
    console.log("🎁 Free minutes expired")
    showNotification(data.message)
    // Trigger hangup
    endCall()
  })
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
```

#### **Phase 6: End Call**

```javascript
function endCall() {
  // Clear timer
  if (callTimerInterval) {
    clearInterval(callTimerInterval)
  }

  // Get other user's mobile
  const otherUserMobile = getOtherUserMobile() // From call data

  // Emit hangup
  socket.emit("handsup", {
    otherUserId: otherUserMobile,
    type: "normal", // or 'call_reject'
  })

  // Listen for hangup confirmation
  socket.on("appyHandsup", (data) => {
    console.log("📞 Call ended")
    console.log("Type:", data.type)

    // Stop Agora/RTC
    stopAgoraCall()

    // Close Agora channel
    // client.leave();

    // Show call summary
    displayCallSummary({
      duration: callDurationSeconds,
      cost: calculatedCost,
      consultationId: consultationData._id,
    })

    // Navigate back
    setTimeout(() => {
      navigateToHome()
    }, 2000)
  })

  // Auto-hangup if not answered by other party
  socket.on("appyHandsup", (data) => {
    if (data.type === "call_reject") {
      console.log("📞 Call rejected by receiver")
      showNotification("Call rejected")
    }
  })
}

function rejectCall() {
  socket.emit("handsup", {
    otherUserId: incomingCallData.callerId,
    type: "call_reject",
  })

  // Hide incoming call UI
  closeIncomingCallUI()
}
```

---

## Socket Events Reference

### Emitted Events (from Frontend)

| Event                 | Data                                          | Purpose                   |
| --------------------- | --------------------------------------------- | ------------------------- |
| `onLive`              | `{ status: 'online' \| 'offline' }`           | Update user online status |
| `call`                | `{ calleeId, rtcMessage }`                    | Initiate call             |
| `answerCall`          | `{ callerId, rtcMessage, customer, officer }` | Accept incoming call      |
| `syncCallDuration`    | `{ receiverUser, duration }`                  | Sync call duration        |
| `videocall`           | `{ calleeId }`                                | Start video portion       |
| `VideoCallanswerCall` | `{ callerId }`                                | Accept video call         |
| `handsup`             | `{ otherUserId, type? }`                      | End/reject call           |

### Received Events (to Frontend)

| Event                | Data                                                                                                 | Purpose                    |
| -------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| `newCall`            | `{ callerId, rtcMessage, userInfo, chatId, isFreeCall, freeMinutesRemaining, consultationTypeName }` | Incoming call notification |
| `callAnswered`       | `{ callee, rtcMessage, consultationData, chatId, isFreeCall, freeMinutesRemaining }`                 | Call accepted              |
| `call_error`         | `{ message, error? }`                                                                                | Call failed                |
| `newVideoCall`       | `{}`                                                                                                 | Incoming video call        |
| `VideoCallAnswered`  | `{}`                                                                                                 | Video call accepted        |
| `updateCallDuration` | `{ callDuration }`                                                                                   | Duration sync              |
| `freeMinutesExpired` | `{ status, message, consultationId }`                                                                | Free minutes expired       |
| `appyHandsup`        | `{ status, type, autoHangup? }`                                                                      | Call ended/rejected        |

---

## Error Handling

```javascript
class CallHandler {
  constructor(socket) {
    this.socket = socket
    this.setupErrorHandlers()
  }

  setupErrorHandlers() {
    // Authentication errors
    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection failed:", error.message)
      if (error.message.includes("Authentication token is missing")) {
        redirectToLogin()
      } else if (error.message.includes("Caller ID is missing")) {
        showNotification("User ID missing. Please login again")
      }
    })

    // Call errors
    this.socket.on("call_error", (error) => {
      console.error("❌ Call error:", error)
      showNotification(error.message || "Call failed. Please try again.")
    })

    // Network errors
    this.socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        console.log("⚠️ Server disconnected")
        // Attempt to reconnect
        setTimeout(() => {
          this.socket.connect()
        }, 3000)
      }
    })
  }

  handleCallErrors(callback) {
    this.socket.on("call", async (data) => {
      try {
        await callback(data)
      } catch (error) {
        console.error("Call processing error:", error)
        this.socket.emit("handsup", {
          otherUserId: data.callerId,
          error: error.message,
        })
      }
    })
  }
}

export default CallHandler
```

---

## Code Examples

### React Hook for Call Management

```javascript
// useCall.js
import { useState, useCallback, useEffect } from "react"
import socket from "./socket"

export function useCall() {
  const [callState, setCallState] = useState({
    incomingCall: null,
    activeCall: null,
    callDuration: 0,
    isFreeCall: false,
    freeMinutesRemaining: 0,
  })

  const initiateCall = useCallback(async (officer) => {
    try {
      const rtcMessage = {
        tokenUrl: "/api/v1/agoraTokenGen",
        channelName: `consultation_${Date.now()}`,
      }

      socket.emit("call", {
        calleeId: officer.mobile,
        rtcMessage,
      })
    } catch (error) {
      console.error("Failed to initiate call:", error)
    }
  }, [])

  const answerCall = useCallback(() => {
    if (!callState.incomingCall) return

    socket.emit("answerCall", {
      callerId: callState.incomingCall.callerId,
      rtcMessage: callState.incomingCall.rtcMessage,
      customer: callState.incomingCall.customerId,
      officer: localStorage.getItem("userId"),
    })
  }, [callState.incomingCall])

  const rejectCall = useCallback(() => {
    if (!callState.incomingCall) return

    socket.emit("handsup", {
      otherUserId: callState.incomingCall.callerId,
      type: "call_reject",
    })

    setCallState((prev) => ({ ...prev, incomingCall: null }))
  }, [callState.incomingCall])

  const endCall = useCallback(() => {
    if (!callState.activeCall) return

    socket.emit("handsup", {
      otherUserId: callState.activeCall.otherUserMobile,
    })
  }, [callState.activeCall])

  useEffect(() => {
    // Listen for incoming calls
    socket.on("newCall", (data) => {
      setCallState((prev) => ({
        ...prev,
        incomingCall: {
          callerId: data.callerId,
          callerName: data.userInfo.name,
          callerAvatar: data.userInfo.avatar,
          rtcMessage: data.rtcMessage,
          chatId: data.chatId,
          customerId: data.callerId,
          isFreeCall: data.isFreeCall,
          freeMinutesRemaining: data.freeMinutesRemaining,
        },
      }))
    })

    // Listen for call answer
    socket.on("callAnswered", (data) => {
      setCallState((prev) => ({
        ...prev,
        activeCall: {
          consultationId: data.consultationData._id,
          chatId: data.chatId,
          isFreeCall: data.isFreeCall,
          freeMinutesRemaining: data.freeMinutesRemaining,
          otherUserMobile: data.callee || data.callerId,
        },
        callDuration: 0,
      }))
    })

    // Listen for call end
    socket.on("appyHandsup", (data) => {
      setCallState((prev) => ({
        ...prev,
        activeCall: null,
        callDuration: 0,
      }))
    })

    return () => {
      socket.off("newCall")
      socket.off("callAnswered")
      socket.off("appyHandsup")
    }
  }, [])

  return {
    callState,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
  }
}
```

### Usage in React Component

```javascript
// CallScreen.jsx
import React, { useEffect } from "react"
import { useCall } from "./useCall"

export default function CallScreen() {
  const { callState, answerCall, rejectCall, endCall, initiateCall } = useCall()

  return (
    <div className="call-screen">
      {/* Incoming Call UI */}
      {callState.incomingCall && (
        <div className="incoming-call">
          <img src={callState.incomingCall.callerAvatar} />
          <h2>{callState.incomingCall.callerName}</h2>
          {callState.incomingCall.isFreeCall && (
            <p className="free-call-badge">
              Free: {callState.incomingCall.freeMinutesRemaining} min remaining
            </p>
          )}
          <div className="call-actions">
            <button onClick={answerCall} className="accept-btn">
              Accept
            </button>
            <button onClick={rejectCall} className="reject-btn">
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {callState.activeCall && (
        <div className="active-call">
          <div className="video-container">
            {/* Agora video elements here */}
          </div>
          <div className="call-info">
            <span className="duration">
              {formatDuration(callState.callDuration)}
            </span>
            {callState.isFreeCall && (
              <span className="free-badge">
                Free minutes:{" "}
                {callState.freeMinutesRemaining -
                  Math.floor(callState.callDuration / 60)}
              </span>
            )}
          </div>
          <button onClick={endCall} className="end-call-btn">
            End Call
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Best Practices

### 1. **Token Management**

```javascript
// Refresh token before expiry
async function refreshToken() {
  try {
    const response = await axios.post("/api/v1/users/refresh-token")
    localStorage.setItem("accessToken", response.data.data.accessToken)
    return response.data.data.accessToken
  } catch (error) {
    redirectToLogin()
  }
}

// Add to axios interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken()
      return axios(error.config)
    }
    return Promise.reject(error)
  },
)
```

### 2. **Handle Network Disconnections**

```javascript
socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // Server initiated disconnect
    socket.connect()
  } else if (reason === "transport close") {
    // Network interrupted
    showNotification("Connection lost. Reconnecting...", "warning")
    setTimeout(() => socket.connect(), 3000)
  }
})
```

### 3. **Call History Management**

```javascript
async function getCallHistory() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/consultations/consultList?page=1&limit=20`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    )
    return response.data.data
  } catch (error) {
    console.error("Failed to fetch history:", error)
  }
}
```

### 4. **Memory Management**

```javascript
// Clean up listeners on unmount
useEffect(() => {
  const handlers = {
    newCall: () => {},
    callAnswered: () => {},
    appyHandsup: () => {},
  }

  Object.keys(handlers).forEach((event) => {
    socket.on(event, handlers[event])
  })

  return () => {
    Object.keys(handlers).forEach((event) => {
      socket.off(event)
    })
  }
}, [])
```

---

## API Base URLs Reference

| Environment | URL                                  |
| ----------- | ------------------------------------ |
| Development | `http://localhost:8001`              |
| Staging     | `https://x-kop-backend.onrender.com` |
| Production  | `https://xkop.in`                    |

---

## Key Points Summary

✅ **Mobile number** is used as the unique identifier for socket connections  
✅ **JWT token** required for socket authentication  
✅ **Free calls**: 15 minutes per customer (auto-hangup after)  
✅ **Agora**: Used for RTC/video calling  
✅ **Chat**: Auto-created between participants  
✅ **Pricing**: Per-minute based on consultation type  
✅ **Push notifications**: Sent when receiver is offline

---

## Support & Debugging

### Enable Debug Logging

```javascript
// In development
localStorage.debug = "socket.io-client:*"
```

### Common Issues

| Issue                             | Solution                                          |
| --------------------------------- | ------------------------------------------------- |
| "Caller ID is missing"            | Pass `callerId` in socket query during connection |
| "Authentication token is missing" | Ensure valid JWT in query or headers              |
| "User not found"                  | Check mobile number format matches backend        |
| Socket disconnects after call     | Normal behavior, re-connect for next call         |
| Free minutes not deducted         | Check if `isFreeCall` flag is set correctly       |

---

**Last Updated**: 2026-07-06  
**Version**: 1.0.0
