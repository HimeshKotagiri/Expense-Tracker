const Transaction = require("../models/transactionModel");
const moment = require("moment");

// Get all transactions for a user
const getAllTransaction = async (req, res) => {
  try {
    const { frequency, selectedDate, userid, type } = req.body;

    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const filter = {
      userid,
      ...(frequency !== "custom"
        ? {
            date: {
              $gt: moment().subtract(Number(frequency), "days").toDate(),
            },
          }
        : selectedDate && selectedDate.length === 2
        ? {
            date: {
              $gte: moment(selectedDate[0]).startOf("day").toDate(),
              $lte: moment(selectedDate[1]).endOf("day").toDate(),
            },
          }
        : {}),
      ...(type !== "all" && { type }),
    };

    const transactions = await Transaction.find(filter);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.body.transactionId });
    res.status(200).send("Transaction Deleted!");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Edit a transaction
const editTransaction = async (req, res) => {
  try {
    const{transactionId,payload} = req.body;
    const{_id, ...updateData}=payload;
    await Transaction.findOneAndUpdate(
      { _id: transactionId },
      updateData,{new:true}
    );
    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error editing transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new transaction
const addTransaction = async (req, res) => {
  try {
    const { userid, amount, type, category, description, date } = req.body;

    if (!userid || !amount || !type || !category || !description || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({
      message: "Transaction Created",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Export all functions
module.exports = {
  getAllTransaction,
  editTransaction,
  addTransaction,
  deleteTransaction,
};
