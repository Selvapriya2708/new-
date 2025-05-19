package com.inb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a bill payment in the banking system.
 */
@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false)
    private BillType billType;

    @Column(name = "bill_number", nullable = false)
    private String billNumber;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status = BillStatus.PENDING;

    @Column(nullable = false)
    private String provider;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String reference;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    public Bill(Account account, BillType billType, String billNumber, BigDecimal amount,
               String provider, String description) {
        this.account = account;
        this.billType = billType;
        this.billNumber = billNumber;
        this.amount = amount;
        this.provider = provider;
        this.description = description;
        this.reference = generateReference();
        this.dueDate = LocalDate.now().plusDays(7); // Default due date a week from now
    }

    /**
     * Schedule the bill payment for a future date.
     * 
     * @param scheduledDate The date to schedule the payment
     * @return The updated bill
     */
    public Bill schedule(LocalDateTime scheduledDate) {
        if (scheduledDate.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Scheduled date cannot be in the past");
        }
        
        this.scheduledDate = scheduledDate;
        this.status = BillStatus.SCHEDULED;
        return this;
    }

    /**
     * Mark the bill as paid.
     * 
     * @return The updated bill
     */
    public Bill pay() {
        this.status = BillStatus.PAID;
        this.paymentDate = LocalDateTime.now();
        return this;
    }

    /**
     * Cancel a scheduled bill payment.
     * 
     * @return The updated bill
     */
    public Bill cancel() {
        if (this.status != BillStatus.SCHEDULED) {
            throw new IllegalStateException("Can only cancel scheduled payments");
        }
        
        this.status = BillStatus.PENDING;
        this.scheduledDate = null;
        return this;
    }

    /**
     * Mark the bill payment as failed.
     * 
     * @return The updated bill
     */
    public Bill fail() {
        this.status = BillStatus.FAILED;
        return this;
    }

    /**
     * Generate a unique reference for a bill payment.
     * 
     * @return A unique bill reference
     */
    private String generateReference() {
        return "BILL" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }
}

/**
 * Enum representing the type of a bill.
 */
enum BillType {
    ELECTRICITY,
    TELEPHONE,
    WATER,
    INTERNET,
    MOBILE,
    GAS,
    OTHER
}

/**
 * Enum representing the status of a bill payment.
 */
enum BillStatus {
    PENDING,
    PAID,
    FAILED,
    SCHEDULED
}
