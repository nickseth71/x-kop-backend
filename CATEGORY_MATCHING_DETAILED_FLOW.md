# Category-Based Officer Matching & Call Flow

Complete data flow from category selection to call connection

---

## Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  USER SELECTS CATEGORY → SYSTEM FINDS MATCHING OFFICER → CALL   │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│ Step 1: Choose Category     │  User picks "Legal Consultation"
│ (Frontend)                  │  from consultation type dropdown
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Step 2: Find Available      │  POST /api/v1/scheduling/find-officer
│ Officer (REST API)          │  Sends category name → Backend finds match
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Step 3: Get Officer ID      │  Returns officer details with mobile
│ & Details (Response)        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Step 4: Initiate Call       │  WebSocket 'call' event with officer's
│ (WebSocket)                 │  mobile number
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Step 5: Create Consultation │  Backend creates consultation record
│ Record & Connect            │  linking customer ↔ officer
└─────────────────────────────┘
```

---

## Step 1: Frontend - User Selects Category

### What User Sees

```
┌─────────────────────────────────┐
│   Choose Consultation Type      │
├─────────────────────────────────┤
│  ☐ Legal Consultation          │
│  ☐ Medical Consultation         │
│  ☐ Tax Consultation             │
│  ☐ HR Consultation              │
└─────────────────────────────────┘
```

### Frontend Code

```javascript
// User selects "Legal Consultation"
const selectedCategory = "Legal Consultation"
const startTime = new Date()
const endTime = new Date(Date.now() + 3600000) // 1 hour from now

