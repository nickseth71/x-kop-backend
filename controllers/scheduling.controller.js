import SchedulingModel from "../models/Scheduling.model.js";
import User from "../models/user.model.js";
import ConsultaionType from "../models/consultationType.model.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { asyncHandler } from "./../utils/asyncHandler.js";
import mongoose from "mongoose";
import { sendPushNotification } from "../utils/pushNotificationCall.js";
import agenda from "../utils/agenda.js";
const ObjectId = mongoose.Types.ObjectId;

const convertToStartOfDay = (dateTimeString) => {
  const date = new Date(dateTimeString);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const startOfDay = new Date(Date.UTC(year, month, day));
  return startOfDay.toISOString();
};

function filterOfficersByAbsence(officers, date) {
  return officers.filter((officer) => {
    const { absenceDetails } = officer;
    if (absenceDetails.length === 0) {
      return true;
    }
    const approvedDate = absenceDetails.filter(
      (item) => item.status == "Approved"
    );
    const abb = approvedDate.some((absence) => {
      const { fromDate, untilDate } = absence;
      return (
        new Date(fromDate) >= new Date(date) &&
        new Date(untilDate) >= new Date(date)
      );
    });
    return !abb;
  });
}

export const findRandomOfficer = async (req, res) => {
  try {
    const { startTime, endTime, consultationTypeName } = req.body;

    // const officers222 = await User.findOne({ mobile: "9569302070" });
    // return res.status(200).json(
    //   new ApiResponse(200, {
    //     id: officers222._id,
    //     name: officers222.name,
    //     mobile: officers222.mobile,
    //     avatar: officers222.avatar,
    //   })
    // );

    const consultation_Type = await ConsultaionType.findOne({
      ConsultationTypeName: consultationTypeName,
    });

    if (!consultation_Type) {
      return res
        .status(404)
        .json(new ApiError(404, "Consultation type not found"));
    }

    const absence_start = convertToStartOfDay(new Date(startTime));
    // const absence_end = convertToStartOfDay(new Date(endTime));

    const officers = await User.aggregate([
      {
        $match: {
          officerDetails: { $exists: true },
          isActive: true,
          isCalling: false,
        },
      },
      {
        $lookup: {
          from: "officerdetails",
          localField: "officerDetails",
          foreignField: "_id",
          as: "officerDetails",
        },
      },
      {
        $unwind: "$officerDetails",
      },
      {
        $lookup: {
          from: "consultaiontypes",
          localField: "officerDetails.ConsultationTypeID",
          foreignField: "_id",
          as: "officerDetails.consultationTypeDetails",
        },
      },

      {
        $unwind: {
          path: "$officerDetails.consultationTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "officerDetails.consultationTypeDetails.ConsultationTypeName":
            consultationTypeName,
        },
      },
      {
        $lookup: {
          from: "absences",
          localField: "officerDetails.Absences",
          foreignField: "_id",
          as: "absenceDetails",
        },
      },
    ]);

    // return res.send({officers})
    // const officersAll = officers.filter(officer=>officer.consultationTypeDetails.ConsultationTypeName==consultationTypeName);

    const filteredOfficers = filterOfficersByAbsence(officers, absence_start);
    if (filteredOfficers.length) {
      const officersWithDetails = filteredOfficers.filter(
        (officer) => officer.officerDetails !== null
      );
      const availableOfficers = await Promise.all(
        officersWithDetails.filter(async (officer) => {
          const conflictingSchedules = await SchedulingModel.find({
            officer: officer._id,
            $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
            status: { $in: ["scheduled", "completed"] },
          });
          return conflictingSchedules.length === 0;
        })
      );

      if (availableOfficers.length > 0) {
        const randomOfficer =
          availableOfficers[
            Math.floor(Math.random() * availableOfficers.length)
          ];
        return res.status(200).json(
          new ApiResponse(200, {
            id: randomOfficer._id,
            name: randomOfficer.name,
            mobile: randomOfficer.mobile,
            avatar: randomOfficer.avatar,
          })
        );
      } else {
        return res
          .status(404)
          .json(new ApiError(404, "No available officers found"));
      }
    } else {
      return res
        .status(404)
        .json(new ApiError(404, "No available officers found"));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "An error occurred: " + error.message));
  }
};

