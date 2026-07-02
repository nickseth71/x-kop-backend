import { Server } from "socket.io";
import { isOnlineUser } from "./websocket/userStatusHandle.js";
import { verifyJWTSocket } from "./middlewares/auth.socket.js";
import { handleCallEvents } from "./websocket/callHandlers.js";
import { handleMessages } from "./websocket/messageHandlers.js";
import Consultation from "./models/Consultation.model.js";
import User from "./models/user.model.js";

let websocketNamespace = null;

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });
   websocketNamespace = io.of("/websocket");

  websocketNamespace.use(async (socket, next) => {
    try {
      if (socket.handshake.query) {
        const token =
          socket.handshake.query.token ||
          socket.handshake.headers["authorization"].split(" ")[1];
        if (!token) {
          return next(new Error("Authentication token is missing"));
        }

        const res_auth = await verifyJWTSocket(token);

        if (!res_auth) {
          return next(new Error("Authentication failed"));
        }

        let callerId = socket.handshake.query.callerId;

        if (!callerId) {
          return next(new Error("Caller ID is missing"));
        }

        socket.user = callerId;
        socket.userInfo = res_auth;
        next();
      } else {
        next(new Error("No handshake query provided"));
      }
    } catch (error) {
      next(new Error("Internal server error"));
    }
  });

  websocketNamespace.on("connection", async (socket) => {
    console.log("Client connected",socket.user);
    socket.join(socket.user);

    socket.on("onLive", (data) => {
      isOnlineUser(socket.user, data);
    }); 

    handleCallEvents(socket,websocketNamespace);
    handleMessages(socket,websocketNamespace);

    socket.on("disconnect", async() => {
      
 let user = await User.findOne({mobile:socket.user});
 if(user.isCalling) {
 let callFetch = await Consultation.findByIdAndUpdate(
   user.currentConsult,         
   { status: "completed",endCallTime:new Date().toISOString() },       
   { new: true }                
 );
 
 const officerType =  await User.findById(callFetch.officer).select('_id officerDetails wallet mobile').populate({
   path: 'officerDetails',
   strictPopulate:false,
   select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
   populate: {
     path: 'ConsultationTypeID', 
     model: 'ConsultaionType', 
     select: 'ConsultationTypeName FeePerMinute', 
   }
 })

const userCustomer =  await User.findById(callFetch.customer).select('_id wallet mobile');
const startCallTime = new Date(callFetch.startCallTime);
const endCallTime = new Date(callFetch.endCallTime);
const timeDifference = endCallTime - startCallTime;
const durationInMinutes = timeDifference / (1000 * 60);
const roundedDuration = Math.ceil(durationInMinutes);

let detectPrice = parseInt(roundedDuration)*parseInt(officerType.officerDetails.ConsultationTypeID.FeePerMinute);

await Consultation.findByIdAndUpdate(
 user.currentConsult,         
 { totalCallPrice: detectPrice },       
 { new: true }                
);

 await User.findByIdAndUpdate(callFetch.customer, {
   isCalling:false,
   wallet:parseInt(userCustomer.wallet)-detectPrice
 }, { new: true });

 const resultPercent = (5 / 100) * detectPrice;
 await User.findByIdAndUpdate(callFetch.officer, {
   isCalling:false,
   wallet:parseInt(officerType.wallet)+(detectPrice-resultPercent)
 }, { new: true })

 socket.to(userCustomer.mobile).emit("appyHandsup", { status: true });
 socket.to(officerType.mobile).emit("appyHandsup", { status: true });
 socket.to(userCustomer.mobile).emit("updateUser",{});
 socket.to(officerType.mobile).emit("updateUser",{});
}
      isOnlineUser(socket.user, { status: false, fcmToken: "" });
    });
  });
};
export const getWebsocketNamespace = () => websocketNamespace;