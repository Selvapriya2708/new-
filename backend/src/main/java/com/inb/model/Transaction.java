package com.inb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a transaction in the banking system.
 */
@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "recipient_account_id")
    private Long recipientAccountId;

    @Column(name = "recipient_account_number")
    private String recipientAccountNumber;

    @CreationTimestamp
    @Column(name = "transaction_date", nullable = false, updatable = false)
    private LocalDateTime transactionDate;

    @Column(nullable = false)
    private String reference;

    public Transaction(Account account, BigDecimal amount, TransactionType transactionType,
                      String description, String reference) {
        this.account = account;
        this.amount = amount;
        this.transactionType = transactionType;
        this.description = description;
        this.reference = reference;
    }

    public Transaction(Account account, BigDecimal amount, TransactionType transactionType,
                      String description, String recipientAccountNumber, String reference) {
        this(account, amount, transactionType, description, reference);
        this.recipientAccountNumber = recipientAccountNumber;
    }

    /**
     * Complete the transaction by updating its status to COMPLETED.
     * 
     * @return the updated transaction
     */
    public Transaction complete() {
        this.status = TransactionStatus.COMPLETED;
        return this;
    }

    /**
     * Fail the transaction by updating its status to FAILED.
     * 
     * @return the updated transaction
     */
    public Transaction fail() {
        this.status = TransactionStatus.FAILED;
        return this;
    }

    /**
     * Schedule the transaction by updating its status to SCHEDULED.
     * 
     * @return the updated transaction
     */
    public Transaction schedule() {
        this.status = TransactionStatus.SCHEDULED;
        return this;
    }

    /**
     * Generate a unique reference for a transaction.
     * 
     * @return A unique transaction reference
     */
    public static String generateReference() {
        return "TXN" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }
}

/**
 * Enum representing the type of a transaction.
 */
enum TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    TRANSFER,
    BILL_PAYMENT,
    CHEQUE_DEPOSIT,
    INTEREST_CREDIT,
    OVERDRAFT_INTEREST,
    FEE
}

/**
 * Enum representing the status of a transaction.
 */
enum TransactionStatus {
    PENDING,
    COMPLETED,
    FAILED,
    SCHEDULED
}
