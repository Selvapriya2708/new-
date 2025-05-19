package com.inb.model;

import com.inb.exception.InsufficientFundsException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Entity representing a current account in the banking system.
 * A current account supports overdraft facilities with associated interest rates.
 */
@Entity
@Table(name = "current_accounts")
@DiscriminatorValue("CURRENT")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CurrentAccount extends Account {

    @Column(name = "has_overdraft", nullable = false)
    private boolean hasOverdraft = false;

    @Column(name = "overdraft_limit", precision = 19, scale = 2)
    private BigDecimal overdraftLimit = BigDecimal.ZERO;

    @Column(name = "overdraft_interest_rate", precision = 5, scale = 2)
    private BigDecimal overdraftInterestRate = BigDecimal.ZERO;

    public CurrentAccount(String accountNumber, User user, boolean hasOverdraft,
                         BigDecimal overdraftLimit, BigDecimal overdraftInterestRate) {
        super(accountNumber, user);
        this.hasOverdraft = hasOverdraft;
        this.overdraftLimit = overdraftLimit;
        this.overdraftInterestRate = overdraftInterestRate;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountType getAccountType() {
        return AccountType.CURRENT;
    }

    /**
     * Withdraw funds from the current account.
     * Supports overdraft if enabled.
     * 
     * @param amount The amount to withdraw
     * @return The new balance
     * @throws InsufficientFundsException if withdrawal exceeds available funds and overdraft
     */
    @Override
    public BigDecimal withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        BigDecimal newBalance = getBalance().subtract(amount);

        // If balance would go negative and no overdraft, throw exception
        if (newBalance.compareTo(BigDecimal.ZERO) < 0 && !hasOverdraft) {
            throw new InsufficientFundsException("Insufficient funds and overdraft not available");
        }

        // If balance would exceed overdraft limit, throw exception
        if (newBalance.abs().compareTo(overdraftLimit) > 0) {
            throw new InsufficientFundsException("Withdrawal would exceed overdraft limit of " + overdraftLimit);
        }

        // Update balance
        setBalance(newBalance);
        return getBalance();
    }

    /**
     * Calculate daily overdraft interest if the account is overdrawn.
     * 
     * @return The calculated interest amount, or zero if not overdrawn
     */
    public BigDecimal calculateDailyOverdraftInterest() {
        if (getBalance().compareTo(BigDecimal.ZERO) >= 0) {
            return BigDecimal.ZERO;
        }

        // Calculate daily overdraft interest: (overdraft amount * rate) / 365
        return getBalance().abs()
                .multiply(overdraftInterestRate)
                .divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP)
                .divide(new BigDecimal("365"), 2, RoundingMode.HALF_UP);
    }

    /**
     * Apply daily overdraft interest to the account balance if overdrawn.
     * 
     * @return The interest amount applied
     */
    public BigDecimal applyDailyOverdraftInterest() {
        BigDecimal interest = calculateDailyOverdraftInterest();
        if (interest.compareTo(BigDecimal.ZERO) > 0) {
            // Overdraft interest is a charge, further decreasing the balance
            setBalance(getBalance().subtract(interest));
        }
        return interest;
    }
}
