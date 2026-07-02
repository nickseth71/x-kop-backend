import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import OfficerDetails from "../models/officerDetails.model.js"

export const verifyJWTSocket = async (token) => {
  try {
    if (!token) {
      return false;
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return false;
    }

    const query = User.findById(decodedToken._id)
  .populate({
    path: "userRoleId",
    select: "-createdAt -updatedAt -__v"
  })
  .select("-refreshToken -ip -__v -chats -consultations -walletTransactions -schedules -fcmToken -transactions");

let user = await query.exec();



if (user?.officerDetails) {
  user.officerDetails = await OfficerDetails.findById(user?.officerDetails)
    .select("-IDProofDocument -Officer -__v -ConsultationTypeID") 
    .populate({
      path: "ConsultationTypeID",
      model: "ConsultaionType", 
      select: "ConsultationTypeName FeePerMinute",
    });

}

    if (!user) {
       return false;
    }
    const roleData = {
      UserType: user.userRoleId.UserType,
      IsActive: user.userRoleId.IsActive
    };
  
    return { ...user.toObject(), role: roleData,userRoleId:user.userRoleId._id };
} catch (error) {
    return false;
}

}






// import jwt from "jsonwebtoken";
// import User from "../models/user.model.js";

// export const verifyJWTSocket = async (token) => {
//   try {
//     if (!token) {
//       return false;
//     }
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     if (!decodedToken) {
//       return false;
//     }

//     const user = await User.findById(decodedToken._id)
//       .populate({
//         path: "userRoleId",
//         select: "-createdAt -updatedAt -__v"
//       })
//       .select("-refreshToken -ip -__v");

//     if (!user) {
//        return false;
//     }
//     const roleData = {
//       UserType: user.userRoleId.UserType,
//       IsActive: user.userRoleId.IsActive
//     };
  
//     return { ...user.toObject(), role: roleData,userRoleId:user.userRoleId._id };
// } catch (error) {
//     return false;
// }


// }
