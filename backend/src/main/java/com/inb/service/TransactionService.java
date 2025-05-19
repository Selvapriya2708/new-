package com.inb.service;

import com.inb.dto.TransactionDto;
import com.inb.model.Transaction;
import com.inb.model.TransactionStatus;
import com.inb.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service interface for transaction-related operations.
 */
public interface TransactionService {

    /**
     * Create a new transaction.
     * 
     * @param transactionDto The transaction details
     * @return The created transaction
     */
    Transaction createTransaction(TransactionDto transactionDto);

    /**
     * Get all transactions for an account.
     * 
     * @param accountId The ID of the account
     * @return List of transactions for the account
     */
    List<Transaction> getTransactionsByAccountId(Long accountId);

    /**
     * Get transaction by ID.
     * 
     * @param transactionId The ID of the transaction to retrieve
     * @return The transaction with the specified ID
     */
    Transaction getTransactionById(Long transactionId);

    /**
     * Get transactions for an account within a date range.
     * 
     * @param accountId The ID of the account
     * @param startDate The start date of the range
     * @param endDate The end date of the range
     * @return List of transactions within the specified date range
     */
    List<Transaction> getTransactionsByDateRange(Long accountId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get a mini statement for an account (latest 5 transactions).
     * 
     * @param accountId The ID of the account
     * @return Map containing the mini statement details
     */
    Map<String, Object> getMiniStatement(Long accountId);

    /**
     * Get a detailed statement for an account.
     * 
     * @param accountId The ID of the account
     * @param startDate The start date of the statement
     * @param endDate The end date of the statement
     * @return Map containing the detailed statement details
     */
    Map<String, Object> getDetailedStatement(Long accountId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Update transaction status.
     * 
     * @param transactionId The ID of the transaction
     * @param status The new status
     * @return The updated transaction
     */
    Transaction updateTransactionStatus(Long transactionId, TransactionStatus status);

    /**
     * Get transactions by type.
     * 
     * @param type The transaction type to search for
     * @return List of transactions of the specified type
     */
    List<Transaction> getTransactionsByType(TransactionType type);

    /**
     * Get transactions by status.
     * 
     * @param status The transaction status to search for
     * @return List of transactions with the specified status
     */
    List<Transaction> getTransactionsByStatus(TransactionStatus status);

    /**
     * Process scheduled transactions that are due.
     */
    void processScheduledTransactions();

    /**
     * Schedule a transaction for future execution.
     * 
     * @param transactionDto The transaction details
     * @param scheduledDate The date to execute the transaction
     * @return The scheduled transaction
     */
    Transaction scheduleTransaction(TransactionDto transactionDto, LocalDateTime scheduledDate);

    /**
     * Calculate total credits for an account.
     * 
     * @param accountId The ID of the account
     * @return The total credit amount
     */
    BigDecimal calculateTotalCredits(Long accountId);

    /**
     * Calculate total debits for an account.
     * 
     * @param accountId The ID of the account
     * @return The total debit amount
     */
    BigDecimal calculateTotalDebits(Long accountId);

    /**
     * Get recent transactions for a user.
     * 
     * @param userId The ID of the user
     * @param limit The maximum number of transactions to return
     * @return List of recent transactions for the user
     */
    List<Transaction> getRecentTransactionsForUser(Long userId, int limit);
}
