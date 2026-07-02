import User from './../models/user.model.js';
import SchedulingModel from './../models/Scheduling.model.js';
import Absence from './../models/absence.model.js';
import OfficerDetails from './../models/officerDetails.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// export async function isOfficerAvailable() {
//     const currentDateTime = new Date();
    
//     const availableOfficer = await User.aggregate([
//         {
//           $match: {
//             isOnline: true,
//             isActive: true,
//             isCalling: false,
//             officerDetails: { $exists: true, $ne: null }
//           }
//         },
//         {
//           $lookup: {
//             from: 'officerdetails',
//             localField: 'officerDetails',
//             foreignField: '_id',
//             as: 'officerDetails'
//           }
//         },
//         {
//           $unwind: '$officerDetails'
//         },
//         {
//           $lookup: {
//               from: 'absences',
//               localField: 'officerDetails._id',
//               foreignField: 'officer',
//               as: 'absences'
//           }
//       },
//         {
//           $addFields: {
//             activeAbsence: {
//               $filter: {
//                 input: '$absences',
//                 as: 'absence',
//                 cond: {
//                   $and: [
//                     { $lte: ['$$absence.fromDate', new Date()] },
//                     { $gte: ['$$absence.untilDate', new Date()] },
//                     { $eq: ['$$absence.status', 'Approved'] }
//                   ]
//                 }
//               }
//             }
//           }
//         },
//         {
//           $match: {
//             activeAbsence: { $size: 0 } // Ensure no active absence during the current time
//           }
//         },
//         {
//           $lookup: {
//             from: 'schedulings',
//             let: { officerId: '$officerDetails._id' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ['$officer', '$$officerId'] },
//                       {
//                         $or: [
//                           {
//                             $and: [
//                               { $lte: ['$startTime', new Date()] },
//                               { $gte: ['$endTime', new Date()] }
//                             ]
//                           }
//                         ]
//                       }
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: 'schedules'
//           }
//         },
//         {
//           $match: {
//             schedules: { $size: 0 } // Ensure no schedules overlapping with the current time
//           }
//         },
//         {
//           $limit: 1 // Limit to one officer
//         },
//         {
//           $lookup: {
//             from: 'absences',
//             localField: 'officerDetails.Absences',
//             foreignField: '_id',
//             as: 'officerDetails.Absences'
//           }
//         },
//         {
//           $project: {
//             _id: 1,
//             name: 1,
//             mobile: 1,
//             avatar: 1,
//             ip: 1,
//             isActive: 1,
//             userRoleId: 1,
//             chats: 1,
//             transactions: 1,
//             consultations: 1,
//             wallet: 1,
//             isCalling: 1,
//             walletTransactions: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             loginTimeDate: 1,
//             refreshToken: 1,
//             fcmToken: 1,
//             isOnline: 1,
//             officerDetails: {
//               _id: 1,
//               Officer: 1,
//               IDProofDocument: 1,
//               Absences: 1,
//               createdAt: 1,
//               updatedAt: 1,
//             }
//           }
//         }
//       ]);

//     return availableOfficer.length > 0 ? { available: availableOfficer[0]} : null;
// }


