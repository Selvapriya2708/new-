package com.inb.service;

import com.inb.dto.BillPaymentDto;
import com.inb.model.Bill;
import com.inb.model.BillStatus;
import com.inb.model.BillType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service interface for bill payment-related operations.
 */
public interface BillService {

    /**
     * Pay a bill.
     * 
     * @param billPaymentDto The bill payment details
     * @return The paid bill
     */
    Bill payBill(BillPaymentDto billPaymentDto);

    /**
     * Get all bills for an account.
     * 
     * @param accountId The ID of the account
     * @return List of bills for the account
     */
    List<Bill> getBillsByAccountId(Long accountId);

    /**
     * Get bill by ID.
     * 
     * @param billId The ID of the bill to retrieve
     * @return The bill with the specified ID
     */
    Bill getBillById(Long billId);

    /**
     * Get bills by status.
     * 
     * @param status The bill status to search for
     * @return List of bills with the specified status
     */
    List<Bill> getBillsByStatus(BillStatus status);

    /**
     * Get bills by type.
     * 
     * @param billType The bill type to search for
     * @return List of bills of the specified type
     */
    List<Bill> getBillsByType(BillType billType);

    /**
     * Schedule a bill payment for future execution.
     * 
     * @param billPaymentDto The bill payment details
     * @param scheduledDate The date to execute the payment
     * @return The scheduled bill payment
     */
    Bill scheduleBillPayment(BillPaymentDto billPaymentDto, LocalDateTime scheduledDate);

    /**
     * Get all scheduled bills for a user.
     * 
     * @param userId The ID of the user
     * @return List of scheduled bills for the user
     */
    List<Bill> getScheduledBillsByUserId(Long userId);

    /**
     * Cancel a scheduled bill payment.
     * 
     * @param billId The ID of the bill
     * @return The cancelled bill payment
     */
    Bill cancelScheduledBillPayment(Long billId);

    /**
     * Process scheduled bill payments that are due.
     */
    void processScheduledBillPayments();

    /**
     * Get supported bill providers.
     * 
     * @return Map of bill types to supported providers
     */
    Map<String, List<String>> getSupportedBillProviders();

    /**
     * Get bill payment history for a user.
     * 
     * @param userId The ID of the user
     * @return List of bill payments for the user
     */
    List<Bill> getBillPaymentHistoryByUserId(Long userId);

    /**
     * Get recent bill payments for a user.
     * 
     * @param userId The ID of the user
     * @param limit The maximum number of bills to return
     * @return List of recent bill payments for the user
     */
    List<Bill> getRecentBillPaymentsByUserId(Long userId, int limit);

    /**
     * Verify a bill before payment.
     * 
     * @param billType The bill type
     * @param provider The bill provider
     * @param billNumber The bill number
     * @return Map containing the verification result
     */
    Map<String, Object> verifyBill(BillType billType, String provider, String billNumber);
}
