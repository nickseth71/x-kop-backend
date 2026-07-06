# Frontend Implementation Checklist

## Phase 1: Project Setup & Dependencies

### 1.1 Initialize Project

- [ ] Create React/Flutter project
- [ ] Install npm dependencies
  ```bash
  npm install socket.io-client axios zustand
  npm install agora-rtc-sdk-ng  # For Agora video
  npm install --save-dev tailwindcss  # Or your CSS framework
  ```
- [ ] Set up environment variables (.env file)
  ```
  REACT_APP_API_BASE_URL=http://localhost:8001
  REACT_APP_SOCKET_URL=http://localhost:8001
  REACT_APP_AGORA_APP_ID=your_agora_app_id
  ```

### 1.2 Project Structure

- [ ] Create folder structure:
  ```
  src/
  ├─ components/
  │  ├─ Auth/
  │  │  ├─ LoginForm.jsx
  │  │  └─ RegisterForm.jsx
  │  ├─ Call/
  │  │  ├─ IncomingCallScreen.jsx
  │  │  ├─ VideoCallScreen.jsx
  │  │  ├─ CallSummary.jsx
  │  │  └─ OfficerSearchForm.jsx
  │  └─ Chat/
  │     ├─ ChatWindow.jsx
  │     └─ MessageList.jsx
  ├─ hooks/
  │  ├─ useCall.js
  │  ├─ useAuth.js
  │  └─ useSocket.js
  ├─ services/
  │  ├─ api.js        # Axios instance + REST calls
  │  ├─ socket.js     # Socket.io setup
  │  └─ agora.js      # Agora initialization
  ├─ store/
  │  ├─ authStore.js
  │  ├─ callStore.js
  │  └─ chatStore.js
  ├─ utils/
  │  ├─ constants.js
  │  ├─ helpers.js
  │  └─ logger.js
  └─ pages/
     ├─ LoginPage.jsx
     ├─ HomePage.jsx
     ├─ SearchOfficerPage.jsx
     ├─ CallPage.jsx
     └─ HistoryPage.jsx
  ```

---

## Phase 2: Authentication

### 2.1 Login Implementation

- [ ] Create login form component
  - [ ] Mobile number input field
  - [ ] Password input field
  - [ ] Submit button
  - [ ] Error message display
- [ ] Implement login API call

  ```javascript
  // services/api.js
  export const loginUser = async (mobile, password) => {
    const response = await axios.post("/api/v1/users/login", {
      mobile,
      password,
    })
    return response.data.data
  }
  ```

- [ ] Store JWT token & user info

  ```javascript
  // Save after successful login
  localStorage.setItem("accessToken", response.accessToken)
  localStorage.setItem("userInfo", JSON.stringify(response.user))
  ```

- [ ] Add axios interceptor for auth header
  ```javascript
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  ```

### 2.2 Token Refresh

- [ ] Implement token refresh endpoint call
- [ ] Add response interceptor to handle 401 errors
- [ ] Redirect to login if refresh fails
- [ ] Implement auto-logout on token expiry

### 2.3 Protected Routes

- [ ] Create PrivateRoute component
- [ ] Check authentication on route guard
- [ ] Redirect unauthenticated users to login

---

## Phase 3: Socket Connection

### 3.1 Socket Setup

- [ ] Create socket.js service file

  ```javascript
  import io from "socket.io-client"

  const socket = io(process.env.REACT_APP_SOCKET_URL, {
    path: "/websocket",
    query: {
      token: localStorage.getItem("accessToken"),
      callerId: JSON.parse(localStorage.getItem("userInfo")).mobile,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  export default socket
  ```

- [ ] Test socket connection
  - [ ] Verify "Connected" message in console
  - [ ] Check socket ID is generated
  - [ ] Test reconnection on network loss

### 3.2 Connection Status Management

- [ ] Create connection status store
  - [ ] Track connected state
  - [ ] Track last connection time
  - [ ] Track connection error messages

- [ ] Add connection event handlers

  ```javascript
  socket.on("connect", () => {
    console.log("✅ Connected")
    updateConnectionStatus("connected")
  })

  socket.on("disconnect", () => {
    updateConnectionStatus("disconnected")
  })

  socket.on("connect_error", (error) => {
    handleConnectionError(error)
  })
  ```

