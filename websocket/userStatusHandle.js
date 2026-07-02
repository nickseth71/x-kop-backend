import User from "../models/user.model.js";
export const isOnlineUser = async (mobile, data) => {
  try {
    const { status, fcmToken=null } = data;
    
    const online_status =
      fcmToken != ""
        ? await User.findOneAndUpdate(
            { mobile: mobile },
            { isOnline: status, fcmToken: fcmToken },
            { new: true }
          )
        : await User.findOneAndUpdate(
            { mobile: mobile },
            { isOnline: status },
            { new: true }
          );
    if (!online_status) {
      return { message: "User not found" };
    }
    return online_status;
  } catch (error) {
    return { message: error.message };
  }
};


export const checkIsOnlineUser = async (mobile) => {
return await User.findOne({mobile});
}