export const findRandomOfficerAndCreate = async (
  startTime,
  endTime,
  consultationTypeName
) => {
  try {
    const consultation_Type = await ConsultaionType.findOne({
      ConsultationTypeName: consultationTypeName,
    });

    if (!consultation_Type) {
      return { success: false, error: "Consultation type not found" };
    }

    const absence_start = convertToStartOfDay(new Date(startTime));

    const officers = await User.aggregate([
      {
        $match: {
          officerDetails: { $exists: true },
          isActive: true,
          isCalling: false,
        },
      },
      {
        $lookup: {
          from: "officerdetails",
          localField: "officerDetails",
          foreignField: "_id",
          as: "officerDetails",
        },
      },
      {
        $unwind: "$officerDetails",
      },
      {
        $lookup: {
          from: "consultaiontypes",
          localField: "officerDetails.ConsultationTypeID",
          foreignField: "_id",
          as: "officerDetails.consultationTypeDetails",
        },
      },
      {
        $unwind: {
          path: "$officerDetails.consultationTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "officerDetails.consultationTypeDetails.ConsultationTypeName":
            consultationTypeName,
        },
      },
      {
        $lookup: {
          from: "absences",
          localField: "officerDetails.Absences",
          foreignField: "_id",
          as: "absenceDetails",
        },
      },
    ]);

    const filteredOfficers = filterOfficersByAbsence(officers, absence_start);
    if (filteredOfficers.length) {
      const officersWithDetails = filteredOfficers.filter(
        (officer) => officer.officerDetails !== null
      );
      const availableOfficers = await Promise.all(
        officersWithDetails.filter(async (officer) => {
          const conflictingSchedules = await SchedulingModel.find({
            officer: officer._id,
            $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
            status: { $in: ["scheduled", "completed"] },
          });
          return conflictingSchedules.length === 0;
        })
      );

      if (availableOfficers.length > 0) {
        const randomOfficer =
          availableOfficers[
            Math.floor(Math.random() * availableOfficers.length)
          ];
        return {
          success: true,
          data: {
            id: randomOfficer._id,
            name: randomOfficer.name,
            mobile: randomOfficer.mobile,
            avatar: randomOfficer.avatar,
          },
        };
      } else {
        return { success: false, message: "No available officers found" };
      }
    } else {
      return { success: false, message: "No available officers found" };
    }
  } catch (error) {
    return { success: false, message: "An error occurred: " + error.message };
  }
};

// Create a new schedule
// export const createSchedule = asyncHandler(async (req, res) => {
//   try {
//     const { startTime, endTime, consultationTypeName } = req.body;
//     const data = await findRandomOfficerAndCreate(
//       startTime,
//       endTime,
//       consultationTypeName
//     );

//     if (!data.success) {
//       return res.status(400).json(new ApiError(400, data.message));
//     }

//     const check_schedule = await SchedulingModel.findOne({
//       // officer: new ObjectId(data.data.id),
//       $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
//     });

//     if (check_schedule) {
//       return res
//         .status(400)
//         .json(
//           new ApiError(
//             400,
//             "A schedule already exists for this officer at the specified time."
//           )
//         );
//     }

//     const newSchedule = new SchedulingModel({
//       customer: req.user._id,
//       officer: new ObjectId(data.data.id),
//       startTime,
//       endTime,
//       status: "scheduled",
//     });

//     const savedScheduling = await newSchedule.save();

//     // Update the schedules array for both customer and officer
//     await User.findByIdAndUpdate(req.user._id, {
//       $push: { schedules: savedScheduling._id },
//     });

//     await User.findByIdAndUpdate(data.data.id, {
//       $push: { schedules: savedScheduling._id },
//     });