### 3.3 User Online Status

- [ ] Emit onLive event on mount
  ```javascript
  useEffect(() => {
    socket.emit("onLive", { status: "online" })
    return () => {
      socket.emit("onLive", { status: "offline" })
    }
  }, [])
  ```

---

## Phase 4: Officer Discovery

### 4.1 Search Form

- [ ] Create SearchOfficerForm component
  - [ ] Consultation type dropdown
  - [ ] Date/time picker
  - [ ] Search button

### 4.2 Find Officer API

- [ ] Implement findOfficer service

  ```javascript
  export const findOfficer = async (consultationType, startTime, endTime) => {
    const response = await axios.post("/api/v1/scheduling/find-officer", {
      consultationTypeName: consultationType,
      startTime,
      endTime,
    })
    return response.data.data
  }
  ```

- [ ] Display officer details
  - [ ] Officer name
  - [ ] Avatar/profile picture
  - [ ] Consultation type
  - [ ] Rating/reviews (if available)
  - [ ] Call button

### 4.3 Officer List Management

- [ ] Store officer list in state
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Display "No officers found" message

---

## Phase 5: Call Initiation

### 5.1 Call Initiator (Customer)

- [ ] Create call initiation logic

  ```javascript
  const initiateCall = (officer) => {
    socket.emit("call", {
      calleeId: officer.mobile,
      rtcMessage: {
        tokenUrl: "/api/v1/agoraTokenGen",
        channelName: `consultation_${Date.now()}`,
      },
    })
  }
  ```

- [ ] Show "Calling..." UI
  - [ ] Display officer info
  - [ ] Show ringing animation
  - [ ] Display cancel button
  - [ ] 30-second timeout

- [ ] Handle call errors
  ```javascript
  socket.on("call_error", (error) => {
    showNotification(error.message, "error")
  })
  ```

### 5.2 Call Receiver (Officer)

- [ ] Listen for incoming calls

  ```javascript
  socket.on("newCall", (data) => {
    showIncomingCallScreen(data)
  })
  ```

- [ ] Create IncomingCallScreen component
  - [ ] Caller info (name, avatar)
  - [ ] Ringing sound
  - [ ] Vibration
  - [ ] Accept/Reject buttons

- [ ] Handle offline incoming calls (push notifications)

---

## Phase 6: Call Answering

### 6.1 Call Answer Logic

- [ ] Implement answerCall function

  ```javascript
  const answerCall = (incomingData) => {
    socket.emit("answerCall", {
      callerId: incomingData.callerId,
      rtcMessage: incomingData.rtcMessage,
      customer: incomingData.customerId,
      officer: currentUserId,
    })
  }
  ```

- [ ] Listen for callAnswered event
  ```javascript
  socket.on("callAnswered", (data) => {
    // Initialize video call
    initializeAgoraCall(data)
    // Show video call UI
    showVideoCallScreen(data)
  })
  ```

### 6.2 Call Rejection

- [ ] Implement rejectCall function

  ```javascript
  const rejectCall = (incomingData) => {
    socket.emit("handsup", {
      otherUserId: incomingData.callerId,
      type: "call_reject",
    })
  }
  ```

- [ ] Clear incoming call UI after rejection

---

## Phase 7: Agora Video Integration

### 7.1 Agora Setup

- [ ] Initialize Agora client

  ```javascript
  import AgoraRTC from "agora-rtc-sdk-ng"

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  ```

- [ ] Get Agora token from backend
  ```javascript
  const getAgoraToken = async (channelName) => {
    const response = await axios.post("/api/v1/agoraTokenGen", {
      channelName,
    })
    return response.data.token
  }
  ```

### 7.2 Join Channel

- [ ] Join Agora channel after call answer

  ```javascript
  const token = await getAgoraToken(channelName)
  await client.join(
    process.env.REACT_APP_AGORA_APP_ID,
    channelName,
    token,
    userId,
  )
  ```

- [ ] Create local tracks (audio/video)

  ```javascript
  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
  const videoTrack = await AgoraRTC.createCameraVideoTrack()

  await client.publish([audioTrack, videoTrack])
  ```

### 7.3 Subscribe to Remote Stream

- [ ] Listen for remote user published event
  ```javascript
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType)

    if (mediaType === "video") {
      user.videoTrack.play("remote-video-div")
    }
    if (mediaType === "audio") {
      user.audioTrack.play()
    }
  })
  ```

