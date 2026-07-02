import schedule from "node-schedule";

export const setScheduler = (scheduleAll)=>{
    const jobStore = {};
    const date1 = new Date(2024, 11, 10, 12, 57, 0);
    scheduleAll.forEach((item,index)=>{
        jobStore["job"+index] = {
            job: schedule.scheduleJob(date1, function () {
              console.log("Job 2 executed: The world is going to end today.");
            }),
            extraData: { name: "Job 2", description: "First scheduled task" },
          };
    }) 
  
}   