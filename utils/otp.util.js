// const fast2sms = require("fast-two-sms");
// const {FAST2SMS} = require("../config");

export const generateOTP = async (otp_length) => {
  // var digits = "0123456789";
  // let OTP = "";
  // for (let i = 0; i < otp_length; i++) {
  //   OTP += digits[Math.floor(Math.random() * 10)];
  // }

  // if (OTP.length !== otp_length) {
  //   return generateOTP(otp_length);
  // }

  // return OTP;
  return Math.floor(1000 + Math.random() * 9000);
};

// export const fast2sms = async ({ message, contactNumber }, next) => {
//   try {
//     const res = await fast2sms.sendMessage({
//       authorization: FAST2SMS,
//       message,
//       numbers: [contactNumber],
//     });
//     console.log(res);
//   } catch (error) {
//     next(error);
//   }
// };