package com.inb.repository;

import com.inb.model.Account;
import com.inb.model.Bill;
import com.inb.model.BillStatus;
import com.inb.model.BillType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Bill entity.
 * Provides methods to interact with the bills table in the database.
 */
@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    /**
     * Find all bills for a specific account.
     * 
     * @param account The account to find bills for
     * @return List of bills for the account
     */
    List<Bill> findByAccount(Account account);

    /**
     * Find all bills for a specific account ID.
     * 
     * @param accountId The ID of the account to find bills for
     * @return List of bills for the account
     */
    List<Bill> findByAccountId(Long accountId);

    /**
     * Find bills by type.
     * 
     * @param billType The bill type to search for
     * @return List of bills of the specified type
     */
    List<Bill> findByBillType(BillType billType);

    /**
     * Find bills by status.
     * 
     * @param status The bill status to search for
     * @return List of bills with the specified status
     */
    List<Bill> findByStatus(BillStatus status);

    /**
     * Find bills for an account with a specific status.
     * 
     * @param accountId The ID of the account
     * @param status The bill status to search for
     * @return List of bills for the account with the specified status
     */
    List<Bill> findByAccountIdAndStatus(Long accountId, BillStatus status);

    /**
     * Find bills by provider.
     * 
     * @param provider The provider to search for
     * @return List of bills for the specified provider
     */
    List<Bill> findByProvider(String provider);

    /**
     * Find scheduled bills ready for processing.
     * 
     * @param now The current date and time
     * @return List of scheduled bills ready for processing
     */
    @Query("SELECT b FROM Bill b WHERE b.status = 'SCHEDULED' AND b.scheduledDate <= ?1")
    List<Bill> findScheduledBillsForProcessing(LocalDateTime now);

    /**
     * Find all scheduled bills for a user.
     * 
     * @param userId The ID of the user
     * @return List of scheduled bills for the user
     */
    @Query("SELECT b FROM Bill b WHERE b.account.user.id = ?1 AND b.status = 'SCHEDULED'")
    List<Bill> findScheduledBillsByUserId(Long userId);

    /**
     * Find bills based on bill number.
     * 
     * @param billNumber The bill number to search for
     * @return List of bills with the specified bill number
     */
    List<Bill> findByBillNumber(String billNumber);

    /**
     * Find recent bills paid by a user.
     * 
     * @param userId The ID of the user
     * @param limit The maximum number of bills to return
     * @return List of recently paid bills by the user
     */
    @Query(value = "SELECT b.* FROM bills b JOIN accounts a ON b.account_id = a.id " +
                   "WHERE a.user_id = ?1 AND b.status = 'PAID' " +
                   "ORDER BY b.payment_date DESC LIMIT ?2", 
            nativeQuery = true)
    List<Bill> findRecentPaidBillsByUserId(Long userId, int limit);
}