### 7.4 Video UI

- [ ] Create VideoCallScreen component
  - [ ] Remote video container
  - [ ] Local video container (small preview)
  - [ ] Mute/unmute buttons
  - [ ] Camera on/off button
  - [ ] Call duration timer
  - [ ] End call button

---

## Phase 8: Call Duration & Timer

### 8.1 Call Timer Implementation

- [ ] Start timer when call is answered
  ```javascript
  const startCallTimer = (consultationData) => {
    let duration = 0
    callTimerInterval = setInterval(() => {
      duration++

      // Sync every 10 seconds
      if (duration % 10 === 0) {
        socket.emit("syncCallDuration", {
          receiverUser: otherUserMobile,
          duration,
        })
      }

      // Update UI
      updateCallDurationUI(formatDuration(duration))
    }, 1000)
  }
  ```

### 8.2 Free Minutes Logic

- [ ] Display free minutes remaining
- [ ] Check if call is free

  ```javascript
  if (consultationData.isFreeCall) {
    console.log(
      "Free minutes remaining:",
      consultationData.freeMinutesRemaining,
    )
  }
  ```

- [ ] Listen for free minutes expired
  ```javascript
  socket.on("freeMinutesExpired", (data) => {
    console.log("Free minutes expired")
    endCall()
    showNotification("Your free minutes have expired", "info")
  })
  ```

### 8.3 Duration Format Helper

- [ ] Implement duration formatter
  ```javascript
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }
  ```

---

## Phase 9: Call Ending

### 9.1 End Call Function

- [ ] Implement endCall function

  ```javascript
  const endCall = () => {
    if (callTimerInterval) clearInterval(callTimerInterval)

    socket.emit("handsup", {
      otherUserId: otherUserMobile,
      type: "normal",
    })
  }
  ```

- [ ] Stop Agora stream
  ```javascript
  const stopCall = async () => {
    // Unpublish tracks
    await client.unpublish()

    // Close tracks
    localAudioTrack.close()
    localVideoTrack.close()

    // Leave channel
    await client.leave()
  }
  ```

### 9.2 Call Summary

- [ ] Listen for hangup confirmation

  ```javascript
  socket.on("appyHandsup", (data) => {
    stopCall()
    showCallSummary({
      duration: callDurationSeconds,
      consultationId: consultationData._id,
      type: data.type,
    })
  })
  ```

- [ ] Create CallSummary component
  - [ ] Duration display
  - [ ] Cost/amount deducted
  - [ ] Conversation summary
  - [ ] Rate officer button
  - [ ] Done/Back button

### 9.3 Post-Call Cleanup

- [ ] Clear call state
- [ ] Unsubscribe from socket events
- [ ] Clear timers
- [ ] Close video elements

---

## Phase 10: Chat Integration

### 10.1 Chat Setup

- [ ] Display chat window with officer
- [ ] Send/receive messages via socket
- [ ] Store message history
- [ ] Show unread message count

### 10.2 During Call Chat

- [ ] Enable chat messaging during call
- [ ] Display messages alongside video
- [ ] Mark messages as sent/delivered/read

---

## Phase 11: Error Handling

### 11.1 Connection Errors

- [ ] Handle token missing error
- [ ] Handle caller ID missing error
- [ ] Handle network disconnection
  ```javascript
  socket.on("connect_error", (error) => {
    if (error.message.includes("Authentication")) {
      redirectToLogin()
    }
  })
  ```

### 11.2 Call Errors

- [ ] Handle "User not found" error
- [ ] Handle "Officer offline" error
- [ ] Handle Agora connection errors

### 11.3 API Errors

- [ ] Handle 401 Unauthorized
- [ ] Handle 404 Not Found
- [ ] Handle 500 Server errors
- [ ] Implement retry logic with exponential backoff

### 11.4 User Notifications

- [ ] Show error messages
- [ ] Show success messages
- [ ] Show warning messages
- [ ] Auto-dismiss notifications after 5 seconds

---

## Phase 12: State Management

### 12.1 Zustand Store Setup

- [ ] Create auth store

  ```javascript
  // store/authStore.js
  import create from "zustand"

  export const useAuthStore = create((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
    logout: () => set({ token: null, user: null, isAuthenticated: false }),
  }))
  ```