export async function isOfficerAvailable() {
    const currentDateTime = new Date();
    
    const availableOfficer = await User.aggregate([
        {
          $match: {
            isOnline: true,
            isActive: true,
            isCalling: false,
            officerDetails: { $exists: true, $ne: null }
          }
        },
        {
          $lookup: {
            from: 'officerdetails',
            localField: 'officerDetails',
            foreignField: '_id',
            as: 'officerDetails'
          }
        },
        {
          $unwind: '$officerDetails'
        },
        {
          $lookup: {
              from: 'absences',
              localField: 'officerDetails._id',
              foreignField: 'officer',
              as: 'absences'
          }
      },
        {
          $addFields: {
            activeAbsence: {
              $filter: {
                input: '$absences',
                as: 'absence',
                cond: {
                  $and: [
                    { $lte: ['$$absence.fromDate', new Date()] },
                    { $gte: ['$$absence.untilDate', new Date()] },
                    { $eq: ['$$absence.status', 'Approved'] }
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            activeAbsence: { $size: 0 } 
          }
        },
        {
          $lookup: {
            from: 'schedulings',
            let: { officerId: '$officerDetails._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$officer', '$$officerId'] },
                      {
                        $or: [
                          {
                            $and: [
                              { $lte: ['$startTime', new Date()] },
                              { $gte: ['$endTime', new Date()] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'schedules'
          }
        },
        {
          $match: {
            schedules: { $size: 0 } // Ensure no schedules overlapping with the current time
          }
        },
        {
          $limit: 1 // Limit to one officer
        },
        {
          $lookup: {
            from: 'absences',
            localField: 'officerDetails.Absences',
            foreignField: '_id',
            as: 'officerDetails.Absences'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            mobile: 1,
            avatar: 1,
            ip: 1,
            isActive: 1,
            userRoleId: 1,
            chats: 1,
            transactions: 1,
            consultations: 1,
            wallet: 1,
            isCalling: 1,
            walletTransactions: 1,
            createdAt: 1,
            updatedAt: 1,
            loginTimeDate: 1,
            refreshToken: 1,
            fcmToken: 1,
            isOnline: 1,
            officerDetails: {
              _id: 1,
              Officer: 1,
              IDProofDocument: 1,
              Absences: 1,
              createdAt: 1,
              updatedAt: 1,
            }
          }
        }
      ]);
  
    if (availableOfficer.length > 0) {
        console.log('Available Officer:', availableOfficer); // Log the available officer
        return { available: availableOfficer};
    } else {
        console.log('No officer available at this time.'); // Log when no officer is available
        return null;
    }
  }

export const findOfficer = asyncHandler(async (req, res) => {
    try {
        const isAvailable = await isOfficerAvailable();

        if (isAvailable) {
            res.status(200).json({ available: isAvailable }); // Respond with 200 OK if officer is available
        } else {
            res.status(404).json({ available: false }); // Respond with 404 Not Found if no officer is available
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Respond with 500 Internal Server Error in case of an exception
    }
});


// export async function isOfficerAvailable() {
//   const currentDateTime = new Date();
  
//   const availableOfficer = await User.aggregate([
//       {
//         $match: {
//           isOnline: true,
//           isActive: true,
//           isCalling: false,
//           officerDetails: { $exists: true, $ne: null }
//         }
//       },
//       {
//         $lookup: {
//           from: 'officerdetails',
//           localField: 'officerDetails',
//           foreignField: '_id',
//           as: 'officerDetails'
//         }
//       },
//       {
//         $unwind: '$officerDetails'
//       },
//       {
//         $lookup: {
//             from: 'absences',
//             localField: 'officerDetails._id',
//             foreignField: 'officer',
//             as: 'absences'
//         }
//     },
//       {
//         $addFields: {
//           activeAbsence: {
//             $filter: {
//               input: '$absences',
//               as: 'absence',
//               cond: {
//                 $and: [
//                   { $lte: ['$$absence.fromDate', new Date()] },
//                   { $gte: ['$$absence.untilDate', new Date()] },
//                   { $eq: ['$$absence.status', 'Approved'] }
//                 ]
//               }
//             }
//           }
//         }
//       },
//       {
//         $match: {
//           activeAbsence: { $size: 0 } // Ensure no active absence during the current time
//         }
//       },
//       {
//         $lookup: {
//           from: 'schedulings',
//           let: { officerId: '$officerDetails._id' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$officer', '$$officerId'] },
//                     {
//                       $or: [
//                         {
//                           $and: [
//                             { $lte: ['$startTime', new Date()] },
//                             { $gte: ['$endTime', new Date()] }
//                           ]
//                         }
//                       ]
//                     }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: 'schedules'
//         }
//       },
//       {
//         $match: {
//           schedules: { $size: 0 } // Ensure no schedules overlapping with the current time
//         }
//       },
//       {
//         $limit: 1 // Limit to one officer
//       },
//       {
//         $lookup: {
//           from: 'absences',
//           localField: 'officerDetails.Absences',
//           foreignField: '_id',
//           as: 'officerDetails.Absences'
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           mobile: 1,
//           avatar: 1,
//           ip: 1,
//           isActive: 1,
//           userRoleId: 1,
//           chats: 1,
//           transactions: 1,
//           consultations: 1,
//           wallet: 1,
//           isCalling: 1,
//           walletTransactions: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           loginTimeDate: 1,
//           refreshToken: 1,
//           fcmToken: 1,
//           isOnline: 1,
//           officerDetails: {
//             _id: 1,
//             Officer: 1,
//             IDProofDocument: 1,
//             Absences: 1,
//             createdAt: 1,
//             updatedAt: 1,
//           }
//         }
//       }
//     ]);

//   if (availableOfficer.length > 0) {
//       console.log('Available Officer:', availableOfficer[0]); // Log the available officer
//       return { available: availableOfficer[0] };
//   } else {
//       console.log('No officer available at this time.'); // Log when no officer is available
//       return null;
//   }
// }
