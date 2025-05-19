package com.inb.model;

import com.inb.exception.InsufficientFundsException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a savings account in the banking system.
 * A savings account earns interest and has withdrawal limits.
 */
@Entity
@Table(name = "savings_accounts")
@DiscriminatorValue("SAVINGS")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SavingsAccount extends Account {

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "minimum_balance", nullable = false, precision = 19, scale = 2)
    private BigDecimal minimumBalance;

    @Column(name = "max_daily_withdrawal", nullable = false, precision = 19, scale = 2)
    private BigDecimal maxDailyWithdrawalAmount;

    @Column(name = "total_withdrawn_today", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalWithdrawnToday = BigDecimal.ZERO;

    @Column(name = "last_withdrawal_date")
    private LocalDateTime lastWithdrawalDate;

    public SavingsAccount(String accountNumber, User user, BigDecimal interestRate, 
                          BigDecimal minimumBalance, BigDecimal maxDailyWithdrawalAmount) {
        super(accountNumber, user);
        this.interestRate = interestRate;
        this.minimumBalance = minimumBalance;
        this.maxDailyWithdrawalAmount = maxDailyWithdrawalAmount;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountType getAccountType() {
        return AccountType.SAVINGS;
    }

    /**
     * Withdraw funds from the savings account.
     * Enforces minimum balance and maximum daily withdrawal limits.
     * 
     * @param amount The amount to withdraw
     * @return The new balance
     * @throws InsufficientFundsException if withdrawal would result in balance below minimum
     */
    @Override
    public BigDecimal withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        // Check if the withdrawal would bring the balance below the minimum
        if (getBalance().subtract(amount).compareTo(minimumBalance) < 0) {
            throw new InsufficientFundsException("Withdrawal would bring balance below minimum required: " + minimumBalance);
        }

        // Check if it's a new day and reset daily withdrawal amount if needed
        LocalDateTime now = LocalDateTime.now();
        if (lastWithdrawalDate == null || 
            !lastWithdrawalDate.toLocalDate().equals(now.toLocalDate())) {
            totalWithdrawnToday = BigDecimal.ZERO;
        }

        // Check if the withdrawal would exceed the daily limit
        if (totalWithdrawnToday.add(amount).compareTo(maxDailyWithdrawalAmount) > 0) {
            throw new InsufficientFundsException("Daily withdrawal limit exceeded: " + maxDailyWithdrawalAmount);
        }

        // Update balance, total withdrawn today, and last withdrawal date
        setBalance(getBalance().subtract(amount));
        totalWithdrawnToday = totalWithdrawnToday.add(amount);
        lastWithdrawalDate = now;

        return getBalance();
    }

    /**
     * Calculate interest for the account.
     * 
     * @return The calculated interest amount
     */
    public BigDecimal calculateMonthlyInterest() {
        // Simple interest calculation based on current balance
        return getBalance()
                .multiply(interestRate)
                .divide(new BigDecimal("100"))
                .divide(new BigDecimal("12"), 2, BigDecimal.ROUND_HALF_UP);
    }

    /**
     * Apply monthly interest to the account balance.
     * 
     * @return The interest amount applied
     */
    public BigDecimal applyMonthlyInterest() {
        BigDecimal interest = calculateMonthlyInterest();
        deposit(interest);
        return interest;
    }
}
