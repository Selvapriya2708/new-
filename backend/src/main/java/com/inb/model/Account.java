package com.inb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Base entity representing a bank account in the system.
 */
@Entity
@Table(name = "accounts")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "account_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_number", unique = true, nullable = false)
    private String accountNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus status = AccountStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Cheque> cheques = new ArrayList<>();

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Bill> bills = new ArrayList<>();

    public Account(String accountNumber, User user) {
        this.accountNumber = accountNumber;
        this.user = user;
    }

    /**
     * Gets the account type.
     * To be implemented by subclasses.
     * 
     * @return The account type
     */
    public abstract AccountType getAccountType();

    /**
     * Deposit funds into the account.
     * 
     * @param amount The amount to deposit
     * @return The new balance
     */
    public BigDecimal deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance = this.balance.add(amount);
        return this.balance;
    }

    /**
     * Withdraw funds from the account.
     * To be implemented by subclasses with specific withdrawal rules.
     * 
     * @param amount The amount to withdraw
     * @return The new balance
     */
    public abstract BigDecimal withdraw(BigDecimal amount);
}

/**
 * Enum representing the status of an account.
 */
enum AccountStatus {
    ACTIVE,
    INACTIVE,
    PENDING,
    CLOSED
}

/**
 * Enum representing the type of an account.
 */
enum AccountType {
    SAVINGS,
    CURRENT,
    FIXED_DEPOSIT
}
