package com.inb.repository;

import com.inb.model.Account;
import com.inb.model.Cheque;
import com.inb.model.ChequeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Cheque entity.
 * Provides methods to interact with the cheques table in the database.
 */
@Repository
public interface ChequeRepository extends JpaRepository<Cheque, Long> {

    /**
     * Find all cheques for a specific account.
     * 
     * @param account The account to find cheques for
     * @return List of cheques for the account
     */
    List<Cheque> findByAccount(Account account);

    /**
     * Find all cheques for a specific account ID.
     * 
     * @param accountId The ID of the account to find cheques for
     * @return List of cheques for the account
     */
    List<Cheque> findByAccountId(Long accountId);

    /**
     * Find cheques by status.
     * 
     * @param status The cheque status to search for
     * @return List of cheques with the specified status
     */
    List<Cheque> findByStatus(ChequeStatus status);

    /**
     * Find cheques for an account with a specific status.
     * 
     * @param accountId The ID of the account
     * @param status The cheque status to search for
     * @return List of cheques for the account with the specified status
     */
    List<Cheque> findByAccountIdAndStatus(Long accountId, ChequeStatus status);

    /**
     * Find cheques by their deposit date range.
     * 
     * @param startDate The start date of the range
     * @param endDate The end date of the range
     * @return List of cheques deposited within the specified date range
     */
    List<Cheque> findByDepositDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find a cheque by its slip number.
     * 
     * @param slipNumber The slip number to search for
     * @return The cheque with the specified slip number
     */
    Cheque findBySlipNumber(String slipNumber);

    /**
     * Find cheques by bank name.
     * 
     * @param bankName The bank name to search for
     * @return List of cheques from the specified bank
     */
    List<Cheque> findByBankName(String bankName);

    /**
     * Count cheques by status.
     * 
     * @param status The cheque status to count
     * @return The number of cheques with the specified status
     */
    long countByStatus(ChequeStatus status);

    /**
     * Find cheques that need to be processed for clearance.
     * Cheques that have been sent for clearance more than 3 days ago.
     * 
     * @param clearanceDate The date to check against (usually 3 days ago)
     * @return List of cheques that need to be processed
     */
    @Query("SELECT c FROM Cheque c WHERE c.status = 'SENT_FOR_CLEARANCE' AND c.clearanceDate <= ?1")
    List<Cheque> findChequesReadyForClearance(LocalDateTime clearanceDate);

    /**
     * Generate a reconciliation report for cheques.
     * 
     * @param startDate The start date for the report
     * @param endDate The end date for the report
     * @return List of cheques for reconciliation
     */
    @Query("SELECT c FROM Cheque c WHERE c.depositDate BETWEEN ?1 AND ?2 ORDER BY c.status, c.depositDate")
    List<Cheque> generateReconciliationReport(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find all cheques for a user.
     * 
     * @param userId The ID of the user
     * @return List of cheques for the user
     */
    @Query("SELECT c FROM Cheque c WHERE c.account.user.id = ?1")
    List<Cheque> findByUserId(Long userId);
}
