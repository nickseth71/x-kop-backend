# System Architecture & Flow Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Flutter)                        │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│   UI Layer   │ State Mgmt   │  API Client  │  Socket IO   │  Agora SDK  │
│              │  (Zustand)   │  (axios)     │ (Real-time)  │ (Video/RTC) │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴─────────────┘
       │ REST API     │ REST API     │ WebSocket    │ WebSocket
       │ (HTTPS)      │ (HTTPS)      │ (ws://)      │ (ws://)
       │              │              │              │
┌──────▼──────────────▼──────────────▼──────────────▼─────────────────────┐
│                        BACKEND (Node.js/Express)                        │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│  REST API    │  Socket.io   │  Auth Layer  │  Controllers │  Services   │
│  Endpoints   │  Handlers    │  (JWT)       │  (Business   │ (Calls,     │
│              │              │              │   Logic)     │  Payments)  │
└──────┬───────┴──────┬───────┴──────────────┴──────────────┴─────────────┘
       │              │
       │ Database     │ WebSocket
       │ Queries      │ Events
       │              │
┌──────▼──────────────▼─────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                                │
├────────────┬──────────┬──────────┬──────────┬────────────┬────────────┤
│  Users     │  Chats   │  Consult.│ Schedule │ Officer    │  Payments  │
│  Profiles  │  Messages│  History │  Records │  Details   │  Wallets   │
└────────────┴──────────┴──────────┴──────────┴────────────┴────────────┘

                              ┌─────────────────┐
                              │   Agora RTC     │
                              │   (Video/Audio) │
                              └─────────────────┘

                              ┌─────────────────┐
                              │   Firebase FCM  │
                              │   (Notifications│
                              └─────────────────┘
```

---

## Complete Call Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY & MATCHING                                          │
└─────────────────────────────────────────────────────────────────────────┘

    CUSTOMER                           BACKEND                    DATABASE
        │                                  │                           │
        │  POST /find-officer              │                           │
        ├─────────────────────────────────>│                           │
        │                                  │  Query officers by:       │
        │                                  ├──────────────────────────>│
        │                                  │  - Consultation type      │
        │                                  │  - Availability           │
        │                                  │  - Schedule conflicts     │
        │                                  │                           │
        │                                  │<──────────────────────────┤
        │  Return officer details          │  [Officer Object]         │
        │<─────────────────────────────────┤                           │
        │                                  │                           │

┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: INITIATING CALL                                               │
└─────────────────────────────────────────────────────────────────────────┘

    CUSTOMER              SOCKET.IO              BACKEND              OFFICER
        │                    │                      │                    │
        │ emit 'call'        │                      │                    │
        ├───────────────────>│                      │                    │
        │                    │ Process call event   │                    │
        │                    ├─────────────────────>│                    │
        │                    │                      │ Is officer online? │
        │                    │                      │                    │
        │                    │         YES ─────────────────────────────>│
        │                    │          │          emit 'newCall'       │
        │                    │          │                               │
        │                    │          │          NO                   │
        │                    │          └──────────────────────────────>│
        │                    │             Send FCM push notification   │
        │                    │                                          │
        │  Display dialing   │                                          │
        │  UI, start timer   │                      Show incoming call  │
        │  (30 sec timeout)  │                      UI, sound, vibrate  │
        │                    │                                          │

┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: ANSWERING CALL                                                │
└─────────────────────────────────────────────────────────────────────────┘

    OFFICER              SOCKET.IO              BACKEND            DATABASE
        │                    │                      │                  │
        │ emit 'answerCall'  │                      │                  │
        ├───────────────────>│                      │                  │
        │                    │ Process answer       │                  │
        │                    ├─────────────────────>│                  │
        │                    │                      │ Create consultation
        │                    │                      ├────────────────>│
        │                    │                      │<────────────────┤
        │                    │                      │ consultation_id  │
        │                    │                      │                  │
        │                    │                      │ Check free call  │
        │                    │                      │ Set auto-hangup? │
        │                    │                      │                  │
        │                    │ emit 'callAnswered' │                  │
        │<───────────────────┤                      │                  │
        │                    │                      │                  │
    CUSTOMER            SOCKET.IO                 │                  │
        │<────────────────────────────────────────┤                  │
        │ Receive 'callAnswered'                  │                  │
        │ with consultation & chat data           │                  │
        │                                         │                  │

┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: ACTIVE CALL (Video/Audio via Agora)                          │
└─────────────────────────────────────────────────────────────────────────┘

    CUSTOMER         AGORA SDK         BACKEND        OFFICER          DATABASE
        │               │                 │              │               │
        │ Join channel  │                 │              │               │
        ├──────────────>│                 │              │               │
        │               │<────────────────┤              │               │
        │               │ RTC credentials │              │               │
        │               │                 │              │               │
        │ Audio/Video stream ────────────────────────> RTC Stream      │
        │               │                 │              │               │
        │               │<────────────────────────────────┤               │
        │               │              RTC Stream         │               │
        │               │                                 │               │
        │ (Every 10 sec)                 │                               │
        │ emit 'syncCallDuration'        │                               │
        ├────────────────────────────────────────────────────────────────>│
        │  (Track call progress)         │                               │
        │                                │ Check free minutes            │
        │                                ├──────────────────────────────>│
        │                                │ Auto-hangup if expired        │

┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: ENDING CALL                                                   │
└─────────────────────────────────────────────────────────────────────────┘

    USER              SOCKET.IO              BACKEND            DATABASE
     │                    │                      │                 │
     │ emit 'handsup'     │                      │                 │
     ├───────────────────>│                      │                 │
     │                    │ Process hangup       │                 │
     │                    ├─────────────────────>│                 │
     │                    │                      │ Update consultation
     │                    │                      ├────────────────>│
     │                    │                      │ Mark as completed
     │                    │                      │ Calculate duration│
     │                    │                      │                 │
     │                    │                      │ Calculate charges
     │                    │                      │ - Duration      │
     │                    │                      │ - Fee per minute│
     │                    │                      │ - Free minutes  │
     │                    │                      │ - Commission    │
     │                    │                      │                 │
     │                    │                      │ Update wallets
     │                    │                      ├────────────────>│
     │                    │                      │ Customer: -debit
     │                    │                      │ Officer: +credit
     │                    │ emit 'appyHandsup'  │
     │<───────────────────┤                      │
     │ Other user too     │                      │
     │<───────────────────────────────────────>│

┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 6: POST CALL CLEANUP                                             │
└─────────────────────────────────────────────────────────────────────────┘

    CLIENT                                        BACKEND
        │                                            │
        │ Stop Agora stream                         │
        │ Close video connection                     │
        │                                            │
        │ Show call summary                         │
        │ - Duration                                │
        │ - Amount deducted/credited                │
        │ - Conversation saved in chat              │
        │                                            │
        │ Return to home/history                    │
        │                                            │
```

---

## Socket Event Flow Diagram

```
                    INCOMING CALL SCENARIO
                    ═════════════════════

                    ┌─────────────┐
                    │   CALLER    │
                    │  (Customer) │
                    └──────┬──────┘
                           │
                           │ emit 'call'
                           │ { calleeId, rtcMessage }
                           ▼
                    ┌─────────────────────┐
                    │ Socket Server       │
                    │ - Authenticate      │
                    │ - Find receiver     │
                    │ - Check online      │
                    └──────┬──────────────┘
                           │
                ┌──────────┴───────────┐
                │                      │
           IS ONLINE              OFFLINE
                │                      │
                ▼                      ▼
            emit 'newCall'      Send FCM push
            to receiver         notification
                │                      │
                ▼                      ▼
        ┌────────────────┐     ┌───────────────┐
        │  RECEIVER      │     │  RECEIVER     │
        │ (Officer)      │     │ (Offline)     │
        │ Hears ring,    │     │ Gets notif,   │
        │ sees dialing   │     │ taps to answer│
        └────────┬───────┘     └────────┬──────┘
                 │                      │
                 └──────────┬───────────┘
                            │
                            │ emit 'answerCall'
                            │ { callerId, customer, officer }
                            ▼
                     ┌──────────────────┐
                     │ Socket Server    │
                     │ - Create consult │
                     │ - Start chat     │
                     │ - Check free call
                     │ - Set auto-hangup
                     └────────┬─────────┘
                              │
                    emit 'callAnswered'
                    to BOTH USERS
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
            ┌───────────────┐         ┌───────────────┐
            │  CALLER       │         │  RECEIVER     │
            │ - Init Agora  │         │ - Init Agora  │
            │ - Join channel│◄───────►│ - Join channel│
            │ - Start timer │         │ - Start timer │
            └───────┬───────┘         └───────┬───────┘
                    │                         │
                    └───────────┬─────────────┘
                                │
                        Video/Audio Streaming
                        (via Agora RTC)
                                │
                    ┌───────────┴───────────┐
                    │ (Every 10 seconds)    │
                    │ emit 'syncCallDuration
                    └───────────┬───────────┘
                                │
                                ▼
                        Both see updated timer
                                │
                                │ When free time expires
                                │ OR user hangs up
                                ▼
                        emit 'handsup'
                        { otherUserId }
                                │
                                ▼
                    ┌─────────────────────┐
                    │ Socket Server       │
                    │ - Update wallet     │
                    │ - Calculate charges │
                    │ - End consultation  │
                    └────────┬────────────┘
                             │
                emit 'appyHandsup'
                to BOTH USERS
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
                ┌──────────┐      ┌──────────┐
                │ CALLER   │      │ RECEIVER │
                │ - Cleanup│      │ - Cleanup│
                │ - Show   │      │ - Show   │
                │  summary │      │  summary │
                └──────────┘      └──────────┘
```

---

## Free Call Timer Logic

```
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER INITIATES CALL                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                ┌────▼─────────────────┐
                │ Check user profile:  │
                │ - hasFreeMinutes?    │
                │ - freeMinutesUsed?   │
                │ - freeMinutesLimit?  │
                └────┬──────────────────┘
                     │
        ┌────────────┴───────────────┐
        │                            │
    YES │                            │ NO
        ▼                            ▼
  ┌──────────────────┐        ┌─────────────────┐
  │ isFreeCall=true  │        │ isFreeCall=false│
  │ freeMinutes=15   │        │ Cost per minute │
  └────┬─────────────┘        └────────┬────────┘
       │                               │
       ├───────────────────────────────┘
       │
       ▼
 ┌──────────────────────────────────────┐
 │ emit 'answerCall'                    │
 │ { isFreeCall, freeMinutesRemaining } │
 └────┬─────────────────────────────────┘
      │
      ▼
 ┌──────────────────────────────────────┐
 │ Backend: Create Consultation         │
 │ if (isFreeCall) {                    │
 │   setTimeout(() => {                 │
 │     triggerAutoHangup(...)           │
 │   }, freeMinutes * 60 * 1000)        │
 │ }                                    │
 └────┬─────────────────────────────────┘
      │
      ▼
 ┌────────────────────────────────────────────────┐
 │ Call Active                                    │
 │ Timer running: 15:00 → ... → 00:01 → 00:00   │
 └────┬───────────────────────────────────────────┘
      │
      ▼
 ┌─────────────────────────────────────┐
 │ Free minutes EXPIRED                │
 │ emit 'freeMinutesExpired'           │
 │ emit 'appyHandsup'                  │
 │ { autoHangup: true }                │
 └────┬────────────────────────────────┘
      │
      ▼
 ┌────────────────────────────────────────┐
 │ Both users receive hangup signal      │
 │ Call ends automatically                │
 │ Consultation marked as completed      │
 │ Wallet NOT deducted (was free)         │
 └────────────────────────────────────────┘
```

---

## Payment Calculation Flow

```
                    CALL ENDS
                        │
                        ▼
        ┌────────────────────────────────────┐
        │ Calculate Call Duration            │
        │ startTime → endTime                │
        │ Result: 5 min 45 sec               │
        └────┬───────────────────────────────┘
             │
             ▼
        ┌────────────────────────────────┐
        │ Was this a FREE call?          │
        └────┬───────────────┬───────────┘
             │               │
          YES│               │NO
             ▼               ▼
        ┌──────────┐    ┌──────────────────┐
        │ FREE     │    │ PAID             │
        │ Duration │    │ Charge per min:  │
        │ not paid │    │ ₹5/min           │
        └────┬─────┘    └─────┬────────────┘
             │                │
      ┌──────▼────────┐    ┌──▼──────────────┐
      │ Check if used │    │ Calculate cost  │
      │ free minutes  │    │ 5.75 × ₹5       │
      │ in this call  │    │ = ₹28.75        │
      └──────┬────────┘    └─────┬───────────┘
             │                   │
      ┌──────▼──────────────────┐│
      │ Applied Free: 5 min     ││
      │ Remaining: 10 min       ││
      │ Cost: ₹0                ││
      └──────┬──────────────────┘│
             │                   │
             └───────┬───────────┘
                     ▼
        ┌────────────────────────────────────┐
        │ GET COMMISSION RATE from Settings  │
        │ Commission: 10%                    │
        └────┬───────────────────────────────┘
             │
             ▼
        ┌────────────────────────────────────┐
        │ OFFICER EARNINGS                   │
        │ Total: ₹28.75                      │
        │ Commission: ₹2.875 (10%)           │
        │ Officer Gets: ₹25.875              │
        └────┬───────────────────────────────┘
             │
             ├──────────────────┐
             ▼                  ▼
        ┌────────────┐    ┌──────────┐
        │ CUSTOMER   │    │ OFFICER  │
        │ Wallet:    │    │ Wallet:  │
        │ -₹28.75    │    │ +₹25.875 │
        └────────────┘    └──────────┘
             │                  │
             └──────┬───────────┘
                    ▼
        ┌────────────────────────────────────┐
        │ Save to Database:                  │
        │ - Consultation record              │
        │ - Duration, cost, free mins used   │
        │ - Both wallet updates              │
        │ - Chat messages preserved          │
        └────────────────────────────────────┘
```

---

## Free Minutes Management

```
USER PROFILE:
├─ hasFreeMinutes: true/false
├─ freeMinutesUsed: 0-15
├─ freeMinutesLimit: 15 (default)

WHEN CALL STARTS:
├─ Check: freeMinutesUsed < freeMinutesLimit
└─ If true: isFreeCall = true

DURING CALL:
├─ Agora streaming
├─ Backend timeout: freeMinutesLimit * 60 * 1000 ms
└─ If expires: emit 'freeMinutesExpired' + auto-hangup

WHEN CALL ENDS:
├─ Calculate actual duration
├─ If isFreeCall:
│  ├─ Applied: min(actualDuration, remainingFreeMinutes)
│  ├─ Paid: max(0, actualDuration - remainingFreeMinutes)
│  └─ Update: freeMinutesUsed += applied
│
└─ If freeMinutesUsed >= freeMinutesLimit:
   └─ Set: hasFreeMinutes = false

NEXT CALL:
├─ If hasFreeMinutes = false: All charges apply
└─ If hasFreeMinutes = true: Free minutes available again
```

---

## Error Handling Flow

```
┌─────────────────┐
│  SOCKET ERROR   │
└────┬────────────┘
     │
     ├──────────────────────────────┐
     │                              │
Authentication Error          Connection Error
     │                              │
     ├─────────────┬────────────────┤
     │             │                │
Token Missing  Caller ID Missing   Network Down
     │             │                │
     ├──────────────┴────────────────┤
     │                               │
     ▼                               ▼
Redirect to Login        Retry (exponential backoff)
                         After 3 retries: Notify User


┌──────────────────┐
│  CALL ERROR      │
└────┬─────────────┘
     │
     ├────────────────────────────────┐
     │                                │
User Not Found              Officer Offline
     │                                │
  Alert User                Send Push Notification
                            Store for later


┌──────────────────┐
│  API ERROR       │
└────┬─────────────┘
     │
     ├─────────────────────────────┐
     │                             │
401 Unauthorized           500 Server Error
     │                             │
Refresh Token              Retry with Backoff
Re-authenticate            Log Error
                          Notify Support


GENERAL ERROR STRATEGY:
├─ Log to console/monitoring
├─ Show user-friendly message
├─ Suggest retry action
├─ Fallback to offline mode if possible
└─ Report to backend for debugging
```

---

## State Management Flow (Zustand/Redux)

```
┌──────────────────────────────────────────────────────┐
│ GLOBAL STATE STRUCTURE                               │
└──────────────────────────────────────────────────────┘

Store:
├─ auth
│  ├─ token: string
│  ├─ user: UserObject
│  └─ isAuthenticated: boolean
│
├─ call
│  ├─ incomingCall: CallObject | null
│  ├─ activeCall: CallObject | null
│  ├─ callDuration: number
│  ├─ isFreeCall: boolean
│  └─ freeMinutesRemaining: number
│
├─ chat
│  ├─ selectedChat: ChatObject | null
│  ├─ messages: Message[]
│  └─ unreadCount: number
│
├─ ui
│  ├─ isCallScreenOpen: boolean
│  ├─ isLoadingOfficers: boolean
│  ├─ error: string | null
│  └─ notification: NotificationObject | null
│
└─ wallet
   ├─ balance: number
   ├─ transactions: Transaction[]
   └─ hasFreeMinutes: boolean

ACTIONS:
├─ setAuth(user, token)
├─ startCall(officer, consultationType)
├─ endCall()
├─ receiveCall(incomingCallData)
├─ answerCall()
├─ rejectCall()
├─ updateCallDuration(seconds)
├─ addMessage(chatId, message)
├─ setNotification(notification)
└─ updateWallet(newBalance)
```

---

**Version**: 1.0.0 | Architecture Diagrams Last Updated: 2026-07-06
