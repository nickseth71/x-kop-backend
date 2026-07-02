
import Agenda from "agenda";
import { DB_NAME } from "./../constants.js";

const agenda = new Agenda({
  db: {
    address: `mongodb+srv://xkopconsultancy:password!123@cluster0.kytuhbb.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`, 
    collection: 'agendaJobs',       
  },
  processEvery: '30 seconds',       
});

export default agenda;
