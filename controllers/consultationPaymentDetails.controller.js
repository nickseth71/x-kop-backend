import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import ConsultationPaymentDetails from "./../models/consultationPaymentDetails.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs"

const getPaymentDetailAll = asyncHandler(async (req, res)=>{
try {
    const getType = await ConsultationPaymentDetails.find({});
    return res.status(200).json(new ApiResponse(200,getType,"successfully get all consultation Type."));
} catch (error) {
    return res.status(500).json(new ApiError(500,"Internal Server Problem!"));
    
}
});

const getPaymentDetailUser = asyncHandler(async (req, res) => {
  try {

    const { page = 1, limit = 10 } = req.query; 
    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    const skip = (currentPage - 1) * perPage;

   
    const userData = await User.findById(req.user._id);

    
    const transactions_users = await ConsultationPaymentDetails.find({ 
      _id: { $in: userData.transactions } 
    }).populate({
      path:"userId",
      select:"name avatar"
    })
    .skip(skip)
    .limit(perPage);

    const totalConsultations = await ConsultationPaymentDetails.countDocuments({ 
      _id: { $in: userData.transactions } 
    });

    const totalPages = Math.ceil(totalConsultations / perPage);

    return res.status(200).json(new ApiResponse(
      200,
      {
        transactions_users,
        pagination: {
          page: currentPage,
          limit: perPage,
          totalPages,
          totalConsultations,
        },
      },
      "success"
    ));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Problem!"));
  }
});


    const updateWallet = async (userId,amount,transactions) => {
      try {
        const user = await User.findById(userId);
        await User.findByIdAndUpdate(userId, {
          wallet : user.wallet + amount,
          $push: { transactions: transactions },
        });
        return true
      } catch (error) {
        console.log("error====>",error)
            return false;
      }
    };

const storeUserInfo = async(req, res) => {
    const { userId,transactionId, amount } = req.body;
    try {
      const newPayment = new ConsultationPaymentDetails({
        userId,
        transactionId,
        amount
      });
  
       await newPayment.save();
  
      res.status(200).json(new ApiResponse(200, newPayment, "create payment id"));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!"));
    }
};





const phonePePayment = async (req, res) => {
    const { response, checksum } = req.body;
    const responseData = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
    
  
    if (!responseData || !responseData.code) {
      return res.status(400).json({ status: 'error', message: 'Invalid response format' });
    }
  
    const responseMessages = {
      "PAYMENT_INITIATED": "Payment initiation received.",
      "PAYMENT_SUCCESS": "Payment successful.",
      "PAYMENT_ERROR": "Payment error.",
      "INTERNAL_SERVER_ERROR": "Internal server error.",
      "BAD_REQUEST": "Bad request.",
      "AUTHORIZATION_FAILED": "Authorization failed.",
      "INTERNAL_SECURITY_BLOCK_1": "Internal security block 1.",
      "INTERNAL_SECURITY_BLOCK_2": "Internal security block 2.",
      "INTERNAL_SECURITY_BLOCK_4": "Internal security block 4.",
      "INTERNAL_SECURITY_BLOCK_5": "Internal security block 5.",
      "INTERNAL_SECURITY_BLOCK_6": "Internal security block 6."
    };
  
    const { code, data } = responseData;
    const message = responseMessages[code] || "Unknown response code";
  
    if (code === "PAYMENT_SUCCESS") {
      const getTypeUser = await ConsultationPaymentDetails.findOne({transactionId:data.merchantTransactionId});
     const updatedPayment = await ConsultationPaymentDetails.findOneAndUpdate(
      {transactionId:data.merchantTransactionId},
      {
        method:data.paymentInstrument.type,
        state:data.state,
        paymentDate:new Date(),
        amount:parseInt(data.amount)/100
      },
      { new: true }
    );
    const walletget =  await updateWallet(getTypeUser.userId,parseInt(data.amount)/100,updatedPayment._id);
    
      return res.status(200).json({ status: 'success', message });
    } else if (responseMessages[code]) {
      return res.status(400).json({ status: 'error', message });
    } else {
      return res.status(400).json({ status: 'error', message: "Unknown response code" });
    }
  }



  const transactionDownload = asyncHandler(async (req, res) => {
    try {
      const transactionId = req.params.transaction_id;
      const transaction = await ConsultationPaymentDetails.findOne({ _id: transactionId });
  
      if (!transaction) {
        return res.status(404).send('Transaction not found');
      }
  
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=transaction-${transactionId}.pdf`);
  
      doc.pipe(res);
      doc.fontSize(25).text('Transaction Slip', { align: 'center' });
      doc.fontSize(12).moveDown();
      doc.text(`Transaction ID: ${transaction.transactionId}`);
      doc.text(`User ID: ${transaction.userId}`);
      doc.text(`Amount: ₹${transaction.amount}`);
      doc.text(`State: ${transaction.state}`);
      doc.text(`Payment Date: ${new Date(transaction.paymentDate).toLocaleString()}`);
      doc.text(`Created At: ${new Date(transaction.createdAt).toLocaleString()}`);
      doc.end();
  
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF');
    }
  });
  



export {phonePePayment,getPaymentDetailAll,getPaymentDetailUser,storeUserInfo,transactionDownload};