// Frontend calls REST API to find officer
const findOfficer = async () => {
  const response = await axios.post(
    "http://localhost:8001/api/v1/scheduling/find-officer",
    {
      consultationTypeName: selectedCategory, // ← IMPORTANT: Category name
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data.data
}
```

### Data Sent to Backend

```json
{
  "consultationTypeName": "Legal Consultation",
  "startTime": "2026-07-06T10:00:00.000Z",
  "endTime": "2026-07-06T11:00:00.000Z"
}
```

---

## Step 2: Backend - Find Officer with Matching Category

### Database Structure

#### ConsultationType Collection

```javascript
// consultationType.model.js
{
  _id: ObjectId("66c123abc..."),
  ConsultationTypeName: "Legal Consultation",
  FeePerMinute: 5,
  IsActive: true,
  createdAt: ISODate("2026-01-01T00:00:00.000Z")
}

// Another example
{
  _id: ObjectId("66c123def..."),
  ConsultationTypeName: "Medical Consultation",
  FeePerMinute: 10,
  IsActive: true
}
```

#### Officer (User Collection)

```javascript
{
  _id: ObjectId("66b456xyz..."),
  name: "John Lawyer",
  mobile: "+919876543210",
  avatar: "image_url",
  isActive: true,
  isCalling: false,
  officerDetails: ObjectId("66d789abc..."),  // Reference to OfficerDetails
  wallet: 1500
}
```

#### OfficerDetails Collection

```javascript
{
  _id: ObjectId("66d789abc..."),
  Officer: ObjectId("66b456xyz..."),
  ConsultationTypeID: ObjectId("66c123abc..."),  // ← Points to "Legal Consultation"
  JobTitle: "Senior Lawyer",
  OfficerCode: "LAW001",
  IsActive: true,
  Absences: [ObjectId("66e111...")]  // Absence records
}
```

#### Absence Collection

```javascript
{
  _id: ObjectId("66e111..."),
  fromDate: ISODate("2026-07-06T00:00:00.000Z"),
  untilDate: ISODate("2026-07-07T00:00:00.000Z"),
  status: "Approved"
}
```

#### Scheduling Collection (for conflicts)

```javascript
{
  _id: ObjectId("66f222..."),
  officer: ObjectId("66b456xyz..."),
  startTime: ISODate("2026-07-06T10:30:00.000Z"),
  endTime: ISODate("2026-07-06T11:30:00.000Z"),
  status: "scheduled"
}
```

### Backend Processing - Step by Step

#### Step 2.1: Find Consultation Type

```javascript
// From scheduling.controller.js - findRandomOfficer function

// Step 1: Get consultation type
const consultation_Type = await ConsultaionType.findOne({
  ConsultationTypeName: "Legal Consultation",
})

// Result:
// {
//   _id: ObjectId("66c123abc..."),
//   ConsultationTypeName: "Legal Consultation",
//   FeePerMinute: 5,
//   IsActive: true
// }

if (!consultation_Type) {
  return res.status(404).json(new ApiError(404, "Consultation type not found"))
}
```

#### Step 2.2: Convert Date to Start of Day (for absence checking)

```javascript
const convertToStartOfDay = (dateTimeString) => {
  const date = new Date(dateTimeString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const startOfDay = new Date(Date.UTC(year, month, day))
  return startOfDay.toISOString()
}

const absence_start = convertToStartOfDay(new Date("2026-07-06T10:00:00.000Z"))
// Result: "2026-07-06T00:00:00.000Z"
```

#### Step 2.3: MongoDB Aggregation Pipeline

```javascript
const officers = await User.aggregate([
  // FILTER 1: Get only users who are officers
  {
    $match: {
      officerDetails: { $exists: true }, // Has officer details
      isActive: true, // Account is active
      isCalling: false, // Not currently on a call
    },
  },

  // LOOKUP 1: Get officer details
  {
    $lookup: {
      from: "officerdetails",
      localField: "officerDetails",
      foreignField: "_id",
      as: "officerDetails",
    },
  },

  // UNWIND: Convert array to object
  {
    $unwind: "$officerDetails",
  },

  // LOOKUP 2: Get consultation type details
  {
    $lookup: {
      from: "consultaiontypes",
      localField: "officerDetails.ConsultationTypeID",
      foreignField: "_id",
      as: "officerDetails.consultationTypeDetails",
    },
  },

  // UNWIND: Convert array to object
  {
    $unwind: {
      path: "$officerDetails.consultationTypeDetails",
      preserveNullAndEmptyArrays: true,
    },
  },

  // FILTER 2: Match only officers with same consultation type
  {
    $match: {
      "officerDetails.consultationTypeDetails.ConsultationTypeName":
        "Legal Consultation", // ← THE KEY FILTER!
    },
  },

  // LOOKUP 3: Get absence records
  {
    $lookup: {
      from: "absences",
      localField: "officerDetails.Absences",
      foreignField: "_id",
      as: "absenceDetails",
    },
  },
])
```

### What the Aggregation Returns

```javascript
;[
  {
    _id: ObjectId("66b456xyz..."),
    name: "John Lawyer",
    mobile: "+919876543210",
    avatar: "image_url",
    isActive: true,
    isCalling: false,
    officerDetails: {
      _id: ObjectId("66d789abc..."),
      ConsultationTypeID: ObjectId("66c123abc..."),
      JobTitle: "Senior Lawyer",
      consultationTypeDetails: {
        _id: ObjectId("66c123abc..."),
        ConsultationTypeName: "Legal Consultation", // ← MATCHED!
        FeePerMinute: 5,
      },
    },
    absenceDetails: [], // No absences
  },
  // ... more matching officers
]
```

#### Step 2.4: Filter Out Officers on Leave

```javascript
function filterOfficersByAbsence(officers, date) {
  return officers.filter((officer) => {
    const { absenceDetails } = officer

    // No absences = available
    if (absenceDetails.length === 0) {
      return true
    }

    // Check if absence is approved on this date
    const approvedDate = absenceDetails.filter(
      (item) => item.status == "Approved",
    )

    const isOnLeave = approvedDate.some((absence) => {
      const { fromDate, untilDate } = absence
      return (
        new Date(fromDate) >= new Date(date) &&
        new Date(untilDate) >= new Date(date)
      )
    })

    return !isOnLeave // True if available
  })
}

const filteredOfficers = filterOfficersByAbsence(
  officers,
  "2026-07-06T00:00:00.000Z",
)
```

#### Step 2.5: Check for Schedule Conflicts

```javascript
const availableOfficers = await Promise.all(
  filteredOfficers.filter(async (officer) => {
    // Find any existing schedules that conflict
    const conflictingSchedules = await SchedulingModel.find({
      officer: officer._id,
      $or: [
        {
          startTime: { $lt: "2026-07-06T11:00:00.000Z" }, // endTime
          endTime: { $gt: "2026-07-06T10:00:00.000Z" }, // startTime
        },
      ],
      status: { $in: ["scheduled", "completed"] },
    })

    return conflictingSchedules.length === 0 // True if no conflicts
  }),
)

// Result: Array of officers with no schedule conflicts
```

#### Step 2.6: Randomly Select One Officer

```javascript
if (availableOfficers.length > 0) {
  const randomOfficer =
    availableOfficers[Math.floor(Math.random() * availableOfficers.length)]

  return randomOfficer // Pick a random one from available
}
```

---

## Step 3: Backend Response to Frontend

### Response Data Structure

```json
{
  "statusCode": 200,
  "data": {
    "id": "66b456xyz...",
    "name": "John Lawyer",
    "mobile": "+919876543210",
    "avatar": "image_url"
  },
  "message": "Officer found successfully"
}
```

### Backend Code Sending Response

```javascript
return res.status(200).json(
  new ApiResponse(200, {
    id: randomOfficer._id,
    name: randomOfficer.name,
    mobile: randomOfficer.mobile,
    avatar: randomOfficer.avatar,
  }),
)
```

### Frontend Receives

```javascript
const officerData = {
  id: "66b456xyz...", // Officer's user ID
  name: "John Lawyer", // Officer's name
  mobile: "+919876543210", // Officer's mobile (KEY!)
  avatar: "image_url", // Officer's profile picture
}
```

---

## Step 4: Frontend Initiates Call via WebSocket

### Frontend Code

```javascript
const socket = io("http://localhost:8001", {
  path: "/websocket",
  query: {
    token: jwtToken,
    callerId: customerMobile, // Customer's mobile
  },
})

// After receiving officer data
const initiateCall = (officerData) => {
  socket.emit("call", {
    calleeId: officerData.mobile, // ← Use mobile, not ID!
    rtcMessage: {
      tokenUrl: "/api/v1/agoraTokenGen",
      channelName: `consultation_${Date.now()}`,
    },
  })
}

initiateCall(officerData)
```

### Data Sent via WebSocket

```javascript
{
  "calleeId": "+919876543210",  // Officer's mobile
  "rtcMessage": {
    "tokenUrl": "/api/v1/agoraTokenGen",
    "channelName": "consultation_1720335600000"
  }
}
```

---

## Step 5: Backend - Handle Call Event & Create Consultation

### Backend Socket Handler

```javascript
// From websocket/callHandlers.js
socket.on("call", async (data) => {
  console.log("📞 [call] Event triggered:", data)

  let calleeId = data.calleeId // "+919876543210"
  let rtcMessage = data.rtcMessage

  // Get customer info from mobile number
  const userInfo = await User.findOne({
    mobile: socket.user, // socket.user = customer's mobile
  })

  // Find receiver (officer) by mobile
  const receiverUser = await checkIsOnlineUser(calleeId) // Find by mobile

  const customer = userInfo._id // Customer's ID
  const officer = receiverUser._id // Officer's ID

  // ... create/find chat ...

  // Get officer details with consultation type
  const officerWithDetails = await User.findById(officer).populate({
    path: "officerDetails",
    populate: {
      path: "ConsultationTypeID",
      select: "ConsultationTypeName",
    },
  })

  const consultationTypeName =
    officerWithDetails?.officerDetails?.ConsultationTypeID
      ?.ConsultationTypeName || "General Consultation"

  // Check free minutes
  const customerUser = await getUserWithDefaults(customer)
  const isFreeCall =
    customerUser &&
    customerUser.hasFreeMinutes &&
    customerUser.freeMinutesUsed < customerUser.freeMinutesLimit

  // Send newCall event to officer
  if (receiverUser.isOnline) {
    socket.to(calleeId).emit("newCall", {
      callerId: socket.user, // Customer's mobile
      rtcMessage: rtcMessage,
      userInfo: userInfo, // Customer info
      chatId: chatId,
      isFreeCall: isFreeCall,
      freeMinutesRemaining:
        customerUser.freeMinutesLimit - customerUser.freeMinutesUsed,
      consultationTypeName: consultationTypeName, // ← CATEGORY INFO!
    })
  }
})
```

### Data Received by Officer (WebSocket)

```javascript
{
  callerId: "+919123456789",              // Customer's mobile
  rtcMessage: {...},
  userInfo: {
    _id: "66a123...",
    name: "Customer Name",
    mobile: "+919123456789",
    avatar: "url",
    // ...
  },
  chatId: "66c789...",
  isFreeCall: true,
  freeMinutesRemaining: 15,
  consultationTypeName: "Legal Consultation"  // ← CATEGORY CONFIRMATION!
}
```

---

## Step 6: Officer Answers & Consultation Record Created

### Officer's Frontend Code

```javascript
socket.on("newCall", (data) => {
  // Officer sees incoming call from customer in Legal Consultation category
  showIncomingCallUI({
    callerName: data.userInfo.name,
    consultationType: data.consultationTypeName, // "Legal Consultation"
    isFreeCall: data.isFreeCall,
  })
})

// Officer taps "Answer"
const answerCall = () => {
  socket.emit("answerCall", {
    callerId: incomingCallData.callerId,
    rtcMessage: incomingCallData.rtcMessage,
    customer: customerId,
    officer: officerId,
  })
}
```

### Backend - Create Consultation Record

```javascript
// From callHandlers.js - answerCall event handler
socket.on("answerCall", async (data) => {
  let customer = data.customer
  let officer = data.officer

  // Create new consultation record
  const newCall = new Consultation({
    customer: new ObjectId(customer),
    officer: new ObjectId(officer),
    startCallTime: new Date().toISOString(),
    isFreeCall: isFreeCall,
    freeMinutesUsed: 0,
    status: "pending",
  })

  const savedCalling = await newCall.save()

  console.log("✅ [answerCall] Consultation created:", savedCalling._id)

  // Update user status
  await User.findByIdAndUpdate(customer, {
    isCalling: true,
    currentConsult: savedCalling._id,
    $addToSet: { consultations: savedCalling._id },
  })

  await User.findByIdAndUpdate(officer, {
    isCalling: true,
    currentConsult: savedCalling._id,
    $addToSet: { consultations: savedCalling._id },
  })
})
```

### Consultation Record in Database

```javascript
// CONSULTATION DOCUMENT CREATED
{
  _id: ObjectId("66f567abc..."),
  customer: ObjectId("66a123..."),        // Customer's user ID
  officer: ObjectId("66b456..."),         // Officer's user ID (MATCHED by category!)
  startCallTime: ISODate("2026-07-06T10:00:00.000Z"),
  endCallTime: null,
  totalCallPrice: 0,
  status: "pending",
  isFreeCall: true,
  freeMinutesUsed: 0,
  createdAt: ISODate("2026-07-06T10:00:00.000Z")
}
```

---

## Complete Data Flow Diagram

```
┌──────────────────┐
│  FRONTEND: USER  │
│  Selects Category│
│  "Legal Consult" │
└────────┬─────────┘
         │
         │ REST API POST
         │ {
         │   consultationTypeName: "Legal Consultation",
         │   startTime: "2026-07-06T10:00:00Z",
         │   endTime: "2026-07-06T11:00:00Z"
         │ }
         ▼
┌──────────────────────────────┐
│  BACKEND: FIND OFFICER       │
│  1. Find ConsultationType    │
│     by name                  │
│  2. Query Officers where:    │
│     - officerDetails exists  │
│     - isActive = true        │
│     - isCalling = false      │
│  3. Join ConsultationType    │
│     Match by ID              │
│  4. Filter by absence        │
│  5. Filter by schedule       │
│  6. Pick random available    │
└────────┬─────────────────────┘
         │
         │ REST API Response
         │ {
         │   id: "66b456...",
         │   mobile: "+919876543210",
         │   name: "John Lawyer",
         │   avatar: "url"
         │ }
         ▼
┌──────────────────┐
│  FRONTEND: USER  │
│  Sees Officer    │
│  Details         │
│  Clicks "Call"   │
└────────┬─────────┘
         │
         │ WebSocket emit 'call'
         │ {
         │   calleeId: "+919876543210",
         │   rtcMessage: {...}
         │ }
         ▼
┌──────────────────────────────┐
│  BACKEND: HANDLE CALL EVENT  │
│  1. Get customer by mobile   │
│  2. Get officer by mobile    │
│  3. Find officer details +   │
│     consultation type        │
│  4. Create/find chat         │
│  5. Emit 'newCall' to officer│
│     with category info       │
└────────┬─────────────────────┘
         │
         │ WebSocket emit 'newCall'
         │ to officer's mobile
         │ {
         │   callerId: "+919123456789",
         │   consultationTypeName:
         │     "Legal Consultation",
         │   userInfo: {...},
         │   isFreeCall: true
         │ }
         ▼
┌──────────────────┐
│  FRONTEND:OFFICER│
│  Sees Incoming   │
│  Call + Category │
│  Clicks "Answer" │
└────────┬─────────┘
         │
         │ WebSocket emit 'answerCall'
         │ {
         │   callerId, customer, officer,
         │   rtcMessage
         │ }
         ▼
┌──────────────────────────────┐
│  BACKEND: ANSWER CALL EVENT  │
│  1. Create Consultation      │
│     record linking:          │
│     - customer ID            │
│     - officer ID             │
│  2. Mark both as isCalling   │
│  3. Set auto-hangup for      │
│     free minutes             │
│  4. Emit 'callAnswered' to   │
│     both                      │
└────────┬─────────────────────┘
         │
         │ WebSocket emit 'callAnswered'
         │ to both users
         │ {
         │   consultationData: {...},
         │   chatId: "66c789...",
         │   isFreeCall: true,
         │   freeMinutesRemaining: 15
         │ }
         ▼
┌──────────────────────────────┐
│  BOTH: INITIALIZE AGORA      │
│  - Get token from /agoraToken│
│  - Join video channel        │
│  - Exchange audio/video      │
│  - Call active               │
└──────────────────────────────┘
```

---

## Key Data Points Summary

### Matching Key

- **Category Name**: `consultationTypeName` (string) - used to match officers
- **Database Link**: `OfficerDetails.ConsultationTypeID` → `ConsultationType._id`

### Important IDs

- **Category/Type ID**: `66c123abc...` (MongoDB ObjectId)
- **Officer ID**: `66b456xyz...` (MongoDB ObjectId)
- **Customer ID**: `66a123...` (MongoDB ObjectId)
- **Officer Mobile**: `+919876543210` (used in WebSocket, not ID!)
- **Customer Mobile**: `+919123456789` (used in WebSocket)

### Flow Summary

```
User picks "Legal Consultation"
    ↓
Backend finds all officers where ConsultationType = "Legal Consultation"
    ↓
Filters: active, not calling, available time, no conflicts
    ↓
Randomly picks one officer
    ↓
Returns officer's mobile number
    ↓
Frontend calls officer using mobile (via WebSocket)
    ↓
Officer receives call info including category
    ↓
Officer answers → Consultation record created linking both
    ↓
Video call via Agora RTC
```

---

## Important Notes

✅ **Category is matched at query time**, not stored in call data  
✅ **Officer mobile is used for socket communication**, not ID  
✅ **Officer ID is stored in Consultation record** for billing/history  
✅ **Consultation type name is confirmed** in newCall event  
✅ **Officer details are fetched** when call is answered to confirm category  
✅ **Free minutes logic depends on category fee rate** from ConsultationType.FeePerMinute  
✅ **Random selection ensures** load balancing across available officers  
✅ **Absence and schedule checks happen before random selection**

---

**Version**: 1.0.0 | Last Updated: 2026-07-06
