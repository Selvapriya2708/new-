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
 * Entity representing a cheque in the banking system.
 */
@Entity
@Table(name = "cheques")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cheque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "cheque_number", nullable = false)
    private String chequeNumber;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "payee_name", nullable = false)
    private String payeeName;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "branch_name", nullable = false)
    private String branchName;

    @CreationTimestamp
    @Column(name = "deposit_date", nullable = false, updatable = false)
    private LocalDateTime depositDate;

    @Column(name = "clearance_date")
    private LocalDateTime clearanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChequeStatus status = ChequeStatus.NOT_RECEIVED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "slip_number", nullable = false, unique = true)
    private String slipNumber;

    @Column(name = "bounce_fee", precision = 19, scale = 2)
    private BigDecimal bounceFee;

    public Cheque(Account account, String chequeNumber, BigDecimal amount, String payeeName,
                 String bankName, String branchName) {
        this.account = account;
        this.accountNumber = account.getAccountNumber();
        this.chequeNumber = chequeNumber;
        this.amount = amount;
        this.payeeName = payeeName;
        this.bankName = bankName;
        this.branchName = branchName;
        this.slipNumber = generateSlipNumber();
    }

    /**
     * Update the status of a cheque.
     * 
     * @param newStatus The new status
     * @param remarks Optional remarks about the status change
     * @return The updated cheque
     */
    public Cheque updateStatus(ChequeStatus newStatus, String remarks) {
        this.status = newStatus;
        if (remarks != null && !remarks.trim().isEmpty()) {
            this.remarks = remarks;
        }
        
        if (newStatus == ChequeStatus.CLEARED) {
            this.clearanceDate = LocalDateTime.now();
        }
        
        return this;
    }

    /**
     * Mark a cheque as bounced and set the bounce fee.
     * 
     * @param remarks Reason for bouncing
     * @param bounceFee Fee for bounced cheque
     * @return The updated cheque
     */
    public Cheque bounce(String remarks, BigDecimal bounceFee) {
        this.status = ChequeStatus.BOUNCED;
        this.remarks = remarks;
        this.bounceFee = bounceFee;
        return this;
    }

    /**
     * Generate a unique slip number for a cheque.
     * 
     * @return A unique slip number
     */
    private String generateSlipNumber() {
        return "SLIP" + LocalDate.now().getYear() +
                String.format("%02d", LocalDate.now().getMonthValue()) +
                String.format("%02d", LocalDate.now().getDayOfMonth()) +
                String.format("%04d", (int)(Math.random() * 10000));
    }
}

/**
 * Enum representing the status of a cheque.
 */
enum ChequeStatus {
    NOT_RECEIVED,
    RECEIVED,
    SENT_FOR_CLEARANCE,
    CLEARED,
    BOUNCED
}