//     res
//       .status(201)
//       .json(
//         new ApiResponse(201, savedScheduling, "Schedule created successfully.")
//       );
//   } catch (error) {
//     res.status(500).json(new ApiError(500, error.message));
//   }
// });

export const createSchedule = asyncHandler(async (req, res) => {
  try {
    const { startTime, endTime, consultationTypeName } = req.body;
    // const data = await findRandomOfficerAndCreate(
    //   startTime,
    //   endTime,
    //   consultationTypeName
    // );

    // if (!data.success) {
    //   return res.status(400).json(new ApiError(400, data.message));
    // }

    /////////////////////// // Replace with your static officer ID

    const staticOfficerId = "66de90b1b80aba7608d573f6";

    const check_schedule = await SchedulingModel.findOne({
      // officer: new ObjectId(data.data.id),
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (check_schedule) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "A schedule already exists for this officer at the specified time."
          )
        );
    }

    // const newSchedule = new SchedulingModel({
    //   customer: req.user._id,
    //   officer: new ObjectId(data.data.id),
    //   startTime,
    //   endTime,
    //   status: "scheduled",
    // });

    ////////////new schedule for static ////

    const newSchedule = new SchedulingModel({
      customer: req.user._id,
      officer: new ObjectId(staticOfficerId),
      startTime,
      endTime,
      status: "scheduled",
    });

    const savedScheduling = await newSchedule.save();

    // Update the schedules array for both customer and officer
    await User.findByIdAndUpdate(req.user._id, {
      $push: { schedules: savedScheduling._id },
    });

    // await User.findByIdAndUpdate(data.data.id, {
    //   $push: { schedules: savedScheduling._id },
    // });

    await User.findByIdAndUpdate(staticOfficerId, {
      $push: { schedules: savedScheduling._id },
    });

    function formatDate(dateString) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const date = new Date(dateString);
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      const suffix = (day) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      const hours = date.getHours() % 12 || 12;
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = date.getHours() >= 12 ? "pm" : "am";

      return `${month} ${day}${suffix(
        day
      )}, ${year} | ${hours}:${minutes} ${ampm}`;
    }

    // const reminderTime = new Date(
    //   new Date(startTime).getTime() - 5 * 60 * 1000
    // );
    // setTimeout(() => {
    //   agenda.schedule(reminderTime, "send meeting reminder", {
    //     meetingId: savedScheduling._id.toString(),
    //   });
    // }, 100);

    const reminderTime = new Date(
      new Date(startTime).getTime() - 5 * 60 * 1000
    );

    
    console.log("Reminder will be sent at:", formatDate(reminderTime));

   
    await agenda.schedule(reminderTime, "send meeting reminder", {
      meetingId: savedScheduling._id.toString(),
    });

    // Get officer details including FCM token for notification
    // const officer = await User.findById(data.data.id);

    // static ///////////////////
    const officer = await User.findById(staticOfficerId);

    if (officer && officer.fcmToken) {
      // Prepare notification data
      const notificationData = {
        // title: "New Meeting Scheduled",
        // body: `You have a new meeting scheduled from ${new Date(
        //   startTime
        // ).toLocaleString()} to ${new Date(endTime).toLocaleString()}`,
        meetingId: savedScheduling._id.toString(),
        startTime,
        endTime,
        consultationType: consultationTypeName,
      };

      // Send push notification
      await sendPushNotification({
        notification: {
          title: notificationData.title,
          body: notificationData.body,
        },
        data: {
          type: "MEETING_SCHEDULED",
          ...notificationData,
        },
        token: officer.fcmToken,
      });
    }

    res
      .status(201)
      .json(
        new ApiResponse(201, savedScheduling, "Schedule created successfully.")
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

// Get all schedules
export const getSchedules = async (req, res) => {
  try {
    const schedules = await SchedulingModel.find({ customer: req.user._id })
      .populate("customer", "name email avatar")
      .populate("officer", "name email avatar");
    res.status(200).json(new ApiResponse(200, schedules, "success"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// Get schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await SchedulingModel.findById(req.params.id)
      .populate("customer", "name email avatar")
      .populate("officer", "name email avatar");
    if (!schedule) {
      return res.status(404).json(new ApiError(404, "Schedule not found"));
    }
    res
      .status(200)
      .json(new ApiResponse(200, schedule, "fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// export const getScheduleByDateOfficer = asyncHandler(async (req, res) => {
//   try {
//     const { expDate } = req.body;
//     const today = new Date(expDate);
//     const startOfToday = new Date(today);
//     startOfToday.setUTCHours(0, 0, 0, 0);

//     const endOfToday = new Date(today);
//     endOfToday.setUTCHours(23, 59, 59, 999);
//     const schedule = await SchedulingModel.find({
//       officer: req.user._id,
//       startTime: {
//         $gte: startOfToday,
//         $lte: endOfToday
//       }
//     })
//     .populate("customer", "name email")
//     .populate("officer", "name email");

//     if (!schedule || schedule.length === 0) {
//       return res.status(404).json(new ApiError(404, "Schedule not found"));
//     }

//     res.status(200).json(new ApiResponse(200, schedule, "Fetched successfully"));
//   } catch (error) {
//     return res.status(500).json(new ApiError(500, error.message));
//   }
// });

// Update a schedule by ID

export const getScheduleByDateOfficer = asyncHandler(async (req, res) => {
  try {
    const { selectedDate } = req.body;
    const today = new Date(selectedDate);
    const startOfToday = new Date(today);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setUTCHours(23, 59, 59, 999);

    await SchedulingModel.deleteMany({
      startTime: { $lt: new Date().setUTCHours(0, 0, 0, 0) },
    });

    const schedule = await SchedulingModel.find({
      officer: req.user._id,
      startTime: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })
      .populate("customer", "name avatar mobile")
      .populate("officer", "name avatar mobile");
    // if (!schedule || schedule.length === 0) {
    //   return res.status(404).json(new ApiError(404, "Schedule not found"));
    // }

    res
      .status(200)
      .json(new ApiResponse(200, schedule, "Fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

export const updateSchedule = async (req, res) => {
  try {
    const updatedSchedule = await SchedulingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// Delete a schedule by ID
export const deleteSchedule = async (req, res) => {
  try {
    await SchedulingModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getScheduleAllOnlyCustomer = asyncHandler(async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    await SchedulingModel.deleteMany({
      startTime: { $lt: startOfToday },
    });

    const schedule = await SchedulingModel.find({
      customer: req.user._id,
    })
      .populate("customer", "name avatar")
      .populate({
        path: "officer",
        select: "name email mobile avatar officerDetails",
        populate: [
          {
            path: "officerDetails",
            select: "JobTitle OfficerCode EmergencyContact ConsultationTypeID",
            populate: {
              path: "ConsultationTypeID",
              model: "ConsultaionType",
              select: "ConsultationTypeName FeePerMinute",
            },
          },
        ],
      });
    res.status(200).json(new ApiResponse(200, schedule, "success"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export const getScheduleOfficerList = asyncHandler(async (req, res) => {
  try {
    const { page = "all" } = req.params;
    const PAGE_LIMIT = 3;
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    await SchedulingModel.deleteMany({
      startTime: { $lt: startOfToday },
    });

    let query = SchedulingModel.find({ officer: req.user._id })
      .populate("customer", "name avatar")
      .populate({
        path: "officer",
        select: "name email mobile avatar officerDetails",
        populate: [
          {
            path: "officerDetails",
            select: "JobTitle OfficerCode EmergencyContact ConsultationTypeID",
            populate: {
              path: "ConsultationTypeID",
              model: "ConsultaionType",
              select: "ConsultationTypeName FeePerMinute",
            },
          },
        ],
      });

    if (page !== "all") {
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber <= 0) {
        return res.status(400).json(new ApiError(400, "Invalid page number"));
      }
      query = query.limit(PAGE_LIMIT).skip(PAGE_LIMIT * (pageNumber - 1));
    }
    const schedule = await query;

    res.status(200).json(new ApiResponse(200, schedule, "success"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});
