package com.inb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * Entity representing a fixed deposit account in the banking system.
 * A fixed deposit account has a fixed term and interest rate with a maturity date.
 */
@Entity
@Table(name = "fixed_deposit_accounts")
@DiscriminatorValue("FIXED_DEPOSIT")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class FixedDepositAccount extends Account {

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths;

    @Column(name = "principal_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "maturity_amount", precision = 19, scale = 2)
    private BigDecimal maturityAmount;

    public FixedDepositAccount(String accountNumber, User user, BigDecimal principalAmount,
                               Integer termMonths, BigDecimal interestRate) {
        super(accountNumber, user);
        this.principalAmount = principalAmount;
        this.termMonths = termMonths;
        this.interestRate = interestRate;
        
        // Set initial balance to principal amount
        setBalance(principalAmount);
        
        // Calculate maturity date based on term
        this.maturityDate = LocalDate.now().plusMonths(termMonths);
        
        // Calculate maturity amount
        calculateMaturityAmount();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountType getAccountType() {
        return AccountType.FIXED_DEPOSIT;
    }

    /**
     * Withdraw from fixed deposit is not allowed before maturity.
     * Always throws an exception.
     * 
     * @param amount The amount to withdraw
     * @return Never returns
     * @throws UnsupportedOperationException Always thrown as withdrawal is not supported
     */
    @Override
    public BigDecimal withdraw(BigDecimal amount) {
        throw new UnsupportedOperationException("Withdrawals are not allowed from Fixed Deposit accounts before maturity");
    }

    /**
     * Deposit to fixed deposit is not allowed after creation.
     * Always throws an exception.
     * 
     * @param amount The amount to deposit
     * @return Never returns
     * @throws UnsupportedOperationException Always thrown as deposit is not supported
     */
    @Override
    public BigDecimal deposit(BigDecimal amount) {
        throw new UnsupportedOperationException("Deposits are not allowed to Fixed Deposit accounts after creation");
    }

    /**
     * Calculate the maturity amount based on the principal, interest rate, and term.
     */
    private void calculateMaturityAmount() {
        // Simple interest calculation: P + (P * R * T/12)
        // Where P = Principal, R = Rate, T = Term in months
        BigDecimal interest = principalAmount
                .multiply(interestRate)
                .multiply(new BigDecimal(termMonths))
                .divide(new BigDecimal("1200"), 2, RoundingMode.HALF_UP);
        
        this.maturityAmount = principalAmount.add(interest);
    }

    /**
     * Checks if the account has matured.
     * 
     * @return true if the maturity date has passed, false otherwise
     */
    public boolean isMatured() {
        return LocalDate.now().isAfter(maturityDate) || LocalDate.now().isEqual(maturityDate);
    }

    /**
     * Matures the account by setting the balance to the maturity amount.
     * Only executed when the account reaches maturity.
     * 
     * @return The maturity amount
     */
    public BigDecimal mature() {
        if (!isMatured()) {
            throw new IllegalStateException("Cannot mature account before maturity date");
        }
        
        setBalance(maturityAmount);
        return maturityAmount;
    }
}
