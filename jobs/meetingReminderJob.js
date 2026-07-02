import SchedulingModel from "../models/Scheduling.model.js";
import { sendPushNotificationCall } from "./../utils/pushNotificationCall.js";

const defineReminderJob = (agenda) => {
  agenda.define("send meeting reminder", async (job) => {
    const { meetingId } = job.attrs.data;

    const meeting = await SchedulingModel.findById(meetingId)
      .populate("officer")
      .populate("customer");

    if (!meeting || meeting.status !== "scheduled") {
      console.log("Meeting canceled or already completed, skipping reminder");
      return;
    }

    const notification = {
      title: "Meeting Reminder",
      body: "Your meeting starts in 5 minutes!",
    };
    const dataPayload = {
      type: "MEETING_REMINDER",
      meetingId: meeting._id.toString(),
    };

    // Notify officer
    if (meeting.officer?.fcmToken) {
      await sendPushNotificationCall({
        notification,
        data: dataPayload,
        token: meeting.officer.fcmToken,
      });
      console.log("Reminder sent to officer");
    }

    // Notify customer
    if (meeting.customer?.fcmToken) {
      await sendPushNotificationCall({
        notification,
        data: { type: "MEETING_REMINDER", ...notification },
        token: meeting.customer.fcmToken,
      });
      console.log("Reminder sent to customer");
    }
  });
};

export default defineReminderJob;
