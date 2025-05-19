package com.inb.service;

import com.inb.dto.AccountDto;
import com.inb.model.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for account-related operations.
 */
public interface AccountService {

    /**
     * Create a new account for a user.
     * 
     * @param userId The ID of the user
     * @param accountDto The account details
     * @return The created account
     */
    Account createAccount(Long userId, AccountDto accountDto);

    /**
     * Get all accounts for a user.
     * 
     * @param userId The ID of the user
     * @return List of accounts for the user
     */
    List<Account> getAccountsByUserId(Long userId);

    /**
     * Get account by ID.
     * 
     * @param accountId The ID of the account to retrieve
     * @return The account with the specified ID
     */
    Account getAccountById(Long accountId);

    /**
     * Get account by account number.
     * 
     * @param accountNumber The account number to retrieve
     * @return The account with the specified account number
     */
    Account getAccountByAccountNumber(String accountNumber);

    /**
     * Get savings account details.
     * 
     * @param accountId The ID of the savings account
     * @return The savings account details
     */
    SavingsAccount getSavingsAccountDetails(Long accountId);

    /**
     * Get current account details.
     * 
     * @param accountId The ID of the current account
     * @return The current account details
     */
    CurrentAccount getCurrentAccountDetails(Long accountId);

    /**
     * Get fixed deposit account details.
     * 
     * @param accountId The ID of the fixed deposit account
     * @return The fixed deposit account details
     */
    FixedDepositAccount getFixedDepositAccountDetails(Long accountId);

    /**
     * Get account balance.
     * 
     * @param accountId The ID of the account
     * @return The account balance
     */
    BigDecimal getAccountBalance(Long accountId);

    /**
     * Update account status.
     * 
     * @param accountId The ID of the account
     * @param status The new status
     * @return The updated account
     */
    Account updateAccountStatus(Long accountId, AccountStatus status);

    /**
     * Close an account.
     * 
     * @param accountId The ID of the account to close
     * @return The closed account
     */
    Account closeAccount(Long accountId);

    /**
     * Deposit money into an account.
     * 
     * @param accountId The ID of the account
     * @param amount The amount to deposit
     * @param description The description of the deposit
     * @return The transaction record
     */
    Transaction deposit(Long accountId, BigDecimal amount, String description);

    /**
     * Withdraw money from an account.
     * 
     * @param accountId The ID of the account
     * @param amount The amount to withdraw
     * @param description The description of the withdrawal
     * @return The transaction record
     */
    Transaction withdraw(Long accountId, BigDecimal amount, String description);

    /**
     * Get savings account interest rate.
     * 
     * @return The current savings account interest rate
     */
    BigDecimal getSavingsInterestRate();

    /**
     * Update savings account interest rate.
     * 
     * @param newRate The new interest rate
     * @return The updated interest rate
     */
    BigDecimal updateSavingsInterestRate(BigDecimal newRate);

    /**
     * Get current account overdraft interest rate.
     * 
     * @return The current overdraft interest rate
     */
    BigDecimal getCurrentOverdraftRate();

    /**
     * Update current account overdraft interest rate.
     * 
     * @param newRate The new overdraft interest rate
     * @return The updated overdraft interest rate
     */
    BigDecimal updateCurrentOverdraftRate(BigDecimal newRate);

    /**
     * Get fixed deposit interest rates for different terms.
     * 
     * @return Map of term months to interest rates
     */
    java.util.Map<Integer, BigDecimal> getFixedDepositRates();

    /**
     * Process daily interest calculations for all accounts.
     * This includes savings account interest and current account overdraft interest.
     */
    void processDailyInterest();

    /**
     * Process monthly interest for savings accounts.
     */
    void processMonthlyInterest();

    /**
     * Check for matured fixed deposits and process them.
     */
    void processMaturedFixedDeposits();

    /**
     * Generate a unique account number.
     * 
     * @return A unique account number
     */
    String generateAccountNumber();
}