- [ ] Create call store
- [ ] Create chat store
- [ ] Create UI store (notifications, loading states)

### 12.2 Persist State

- [ ] Persist auth token to localStorage
- [ ] Restore from localStorage on app start

---

## Phase 13: UI Components

### 13.1 Create Components

- [ ] LoginForm
- [ ] RegisterForm
- [ ] HomePage
- [ ] SearchOfficerForm
- [ ] OfficerCard
- [ ] OfficerList
- [ ] CallStatusButton
- [ ] IncomingCallScreen
- [ ] VideoCallScreen
- [ ] CallSummary
- [ ] ChatWindow
- [ ] NotificationToast
- [ ] LoadingSpinner
- [ ] ErrorBoundary

### 13.2 Responsive Design

- [ ] Mobile-first design
- [ ] Tablet responsive layout
- [ ] Desktop layout
- [ ] Dark mode support (optional)

---

## Phase 14: Testing

### 14.1 Unit Tests

- [ ] Test login functionality
- [ ] Test socket connection
- [ ] Test call initiation
- [ ] Test API calls

### 14.2 Integration Tests

- [ ] Test complete call flow
- [ ] Test payment calculation
- [ ] Test free minutes logic

### 14.3 E2E Tests

- [ ] Test user login to call completion
- [ ] Test incoming call to acceptance
- [ ] Test call rejection

---

## Phase 15: Performance & Optimization

### 15.1 Performance

- [ ] Implement code splitting
- [ ] Lazy load components
- [ ] Optimize re-renders (React.memo, useMemo)
- [ ] Monitor bundle size

### 15.2 Caching

- [ ] Cache officer list
- [ ] Cache consultation history
- [ ] Implement service worker for offline support

---

## Phase 16: Deployment Preparation

### 16.1 Build & Config

- [ ] Build for production
  ```bash
  npm run build
  ```
- [ ] Test production build locally
- [ ] Update environment variables for production

### 16.2 Environment Setup

- [ ] Production API URL
- [ ] Production Socket URL
- [ ] Production Agora App ID

### 16.3 Deploy

- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Test all features on production
- [ ] Monitor for errors

---

## Phase 17: Post-Launch

### 17.1 Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics
- [ ] Monitor socket connection health
- [ ] Monitor API response times

### 17.2 User Feedback

- [ ] Collect user feedback
- [ ] Fix reported issues
- [ ] Implement feature requests

### 17.3 Performance Monitoring

- [ ] Monitor call quality metrics
- [ ] Monitor video/audio latency
- [ ] Monitor crash rates

---

## Testing Checklist

### Manual Testing

- [ ] Test on real device (iOS/Android)
- [ ] Test incoming call while in background
- [ ] Test call while network is slow
- [ ] Test call disconnection and reconnection
- [ ] Test free minutes expiry
- [ ] Test payment deduction
- [ ] Test chat during call
- [ ] Test with multiple concurrent users
- [ ] Test on both WiFi and mobile data
- [ ] Test speaker phone toggle
- [ ] Test mute/unmute
- [ ] Test camera on/off

### Browser Testing (Web)

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Common Issues & Solutions

| Issue                      | Solution                                     |
| -------------------------- | -------------------------------------------- |
| Socket connection fails    | Check token validity, verify callerId format |
| "User not found" error     | Verify mobile number format with backend     |
| Agora video black screen   | Check permissions, verify camera access      |
| No audio                   | Check microphone permissions                 |
| Free minutes not syncing   | Clear localStorage, re-login                 |
| Call not ending properly   | Check socket event listener cleanup          |
| Notification not appearing | Verify FCM token setup                       |

---

## Key Reminders

✅ Always use mobile number as `callerId` (not user ID)  
✅ Clean up socket event listeners on component unmount  
✅ Store JWT token securely (not in state alone)  
✅ Handle network disconnection gracefully  
✅ Test free call auto-hangup after 15 minutes  
✅ Verify payment calculations  
✅ Test both incoming and outgoing calls  
✅ Test on slow networks  
✅ Implement proper error boundaries  
✅ Add comprehensive logging for debugging

---

**Version**: 1.0.0 | Last Updated: 2026-07-06
**Estimated Time to Complete**: 4-6 weeks
