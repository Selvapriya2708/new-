package com.inb.repository;

import com.inb.model.Account;
import com.inb.model.Transaction;
import com.inb.model.TransactionStatus;
import com.inb.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Transaction entity.
 * Provides methods to interact with the transactions table in the database.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Find all transactions for a specific account.
     * 
     * @param account The account to find transactions for
     * @return List of transactions for the account
     */
    List<Transaction> findByAccount(Account account);

    /**
     * Find all transactions for a specific account ID.
     * 
     * @param accountId The ID of the account to find transactions for
     * @return List of transactions for the account
     */
    List<Transaction> findByAccountId(Long accountId);

    /**
     * Find all transactions for a specific account ID, sorted by date (newest first).
     * 
     * @param accountId The ID of the account to find transactions for
     * @param pageable Pagination information
     * @return Page of transactions for the account
     */
    Page<Transaction> findByAccountIdOrderByTransactionDateDesc(Long accountId, Pageable pageable);

    /**
     * Find transactions for an account within a date range.
     * 
     * @param accountId The ID of the account
     * @param startDate The start date of the range
     * @param endDate The end date of the range
     * @return List of transactions within the specified date range
     */
    List<Transaction> findByAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long accountId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find transactions by type.
     * 
     * @param transactionType The transaction type to search for
     * @return List of transactions of the specified type
     */
    List<Transaction> findByTransactionType(TransactionType transactionType);

    /**
     * Find transactions by status.
     * 
     * @param status The transaction status to search for
     * @return List of transactions with the specified status
     */
    List<Transaction> findByStatus(TransactionStatus status);

    /**
     * Find transactions by type and status.
     * 
     * @param transactionType The transaction type to search for
     * @param status The transaction status to search for
     * @return List of transactions of the specified type and status
     */
    List<Transaction> findByTransactionTypeAndStatus(TransactionType transactionType, TransactionStatus status);

    /**
     * Get the latest transactions for an account with limit.
     * 
     * @param accountId The ID of the account
     * @param limit The maximum number of transactions to return
     * @return List of the latest transactions for the account
     */
    @Query(value = "SELECT * FROM transactions WHERE account_id = ?1 ORDER BY transaction_date DESC LIMIT ?2",
           nativeQuery = true)
    List<Transaction> findLatestTransactionsByAccountId(Long accountId, int limit);

    /**
     * Get the total amount of all transactions of a specific type for an account.
     * 
     * @param accountId The ID of the account
     * @param transactionType The transaction type to sum
     * @return The total amount of transactions of the specified type
     */
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account.id = ?1 AND t.transactionType = ?2 AND t.status = 'COMPLETED'")
    BigDecimal sumAmountByAccountIdAndTransactionType(Long accountId, TransactionType transactionType);

    /**
     * Find scheduled transactions ready for processing.
     * 
     * @param now The current date and time
     * @return List of scheduled transactions ready for processing
     */
    @Query("SELECT t FROM Transaction t WHERE t.status = 'SCHEDULED' AND t.transactionDate <= ?1")
    List<Transaction> findScheduledTransactionsForProcessing(LocalDateTime now);

    /**
     * Find recent transfer transactions for a user.
     * 
     * @param userId The ID of the user
     * @param limit The maximum number of transactions to return
     * @return List of recent transfer transactions for the user
     */
    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = ?1 AND t.transactionType = 'TRANSFER' ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentTransfersByUserId(Long userId, Pageable pageable);
}
