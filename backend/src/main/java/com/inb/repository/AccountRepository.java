package com.inb.repository;

import com.inb.model.Account;
import com.inb.model.AccountStatus;
import com.inb.model.AccountType;
import com.inb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Account entity.
 * Provides methods to interact with the accounts table in the database.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * Find all accounts for a specific user.
     * 
     * @param user The user to find accounts for
     * @return List of accounts belonging to the user
     */
    List<Account> findByUser(User user);

    /**
     * Find all accounts for a specific user ID.
     * 
     * @param userId The ID of the user to find accounts for
     * @return List of accounts belonging to the user
     */
    List<Account> findByUserId(Long userId);

    /**
     * Find all accounts of a specific type for a user.
     * 
     * @param user The user to find accounts for
     * @param accountType The type of accounts to find
     * @return List of accounts of the specified type belonging to the user
     */
    @Query("SELECT a FROM Account a WHERE a.user = ?1 AND TYPE(a) = ?2")
    List<Account> findByUserAndType(User user, Class<?> accountType);

    /**
     * Find an account by its account number.
     * 
     * @param accountNumber The account number to search for
     * @return Optional containing the account if found
     */
    Optional<Account> findByAccountNumber(String accountNumber);

    /**
     * Find accounts by their status.
     * 
     * @param status The status to search for
     * @return List of accounts with the specified status
     */
    List<Account> findByStatus(AccountStatus status);

    /**
     * Check if an account number already exists.
     * 
     * @param accountNumber The account number to check
     * @return true if the account number exists, false otherwise
     */
    boolean existsByAccountNumber(String accountNumber);

    /**
     * Count the number of accounts of a specific type for a user.
     * 
     * @param user The user to count accounts for
     * @param type The account type to count
     * @return The number of accounts of the specified type for the user
     */
    @Query("SELECT COUNT(a) FROM Account a WHERE a.user = ?1 AND a.class = ?2")
    int countAccountsByUserAndType(User user, String type);

    /**
     * Find all savings accounts.
     * 
     * @return List of all savings accounts
     */
    @Query("SELECT a FROM Account a WHERE TYPE(a) = com.inb.model.SavingsAccount")
    List<Account> findAllSavingsAccounts();

    /**
     * Find all current accounts.
     * 
     * @return List of all current accounts
     */
    @Query("SELECT a FROM Account a WHERE TYPE(a) = com.inb.model.CurrentAccount")
    List<Account> findAllCurrentAccounts();

    /**
     * Find all fixed deposit accounts.
     * 
     * @return List of all fixed deposit accounts
     */
    @Query("SELECT a FROM Account a WHERE TYPE(a) = com.inb.model.FixedDepositAccount")
    List<Account> findAllFixedDepositAccounts();

    /**
     * Find active accounts for a user.
     * 
     * @param userId The ID of the user
     * @return List of active accounts belonging to the user
     */
    List<Account> findByUserIdAndStatus(Long userId, AccountStatus status);
}
