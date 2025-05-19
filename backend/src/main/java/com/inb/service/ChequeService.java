package com.inb.service;

import com.inb.dto.ChequeDto;
import com.inb.model.Cheque;
import com.inb.model.ChequeStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service interface for cheque-related operations.
 */
public interface ChequeService {

    /**
     * Deposit a cheque.
     * 
     * @param chequeDto The cheque details
     * @return The deposited cheque
     */
    Cheque depositCheque(ChequeDto chequeDto);

    /**
     * Get all cheques for an account.
     * 
     * @param accountId The ID of the account
     * @return List of cheques for the account
     */
    List<Cheque> getChequesByAccountId(Long accountId);

    /**
     * Get cheque by ID.
     * 
     * @param chequeId The ID of the cheque to retrieve
     * @return The cheque with the specified ID
     */
    Cheque getChequeById(Long chequeId);

    /**
     * Get cheques by status.
     * 
     * @param status The cheque status to search for
     * @return List of cheques with the specified status
     */
    List<Cheque> getChequesByStatus(ChequeStatus status);

    /**
     * Update cheque status.
     * 
     * @param chequeId The ID of the cheque
     * @param status The new status
     * @param remarks Optional remarks about the status change
     * @return The updated cheque
     */
    Cheque updateChequeStatus(Long chequeId, ChequeStatus status, String remarks);

    /**
     * Mark a cheque as received.
     * 
     * @param chequeId The ID of the cheque
     * @param remarks Optional remarks
     * @return The updated cheque
     */
    Cheque markChequeAsReceived(Long chequeId, String remarks);

    /**
     * Send a cheque for clearance.
     * 
     * @param chequeId The ID of the cheque
     * @param remarks Optional remarks
     * @return The updated cheque
     */
    Cheque sendChequeForClearance(Long chequeId, String remarks);

    /**
     * Mark a cheque as cleared and credit the account.
     * 
     * @param chequeId The ID of the cheque
     * @param remarks Optional remarks
     * @return The updated cheque
     */
    Cheque clearCheque(Long chequeId, String remarks);

    /**
     * Mark a cheque as bounced and apply bounce fee.
     * 
     * @param chequeId The ID of the cheque
     * @param reason The reason for bouncing
     * @param bounceFee The bounce fee to apply
     * @return The updated cheque
     */
    Cheque bounceCheque(Long chequeId, String reason, BigDecimal bounceFee);

    /**
     * Generate cheque reconciliation report.
     * 
     * @param startDate The start date for the report
     * @param endDate The end date for the report
     * @return Map containing the reconciliation report
     */
    Map<String, Object> generateReconciliationReport(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Process cheques due for clearance.
     */
    void processChequesForClearance();

    /**
     * Get all cheques for a user.
     * 
     * @param userId The ID of the user
     * @return List of cheques for the user
     */
    List<Cheque> getChequesByUserId(Long userId);

    /**
     * Get cheque by slip number.
     * 
     * @param slipNumber The slip number to search for
     * @return The cheque with the specified slip number
     */
    Cheque getChequeBySlipNumber(String slipNumber);

    /**
     * Generate a PDF slip for a cheque deposit.
     * 
     * @param chequeId The ID of the cheque
     * @return Byte array containing the PDF slip
     */
    byte[] generateChequeSlipPdf(Long chequeId);
}
